/**
 * Fetches public, non-fork repos for a GitHub user and writes them to
 * src/data/repos.json. Requires GITHUB_TOKEN and GITHUB_USERNAME env vars.
 *
 * Run: tsx scripts/fetch-repos.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Repo } from '../src/types/repo.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

const token = process.env.GITHUB_TOKEN
const username = process.env.GITHUB_USERNAME ?? 'MattDevy'

if (!token) {
  console.error('GITHUB_TOKEN is not set — aborting')
  process.exit(1)
}

async function fetchAllRepos(): Promise<Repo[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  }

  let page = 1
  const all: Repo[] = []

  while (true) {
    const url = `https://api.github.com/users/${username}/repos?type=owner&per_page=100&page=${page}`
    const res = await fetch(url, { headers })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`GitHub API error ${res.status}: ${body}`)
    }

    const data = (await res.json()) as Array<{
      name: string
      description: string | null
      html_url: string
      stargazers_count: number
      forks_count: number
      language: string | null
      topics: string[]
      updated_at: string
      fork: boolean
      private: boolean
    }>

    if (data.length === 0) break

    const filtered = data
      .filter((r) => !r.fork && !r.private)
      .map(({ name, description, html_url, stargazers_count, forks_count, language, topics, updated_at }) => ({
        name,
        description,
        html_url,
        stargazers_count,
        forks_count,
        language,
        topics,
        updated_at,
      }))

    all.push(...filtered)
    page++
  }

  // Sort by stars desc, then most recently updated
  all.sort((a, b) => {
    if (b.stargazers_count !== a.stargazers_count) {
      return b.stargazers_count - a.stargazers_count
    }
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  return all
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

async function npmPackageExists(name: string): Promise<boolean> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, { method: 'HEAD' })
    return res.status === 200
  } catch {
    return false
  }
}

async function fetchWeeklyDownloads(name: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(name)}`)
    if (!res.ok) return null
    const data = await res.json() as { downloads?: number }
    return data.downloads ?? null
  } catch {
    return null
  }
}

async function resolveNpmPackageName(repoName: string): Promise<string | null> {
  if (await npmPackageExists(repoName)) return repoName

  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${username}/${repoName}/HEAD/package.json`
    )
    if (res.ok) {
      const pkg = await res.json() as { name?: string }
      if (pkg.name && pkg.name !== repoName && await npmPackageExists(pkg.name)) {
        return pkg.name
      }
    }
  } catch {
    // no package.json or parse error — that's fine
  }

  return null
}

async function enrichOne(repo: Repo): Promise<Repo> {
  const packageName = await resolveNpmPackageName(repo.name)
  if (!packageName) return repo
  const downloads = await fetchWeeklyDownloads(packageName)
  return {
    ...repo,
    npm_package: packageName,
    ...(downloads !== null ? { npm_weekly_downloads: downloads } : {}),
  }
}

async function enrichWithNpm(repos: Repo[]): Promise<Repo[]> {
  const enriched: Repo[] = []
  for (const batch of chunk(repos, 5)) {
    const results = await Promise.all(batch.map(enrichOne))
    enriched.push(...results)
  }
  return enriched
}

const repos = await fetchAllRepos()
const enriched = await enrichWithNpm(repos)
const npmCount = enriched.filter(r => r.npm_package).length
const outDir = join(__dirname, '../src/data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'repos.json'), JSON.stringify(enriched, null, 2))
console.log(`Wrote ${enriched.length} repos to src/data/repos.json (${npmCount} with npm data)`)

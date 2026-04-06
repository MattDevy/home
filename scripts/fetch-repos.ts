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

const githubHeaders: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
}

async function fetchAllRepos(): Promise<Repo[]> {
  const headers = githubHeaders

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

// Returns true only if the package exists on npm AND its repository URL references
// this GitHub user — prevents matching unrelated packages with the same name.
async function npmPackageOwnedByUser(name: string): Promise<boolean> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`)
    if (res.status !== 200) return false
    const data = await res.json() as { repository?: { url?: string } }
    const repoUrl = data.repository?.url ?? ''
    return repoUrl.toLowerCase().includes(`github.com/${username.toLowerCase()}/`)
  } catch {
    return false
  }
}

async function fetchDownloads(name: string, period: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.npmjs.org/downloads/point/${period}/${encodeURIComponent(name)}`)
    if (!res.ok) return null
    const data = await res.json() as { downloads?: number }
    return data.downloads ?? null
  } catch {
    return null
  }
}

const today = new Date().toISOString().slice(0, 10)

// Excluded path segments — skip package.json files under these directories
const EXCLUDED_PATHS = ['node_modules/', 'vendor/', 'fixtures/', '__tests__/', '.git/']

async function findNpmPackagesForRepo(repoName: string): Promise<Array<{ name: string; weekly_downloads?: number }>> {
  // Fetch the full git tree to locate all package.json files
  const treeRes = await fetch(
    `https://api.github.com/repos/${username}/${repoName}/git/trees/HEAD?recursive=1`,
    { headers: githubHeaders }
  )
  if (!treeRes.ok) return []

  const tree = await treeRes.json() as {
    tree: Array<{ path: string; type: string }>
  }

  const packageJsonPaths = tree.tree
    .filter(item =>
      item.type === 'blob' &&
      (item.path === 'package.json' || item.path.endsWith('/package.json')) &&
      !EXCLUDED_PATHS.some(ex => item.path.includes(ex))
    )
    .map(item => item.path)

  const packages: Array<{ name: string; weekly_downloads?: number }> = []

  for (const pkgPath of packageJsonPaths) {
    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/${username}/${repoName}/HEAD/${pkgPath}`
      )
      if (!res.ok) continue
      const pkg = await res.json() as { name?: string; private?: boolean }
      if (!pkg.name || pkg.private) continue

      if (await npmPackageOwnedByUser(pkg.name)) {
        const [weekly, total] = await Promise.all([
          fetchDownloads(pkg.name, 'last-week'),
          fetchDownloads(pkg.name, `2005-01-01:${today}`),
        ])
        packages.push({
          name: pkg.name,
          ...(weekly !== null ? { weekly_downloads: weekly } : {}),
          ...(total !== null ? { total_downloads: total } : {}),
        })
      }
    } catch {
      // unparseable package.json — skip
    }
  }

  return packages
}

async function enrichOne(repo: Repo): Promise<Repo> {
  const packages = await findNpmPackagesForRepo(repo.name)
  if (packages.length === 0) return repo
  return { ...repo, npm_packages: packages }
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
const npmCount = enriched.filter(r => r.npm_packages?.length).length
const outDir = join(__dirname, '../src/data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'repos.json'), JSON.stringify(enriched, null, 2))
console.log(`Wrote ${enriched.length} repos to src/data/repos.json (${npmCount} with npm data)`)

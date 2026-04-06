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

const repos = await fetchAllRepos()
const outDir = join(__dirname, '../src/data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'repos.json'), JSON.stringify(repos, null, 2))
console.log(`Wrote ${repos.length} repos to src/data/repos.json`)

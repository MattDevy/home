import type { Repo } from '../types/repo.ts'
import { config } from '../config.ts'
import { RepoCard } from './RepoCard.tsx'

interface RepoGridProps {
  repos: Repo[]
}

export function RepoGrid({ repos }: RepoGridProps) {
  const { featuredRepos } = config

  const ordered =
    featuredRepos.length > 0
      ? [
          ...featuredRepos
            .map((slug) => repos.find((r) => r.name === slug))
            .filter((r): r is Repo => r !== undefined),
          ...repos.filter((r) => !featuredRepos.includes(r.name)),
        ]
      : repos

  return (
    <section className="px-6 pb-24">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-6">
          Projects
        </h2>

        {ordered.length === 0 ? (
          <p className="text-slate-500 text-sm">No repositories found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ordered.map((repo) => (
              <RepoCard key={repo.name} repo={repo} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

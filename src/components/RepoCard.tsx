import type { Repo } from '../types/repo.ts'
import { languageColor } from './Hero.tsx'
import { useTilt } from '../hooks/useTilt.ts'
import { useInView } from '../hooks/useInView.ts'

const StarIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
  </svg>
)

const ForkIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
    <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
  </svg>
)

interface RepoCardProps {
  repo: Repo
  index: number
}

export function RepoCard({ repo, index }: RepoCardProps) {
  const { name, description, html_url, stargazers_count, forks_count, language, topics } = repo
  const { ref, tiltStyle, glareStyle, onMouseMove, onMouseLeave } = useTilt()
  const { ref: inViewRef, inView } = useInView()

  // Merge the two refs
  const setRefs = (el: HTMLAnchorElement | null) => {
    (ref as React.MutableRefObject<HTMLAnchorElement | null>).current = el;
    (inViewRef as React.MutableRefObject<HTMLElement | null>).current = el
  }

  return (
    <a
      ref={setRefs}
      href={html_url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`group relative flex flex-col p-5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-sky-500/50 hover:bg-slate-800 overflow-hidden${inView ? ' animate-fade-up' : ''}`}
      style={{
        ...tiltStyle,
        ...(inView ? { animationDelay: `${index * 80}ms` } : { opacity: 0 }),
      }}
    >
      {/* Glare overlay */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
        style={glareStyle}
        aria-hidden="true"
      />

      <div className="flex-1 relative">
        <h3 className="text-white font-semibold text-sm mb-1.5 group-hover:text-sky-400 transition-colors duration-150 truncate">
          {name}
        </h3>

        {description && (
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-3">
            {description}
          </p>
        )}

        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {topics.slice(0, 4).map((topic) => (
              <span
                key={topic}
                className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-[10px] font-medium border border-sky-500/20"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mt-2 text-slate-500 text-xs relative">
        {language && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: languageColor(language) }}
              aria-hidden="true"
            />
            {language}
          </span>
        )}

        {stargazers_count > 0 && (
          <span className="flex items-center gap-1">
            <StarIcon />
            {stargazers_count.toLocaleString()}
          </span>
        )}

        {forks_count > 0 && (
          <span className="flex items-center gap-1">
            <ForkIcon />
            {forks_count.toLocaleString()}
          </span>
        )}
      </div>
    </a>
  )
}

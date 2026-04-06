import { config } from '../config.ts'

export function Footer() {
  const year = new Date().getFullYear()
  const coffeeUrl =
    'buyMeACoffee' in config.social
      ? (config.social as Record<string, string>).buyMeACoffee
      : null

  return (
    <footer className="border-t border-slate-800 py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-600 text-sm">
        <span>
          &copy; {year} {config.name}
        </span>

        <div className="flex items-center gap-4">
          <span className="text-slate-700">
            Built with React &amp; Tailwind
          </span>

          {coffeeUrl && (
            <a
              href={coffeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-amber-500 hover:text-amber-400 transition-colors duration-150 font-medium"
            >
              ☕ Buy me a coffee
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}

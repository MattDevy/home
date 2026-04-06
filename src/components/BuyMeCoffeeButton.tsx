import { config } from '../config.ts'

const coffeeUrl =
  'buyMeACoffee' in config.social
    ? (config.social as Record<string, string>).buyMeACoffee
    : null

export function BuyMeCoffeeButton() {
  if (!coffeeUrl) return null

  return (
    <a
      href={coffeeUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Buy me a coffee"
      className="fixed bottom-6 left-6 z-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-800 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-750 text-slate-300 hover:text-amber-400 text-sm font-medium shadow-lg transition-all duration-200"
    >
      <span aria-hidden="true">☕</span>
      <span>Buy me a coffee</span>
    </a>
  )
}

import { useEffect, useReducer } from 'react'

interface State {
  displayed: string
  phase: 'typing' | 'pausing' | 'deleting'
  phraseIndex: number
  charIndex: number
}

type Action = { type: 'tick' }

function reducer(state: State, _action: Action, phrases: string[]): State {
  const phrase = phrases[state.phraseIndex]

  switch (state.phase) {
    case 'typing': {
      const next = state.charIndex + 1
      if (next > phrase.length) return { ...state, phase: 'pausing' }
      return { ...state, charIndex: next, displayed: phrase.slice(0, next) }
    }
    case 'pausing':
      return { ...state, phase: 'deleting' }
    case 'deleting': {
      const next = state.charIndex - 1
      if (next < 0) {
        const nextPhrase = (state.phraseIndex + 1) % phrases.length
        return { displayed: '', phase: 'typing', phraseIndex: nextPhrase, charIndex: 0 }
      }
      return { ...state, charIndex: next, displayed: phrase.slice(0, next) }
    }
  }
}

const INTERVAL: Record<State['phase'], number> = {
  typing: 60,
  pausing: 1500,
  deleting: 35,
}

export function useTypewriter(phrases: string[]): { text: string; showCursor: boolean } {
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [state, dispatch] = useReducer(
    (s: State, a: Action) => reducer(s, a, phrases),
    {
      displayed: reducedMotion ? (phrases[phrases.length - 1] ?? '') : '',
      phase: 'typing',
      phraseIndex: 0,
      charIndex: 0,
    },
  )

  useEffect(() => {
    if (reducedMotion) return
    const id = setTimeout(() => dispatch({ type: 'tick' }), INTERVAL[state.phase])
    return () => clearTimeout(id)
  }, [state, reducedMotion])

  return { text: state.displayed, showCursor: !reducedMotion }
}

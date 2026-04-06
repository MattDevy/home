import { useRef, useState } from 'react'

const MAX_TILT = 8 // degrees

export function useTilt() {
  const ref = useRef<HTMLAnchorElement>(null)
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({})
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 })

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function onMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (reducedMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)

    const rotateY = dx * MAX_TILT
    const rotateX = -dy * MAX_TILT

    setTiltStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
      transition: 'transform 0.1s ease-out',
    })

    // Glare follows cursor — radial gradient from cursor position
    const glareX = ((e.clientX - rect.left) / rect.width) * 100
    const glareY = ((e.clientY - rect.top) / rect.height) * 100
    setGlareStyle({
      opacity: 1,
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.12), transparent 60%)`,
    })
  }

  function onMouseLeave() {
    setTiltStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'transform 0.3s ease-out',
    })
    setGlareStyle({ opacity: 0, transition: 'opacity 0.3s ease-out' })
  }

  return { ref, tiltStyle, glareStyle, onMouseMove, onMouseLeave }
}

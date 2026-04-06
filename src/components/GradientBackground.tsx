export function GradientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none" aria-hidden="true">
      {/* Violet blob — top left */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600 opacity-[0.12] blur-3xl"
        style={{ animation: 'blob-a 25s ease-in-out infinite alternate' }}
      />
      {/* Cyan blob — top right */}
      <div
        className="absolute -top-20 -right-60 w-[500px] h-[500px] rounded-full bg-cyan-500 opacity-[0.10] blur-3xl"
        style={{ animation: 'blob-b 30s ease-in-out infinite alternate', animationDelay: '-8s' }}
      />
      {/* Indigo blob — bottom centre */}
      <div
        className="absolute -bottom-60 left-1/3 w-[700px] h-[700px] rounded-full bg-indigo-600 opacity-[0.10] blur-3xl"
        style={{ animation: 'blob-c 20s ease-in-out infinite alternate', animationDelay: '-14s' }}
      />
    </div>
  )
}

import { Hero } from './components/Hero.tsx'
import { RepoGrid } from './components/RepoGrid.tsx'
import { Footer } from './components/Footer.tsx'
import { GradientBackground } from './components/GradientBackground.tsx'
import { ParticleCanvas } from './components/ParticleCanvas.tsx'
import { BuyMeCoffeeButton } from './components/BuyMeCoffeeButton.tsx'
import reposData from './data/repos.json'
import type { Repo } from './types/repo.ts'

const repos = reposData as Repo[]

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <GradientBackground />
      <ParticleCanvas />
      <div className="relative" style={{ zIndex: 10 }}>
        <Hero />
        <RepoGrid repos={repos} />
        <Footer />
      </div>
      <BuyMeCoffeeButton />
    </div>
  )
}

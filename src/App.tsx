import { Hero } from './components/Hero.tsx'
import { RepoGrid } from './components/RepoGrid.tsx'
import { Footer } from './components/Footer.tsx'
import reposData from './data/repos.json'
import type { Repo } from './types/repo.ts'

const repos = reposData as Repo[]

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Hero />
      <RepoGrid repos={repos} />
      <Footer />
    </div>
  )
}

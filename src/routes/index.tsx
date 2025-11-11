import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '../components/marketing/Hero'
import { GameModes } from '../components/marketing/GameModes'
import { Features } from '../components/marketing/Features'
import { Footer } from '../components/marketing/Footer'

export const Route = createFileRoute('/')({
  component: HomePage
})

function HomePage() {
  return (
    <>
      <Hero />
      <GameModes />
      <Features />
      <Footer />
    </>
  )
}

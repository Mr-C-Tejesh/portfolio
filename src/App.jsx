import React, { useRef } from 'react'
import Hero from './components/Hero'
import IntroSection from './components/IntroSection'
import PortraitTransition from './components/PortraitTransition'

function App() {
  const introPortraitRef = useRef(null)

  return (
    <main>
      <Hero />
      <IntroSection ref={introPortraitRef} />
      <PortraitTransition targetRef={introPortraitRef} />
    </main>
  )
}

export default App

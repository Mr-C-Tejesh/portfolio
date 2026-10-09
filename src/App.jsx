import React, { useRef } from 'react'
import Hero from './components/Hero'
import IntroSection from './components/IntroSection'
import PortraitTransition from './components/PortraitTransition'
import NavigationPill from './components/NavigationPill'

function App() {
  const introPortraitRef = useRef(null)

  return (
    <main id="top">
      <NavigationPill />
      <Hero />
      <div id="about">
        <IntroSection ref={introPortraitRef} />
      </div>
      <PortraitTransition targetRef={introPortraitRef} />
    </main>
  )
}

export default App

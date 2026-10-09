import React, { useRef, useState, useEffect } from 'react'
import Hero from './components/Hero'
import IntroSection from './components/IntroSection'
import PortraitTransition from './components/PortraitTransition'
import NavigationPill from './components/NavigationPill'

function App() {
  const introPortraitRef = useRef(null)
  const heroRef = useRef(null)
  const [isNavVisible, setIsNavVisible] = useState(false)

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsNavVisible(!entry.isIntersecting);
    }, {
      root: null,
      threshold: 0,
      rootMargin: '0px'
    });

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <main id="top">
      <NavigationPill isVisible={isNavVisible} />
      <Hero ref={heroRef} />
      <div id="about">
        <IntroSection ref={introPortraitRef} />
      </div>
      <PortraitTransition targetRef={introPortraitRef} />
    </main>
  )
}

export default App

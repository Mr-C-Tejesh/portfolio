import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import IntroSection from '../components/IntroSection';
import PortraitTransition from '../components/PortraitTransition';
import ProjectCard from '../components/ProjectCard';
import { getFeaturedProjects } from '../data/projects';

export default function Home({ onHeroVisible, onThemeChange }) {
  const heroRef = useRef(null);
  const introPortraitRef = useRef(null);
  const featuredProjects = getFeaturedProjects();

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(([entry]) => {
      onHeroVisible(entry.intersectionRatio > 0.10);
    }, {
      root: null,
      threshold: [0.10],
      rootMargin: '0px'
    });

    observer.observe(hero);
    return () => observer.disconnect();
  }, [onHeroVisible]);

  useEffect(() => {
    if (!onThemeChange) return;
    const handleScroll = () => {
      const aboutEl = document.getElementById('about');
      if (aboutEl) {
        const rect = aboutEl.getBoundingClientRect();
        // Trigger light theme when the about section is under the top navbar (approx 50-100px from top)
        if (rect.top <= 100 && rect.bottom >= 60) {
          onThemeChange('light');
        } else {
          onThemeChange('dark');
        }
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onThemeChange]);

  return (
    <>
      <Hero ref={heroRef} />
      <div id="about">
        <IntroSection ref={introPortraitRef} />
      </div>
      <PortraitTransition targetRef={introPortraitRef} />
      
      <section id="work" className="section selected-work-section">
        <div className="container">
          <header className="section-header">
            <h2 className="font-display section-title">Selected Work</h2>
            <div className="section-divider"></div>
          </header>
          
          <div className="projects-list">
            {featuredProjects.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </div>
          
          <div className="section-footer">
            <Link to="/work" className="btn-view-all font-mono">
              View all work <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

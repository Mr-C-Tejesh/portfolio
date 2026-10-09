import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import IntroSection from '../components/IntroSection';
import PortraitTransition from '../components/PortraitTransition';
import ProjectCard from '../components/ProjectCard';
import { getFeaturedProjects } from '../data/projects';

export default function Home({ onHeroVisible, onThemeChange }) {
  const heroRef = useRef(null);
  const introPortraitRef = useRef(null);
  const featuredProjects = getFeaturedProjects();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo === 'about') {
      // Clear the state so it doesn't re-scroll if user refreshes
      window.history.replaceState({}, document.title);
      // Wait for paint
      setTimeout(() => {
        const el = document.getElementById('about');
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.state]);

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

      <section className="section recruiter-index-section">
        <div className="container">
          <header className="section-header">
            <h2 className="font-display section-title">RECRUITER INDEX</h2>
            <div className="section-divider"></div>
            <p className="font-mono section-subtitle" style={{marginTop: 'var(--space-2)'}}>START HERE.</p>
          </header>

          <div className="recruiter-grid">
            <div className="recruiter-card">
              <h3 className="font-mono recruiter-card-title">A. Resume</h3>
              <p className="recruiter-card-desc">Education, technical skills, experience and selected projects in one place.</p>
              <div className="recruiter-card-actions">
                <a href="/resume/C_Tejesh_Resume.pdf" className="btn-primary font-mono" download>DOWNLOAD PDF</a>
                <Link to="/resume" className="btn-secondary font-mono">VIEW FULL RESUME</Link>
              </div>
            </div>

            <div className="recruiter-card">
              <h3 className="font-mono recruiter-card-title">B. Bio-data snapshot</h3>
              <div className="recruiter-card-desc">
                <ul className="recruiter-list">
                  <li><strong>Education:</strong> B.E. Computer Science and Engineering</li>
                  <li><strong>Institute:</strong> RV Institute of Technology and Management, Bengaluru</li>
                  <li><strong>University:</strong> VTU</li>
                  <li><strong>Focus:</strong> AI systems, machine learning and software engineering</li>
                </ul>
              </div>
              <div className="recruiter-card-actions">
                <Link to="/bio-data" className="btn-secondary font-mono">VIEW FULL BIO-DATA</Link>
              </div>
            </div>

            <div className="recruiter-card">
              <h3 className="font-mono recruiter-card-title">C. Ask Tejesh</h3>
              <p className="recruiter-card-desc">An AI assistant that answers questions about Tejesh's documented public profile, projects and technical interests.</p>
              <div className="recruiter-card-actions">
                <Link to="/ask-tejesh" className="btn-primary font-mono">ASK A QUESTION</Link>
              </div>
            </div>

            <div className="recruiter-card">
              <h3 className="font-mono recruiter-card-title">D. Contact</h3>
              <p className="recruiter-card-desc">Direct lines of communication.</p>
              <div className="recruiter-card-links">
                <a href="mailto:tejeshc17@gmail.com" className="recruiter-link font-mono">Email: tejeshc17@gmail.com</a>
                <a href="https://www.linkedin.com/in/tejesh-c/" target="_blank" rel="noopener noreferrer" className="recruiter-link font-mono">LinkedIn: linkedin.com/in/tejesh-c/</a>
                <a href="https://github.com/Mr-C-Tejesh" target="_blank" rel="noopener noreferrer" className="recruiter-link font-mono">GitHub: github.com/Mr-C-Tejesh</a>
              </div>
              <div className="recruiter-card-actions" style={{marginTop: 'var(--space-4)'}}>
                <Link to="/contact" className="btn-secondary font-mono">OPEN CONTACT PAGE</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <section className="section contact-strip-section">
        <div className="container contact-strip-container">
          <div className="contact-strip-content">
            <h2 className="font-display contact-strip-title">HAVE A PROJECT OR OPPORTUNITY?</h2>
            <p className="font-mono contact-strip-subtitle">LET'S TALK.</p>
          </div>
          <div className="contact-strip-actions">
            <a href="mailto:tejeshc17@gmail.com" className="btn-secondary font-mono">EMAIL</a>
            <a href="https://www.linkedin.com/in/tejesh-c/" target="_blank" rel="noopener noreferrer" className="btn-secondary font-mono">LINKEDIN</a>
            <a href="https://github.com/Mr-C-Tejesh" target="_blank" rel="noopener noreferrer" className="btn-secondary font-mono">GITHUB</a>
            <Link to="/contact" className="btn-primary font-mono">CONTACT</Link>
          </div>
        </div>
      </section>
    </>
  );
}

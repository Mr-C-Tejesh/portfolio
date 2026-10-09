import React, { useEffect } from 'react';
import ProjectCard from '../components/ProjectCard';
import { projects } from '../data/projects';

export default function Work() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main id="top" className="page-work theme-light" style={{ backgroundColor: 'var(--color-canvas-primary)', color: 'var(--color-text-primary)', minHeight: '100vh', paddingBottom: 'var(--space-16)' }}>
      <section className="section work-header-section">
        <div className="container">
          <header className="page-header">
            <h1 className="font-display page-title">All Work</h1>
            <p className="page-description">A collection of engineering projects, decision-support systems, and explorations.</p>
            <div className="section-divider"></div>
          </header>
          
          <div className="projects-list">
            {projects.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

import React, { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { getProjectBySlug } from '../data/projects';

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!project) {
    return (
      <main className="page-not-found">
        <div className="container">
          <h1 className="font-display">Project Not Found</h1>
          <p>The requested project could not be located.</p>
          <Link to="/work" className="btn-view-all font-mono" style={{ marginTop: '2rem', display: 'inline-block' }}>
            &larr; Back to all work
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="top" className="page-project-detail">
      <article className="project-detail-article">
        <header className="project-header section">
          <div className="container">
            <Link to="/work" className="back-link font-mono">
              &larr; Back to Work
            </Link>
            <div className="project-meta font-mono">
              <span className="project-category">{project.category}</span>
            </div>
            <h1 className="font-display project-detail-title">{project.title}</h1>
            <p className="project-detail-overview">{project.overview}</p>
            
            <div className="project-tech-stack">
              <h2 className="font-mono text-small meta-label">Technologies</h2>
              <ul className="project-tech-list">
                {project.technologies.map((tech, i) => (
                  <li key={i} className="tech-badge font-mono">{tech}</li>
                ))}
              </ul>
            </div>
            
            {(project.repositoryUrl || project.demoUrl) && (
              <div className="project-links">
                {project.repositoryUrl && (
                  <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="btn-external font-mono">
                    GitHub Repository <span aria-hidden="true">&nearr;</span>
                  </a>
                )}
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-external font-mono">
                    Live Demo <span aria-hidden="true">&nearr;</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="project-body section">
          <div className="container project-content-grid">
            
            {project.limitations && (
              <div className="project-limitation-alert">
                <span className="alert-icon">!</span>
                <p>{project.limitations}</p>
              </div>
            )}

            {project.problem && (
              <section className="project-section">
                <h2 className="section-heading">Problem</h2>
                <div className="section-divider-thin"></div>
                <p>{project.problem}</p>
              </section>
            )}

            {project.approach && (
              <section className="project-section">
                <h2 className="section-heading">Approach</h2>
                <div className="section-divider-thin"></div>
                <p>{project.approach}</p>
              </section>
            )}

            {project.architecture && (
              <section className="project-section">
                <h2 className="section-heading">Architecture / Workflow</h2>
                <div className="section-divider-thin"></div>
                <p className="architecture-text">{project.architecture}</p>
              </section>
            )}

            {project.myRole && (
              <section className="project-section">
                <h2 className="section-heading">My Role</h2>
                <div className="section-divider-thin"></div>
                <p>{project.myRole}</p>
              </section>
            )}

            {project.keyFeatures && (
              <section className="project-section">
                <h2 className="section-heading">Key Features</h2>
                <div className="section-divider-thin"></div>
                <p>{project.keyFeatures}</p>
              </section>
            )}

            {project.challenges && (
              <section className="project-section">
                <h2 className="section-heading">Challenges</h2>
                <div className="section-divider-thin"></div>
                <p>{project.challenges}</p>
              </section>
            )}

            {project.learnings && (
              <section className="project-section">
                <h2 className="section-heading">Learnings</h2>
                <div className="section-divider-thin"></div>
                <p>{project.learnings}</p>
              </section>
            )}

          </div>
        </div>
        
        <footer className="project-footer section">
          <div className="container">
            <div className="section-divider"></div>
            <div className="footer-nav">
              <Link to="/work" className="btn-view-all font-mono">
                Explore more work <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </footer>
      </article>
    </main>
  );
}

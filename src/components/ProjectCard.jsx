import React from 'react';
import { Link } from 'react-router-dom';

export default function ProjectCard({ project, index }) {
  const formattedIndex = (index + 1).toString().padStart(2, '0');

  return (
    <article className="project-card">
      <div className="project-card-header">
        <span className="project-index font-mono">{formattedIndex}</span>
        <span className="project-category font-mono">{project.category}</span>
      </div>
      
      <div className="project-card-content">
        <h3 className="project-title">
          <Link to={`/work/${project.slug}`} className="project-link">
            {project.title}
          </Link>
        </h3>
        <p className="project-description">{project.shortDescription}</p>
        <ul className="project-tech-list">
          {project.technologies.slice(0, 4).map((tech, i) => (
            <li key={i} className="tech-badge font-mono">{tech}</li>
          ))}
          {project.technologies.length > 4 && (
            <li className="tech-badge font-mono">+{project.technologies.length - 4}</li>
          )}
        </ul>
      </div>

      <div className="project-card-action">
        <div className="project-external-links">
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-text-link font-mono">
              Live Demo <span aria-hidden="true">&nearr;</span>
            </a>
          )}
          {project.repositoryUrl && (
            <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="btn-text-link font-mono">
              GitHub <span aria-hidden="true">&nearr;</span>
            </a>
          )}
        </div>
        <Link to={`/work/${project.slug}`} className="btn-explore" aria-label={`Explore ${project.title}`}>
          Explore Project
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </article>
  );
}

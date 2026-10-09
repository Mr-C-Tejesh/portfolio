import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';

export default function Resume() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <main id="top" className="page-resume">
      <div className="container resume-container">
        
        <header className="resume-header">
          <h1 className="font-display resume-title">RESUME</h1>
          <button className="btn-print font-mono no-print" onClick={handlePrint}>
            PRINT / SAVE AS PDF
          </button>
        </header>
        
        <div className="section-divider"></div>

        <section className="resume-section">
          <h2 className="resume-section-title font-mono">Profile Summary</h2>
          <div className="resume-section-content">
            <p className="resume-text">
              Computer science student focused on building practical AI applications, intelligent agents, and the software systems around them.
            </p>
          </div>
        </section>

        <section className="resume-section">
          <h2 className="resume-section-title font-mono">Education</h2>
          <div className="resume-section-content">
            <div className="resume-item">
              <h3 className="resume-item-title">RV Institute of Technology & Management, Bengaluru</h3>
              <p className="resume-item-subtitle font-mono">Computer Science and Engineering — currently pursuing</p>
            </div>
          </div>
        </section>

        <section className="resume-section">
          <h2 className="resume-section-title font-mono">Technical Skills</h2>
          <div className="resume-section-content">
            <ul className="resume-skills-list">
              <li>
                <strong>Programming:</strong> Python, Java, C, SQL.
              </li>
              <li>
                <strong>Machine Learning and NLP:</strong> NumPy, Pandas, scikit-learn, spaCy, TF-IDF, cosine similarity, embeddings, PyTorch, Grad-CAM.
              </li>
              <li>
                <strong>AI systems:</strong> LangGraph, CrewAI, semantic retrieval, LLM orchestration.
              </li>
              <li>
                <strong>Application engineering:</strong> FastAPI, REST APIs, React, Streamlit, SQLite, SQLAlchemy.
              </li>
            </ul>
          </div>
        </section>

        <section className="resume-section">
          <h2 className="resume-section-title font-mono">Selected Projects</h2>
          <div className="resume-section-content">
            {projects.map((project, i) => (
              <div key={i} className="resume-project-item">
                <header className="resume-project-header">
                  <h3 className="resume-item-title">
                    <Link to={`/work/${project.slug}`} className="resume-project-link">
                      {project.title}
                    </Link>
                  </h3>
                  <div className="resume-tech-stack font-mono">
                    {project.technologies.join(' / ')}
                  </div>
                </header>
                <div className="resume-project-body">
                  <p className="resume-text">{
                    project.slug === 'campus-maintenance-agent' ? 'An evidence-grounded decision-support agent for diagnosing campus complaints based on historical data.' :
                    project.slug === 'talentstream-ai' ? 'A specialized platform designed to streamline the hiring process through an orchestrated team of AI agents for multi-agent hiring and interviewing.' :
                    project.slug === 'pharmacy-crm' ? 'A complete full-stack customer relationship management system tailored for pharmacy operations, tracking inventory and records.' :
                    project.slug === 'ai-resume-analyzer' ? 'An application that analyzes resumes against job descriptions using parsing and job-description matching via NLP similarity techniques.' :
                    project.slug === 'skin-lesion-cnn' ? 'An educational image-classification project for identifying skin lesions. (Note: educational project, not a clinically validated diagnostic tool).' :
                    project.shortDescription
                  }</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}

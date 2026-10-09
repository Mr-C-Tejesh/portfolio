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

  // The actual resume only features 4 specific projects in a specific order.
  const resumeProjectSlugs = [
    'talentstream-ai',
    'campus-maintenance-agent',
    'skin-lesion-cnn',
    'ai-resume-analyzer'
  ];
  const resumeProjects = resumeProjectSlugs.map(slug => projects.find(p => p.slug === slug)).filter(Boolean);

  return (
    <main id="top" className="page-resume">
      <div className="container resume-container">
        
        <header className="resume-header">
          <h1 className="font-display resume-title">RESUME</h1>
          <div className="resume-actions no-print" style={{ display: 'flex', gap: '16px' }}>
            <a
              href="/resume/C_Tejesh_Resume.pdf"
              download="C_Tejesh_Resume.pdf"
              className="btn-print font-mono"
            >
              DOWNLOAD RESUME ↓
            </a>
            <button className="btn-print font-mono" onClick={handlePrint}>
              PRINT
            </button>
          </div>
        </header>
        
        <div className="section-divider"></div>

        <section className="resume-section">
          <h2 className="resume-section-title font-mono">Education</h2>
          <div className="resume-section-content">
            <div className="resume-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div>
                <h3 className="resume-item-title">RV Institute of Technology and Management (RVITM), Bengaluru</h3>
                <p className="resume-item-subtitle font-mono">B.E. Computer Science and Engineering | VTU</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="resume-item-subtitle font-mono" style={{ color: 'var(--color-text-primary)' }}>Expected: May 2028</p>
                <p className="resume-item-subtitle font-mono">CGPA: 8.25 / 10.0</p>
              </div>
            </div>
          </div>
        </section>

        <section className="resume-section">
          <h2 className="resume-section-title font-mono">Technical Skills</h2>
          <div className="resume-section-content">
            <ul className="resume-skills-list">
              <li>
                <strong>Languages:</strong> Python, Java
              </li>
              <li>
                <strong>AI / ML:</strong> scikit-learn, PyTorch, NumPy, Pandas, Classification, Regression, ANN, CNN, RNN, DNN
              </li>
              <li>
                <strong>GenAI / NLP:</strong> LangChain, LangGraph, CrewAI, RAG, Large Language Models, Gemini Embeddings, spaCy, NLTK
              </li>
              <li>
                <strong>Backend / Web:</strong> FastAPI, REST APIs, SQLAlchemy, Pydantic, React, Streamlit, Gradio
              </li>
              <li>
                <strong>Databases:</strong> SQL, MySQL, SQLite, ChromaDB
              </li>
              <li>
                <strong>Deployment / Tools:</strong> Render, Vercel, Hugging Face Spaces, Git, GitHub, VS Code, Jupyter
              </li>
            </ul>
          </div>
        </section>

        <section className="resume-section">
          <h2 className="resume-section-title font-mono">Experience</h2>
          <div className="resume-section-content">
            <div className="resume-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '8px' }}>
                <h3 className="resume-item-title" style={{ fontSize: '1.1rem' }}>
                  AI Automation & Intelligent Solutions Intern <span style={{ fontWeight: 'normal', color: 'var(--color-text-secondary)' }}>· BharatCares · Remote</span>
                </h3>
                <span className="resume-item-subtitle font-mono">Jun 2026 – Jul 2026</span>
              </div>
              <ul style={{ paddingLeft: '20px', margin: 0, fontSize: 'var(--text-size-body)', lineHeight: 1.6 }}>
                <li style={{ marginBottom: '8px' }}>6-week internship conducted in association with IBM SkillsBuild and AICTE, focused on Generative AI, AI Agents, RAG, LLMs, and intelligent automation workflows.</li>
                <li>Completed structured IBM SkillsBuild learning paths covering AI Agents, Multiagent Systems, Retrieval-Augmented Generation, and Large Language Models.</li>
              </ul>
            </div>

            <div className="resume-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '8px' }}>
                <h3 className="resume-item-title" style={{ fontSize: '1.1rem' }}>
                  Applied AI Resident <span style={{ fontWeight: 'normal', color: 'var(--color-text-secondary)' }}>· Capabl India · Remote</span>
                </h3>
                <span className="resume-item-subtitle font-mono">Apr 2026 – Jun 2026</span>
              </div>
              <ul style={{ paddingLeft: '20px', margin: 0, fontSize: 'var(--text-size-body)', lineHeight: 1.6 }}>
                <li style={{ marginBottom: '8px' }}>2-month project-based Applied AI residency with weekly technical submissions, structured course work, and a capstone project build.</li>
                <li>Built TalentStream AI — a multi-agent hiring system using CrewAI, LangGraph, FastAPI, and Streamlit — as the internship capstone, with deployed services.</li>
              </ul>
            </div>

          </div>
        </section>

        <section className="resume-section">
          <h2 className="resume-section-title font-mono">Projects</h2>
          <div className="resume-section-content">
            {resumeProjects.map((project, i) => (
              <div key={i} className="resume-project-item">
                <header className="resume-project-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="resume-item-title">
                      <Link to={`/work/${project.slug}`} className="resume-project-link">
                        {project.title}
                      </Link>
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', fontSize: 'var(--text-size-xs)' }}>
                      {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-text-link font-mono">Live ↗</a>}
                      {project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="btn-text-link font-mono">GitHub ↗</a>}
                    </div>
                  </div>
                  <div className="resume-tech-stack font-mono" style={{ marginTop: '4px', marginBottom: '8px' }}>
                    {project.slug === 'talentstream-ai' ? 'CrewAI · LangGraph · FastAPI · Streamlit · Groq' :
                     project.slug === 'campus-maintenance-agent' ? 'LangGraph · Gemini · FastAPI · React' :
                     project.slug === 'skin-lesion-cnn' ? 'PyTorch · EfficientNet-B0 · Grad-CAM · Streamlit · SQLite' :
                     project.slug === 'ai-resume-analyzer' ? 'Python · spaCy · scikit-learn · Streamlit' :
                     project.technologies.join(' · ')}
                  </div>
                </header>
                <div className="resume-project-body">
                  <ul style={{ paddingLeft: '20px', margin: 0, fontSize: 'var(--text-size-body)', lineHeight: 1.6 }}>
                    {project.slug === 'talentstream-ai' ? (
                      <>
                        <li style={{ marginBottom: '8px' }}>Multi-agent recruitment system that simulates a digital hiring committee: specialized agents handle JD analysis, technical screening, interview planning, and final hiring decisions.</li>
                        <li>Orchestrated agent roles with CrewAI and a LangGraph committee workflow; FastAPI backend with Streamlit frontend deployed as live services.</li>
                      </>
                    ) : project.slug === 'campus-maintenance-agent' ? (
                      <>
                        <li style={{ marginBottom: '8px' }}>Evidence-grounded decision-support system that retrieves similar historical maintenance cases via Gemini embeddings and cosine-similarity before generating diagnosis and repair recommendations.</li>
                        <li>Incorporates grounding validation, deterministic cost/time/urgency logic, and technician feedback; deployed as a React + FastAPI product on Vercel.</li>
                      </>
                    ) : project.slug === 'skin-lesion-cnn' ? (
                      <>
                        <li style={{ marginBottom: '8px' }}>7-class dermoscopic image classifier using EfficientNet-B0 transfer learning with Grad-CAM visual explanations for model interpretability.</li>
                        <li>Generates PDF diagnostic reports and tracks patient history; deployed on Hugging Face Spaces.</li>
                      </>
                    ) : project.slug === 'ai-resume-analyzer' ? (
                      <>
                        <li style={{ marginBottom: '8px' }}>Deployed NLP application that parses resumes in PDF and DOCX formats, extracts skills and entities using spaCy, and scores resume-JD compatibility via weighted TF-IDF + cosine-similarity.</li>
                        <li>Returns a ranked match score and actionable list of missing skills; live on Streamlit Community Cloud.</li>
                      </>
                    ) : (
                      <li>{project.shortDescription}</li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="resume-section">
          <h2 className="resume-section-title font-mono">Achievements & Certifications</h2>
          <div className="resume-section-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--text-size-body)' }}>Oracle Cloud Infrastructure 2025 Certified Data Science Professional — Oracle</span>
                <span className="resume-item-subtitle font-mono">Oct 2025</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--text-size-body)' }}>AI Automation & Intelligent Solutions Internship — BharatCares × AICTE × IBM SkillsBuild</span>
                <span className="resume-item-subtitle font-mono">Jun 2026</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--text-size-body)' }}>Project-Based Applied AI Residency Internship — Capabl</span>
                <span className="resume-item-subtitle font-mono">Jun 2026</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

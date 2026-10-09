import React, { useEffect } from 'react';

export default function BioData() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main id="top" className="page-resume theme-light" style={{ backgroundColor: 'var(--color-canvas-primary)', color: 'var(--color-text-primary)', minHeight: '100vh' }}>
      <div className="container resume-container">
        
        <header className="resume-header">
          <h1 className="font-display resume-title">BIO-DATA</h1>
        </header>
        
        <div className="section-divider"></div>

        {/* 01 - Personal Profile */}
        <section className="resume-section">
          <h2 className="resume-section-title font-mono">01 / PERSONAL PROFILE</h2>
          <div className="resume-section-content">
            <p className="resume-text resume-item">
              I am Tejesh C, a Computer Science and Engineering student at RV Institute of Technology and Management, Bengaluru. I am curious about technology, enjoy solving problems, and like turning ideas into practical projects.
            </p>
            <p className="resume-text resume-item">
              I value continuous learning, consistency, self-improvement, and taking responsibility for my work. I believe that meaningful progress comes from understanding things deeply, learning through experience, and consistently putting knowledge into practice.
            </p>
            <p className="resume-text resume-item">
              Beyond academics and technology, I enjoy staying active, exploring creative interests, and developing new skills.
            </p>
          </div>
        </section>

        <div className="section-divider"></div>

        {/* 02 - Academic Journey */}
        <section className="resume-section">
          <h2 className="resume-section-title font-mono">02 / ACADEMIC JOURNEY</h2>
          <div className="resume-section-content">
            <p className="resume-text resume-item">
              I am pursuing my degree in Computer Science and Engineering at RV Institute of Technology and Management under Visvesvaraya Technological University (VTU).
            </p>
            <p className="resume-text resume-item" style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>
              One of my proudest academic achievements was being the school topper in Class 12. That milestone remains an important part of my academic journey and motivates me to keep improving.
            </p>
            <p className="resume-text resume-item">
              My interests include artificial intelligence, machine learning, software development, and understanding how computer science concepts translate into real-world applications.
            </p>
            <p className="resume-text resume-item">
              I also enjoy learning beyond the classroom through independent study, technical projects, and hands-on experimentation.
            </p>
          </div>
        </section>

        <div className="section-divider"></div>

        {/* 03 - Habits and Lifestyle */}
        <section className="resume-section">
          <h2 className="resume-section-title font-mono">03 / HABITS AND LIFESTYLE</h2>
          <div className="resume-section-content">
            <p className="resume-text resume-item">
              I enjoy maintaining a balance between technical learning, physical fitness, and creative activities.
            </p>
            <ul className="resume-text resume-item" style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: 'var(--space-6) 0' }}>
              <li><strong>Gym and fitness:</strong> Building strength, maintaining discipline, and improving consistently.</li>
              <li><strong>Running:</strong> Challenging myself physically and enjoying the process of getting better.</li>
              <li><strong>Video editing:</strong> Exploring visual storytelling, timing, transitions, and creative presentation.</li>
              <li><strong>Dancing:</strong> Expressing creativity, enjoying music, and learning through movement.</li>
              <li><strong>Technology and building projects:</strong> Exploring new ideas, experimenting with tools, and creating useful applications.</li>
            </ul>
            <p className="resume-text resume-item">
              I enjoy activities that let me improve, express myself, and develop skills in different areas of life.
            </p>
          </div>
        </section>

        <div className="section-divider"></div>

        {/* 04 - Goals and Ambitions */}
        <section className="resume-section">
          <h2 className="resume-section-title font-mono">04 / GOALS AND AMBITIONS</h2>
          <div className="resume-section-content">
            <p className="resume-text resume-item">
              I aspire to grow into a capable software engineer who understands technology deeply and builds solutions that are useful in the real world.
            </p>
            <p className="resume-text resume-item">
              I am particularly interested in artificial intelligence, machine learning, intelligent applications, and the engineering systems that make these technologies practical and reliable.
            </p>
            <p className="resume-text resume-item">
              Beyond technical knowledge, I want to develop strong problem-solving abilities, communicate ideas clearly, remain adaptable, and approach challenges with patience and determination.
            </p>
            <p className="resume-text resume-item" style={{ marginTop: 'var(--space-8)', fontSize: '1.1rem' }}>
              My broader philosophy is simple: <br />
              <strong style={{ fontWeight: '500', display: 'inline-block', marginTop: 'var(--space-2)' }}>keep learning, keep building, and let consistent work speak for itself.</strong>
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}

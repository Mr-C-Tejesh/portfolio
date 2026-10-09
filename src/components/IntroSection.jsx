import React, { forwardRef } from 'react';

const IntroSection = forwardRef((props, ref) => {
  return (
    <section className="intro-section theme-light" style={{ backgroundColor: 'var(--color-canvas-primary)', color: 'var(--color-text-primary)' }}>
      <div className="container intro-container">
        <div className="intro-content">
          <div className="font-mono intro-label">
            01 / INTRODUCTION
          </div>
          <h2 className="intro-headline">
            ENGINEERING INTELLIGENCE INTO SOFTWARE.
          </h2>
          <p className="intro-description">
            I'm Tejesh, a Computer Science student focused on building practical AI applications, intelligent agents, and the software systems around them.
          </p>
        </div>
        <div className="intro-portrait-placeholder" ref={ref}>
          {/* Portrait transitions into this area via absolute positioning */}
        </div>
      </div>
    </section>
  );
});

export default IntroSection;

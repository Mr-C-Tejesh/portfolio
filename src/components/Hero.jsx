import React, { forwardRef } from 'react';
import DotMatrixText from './DotMatrixText';

const Hero = forwardRef((props, ref) => {
  return (
    <section className="hero-section" ref={ref}>
      <div className="container hero-container">
        <div className="hero-title-block">
          <DotMatrixText text="TEJESH C" />
          <p className="hero-description">
            I build practical AI systems and the software behind them.
          </p>
          <div className="hero-actions">
            <a href="#work" className="btn-primary font-mono">
              VIEW SELECTED WORK
            </a>
            <a href="/resume/C_Tejesh_Resume.pdf" className="btn-secondary font-mono" download>
              DOWNLOAD RESUME
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

export default Hero;

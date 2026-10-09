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
        </div>
      </div>
    </section>
  );
});

export default Hero;

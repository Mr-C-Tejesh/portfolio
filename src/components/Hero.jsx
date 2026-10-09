import React from 'react';
import DotMatrixText from './DotMatrixText';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="container hero-container">
        <DotMatrixText text="TEJESH C" />
        <p className="hero-description">
          I build practical AI systems and the software behind them.
        </p>
      </div>
    </section>
  );
}

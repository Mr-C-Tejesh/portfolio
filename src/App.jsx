import React from 'react'

function App() {
  return (
    <div>
      {/* Dark Theme Section */}
      <section className="section">
        <div className="container">
          <div className="font-mono" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            [ DESIGN_SPECIMEN ] // 01. DARK SURFACE
          </div>

          <h1 className="font-display">
            Tejesh C.
          </h1>

          <h2>Foundation established.</h2>

          <p>
            This temporary design specimen verifies the typography and token system.
            The oversized display text above uses the display font role, which will
            be replaced by the interactive dotted renderer in Phase 3.
          </p>

          <p style={{ fontSize: 'var(--text-size-small)' }}>
            Supporting description: 14px regular weight. Maximum line length applies to preserve readability.
          </p>
        </div>
      </section>

      {/* Light Theme Section */}
      <section className="section theme-light" style={{ backgroundColor: 'var(--color-canvas-primary)', color: 'var(--color-text-primary)' }}>
        <div className="container">
          <div className="font-mono" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            [ DESIGN_SPECIMEN ] // 02. LIGHT SURFACE
          </div>

          <h2>Editorial Contrast</h2>

          <p>
            The website alternates between dark and light sections. This section applies the
            <code>.theme-light</code> utility class to swap css variables for the canvas, text, and borders.
          </p>

          <div style={{
            borderTop: 'var(--border-thickness) solid var(--color-border-primary)',
            paddingTop: 'var(--space-4)',
            marginTop: 'var(--space-8)'
          }}>
            <p className="font-mono">Metrics & Checks / Passed</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App

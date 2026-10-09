import React, { useEffect } from 'react';

export default function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main
      id="top"
      className="page-resume theme-light"
      style={{
        backgroundColor: 'var(--color-canvas-primary)',
        color: 'var(--color-text-primary)',
        minHeight: '100vh',
      }}
    >
      <div className="container resume-container">

        <header className="resume-header">
          <div>
            <h1 className="font-display resume-title">CONTACT</h1>
            <p
              className="font-display contact-subheadline"
              aria-hidden="false"
            >
              LET&rsquo;S TALK.
            </p>
          </div>
        </header>

        <div className="section-divider"></div>

        <p className="resume-text contact-intro">
          For internship opportunities, project collaborations, or technical
          conversations, feel free to reach out.
        </p>

        {/* ── 01 / EMAIL ── */}
        <div className="contact-row">
          <div className="contact-row-inner">
            <span className="font-mono contact-label">01 / EMAIL</span>
            <div className="contact-row-body">
              <span className="contact-value">tejeshc17@gmail.com</span>
              <a
                href="mailto:tejeshc17@gmail.com?subject=Hello%2C%20Tejesh"
                className="contact-action font-mono"
                aria-label="Send an email to Tejesh"
              >
                SEND AN EMAIL ↗
              </a>
            </div>
          </div>
        </div>

        <div className="section-divider-thin"></div>

        {/* ── 02 / LINKEDIN ── */}
        <div className="contact-row">
          <div className="contact-row-inner">
            <span className="font-mono contact-label">02 / LINKEDIN</span>
            <div className="contact-row-body">
              <span className="contact-value">Professional profile</span>
              <a
                href="https://www.linkedin.com/in/tejesh-c/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-action font-mono"
                aria-label="Connect with Tejesh on LinkedIn (opens in a new tab)"
              >
                CONNECT ↗
              </a>
            </div>
          </div>
        </div>

        <div className="section-divider-thin"></div>

        {/* ── 03 / GITHUB ── */}
        <div className="contact-row">
          <div className="contact-row-inner">
            <span className="font-mono contact-label">03 / GITHUB</span>
            <div className="contact-row-body">
              <span className="contact-value">Projects and code</span>
              <a
                href="https://github.com/Mr-C-Tejesh"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-action font-mono"
                aria-label="Explore Tejesh's GitHub profile (opens in a new tab)"
              >
                EXPLORE GITHUB ↗
              </a>
            </div>
          </div>
        </div>

        <div className="section-divider-thin"></div>

      </div>
    </main>
  );
}

import React, { useState, useEffect } from 'react';

const API_BASE_URL = (() => {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured) return configured.replace(/\/$/, '');
  if (import.meta.env.MODE !== 'production') return 'http://127.0.0.1:8000';
  return null;
})();

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    phone: '',
    message: '',
    honeypot: ''
  });

  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'submitting') return;

    if (formData.email.trim().toLowerCase() !== formData.confirmEmail.trim().toLowerCase()) {
      setStatus('error');
      setErrorMessage('Emails do not match.');
      return;
    }

    if (!API_BASE_URL) {
      setStatus('error');
      setErrorMessage('The contact service is not configured for this environment.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          confirmEmail: formData.confirmEmail.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim(),
          honeypot: formData.honeypot
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to submit enquiry.');
      }

      setStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        confirmEmail: '',
        phone: '',
        message: '',
        honeypot: ''
      });
    } catch (err) {
      setStatus('error');
      if (err instanceof TypeError) {
        setErrorMessage('Failed to connect to the server. Please check your connection.');
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred.');
      }
    }
  };

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
          conversations, feel free to reach out. Your contact details will be used to respond to your enquiry.
        </p>

        {status === 'success' && (
          <div className="contact-status-msg contact-success" role="alert">
            Thanks for reaching out. Your enquiry has been submitted successfully.
          </div>
        )}

        {status === 'error' && (
          <div className="contact-status-msg contact-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          {/* Honeypot field - hidden from users */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="honeypot">Do not fill this out if you are human</label>
            <input
              type="text"
              id="honeypot"
              name="honeypot"
              value={formData.honeypot}
              onChange={handleChange}
              tabIndex="-1"
              autoComplete="off"
            />
          </div>

          <div className="contact-form-row">
            <div className="contact-form-group">
              <label htmlFor="firstName" className="font-mono contact-form-label">FIRST NAME *</label>
              <input type="text" id="firstName" name="firstName" required className="contact-input" value={formData.firstName} onChange={handleChange} />
            </div>
            <div className="contact-form-group">
              <label htmlFor="lastName" className="font-mono contact-form-label">LAST NAME *</label>
              <input type="text" id="lastName" name="lastName" required className="contact-input" value={formData.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="contact-form-row">
            <div className="contact-form-group">
              <label htmlFor="email" className="font-mono contact-form-label">EMAIL *</label>
              <input type="email" id="email" name="email" required className="contact-input" value={formData.email} onChange={handleChange} />
            </div>
            <div className="contact-form-group">
              <label htmlFor="confirmEmail" className="font-mono contact-form-label">CONFIRM EMAIL *</label>
              <input type="email" id="confirmEmail" name="confirmEmail" required className="contact-input" value={formData.confirmEmail} onChange={handleChange} />
            </div>
          </div>

          <div className="contact-form-group">
            <label htmlFor="phone" className="font-mono contact-form-label">PHONE NUMBER (OPTIONAL)</label>
            <input type="tel" id="phone" name="phone" className="contact-input" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="contact-form-group">
            <label htmlFor="message" className="font-mono contact-form-label">YOUR MESSAGE *</label>
            <textarea id="message" name="message" required className="contact-input contact-textarea" maxLength={3000} rows={5} value={formData.message} onChange={handleChange} />
          </div>

          <div className="contact-form-actions">
            <button type="submit" className="btn-download font-mono" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'SUBMITTING...' : 'SUBMIT ENQUIRY'}
            </button>
          </div>
        </form>

        <div className="section-divider" style={{ marginTop: 'var(--space-8)' }}></div>

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

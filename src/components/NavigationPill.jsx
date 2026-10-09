import React, { useEffect, useState, useRef } from 'react';
import DotMatrixText from './DotMatrixText';

export default function NavigationPill({ isVisible }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // auto-close menu when hiding pill
  useEffect(() => {
    if (!isVisible) {
      setMenuOpen(false);
    }
  }, [isVisible]);

  // Handle outside click & Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false);
    };
    
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={`navigation-container ${isVisible ? 'is-visible' : ''}`} ref={menuRef}>
      <div className="navigation-pill">
        <div className="pill-left">
          <button
            className="hamburger-btn"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="navigation-menu"
            aria-label="Open navigation menu"
          >
            <div className={`hamburger-lines ${menuOpen ? 'is-open' : ''}`}>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </div>
          </button>
        </div>
        
        <div className="pill-center" aria-hidden="true">
          <div className="pill-wordmark">
            <DotMatrixText text="TEJESH C" interactive={false} color="#050505" />
          </div>
        </div>

        <div className="pill-right"></div>
      </div>

      <nav
        id="navigation-menu"
        className={`navigation-menu ${menuOpen ? 'is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <ul>
          <li><a href="#top" onClick={closeMenu}>Home</a></li>
          <li>
            <button disabled className="future-link" title="COMING IN A LATER PHASE" aria-disabled="true">
              Selected Work <span className="future-tag">soon</span>
            </button>
          </li>
          <li><a href="#about" onClick={closeMenu}>About</a></li>
          <li>
            <button disabled className="future-link" title="COMING IN A LATER PHASE" aria-disabled="true">
              Resume <span className="future-tag">soon</span>
            </button>
          </li>
          <li>
            <button disabled className="future-link" title="COMING IN A LATER PHASE" aria-disabled="true">
              Bio-data <span className="future-tag">soon</span>
            </button>
          </li>
          <li>
            <button disabled className="future-link" title="COMING IN A LATER PHASE" aria-disabled="true">
              Ask Tejesh <span className="future-tag">soon</span>
            </button>
          </li>
          <li>
            <button disabled className="future-link" title="COMING IN A LATER PHASE" aria-disabled="true">
              Contact <span className="future-tag">soon</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DotMatrixText from './DotMatrixText';

export default function NavigationPill({ isVisible, theme = 'dark' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleAboutClick = (e) => {
    e.preventDefault();
    closeMenu();
    if (location.pathname === '/') {
      const el = document.getElementById('about');
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollTo: 'about' } });
    }
  };
  
  // auto-close menu when hiding pill
  useEffect(() => {
    if (!isVisible) {
      setMenuOpen(false);
    }
  }, [isVisible]);

  // auto-close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Handle outside click & Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false);
    };
    
    const handleClickOutside = (e) => {
      if (!menuOpen) return;
      const isInsidePill = e.target.closest('.navigation-pill');
      const isInsideMenu = e.target.closest('.navigation-menu');
      if (!isInsidePill && !isInsideMenu) {
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
    <div className={`navigation-container nav-treatment-${theme} ${isVisible ? 'is-visible' : ''}`} ref={menuRef}>
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
            <DotMatrixText text="TEJESH C" interactive={false} color={theme === 'light' ? "#F2F2F0" : "#050505"} />
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
          <li>
            <Link to="/" onClick={closeMenu}>Home</Link>
          </li>
          <li>
            <Link to="/work" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', borderRadius: '10px', fontFamily: '"Inter", sans-serif', fontSize: '1.1rem', fontWeight: 500, color: '#1A1A1A', textDecoration: 'none', textAlign: 'left', transition: 'background-color 0.2s ease, transform 0.1s ease' }}>
              All Work
            </Link>
          </li>
          <li>
            {/* Using an anchor for About since it's an in-page section on Home. If not on Home, we need to go to /#about */}
            <a href="/#about" onClick={handleAboutClick}>About</a>
          </li>
          <li>
            <Link to="/resume" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', borderRadius: '10px', fontFamily: '"Inter", sans-serif', fontSize: '1.1rem', fontWeight: 500, color: '#1A1A1A', textDecoration: 'none', textAlign: 'left', transition: 'background-color 0.2s ease, transform 0.1s ease' }}>
              Resume
            </Link>
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

import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo" id="navLogo">
          <div className="nav-symbol">
            <svg viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="20" fill="none" stroke="url(#g-orbit-header)" strokeWidth="1.2"
                      strokeDasharray="120 6" strokeLinecap="round" className="orbit-ring orbit-spin-slow"/>
              <path d="M22 38 L8 14 L36 14 Z" fill="url(#g-down-header)" stroke="url(#g-edge-header)" strokeWidth="1" strokeLinejoin="round"/>
              <path d="M22 6 L36 30 L8 30 Z" fill="url(#g-up-header)" stroke="url(#g-edge-header)" strokeWidth="1" strokeLinejoin="round"/>
              <path d="M29 24 L36 30 L30 30 Z" fill="url(#g-amber-header)" opacity="0.7"/>
              <circle cx="22" cy="22" r="2" fill="#FFFFFF" opacity="0.9"/>
              <defs>
                <linearGradient id="g-up-header" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.85"/>
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3"/>
                </linearGradient>
                <linearGradient id="g-down-header" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.75"/>
                  <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.2"/>
                </linearGradient>
                <linearGradient id="g-edge-header" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3"/>
                </linearGradient>
                <linearGradient id="g-orbit-header" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.7"/>
                  <stop offset="50%" stopColor="#67E8F9" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.7"/>
                </linearGradient>
                <linearGradient id="g-amber-header" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="nav-wordmark">PriSincera</span>
        </Link>
        <div className="nav-links">
          <NavLink to="/" className="nav-link" id="navHome">홈</NavLink>
          <NavLink to="/about" className="nav-link" id="navAbout">소개</NavLink>
          <NavLink to="/services" className="nav-link" id="navServices">서비스</NavLink>
          <NavLink to="/contact" className="nav-link" id="navContact">연락처</NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Header;

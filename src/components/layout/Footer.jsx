import { Link } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';
import './Footer.css';

function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg viewBox="0 0 44 44" fill="none" width="32" height="32">
              <circle cx="22" cy="22" r="20" fill="none" stroke="url(#g-orbit-footer)" strokeWidth="1.2"
                      strokeDasharray="120 6" strokeLinecap="round" className="orbit-ring orbit-spin-slow"/>
              <path d="M22 38 L8 14 L36 14 Z" fill="url(#g-down-footer)" stroke="url(#g-edge-footer)" strokeWidth="1" strokeLinejoin="round"/>
              <path d="M22 6 L36 30 L8 30 Z" fill="url(#g-up-footer)" stroke="url(#g-edge-footer)" strokeWidth="1" strokeLinejoin="round"/>
              <path d="M29 24 L36 30 L30 30 Z" fill="url(#g-amber-footer)" opacity="0.7"/>
              <circle cx="22" cy="22" r="2" fill="#FFFFFF" opacity="0.9"/>
              <defs>
                <linearGradient id="g-up-footer" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.85"/>
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3"/>
                </linearGradient>
                <linearGradient id="g-down-footer" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.75"/>
                  <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.2"/>
                </linearGradient>
                <linearGradient id="g-edge-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3"/>
                </linearGradient>
                <linearGradient id="g-orbit-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.7"/>
                  <stop offset="50%" stopColor="#67E8F9" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.7"/>
                </linearGradient>
                <linearGradient id="g-amber-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="footer-wordmark">PriSincera</span>
          </div>
          <p className="footer-tagline">{t('footer.tagline')}</p>
        </div>
        <div className="footer-links-wrapper">
          <div className="footer-links">
            <div className="footer-col">
              <h4 className="footer-col-title">{t('footer.navigate')}</h4>
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/builders-log" className="footer-link">{t('header.buildersLog')}</Link>
              <Link to="/daily" className="footer-link">{t('header.dailyDigest')}</Link>
              <Link to="/pacenote" className="footer-link">{t('header.paceNote')}</Link>
              <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); alert(t('header.sylphioAlert')); }}>{t('header.sylphio')}</a>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">{t('footer.connect')}</h4>
              <a href="https://www.linkedin.com/in/shimks" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
              <a href="mailto:matthew.shim@prisincera.com" className="footer-link">Email</a>
            </div>
          </div>
        </div>

        {/* "발 아래 꽃, 먼 곳의 별" Slogan Zone — Positioned right above the bottom border line */}
        <div className="footer-slogan-zone">
          <div className="footer-slogan-card">
            <div className="flower-constellation">
              <svg viewBox="0 0 60 60" fill="none" width="56" height="56" className="constellation-svg">
                {/* Outer Celestial Rings */}
                <circle cx="30" cy="30" r="26" className="constellation-ring outer" />
                <circle cx="30" cy="30" r="16" className="constellation-ring inner" />
                
                {/* 12 Coordinate Radial Ticks */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 45) * Math.PI / 180;
                  const x1 = 30 + 23 * Math.cos(angle);
                  const y1 = 30 + 23 * Math.sin(angle);
                  const x2 = 30 + 26 * Math.cos(angle);
                  const y2 = 30 + 26 * Math.sin(angle);
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="constellation-tick" />
                  );
                })}

                {/* Gaseous Glow Gradient Definitions */}
                <defs>
                  <radialGradient id="g-flower-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF3D6" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#D4C4B5" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#FFF3D6" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Central Soft Glow */}
                <circle cx="30" cy="30" r="14" fill="url(#g-flower-glow)" />

                {/* Flower Constellation Connecting Lines (5 petals) */}
                <line x1="30" y1="30" x2="30" y2="10" className="constellation-line core-line" />
                <line x1="30" y1="30" x2="49" y2="23.8" className="constellation-line core-line" />
                <line x1="30" y1="30" x2="41.8" y2="46.2" className="constellation-line core-line" />
                <line x1="30" y1="30" x2="18.2" y2="46.2" className="constellation-line core-line" />
                <line x1="30" y1="30" x2="11" y2="23.8" className="constellation-line core-line" />

                {/* Flower petal curves connecting outer stars */}
                <path d="M30 10 Q39.5 16.9 49 23.8" className="constellation-line petal-line" />
                <path d="M49 23.8 Q45.4 35 41.8 46.2" className="constellation-line petal-line" />
                <path d="M41.8 46.2 Q30 46.2 18.2 46.2" className="constellation-line petal-line" />
                <path d="M18.2 46.2 Q14.6 35 11 23.8" className="constellation-line petal-line" />
                <path d="M11 23.8 Q20.5 16.9 30 10" className="constellation-line petal-line" />

                {/* Minor stardust dots */}
                <circle cx="23" cy="18" r="0.45" className="constellation-dust" />
                <circle cx="37" cy="18" r="0.55" className="constellation-dust" />
                <circle cx="45" cy="33" r="0.45" className="constellation-dust" />
                <circle cx="30" cy="42" r="0.65" className="constellation-dust" />
                <circle cx="15" cy="33" r="0.50" className="constellation-dust" />

                {/* Major Constellation Stars */}
                <circle cx="30" cy="30" r="1.35" className="constellation-major-star" />
                <circle cx="30" cy="10" r="1.1" className="constellation-major-star" />
                <circle cx="49" cy="23.8" r="1.1" className="constellation-major-star" />
                <circle cx="41.8" cy="46.2" r="1.1" className="constellation-major-star" />
                <circle cx="18.2" cy="46.2" r="1.1" className="constellation-major-star" />
                <circle cx="11" cy="23.8" r="1.1" className="constellation-major-star" />
              </svg>
            </div>
            <div className="slogan-text-group">
              <span className="slogan-kr">{t('footer.sloganKr')}</span>
              <span className="slogan-en">{t('footer.sloganEn')}</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">&copy; {year} PriSincera. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

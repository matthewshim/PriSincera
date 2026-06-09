import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';
import './Header.css';

function Header() {
  const { locale, setLocale, t, SUPPORTED_LANGUAGES } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const audioRef = useRef(null);
  const dropdownRef = useRef(null);
  const musicIntentRef = useRef(true);

  // Click outside to close custom language select dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu and resync scrolled state on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setScrolled(window.scrollY > 60);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/bgm.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.35;
    }
    return audioRef.current;
  }, []);

  // Auto-play BGM when hero-ready (GNB visible)
  // 메인(Index) 페이지에서만 자동 재생을 시도하도록 제한
  useEffect(() => {
    if (location.pathname !== '/') return;
    if (!musicIntentRef.current) return;

    let resumeListener = null;

    const tryAutoplay = () => {
      if (document.body.classList.contains('hero-ready') && musicIntentRef.current) {
        const audio = getAudio();
        audio.play().then(() => setMusicPlaying(true)).catch(() => {
          // Autoplay blocked — wait for user interaction
          resumeListener = () => {
            if (musicIntentRef.current && window.location.pathname === '/') {
              audio.play().then(() => setMusicPlaying(true)).catch(() => {});
            }
            if (resumeListener) {
              document.removeEventListener('click', resumeListener);
              resumeListener = null;
            }
          };
          document.addEventListener('click', resumeListener, { once: true });
        });
        return true;
      }
      return false;
    };

    // Check immediately
    if (tryAutoplay()) return;

    // Watch for hero-ready class
    const observer = new MutationObserver(() => {
      if (tryAutoplay()) observer.disconnect();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      observer.disconnect();
      if (resumeListener) {
        document.removeEventListener('click', resumeListener);
      }
    };
  }, [getAudio, location.pathname]);

  // Cleanup audio resource on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Auto-pause BGM on all non-main (sub) pages to prevent unwanted auto-play
  useEffect(() => {
    if (location.pathname !== '/') {
      const audio = getAudio();
      audio.pause();
      musicIntentRef.current = false;
      setMusicPlaying(false);
    }
  }, [location.pathname, getAudio]);

  const toggleMusic = useCallback(() => {
    const audio = getAudio();
    if (musicPlaying) {
      audio.pause();
      musicIntentRef.current = false;
      setMusicPlaying(false);
    } else {
      musicIntentRef.current = true;
      audio.play().then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
    }
  }, [musicPlaying, getAudio]);


  const getThemeClass = () => {
    if (location.pathname.startsWith('/sylphio')) return 'sylphio-theme';
    if (location.pathname.startsWith('/builders-log')) return 'builders-theme';
    if (location.pathname.startsWith('/daily')) return 'daily-theme';
    if (location.pathname.startsWith('/pacenote')) return 'pacenote-theme';
    return '';
  };

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''} ${getThemeClass()}`} id="nav">
      <div className="nav-inner">
        {/* Hamburger toggle button (mobile only) - Moved to left */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

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
                  <stop offset="0%" stopColor="var(--prism-lavender)" stopOpacity="0.85"/>
                  <stop offset="100%" stopColor="var(--color-indigo)" stopOpacity="0.3"/>
                </linearGradient>
                <linearGradient id="g-down-header" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-gold-light)" stopOpacity="0.75"/>
                  <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0.2"/>
                </linearGradient>
                <linearGradient id="g-edge-header" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--prism-rose)" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="var(--color-indigo)" stopOpacity="0.3"/>
                </linearGradient>
                <linearGradient id="g-orbit-header" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.85"/>
                  <stop offset="50%" stopColor="var(--prism-lavender)" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="var(--prism-lavender)" stopOpacity="0.85"/>
                </linearGradient>
                <linearGradient id="g-amber-header" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0.7"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="nav-wordmark">PriSincera</span>
        </Link>
        <div className="nav-links">
          <Link to="/builders-log" className={`nav-link${location.pathname.startsWith('/builders-log') ? ' active' : ''}`} id="navBuildersLog">{t('header.buildersLog')}</Link>
          <Link to="/daily" className={`nav-link${location.pathname.startsWith('/daily') ? ' active' : ''}`} id="navDailyDigest">{t('header.dailyDigest')}</Link>
          <Link to="/pacenote" className={`nav-link${location.pathname.startsWith('/pacenote') ? ' active' : ''}`} id="navPaceNote">{t('header.paceNote')}</Link>
          <Link to="/sylphio" className={`nav-link${location.pathname.startsWith('/sylphio') ? ' active' : ''}`} id="navSylphio">{t('header.sylphio')}</Link>
        </div>
        <div className="nav-right">
          {/* 다국어 언어 선택 스위치 (OLED Custom Dropdown Select) */}
          <div className="locale-dropdown-wrapper" ref={dropdownRef} id="gnbLocaleSlot">
            <button
              className={`locale-dropdown-trigger ${isDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="Select Language"
              aria-expanded={isDropdownOpen}
            >
              <span className="globe-icon">🌐</span>
              <span className="current-locale-text">{locale.toUpperCase()}</span>
              <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▾</span>
            </button>
            {isDropdownOpen && (
              <div className="locale-dropdown-menu">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    className={`locale-dropdown-item ${locale === lang.code ? 'active' : ''}`}
                    onClick={() => {
                      setLocale(lang.code);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span className="locale-laser-dot" />
                    <span className="locale-label">{lang.nativeLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* BGM toggle — works on all pages */}
          <div className="nav-bgm-slot" id="gnbBgmSlot">
            <button
              className={`gnb-bgm-btn ${musicPlaying ? 'active' : ''}`}
              onClick={toggleMusic}
              aria-label="Toggle music"
              id="bgmToggle"
            >
              <div className={`waveform-bars ${musicPlaying ? 'on' : 'off'}`}>
                <div className="waveform-bar" />
                <div className="waveform-bar" />
                <div className="waveform-bar" />
                <div className="waveform-bar" />
                <div className="waveform-bar" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay Navigation (Bento Portal) */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-bento-menu-container">
          {/* Menu Title Header */}
          <div className="mobile-menu-header">
            <span className="mobile-menu-title">PriSincera Portal</span>
            <span className="mobile-menu-subtitle">Explore Flagship Services & Growth Engine</span>
          </div>

          {/* 1. PriSincera Base (Platform Foundation) */}
          <a
            href="https://github.com/matthewshim/PriSincera"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-bento-nav-item base-gold-theme"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="bento-card-content">
              <div className="bento-card-label" style={{ color: '#F59E0B' }}>Platform Foundation</div>
              <h3 className="bento-card-title">PriSincera Base</h3>
              <div className="bento-card-arrow">🪐 Explore GitHub →</div>
            </div>
            <div className="bento-card-visual">
              <div className="dynamic-mockup base-mockup">
                <div className="base-engine-container">
                  <div className="prism-core">
                    <div className="prism-face front"></div>
                    <div className="prism-face back"></div>
                    <div className="prism-face left"></div>
                    <div className="prism-face right"></div>
                    <div className="prism-face top"></div>
                    <div className="prism-face bottom"></div>
                  </div>
                  <div className="engine-ring ring-x"></div>
                  <div className="engine-ring ring-y"></div>
                  <div className="engine-ring ring-z"></div>
                </div>
                <div className="base-terminal">
                  <div className="terminal-header">
                    <span className="terminal-title">core-engine.log</span>
                    <span className="terminal-status active">RUNNING</span>
                  </div>
                  <div className="terminal-lines">
                    <div className="terminal-line">&gt; Client: React 18 + Vite Success</div>
                    <div className="terminal-line">&gt; Cloud Run: Active</div>
                  </div>
                </div>
              </div>
              <div className="visual-blur-orb amber"></div>
            </div>
          </a>

          {/* 2. Builder's Log (Growth Blog) */}
          <Link
            to="/builders-log"
            className={`mobile-bento-nav-item log-indigo-theme${location.pathname.startsWith('/builders-log') ? ' active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="bento-card-content">
              <div className="bento-card-label" style={{ color: '#8B5CF6' }}>Engineering & Growth</div>
              <h3 className="bento-card-title">Builder's Log</h3>
              <div className="bento-card-arrow">📖 Read Logs →</div>
            </div>
            <div className="bento-card-visual">
              <div className="dynamic-mockup builderslog-mockup">
                <div className="mockup-timeline">
                  <div className="timeline-line"></div>
                  <div className="timeline-node active">
                    <div className="node-dot"></div>
                    <div className="node-info">
                      <div className="node-title">Admin Integration</div>
                      <div className="node-meta">Chapter 3 · May 20</div>
                    </div>
                  </div>
                  <div className="timeline-node">
                    <div className="node-dot"></div>
                    <div className="node-info">
                      <div className="node-title">Auth Isolation</div>
                      <div className="node-meta">Chapter 2 · May 18</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="visual-blur-orb indigo"></div>
            </div>
          </Link>

          {/* 3. Daily Digest (AI Curation) */}
          <Link
            to="/daily"
            className={`mobile-bento-nav-item daily-cyan-theme${location.pathname.startsWith('/daily') ? ' active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="bento-card-content">
              <div className="bento-card-label" style={{ color: 'var(--orbit-cyan)' }}>AI Curation</div>
              <h3 className="bento-card-title">Daily Digest</h3>
              <div className="bento-card-arrow">📡 View Curation →</div>
            </div>
            <div className="bento-card-visual">
              <div className="dynamic-mockup daily-mockup">
                <div className="mockup-header">
                  <div className="mockup-dot"></div><div className="mockup-dot"></div><div className="mockup-dot"></div>
                </div>
                <div className="mockup-body">
                  <div className="mockup-skeleton-title"></div>
                  <div className="mockup-skeleton-text"></div>
                  <div className="mockup-ai-card">
                    <span className="ai-spark">✨</span>
                    <div className="ai-lines">
                      <div className="ai-line"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="visual-blur-orb cyan"></div>
            </div>
          </Link>

          {/* 4. Pace Note (Action Tracker) */}
          <Link
            to="/pacenote"
            className={`mobile-bento-nav-item pace-green-theme${location.pathname.startsWith('/pacenote') ? ' active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="bento-card-content">
              <div className="bento-card-label" style={{ color: '#34D399' }}>Action & Tracker</div>
              <h3 className="bento-card-title">Pace Note</h3>
              <div className="bento-card-arrow">🎯 Track Goals →</div>
            </div>
            <div className="bento-card-visual">
              <div className="dynamic-mockup pacenote-mockup">
                <div className="pacenote-grid">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className={`pace-cell ${[5,6,12,14,18].includes(i) ? 'active' : ''} ${i === 14 ? 'pulse' : ''}`}></div>
                  ))}
                </div>
                <div className="pace-floating-card">
                  <div className="pace-check">✓</div>
                </div>
              </div>
              <div className="visual-blur-orb emerald"></div>
            </div>
          </Link>

          {/* 5. Sylphio (AI Translation) */}
          <Link
            to="/sylphio"
            className={`mobile-bento-nav-item sylphio-blue-theme${location.pathname.startsWith('/sylphio') ? ' active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="bento-card-content">
              <div className="bento-card-label" style={{ color: '#00F2FE' }}>On-Device AI Translation</div>
              <h3 className="bento-card-title">Sylphio</h3>
              <div className="bento-card-arrow">🍃 Meet the Spirit →</div>
            </div>
            <div className="bento-card-visual">
              <div className="dynamic-mockup sylphio-mockup">
                <div className="sylphio-bento-core">
                  <img src="/sylphio-icon.png" alt="Sylphio App Icon" className="sylphio-bento-icon-img" />
                  <div className="sylphio-bento-pulse"></div>
                </div>
              </div>
              <div className="visual-blur-orb blue"></div>
            </div>
          </Link>

          {/* 모바일 하단 Thumb Zone 언어 토글 (3단 가로 그리드) */}
          <div className="mobile-nav-locale-footer">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`mobile-locale-btn ${locale === lang.code ? 'active' : ''}`}
                onClick={() => { setLocale(lang.code); setIsMobileMenuOpen(false); }}
              >
                {lang.nativeLabel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;

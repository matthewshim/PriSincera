import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const audioRef = useRef(null);
  const musicIntentRef = useRef(true);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
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
  useEffect(() => {
    if (!musicIntentRef.current) return;

    const tryAutoplay = () => {
      if (document.body.classList.contains('hero-ready') && musicIntentRef.current) {
        const audio = getAudio();
        audio.play().then(() => setMusicPlaying(true)).catch(() => {
          // Autoplay blocked — wait for user interaction
          const resume = () => {
            if (musicIntentRef.current) audio.play().catch(() => {});
            document.removeEventListener('click', resume);
          };
          document.addEventListener('click', resume, { once: true });
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
    return () => observer.disconnect();
  }, [getAudio]);

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

  // Auto-pause BGM on /pristudy
  useEffect(() => {
    if (location.pathname.startsWith('/pristudy')) {
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
          <Link to="/" className={`nav-link${location.pathname === '/' ? ' active' : ''}`} id="navHome">Home</Link>
          <Link to="/prisignal" className={`nav-link${location.pathname.startsWith('/prisignal') ? ' active' : ''}`} id="navPriSignal">PriSignal</Link>
          <Link to="/pristudy" className={`nav-link${location.pathname.startsWith('/pristudy') ? ' active' : ''}`} id="navPriStudy">PriStudy</Link>
        </div>
        <div className="nav-right">
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

          {/* Hamburger toggle button (mobile only) */}
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
        </div>
      </div>

      {/* Mobile Overlay Navigation */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-links">
          <Link to="/" className={`mobile-nav-link${location.pathname === '/' ? ' active' : ''}`}>Home</Link>
          <Link to="/prisignal" className={`mobile-nav-link${location.pathname.startsWith('/prisignal') ? ' active' : ''}`}>PriSignal</Link>
          <Link to="/pristudy" className={`mobile-nav-link${location.pathname.startsWith('/pristudy') ? ' active' : ''}`}>PriStudy</Link>
        </div>
      </div>
    </nav>
  );
}

export default Header;

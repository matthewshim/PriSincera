import { useState, useEffect, useRef, useCallback } from 'react';
import HeroSection from '../components/hero/HeroSection';
import PhilosophySection from '../components/philosophy/PhilosophySection';
import './Home.css';

/**
 * Home page — orchestrates the scroll-driven transition
 * from Hero (sticky) to content sections.
 *
 * Scroll is locked during hero animation. Once the SCROLL indicator
 * appears (all hero content revealed), scrolling is unlocked.
 */
function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollLocked, setScrollLocked] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const wrapperRef = useRef(null);
  const philosophyRef = useRef(null);

  // Lock body scroll while hero is animating
  useEffect(() => {
    if (scrollLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [scrollLocked]);

  // Unlock scroll and show GNB when hero intro is complete
  const onHeroIntroComplete = useCallback(() => {
    setScrollLocked(false);
    document.body.classList.add('hero-ready');
  }, []);

  // Clean up body class on unmount
  useEffect(() => {
    return () => document.body.classList.remove('hero-ready');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const heroHeight = window.innerHeight;
      const scrollY = window.scrollY;
      // Progress: 0 at top, 1 when scrolled past one full viewport height
      const progress = Math.min(1, Math.max(0, scrollY / heroHeight));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Constellation auto-ON when Philosophy content section enters viewport
  useEffect(() => {
    const el = philosophyRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setContentVisible(entry.isIntersecting);
      },
      { threshold: 0.05 } // trigger as soon as ~5% of the section is visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-wrapper" ref={wrapperRef}>
      {/* Sticky hero — stays fixed while content scrolls over it */}
      <div className="hero-sticky-container">
        <HeroSection
          forceShowAllConstellations={contentVisible}
          scrollProgress={scrollProgress}
          onIntroComplete={onHeroIntroComplete}
        />
      </div>

      {/* Scroll spacer — creates scroll distance for the transition */}
      <div className="scroll-transition-spacer" />

      {/* Content sections — glassmorphic backgrounds handle readability */}
      <div className="content-layer">
        <div className="content-sections">
          <div ref={philosophyRef}>
            <PhilosophySection />
          </div>
          {/* Future sections: Services, Contact, etc. */}
        </div>
      </div>
    </div>
  );
}

export default Home;

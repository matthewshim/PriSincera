import { useState, useEffect, useRef } from 'react';
import HeroSection from '../components/hero/HeroSection';
import PhilosophySection from '../components/philosophy/PhilosophySection';
import './Home.css';

/**
 * Home page — orchestrates the scroll-driven transition
 * from Hero (sticky) to content sections with overlay.
 *
 * Scroll Sequence:
 *   1. Hero fills viewport (sticky)
 *   2. User scrolls → scroll progress tracked
 *   3. At ~30% progress: all constellations activate
 *   4. At ~40% progress: dark overlay rises from bottom
 *   5. Content sections slide in on top of overlay
 */
function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const wrapperRef = useRef(null);

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

  // Constellation all-on triggers at 30% scroll progress
  const constellationsAllOn = scrollProgress > 0.3;
  // Overlay opacity: starts at 40% progress, fully opaque at 90%
  const overlayOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.4) / 0.5));
  // Overlay Y translate: slides up from 60px to 0
  const overlayTranslateY = (1 - overlayOpacity) * 60;

  return (
    <div className="home-wrapper" ref={wrapperRef}>
      {/* Sticky hero — stays fixed while content scrolls over it */}
      <div className="hero-sticky-container">
        <HeroSection
          forceShowAllConstellations={constellationsAllOn}
          scrollProgress={scrollProgress}
        />
      </div>

      {/* Scroll spacer — creates scroll distance for the transition */}
      <div className="scroll-transition-spacer" />

      {/* Content overlay + sections */}
      <div className="content-layer">
        {/* Dark overlay — rises from bottom */}
        <div
          className="content-overlay"
          style={{
            opacity: overlayOpacity,
            transform: `translateY(${overlayTranslateY}px)`,
          }}
        />

        {/* Actual content sections */}
        <div className="content-sections">
          <PhilosophySection />
          {/* Future sections: Services, Contact, etc. */}
        </div>
      </div>
    </div>
  );
}

export default Home;

import { useState, useEffect, useRef, useCallback } from 'react';
import useSEO from '../hooks/useSEO';
import { PAGE_META } from '../data/seoMeta.mjs';
import { useTranslation } from '../contexts/LanguageContext';
import HeroSection from '../components/hero/HeroSection';
import TelescopeCursor from '../components/hero/TelescopeCursor';
import BeliefSection from '../components/philosophy/PhilosophySection';
import JourneySection from '../components/journey/JourneySection';
import WorkSection from '../components/work/WorkSection';
import ConnectSection from '../components/connect/ConnectSection';
import './Home.css';

/**
 * Home page — orchestrates the scroll-driven transition
 * from Hero (sticky) to content sections.
 *
 * Scroll is locked during hero animation. Once the SCROLL indicator
 * appears (all hero content revealed), scrolling is unlocked.
 */
function Home() {
  const { t } = useTranslation();

  useSEO({
    title: '', // 빈 값 → 홈 브랜드 타이틀
    description: PAGE_META['/'].description,
    keywords: PAGE_META['/'].keywords,
    ogUrl: 'https://www.prisincera.com/'
  });

  // Check if CI animation already played this session
  const ciAlreadyPlayed = sessionStorage.getItem('prisincera_ci_played');

  const [scrollProgress, setScrollProgress] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
  const wrapperRef = useRef(null);
  const beliefRef = useRef(null);

  // If CI already played, show GNB immediately on mount
  useEffect(() => {
    if (ciAlreadyPlayed) {
      document.body.classList.add('hero-ready');
    }
  }, [ciAlreadyPlayed]);

  // [스크롤 하이재킹 제거 — ai_pattern_audit §2-4 D3]
  // 이전 구현은 히어로 인트로가 끝날 때까지 body.overflow를 'hidden'으로 잠갔다.
  // 첫인상 구간에서 사용자의 스크롤 통제권을 빼앗는 패턴이므로 락을 제거했다.
  // 대신 인트로가 '양보'한다 — 사용자가 스크롤·터치·키 입력을 하면 HeroContent가
  // 시퀀스를 즉시 완료하고 onIntroComplete을 호출한다(HeroContent.jsx 참조).

  // Show GNB when hero intro is complete (타이머 완주 또는 사용자 입력에 의한 조기 완료)
  const onHeroIntroComplete = useCallback(() => {
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

  // Constellation auto-ON when Belief content section enters viewport (once-on: stays visible)
  useEffect(() => {
    const el = beliefRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setContentVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-wrapper" ref={wrapperRef}>
      {/* 망원경 커서 — 홈 전용(D-3). 전역 마운트는 전 지면의 I-beam·pointer를 지웠다 → Layout에서 이관 */}
      <TelescopeCursor />

      {/* Sticky hero — stays fixed while content scrolls over it */}
      <div className="hero-sticky-container">
        <HeroSection
          forceShowAllConstellations={contentVisible}
          contentVisible={contentVisible}
          scrollProgress={scrollProgress}
          onIntroComplete={onHeroIntroComplete}
        />
      </div>

      {/* Scroll spacer — creates scroll distance for the transition */}
      <div className="scroll-transition-spacer" />

      {/* Content sections — glassmorphic backgrounds handle readability */}
      <div className="content-layer">
        <div className="content-sections">
          <div ref={beliefRef}>
            <BeliefSection />
          </div>
          <JourneySection />
          <WorkSection />
          <ConnectSection />
        </div>
      </div>
    </div>
  );
}

export default Home;

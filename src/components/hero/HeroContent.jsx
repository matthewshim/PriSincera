import { useEffect, useRef } from 'react';

/**
 * Hero text content — label, title, subtitle.
 * Animates in sequentially after assembly completes.
 * Calls onIntroComplete when all elements (including SCROLL indicator) are visible.
 */
export default function HeroContent({ visible, onIntroComplete }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    const el = containerRef.current;
    if (!el) return;

    const label = el.querySelector('.hero-label');
    const words = el.querySelectorAll('.word');
    const sub = el.querySelector('.hero-sub');
    const scroll = document.getElementById('scrollIndicator');

    /* Collect all timer IDs for cleanup */
    const timers = [];

    timers.push(setTimeout(() => label?.classList.add('visible'), 200));
    timers.push(setTimeout(() => {
      words.forEach((w) => {
        const delay = parseInt(w.dataset.delay) || 0;
        timers.push(setTimeout(() => w.classList.add('visible'), delay * 150));
      });
    }, 600));
    timers.push(setTimeout(() => sub?.classList.add('visible'), 1600));
    timers.push(setTimeout(() => {
      scroll?.classList.add('visible');
      // All hero content is now visible — unlock scrolling
      onIntroComplete?.();
    }, 2200));

    return () => timers.forEach(id => clearTimeout(id));
  }, [visible, onIntroComplete]);

  return (
    <div className="hero-content" ref={containerRef}>
      <div className="hero-label">✦ Star Prism Identity</div>
      <h1 className="hero-title">
        <span className="word" data-delay="0">Sincerity,</span>
        <span className="word accent" data-delay="1">Prioritized.</span>
      </h1>
      <p className="hero-sub">
        <strong>"발 아래 꽃, 먼 곳의 별"</strong>
        <br/><br/>
        멀리 빛나는 목표(별)를 향해 나아가면서도,
        <br/>
        지금 내 앞의 피어난 본질(꽃)에 충실하는 태도.
        <br/>
        그것이 가장 올바른 길이라 확신합니다.
      </p>
    </div>
  );
}

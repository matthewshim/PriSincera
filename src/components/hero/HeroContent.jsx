import { useEffect, useRef } from 'react';

/**
 * Hero text content — label, title, subtitle, CTAs.
 * Animates in sequentially after assembly completes.
 */
export default function HeroContent({ visible }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    const el = containerRef.current;
    if (!el) return;

    const label = el.querySelector('.hero-label');
    const words = el.querySelectorAll('.word');
    const sub = el.querySelector('.hero-sub');
    const cta = el.querySelector('.hero-cta-group');
    const scroll = document.getElementById('scrollIndicator');

    setTimeout(() => label?.classList.add('visible'), 200);
    setTimeout(() => {
      words.forEach((w) => {
        const delay = parseInt(w.dataset.delay) || 0;
        setTimeout(() => w.classList.add('visible'), delay * 150);
      });
    }, 600);
    setTimeout(() => sub?.classList.add('visible'), 1600);
    setTimeout(() => cta?.classList.add('visible'), 2000);
    setTimeout(() => scroll?.classList.add('visible'), 2600);
  }, [visible]);

  return (
    <div className="hero-content" ref={containerRef}>
      <div className="hero-label">✦ Star Prism Identity</div>
      <h1 className="hero-title">
        <span className="word" data-delay="0">Sincerity,</span>
        <span className="word accent" data-delay="1">Prioritized.</span>
      </h1>
      <p className="hero-sub">
        가장 중요한 것을, 가장 먼저.
        <br/>
        멀리 있어도, 흐려져도, 본질은 반드시 찾아냅니다.
        <br/>
        그것이 가장 올바른 길이라 확신합니다.
      </p>
      <div className="hero-cta-group">
        <button className="cta-primary" id="ctaPrimary">자세히 알아보기</button>
        <button className="cta-secondary" id="ctaSecondary">서비스 둘러보기</button>
      </div>
    </div>
  );
}

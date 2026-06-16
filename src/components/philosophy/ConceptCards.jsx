import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

export default function BeliefCards() {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [activeCardIndex, setActiveCardIndex] = useState(-1);
  const activeIndexRef = useRef(-1);

  // Sync activeIndexRef with activeCardIndex state to avoid closure issues in scroll handler
  useEffect(() => {
    activeIndexRef.current = activeCardIndex;
  }, [activeCardIndex]);

  const CARDS = [
    {
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          {/* ○ The Orbit — CI의 순환의 원 */}
          <circle className="orbit-outer" cx="24" cy="24" r="16" stroke="#E5B25D" strokeWidth="1.2" fill="none"
            strokeDasharray="96 4" strokeLinecap="round" opacity="0.7"/>
          <circle className="orbit-inner" cx="24" cy="24" r="10" stroke="#C7D2FE" strokeWidth="0.6" fill="none"
            strokeDasharray="4 4" opacity="0.3"/>
          <circle className="orbit-center" cx="24" cy="24" r="2.5" fill="#E5B25D" opacity="0.5"/>
        </svg>
      ),
      symbol: '○',
      title: t('home.conceptCard1.title'),
      subtitle: t('home.conceptCard1.subtitle'),
      quote: t('home.conceptCard1.quote'),
      description: t('home.conceptCard1.desc'),
      color: '#E5B25D',
      rgb: '229,178,93',
    },
    {
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          {/* △ Priority Prism — CI의 위를 향하는 프리즘 */}
          <path className="prism-triangle" d="M24 8 L38 34 L10 34 Z" stroke="#C7D2FE" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
          <line className="prism-line" x1="24" y1="16" x2="24" y2="30" stroke="#F1F5F9" strokeWidth="0.8" opacity="0.4"/>
          <circle className="prism-dot" cx="24" cy="12" r="1.5" fill="#C7D2FE" opacity="0.6"/>
        </svg>
      ),
      symbol: '△',
      title: t('home.conceptCard2.title'),
      subtitle: t('home.conceptCard2.subtitle'),
      quote: t('home.conceptCard2.quote'),
      description: t('home.conceptCard2.desc'),
      color: '#C7D2FE',
      rgb: '199,210,254',
    },
    {
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          {/* ▽ Sincera Prism — CI의 아래를 지탱하는 프리즘 */}
          <path className="sincera-triangle" d="M24 40 L10 14 L38 14 Z" stroke="#A5B4FC" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
          <circle className="sincera-glow" cx="24" cy="26" r="3" fill="rgba(165, 180, 252, 0.2)" opacity="0.5"/>
          <circle className="sincera-core" cx="24" cy="26" r="1.5" fill="#FFFFFF" opacity="0.8"/>
        </svg>
      ),
      symbol: '▽',
      title: t('home.conceptCard3.title'),
      subtitle: t('home.conceptCard3.subtitle'),
      quote: t('home.conceptCard3.quote'),
      description: t('home.conceptCard3.desc'),
      color: '#A5B4FC',
      rgb: '165,180,252',
    },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const cards = container.querySelectorAll('.concept-card');
        const isMobile = window.innerWidth <= 768;
        const viewCenterY = window.innerHeight / 2;
        const viewCenterX = window.innerWidth / 2;

        let absoluteClosestIndex = -1;
        let minDistance = Infinity;
        const cardDistances = [];

        cards.forEach((card, idx) => {
          const rect = card.getBoundingClientRect();
          let distance;

          if (isMobile) {
            // Horizontal distance on mobile
            const cardCenterX = rect.left + rect.width / 2;
            distance = Math.abs(viewCenterX - cardCenterX);
          } else {
            // Vertical distance on desktop/tablet
            const cardCenterY = rect.top + rect.height / 2;
            distance = Math.abs(viewCenterY - cardCenterY);
          }

          cardDistances.push(distance);

          const isInViewport = isMobile
            ? (rect.left < window.innerWidth && rect.right > 0)
            : (rect.top < window.innerHeight && rect.bottom > 0);

          if (isInViewport && distance < minDistance) {
            minDistance = distance;
            absoluteClosestIndex = idx;
          }
        });

        const currentActive = activeIndexRef.current;
        let nextIndex = currentActive;

        // Reset if the section is scrolled way out of view (closer than 450px)
        if (absoluteClosestIndex === -1 || (!isMobile && minDistance > 450)) {
          nextIndex = -1;
        } else {
          if (currentActive === -1) {
            // Immediate focus if entering from inactive state
            nextIndex = absoluteClosestIndex;
          } else {
            // Hysteresis buffer (desktop: 90px, mobile: 50px) to prevent rapid/jittery switches
            const currentActiveDistance = cardDistances[currentActive] ?? Infinity;
            const candidateDistance = cardDistances[absoluteClosestIndex];
            const buffer = isMobile ? 50 : 90;

            if (candidateDistance < currentActiveDistance - buffer) {
              nextIndex = absoluteClosestIndex;
            }
          }
        }

        if (nextIndex !== currentActive) {
          setActiveCardIndex(nextIndex);
        }
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className={`concept-cards${activeCardIndex !== -1 ? ' has-active-focus' : ''}`} ref={containerRef}>
      {CARDS.map((card, i) => (
        <div
          className={`concept-card reveal-item${activeCardIndex === i ? ' active-focus' : ''}`}
          key={card.subtitle}
          style={{ '--reveal-delay': `${0.2 + i * 0.15}s`, '--card-accent': card.color }}
          data-accent-color={card.rgb}
        >
          <div className="concept-icon">{card.icon}</div>
          <div className="concept-body">
            <h3 className="concept-title">
              <span className="concept-symbol">{card.symbol}</span>
              {card.title}
              <span className="concept-subtitle">{card.subtitle}</span>
            </h3>
            <p className="concept-quote">"{card.quote}"</p>
            <p className="concept-desc">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

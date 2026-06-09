import React from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

export default function BeliefCards() {
  const { t } = useTranslation();

  const CARDS = [
    {
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          {/* ○ The Orbit — CI의 순환의 원 */}
          <circle cx="24" cy="24" r="16" stroke="#E5B25D" strokeWidth="1.2" fill="none"
            strokeDasharray="96 4" strokeLinecap="round" opacity="0.7"/>
          <circle cx="24" cy="24" r="10" stroke="#C7D2FE" strokeWidth="0.6" fill="none"
            strokeDasharray="4 4" opacity="0.3"/>
          <circle cx="24" cy="24" r="2.5" fill="#E5B25D" opacity="0.5"/>
        </svg>
      ),
      symbol: '○',
      title: t('home.conceptCard1.title'),
      subtitle: t('home.conceptCard1.subtitle'),
      quote: t('home.conceptCard1.quote'),
      description: t('home.conceptCard1.desc'),
      color: '#E5B25D',
    },
    {
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          {/* △ Priority Prism — CI의 위를 향하는 프리즘 */}
          <path d="M24 8 L38 34 L10 34 Z" stroke="#C7D2FE" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
          <line x1="24" y1="16" x2="24" y2="30" stroke="#F1F5F9" strokeWidth="0.8" opacity="0.4"/>
          <circle cx="24" cy="12" r="1.5" fill="#C7D2FE" opacity="0.6"/>
        </svg>
      ),
      symbol: '△',
      title: t('home.conceptCard2.title'),
      subtitle: t('home.conceptCard2.subtitle'),
      quote: t('home.conceptCard2.quote'),
      description: t('home.conceptCard2.desc'),
      color: '#C7D2FE',
    },
    {
      icon: (
        <svg viewBox="0 0 48 48" fill="none">
          {/* ▽ Sincera Prism — CI의 아래를 지탱하는 프리즘 */}
          <path d="M24 40 L10 14 L38 14 Z" stroke="#A5B4FC" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
          <circle cx="24" cy="26" r="3" fill="rgba(165, 180, 252, 0.2)" opacity="0.5"/>
          <circle cx="24" cy="26" r="1.5" fill="#FFFFFF" opacity="0.8"/>
        </svg>
      ),
      symbol: '▽',
      title: t('home.conceptCard3.title'),
      subtitle: t('home.conceptCard3.subtitle'),
      quote: t('home.conceptCard3.quote'),
      description: t('home.conceptCard3.desc'),
      color: '#A5B4FC',
    },
  ];

  return (
    <div className="concept-cards">
      {CARDS.map((card, i) => (
        <div
          className="concept-card reveal-item"
          key={card.subtitle}
          style={{ '--reveal-delay': `${0.2 + i * 0.15}s`, '--card-accent': card.color }}
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

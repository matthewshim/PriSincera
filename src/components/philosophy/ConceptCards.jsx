/**
 * Concept Cards — three glass cards explaining Priority Prism, Sincera Prism, The Orbit.
 * Each card has an SVG icon, title, and description.
 */

const CARDS = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M24 8 L38 32 L10 32 Z" stroke="#C4B5FD" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
        <line x1="24" y1="16" x2="24" y2="28" stroke="#E9D5FF" strokeWidth="0.8" opacity="0.5"/>
      </svg>
    ),
    symbol: '△',
    title: 'Priority Prism',
    subtitle: '우선순위의 프리즘',
    description: '위를 향하는 시선. 흩어진 과제 속에서 핵심을 끌어올리고, 비전의 방향을 정돈합니다.',
    color: '#C4B5FD',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path d="M24 40 L10 16 L38 16 Z" stroke="#A78BFA" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
        <circle cx="24" cy="26" r="3" fill="#F0ABFC" opacity="0.3"/>
      </svg>
    ),
    symbol: '▽',
    title: 'Sincera Prism',
    subtitle: '진심의 프리즘',
    description: '아래를 지탱하는 토대. 본질을 왜곡하지 않는 투명함으로, 신뢰의 기반을 세웁니다.',
    color: '#A78BFA',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="18" fill="none" stroke="#22D3EE" strokeWidth="1" strokeDasharray="108 5" strokeLinecap="round" opacity="0.7"/>
        <path d="M24 8 L36 30 L12 30 Z" stroke="#C4B5FD" strokeWidth="1" fill="none" strokeLinejoin="round"/>
        <path d="M24 40 L12 18 L36 18 Z" stroke="#A78BFA" strokeWidth="1" fill="none" strokeLinejoin="round"/>
        <path d="M30 25 L36 30 L30 30 Z" fill="#FDE68A" opacity="0.6"/>
        <circle cx="24" cy="24" r="2.5" fill="#FFFFFF" opacity="0.9"/>
      </svg>
    ),
    symbol: '○',
    title: 'The Orbit',
    subtitle: '순환의 원',
    description: '비전과 신뢰를 쉬지 않고 순환시키며, 균형 있는 조화를 만들어냅니다.',
    color: '#22D3EE',
  },
];

export default function ConceptCards() {
  return (
    <div className="concept-cards">
      {CARDS.map((card, i) => (
        <div
          className="concept-card reveal-item"
          key={card.title}
          style={{ '--reveal-delay': `${0.2 + i * 0.15}s`, '--card-accent': card.color }}
        >
          <div className="concept-icon">{card.icon}</div>
          <div className="concept-body">
            <h3 className="concept-title">
              <span className="concept-symbol">{card.symbol}</span>
              {card.title}
              <span className="concept-subtitle">{card.subtitle}</span>
            </h3>
            <p className="concept-desc">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

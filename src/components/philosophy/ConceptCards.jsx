/**
 * Belief Cards — three personal conviction cards: Note A, Priority, Sincera.
 * Each card has a large quote, description, and accent color.
 */

const CARDS = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        {/* Tuning fork / metronome — the standard pitch "A" */}
        <line x1="24" y1="8" x2="24" y2="36" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M18 8 Q24 16 30 8" stroke="#FDE68A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <circle cx="24" cy="38" r="3" fill="#FDE68A" opacity="0.3"/>
      </svg>
    ),
    keyword: 'Attitude',
    title: 'Note A',
    subtitle: '태도',
    quote: '기술은 변해도 태도는 남는다',
    description: '20년을 지탱해 온 힘은 도구가 아니라, 업(業)을 대하는 단단한 태도였습니다.',
    color: '#FDE68A',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        {/* Upward triangle — rising, finding direction */}
        <path d="M24 8 L38 34 L10 34 Z" stroke="#C4B5FD" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
        <line x1="24" y1="16" x2="24" y2="30" stroke="#E9D5FF" strokeWidth="0.8" opacity="0.5"/>
      </svg>
    ),
    keyword: 'Focus',
    title: 'Priority',
    subtitle: '우선순위',
    quote: '혼돈 속에서도 핵심을 찾는다',
    description: '수많은 과제 사이에서 비전의 방향을 정돈하는 것, 그것이 우선순위입니다.',
    color: '#C4B5FD',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        {/* Heart-like core glow — sincerity, trust */}
        <circle cx="24" cy="24" r="14" stroke="#A78BFA" strokeWidth="1.2" fill="none" strokeDasharray="80 8" strokeLinecap="round"/>
        <circle cx="24" cy="24" r="5" fill="#F0ABFC" opacity="0.25"/>
        <circle cx="24" cy="24" r="2" fill="#FFFFFF" opacity="0.9"/>
      </svg>
    ),
    keyword: 'Trust',
    title: 'Sincera',
    subtitle: '진심',
    quote: '진심은 결국 도달한다',
    description: '투명하게 본질에 집중하면, 신뢰는 반드시 따라옵니다.',
    color: '#A78BFA',
  },
];

export default function BeliefCards() {
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
              <span className="concept-keyword" style={{ color: card.color }}>{card.keyword}</span>
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

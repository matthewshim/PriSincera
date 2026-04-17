/**
 * Belief Cards — three personal conviction cards mapped to CI geometry:
 *   ○ 태도 (Attitude)  — The Orbit: 변하지 않는 순환의 자세
 *   △ 우선순위 (Priority) — Priority Prism: 핵심을 끌어올리는 시선
 *   ▽ 진심 (Sincera)   — Sincera Prism: 본질을 지탱하는 토대
 */

const CARDS = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        {/* ○ The Orbit — CI의 순환의 원 */}
        <circle cx="24" cy="24" r="16" stroke="#22D3EE" strokeWidth="1.2" fill="none"
          strokeDasharray="96 4" strokeLinecap="round" opacity="0.7"/>
        <circle cx="24" cy="24" r="10" stroke="#22D3EE" strokeWidth="0.6" fill="none"
          strokeDasharray="4 4" opacity="0.3"/>
        <circle cx="24" cy="24" r="2.5" fill="#22D3EE" opacity="0.5"/>
      </svg>
    ),
    symbol: '○',
    title: '태도',
    subtitle: 'Attitude',
    quote: '기술은 변해도 태도는 남는다',
    description: '20년을 지탱해 온 힘은 도구가 아니라, 업(業)을 대하는 단단한 태도였습니다.',
    color: '#22D3EE',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        {/* △ Priority Prism — CI의 위를 향하는 프리즘 */}
        <path d="M24 8 L38 34 L10 34 Z" stroke="#C4B5FD" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
        <line x1="24" y1="16" x2="24" y2="30" stroke="#E9D5FF" strokeWidth="0.8" opacity="0.4"/>
        <circle cx="24" cy="12" r="1.5" fill="#C4B5FD" opacity="0.6"/>
      </svg>
    ),
    symbol: '△',
    title: '우선순위',
    subtitle: 'Priority',
    quote: '혼돈 속에서도 핵심을 찾는다',
    description: '수많은 과제 사이에서 비전의 방향을 정돈하는 것, 그것이 우선순위입니다.',
    color: '#C4B5FD',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        {/* ▽ Sincera Prism — CI의 아래를 지탱하는 프리즘 */}
        <path d="M24 40 L10 14 L38 14 Z" stroke="#A78BFA" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
        <circle cx="24" cy="26" r="3" fill="#F0ABFC" opacity="0.2"/>
        <circle cx="24" cy="26" r="1.5" fill="#FFFFFF" opacity="0.8"/>
      </svg>
    ),
    symbol: '▽',
    title: '진심',
    subtitle: 'Sincera',
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

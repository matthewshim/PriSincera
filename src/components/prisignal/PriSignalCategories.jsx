/**
 * PriSignal Categories — ③ Content categories section.
 */
const categories = [
  {
    icon: '🎯',
    name: 'Attitude',
    desc: '리더십, 조직 문화, 일하는 태도에 대한 시그널',
    color: '#C4B5FD',
  },
  {
    icon: '⚡',
    name: 'Priority',
    desc: '우선순위 결정, 전략적 사고, 의사결정 프레임워크',
    color: '#22D3EE',
  },
  {
    icon: '🤖',
    name: 'AI & Future',
    desc: 'AI 트렌드, 자동화, 미래 기술이 바꾸는 일의 방식',
    color: '#A78BFA',
  },
  {
    icon: '🌍',
    name: 'Global Lens',
    desc: '글로벌 비즈니스 인사이트, 문화 간 차이, 해외 사례',
    color: '#34D399',
  },
  {
    icon: '📦',
    name: 'Product Craft',
    desc: '프로덕트 매니지먼트, UX, 그로스 전략의 실전 노하우',
    color: '#FDE68A',
  },
];

export default function PriSignalCategories() {
  return (
    <section className="prisignal-section prisignal-categories" id="priSignalCategories">
      <div className="prisignal-section-inner">
        <h2 className="prisignal-categories-title">다루는 <span className="accent">시그널</span></h2>
        <div className="prisignal-categories-grid">
          {categories.map((cat, i) => (
            <div
              className="prisignal-category-card"
              key={i}
              style={{ '--cat-color': cat.color }}
            >
              <div className="prisignal-category-header">
                <span className="prisignal-category-icon">{cat.icon}</span>
                <span className="prisignal-category-name">{cat.name}</span>
              </div>
              <p className="prisignal-category-desc">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Signal Value Proposition — ② Why subscribe section.
 */
const values = [
  {
    icon: '📡',
    title: '시그널만 포착',
    desc: '35개 글로벌 소스에서 매일 수집된 수백 개의 글 중, SIGNAL 6항목 AI 평가로 진짜 시그널만 포착합니다.',
  },
  {
    icon: '✍️',
    title: '20년차 PO의 시선',
    desc: '단순 링크 모음이 아닙니다. 20년의 실무 경험이 녹아든 기준과 시선으로, 왜 이 글을 읽어야 하는지 코멘트합니다.',
  },
  {
    icon: '⏱️',
    title: '5분이면 충분',
    desc: '바쁜 월요일 아침, 커피 한 잔과 함께 5분이면 한 주의 시그널을 파악할 수 있습니다.',
  },
];

export default function PriSignalValue() {
  return (
    <div className="prisignal-intro-wrapper">
      {/* ── 1. Intro / Vision Section ── */}
      <section className="prisignal-section prisignal-intro">
        <div className="prisignal-section-inner">
          <div className="prisignal-intro-content">
            <h1 className="prisignal-intro-quote">
              "수많은 정보 속에서 길을 잃지 않도록,<br/>진짜 필요한 시그널만 포착합니다."
            </h1>
            <p className="prisignal-intro-desc">
              바쁜 실무자를 위한 <strong>고밀도 인사이트 큐레이션</strong>.<br/>
              20년차 PO의 시선과 AI의 분석으로 매일 아침 성장을 위한 시그널을 배달합니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Value Proposition ── */}
      <section className="prisignal-section prisignal-value" id="priSignalValue">
        <div className="prisignal-section-inner">
          <h2 className="prisignal-value-title">왜 <span className="accent">Signal</span>인가?</h2>
          <div className="prisignal-value-grid">
            {values.map((v, i) => (
              <div className="prisignal-value-card" key={i}>
                <div className="prisignal-value-card-icon">{v.icon}</div>
                <div className="prisignal-value-card-title">{v.title}</div>
                <p className="prisignal-value-card-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

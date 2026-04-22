/**
 * PriSignal SIGNAL Criteria — ③-b Selection criteria section.
 * Shows how articles are scored using the S.I.G.N.A.L. framework.
 */
const signals = [
  {
    letter: 'S',
    word: 'Substance',
    desc: '깊이 있는 인사이트가 있는가',
    weight: 3,
    color: '#C4B5FD',
  },
  {
    letter: 'I',
    word: 'Impact',
    desc: '독자의 업무에 실제 영향을 줄 수 있는가',
    weight: 3,
    color: '#A78BFA',
  },
  {
    letter: 'G',
    word: 'Gap',
    desc: '다른 뉴스레터가 다루지 않는 시각인가',
    weight: 2,
    color: '#22D3EE',
  },
  {
    letter: 'N',
    word: 'Now',
    desc: '이번 주에 읽어야 의미 있는 글인가',
    weight: 2,
    color: '#67E8F9',
  },
  {
    letter: 'A',
    word: 'Actionable',
    desc: '바로 적용할 수 있는 것이 있는가',
    weight: 1,
    color: '#34D399',
  },
  {
    letter: 'L',
    word: 'Lens',
    desc: 'PriSincera의 시선으로 코멘트할 관점이 있는가',
    weight: 3,
    color: '#FDE68A',
  },
];

export default function PriSignalSignal() {
  return (
    <section className="prisignal-section prisignal-signal" id="priSignalSignal">
      <div className="prisignal-section-inner">
        <h2 className="prisignal-signal-title">시그널을 고르는 <span className="accent">기준</span></h2>
        <p className="prisignal-signal-subtitle">
          매주 35개 글로벌 소스에서 수집된 수백 개의 아티클 중,<br />
          6가지 기준으로 진짜 시그널만 포착합니다.
        </p>
        <div className="prisignal-signal-grid">
          {signals.map((s, i) => (
            <div
              className="prisignal-signal-card"
              key={i}
              style={{ '--signal-color': s.color, '--signal-delay': `${i * 0.08}s` }}
            >
              <div className="prisignal-signal-letter" aria-hidden="true">{s.letter}</div>
              <div className="prisignal-signal-word">{s.word}</div>
              <p className="prisignal-signal-desc">{s.desc}</p>
              <div className="prisignal-signal-weight" aria-label={`가중치 ${s.weight}`}>
                {Array.from({ length: 3 }, (_, j) => (
                  <span
                    key={j}
                    className={`prisignal-signal-star ${j < s.weight ? 'filled' : ''}`}
                  >★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="prisignal-signal-footnote">
          각 아티클은 이 6가지 기준에 따라 AI가 자동 평가하고,<br />
          채널 신뢰등급(Tier 1·2·3) 가중치와 결합하여 최종 선정됩니다.
        </p>
      </div>
    </section>
  );
}

/**
 * PriSignal Value Proposition — ② Why subscribe section.
 */
const values = [
  {
    icon: '📡',
    title: '시그널만 포착',
    desc: '매주 수백 개의 글 중 진짜 의미 있는 시그널만 골라냅니다. 노이즈에 시간을 낭비하지 마세요.',
  },
  {
    icon: '✍️',
    title: '20년차 PO의 시선',
    desc: '단순 링크 모음이 아닙니다. 기획자의 경험과 맥락이 담긴 에디터 코멘트가 핵심입니다.',
  },
  {
    icon: '⏱️',
    title: '5분이면 충분',
    desc: '바쁜 월요일 아침, 커피 한 잔과 함께 5분이면 한 주의 시그널을 파악할 수 있습니다.',
  },
];

export default function PriSignalValue() {
  return (
    <section className="prisignal-section prisignal-value" id="priSignalValue">
      <div className="prisignal-section-inner">
        <h2 className="prisignal-value-title">왜 PriSignal인가?</h2>
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
  );
}

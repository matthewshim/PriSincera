/**
 * Belief intro — narrative title and lead copy (left column).
 * Personal philosophy opener, not CI symbol documentation.
 */
export default function BeliefIntro() {
  return (
    <div className="philosophy-text">
      <h2 className="philosophy-title reveal-item" style={{ '--reveal-delay': '0.1s' }}>
        <span className="title-line">복잡함 속에서,</span>
        <span className="title-line accent">별은 만들어집니다.</span>
      </h2>
      <p className="philosophy-lead reveal-item" style={{ '--reveal-delay': '0.3s' }}>
        흩어진 빛은 아직 별이 아닙니다.
      </p>
      <p className="philosophy-lead reveal-item" style={{ '--reveal-delay': '0.45s' }}>
        수많은 과제와 가능성 사이에서,
        방향을 찾는 순간 — 비로소 빛은 별이 됩니다.
      </p>
      <p className="philosophy-lead reveal-item" style={{ '--reveal-delay': '0.6s' }}>
        Waterfall에서 Agile로, 웹에서 AI로 —
        강산이 두 번 변하는 동안 도구는 끊임없이 변했지만,
        20년의 여정에서 발견한 본질은 결국 하나였습니다.
      </p>
    </div>
  );
}


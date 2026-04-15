/**
 * Philosophy intro — narrative title and lead copy (left column).
 */
export default function PhilosophyIntro() {
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
        PriSincera는 두 개의 프리즘 — <strong>우선순위(Pri)</strong>와 <strong>진심(Sincera)</strong> — 을 겹쳐
        하나의 별을 만듭니다. 그리고 이 별을 감싸는 <strong>순환의 원(Orbit)</strong>이
        비전과 신뢰를 끊임없이 순환시키며 진정한 조화를 이룹니다.
      </p>
    </div>
  );
}

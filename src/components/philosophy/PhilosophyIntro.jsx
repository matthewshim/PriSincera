/**
 * Belief intro — narrative title, lead copy, and brand declaration (left column).
 * Personal philosophy opener with concluding brand statement.
 */
export default function BeliefIntro() {
  return (
    <div className="philosophy-text">
      <h2 className="philosophy-title reveal-item" style={{ '--reveal-delay': '0.1s' }}>
        <span className="title-line">발 아래 꽃,</span>
        <span className="title-line accent">먼 곳의 별.</span>
      </h2>
      <p className="philosophy-lead reveal-item" style={{ '--reveal-delay': '0.3s' }}>
        먼 곳의 별을 좇느라,
        <br/>
        지금 내 발 아래 피어난 아름다운 꽃을 놓치지 않기를.
      </p>
      <p className="philosophy-lead reveal-item" style={{ '--reveal-delay': '0.45s' }}>
        수많은 과제와 도구의 변화 속에서도,
        <br/>
        현재의 문제에 몰입하는 단단한 태도(Attitude)가
        <br/>
        결국 올바른 미래의 방향을 완성합니다.
      </p>
      <p className="philosophy-lead reveal-item" style={{ '--reveal-delay': '0.6s' }}>
        20년의 여정에서 발견한 변하지 않는 본질,
      </p>
      <div className="belief-declaration reveal-item" style={{ '--reveal-delay': '0.8s' }}>
        <p className="declaration-text">
          진심을 가장 우선순위에 둔다 —<br/>
          이것이 <strong>PriSincera</strong>입니다.
        </p>
      </div>
    </div>
  );
}


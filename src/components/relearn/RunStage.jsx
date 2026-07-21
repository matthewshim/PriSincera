/**
 * RunStage — ② 실행 스테이지 (주간 궤도) — ReLearn 셸에서 분리한 프레젠테이션 컴포넌트 (백로그 1-3 리팩터)
 * 상태·핸들러는 ReLearn 셸이 소유하고 props로 주입한다 (데이터 원칙 §3 유지).
 */
import OrbitSection from './OrbitSection';

export default function RunStage({
  user, loginWithGoogle, paceLoading, current, affinity,
  handleToggle, handleAccept, handleAddCustom, handleExclude, handleRestore,
}) {
  return (
            <section className="rl-stage s2">
              <div className="rl-marker" aria-hidden="true">⛵</div>
              <div className="rl-body" id="rl-run">
                <div className="rl-stage-head"><span className="rl-stage-no">STAGE 02</span><h2 className="rl-stage-title">실행 — 이번 주 궤도</h2></div>
                <p className="rl-stage-desc">배움에서 추가한 액션이 오늘 할 일이 됩니다.</p>
                {!user ? (
                  <div className="rl-login-cta">
                    <p>실행의 궤도는 로그인 후 나만의 기록으로 관리됩니다.</p>
                    <button className="rl-login-btn haptic-trigger" onClick={loginWithGoogle}>나의 페이스 만들기</button>
                  </div>
                ) : paceLoading ? (
                  <div className="rl-status">궤도 불러오는 중…</div>
                ) : (
                  <OrbitSection current={current} onToggle={handleToggle} onAccept={handleAccept} onAdd={handleAddCustom} onExclude={handleExclude} onRestore={handleRestore} affinity={affinity} />
                )}
              </div>
            </section>
  );
}

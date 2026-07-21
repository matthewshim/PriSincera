/**
 * ReflectStage — ③ 복기 스테이지 (항해 일지) — ReLearn 셸에서 분리한 프레젠테이션 컴포넌트 (백로그 1-3 리팩터)
 * 상태·핸들러는 ReLearn 셸이 소유하고 props로 주입한다 (데이터 원칙 §3 유지).
 */
import ReflectionSection from './ReflectionSection';

export default function ReflectStage({ user, loginWithGoogle, statement, handleReflectSave }) {
  return (
            <section className="rl-stage s3">
              <div className="rl-marker" aria-hidden="true">📝</div>
              <div className="rl-body" id="rl-reflect">
                <div className="rl-stage-head"><span className="rl-stage-no">STAGE 03</span><h2 className="rl-stage-title">복기 — 항해 일지</h2></div>
                <p className="rl-stage-desc">오늘의 실행을 한 줄로. 이 기록이 내일의 배움과 추천을 바꿉니다.</p>
                {!user ? (
                  <div className="rl-login-cta">
                    <p>복기는 로그인 후 주간 항해 일지로 저장됩니다.</p>
                    <button className="rl-login-btn haptic-trigger" onClick={loginWithGoogle}>나의 페이스 만들기</button>
                  </div>
                ) : (
                  <ReflectionSection statement={statement} onSave={handleReflectSave} />
                )}
              </div>
            </section>
  );
}

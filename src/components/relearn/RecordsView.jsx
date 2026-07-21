/**
 * RecordsView — 기록 뷰 (주차별 실행·복기 아카이브 + .md 내보내기) — ReLearn 셸에서 분리한 프레젠테이션 컴포넌트 (백로그 1-3 리팩터)
 * 상태·핸들러는 ReLearn 셸이 소유하고 props로 주입한다 (데이터 원칙 §3 유지).
 */
import { trackRelearn } from './funnel';

export default function RecordsView({ user, loginWithGoogle, paceLoading, records, todayStr }) {
  // 기록 내보내기(.md) — PaceNote 포트폴리오 내보내기의 리런 자체화
  const exportRecords = () => {
    const tt = (v) => (typeof v === 'object' ? v.ko : v);
    const lines = ['# ReLearn 항해 기록 (Voyage Log)', '', `내보낸 날짜: ${todayStr}`, ''];
    records.forEach(w => {
      lines.push(`## ${w.weekId}${w.startDate ? ` (${w.startDate} – ${w.endDate || ''})` : ''}${w.inProgress ? ' · 진행 중' : ''}`);
      const done = w.tasks || [];
      lines.push(`완료한 궤도 ${done.length}개${w.total ? ` / 전체 ${w.total}개` : ''}`);
      done.forEach(t2 => lines.push(`- [x] ${tt(t2.title)}`));
      if (done.length === 0) lines.push('- (완료된 궤도 없음)');
      lines.push('', '### 복기', w.statement ? `> ${w.statement}` : '> (회고 없음)', '');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `relearn-voyage-log-${todayStr}.md`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    trackRelearn('relearn_export_records');
  };

  return (
        <section className="rl-records" aria-label="항해 기록">
          {!user ? (
            <div className="rl-login-cta">
              <p>항해 기록은 로그인 후 나만의 아카이브로 쌓입니다.</p>
              <button className="rl-login-btn haptic-trigger" onClick={loginWithGoogle}>나의 페이스 만들기</button>
            </div>
          ) : paceLoading ? (
            <div className="rl-status">기록 불러오는 중…</div>
          ) : records.length === 0 ? (
            <div className="rl-status">아직 기록이 없어요 — 오늘 뷰에서 첫 궤도를 완료해 보세요.</div>
          ) : (
            <>
              <div className="rl-rec-toolbar">
                <button className="rl-expand-btn" onClick={exportRecords}>📥 기록 내보내기 (.md)</button>
              </div>
              {records.map(w => (
              <article key={w.weekId} className="rl-card rl-rec-week">
                <div className="rl-rec-head">
                  <span className="rl-rec-id">{w.weekId}</span>
                  {w.startDate && <span className="rl-rec-range">{w.startDate}{w.endDate ? ` – ${w.endDate}` : ''}</span>}
                  {w.inProgress && <span className="rl-rec-badge">진행 중</span>}
                  <span className="rl-rec-count">
                    {w.inProgress ? `${w.tasks.length}/${w.total} 완료` : `완료 ${w.tasks.length}개`}
                  </span>
                </div>
                {w.tasks.map(task => (
                  <div key={task.id} className="rl-rec-done">
                    <span className="rl-rec-mk">✓</span>
                    <span className="rl-rec-t">{typeof task.title === 'object' ? task.title.ko : task.title}</span>
                    {task.category && (
                      <span className="rl-orbit-cat" style={{ color: task.color || 'var(--color-indigo)', background: 'rgba(255,255,255,0.05)' }}>
                        {task.category}
                      </span>
                    )}
                  </div>
                ))}
                {w.tasks.length === 0 && <div className="rl-rec-none">완료된 궤도가 아직 없어요.</div>}
                {w.statement
                  ? <div className="rl-rec-reflect"><span className="rl-rec-lb">복기</span>{w.statement}</div>
                  : <div className="rl-rec-noreflect">이 주는 회고가 남지 않았어요.</div>}
              </article>
              ))}
            </>
          )}
        </section>
  );
}

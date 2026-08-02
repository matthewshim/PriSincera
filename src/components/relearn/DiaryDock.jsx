/**
 * DiaryDock — 일기장 (교재/일기장 분리 재편, 오너 환류 2026-07-27)
 *
 * 날짜 뷰의 본문은 그 날짜의 "교재"(배움 콘텐츠)만 담고, 실행·복기는 여기서 다룬다:
 *   · 오늘   → 궤도 추가·완료·회고 관리 (OrbitSection·ReflectionSection 재사용)
 *   · 지난 날 → 기 입력한 실행·복기 열람 (일 해상도)
 *   · 전환 이전 날짜 → 그 날이 속한 주의 기록(주 해상도 레거시)으로 폴백
 * 내부는 책갈피 탭: 실행 | 복기 | (오늘) 리포트 — 각 탭은 전부 펼침.
 * 레이아웃: 데스크톱은 2분할 우측 컬럼(sticky), 모바일은 하단 도크(탭하면 시트).
 */
import { useState, useEffect } from 'react';
import OrbitSection from './OrbitSection';
import ReflectionSection from './ReflectionSection';
import LoopReport from '../pacenote/LoopReport';
import { trackRelearn } from './funnel';

const tt = (v) => (typeof v === 'object' ? v.ko : v);

export default function DiaryDock({
  isToday, date, user, token, loginWithGoogle, paceLoading,
  current, timeline, profile, affinity,
  onToggle, onAccept, onAddCustom, onExclude, onRestore, onReflectSave,
}) {
  const [open, setOpen] = useState(false); // 모바일 시트 확장 (데스크톱은 CSS로 상시)
  const [tab, setTab] = useState('run');   // 책갈피: run | reflect | report(오늘)
  const [pastFetched, setPastFetched] = useState(null); // 과거 날짜 per-date 페치 결과
  useEffect(() => { setTab('run'); }, [date]);

  // 과거 날짜의 기록 — 타임라인(GET / 윈도우)에서 우선 표시하되,
  // 윈도우 밖 날짜 유실을 막기 위해 per-date 엔드포인트로 확정 조회한다.
  const tlDay = !isToday ? (timeline || []).find(e => e.kind === 'day' && e.date === date) : null;
  const tlWeek = !isToday && !tlDay
    ? (timeline || []).find(e => e.kind === 'week' && e.startDate && e.endDate && e.startDate <= date && date <= e.endDate)
    : null;

  useEffect(() => {
    if (isToday || !user) { setPastFetched(null); return; }
    let cancelled = false;
    setPastFetched(null);
    const doFetch = (tok) => fetch(`/api/pacenote/day/${date}`, { headers: { Authorization: `Bearer ${tok}` } });
    (async () => {
      try {
        let res = await doFetch(token);
        if (res.status === 401) { const fresh = await user.getIdToken(true); res = await doFetch(fresh); }
        if (!res.ok) return;
        const d = await res.json();
        if (!cancelled) setPastFetched(d);
      } catch { /* 타임라인 폴백 유지 */ }
    })();
    return () => { cancelled = true; };
  }, [isToday, date, user, token]);

  // 확정 데이터(pastFetched) 우선, 페치 전엔 타임라인 폴백
  const resolved = pastFetched && pastFetched.kind !== 'none' ? pastFetched : null;
  const dayEntry = resolved?.kind === 'day' ? resolved : (!pastFetched ? tlDay : null);
  const weekEntry = resolved?.kind === 'week' ? resolved : (!pastFetched && !tlDay ? tlWeek : null);
  const pastEntry = dayEntry || weekEntry;

  const doneCount = (current?.currentPace || []).filter(t => t.completed).length;
  const totalCount = (current?.currentPace || []).filter(t => !t.excluded).length;
  const hasReflect = !!(current?.statement || '').trim();

  const summary = isToday
    ? `실행 ${doneCount}/${totalCount} · 복기 ${hasReflect ? '✓' : '—'}`
    : dayEntry
      ? `완료 ${dayEntry.tasks.length}개 · 복기 ${(dayEntry.statement || '').trim() ? '✓' : '—'}`
      : weekEntry ? '주 단위 기록' : '기록 없음';

  // 도크 헤더 탭 — 모바일 오버레이에서만 시트 토글. 데스크톱(고정 패널)에선 no-op.
  const isOverlay = () => typeof window !== 'undefined'
    && window.matchMedia && window.matchMedia('(max-width: 1023px)').matches;
  const toggleOpen = () => {
    if (!isOverlay()) return;
    setOpen(o => !o);
    if (!open) trackRelearn('relearn_dock_open', { today: isToday });
  };

  const switchTab = (k) => {
    setTab(k);
    trackRelearn('relearn_dock_tab', { tab: k });
  };

  // .md 내보내기 — 구 기록 뷰의 내보내기 승계 (오늘 + 타임라인 전체)
  const exportRecords = () => {
    const lines = ['# ReLearn 항해 기록 (Voyage Log)', '', `내보낸 날짜: ${date}`, ''];
    const rows = [];
    if (isToday && current?.date) {
      rows.push({ label: `${current.date} · 진행 중`, tasks: (current.currentPace || []).filter(t => t.completed), statement: current.statement || '' });
    }
    (timeline || []).forEach(e => rows.push({
      label: e.kind === 'day' ? e.date : `${e.weekId} (${e.startDate} – ${e.endDate})`,
      tasks: e.tasks || [], statement: e.statement || '',
    }));
    rows.forEach(r => {
      lines.push(`## ${r.label}`, `완료한 궤도 ${r.tasks.length}개`);
      r.tasks.forEach(t => lines.push(`- [x] ${tt(t.title)}`));
      if (r.tasks.length === 0) lines.push('- (완료된 궤도 없음)');
      lines.push('', '### 복기', r.statement ? `> ${r.statement}` : '> (회고 없음)', '');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `relearn-voyage-log-${date}.md`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    trackRelearn('relearn_export_records');
  };

  const ReadonlyTasks = ({ tasks }) => (
    tasks.length > 0 ? tasks.map(t => (
      <div key={t.id} className="rl-dock-done">
        <span className="rl-dock-mk">✓</span>
        <span className="rl-dock-t">{tt(t.title)}</span>
        {t.category && <span className="rl-orbit-cat" style={{ color: t.color || 'var(--color-indigo)', background: 'rgba(255,255,255,0.05)' }}>{t.category}</span>}
      </div>
    )) : <div className="rl-dock-none">완료된 궤도가 없어요.</div>
  );

  const ReadonlyReflect = ({ statement, emptyLabel }) => (
    (statement || '').trim()
      ? <div className="rl-dock-reflect">{statement}</div>
      : <div className="rl-dock-none">{emptyLabel}</div>
  );

  const TABS = isToday
    ? [['run', '🏃 실행'], ['reflect', '📝 복기'], ['report', '🔄 리포트']]
    : [['run', '🏃 실행'], ['reflect', '📝 복기']];

  return (
    <aside className={`rl-dock${open ? ' open' : ''}`} aria-label="일기장 — 실행과 복기">
      {/* 헤더 — 모바일에선 도크 바(탭하면 시트), 데스크톱에선 패널 타이틀 */}
      <button className="rl-dock-head haptic-trigger" onClick={toggleOpen} aria-expanded={open}>
        <span className="rl-dock-icon">✍️</span>
        <span className="rl-dock-title">{isToday ? '오늘의 일기장' : `${date}의 일기장`}</span>
        <span className="rl-dock-sum">{summary}</span>
        <span className="rl-dock-chev" aria-hidden="true">▴</span>
      </button>

      <div className="rl-dock-body">
        {!user ? (
          <div className="rl-login-cta">
            <p>일기장은 로그인 후 나만의 기록으로 관리됩니다.</p>
            <button className="rl-login-btn haptic-trigger" onClick={loginWithGoogle}>나의 루프 시작하기</button>
          </div>
        ) : paceLoading ? (
          <div className="rl-status">기록 불러오는 중…</div>
        ) : (!isToday && !pastEntry) ? (
          <div className="rl-dock-none rl-dock-empty">이 날의 실행·복기 기록이 없어요.</div>
        ) : (
          <>
            {weekEntry && (
              <div className="rl-dock-legacy-note">
                이 날짜는 주 단위 기록 시기예요 — {weekEntry.weekId} 주({weekEntry.startDate} – {weekEntry.endDate})의 기록을 보여드려요.
              </div>
            )}

            {/* 책갈피 탭 — 실행 | 복기 | (오늘) 리포트 */}
            <nav className="rl-dock-tabs" role="tablist" aria-label="일기장 책갈피">
              {TABS.map(([k, label]) => (
                <button key={k} role="tab" aria-selected={tab === k}
                  className={`rl-dock-tab${tab === k ? ' on' : ''} haptic-trigger`}
                  onClick={() => switchTab(k)}>
                  {label}
                </button>
              ))}
            </nav>

            {tab === 'run' && (
              isToday
                ? <OrbitSection current={current} onToggle={onToggle} onAccept={onAccept} onAdd={onAddCustom} onExclude={onExclude} onRestore={onRestore} affinity={affinity} />
                : <ReadonlyTasks tasks={pastEntry?.tasks || []} />
            )}
            {tab === 'reflect' && (
              isToday
                ? <ReflectionSection statement={current?.statement || ''} onSave={onReflectSave} />
                : <ReadonlyReflect statement={pastEntry?.statement}
                    emptyLabel={weekEntry ? '이 주는 회고가 남지 않았어요.' : '이 날은 회고가 남지 않았어요.'} />
            )}
            {tab === 'report' && isToday && (
              <>
                <LoopReport profile={profile} />
                <div className="rl-dock-tools">
                  <button className="rl-expand-btn haptic-trigger" onClick={exportRecords}>📥 기록 내보내기 (.md)</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

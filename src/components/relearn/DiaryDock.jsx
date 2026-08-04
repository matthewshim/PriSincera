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
import { useTranslation } from '../../contexts/LanguageContext';

const tt = (v) => (typeof v === 'object' ? v.ko : v);

export default function DiaryDock({
  isToday, date, user, token, loginWithGoogle, paceLoading,
  current, timeline, profile, affinity,
  onToggle, onAccept, onAddCustom, onExclude, onRestore, onReflectSave,
}) {
  const { t } = useTranslation();
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
    ? t('relearn.diary.summaryToday', { done: doneCount, total: totalCount, mark: hasReflect ? '✓' : '—' })
    : dayEntry
      ? t('relearn.diary.summaryDay', { n: dayEntry.tasks.length, mark: (dayEntry.statement || '').trim() ? '✓' : '—' })
      : weekEntry ? t('relearn.diary.summaryWeek') : t('relearn.diary.summaryNone');

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
    const lines = [`# ${t('relearn.diary.exportHeader')}`, '', t('relearn.diary.exportDate', { date }), ''];
    const rows = [];
    if (isToday && current?.date) {
      rows.push({ label: t('relearn.diary.exportInProgress', { date: current.date }), tasks: (current.currentPace || []).filter(p => p.completed), statement: current.statement || '' });
    }
    (timeline || []).forEach(e => rows.push({
      label: e.kind === 'day' ? e.date : `${e.weekId} (${e.startDate} – ${e.endDate})`,
      tasks: e.tasks || [], statement: e.statement || '',
    }));
    rows.forEach(r => {
      lines.push(`## ${r.label}`, t('relearn.diary.exportDoneCount', { n: r.tasks.length }));
      r.tasks.forEach(task => lines.push(`- [x] ${tt(task.title)}`));
      if (r.tasks.length === 0) lines.push(`- ${t('relearn.diary.exportNoTasks')}`);
      lines.push('', `### ${t('relearn.diary.exportReflect')}`, r.statement ? `> ${r.statement}` : `> ${t('relearn.diary.exportNoReflect')}`, '');
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
    )) : <div className="rl-dock-none">{t('relearn.diary.noDoneTasks')}</div>
  );

  const ReadonlyReflect = ({ statement, emptyLabel }) => (
    (statement || '').trim()
      ? <div className="rl-dock-reflect">{statement}</div>
      : <div className="rl-dock-none">{emptyLabel}</div>
  );

  const TABS = isToday
    ? [['run', t('relearn.diary.tabRun')], ['reflect', t('relearn.diary.tabReflect')], ['report', t('relearn.diary.tabReport')]]
    : [['run', t('relearn.diary.tabRun')], ['reflect', t('relearn.diary.tabReflect')]];

  return (
    <aside className={`rl-dock${open ? ' open' : ''}`} aria-label={t('relearn.diary.aria')}>
      {/* 헤더 — 모바일에선 도크 바(탭하면 시트), 데스크톱에선 패널 타이틀 */}
      <button className="rl-dock-head haptic-trigger" onClick={toggleOpen} aria-expanded={open}>
        <span className="rl-dock-icon">✍️</span>
        <span className="rl-dock-title">{isToday ? t('relearn.diary.title') : t('relearn.diary.titleDate', { date })}</span>
        <span className="rl-dock-sum">{summary}</span>
        <span className="rl-dock-chev" aria-hidden="true">▴</span>
      </button>

      <div className="rl-dock-body">
        {!user ? (
          <div className="rl-login-cta">
            <p>{t('relearn.diary.loginNote')}</p>
            <button className="rl-login-btn haptic-trigger" onClick={loginWithGoogle}>{t('relearn.diary.loginBtn')}</button>
          </div>
        ) : paceLoading ? (
          <div className="rl-status">{t('relearn.diary.loading')}</div>
        ) : (!isToday && !pastEntry) ? (
          <div className="rl-dock-none rl-dock-empty">{t('relearn.diary.emptyDay')}</div>
        ) : (
          <>
            {weekEntry && (
              <div className="rl-dock-legacy-note">
                {t('relearn.diary.weekLegacy', { weekId: weekEntry.weekId, start: weekEntry.startDate, end: weekEntry.endDate })}
              </div>
            )}

            {/* 책갈피 탭 — 실행 | 복기 | (오늘) 리포트 */}
            <nav className="rl-dock-tabs" role="tablist" aria-label={t('relearn.diary.ariaTabs')}>
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
                    emptyLabel={weekEntry ? t('relearn.diary.emptyReflectWeek') : t('relearn.diary.emptyReflectDay')} />
            )}
            {tab === 'report' && isToday && (
              <>
                <LoopReport profile={profile} />
                <div className="rl-dock-tools">
                  <button className="rl-expand-btn haptic-trigger" onClick={exportRecords}>{t('relearn.diary.export')}</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

/**
 * ReLearn — 배움·실행·복기 통합 성장 루프 (Phase B 셸)
 *
 * 추가형 통합: 기존 /daily·/pacenote 는 그대로 두고, 추출/신작 컴포넌트를
 * 하나의 여정(3-stage)으로 조합한다. (docs/relearn/product_strategy.md)
 *
 * 데이터 원칙(§3): 콘텐츠는 글로벌(오늘의 daily JSON), 사용자 상태는
 * usePaceNoteData + profile 을 셸 레벨에서 1회 페치해 하위로 주입한다.
 */
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import useSEO from '../hooks/useSEO';
import { PAGE_META } from '../data/seoMeta.mjs';
import usePaceNoteData from '../hooks/usePaceNoteData';
import LoopReport from '../components/pacenote/LoopReport';
import { trackRelearn } from '../components/relearn/funnel';
import LearnStage from '../components/relearn/LearnStage';
import RunStage from '../components/relearn/RunStage';
import ReflectStage from '../components/relearn/ReflectStage';
import RecordsView from '../components/relearn/RecordsView';
import './ReLearn.css';

const todayKST = () => new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

// 배움 채널 → 궤도 연결 (v1.3 매핑 — 트랙 외 3채널은 /add 커스텀 궤도 재사용)
const CHANNEL_ORBITS = {
  signal: '오늘의 시그널 아티클 정독하고 메모 남기기',
  prompt: '오늘의 AI 프롬프트 직접 실행해보기',
  jp: '오늘의 비즈니스 일본어 문장 소리 내어 3번 읽기',
};

export default function ReLearn() {
  const { user, token, loginWithGoogle, logout } = useAuth();
  const { data, loading: paceLoading, toggleTask, acceptTask, saveDiary, addTask, excludeTask, restoreTask } = usePaceNoteData();

  useSEO({
    title: PAGE_META['/relearn'].pageTitle,
    description: PAGE_META['/relearn'].description,
    keywords: PAGE_META['/relearn'].keywords,
    ogUrl: 'https://www.prisincera.com/relearn',
  });

  const [view, setView] = useState('today');            // today | records
  // 온보딩(Phase C): 첫 방문 1-스텝 안내 — 닫으면 다시 안 보임
  const [showOnboard, setShowOnboard] = useState(() => {
    try { return !localStorage.getItem('relearn_onboarded_v1'); } catch { return false; }
  });
  const dismissOnboard = () => {
    setShowOnboard(false);
    try { localStorage.setItem('relearn_onboarded_v1', '1'); } catch { /* 무시 */ }
  };
  // 배움 4채널은 연속 스택으로 렌더하고, 좌측 2뎁스는 스크롤스파이 책갈피로 현재 위치를 하이라이트한다.
  const [channel, setChannel] = useState('track');
  const [daily, setDaily] = useState(null);             // 오늘의 daily JSON (signal+study)
  const [dailyError, setDailyError] = useState(null);
  const [profile, setProfile] = useState(null);         // 셸 1회 페치 → 하위 주입
  const date = todayKST();

  // 헤더(GNB) 노출을 위한 hero-ready 클래스 제어 — 타 페이지와 동일 패턴
  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => {
      document.body.classList.remove('hero-ready');
    };
  }, []);

  // ── 오늘의 글로벌 콘텐츠 (공개 — 비로그인도 배움 제공) ──
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/daily/${date}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(r.status === 404 ? '오늘의 다이제스트가 아직 준비 중입니다.' : `불러오기 실패 (${r.status})`)))
      .then(d => { if (!cancelled) setDaily(d); })
      .catch(e => { if (!cancelled) setDailyError(e.message); });
    return () => { cancelled = true; };
  }, [date]);

  // ── 성장 프로파일 (셸 1회 페치 → LoopReport·TrackSignalFeed·OrbitSection 주입) ──
  useEffect(() => {
    if (!user) { setProfile(null); return; }
    let cancelled = false;
    const doFetch = (tok) => fetch('/api/pacenote/profile', { headers: { Authorization: `Bearer ${tok}` } });
    (async () => {
      try {
        let res = await doFetch(token);
        if (res.status === 401) { const fresh = await user.getIdToken(true); res = await doFetch(fresh); }
        if (!res.ok) return;
        const d = await res.json();
        if (!cancelled) setProfile(d);
      } catch { /* 무시 */ }
    })();
    return () => { cancelled = true; };
  }, [user, token]);

  const affinity = profile?.domainAffinity || null;

  // ── 이메일 구독 (문맥 CTA — 배움 하단): 로그인 유저 & 미구독일 때만 노출 ──
  // 해지·관리 풀 UX는 /daily 위임 (부정 액션을 신규 서비스 전면에 두지 않음)
  const [subState, setSubState] = useState('unknown'); // unknown|unsubscribed|subscribed|loading|done|error
  useEffect(() => {
    if (!user?.email) { setSubState('unknown'); return; }
    let cancelled = false;
    fetch(`/api/subscribe/check?email=${encodeURIComponent(user.email)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!cancelled && d) setSubState(d.subscribed ? 'subscribed' : 'unsubscribed'); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user]);

  // P2(일몰 게이트): 구독 해지 자체화 — /daily 위임 제거
  const handleUnsubscribe = async () => {
    if (!user?.email || subState === 'loading') return;
    if (!window.confirm('데일리 메일 구독을 해지할까요?')) return;
    setSubState('loading');
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_address: user.email }),
      });
      setSubState(res.ok ? 'unsubscribed' : 'error');
    } catch {
      setSubState('error');
    }
  };

  // P3(일몰 게이트): 경량 아카이브 — 날짜 리스트만 리런이 제공, 상세는 /daily/:date(영구 보존 URL)로
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveDates, setArchiveDates] = useState(null);
  const toggleArchive = async () => {
    const next = !archiveOpen;
    setArchiveOpen(next);
    if (next && archiveDates === null) {
      try {
        const res = await fetch('/api/daily/index');
        const d = res.ok ? await res.json() : null;
        setArchiveDates((d?.dates || []).slice(0, 14));
      } catch {
        setArchiveDates([]);
      }
    }
  };

  const handleSubscribe = async () => {
    if (!user?.email || subState === 'loading') return;
    setSubState('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_address: user.email }),
      });
      const d = await res.json();
      if (res.ok) trackRelearn('relearn_subscribe');
      setSubState(res.ok ? (d.code === 'already_subscribed' ? 'subscribed' : 'done') : 'error');
    } catch {
      setSubState('error');
    }
  };

  // ── 채널 '궤도로' (v1.3): 이미 이번 주에 동일 제목이 있으면 '추가됨' ──
  const [addedCh, setAddedCh] = useState({});
  const paceTitles = useMemo(
    () => new Set((data?.current?.currentPace || []).map(t => (typeof t.title === 'object' ? t.title.ko : t.title))),
    [data]
  );
  const chState = (key) => (addedCh[key] || paceTitles.has(CHANNEL_ORBITS[key]) ? 'added' : addedCh[key] === 'adding' ? 'adding' : 'idle');
  const addChannelOrbit = async (key) => {
    if (!user) { alert('실행의 궤도에 추가하려면 로그인이 필요합니다.'); return; }
    if (chState(key) !== 'idle') return;
    setAddedCh(s => ({ ...s, [key]: 'adding' }));
    try {
      await addTask(CHANNEL_ORBITS[key]);
      trackRelearn('relearn_orbit_add', { source: key });
      setAddedCh(s => ({ ...s, [key]: 'added' }));
    } catch (e) {
      console.error('[ReLearn] 채널 궤도 추가 실패:', e);
      setAddedCh(s => ({ ...s, [key]: undefined }));
    }
  };

  const ChannelOrbitBtn = ({ ch }) => {
    const st = chState(ch);
    return (
      <button
        className={`rl-mini-orbit haptic-trigger ${st === 'added' ? 'added' : ''}`}
        onClick={() => addChannelOrbit(ch)}
        disabled={st !== 'idle'}
        title={CHANNEL_ORBITS[ch]}
      >
        {st === 'added' ? '✓ 실행의 궤도에 추가됨' : st === 'adding' ? '추가 중…' : '＋ 실행의 궤도에 추가'}
      </button>
    );
  };

  // ── 기록 뷰 데이터: 현재 주(진행 중) + timeline (기존 PaceNote GET / 재사용) ──
  const records = useMemo(() => {
    if (!data) return [];
    const cur = data.current;
    const rows = [];
    if (cur?.weekId) {
      rows.push({
        weekId: cur.weekId,
        startDate: cur.startDate,
        endDate: cur.endDate,
        inProgress: true,
        total: (cur.currentPace || []).length,
        tasks: (cur.currentPace || []).filter(t => t.completed),
        statement: cur.statement || '',
      });
    }
    (data.timeline || []).forEach(w => rows.push({
      weekId: w.weekId, startDate: w.startDate, endDate: w.endDate,
      inProgress: false, total: null,
      tasks: w.tasks || [], statement: w.statement || '',
    }));
    return rows;
  }, [data]);

  const study = daily?.study;

  // 채널 책갈피 클릭 = 해당 채널 섹션으로 앵커 스크롤 (콘텐츠는 항상 연속 스택)
  const selectChannel = (key) => {
    setChannel(key);
    trackRelearn('relearn_channel_select', { channel: key });
    document.querySelector(`[data-rl-ch="${key}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── 레일 스크롤스파이(책갈피) ──
  // ① 스테이지 감지: ②실행·③복기 구간에서는 배움 2뎁스 비노출
  // ② 채널 감지: 기준선(뷰포트 상단 260px)을 지난 마지막 채널 섹션을 활성 표시
  //    — 콘텐츠 교체/강제 스크롤 없음: 내리면 다음, 올리면 이전 책갈피가 자연히 켜진다
  const [subnavOn, setSubnavOn] = useState(true);
  useEffect(() => {
    if (view !== 'today') return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const runTop = document.getElementById('rl-run')?.getBoundingClientRect().top ?? Infinity;
        const refTop = document.getElementById('rl-reflect')?.getBoundingClientRect().top ?? Infinity;
        let stage = 1;
        if (refTop <= 200) stage = 3;
        else if (runTop <= 200) stage = 2;
        // ①구간이면서, 스티키 그룹(마커+2뎁스 ≈ 340px @top120)이 머물 세로 공간이
        // 남아 있을 때만 2뎁스 노출 — 스테이지 경계에서 다음 마커와 겹쳐 보이는 구간 방지
        const learnBottom = document.getElementById('rl-learn')?.getBoundingClientRect().bottom ?? 0;
        setSubnavOn(stage === 1 && learnBottom > 430);
        let act = null;
        document.querySelectorAll('[data-rl-ch]').forEach(s => {
          if (s.getBoundingClientRect().top <= 260) act = s.dataset.rlCh;
        });
        if (act) setChannel(prev => (prev === act ? prev : act));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [view]);

  // ── GA4 퍼널 (Phase D): learn_view → orbit_add → complete_toggle → reflect_save ──
  useEffect(() => { trackRelearn('relearn_learn_view'); }, []);
  const openView = (v) => {
    setView(v);
    if (v === 'records') trackRelearn('relearn_view_records');
  };
  const handleExclude = async (taskId) => {
    const r = await excludeTask(taskId);
    trackRelearn('relearn_orbit_exclude');
    return r;
  };
  const handleRestore = async (taskId) => {
    const r = await restoreTask(taskId);
    trackRelearn('relearn_orbit_restore');
    return r;
  };
  const handleToggle = async (taskId) => {
    const r = await toggleTask(taskId);
    trackRelearn('relearn_complete_toggle');
    return r;
  };
  const handleAccept = async (taskId) => {
    const r = await acceptTask(taskId);
    trackRelearn('relearn_orbit_add', { source: 'recommend' });
    return r;
  };
  const handleAddCustom = async (title) => {
    const r = await addTask(title);
    trackRelearn('relearn_orbit_add', { source: 'custom' });
    return r;
  };
  const handleReflectSave = async (text) => {
    const r = await saveDiary(text);
    trackRelearn('relearn_reflect_save');
    return r;
  };

  return (
    <div className="rl-page">
      {/* ── 히어로 ── */}
      <header className="rl-hero">
        <div className="rl-hero-icon">🪐</div>
        <h1 className="rl-hero-title">ReLearn</h1>
        <p className="rl-hero-tagline">
          매일 제로에서, 다시 배우고 다시 달린다
          <br />
          Learn from zero, run again.
        </p>
        <div className="rl-hero-chips" aria-label="루프 3단계">
          <span className="rl-hero-chip c1">① 배움 · Learn</span>
          <span className="rl-hero-arrow">→</span>
          <span className="rl-hero-chip c2">② 실행 · Run</span>
          <span className="rl-hero-arrow">→</span>
          <span className="rl-hero-chip c3">③ 복기 · Reflect</span>
        </div>
        {/* 히어로 CTA는 단 1개(우선순위 원칙): 비로그인 시 로그인 유도. 구독은 배움 하단 문맥 CTA로 분리 */}
        {!user && (
          <button className="rl-hero-cta haptic-trigger" onClick={() => { trackRelearn('relearn_login_cta'); loginWithGoogle(); }}>
            나의 루프 시작하기 — Google로 로그인
          </button>
        )}
      </header>

      {/* ── 온보딩 (첫 방문 1-스텝) ── */}
      {showOnboard && (
        <div className="rl-onboard-banner" role="note">
          <span className="rl-onboard-icon">🔄</span>
          <span className="rl-onboard-text">
            <strong>ReLearn이 처음이신가요?</strong> 하루가 하나의 루프입니다 — ①에서 <b>배우고</b>, 마음에 든 액션을 <b>궤도로</b> 보내 ②에서 <b>완료</b>하고, ③에서 <b>한 줄 복기</b>. 이 기록이 내일의 배움을 바꿉니다.
          </span>
          <button className="rl-onboard-close haptic-trigger" onClick={dismissOnboard} aria-label="안내 닫기">알겠어요 ✕</button>
        </div>
      )}

      {/* ── 뷰 전환: 오늘 | 기록 ── */}
      <nav className="rl-view-tabs" aria-label="리런 뷰 전환">
        <button className={`rl-view-tab ${view === 'today' ? 'on' : ''}`} onClick={() => openView('today')}>오늘</button>
        <button className={`rl-view-tab ${view === 'records' ? 'on' : ''}`} onClick={() => openView('records')}>기록</button>
      </nav>

      {/* ── 계정·구독 유틸리티 바 (로그인 시 상시 노출 — 직접 운영 가능한 관리 지점) ── */}
      {user && (
        <div className="rl-account" aria-label="계정 및 구독 관리">
          <span className="rl-account-user" title={user.email}>👤 {user.email}</span>
          <span className="rl-account-right">
            {subState === 'unknown' && <span className="rl-account-sub muted">구독 상태 확인 중…</span>}
            {subState === 'loading' && <span className="rl-account-sub muted">구독 처리 중…</span>}
            {subState === 'unsubscribed' && (
              <button className="rl-account-btn sub haptic-trigger" onClick={handleSubscribe}>📬 데일리 메일 구독</button>
            )}
            {(subState === 'subscribed' || subState === 'done') && (
              <>
                <span className="rl-account-sub ok">📬 구독 중</span>
                <button className="rl-account-btn ghost haptic-trigger" onClick={handleUnsubscribe}>해지</button>
              </>
            )}
            {subState === 'error' && (
              <button className="rl-account-btn err haptic-trigger" onClick={handleSubscribe}>구독 실패 — 재시도</button>
            )}
            <button className="rl-account-btn ghost haptic-trigger" onClick={logout}>로그아웃</button>
          </span>
        </div>
      )}

      {/* ── 루프 리포트 (두 뷰 공통 다리 — 클릭 시 기록 드릴다운) ── */}
      {user && (
        <div className="rl-report-wrap" onClick={() => openView('records')} role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') openView('records'); }} title="기록 보기">
          <LoopReport profile={profile} />
        </div>
      )}

      {view === 'today' ? (
        <>
          {/* 모바일 스테이지 앵커 탭 */}
          <nav className="rl-m-stage-nav" aria-label="스테이지 바로가기">
            <a className="rl-m-chip c1" href="#rl-learn">① 배움</a>
            <a className="rl-m-chip c2" href="#rl-run">② 실행</a>
            <a className="rl-m-chip c3" href="#rl-reflect">③ 복기</a>
          </nav>

          <div className="rl-stages">
            <div className="rl-rail" aria-hidden="true" />

            {/* ════ ① 배움 ════ */}
            <LearnStage
              subnavOn={subnavOn} channel={channel} selectChannel={selectChannel}
              daily={daily} dailyError={dailyError} study={study} date={date}
              user={user} affinity={affinity} ChannelOrbitBtn={ChannelOrbitBtn}
              archiveOpen={archiveOpen} archiveDates={archiveDates} toggleArchive={toggleArchive}
            />

            {/* ════ ② 실행 ════ */}
            <RunStage
              user={user} loginWithGoogle={loginWithGoogle} paceLoading={paceLoading}
              current={data?.current} affinity={affinity}
              handleToggle={handleToggle} handleAccept={handleAccept} handleAddCustom={handleAddCustom}
              handleExclude={handleExclude} handleRestore={handleRestore}
            />

            {/* ════ ③ 복기 ════ */}
            <ReflectStage
              user={user} loginWithGoogle={loginWithGoogle}
              statement={data?.current?.statement || ''} handleReflectSave={handleReflectSave}
            />
          </div>
        </>
      ) : (
        <RecordsView user={user} loginWithGoogle={loginWithGoogle} paceLoading={paceLoading} records={records} todayStr={date} />
      )}

      {/* ── 루프 닫힘 푸터 ── */}
      {view === 'today' && (
        <footer className="rl-loop-close">
          {user ? (
            <>
              <div className="rl-loop-close-t">🔄 배움 → 실행 → 복기</div>
              <div className="rl-loop-close-s">내일의 배움은 오늘의 실행을 기억합니다.</div>
            </>
          ) : (
            <>
              <div className="rl-loop-close-t">매일 제로에서 다시 시작하는 러너를 위해</div>
              <div className="rl-loop-close-s">로그인하면 배움이 실행이 되고, 실행이 다시 배움이 됩니다.</div>
            </>
          )}
        </footer>
      )}
    </div>
  );
}

/**
 * DailyView — 하나의 "날짜 뷰" = 교재(본문) + 일기장(우측 컬럼)
 *
 * 일자축 Phase 2 재편(오너 환류 2026-07-27): 교재와 일기장의 분리.
 * · 본문 2분할(§3-3 --container 내 span 8/4): 좌=교재(학습) · 우=일기장 — 모바일은 1열+하단 도크
 * · 교재는 책갈피 탭(카테고리별 구분, 전부 펼침 — 훑어보기/정독 모드 폐지)
 * · 일기장(DiaryDock)도 책갈피 탭: 실행 | 복기 | (오늘) 리포트
 * · 날짜 탐색은 상단 시간 네비(DailyWeekStrip) 하나로 일원화
 * · date param 없음 = 오늘(KST). 오늘 날짜의 /relearn/daily/:date 는 /relearn 으로 수렴
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useSEO from '../hooks/useSEO';
import { PAGE_META } from '../data/seoMeta.mjs';
import usePaceNoteData from '../hooks/usePaceNoteData';
import { trackRelearn } from '../components/relearn/funnel';
import DiaryDock from '../components/relearn/DiaryDock';
import DailyBriefing from '../components/daily/DailyBriefing';
import DailyWeekStrip from '../components/daily/DailyWeekStrip';
import SignalSection from '../components/daily/SignalSection';
import PromptSection from '../components/daily/PromptSection';
import JapaneseSection from '../components/daily/JapaneseSection';
import TrackSignalFeed from '../components/daily/TrackSignalFeed';
import './ReLearn.css';
import './ReLearnDaily.css';

const todayKST = () => new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

// 배움 채널 → 궤도 연결 (트랙 외 3채널은 /add 커스텀 궤도 재사용, 오늘만 노출)
const CHANNEL_ORBITS = {
  signal: '오늘의 시그널 아티클 정독하고 메모 남기기',
  prompt: '오늘의 AI 프롬프트 직접 실행해보기',
  jp: '오늘의 비즈니스 일본어 문장 소리 내어 3번 읽기',
};

const ZONE_META = {
  track: { icon: '🛰️', label: '테크 트랙' },
  signal: { icon: '📰', label: 'IT 시그널' },
  prompt: { icon: '🤖', label: 'AI 프롬프트' },
  jp: { icon: '🇯🇵', label: '일본어' },
};

export default function DailyView() {
  const { date: dateParam } = useParams();
  const todayStr = todayKST();
  const isToday = !dateParam;
  const validParam = isToday || /^\d{4}-\d{2}-\d{2}$/.test(dateParam);
  const redirectToday = !isToday && dateParam === todayStr; // 오늘은 /relearn 단일 URL로 수렴
  const date = isToday ? todayStr : dateParam;
  const active = validParam && !redirectToday;

  const { user, token, loginWithGoogle, logout } = useAuth();
  const { data, loading: paceLoading, toggleTask, acceptTask, saveDiary, addTask, excludeTask, restoreTask } = usePaceNoteData();

  useSEO(isToday ? {
    title: PAGE_META['/relearn'].pageTitle,
    description: PAGE_META['/relearn'].description,
    keywords: PAGE_META['/relearn'].keywords,
    ogUrl: 'https://www.prisincera.com/relearn',
  } : {
    title: `${date} Daily Digest — ReLearn`,
    description: `${date} 데일리 다이제스트 아카이브 — IT 시그널·테크 트랙·AI 프롬프트·비즈니스 일본어 전체 기록.`,
    keywords: 'PriSincera, ReLearn, 데일리 다이제스트, 아카이브',
    ogUrl: `https://www.prisincera.com/relearn/daily/${date}`,
  });

  // ── 교재(그 날짜의 배움 콘텐츠) ──
  const [daily, setDaily] = useState(null);
  const [dailyError, setDailyError] = useState(null);
  const [dates, setDates] = useState(null);           // 아카이브 전체 날짜(최신순) — 시간 네비 공용
  const [activeCh, setActiveCh] = useState('track');  // 책갈피 탭 — 카테고리별 전부 펼침

  // ── 오늘 전용 ──
  const [profile, setProfile] = useState(null);       // 셸 1회 페치 → DiaryDock·TrackSignalFeed 주입
  const [subState, setSubState] = useState('unknown');
  const [addedCh, setAddedCh] = useState({});

  // 헤더(GNB) 노출을 위한 hero-ready 클래스 제어 — 타 페이지와 동일 패턴
  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => document.body.classList.remove('hero-ready');
  }, []);

  // ── 그 날짜의 글로벌 콘텐츠 (공개 — 비로그인도 배움 제공) ──
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setDaily(null); setDailyError(null); setActiveCh('track');
    fetch(`/api/daily/${date}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(
        r.status === 404
          ? (isToday ? '오늘의 다이제스트가 아직 준비 중입니다.' : '해당 날짜의 다이제스트가 없습니다.')
          : `불러오기 실패 (${r.status})`)))
      .then(d => { if (!cancelled) setDaily(d); })
      .catch(e => { if (!cancelled) setDailyError(e.message); });
    return () => { cancelled = true; };
  }, [date, active, isToday]);

  // ── 아카이브 날짜 인덱스 (시간 네비 — 유일한 날짜 탐색 축) ──
  useEffect(() => {
    let cancelled = false;
    fetch('/api/daily/index')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!cancelled) setDates(d?.dates || []); })
      .catch(() => { if (!cancelled) setDates([]); });
    return () => { cancelled = true; };
  }, []);

  // ── 성장 프로파일 (오늘 셸 1회 페치 → DiaryDock·TrackSignalFeed 주입) ──
  useEffect(() => {
    if (!isToday || !user) { setProfile(null); return; }
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
  }, [isToday, user, token]);

  const affinity = profile?.domainAffinity || null;

  // ── 이메일 구독 (오늘 뷰 계정 바) ──
  useEffect(() => {
    if (!isToday || !user?.email) { setSubState('unknown'); return; }
    let cancelled = false;
    fetch(`/api/subscribe/check?email=${encodeURIComponent(user.email)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!cancelled && d) setSubState(d.subscribed ? 'subscribed' : 'unsubscribed'); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isToday, user]);

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

  // ── 채널 '궤도로' (오늘만): 이미 오늘 궤도에 동일 제목이 있으면 '추가됨' ──
  const paceTitles = useMemo(
    () => new Set((data?.current?.currentPace || []).map(t => (typeof t.title === 'object' ? t.title.ko : t.title))),
    [data]
  );
  const chState = (key) => (addedCh[key] || paceTitles.has(CHANNEL_ORBITS[key]) ? 'added' : addedCh[key] === 'adding' ? 'adding' : 'idle');
  const addChannelOrbit = async (key) => {
    if (!user) { alert('일기장 궤도에 추가하려면 로그인이 필요합니다.'); return; }
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
        {st === 'added' ? '✓ 일기장 궤도에 추가됨' : st === 'adding' ? '추가 중…' : '＋ 일기장 궤도에 추가'}
      </button>
    );
  };

  const study = daily?.study;

  // 데이터가 있는 채널만 책갈피에 노출 (트랙은 자체 페치라 항상)
  const zoneKeys = daily ? [
    'track',
    ...(daily.signal ? ['signal'] : []),
    ...(study?.prompt_snippet ? ['prompt'] : []),
    ...(study?.sentence_jp ? ['jp'] : []),
  ] : [];
  const curCh = zoneKeys.includes(activeCh) ? activeCh : (zoneKeys[0] || 'track');

  const selectCh = useCallback((k) => {
    setActiveCh(k);
    trackRelearn('relearn_channel_select', { channel: k });
  }, []);

  // 브리핑의 DM Pick → 시그널 책갈피로 전환 후 해당 카드로 스크롤
  const jumpToPick = useCallback((i) => {
    setActiveCh('signal');
    requestAnimationFrame(() => {
      document.getElementById(`sig-pick-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    trackRelearn('relearn_daily_jump', { zone: 'signal_pick' });
  }, []);

  // ── GA4 퍼널: learn_view → orbit_add → complete_toggle → reflect_save ──
  useEffect(() => { if (isToday) trackRelearn('relearn_learn_view'); }, [isToday]);
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

  // 무효 date param·오늘 날짜 아카이브 URL은 /relearn 으로 수렴 (active 단일 소스와 일치)
  if (!active) return <Navigate to="/relearn" replace />;

  return (
    <div className={`rl-page rl-daily-page rl-with-dock${isToday ? '' : ' rl-past'}`}>
      {/* ── 헤더: 오늘=브랜드 히어로 / 과거=날짜 히어로 (+브레드크럼) ── */}
      <header className="rl-daily-head">
        {!isToday && (
          <nav className="rl-daily-crumb" aria-label="위치 경로">
            <Link className="rl-daily-crumb-link" to="/relearn">ReLearn</Link>
            <span className="rl-daily-crumb-sep" aria-hidden="true">›</span>
            <span className="rl-daily-crumb-cur" aria-current="page">아카이브</span>
          </nav>
        )}
        {isToday ? (
          <div className="rl-hero">
            <div className="rl-hero-icon">🪐</div>
            <h1 className="rl-hero-title">ReLearn</h1>
            <p className="rl-hero-tagline">
              매일 제로에서, 다시 배우고 다시 달린다
              <br />
              Learn from zero, run again.
            </p>
            {!user && (
              <button className="rl-hero-cta haptic-trigger" onClick={() => { trackRelearn('relearn_login_cta'); loginWithGoogle(); }}>
                나의 루프 시작하기 — Google로 로그인
              </button>
            )}
          </div>
        ) : (
          <div className="rl-hero rl-daily-hero">
            <div className="rl-hero-icon">📅</div>
            <h1 className="rl-hero-title rl-daily-htitle">{date} Daily Digest</h1>
            <p className="rl-hero-tagline">그날의 교재와 일기장 — 배움은 본문에서, 실행·복기는 일기장에서</p>
          </div>
        )}
        {/* 시간 네비 — 유일한 날짜 탐색 축 */}
        <DailyWeekStrip date={date} dates={dates} />
      </header>

      {/* ── 본문 2분할 (§3-3 컨테이너 내 span 8/4): 좌=교재(학습) · 우=일기장 ── */}
      <div className="rl-split">
      <div className="rl-split-main">
      {dailyError && <div className="rl-status">{dailyError}</div>}
      {!daily && !dailyError && <div className="rl-status">불러오는 중…</div>}

      {daily && (
        <>
          <DailyBriefing daily={daily} onJumpPick={jumpToPick} />

          {/* 책갈피 탭 — 카테고리별 구분, 전부 펼침 */}
          <div className="rl-learn">
            <nav className="rl-bm-tabs" aria-label="배움 채널 책갈피">
              {zoneKeys.map(z => (
                <button
                  key={z}
                  className={`rl-bm-tab ch-${z}${curCh === z ? ' on' : ''} haptic-trigger`}
                  onClick={() => selectCh(z)}
                  aria-current={curCh === z}
                >
                  <span className="rl-bm-ic">{ZONE_META[z].icon}</span>
                  <span className="rl-bm-label">{ZONE_META[z].label}</span>
                  {z === 'signal' && <span className="rl-bm-n">{daily.signal?.articles?.length || 0}</span>}
                </button>
              ))}
            </nav>
            <div className="rl-bm-panel rl-ch-sec">
              {isToday && CHANNEL_ORBITS[curCh] && (
                <div className="rl-zone-tools"><ChannelOrbitBtn ch={curCh} /></div>
              )}
              {curCh === 'track' && <TrackSignalFeed date={date} compact={false} />}
              {curCh === 'signal' && daily.signal && <SignalSection signal={daily.signal} splitHeadlines={false} />}
              {curCh === 'prompt' && study?.prompt_snippet && <PromptSection study={study} compact={false} />}
              {curCh === 'jp' && study?.sentence_jp && <JapaneseSection study={study} compact={false} />}
            </div>
          </div>
        </>
      )}
      </div>

      {/* ── 일기장 — 우측 컬럼(데스크톱 sticky) / 모바일 하단 도크 ── */}
      <div className="rl-split-side">
      <DiaryDock
        isToday={isToday} date={date}
        user={user} token={token} loginWithGoogle={loginWithGoogle} paceLoading={paceLoading}
        current={data?.current} timeline={data?.timeline}
        profile={profile} affinity={affinity}
        onToggle={handleToggle} onAccept={handleAccept} onAddCustom={handleAddCustom}
        onExclude={handleExclude} onRestore={handleRestore} onReflectSave={handleReflectSave}
      />
      </div>
      </div>

      {/* ── 루프 닫힘 푸터 (오늘만) — 루프 메시지 + 계정·구독 통합 ── */}
      {isToday && (
        <footer className="rl-loop-close">
          {user ? (
            <>
              <div className="rl-loop-close-t">🔄 배움 → 실행 → 복기</div>
              <div className="rl-loop-close-s">내일의 배움은 오늘의 실행을 기억합니다.</div>
              {/* 계정·구독 — 박스 없이 헤어라인 아래 조용한 한 줄 */}
              <div className="rl-account-footer" aria-label="계정 및 구독 관리">
                <span className="rl-account-user" title={user.email}>👤 {user.email}</span>
                <span className="rl-af-sep" aria-hidden="true">·</span>
                {subState === 'unknown' && <span className="rl-account-sub muted">구독 상태 확인 중…</span>}
                {subState === 'loading' && <span className="rl-account-sub muted">구독 처리 중…</span>}
                {subState === 'unsubscribed' && (
                  <button className="rl-af-btn sub haptic-trigger" onClick={handleSubscribe}>📬 데일리 메일 구독</button>
                )}
                {(subState === 'subscribed' || subState === 'done') && (
                  <>
                    <span className="rl-account-sub ok">📬 구독 중</span>
                    <button className="rl-af-btn haptic-trigger" onClick={handleUnsubscribe}>해지</button>
                  </>
                )}
                {subState === 'error' && (
                  <button className="rl-af-btn err haptic-trigger" onClick={handleSubscribe}>구독 실패 — 재시도</button>
                )}
                <span className="rl-af-sep" aria-hidden="true">·</span>
                <button className="rl-af-btn haptic-trigger" onClick={logout}>로그아웃</button>
              </div>
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

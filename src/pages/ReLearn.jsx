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
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useSEO from '../hooks/useSEO';
import { PAGE_META } from '../data/seoMeta.mjs';
import usePaceNoteData from '../hooks/usePaceNoteData';
import LoopReport from '../components/pacenote/LoopReport';
import SignalSection from '../components/daily/SignalSection';
import PromptSection from '../components/daily/PromptSection';
import JapaneseSection from '../components/daily/JapaneseSection';
import TrackSignalFeed from '../components/daily/TrackSignalFeed';
import OrbitSection from '../components/relearn/OrbitSection';
import ReflectionSection from '../components/relearn/ReflectionSection';
import { trackRelearn } from '../components/relearn/funnel';
import './ReLearn.css';

const todayKST = () => new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

// 배움 채널 → 궤도 연결 (v1.3 매핑 — 트랙 외 3채널은 /add 커스텀 궤도 재사용)
const CHANNEL_ORBITS = {
  signal: '오늘의 시그널 아티클 정독하고 메모 남기기',
  prompt: '오늘의 AI 프롬프트 직접 실행해보기',
  jp: '오늘의 비즈니스 일본어 문장 소리 내어 3번 읽기',
};

const LEARN_CHANNELS = [
  { key: 'track', icon: '🛰️', label: '테크 트랙' },
  { key: 'signal', icon: '📡', label: '시그널' },
  { key: 'prompt', icon: '🤖', label: '프롬프트' },
  { key: 'jp', icon: '🇯🇵', label: '어학' },
  { key: 'all', icon: '≡', label: '전체' },
];

// ReLearn 배움 채널의 시그널 표시 상한 (전체는 /daily 아카이브에서)
const SIGNAL_LIMIT = 4;

export default function ReLearn() {
  const { user, token, loginWithGoogle } = useAuth();
  const { data, loading: paceLoading, toggleTask, acceptTask, saveDiary, addTask } = usePaceNoteData();

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
  // 스크롤 피로 축소: 기본은 단일 채널(트랙 — 개인화 렌즈 적용 채널). '전체'는 선택지.
  const [channel, setChannel] = useState('track');
  const [daily, setDaily] = useState(null);             // 오늘의 daily JSON (signal+study)
  const [dailyError, setDailyError] = useState(null);
  const [profile, setProfile] = useState(null);         // 셸 1회 페치 → 하위 주입
  const date = todayKST();

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
      >
        {st === 'added' ? '✓ 궤도에 추가됨' : st === 'adding' ? '추가 중…' : `＋ ${CHANNEL_ORBITS[ch]} — 궤도로`}
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
  const isChannel = (k) => channel === 'all' || channel === k;
  const selectChannel = (key) => {
    setChannel(key);
    trackRelearn('relearn_channel_select', { channel: key });
    // 깊이 스크롤된 상태에서 채널 전환 시 배움 상단으로 복귀
    document.getElementById('rl-learn')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── GA4 퍼널 (Phase D): learn_view → orbit_add → complete_toggle → reflect_save ──
  useEffect(() => { trackRelearn('relearn_learn_view'); }, []);
  const openView = (v) => {
    setView(v);
    if (v === 'records') trackRelearn('relearn_view_records');
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
        <span className="rl-hero-eyebrow">PriSincera · Unified Growth Loop</span>
        <h1 className="rl-hero-title">ReLearn</h1>
        <p className="rl-hero-tagline">
          매일 제로에서, 다시 배우고 다시 달린다
          <span className="rl-hero-en">Learn from zero, run again.</span>
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
            <section className="rl-stage s1">
              {/* 좌측 레일 2뎁스: ① 마커 + 채널 서브 앵커 (콘텐츠를 덮지 않는 책갈피) */}
              <div className="rl-marker-group">
                <div className="rl-marker" aria-hidden="true">📚</div>
                <div className="rl-rail-subnav" role="group" aria-label="배움 채널 책갈피">
                  {LEARN_CHANNELS.map(c => (
                    <button
                      key={c.key}
                      className={`rl-rail-ch ${channel === c.key ? 'on' : ''}`}
                      title={c.label}
                      aria-label={c.label}
                      onClick={() => selectChannel(c.key)}
                    >
                      {c.icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rl-body" id="rl-learn">
                <div className="rl-stage-head"><span className="rl-stage-no">STAGE 01</span><h2 className="rl-stage-title">배움 — 오늘의 다이제스트</h2></div>
                <p className="rl-stage-desc">Daily Digest 4채널 전체가 이곳으로. 로그인하면 내 궤도 도메인이 상단에 정렬됩니다.</p>

                {/* 모바일 전용 채널 칩 (레일이 숨는 폭에서만 노출, 비스티키) */}
                <div className="rl-learn-chips" role="group" aria-label="배움 채널">
                  {LEARN_CHANNELS.map(c => (
                    <button key={c.key} className={`rl-learn-chip ${channel === c.key ? 'on' : ''}`} onClick={() => selectChannel(c.key)}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>

                {dailyError && !daily && <div className="rl-status">{dailyError}</div>}

                {isChannel('track') && (
                  <div className="rl-ch-sec">
                    <TrackSignalFeed date={date} affinity={affinity} onOrbitAdded={(domain) => trackRelearn('relearn_orbit_add', { source: 'track', domain })} />
                  </div>
                )}

                {isChannel('signal') && daily?.signal && (
                  <div className="rl-ch-sec">
                    <SignalSection signal={daily.signal} limit={SIGNAL_LIMIT} />
                    {(daily.signal.articles || []).length > SIGNAL_LIMIT && (
                      <Link className="rl-more-link" to={`/daily/${date}`}>시그널 전체 보기 →</Link>
                    )}
                    {user && <ChannelOrbitBtn ch="signal" />}
                  </div>
                )}

                {isChannel('prompt') && study?.prompt_snippet && (
                  <div className="rl-ch-sec">
                    <PromptSection study={study} />
                    {user && <ChannelOrbitBtn ch="prompt" />}
                  </div>
                )}

                {isChannel('jp') && study?.sentence_jp && (
                  <div className="rl-ch-sec">
                    <JapaneseSection study={study} />
                    {user && <ChannelOrbitBtn ch="jp" />}
                  </div>
                )}

                {/* 이메일 구독 — 배움의 문맥 CTA (로그인·미구독 시에만) */}
                {user && subState === 'unsubscribed' && (
                  <div className="rl-subscribe">
                    <span className="rl-subscribe-t">오늘의 배움, 매일 아침 메일로도 받아보세요</span>
                    <button className="rl-subscribe-btn haptic-trigger" onClick={handleSubscribe}>📬 무료 구독</button>
                  </div>
                )}
                {user && subState === 'loading' && <div className="rl-subscribe"><span className="rl-subscribe-t">구독 처리 중…</span></div>}
                {user && subState === 'done' && <div className="rl-subscribe ok"><span className="rl-subscribe-t">✓ 구독 완료 — 내일 아침 첫 메일이 도착합니다</span></div>}
                {user && subState === 'error' && <div className="rl-subscribe err"><span className="rl-subscribe-t">구독 처리에 실패했어요 — 잠시 후 다시 시도해 주세요</span></div>}
                {user && subState === 'subscribed' && (
                  <div className="rl-subscribe ok">
                    <span className="rl-subscribe-t">📬 데일리 메일 구독 중</span>
                    <Link className="rl-subscribe-manage" to="/daily">구독 관리 →</Link>
                  </div>
                )}

                <Link className="rl-archive-link" to="/daily">지난 다이제스트 보기 →</Link>
              </div>
            </section>

            {/* ════ ② 실행 ════ */}
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
                  <OrbitSection current={data?.current} onToggle={handleToggle} onAccept={handleAccept} onAdd={handleAddCustom} affinity={affinity} />
                )}
              </div>
            </section>

            {/* ════ ③ 복기 ════ */}
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
                  <ReflectionSection statement={data?.current?.statement || ''} onSave={handleReflectSave} />
                )}
              </div>
            </section>
          </div>
        </>
      ) : (
        /* ── 기록 뷰 (A안: 주차별 실행·복기 아카이브 — 기존 timeline 재사용) ── */
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
            records.map(w => (
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
            ))
          )}
        </section>
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

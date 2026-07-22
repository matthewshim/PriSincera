/**
 * ReLearnDaily — 다이제스트 아카이브 상세 (/relearn/daily/:date)
 *
 * UI 재편(2026-07): 4채널 전량 펼침 스택 → 훑어보기(skim) 기본 + 정독(full) 토글.
 * 브리핑 히어로(그날의 전모) + 스티키 채널 내비(스크롤 스파이) + 존별 부분 펼침.
 * 정독 모드 = 기존 아카이브 전량 렌더와 동일(정보 손실 0), 선택은 localStorage 유지.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import DailyBriefing from '../components/daily/DailyBriefing';
import DailyWeekStrip from '../components/daily/DailyWeekStrip';
import SignalSection from '../components/daily/SignalSection';
import PromptSection from '../components/daily/PromptSection';
import JapaneseSection from '../components/daily/JapaneseSection';
import TrackSignalFeed from '../components/daily/TrackSignalFeed';
import { trackRelearn } from '../components/relearn/funnel';
import './ReLearn.css';
import './ReLearnDaily.css';

const MODE_KEY = 'rl_daily_readmode'; // 'skim'(훑어보기, 기본) | 'full'(정독)
const ZONE_META = {
  track: { icon: '🛰️', label: '테크 트랙' },
  signal: { icon: '📰', label: 'IT 시그널' },
  prompt: { icon: '🤖', label: 'AI 프롬프트' },
  jp: { icon: '🇯🇵', label: '일본어' },
};

export default function ReLearnDaily() {
  const { date } = useParams();
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date || '');
  const [daily, setDaily] = useState(null);
  const [error, setError] = useState(null);
  const [dates, setDates] = useState(null);   // 아카이브 전체 날짜(최신순) — 이전/다음 네비용
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem(MODE_KEY) === 'full' ? 'full' : 'skim'; } catch { return 'skim'; }
  });
  const [expandedZones, setExpandedZones] = useState(() => new Set()); // skim 중 존 단위 부분 펼침
  const [activeZone, setActiveZone] = useState('track');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/daily/index')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!cancelled) setDates(d?.dates || []); })
      .catch(() => { if (!cancelled) setDates([]); });
    return () => { cancelled = true; };
  }, []);

  useSEO({
    title: `${date} Daily Digest — ReLearn`,
    description: `${date} 데일리 다이제스트 아카이브 — IT 시그널·테크 트랙·AI 프롬프트·비즈니스 일본어 전체 기록.`,
    keywords: 'PriSincera, ReLearn, 데일리 다이제스트, 아카이브',
    ogUrl: `https://www.prisincera.com/relearn/daily/${date}`,
  });

  // 헤더(GNB) 노출 — 타 페이지와 동일 패턴
  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => document.body.classList.remove('hero-ready');
  }, []);

  useEffect(() => {
    if (!valid) return;
    let cancelled = false;
    setDaily(null); setError(null); setExpandedZones(new Set());
    fetch(`/api/daily/${date}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(r.status === 404 ? '해당 날짜의 다이제스트가 없습니다.' : `불러오기 실패 (${r.status})`)))
      .then(d => { if (!cancelled) setDaily(d); })
      .catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [date, valid]);

  const study = daily?.study;
  // 렌더되는 존만 내비에 노출 (트랙은 자체 페치라 항상)
  const zoneKeys = daily ? [
    'track',
    ...(daily.signal ? ['signal'] : []),
    ...(study?.prompt_snippet ? ['prompt'] : []),
    ...(study?.sentence_jp ? ['jp'] : []),
  ] : [];

  // 스크롤 스파이 — 뷰포트 상단 기준 마지막으로 지나친 존을 활성 표시
  useEffect(() => {
    if (!daily) return;
    const keys = zoneKeys;
    const onScroll = () => {
      let cur = keys[0];
      for (const k of keys) {
        const el = document.getElementById(`rl-zone-${k}`);
        if (el && el.getBoundingClientRect().top <= 220) cur = k;
      }
      setActiveZone(c => (c === cur ? c : cur));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daily]);

  const setModePersist = useCallback((m) => {
    setMode(m);
    try { localStorage.setItem(MODE_KEY, m); } catch { /* 무시 */ }
    trackRelearn('relearn_daily_mode', { mode: m });
  }, []);

  const isFull = (z) => mode === 'full' || expandedZones.has(z);
  const toggleZone = (z) => {
    setExpandedZones(prev => {
      const n = new Set(prev);
      if (n.has(z)) n.delete(z); else { n.add(z); trackRelearn('relearn_learn_expand', { block: `daily_zone_${z}` }); }
      return n;
    });
  };

  const jumpTo = useCallback((k) => {
    document.getElementById(`rl-zone-${k}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    trackRelearn('relearn_daily_jump', { zone: k });
  }, []);
  const jumpToPick = useCallback((i) => {
    document.getElementById(`sig-pick-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    trackRelearn('relearn_daily_jump', { zone: 'signal_pick' });
  }, []);

  if (!valid) return <Navigate to="/relearn" replace />;

  // skim 상태의 존 상단 부분 펼침 토글 (정독 모드에선 불필요 — 이미 전량)
  const zoneTools = (z) => mode === 'skim' && (
    <div className="rl-zone-tools">
      <button className="rl-zone-expand haptic-trigger" onClick={() => toggleZone(z)}>
        {expandedZones.has(z) ? '간략히 ▴' : '전체 펼치기 ▾'}
      </button>
    </div>
  );

  return (
    <div className="rl-page rl-daily-page">
      {/* §9-1 표준 서비스 히어로 정합 — .rl-hero 규격 클래스 재사용 (아이콘→타이틀→서브카피) */}
      <header className="rl-daily-head">
        <nav className="rl-daily-crumb" aria-label="위치 경로">
          <Link className="rl-daily-crumb-link" to="/relearn">ReLearn</Link>
          <span className="rl-daily-crumb-sep" aria-hidden="true">›</span>
          <span className="rl-daily-crumb-cur" aria-current="page">아카이브</span>
        </nav>
        <div className="rl-hero rl-daily-hero">
          <div className="rl-hero-icon">📅</div>
          <h1 className="rl-hero-title rl-daily-htitle">{date} Daily Digest</h1>
          <p className="rl-hero-tagline">그날의 배움 아카이브 — 4채널 훑어보기, 정독은 토글로</p>
        </div>
        <DailyWeekStrip date={date} dates={dates} />
      </header>

      {error && <div className="rl-status">{error}</div>}
      {!daily && !error && <div className="rl-status">불러오는 중…</div>}

      {daily && (
        <>
          <div className="rl-daily-sticky">
            <nav className="rl-daily-chips" aria-label="채널 이동">
              {zoneKeys.map(z => (
                <button
                  key={z}
                  className={`rl-daily-chip ch-${z}${activeZone === z ? ' on' : ''} haptic-trigger`}
                  onClick={() => jumpTo(z)}
                >
                  <span className="rl-daily-chip-ic">{ZONE_META[z].icon}</span>
                  <span className="rl-daily-chip-label">{ZONE_META[z].label}</span>
                  {z === 'signal' && <span className="rl-daily-chip-n">{daily.signal?.articles?.length || 0}</span>}
                </button>
              ))}
            </nav>
            <div className="rl-daily-mode" role="group" aria-label="읽기 모드">
              <button className={`rl-daily-mode-btn${mode === 'skim' ? ' on' : ''}`} onClick={() => setModePersist('skim')}>훑어보기</button>
              <button className={`rl-daily-mode-btn${mode === 'full' ? ' on' : ''}`} onClick={() => setModePersist('full')}>정독</button>
            </div>
          </div>

          <DailyBriefing daily={daily} onJumpPick={jumpToPick} />

          <div className="rl-daily-zones">
            <section id="rl-zone-track" className="rl-ch-sec" data-rl-ch="track">
              {zoneTools('track')}
              <TrackSignalFeed date={date} compact={!isFull('track')} />
            </section>
            {daily.signal && (
              <section id="rl-zone-signal" className="rl-ch-sec" data-rl-ch="signal">
                {zoneTools('signal')}
                <SignalSection signal={daily.signal} splitHeadlines={!isFull('signal')} />
              </section>
            )}
            {study?.prompt_snippet && (
              <section id="rl-zone-prompt" className="rl-ch-sec" data-rl-ch="prompt">
                {zoneTools('prompt')}
                <PromptSection key={`prompt-${isFull('prompt')}`} study={study} compact={!isFull('prompt')} />
              </section>
            )}
            {study?.sentence_jp && (
              <section id="rl-zone-jp" className="rl-ch-sec" data-rl-ch="jp">
                {zoneTools('jp')}
                <JapaneseSection study={study} compact={!isFull('jp')} />
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
}

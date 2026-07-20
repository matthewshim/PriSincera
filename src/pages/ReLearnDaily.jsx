/**
 * ReLearnDaily — 다이제스트 아카이브 상세 (/relearn/daily/:date)
 *
 * Phase 1(리런 독립 운영): /daily/:date 위임을 대체하는 리런 자체 상세 화면.
 * 4채널 풀 콘텐츠(비 compact — 아카이브 정독)를 리런 존 스킨(rl-ch-sec)으로 조립한다.
 */
import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import SignalSection from '../components/daily/SignalSection';
import PromptSection from '../components/daily/PromptSection';
import JapaneseSection from '../components/daily/JapaneseSection';
import TrackSignalFeed from '../components/daily/TrackSignalFeed';
import './ReLearn.css';
import './ReLearnDaily.css';

export default function ReLearnDaily() {
  const { date } = useParams();
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date || '');
  const [daily, setDaily] = useState(null);
  const [error, setError] = useState(null);

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
    setDaily(null); setError(null);
    fetch(`/api/daily/${date}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(r.status === 404 ? '해당 날짜의 다이제스트가 없습니다.' : `불러오기 실패 (${r.status})`)))
      .then(d => { if (!cancelled) setDaily(d); })
      .catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [date, valid]);

  if (!valid) return <Navigate to="/relearn" replace />;
  const study = daily?.study;

  return (
    <div className="rl-page rl-daily-page">
      <header className="rl-daily-head">
        <Link className="rl-daily-back" to="/relearn">← ReLearn</Link>
        <h1 className="rl-daily-title">{date} <span>Daily Digest</span></h1>
        <p className="rl-daily-sub">그날의 배움 아카이브 — 4채널 전체 기록</p>
      </header>

      {error && <div className="rl-status">{error}</div>}
      {!daily && !error && <div className="rl-status">불러오는 중…</div>}

      {daily && (
        <div className="rl-daily-zones">
          <div className="rl-ch-sec" data-rl-ch="track">
            <TrackSignalFeed date={date} />
          </div>
          {daily.signal && (
            <div className="rl-ch-sec" data-rl-ch="signal">
              <SignalSection signal={daily.signal} />
            </div>
          )}
          {study?.prompt_snippet && (
            <div className="rl-ch-sec" data-rl-ch="prompt">
              <PromptSection study={study} />
            </div>
          )}
          {study?.sentence_jp && (
            <div className="rl-ch-sec" data-rl-ch="jp">
              <JapaneseSection study={study} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

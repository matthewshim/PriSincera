/**
 * LearnStage — ① 배움 스테이지 (4채널 존·책갈피·아카이브) — ReLearn 셸에서 분리한 프레젠테이션 컴포넌트 (백로그 1-3 리팩터)
 * 상태·핸들러는 ReLearn 셸이 소유하고 props로 주입한다 (데이터 원칙 §3 유지).
 */
import { Link } from 'react-router-dom';
import SignalSection from '../daily/SignalSection';
import PromptSection from '../daily/PromptSection';
import JapaneseSection from '../daily/JapaneseSection';
import TrackSignalFeed from '../daily/TrackSignalFeed';
import { trackRelearn } from './funnel';

const LEARN_CHANNELS = [
  { key: 'track', icon: '🛰️', label: '테크 트랙' },
  { key: 'signal', icon: '📡', label: '시그널' },
  { key: 'prompt', icon: '🤖', label: '프롬프트' },
  { key: 'jp', icon: '🇯🇵', label: '어학' },
];

// ReLearn 배움 채널의 시그널 표시 상한 (전체는 아카이브 상세에서)
const SIGNAL_LIMIT = 4;

export default function LearnStage({
  subnavOn, channel, selectChannel,
  daily, dailyError, study, date, user, affinity,
  ChannelOrbitBtn,
  archiveOpen, archiveDates, toggleArchive,
}) {
  return (
            <section className="rl-stage s1">
              {/* 좌측 레일 2뎁스: ① 마커 + 채널 서브 앵커 (콘텐츠를 덮지 않는 책갈피) */}
              <div className="rl-marker-group">
                <div className="rl-marker" aria-hidden="true">📚</div>
                <div className={`rl-rail-subnav${subnavOn ? '' : ' faded'}`} role="group" aria-label="배움 채널 책갈피">
                  {LEARN_CHANNELS.map(c => (
                    <button
                      key={c.key}
                      className={`rl-rail-ch ch-${c.key} ${channel === c.key ? 'on' : ''}`}
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
                    <button key={c.key} className={`rl-learn-chip ch-${c.key} ${channel === c.key ? 'on' : ''}`} onClick={() => selectChannel(c.key)}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>

                {dailyError && !daily && <div className="rl-status">{dailyError}</div>}

                {(
                  <div className="rl-ch-sec" data-rl-ch="track">
                    <TrackSignalFeed date={date} affinity={affinity} compact onOrbitAdded={(domain) => trackRelearn('relearn_orbit_add', { source: 'track', domain })} />
                  </div>
                )}

                {daily?.signal && (
                  <div className="rl-ch-sec" data-rl-ch="signal">
                    <SignalSection signal={daily.signal} limit={SIGNAL_LIMIT} compact />
                    <div className="rl-ch-foot">
                      {user && <ChannelOrbitBtn ch="signal" />}
                      {(daily.signal.articles || []).length > SIGNAL_LIMIT && (
                        <Link className="rl-more-link" to={`/relearn/daily/${date}`}>시그널 전체 보기 →</Link>
                      )}
                    </div>
                  </div>
                )}

                {study?.prompt_snippet && (
                  <div className="rl-ch-sec" data-rl-ch="prompt">
                    <PromptSection study={study} compact />
                    {user && <ChannelOrbitBtn ch="prompt" />}
                  </div>
                )}

                {study?.sentence_jp && (
                  <div className="rl-ch-sec" data-rl-ch="jp">
                    <JapaneseSection study={study} compact />
                    {user && <ChannelOrbitBtn ch="jp" />}
                  </div>
                )}

                {/* 구독 관리 UI는 상단 계정·구독 바로 단일화 (하단 매몰·중복 방지) */}

                {/* P3: 경량 아카이브 — 날짜 리스트(상세는 /daily/:date 영구 URL) */}
                <button className="rl-archive-link" onClick={toggleArchive}>
                  지난 다이제스트 보기 {archiveOpen ? '▾' : '→'}
                </button>
                {archiveOpen && (
                  <div className="rl-archive-list">
                    {archiveDates === null && <span className="rl-archive-empty">불러오는 중…</span>}
                    {archiveDates?.length === 0 && <span className="rl-archive-empty">아카이브가 비어 있어요.</span>}
                    {archiveDates?.map(d => (
                      <Link key={d} className="rl-archive-date" to={`/relearn/daily/${d}`}>{d}</Link>
                    ))}
                  </div>
                )}
              </div>
            </section>
  );
}

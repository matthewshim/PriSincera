import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useSEO from '../hooks/useSEO';
import DailyIntro from '../components/daily/DailyIntro';
import './DailyDigest.css';

const TABS = [
  { key: 'intro', label: '서비스 소개', icon: '📋' },
  { key: 'daily', label: '데일리 다이제스트', icon: '📝' },
];

function formatNavDate(dateStr) {
  const [, m, d] = dateStr.split('-').map(Number);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dt = new Date(dateStr + 'T00:00:00');
  return `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}(${days[dt.getDay()]})`;
}

export default function DailyDigest() {
  const { date } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  useSEO({
    title: date ? `Daily Digest (${date})` : 'Daily Digest',
    description: 'PriSincera가 큐레이션 하는 글로벌 IT, 비즈니스, AI 트렌드 및 시그널 데일리 리포트입니다.',
    keywords: 'PriSincera, 데일리 다이제스트, IT 뉴스, AI 트렌드, 비즈니스 인사이트, 시그널',
    ogUrl: `https://www.prisincera.com/daily${date ? `/${date}` : ''}`
  });

  const [activeTab, setActiveTab] = useState(window.location.hash === '#daily' ? 'daily' : 'intro');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null); // Detail data or Archive list
  const [subStatus, setSubStatus] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const synth = window.speechSynthesis;

  const { user, loginWithGoogle, logout } = useAuth();

  // Global Auth Sync
  useEffect(() => {
    async function checkSub() {
      if (user) {
        setSubEmail(user.email);
        try {
          const res = await fetch(`/api/subscribe/check?email=${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const result = await res.json();
            if (result.subscribed) {
              setSubStatus('already_subscribed');
            }
          }
        } catch (err) {
          console.error('Failed to check subscription status', err);
        }
      } else {
        setSubEmail('');
        if (subStatus === 'already_subscribed' || subStatus === 'success') {
          setSubStatus('');
        }
      }
    }
    checkSub();
  }, [user]);

  const todayStr = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // 헤더 노출을 위한 hero-ready 클래스 제어
  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => {
      document.body.classList.remove('hero-ready');
    };
  }, []);

  useEffect(() => {
    if (location.hash === '#daily') {
      setActiveTab('daily');
    }
  }, [location.hash]);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (date) {
        const res = await fetch(`/api/daily/${date}`);
        if (res.ok) {
          setData(await res.json());
        } else {
          setData(null);
        }
      } else {
        // Fetch archive list
        const res = await fetch('/api/daily/index');
        if (res.ok) {
          const indexData = await res.json();
          // Fetch summary for top 10 items for the list
          const recentDates = indexData.dates.slice(0, 10);
          const summaries = await Promise.all(
            recentDates.map(async (d) => {
              const dRes = await fetch(`/api/daily/${d}`);
              if (dRes.ok) {
                const digest = await dRes.json();
                return {
                  date: d,
                  theme: digest?.study?.theme || digest?.signal?.articles?.[0]?.category || '',
                  articles: digest?.signal?.articles || [],
                  promptSnippet: digest?.study?.prompt_snippet || '',
                  jpSentence: digest?.study?.sentence_jp || ''
                };
              }
              return { date: d };
            })
          );
          setData(summaries);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  const handleGoogleSubscribe = async () => {
    try {
      setSubStatus('loading');
      const result = await loginWithGoogle();
      const email = result.user.email;
      setSubEmail(email);
      
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_address: email })
      });
      
      const data = await res.json();
      if (res.ok) {
         if (data.code === 'already_subscribed') {
            setSubStatus('already_subscribed');
         } else {
            setSubStatus('success');
         }
      } else {
         setSubStatus('error');
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      setSubStatus('error');
    }
  };

  const handleUnsubscribe = async () => {
    if (!subEmail) return;
    if (!window.confirm("정말 구독을 해제하시겠어요?\n하루 5분, 성장을 위한 시그널을 놓치게 됩니다. 😢\n\n(계속 받아보시려면 '취소'를 눌러주세요)")) {
      return;
    }
    try {
      setSubStatus('loading');
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_address: subEmail })
      });
      if (res.ok) {
        setSubStatus('idle');
        setSubEmail('');
        alert('구독이 성공적으로 해지되었습니다. 언제든 다시 찾아주세요!');
      } else {
        setSubStatus('error');
      }
    } catch (err) {
      console.error(err);
      setSubStatus('error');
    }
  };



  const playAudio = (text) => {
    if (!text) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    synth.speak(utterance);
  };



  const getCategoryStyles = (category) => {
    if (!category) return {};
    const cat = category.toLowerCase();
    
    // AI / 인공지능 (Cyan)
    if (cat.includes('ai') || cat.includes('인공지능')) 
      return { color: '#22D3EE', background: 'rgba(34, 211, 238, 0.15)', boxShadow: 'inset 0 0 0 1px rgba(34, 211, 238, 0.3)' };
    
    // Attitude / Mindset (Emerald/Green)
    if (cat.includes('attitude') || cat.includes('mindset') || cat.includes('태도')) 
      return { color: '#34D399', background: 'rgba(52, 211, 153, 0.15)', boxShadow: 'inset 0 0 0 1px rgba(52, 211, 153, 0.3)' };
    
    // Priority / Strategy (Amber/Yellow)
    if (cat.includes('priority') || cat.includes('strategy') || cat.includes('전략')) 
      return { color: '#FBBF24', background: 'rgba(251, 191, 36, 0.15)', boxShadow: 'inset 0 0 0 1px rgba(251, 191, 36, 0.3)' };
    
    // Global / Trend (Blue)
    if (cat.includes('global') || cat.includes('글로벌') || cat.includes('trend') || cat.includes('트렌드')) 
      return { color: '#60A5FA', background: 'rgba(96, 165, 250, 0.15)', boxShadow: 'inset 0 0 0 1px rgba(96, 165, 250, 0.3)' };
    
    // Startup / Business (Rose/Pink)
    if (cat.includes('startup') || cat.includes('스타트업') || cat.includes('business') || cat.includes('비즈니스')) 
      return { color: '#F472B6', background: 'rgba(244, 114, 182, 0.15)', boxShadow: 'inset 0 0 0 1px rgba(244, 114, 182, 0.3)' };
    
    // Tech / Dev / SW (Violet)
    if (cat.includes('tech') || cat.includes('개발') || cat.includes('software')) 
      return { color: '#A78BFA', background: 'rgba(167, 139, 250, 0.15)', boxShadow: 'inset 0 0 0 1px rgba(167, 139, 250, 0.3)' };
    
    // Security / Defense (Red)
    if (cat.includes('security') || cat.includes('보안')) 
      return { color: '#F87171', background: 'rgba(248, 113, 113, 0.15)', boxShadow: 'inset 0 0 0 1px rgba(248, 113, 113, 0.3)' };
    
    // Default (Lavender)
    return { color: 'var(--prism-lavender)', background: 'rgba(192, 132, 252, 0.15)', boxShadow: 'inset 0 0 0 1px rgba(192, 132, 252, 0.3)' };
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'daily') {
      navigate('/daily#daily');
    } else {
      navigate('/daily');
    }
  };

  const renderHeroAndTabs = () => (
    <>
      <section className="daily-hero">
        <div className="daily-hero-content">
          <div className="daily-hero-icon">☕</div>
          <h1 className="daily-title">Daily Digest</h1>
          <p className="daily-subtitle" style={{ lineHeight: '1.6' }}>
            넘쳐나는 정보 속에서 길을 잃지 마세요.<br/>
            매일 아침 배달되는 글로벌 트렌드 큐레이션, 실무 적용을 위한 AI 프롬프트,<br/>
            그리고 비즈니스 어학까지. 읽고 끝나는 지식이 아닌, 실무의 무기로 만드세요.
          </p>
          
          <div className="daily-subscribe-wrap">
            <button 
              className={`daily-google-sub-btn ${subStatus || 'idle'}`} 
              onClick={handleGoogleSubscribe} 
              disabled={subStatus === 'loading' || subStatus === 'success' || subStatus === 'already_subscribed'}
            >
              {subStatus === 'loading' ? '🚀 시그널 동기화 중...' : 
               subStatus === 'success' ? '✨ Your Daily Signal is ON : 매일 아침 8시 새로운 소식으로 만나요!' : 
               subStatus === 'already_subscribed' ? '✨ 매일 아침 8시 새로운 소식으로 만나요!' : '✨ 하루 5분, 다이제스트 무료 구독'}
            </button>
            
            {(subStatus === 'success' || subStatus === 'already_subscribed') && (
              <div style={{ marginTop: '12px', textAlign: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={async () => { await logout(); setSubStatus(''); setSubEmail(''); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.7 }}
                >
                  다른 계정으로 구독 신청
                </button>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.5 }}>|</span>
                <button 
                  onClick={handleUnsubscribe}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.7 }}
                >
                  구독 끊기
                </button>
              </div>
            )}

            {subStatus === 'error' && <div className="sub-msg error">앗, 구독 처리 중 오류가 발생했습니다. 다시 시도해 주세요.</div>}
          </div>
        </div>
      </section>

      {/* ── Sub-tab navigation ── */}
      <nav className="daily-tabs-nav" role="tablist">
        <div className="daily-tabs-inner">
          {TABS.map((tab) => {
            const isSelected = date ? tab.key === 'daily' : activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isSelected}
                className={`daily-tab${isSelected ? ' active' : ''}`}
                onClick={() => handleTabChange(tab.key)}
              >
                <span className="daily-tab-icon">{tab.icon}</span>
                <span className="daily-tab-label">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );

  if (!date) {
    // Landing View (Tabs + Archive/Intro)
    return (
      <div className="daily-digest-page">
        {renderHeroAndTabs()}
        
        <div className="daily-tab-panel" hidden={activeTab !== 'intro'}>
          <DailyIntro />
        </div>

        <div className="daily-tab-panel" hidden={activeTab !== 'daily'}>
          <div className="archive-container">
            <div className="archive-grid">
              {loading ? (
                <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '40px' }}>목록을 불러오는 중입니다...</div>
              ) : Array.isArray(data) && data.length > 0 ? (
                data.map((item) => (
                  <Link to={`/daily/${item.date}`} className="archive-card premium" key={item.date}>
                    <div className="archive-card-header">
                      <span className="archive-date">{item.date}</span>
                      {item.theme && <span className="archive-badge" style={getCategoryStyles(item.theme)}>{item.theme}</span>}
                    </div>
                    
                    <div className="archive-card-body">
                      {item.articles && item.articles.slice(0, 2).map((article, i) => (
                        <div className="archive-flat-item" key={`art-${i}`}>
                          <span className="flat-icon" style={{color: getCategoryStyles(article.category).color || '#A78BFA'}}>✦</span>
                          <span className="flat-text">{article.title}</span>
                        </div>
                      ))}
                      
                      {item.articles && item.articles.length > 2 && (
                        <div className="archive-flat-more">
                          <span className="flat-more-line"></span>
                          <span className="flat-more-text">+{item.articles.length - 2} more signals</span>
                        </div>
                      )}

                      {item.promptSnippet && (
                        <div className="archive-flat-item highlight-ai">
                          <span className="flat-icon">🤖</span>
                          <span className="flat-text ai-text">{item.promptSnippet.substring(0, 45)}{item.promptSnippet.length > 45 ? '...' : ''}</span>
                        </div>
                      )}

                      {item.jpSentence && (
                        <div className="archive-flat-item highlight-jp">
                          <span className="flat-icon">🇯🇵</span>
                          <span className="flat-text jp-text">{item.jpSentence}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '40px' }}>아직 발행된 피드가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detail View
  return (
    <div className="daily-digest-page">
      {renderHeroAndTabs()}

      <div className="daily-detail-header">
        <div className="daily-date-nav-row">
          <button 
            className="daily-nav-btn" 
            onClick={() => {
              const d = new Date(date);
              d.setDate(d.getDate() - 1);
              navigate(`/daily/${d.toISOString().slice(0, 10)}`);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="daily-nav-btn-label">
              {formatNavDate(new Date(new Date(date).setDate(new Date(date).getDate() - 1)).toISOString().slice(0, 10))}
            </span>
          </button>
          
          <div className="daily-date-center">
            <span className="daily-date-day">{new Date(date).getDate()}</span>
            <div className="daily-date-month-dow">
              <span className="daily-date-month">{new Date(date).getMonth() + 1}월</span>
              <span className="daily-date-dow">{['일', '월', '화', '수', '목', '금', '토'][new Date(date).getDay()]}요일</span>
            </div>
          </div>

          {(() => {
            const d = new Date(date);
            d.setDate(d.getDate() + 1);
            const nextStr = d.toISOString().slice(0, 10);
            const todayStr = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
            
            if (nextStr <= todayStr) {
              return (
                <button 
                  className="daily-nav-btn next" 
                  onClick={() => navigate(`/daily/${nextStr}`)}
                >
                  <span className="daily-nav-btn-label">
                    {formatNavDate(nextStr)}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              );
            } else {
              return <div className="daily-nav-btn next disabled" />;
            }
          })()}
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => navigate('/daily')}
            style={{ 
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
              color: 'var(--prism-lavender)', padding: '6px 16px', borderRadius: '20px', 
              fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            목록으로 돌아가기
          </button>
        </div>
      </div>

      <div className="daily-feed-container">
        {loading ? (
          <div style={{ textAlign: 'center', color: '#9CA3AF' }}>데이터를 불러오는 중입니다...</div>
        ) : !data ? (
          <div style={{ textAlign: 'center', color: '#9CA3AF' }}>해당 날짜의 데이터가 없습니다.</div>
        ) : (
          <>
            {/* 1. IT Tech Signal */}
            {data.signal && (
              <div className="daily-section">
                <div className="daily-section-header">
                  <span className="daily-section-icon">📰</span>
                  <h2 className="daily-section-title">IT Tech Signal</h2>
                </div>
                  <div className="signal-articles-masonry">
                    {[...(data.signal.articles || [])]
                      .sort((a, b) => {
                        if (a.isDmPick && !b.isDmPick) return -1;
                        if (!a.isDmPick && b.isDmPick) return 1;
                        return b.weightedScore - a.weightedScore;
                      })
                      .map((article, idx) => (
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className={`signal-article-card ${article.isDmPick ? 'dm-pick' : ''}`} key={idx}>
                        {article.og_image && (
                          <div className="signal-article-image">
                            <img src={article.og_image} alt={article.title} loading="lazy" />
                          </div>
                        )}
                        <div className="signal-article-body">
                          <div className="signal-article-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            {article.isDmPick && (
                              <span style={{
                                fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700,
                                color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                                padding: '2px 8px', borderRadius: '100px',
                              }}>
                                DM Pick
                              </span>
                            )}
                            {article.category && <span className="signal-article-category" style={getCategoryStyles(article.category)}>{article.category}</span>}
                            
                            <div className="signal-article-meta-info" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {article.weightedScore && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ color: '#FCD34D' }}>★</span> {Number(article.weightedScore).toFixed(1)} {article.tier === 1 && '🌟'}
                                </span>
                              )}
                              {article.weightedScore && article.source && <span style={{ opacity: 0.3 }}>|</span>}
                              {article.source && <span style={{ color: 'var(--prism-lavender)', fontWeight: 500 }}>{article.source}</span>}
                            </div>
                          </div>
                          <h3>{article.title}</h3>
                          {article.insight && <div className="signal-insight">💡 {article.insight}</div>}
                          <p>{article.summary}</p>
                          <span className="signal-link">원문 읽기 →</span>
                        </div>
                      </a>
                    ))}
                  </div>
              </div>
            )}

            {/* 2. AI Prompt */}
            {data.study?.prompt_snippet && (
              <div className="daily-section">
                <div className="daily-section-header">
                  <span className="daily-section-icon">🤖</span>
                  <h2 className="daily-section-title">AI 프롬프트 1-Pick</h2>
                </div>
                <div className="daily-card">
                  <div className="study-snippet">{data.study.prompt_snippet}</div>
                  {data.study.explanation && <div className="study-kr">{data.study.explanation}</div>}
                  {data.study.business_context && (
                    <div className="signal-insight" style={{ borderColor: '#F59E0B' }}>
                      💡 실무 활용 팁: {data.study.business_context}
                    </div>
                  )}
                  {data.study.parameters && data.study.parameters.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <strong style={{ color: '#F3F4F6', fontSize: '0.9rem' }}>⚙️ 파라미터:</strong>
                      <ul style={{ color: '#9CA3AF', fontSize: '0.9rem', paddingLeft: '20px', margin: '8px 0 0' }}>
                        {data.study.parameters.map((p, i) => (
                          <li key={i}><strong style={{ color: '#FCD34D' }}>[{p.name}]</strong> {p.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Business Japanese */}
            {data.study?.sentence_jp && (
              <div className="daily-section">
                <div className="daily-section-header">
                  <span className="daily-section-icon">🇯🇵</span>
                  <h2 className="daily-section-title">비즈니스 일본어 1-Pick</h2>
                  <button onClick={() => playAudio(data.study.sentence_jp)} style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>
                    🔊 발음 듣기
                  </button>
                </div>
                <div className="daily-card">
                  <div className="study-jp">{data.study.sentence_jp}</div>
                  <div className="study-furigana">{data.study.sentence_furigana}</div>
                  {data.study.sentence_pronunciation_kr && <div className="study-kr" style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>[{data.study.sentence_pronunciation_kr}]</div>}
                  <div className="study-kr" style={{ marginTop: '12px' }}>{data.study.sentence_kr}</div>
                  
                  {(!data.study.prompt_snippet && data.study.business_context) && (
                     <div className="signal-insight" style={{ borderColor: '#3B82F6', marginTop: '16px' }}>
                       💡 {data.study.business_context}
                     </div>
                  )}

                  {data.study.vocabulary && data.study.vocabulary.length > 0 && (
                    <div style={{ marginTop: '24px' }}>
                      <strong style={{ color: '#F3F4F6', fontSize: '1rem', display: 'block', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>📚 핵심 단어장</strong>
                      <div className="study-vocab-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {data.study.vocabulary.map((v, i) => (
                          <div key={i} className="study-vocab-item" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontSize: '1.1rem', color: '#F9FAFB', fontWeight: 'bold' }}>{v.word}</span>
                              <span style={{ color: '#9CA3AF', fontSize: '0.9rem', marginLeft: '8px' }}>({v.reading})</span>
                              {v.pronunciation_kr && <span style={{ color: '#60A5FA', fontSize: '0.85rem', marginLeft: '8px' }}>[{v.pronunciation_kr}]</span>}
                              <div style={{ color: '#D1D5DB', fontSize: '0.95rem', marginTop: '4px' }}>- {v.meaning}</div>
                            </div>
                            <button onClick={() => playAudio(v.word)} style={{ background: 'rgba(139, 92, 246, 0.2)', border: 'none', color: '#C4B5FD', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} title="발음 듣기">
                              🔊
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
}

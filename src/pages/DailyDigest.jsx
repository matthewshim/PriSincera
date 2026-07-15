import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useSEO from '../hooks/useSEO';
import { PAGE_META } from '../data/seoMeta.mjs';
import DailyIntro from '../components/daily/DailyIntro';
import DailyCalendar from '../components/daily/DailyCalendar';
import TrackSignalFeed from '../components/daily/TrackSignalFeed';
import PromptSection from '../components/daily/PromptSection';
import JapaneseSection from '../components/daily/JapaneseSection';
import SignalSection from '../components/daily/SignalSection';
import { getCategoryStyles } from '../components/daily/categoryStyles';
import { useTranslation } from '../contexts/LanguageContext';
import './DailyDigest.css';

const TABS = [
  { key: 'daily', icon: '📝', translationKey: 'dailyDigest.dailyTab' },
  { key: 'intro', icon: '📋', translationKey: 'dailyDigest.introTab' },
];

function formatNavDate(dateStr, locale = 'ko') {
  const [, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(dateStr + 'T00:00:00');
  if (locale === 'en') {
    return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) + ` (${dt.toLocaleDateString('en-US', { weekday: 'short' })})`;
  } else if (locale === 'ja') {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${m}月${d}日(${days[dt.getDay()]})`;
  } else {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}(${days[dt.getDay()]})`;
  }
}

export default function DailyDigest() {
  const { date } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { locale, t } = useTranslation();

  
  useSEO({
    title: date ? `${date} Daily Digest` : PAGE_META['/daily'].pageTitle,
    description: PAGE_META['/daily'].description,
    keywords: PAGE_META['/daily'].keywords,
    ogUrl: `https://www.prisincera.com/daily${date ? `/${date}` : ''}`
  });

  const [activeTab, setActiveTab] = useState(window.location.hash === '#intro' ? 'intro' : 'daily');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null); // Detail data or Archive list
  const [subStatus, setSubStatus] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [detailTab, setDetailTab] = useState('signal');
  
  const [publishedDates, setPublishedDates] = useState([]);
  const [quickPeekDate, setQuickPeekDate] = useState('');
  const [quickPeekData, setQuickPeekData] = useState(null);
  const [quickPeekLoading, setQuickPeekLoading] = useState(false);
  const debounceTimerRef = useRef(null);

  const fetchQuickPeekData = async (targetDate) => {
    setQuickPeekLoading(true);
    try {
      // 다이제스트 + 테크 트랙 티저(주니어 피드)를 병렬 페치 — 트랙은 없어도 무해
      const [res, trackRes] = await Promise.all([
        fetch(`/api/daily/${targetDate}?lang=${locale}`),
        fetch(`/api/daily/${targetDate}/track/junior`).catch(() => null),
      ]);
      if (res.ok) {
        const digest = await res.json();
        if (trackRes && trackRes.ok) {
          try { digest.track = await trackRes.json(); } catch { /* 트랙 파싱 실패 무시 */ }
        }
        setQuickPeekData(digest);
      } else {
        setQuickPeekData(null);
      }
    } catch (err) {
      console.error('Failed to fetch quick peek data', err);
      setQuickPeekData(null);
    } finally {
      setQuickPeekLoading(false);
    }
  };

  const handleHoverDate = (hoveredDate) => {
    if (hoveredDate === quickPeekDate) return;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setQuickPeekDate(hoveredDate);
      fetchQuickPeekData(hoveredDate);
    }, 150);
  };

  const handleSelectDate = (selectedDate) => {
    if (window.innerWidth < 768) {
      setQuickPeekDate(selectedDate);
      fetchQuickPeekData(selectedDate);
      setTimeout(() => {
        document.getElementById('mobile-quick-peek')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      navigate(`/daily/${selectedDate}`);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
    if (location.hash === '#intro') {
      setActiveTab('intro');
    } else if (location.hash === '#daily') {
      setActiveTab('daily');
    }
  }, [location.hash]);

  useEffect(() => {
    fetchData();
  }, [date, locale]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (date) {
        const res = await fetch(`/api/daily/${date}?lang=${locale}`);
        if (res.ok) {
          const digest = await res.json();
          setData(digest);
          if (digest) {
            if (digest.signal && digest.signal.articles && digest.signal.articles.length > 0) {
              setDetailTab('signal');
            } else if (digest.study && digest.study.prompt_snippet) {
              setDetailTab('prompt');
            } else if (digest.study && digest.study.sentence_jp) {
              setDetailTab('japanese');
            }
          }
        } else {
          setData(null);
        }
      } else {
        // Fetch archive list index
        const res = await fetch('/api/daily/index');
        if (res.ok) {
          const indexData = await res.json();
          const dates = indexData.dates || [];
          setPublishedDates(dates);
          setData(dates); // Use dates directly as proof of data existence
          
          // Initial Quick Peek: fetch the most recent date's details
          if (dates.length > 0) {
            const mostRecentDate = dates[0];
            setQuickPeekDate(mostRecentDate);
            fetchQuickPeekData(mostRecentDate);
          }
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
    if (!window.confirm(t('dailyDigest.unsubConfirm'))) {
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
        alert(t('dailyDigest.unsubSuccess'));
      } else {
        setSubStatus('error');
      }
    } catch (err) {
      console.error(err);
      setSubStatus('error');
    }
  };



  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'intro') {
      navigate('/daily#intro');
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
            {t('dailyDigest.heroSubtitle').split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br/>
              </React.Fragment>
            ))}
          </p>
          
          <div className="daily-subscribe-wrap">
            <button 
              className={`btn-primary btn-glow daily-google-sub-btn ${subStatus || 'idle'}`} 
              onClick={handleGoogleSubscribe} 
              disabled={subStatus === 'loading' || subStatus === 'success' || subStatus === 'already_subscribed'}
            >
              {subStatus === 'loading' ? t('dailyDigest.subBtnSyncing') : 
               subStatus === 'success' ? t('dailyDigest.subBtnSuccess') : 
               subStatus === 'already_subscribed' ? t('dailyDigest.subBtnAlreadySubbed') : t('dailyDigest.subBtnFreeSub')}
            </button>
            
            {(subStatus === 'success' || subStatus === 'already_subscribed') && (
              <div style={{ marginTop: '12px', textAlign: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={async () => { await logout(); setSubStatus(''); setSubEmail(''); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.7 }}
                >
                  {t('dailyDigest.subOtherAccount')}
                </button>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.5 }}>|</span>
                <button 
                  onClick={handleUnsubscribe}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.7 }}
                >
                  {t('dailyDigest.subCancel')}
                </button>
              </div>
            )}

            {subStatus === 'error' && <div className="sub-msg error">{t('dailyDigest.subError')}</div>}
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
                className={`daily-tab haptic-trigger${isSelected ? ' active' : ''}`}
                onClick={() => handleTabChange(tab.key)}
              >
                <span className="daily-tab-icon">{tab.icon}</span>
                <span className="daily-tab-label">{t(tab.translationKey)}</span>
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
          <div className="daily-bento-portal">
            <div className="bento-calendar-section">
              {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>{t('dailyDigest.calendarLoading')}</div>
              ) : (
                <DailyCalendar 
                  publishedDates={publishedDates} 
                  onSelectDate={handleSelectDate} 
                  onHoverDate={handleHoverDate} 
                />
              )}
            </div>
            
            <div className="bento-quick-peek-section" id="mobile-quick-peek">
              {quickPeekDate ? (
                <div className="quick-peek-card-wrapper">
                  <div className="quick-peek-header">
                    <span className="quick-peek-label">★ Quick Peek</span>
                    <span className="quick-peek-date">{quickPeekDate}</span>
                  </div>
                  
                  <div className={`quick-peek-body-container ${quickPeekLoading ? 'loading' : ''}`}>
                    {quickPeekLoading && (
                      <div className="quick-peek-blur-loader">
                        <div className="spinner"></div>
                        <span>{t('dailyDigest.analyzingData')}</span>
                      </div>
                    )}
                    
                    {quickPeekData ? (
                      <div className="quick-peek-data-pane">
                        {/* 1. IT Tech Signals */}
                        {quickPeekData.signal?.articles && quickPeekData.signal.articles.length > 0 && (
                          <div className="quick-peek-group signal">
                            <h4 className="group-title">📰 {t('dailyDigest.tabTechSignals')}</h4>
                            <div className="group-items">
                              {quickPeekData.signal.articles.slice(0, 2).map((art, idx) => (
                                <div key={idx} className="peek-item flat">
                                  <span className="peek-bullet" style={{ color: getCategoryStyles(art.category).color || 'var(--color-indigo)' }}>✦</span>
                                  <span className="peek-text">{art.title}</span>
                                </div>
                              ))}
                              {quickPeekData.signal.articles.length > 2 && (
                                <span className="peek-more-indicator">{t('dailyDigest.moreSignals').replace('{count}', quickPeekData.signal.articles.length - 2)}</span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* 2. AI Workstation */}
                        {quickPeekData.study?.prompt_snippet && (
                          <div className="quick-peek-group prompt">
                            <h4 className="group-title">🤖 {t('dailyDigest.tabAiWorkstation')}</h4>
                            <div className="peek-item highlight-ai">
                              <span className="peek-icon">⚡</span>
                              <span className="peek-text ai-text">
                                {quickPeekData.study.prompt_snippet.substring(0, 80)}
                                {quickPeekData.study.prompt_snippet.length > 80 ? '...' : ''}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* 3. Japanese Sentence */}
                        {quickPeekData.study?.sentence_jp && (
                          <div className="quick-peek-group japanese">
                            <h4 className="group-title">🇯🇵 {t('dailyDigest.tabLangDojo')}</h4>
                            <div className="peek-item highlight-jp">
                              <span className="peek-icon">🎌</span>
                              <span className="peek-text jp-text">{quickPeekData.study.sentence_jp}</span>
                            </div>
                          </div>
                        )}

                        {/* 4. Tech Track (주니어 트랙 티저) */}
                        {quickPeekData.track?.cards && quickPeekData.track.cards.length > 0 && (
                          <div className="quick-peek-group track">
                            <h4 className="group-title">🛰️ 테크 트랙</h4>
                            <div className="group-items">
                              {quickPeekData.track.cards.slice(0, 2).map((card, idx) => (
                                <div key={idx} className="peek-item flat">
                                  <span className="peek-bullet" style={{ color: 'var(--color-cyan)' }}>✦</span>
                                  <span className="peek-text">{card.title}</span>
                                </div>
                              ))}
                              {quickPeekData.track.cards.length > 2 && (
                                <span className="peek-more-indicator">+{quickPeekData.track.cards.length - 2} 카드</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Read Full Button */}
                        <button 
                          onClick={() => navigate(`/daily/${quickPeekDate}`)}
                          className="btn-primary btn-glow quick-peek-action-btn"
                        >
                          {t('dailyDigest.viewFullContent')}
                        </button>
                      </div>
                    ) : (
                      <div className="quick-peek-empty">{t('dailyDigest.noQuickPeekData')}</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="quick-peek-welcome">
                  <div className="welcome-icon">📅</div>
                  <h4>{t('dailyDigest.chronoCalendarPortal')}</h4>
                  <p>{t('dailyDigest.chronoCalendarDesc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Localized Date Parts
  const dObj = new Date(date + 'T00:00:00');
  const monthStr = locale === 'en' ? dObj.toLocaleDateString('en-US', { month: 'short' }) : locale === 'ja' ? `${dObj.getMonth() + 1}月` : `${dObj.getMonth() + 1}월`;
  const dowStr = locale === 'en' ? dObj.toLocaleDateString('en-US', { weekday: 'short' }) : locale === 'ja' ? `${['日', '月', '火', '水', '木', '金', '土'][dObj.getDay()]}曜日` : `${['일', '월', '화', '수', '목', '금', '토'][dObj.getDay()]}요일`;
  const dayNum = dObj.getDate();

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
              {formatNavDate(new Date(new Date(date).setDate(new Date(date).getDate() - 1)).toISOString().slice(0, 10), locale)}
            </span>
          </button>
          
          <div className="daily-date-center">
            <span className="daily-date-day">{dayNum}</span>
            <div className="daily-date-month-dow">
              <span className="daily-date-month">{monthStr}</span>
              <span className="daily-date-dow">{dowStr}</span>
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
                    {formatNavDate(nextStr, locale)}
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
            {t('dailyDigest.returnToList')}
          </button>
        </div>
      </div>

      <div className={`daily-feed-container theme-${detailTab}`}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '40px 0' }}>{t('dailyDigest.loadingData')}</div>
        ) : !data ? (
          <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '40px 0' }}>{t('dailyDigest.noDataForDate')}</div>
        ) : (
          <>
            {/* ── Workspace Segmented Tab Switcher ── */}
            <div className="workspace-tab-switcher">
              {data.signal && data.signal.articles && data.signal.articles.length > 0 && (
                <button 
                  className={`workspace-tab-btn haptic-trigger ${detailTab === 'signal' ? 'active' : ''}`}
                  onClick={() => setDetailTab('signal')}
                >
                  <span className="btn-icon">📰</span>
                  <div className="btn-label-group">
                    <span className="btn-title">{t('dailyDigest.tabTechSignals')}</span>
                    <span className="btn-meta">{data.signal.articles.length} Signals</span>
                  </div>
                </button>
              )}
              {data.study?.prompt_snippet && (
                <button 
                  className={`workspace-tab-btn haptic-trigger ${detailTab === 'prompt' ? 'active' : ''}`}
                  onClick={() => setDetailTab('prompt')}
                >
                  <span className="btn-icon">🤖</span>
                  <div className="btn-label-group">
                    <span className="btn-title">{t('dailyDigest.tabAiWorkstation')}</span>
                    <span className="btn-meta">Prompt Terminal</span>
                  </div>
                </button>
              )}
              {data.study?.sentence_jp && (
                <button 
                  className={`workspace-tab-btn haptic-trigger ${detailTab === 'japanese' ? 'active' : ''}`}
                  onClick={() => setDetailTab('japanese')}
                >
                  <span className="btn-icon">🇯🇵</span>
                  <div className="btn-label-group">
                    <span className="btn-title">{t('dailyDigest.tabLangDojo')}</span>
                    <span className="btn-meta">Business Study</span>
                  </div>
                </button>
              )}
              {data?.date && (
                <button
                  className={`workspace-tab-btn haptic-trigger ${detailTab === 'track' ? 'active' : ''}`}
                  onClick={() => setDetailTab('track')}
                >
                  <span className="btn-icon">🛰️</span>
                  <div className="btn-label-group">
                    <span className="btn-title">테크 트랙</span>
                    <span className="btn-meta">Junior / Senior</span>
                  </div>
                </button>
              )}
            </div>

            {/* ── Active Workspace Panels ── */}
            <div className="workspace-content-pane">
              {/* 1. IT Tech Signal — ReLearn Phase B-0 추출 컴포넌트 (동작 동일) */}
              {detailTab === 'signal' && <SignalSection signal={data.signal} />}

              {/* 2. AI Prompt — ReLearn Phase B-0 추출 컴포넌트 (동작 동일) */}
              {detailTab === 'prompt' && <PromptSection study={data.study} />}

              {/* 3. Business Japanese — ReLearn Phase B-0 추출 컴포넌트 (동작 동일) */}
              {detailTab === 'japanese' && <JapaneseSection study={data.study} />}

              {/* 4. Tech Track Signal (Data Contract v2 — junior/senior) */}
              {detailTab === 'track' && data?.date && (
                <TrackSignalFeed date={data.date} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

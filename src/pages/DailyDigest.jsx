import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useSEO from '../hooks/useSEO';
import DailyIntro from '../components/daily/DailyIntro';
import DailyCalendar from '../components/daily/DailyCalendar';
import { useTranslation } from '../contexts/LanguageContext';
import './DailyDigest.css';

const TABS = [
  { key: 'intro', icon: '📋', translationKey: 'dailyDigest.introTab' },
  { key: 'daily', icon: '📝', translationKey: 'dailyDigest.dailyTab' },
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
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [detailTab, setDetailTab] = useState('signal');
  
  const [publishedDates, setPublishedDates] = useState([]);
  const [quickPeekDate, setQuickPeekDate] = useState('');
  const [quickPeekData, setQuickPeekData] = useState(null);
  const [quickPeekLoading, setQuickPeekLoading] = useState(false);
  const debounceTimerRef = useRef(null);

  const fetchQuickPeekData = async (targetDate) => {
    setQuickPeekLoading(true);
    try {
      const res = await fetch(`/api/daily/${targetDate}?lang=${locale}`);
      if (res.ok) {
        const digest = await res.json();
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

  const synth = window.speechSynthesis;

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

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
    if (cat.includes('ai') || cat.includes('인공지능') || cat.includes('intelligence')) 
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
            {t('dailyDigest.heroSubtitle').split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br/>
              </React.Fragment>
            ))}
          </p>
          
          <div className="daily-subscribe-wrap">
            <button 
              className={`daily-google-sub-btn ${subStatus || 'idle'}`} 
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
                className={`daily-tab${isSelected ? ' active' : ''}`}
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
                                  <span className="peek-bullet" style={{ color: getCategoryStyles(art.category).color || '#A78BFA' }}>✦</span>
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
                        
                        {/* Read Full Button */}
                        <button 
                          onClick={() => navigate(`/daily/${quickPeekDate}`)}
                          className="quick-peek-action-btn"
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
                  className={`workspace-tab-btn ${detailTab === 'signal' ? 'active' : ''}`}
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
                  className={`workspace-tab-btn ${detailTab === 'prompt' ? 'active' : ''}`}
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
                  className={`workspace-tab-btn ${detailTab === 'japanese' ? 'active' : ''}`}
                  onClick={() => setDetailTab('japanese')}
                >
                  <span className="btn-icon">🇯🇵</span>
                  <div className="btn-label-group">
                    <span className="btn-title">{t('dailyDigest.tabLangDojo')}</span>
                    <span className="btn-meta">Business Study</span>
                  </div>
                </button>
              )}
            </div>

            {/* ── Active Workspace Panels ── */}
            <div className="workspace-content-pane">
              {/* 1. IT Tech Signal */}
              {detailTab === 'signal' && data.signal && (
                <div className="daily-section fade-in">
                  <div className="daily-section-header">
                    <span className="daily-section-icon">📰</span>
                    <h2 className="daily-section-title">IT Tech Signal</h2>
                  </div>
                  <div className="signal-articles-grid">
                    {[...(data.signal.articles || [])]
                      .sort((a, b) => {
                        if (a.isDmPick && !b.isDmPick) return -1;
                        if (!a.isDmPick && b.isDmPick) return 1;
                        return b.weightedScore - a.weightedScore;
                      })
                      .map((article, idx) => (
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className={`signal-article-card ${article.isDmPick ? 'dm-featured-card' : ''}`} key={idx}>
                        {article.og_image && (
                          <div className="signal-article-image">
                            <img src={article.og_image} alt={article.title} loading="lazy" />
                          </div>
                        )}
                        <div className="signal-article-body">
                          <div className="signal-article-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            {article.isDmPick && (
                              <span className="dm-pick-badge">
                                ✦ DM Pick
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
                              {article.source && <span className="article-source-name">{article.source}</span>}
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
              {detailTab === 'prompt' && data.study?.prompt_snippet && (
                <div className="daily-section fade-in">
                  <div className="daily-section-header">
                    <span className="daily-section-icon">🤖</span>
                    <h2 className="daily-section-title">{t('dailyDigest.aiPromptOnePick')}</h2>
                  </div>
                  <div className="ai-prompt-card">
                    <div className="terminal-header">
                      <div className="terminal-dots">
                        <span className="dot red"></span>
                        <span className="dot yellow"></span>
                        <span className="dot green"></span>
                      </div>
                      <div className="terminal-title">SYSTEM PROMPT // terminal</div>
                      <button className={`terminal-copy-btn ${copiedPrompt ? 'copied' : ''}`} onClick={() => copyToClipboard(data.study.prompt_snippet)}>
                        {copiedPrompt ? t('dailyDigest.copied') : t('dailyDigest.copy')}
                      </button>
                    </div>
                    <div className="terminal-body">
                      <div className="study-snippet-container">
                        <pre className="study-snippet"><code>{data.study.prompt_snippet}</code></pre>
                      </div>
                      {data.study.explanation && <div className="study-kr">{data.study.explanation}</div>}
                      {data.study.business_context && (
                        <div className="signal-insight ai-insight">
                          <div className="insight-badge">{t('dailyDigest.practicalTip')}</div>
                          <p>{data.study.business_context}</p>
                        </div>
                      )}
                      {data.study.parameters && data.study.parameters.length > 0 && (
                        <div className="prompt-params-container">
                          <div className="params-header">{t('dailyDigest.promptParams')}</div>
                          <div className="params-table">
                            <div className="params-table-header">
                              <span className="col-name">{t('dailyDigest.paramNameCol')}</span>
                              <span className="col-desc">{t('dailyDigest.paramDescCol')}</span>
                            </div>
                            <div className="params-list">
                              {data.study.parameters.map((p, i) => (
                                <div key={i} className="param-row">
                                  <span className="param-name">[{p.name}]</span>
                                  <span className="param-desc">{p.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Business Japanese */}
              {detailTab === 'japanese' && data.study?.sentence_jp && (
                <div className="daily-section fade-in">
                  <div className="daily-section-header">
                    <span className="daily-section-icon">🇯🇵</span>
                    <h2 className="daily-section-title">{t('dailyDigest.businessJpOnePick')}</h2>
                    <button className="japanese-audio-play-main" onClick={() => playAudio(data.study.sentence_jp)}>
                      <svg viewBox="0 0 24 24" width="14" height="14" style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}>
                        <path fill="currentColor" d="M12 3v18l-6-6H2V9h4l6-6zm4.5 9c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v2.06c2.89.86 5 3.54 5 6.49s-2.11 5.63-5 6.49v2.06c4.01-.91 7-4.49 7-8.55s-2.99-7.64-7-8.55z"/>
                      </svg>
                      {t('dailyDigest.playFullAudio')}
                    </button>
                  </div>
                  <div className="japanese-study-card">
                    <div className="japanese-hero-block">
                      <div className="japanese-sentence-box">
                        <div className="study-jp">{data.study.sentence_jp}</div>
                        <div className="study-furigana">{data.study.sentence_furigana}</div>
                      </div>
                      {data.study.sentence_pronunciation_kr && (
                        <div className="study-pronunciation">
                          <span className="pronunciation-label">{t('dailyDigest.koreanPronunciation')}</span>
                          <span className="pronunciation-text">[{data.study.sentence_pronunciation_kr}]</span>
                        </div>
                      )}
                      <div className="study-translation">
                        {data.study.sentence_kr}
                      </div>
                    </div>
                    
                    {(!data.study.prompt_snippet && data.study.business_context) && (
                       <div className="signal-insight jp-insight">
                         <div className="insight-badge">{t('dailyDigest.businessContextTip')}</div>
                         <p>{data.study.business_context}</p>
                       </div>
                    )}

                    {data.study.vocabulary && data.study.vocabulary.length > 0 && (
                      <div className="vocab-section">
                        <h3 className="vocab-title">{t('dailyDigest.keyVocab')}</h3>
                        <div className="study-vocab-grid">
                          {data.study.vocabulary.map((v, i) => (
                            <div key={i} className="study-vocab-card">
                              <div className="vocab-card-header">
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span className="vocab-word">{v.word}</span>
                                  <span className="vocab-reading">[{v.reading}]</span>
                                </div>
                                <button 
                                  className="vocab-audio-btn" 
                                  onClick={() => playAudio(v.word)}
                                  title={t('dailyDigest.listenPron')}
                                >
                                  <svg className="play-svg" viewBox="0 0 24 24" width="12" height="12">
                                    <path fill="currentColor" d="M12 3v18l-6-6H2V9h4l6-6zm4.5 9c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                                  </svg>
                                </button>
                              </div>
                              {v.pronunciation_kr && (
                                <span className="vocab-pronunciation">[{v.pronunciation_kr}]</span>
                              )}
                              <div className="vocab-meaning">{v.meaning}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

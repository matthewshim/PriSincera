import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import PriStudyHero from '../components/pristudy/PriStudyHero';
import PriStudyIntro from '../components/pristudy/PriStudyIntro';
import PriStudyDaily from '../components/pristudy/PriStudyDaily';
import './PriStudy.css';

const TABS = [
  { key: 'intro', label: '서비스 소개', icon: '📋' },
  { key: 'daily', label: '데일리 스터디', icon: '🇯🇵' },
];

export default function PriStudy() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('intro');
  const tabsRef = useRef(null);
  const indicatorRef = useRef(null);
  const tabsNavRef = useRef(null);

  // -- Daily Study State --
  const [token, setToken] = useState(() => localStorage.getItem('pristudy_token'));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('pristudy_email'));
  const [showAuth, setShowAuth] = useState(false);
  const [dailyContent, setDailyContent] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const todayStr = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const synth = window.speechSynthesis;

  // -- Tab Indicator Logic --
  const updateIndicator = useCallback(() => {
    if (!tabsRef.current || !indicatorRef.current) return;
    const activeBtn = tabsRef.current.querySelector('.pristudy-tab.active');
    if (!activeBtn) return;
    const containerRect = tabsRef.current.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    indicatorRef.current.style.left = `${btnRect.left - containerRect.left}px`;
    indicatorRef.current.style.width = `${btnRect.width}px`;
  }, []);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab, updateIndicator]);

  useEffect(() => {
    const gnb = document.querySelector('.nav');
    if (!gnb || !tabsNavRef.current) return;

    const syncTop = () => {
      const h = gnb.getBoundingClientRect().height;
      tabsNavRef.current.style.top = `${h}px`;
    };

    syncTop();
    const ro = new ResizeObserver(syncTop);
    ro.observe(gnb);
    window.addEventListener('scroll', syncTop, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', syncTop);
    };
  }, []);

  useEffect(() => {
    if (location.hash === '#daily') {
      setActiveTab('daily');
    }
  }, [location.hash]);

  // -- Data Fetching --
  const fetchData = async () => {
    setLoading(true);
    try {
      const contentRes = await fetch(`/api/study/daily/${todayStr}`);
      if (contentRes.ok) {
        setDailyContent(await contentRes.json());
      }
      
      if (token) {
        const progRes = await fetch('/api/study/progress', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (progRes.ok) {
          setProgress(await progRes.json());
        } else if (progRes.status === 401) {
          handleLogout();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'PriStudy — 하루 5분 실무 비즈니스 일본어';
    if (activeTab === 'daily' && !token) setShowAuth(true);
    fetchData();
  }, [token, activeTab]);

  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => {
      document.body.classList.remove('hero-ready');
    };
  }, []);

  // -- Event Handlers --
  const handleLoginSuccess = (idToken, email) => {
    setToken(idToken);
    setUserEmail(email);
    localStorage.setItem('pristudy_token', idToken);
    localStorage.setItem('pristudy_email', email);
    setShowAuth(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUserEmail(null);
    localStorage.removeItem('pristudy_token');
    localStorage.removeItem('pristudy_email');
    setShowAuth(true);
  };

  const playAudio = (e) => {
    e.stopPropagation();
    if (!dailyContent?.sentence_jp) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(dailyContent.sentence_jp);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    const voices = synth.getVoices();
    const jpVoice = voices.find(v => v.lang.includes('ja') || v.lang.includes('JP'));
    if (jpVoice) utterance.voice = jpVoice;
    synth.speak(utterance);
  };

  const markCompleted = async () => {
    if (!token || !dailyContent || isMarking) return;
    setIsMarking(true);
    try {
      const res = await fetch(`/api/study/progress/${todayStr}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
        alert('오늘의 학습이 완료되었습니다! 👏 잔디가 심어졌습니다.');
      }
    } catch (err) {
      alert('완료 처리 중 오류가 발생했습니다.');
    } finally {
      setIsMarking(false);
    }
  };

  const isTodayCompleted = progress?.completed_dates?.includes(todayStr);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dt = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return dt.toISOString().slice(0, 10);
  });

  const handleTabChange = (key) => {
    setActiveTab(key);
    const tabBar = document.getElementById('pristudy-tabs');
    if (tabBar) {
      const top = tabBar.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="pristudy-page">
      <PriStudyHero activeTab={activeTab} onTabChange={handleTabChange} />

      {/* ── Sub-tab navigation ── */}
      <nav className="pristudy-tabs-nav" id="pristudy-tabs" ref={tabsNavRef} role="tablist">
        <div className="pristudy-tabs-inner" ref={tabsRef}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`pristudy-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              <span className="pristudy-tab-icon">{tab.icon}</span>
              <span className="pristudy-tab-label">{tab.label}</span>
            </button>
          ))}
          <span className="pristudy-tab-indicator" ref={indicatorRef} />
        </div>
      </nav>

      {/* ── Tab panels ── */}
      <div className="pristudy-tab-panel" hidden={activeTab !== 'intro'}>
        <PriStudyIntro />
      </div>

      <div className="pristudy-tab-panel" hidden={activeTab !== 'daily'}>
        <PriStudyDaily 
          showAuth={showAuth}
          loading={loading}
          dailyContent={dailyContent}
          isFlipped={isFlipped}
          setIsFlipped={setIsFlipped}
          playAudio={playAudio}
          markCompleted={markCompleted}
          isTodayCompleted={isTodayCompleted}
          isMarking={isMarking}
          progress={progress}
          last7Days={last7Days}
          todayStr={todayStr}
          handleLoginSuccess={handleLoginSuccess}
          userEmail={userEmail}
          handleLogout={handleLogout}
        />
      </div>
    </div>
  );
}

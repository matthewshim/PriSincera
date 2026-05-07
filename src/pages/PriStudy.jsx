import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import PriStudyHero from '../components/study/PriStudyHero';
import PriStudyIntro from '../components/study/PriStudyIntro';
import PriStudyDaily from '../components/study/PriStudyDaily';
import PriStudyArchive from '../components/study/PriStudyArchive';
import './PriStudy.css';

const TABS = [
  { key: 'intro', label: '서비스 소개', icon: '📋' },
  { key: 'daily', label: '데일리 스터디', icon: '📝' },
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

  const { date } = useParams();
  const navigate = useNavigate();

  const todayStr = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const targetDate = date || todayStr;
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
    const tId = setTimeout(updateIndicator, 50);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(tId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeTab, updateIndicator, date]);

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
      const contentRes = await fetch(`/api/study/daily/${targetDate}`);
      if (contentRes.ok) {
        setDailyContent(await contentRes.json());
      } else {
        setDailyContent(null);
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
    document.title = 'Study — 하루 5분, 실무 지식 1-Pick';
    if (activeTab === 'daily' && !token) setShowAuth(true);
    fetchData();
  }, [token, activeTab, targetDate]);

  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => {
      document.body.classList.remove('hero-ready');
    };
  }, []);

  // -- Event Handlers --
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      
      setToken(idToken);
      setUserEmail(user.email);
      localStorage.setItem('pristudy_token', idToken);
      localStorage.setItem('pristudy_email', user.email);
      setShowAuth(false);
      
      if (activeTab !== 'daily') {
        handleTabChange('daily');
      }
    } catch (error) {
      console.error('Google login failed:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setToken(null);
    setUserEmail(null);
    localStorage.removeItem('pristudy_token');
    localStorage.removeItem('pristudy_email');
    setShowAuth(true);
  };

  const playAudio = (text, e) => {
    if (e) e.stopPropagation();
    const textToPlay = typeof text === 'string' ? text : dailyContent?.sentence_jp;
    if (!textToPlay) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(textToPlay);
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

  if (date) {
    return (
      <div className="pristudy-page">
        {/* ── Sub-tab navigation ── */}
        <nav className="pristudy-tabs-nav" ref={tabsNavRef} role="tablist">
          <div className="pristudy-tabs-inner" ref={tabsRef}>
            <Link to="/study" className="pristudy-tab">
              <span className="pristudy-tab-icon">📖</span>
              <span className="pristudy-tab-label">서비스 소개</span>
            </Link>
            <Link to="/study#daily" className="pristudy-tab active">
              <span className="pristudy-tab-icon">🗓️</span>
              <span className="pristudy-tab-label">데일리 스터디</span>
            </Link>
            <span className="pristudy-tab-indicator" ref={indicatorRef} />
          </div>
        </nav>

        <PriStudyDaily 
          showAuth={showAuth}
          loading={loading}
          dailyContent={dailyContent}
          isFlipped={isFlipped}
          setIsFlipped={setIsFlipped}
          playAudio={playAudio}
          markCompleted={markCompleted}
          isTodayCompleted={progress?.completed_dates?.includes(targetDate)}
          isMarking={isMarking}
          progress={progress}
          last7Days={last7Days}
          todayStr={todayStr}
          targetDate={targetDate}
          handleGoogleLogin={handleGoogleLogin}
          userEmail={userEmail}
          handleLogout={handleLogout}
          navigate={navigate}
        />
      </div>
    );
  }

  return (
    <div className="pristudy-page">
      <PriStudyHero 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        token={token}
        handleGoogleLogin={handleGoogleLogin}
        userEmail={userEmail}
        handleLogout={handleLogout}
      />

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
        <PriStudyArchive />
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './AdminDashboard.css';

// 서비스 문서 허브 — docs 전체를 번들하므로 별도 청크로 lazy 로드
const ServiceDocs = lazy(() => import('../components/admin/ServiceDocs'));

const API_BASE = '/admin/api';

const PACENOTE_CATEGORIES = [
  'Mindset',
  'Branding',
  'Deep Work',
  'Networking',
  'Productivity',
  'AI & Future',
  'Vision',
  'Inspiration',
  'Environment',
  'Problem Solving',
  'Learning',
  'Health'
];

/**
 * Firebase Auth — REST API 인증
 */
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY || '';

import { initializeApp, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, setPersistence, browserSessionPersistence } from 'firebase/auth';

// ─── Admin 전용 별도 Firebase 인스턴스 (세션 분리) ───
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "prisincera.firebaseapp.com",
  projectId: "prisincera",
};
let adminApp;
try {
  adminApp = initializeApp(firebaseConfig, 'adminApp');
} catch (e) {
  // 이미 초기화된 경우
  adminApp = getApp('adminApp');
}
const adminAuth = getAuth(adminApp);
setPersistence(adminAuth, browserSessionPersistence);
const adminGoogleProvider = new GoogleAuthProvider();

// ─── Login Component ─────────────────────────────

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signInWithEmailAndPassword(adminAuth, email, password);
      const token = await result.user.getIdToken();
      onLogin(token, result.user.email);
    } catch (err) {
      setError(err.code === 'auth/invalid-login-credentials' || err.code === 'auth/wrong-password'
        ? '이메일 또는 비밀번호가 올바르지 않습니다.'
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(adminAuth, adminGoogleProvider);
      const token = await result.user.getIdToken();
      onLogin(token, result.user.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-logo">🛡️</div>
        <h1>PriSincera Admin</h1>
        <p className="admin-login-sub">관리자 인증이 필요합니다</p>
        <form onSubmit={handleSubmit}>
          <input
            id="admin-email" type="email" placeholder="관리자 이메일"
            value={email} onChange={e => setEmail(e.target.value)} required autoFocus
          />
          <input
            id="admin-password" type="password" placeholder="비밀번호"
            value={password} onChange={e => setPassword(e.target.value)} required
          />
          {error && <div className="admin-error">{error}</div>}
          <button id="admin-login-btn" type="submit" className="btn-primary" disabled={loading} style={{ marginBottom: 12 }}>
            {loading ? '인증 중...' : '이메일로 로그인'}
          </button>
          <button type="button" onClick={handleGoogleLogin} disabled={loading} style={{ background: '#4285F4', width: '100%', padding: '12px', borderRadius: '8px', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Google 계정으로 로그인
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── API Helper ──────────────────────────────────

function useAdminApi(token) {
  const fetchApi = useCallback(async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 401) throw new Error('AUTH_EXPIRED');
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `API Error: ${res.status}`);
    }
    return res.json();
  }, [token]);
  return fetchApi;
}

// ─── Dashboard Component ─────────────────────────

function Dashboard({ token, adminEmail, onLogout }) {
  const fetchApi = useAdminApi(token);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [sendStatus, setSendStatus] = useState(null);

  // Role & Profile
  const [role, setRole] = useState('admin');
  const [profile, setProfile] = useState(null);
  const [profileModal, setProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ displayName: '', password: '' });
  const [profileAction, setProfileAction] = useState(null);

  // Admin CRUD
  const [admins, setAdmins] = useState([]);
  const [adminModal, setAdminModal] = useState(null);
  const [adminForm, setAdminForm] = useState({ email: '', password: '', displayName: '', role: 'admin' });
  const [adminAction, setAdminAction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // PriStudy & Content
  const [priStudyStats, setPriStudyStats] = useState(null);
  const [dailyContent, setDailyContent] = useState([]);
  const [contentModal, setContentModal] = useState(null);
  // 테크 트랙 모니터링
  const [contentSubTab, setContentSubTab] = useState('legacy'); // 'legacy' | 'track'
  const [trackStatus, setTrackStatus] = useState(null);
  const [trackJobStatus, setTrackJobStatus] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackRunning, setTrackRunning] = useState(false);
  const [trackDetail, setTrackDetail] = useState(null); // { date, junior, senior } 모달
  const [trackDetailLoading, setTrackDetailLoading] = useState(false);
  const [contentModalTab, setContentModalTab] = useState('basic');
  const [contentForm, setContentForm] = useState(null);
  const [contentAction, setContentAction] = useState(null);
  const [contentFormLocale, setContentFormLocale] = useState('ko');

  // Pace Note
  const [pacers, setPacers] = useState([]);
  const [paceInsights, setPaceInsights] = useState([]);
  const [poolStats, setPoolStats] = useState({});
  const [pacePool, setPacePool] = useState([]);
  const [paceMeta, setPaceMeta] = useState({});
  const [poolModal, setPoolModal] = useState(null);
  const [poolForm, setPoolForm] = useState({ id: '', title: { ko: '', en: '', ja: '' }, category: '', color: '#60A5FA', difficulty: 1, weight: 1.0, isActive: true });
  const [poolFormLocale, setPoolFormLocale] = useState('ko');
  const [poolAction, setPoolAction] = useState(null);

  // Builder's Log
  const [buildersLogMeta, setBuildersLogMeta] = useState([]);
  const [buildersLogStats, setBuildersLogStats] = useState({});
  const [buildersLogModal, setBuildersLogModal] = useState(null);
  const [buildersLogForm, setBuildersLogForm] = useState({
    id: '', slug: '', chapterNo: '',
    title: { ko: '', en: '', ja: '' },
    subtitle: { ko: '', en: '', ja: '' },
    description: { ko: '', en: '', ja: '' },
    date: '', tags: '', accent: '#6D28D9', commits: '',
    markdown: { ko: '', en: '', ja: '' }
  });
  const [buildersLogAction, setBuildersLogAction] = useState(null);
  const [buildersLogActiveTab, setBuildersLogActiveTab] = useState('ko');

  const isSuperAdmin = role === 'super_admin';

  const parseLocaleField = (val) => {
    if (!val) return { ko: '', en: '', ja: '' };
    if (typeof val === 'object') {
      return {
        ko: val.ko || '',
        en: val.en || '',
        ja: val.ja || '',
      };
    }
    return { ko: val, en: '', ja: '' };
  };

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [statsRes, pipelineRes, verifyRes] = await Promise.allSettled([
        fetchApi('/stats'),
        fetchApi('/pipeline/status'),
        fetchApi('/auth/verify'),
      ]);
      setStats(statsRes.status === 'fulfilled' ? statsRes.value : {
        subscribers: { active: 0, total: 0, unsubscribed: 0 },
        emails: { totalSent: 0, lastSentDate: null },
      });
      setPipeline(pipelineRes.status === 'fulfilled' ? pipelineRes.value : {
        collector: { status: 'pending', lastRun: null }, totalDates: 0, recentDates: [],
      });
      if (verifyRes.status === 'fulfilled') {
        setRole(verifyRes.value.role || 'admin');
      }
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') onLogout();
    }
    setLoading(false);
  }

  // ─── Profile ──────────────────────────────────

  async function openProfile() {
    try {
      const data = await fetchApi('/profile');
      setProfile(data);
      setProfileForm({ displayName: data.displayName || '', password: '' });
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') return onLogout();
      // API 실패해도 기본 정보로 모달 열기
      setProfile({ uid: '', email: adminEmail, displayName: '', role, createdAt: null, lastSignIn: null });
      setProfileForm({ displayName: '', password: '' });
    }
    setProfileAction(null);
    setProfileModal(true);
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileAction({ type: 'loading', msg: '저장 중...' });
    try {
      const hasNameChange = profileForm.displayName !== (profile?.displayName || '');
      const hasPasswordChange = !!profileForm.password;
      if (!hasNameChange && !hasPasswordChange) {
        setProfileAction({ type: 'error', msg: '변경할 내용이 없습니다' });
        return;
      }
      if (hasPasswordChange && profileForm.password.length < 8) {
        setProfileAction({ type: 'error', msg: '비밀번호는 8자 이상이어야 합니다' });
        return;
      }

      // 모든 프로필 변경을 Firebase Client REST API로 직접 처리 (서버 불필요)
      const updateBody = { idToken: token, returnSecureToken: true };
      if (hasPasswordChange) updateBody.password = profileForm.password;
      if (hasNameChange) updateBody.displayName = profileForm.displayName;

      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateBody),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        const msg = err.error?.message || '프로필 수정 실패';
        if (msg === 'WEAK_PASSWORD : Password should be at least 6 characters') throw new Error('비밀번호가 너무 약합니다');
        if (msg.includes('TOKEN_EXPIRED') || msg.includes('INVALID_ID_TOKEN')) throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        throw new Error(msg);
      }
      const result = await res.json();

      // 새 토큰으로 세션 갱신
      if (result.idToken) {
        sessionStorage.setItem('admin_token', result.idToken);
      }

      setProfileAction({ type: 'success', msg: '✅ 프로필이 수정되었습니다' });
      setTimeout(() => {
        setProfileModal(false);
        window.location.reload();
      }, 1200);
    } catch (err) {
      setProfileAction({ type: 'error', msg: `❌ ${err.message}` });
    }
  }

  // ─── Data Loaders ─────────────────────────────

  async function loadSubscribers() {
    try {
      const data = await fetchApi('/subscribers?limit=50');
      setSubscribers(data.subscribers || []);
    } catch (err) { if (err.message === 'AUTH_EXPIRED') onLogout(); }
  }

  async function loadEmailLogs() {
    try {
      const data = await fetchApi('/email/logs?limit=20');
      setEmailLogs(data.logs || []);
    } catch (err) { if (err.message === 'AUTH_EXPIRED') onLogout(); }
  }

  async function exportCsv() {
    try {
      const res = await fetch(`${API_BASE}/subscribers/export`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `subscribers_${new Date().toISOString().slice(0,10)}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch (err) { console.error('Export failed:', err); }
  }

  async function sendTestEmail() {
    if (!testEmail) return;
    setSendStatus({ type: 'loading', msg: '발송 중...' });
    try {
      const result = await fetchApi('/email/send-test', {
        method: 'POST', body: JSON.stringify({ to: testEmail }),
      });
      setSendStatus({ type: 'success', msg: `✅ 발송 성공 (${result.messageId})` });
    } catch (err) {
      setSendStatus({ type: 'error', msg: `❌ 발송 실패: ${err.message}` });
    }
  }

  // ─── Study Loaders & Handlers ─────────────────
  
  async function loadPriStudyStats() {
    try {
      const res = await fetchApi('/pristudy/stats');
      setPriStudyStats(res);
      // Fetch Builder's Log stats as well
      const logRes = await fetchApi('/builderslog/stats');
      setBuildersLogStats(logRes);
    } catch (e) {
      if (e.message === 'AUTH_EXPIRED') onLogout();
    }
  }

  async function loadDailyContent() {
    try {
      const data = await fetchApi('/daily/content');
      setDailyContent(data.contents || []);
    } catch (err) { if (err.message === 'AUTH_EXPIRED') onLogout(); }
  }

  // ── 테크 트랙 모니터링 핸들러 ──
  async function loadTrackStatus() {
    setTrackLoading(true);
    // status/job을 독립적으로 로드 — 하나가 실패해도 다른 하나는 표시
    let authExpired = false;
    const status = await fetchApi('/daily/tracks/status?limit=14').catch(err => {
      if (err.message === 'AUTH_EXPIRED') authExpired = true; return null;
    });
    const job = await fetchApi('/daily/tracks/job-status').catch(err => {
      if (err.message === 'AUTH_EXPIRED') authExpired = true; return null;
    });
    setTrackStatus(status);
    setTrackJobStatus(job);
    setTrackLoading(false);
    if (authExpired) onLogout();
  }

  async function openTrackDetail(date) {
    setTrackDetail({ date, junior: null, senior: null });
    setTrackDetailLoading(true);
    try {
      const d = await fetchApi(`/daily/tracks/${date}`);
      setTrackDetail(d);
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') onLogout();
    } finally {
      setTrackDetailLoading(false);
    }
  }

  async function runTechComposer() {
    if (!window.confirm('지금 tech-composer를 실행할까요?\n\nGemini Flash 2회 호출(주니어/시니어 각 1회). 무료 API 키 한도 내에서는 과금되지 않습니다.')) return;
    setTrackRunning(true);
    try {
      // 트리거 직전 최신 실행 시각(새 실행 완료 감지용)
      const beforeCreate = trackJobStatus?.createTime || '';
      await fetchApi('/daily/tracks/run', { method: 'POST' });
      // 하이브리드(RSS 수집 + Gemini 2회)는 보통 90~180초 소요 → 완료까지 폴링(최대 ~5분). 버튼은 '실행 중…' 유지.
      let finalJob = null;
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 15000));
        const job = await fetchApi('/daily/tracks/job-status').catch(() => null);
        if (job?.exists && (job.createTime || '') > beforeCreate && job.status !== 'running') {
          finalJob = job;
          break;
        }
      }
      await loadTrackStatus();
      if (!finalJob) {
        window.alert('⏳ 아직 실행 중입니다. 잠시 후 ↻ 새로고침으로 확인하세요.');
      } else if (finalJob.status === 'succeeded') {
        window.alert('✅ 생성 완료 — 결과가 반영됐습니다.');
      } else {
        window.alert('❌ 실행 실패\n\n무료 Gemini 일일 할당량(모델당 20회/일) 초과일 수 있습니다.\n할당량은 매일 리셋되며, 매일 06:45 자동 실행만으로도 피드는 갱신됩니다.');
      }
    } catch (err) {
      window.alert('실행 실패: ' + err.message);
    } finally {
      setTrackRunning(false);
    }
  }

  async function loadPacers() {
    try {
      const data = await fetchApi('/pacenotes/users');
      setPacers(data.pacers || []);
    } catch (err) { setPacers([]); if (err.message === 'AUTH_EXPIRED') onLogout(); }
  }

  async function loadPaceInsights() {
    try {
      const data = await fetchApi('/pacenotes/insights');
      setPaceInsights(data.insights || []);
      setPoolStats(data.poolStats || {});
    } catch (err) { setPaceInsights([]); if (err.message === 'AUTH_EXPIRED') onLogout(); }
  }

  async function loadPacePool() {
    try {
      const data = await fetchApi('/pacenotes/pool');
      setPacePool(data.pool || []);
      setPaceMeta(data.meta || {});
    } catch (err) { setPacePool([]); if (err.message === 'AUTH_EXPIRED') onLogout(); }
  }

  function openCreatePool() {
    setPoolForm({ id: `rec-${Date.now()}`, title: { ko: '', en: '', ja: '' }, category: 'Mindset', color: '#60A5FA', difficulty: 1, weight: 1.0, isActive: true });
    setPoolFormLocale('ko');
    setPoolModal('create');
  }

  function openEditPool(item) {
    setPoolForm({ 
      ...item,
      title: parseLocaleField(item.title)
    });
    setPoolFormLocale('ko');
    setPoolModal({ mode: 'edit', id: item.id });
  }

  async function handlePoolSubmit(e) {
    e.preventDefault();
    try {
      let newPool = [...pacePool];
      if (poolModal === 'create') {
        newPool.unshift({ ...poolForm, createdAt: new Date().toISOString() });
      } else {
        newPool = newPool.map(p => p.id === poolModal.id ? { ...poolForm } : p);
      }
      await fetchApi('/pacenotes/pool', { method: 'PUT', body: JSON.stringify({ pool: newPool }) });
      setPoolModal(null);
      loadPacePool();
    } catch (err) { alert(err.message); }
  }

  async function handleDeletePool(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const newPool = pacePool.filter(p => p.id !== id);
      await fetchApi('/pacenotes/pool', { method: 'PUT', body: JSON.stringify({ pool: newPool }) });
      loadPacePool();
    } catch (err) { alert(err.message); }
  }

  function openEditContent(item) {
    setContentForm({ 
      date: item.date,
      study: {
        ...item.study,
        theme: parseLocaleField(item.study?.theme),
        explanation: parseLocaleField(item.study?.explanation),
        sentence_kr: parseLocaleField(item.study?.sentence_kr),
        business_context: parseLocaleField(item.study?.business_context),
      },
      signal: item.signal || {},
      vocabulary: JSON.stringify(item.study?.vocabulary || [], null, 2),
      articles: JSON.stringify(item.signal?.articles || [], null, 2),
      parameters: JSON.stringify(item.study?.parameters || [], null, 2)
    });
    setContentAction(null);
    setContentFormLocale('ko');
    setContentModalTab('basic');
    setContentModal({ mode: 'edit', date: item.date });
  }

  function openCreateContent() {
    setContentForm({ 
      date: '', 
      study: {
        theme: { ko: '', en: '', ja: '' },
        sentence_jp: '',
        sentence_furigana: '',
        sentence_pronunciation_kr: '',
        sentence_kr: { ko: '', en: '', ja: '' },
        business_context: { ko: '', en: '', ja: '' },
        prompt_snippet: '',
        explanation: { ko: '', en: '', ja: '' }
      },
      signal: { articles: [] },
      vocabulary: '[]',
      articles: '[]',
      parameters: '[]'
    });
    setContentAction(null);
    setContentFormLocale('ko');
    setContentModalTab('basic');
    setContentModal({ mode: 'create' });
  }

  async function handleContentSubmit(e) {
    e.preventDefault();
    setContentAction({ type: 'loading', msg: '저장 중...' });
    try {
      let parsedVocab = [], parsedArticles = [], parsedParams = [];
      try { parsedVocab = JSON.parse(contentForm.vocabulary || '[]'); } catch(e) {}
      try { parsedArticles = JSON.parse(contentForm.articles || '[]'); } catch(e) {}
      try { parsedParams = JSON.parse(contentForm.parameters || '[]'); } catch(e) {}

      const body = { 
        date: contentForm.date,
        study: { ...contentForm.study, vocabulary: parsedVocab, parameters: parsedParams },
        signal: { ...contentForm.signal, articles: parsedArticles }
      };
      
      if (contentModal.mode === 'create') {
        await fetchApi('/daily/content', { method: 'POST', body: JSON.stringify(body) });
      } else {
        await fetchApi(`/daily/content/${contentModal.date}`, { method: 'PUT', body: JSON.stringify(body) });
      }
      setContentAction({ type: 'success', msg: '저장 완료!' });
      setTimeout(() => { setContentModal(null); loadDailyContent(); }, 1000);
    } catch (err) {
      setContentAction({ type: 'error', msg: `오류: ${err.message}` });
    }
  }

  // ─── Builder's Log Loaders & Handlers ─────────
  
  async function loadBuildersLogMeta() {
    try {
      const data = await fetchApi('/builderslog/meta');
      setBuildersLogMeta(data.meta || []);
      if (!data.meta || data.meta.length === 0) {
        console.warn('API returned empty meta array.', data);
      }
    } catch (err) { 
      console.error('[loadBuildersLogMeta error]', err);
      alert(`데이터를 불러오는 중 오류가 발생했습니다: ${err.message}`);
      if (err.message === 'AUTH_EXPIRED') onLogout(); 
    }
  }

  function openCreateBuildersLog() {
    const today = new Date().toISOString().split('T')[0];
    setBuildersLogForm({
      id: `ep${buildersLogMeta.length + 1}`, slug: '', chapterNo: String(buildersLogMeta.length + 1).padStart(2, '0'),
      title: { ko: '', en: '', ja: '' },
      subtitle: { ko: '', en: '', ja: '' },
      description: { ko: '', en: '', ja: '' },
      date: today, tags: '', accent: '#6D28D9', commits: '[]',
      markdown: { ko: '', en: '', ja: '' }
    });
    setBuildersLogActiveTab('ko');
    setBuildersLogAction(null);
    setBuildersLogModal('create');
  }

  async function openEditBuildersLog(item) {
    setBuildersLogAction({ type: 'loading', msg: '마크다운 및 다국어 정보 불러오는 중...' });
    setBuildersLogModal({ mode: 'edit', slug: item.slug });
    setBuildersLogActiveTab('ko');
    setBuildersLogForm({
      id: item.id, slug: item.slug, chapterNo: item.chapterNo,
      title: parseLocaleField(item.title),
      subtitle: parseLocaleField(item.subtitle),
      description: parseLocaleField(item.description),
      date: item.date, tags: (item.tags || []).join(', '),
      accent: item.accent || '#6D28D9', commits: JSON.stringify(item.commits || [], null, 2),
      markdown: { ko: '', en: '', ja: '' }
    });
    try {
      const [koRes, enRes, jaRes] = await Promise.allSettled([
        fetchApi(`/builderslog/content/${item.slug}?lang=ko`),
        fetchApi(`/builderslog/content/${item.slug}?lang=en`),
        fetchApi(`/builderslog/content/${item.slug}?lang=ja`)
      ]);
      setBuildersLogForm(prev => ({
        ...prev,
        markdown: {
          ko: koRes.status === 'fulfilled' ? koRes.value.content : '',
          en: enRes.status === 'fulfilled' ? enRes.value.content : '',
          ja: jaRes.status === 'fulfilled' ? jaRes.value.content : ''
        }
      }));
      setBuildersLogAction(null);
    } catch (err) {
      setBuildersLogAction({ type: 'error', msg: `본문 로드 실패: ${err.message}` });
    }
  }

  async function handleAiTranslate() {
    const { title, subtitle, description, markdown } = buildersLogForm;
    if (!title.ko) {
      setBuildersLogAction({ type: 'error', msg: 'AI 완역을 진행하려면 최소한 한국어 제목이 필요합니다.' });
      return;
    }
    setBuildersLogAction({ type: 'loading', msg: 'AI가 한국어 원문을 바탕으로 영어 및 일본어로 자동 완역 중입니다...' });
    try {
      const res = await fetchApi('/builderslog/translate', {
        method: 'POST',
        body: JSON.stringify({
          title: title.ko,
          subtitle: subtitle.ko,
          description: description.ko,
          markdown: markdown.ko
        })
      });
      setBuildersLogForm(prev => ({
        ...prev,
        title: {
          ko: prev.title.ko,
          en: res.en?.title || prev.title.en || '',
          ja: res.ja?.title || prev.title.ja || ''
        },
        subtitle: {
          ko: prev.subtitle.ko,
          en: res.en?.subtitle || prev.subtitle.en || '',
          ja: res.ja?.subtitle || prev.subtitle.ja || ''
        },
        description: {
          ko: prev.description.ko,
          en: res.en?.description || prev.description.en || '',
          ja: res.ja?.description || prev.description.ja || ''
        },
        markdown: {
          ko: prev.markdown.ko,
          en: res.en?.markdown || prev.markdown.en || '',
          ja: res.ja?.markdown || prev.markdown.ja || ''
        }
      }));
      setBuildersLogAction({ type: 'success', msg: '✨ AI 번역 완료! 각 탭에서 번역된 내용을 확인하실 수 있습니다.' });
    } catch (err) {
      setBuildersLogAction({ type: 'error', msg: `AI 완역 실패: ${err.message}` });
    }
  }

  const handleFetchRecentCommits = async () => {
    try {
      setBuildersLogAction({ type: 'loading', msg: '최근 커밋을 불러오는 중...' });
      const res = await fetchApi('/builderslog/recent-commits');
      if (res.commits) {
        setBuildersLogForm(f => ({ ...f, commits: JSON.stringify(res.commits, null, 2) }));
        setBuildersLogAction({ type: 'success', msg: '최근 커밋 10개를 불러왔습니다. 불필요한 내역은 지워주세요.' });
      }
    } catch (err) {
      setBuildersLogAction({ type: 'error', msg: `커밋 불러오기 실패: ${err.message}` });
    }
  };

  async function handlePoolAiTranslate() {
    if (!poolForm.title || !poolForm.title.ko) {
      setPoolAction({ type: 'error', msg: 'AI 완역을 진행하려면 최소한 한국어 목표가 필요합니다.' });
      return;
    }
    setPoolAction({ type: 'loading', msg: 'AI가 한국어 목표를 바탕으로 영어 및 일본어로 자동 완역 중입니다...' });
    try {
      const res = await fetchApi('/builderslog/translate', {
        method: 'POST',
        body: JSON.stringify({
          title: poolForm.title.ko
        })
      });
      setPoolForm(prev => ({
        ...prev,
        title: {
          ko: prev.title.ko,
          en: res.en?.title || prev.title.en || '',
          ja: res.ja?.title || prev.title.ja || ''
        }
      }));
      setPoolAction({ type: 'success', msg: '✨ AI 번역 완료! 각 탭에서 번역된 내용을 확인하실 수 있습니다.' });
    } catch (err) {
      setPoolAction({ type: 'error', msg: `AI 완역 실패: ${err.message}` });
    }
  }

  async function handleBuildersLogSubmit(e) {
    e.preventDefault();
    setBuildersLogAction({ type: 'loading', msg: 'GitHub 배포(Commit & Push) 중...' });
    try {
      let parsedTags = buildersLogForm.tags.split(',').map(s => s.trim()).filter(Boolean);
      let parsedCommits = [];
      try { if (buildersLogForm.commits) parsedCommits = JSON.parse(buildersLogForm.commits); } catch (e) {}

      const newMetaObj = {
        id: buildersLogForm.id, slug: buildersLogForm.slug, chapterNo: buildersLogForm.chapterNo,
        title: buildersLogForm.title, subtitle: buildersLogForm.subtitle, description: buildersLogForm.description,
        date: buildersLogForm.date, tags: parsedTags, accent: buildersLogForm.accent, commits: parsedCommits
      };

      let updatedMetaArray = [...buildersLogMeta];
      if (buildersLogModal === 'create') {
        updatedMetaArray.unshift(newMetaObj);
      } else {
        updatedMetaArray = updatedMetaArray.map(m => m.id === newMetaObj.id ? newMetaObj : m);
      }

      // 1. 한국어 배포
      const bodyKo = {
        metaArray: updatedMetaArray,
        currentSlug: buildersLogForm.slug,
        markdown: buildersLogForm.markdown.ko || '',
        skipAiReview: true,
        locale: 'ko'
      };
      setBuildersLogAction({ type: 'loading', msg: '한국어(KO) 버전 배포 중...' });
      await fetchApi('/builderslog/publish', { method: 'POST', body: JSON.stringify(bodyKo) });

      // 2. 영어 배포 (본문이 존재하면)
      if (buildersLogForm.markdown.en && buildersLogForm.markdown.en.trim()) {
        const bodyEn = {
          metaArray: updatedMetaArray,
          currentSlug: buildersLogForm.slug,
          markdown: buildersLogForm.markdown.en,
          skipAiReview: true,
          locale: 'en'
        };
        setBuildersLogAction({ type: 'loading', msg: '영어(EN) 버전 배포 중...' });
        await fetchApi('/builderslog/publish', { method: 'POST', body: JSON.stringify(bodyEn) });
      }

      // 3. 일본어 배포 (본문이 존재하면)
      if (buildersLogForm.markdown.ja && buildersLogForm.markdown.ja.trim()) {
        const bodyJa = {
          metaArray: updatedMetaArray,
          currentSlug: buildersLogForm.slug,
          markdown: buildersLogForm.markdown.ja,
          skipAiReview: true,
          locale: 'ja'
        };
        setBuildersLogAction({ type: 'loading', msg: '일본어(JA) 버전 배포 중...' });
        await fetchApi('/builderslog/publish', { method: 'POST', body: JSON.stringify(bodyJa) });
      }

      setBuildersLogAction({ type: 'success', msg: '🎉 전 언어 버전 배포 완료!' });
      setTimeout(() => { setBuildersLogModal(null); loadBuildersLogMeta(); }, 1500);
    } catch (err) {
      setBuildersLogAction({ type: 'error', msg: `❌ ${err.message}` });
    }
  }

  // ─── Admin CRUD ───────────────────────────────

  async function loadAdmins() {
    try {
      const data = await fetchApi('/admins');
      setAdmins(data.admins || []);
    } catch (err) { if (err.message === 'AUTH_EXPIRED') onLogout(); }
  }

  function openCreateAdmin() {
    setAdminForm({ email: '', password: '', displayName: '', role: 'admin' });
    setAdminAction(null); setAdminModal('create');
  }

  function openEditAdmin(admin) {
    setAdminForm({ email: admin.email, password: '', displayName: admin.displayName || '', role: admin.role || 'admin' });
    setAdminAction(null); setAdminModal({ mode: 'edit', admin });
  }

  async function handleAdminSubmit(e) {
    e.preventDefault();
    setAdminAction({ type: 'loading', msg: '처리 중...' });
    try {
      if (adminModal === 'create') {
        await fetchApi('/admins', { method: 'POST', body: JSON.stringify(adminForm) });
        setAdminAction({ type: 'success', msg: '✅ 관리자가 생성되었습니다' });
      } else {
        const body = {};
        if (adminForm.email !== adminModal.admin.email) body.email = adminForm.email;
        if (adminForm.password) body.password = adminForm.password;
        if (adminForm.displayName !== (adminModal.admin.displayName || '')) body.displayName = adminForm.displayName;
        if (adminForm.role !== (adminModal.admin.role || 'admin')) body.role = adminForm.role;
        await fetchApi(`/admins/${adminModal.admin.uid}`, { method: 'PUT', body: JSON.stringify(body) });
        setAdminAction({ type: 'success', msg: '✅ 관리자 정보가 수정되었습니다' });
      }
      setTimeout(() => { setAdminModal(null); loadAdmins(); }, 1000);
    } catch (err) {
      setAdminAction({ type: 'error', msg: `❌ ${err.message}` });
    }
  }

  async function handleDeleteAdmin(uid) {
    try {
      await fetchApi(`/admins/${uid}`, { method: 'DELETE' });
      setDeleteConfirm(null); loadAdmins();
    } catch (err) { alert(err.message); setDeleteConfirm(null); }
  }

  useEffect(() => {
    if (activeTab === 'subscribers') { loadSubscribers(); loadEmailLogs(); }
    if (activeTab === 'admins' && isSuperAdmin) loadAdmins();
    if (activeTab === 'overview') { loadPriStudyStats(); loadBuildersLogMeta(); loadEmailLogs(); }
    if (activeTab === 'content') loadDailyContent();
    if (activeTab === 'pacenotes') loadPacers();
    if (activeTab === 'pacenote_insights') loadPaceInsights();
    if (activeTab === 'pacenote_pool') { loadPacePool(); loadPaceInsights(); }
    if (activeTab === 'builderslog') loadBuildersLogMeta();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'content' && contentSubTab === 'track') loadTrackStatus();
  }, [activeTab, contentSubTab]);

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" />데이터 로딩 중...</div>;
  }

  const ROLE_LABEL = { super_admin: '슈퍼 관리자', admin: '관리자' };

  const menuGroups = [
    {
      id: 'common',
      label: 'Common',
      items: [
        { id: 'overview', label: '📊 대시보드' },
        { id: 'docs', label: '📖 서비스 문서' },
        ...(isSuperAdmin ? [{ id: 'admins', label: '🔐 관리자' }] : [])
      ]
    },
    {
      id: 'builderslog_group',
      label: 'Builder\'s Log',
      items: [
        { id: 'builderslog', label: '📝 아티클 퍼블리싱' }
      ]
    },
    {
      id: 'daily',
      label: 'Daily Digest',
      items: [
        { id: 'subscribers', label: '👥 구독 및 이메일 발송' },
        { id: 'content', label: '📚 콘텐츠 관리' },
        { id: 'pipeline', label: '⚙️ 파이프라인' },
      ]
    },
    {
      id: 'pacenote',
      label: 'Pace Note',
      items: [
        { id: 'pacenotes', label: '⛵ Pacer 현황' },
        { id: 'pacenote_insights', label: '💡 유저 목표 인사이트' },
        { id: 'pacenote_pool', label: '🎯 AI 추천 풀 관리' },
      ]
    }
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-left">
            <span className="admin-logo">🛡️</span>
            <h1>PriSincera Admin</h1>
          </div>
          <div className="admin-header-right">
            <button className="admin-profile-btn btn-secondary" onClick={openProfile} title="마이페이지">
              <span className={`admin-avatar ${role}`}>👤</span>
              <span className="admin-profile-info">
                <span className="admin-profile-email">{adminEmail}</span>
                <span className={`admin-role-badge ${role}`}>{ROLE_LABEL[role] || role}</span>
              </span>
            </button>
            <button className="admin-logout-btn btn-secondary" onClick={onLogout}>로그아웃</button>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          {menuGroups.map(group => (
            <div key={group.id} className="admin-sidebar-group">
              <div 
                className={`admin-sidebar-header ${group.onClick ? 'clickable' : ''}`} 
                onClick={group.onClick}
              >
                {group.label}
              </div>
              {group.items.length > 0 && (
                <div className="admin-sidebar-items">
                  {group.items.map(item => (
                    <button key={item.id}
                      className={`admin-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* Content */}
        <main className="admin-content">
        {activeTab === 'docs' && (
          <div className="admin-subscribers">
            <div className="admin-section-header"><h2>📖 서비스 문서</h2></div>
            <Suspense fallback={<div className="admin-empty">문서 불러오는 중…</div>}>
              <ServiceDocs />
            </Suspense>
          </div>
        )}

        {activeTab === 'overview' && stats && (
          <div className="admin-overview">
            <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>📊 Daily Digest 대시보드</h2>
            </div>
            <div className="admin-stat-grid" style={{ marginBottom: '24px' }}>
              <StatCard label="활성 구독자" value={stats.subscribers.active} icon="👥" color="var(--admin-accent)" onClick={() => setActiveTab('subscribers')} />
              <StatCard label="해지" value={stats.subscribers.unsubscribed} icon="🚪" color="var(--admin-orange)" onClick={() => setActiveTab('subscribers')} />
              <StatCard label="발송 이력" value={stats.emails.totalSent} icon="📧" color="var(--admin-green)" onClick={() => setActiveTab('subscribers')} />
              <StatCard label="누적 콘텐츠" value={priStudyStats?.totalContent || 0} icon="📚" color="var(--admin-blue)" onClick={() => setActiveTab('content')} />
              <StatCard label="Pacer 참여자" value={`${priStudyStats?.totalLearners || 0}명`} icon="⛵" color="var(--admin-blue)" onClick={() => setActiveTab('pacenotes')} />
              <StatCard 
                label="방문자 통계" 
                value="GA4" 
                icon="📈" 
                color="#60A5FA" 
                onClick={() => window.open('https://analytics.google.com/analytics/web/?utm_source=OGB&utm_medium=app&authuser=0#/a391399503p533055438/reports/intelligenthome', '_blank')} 
              />
              
              {/* Pipeline Status Card (Spans 2 columns) */}
              {pipeline && (
                <div className="admin-stat-card stat-span-2" style={{ '--card-accent': pipeline.collector.status === 'success' ? '#10B981' : '#F59E0B' }}>
                  <div className="pipeline-header">
                    <div className="admin-stat-icon" style={{ margin: 0 }}>⚙️</div>
                    <div className={`admin-pipeline-badge ${pipeline.collector.status}`}>
                      {pipeline.collector.status === 'success' ? '✅ 오늘 수집 완료' : '⏳ 대기 중'}
                    </div>
                  </div>
                  <div className="admin-stat-label" style={{ marginBottom: '16px' }}>데이터 수집 상태</div>
                  <div className="pipeline-details">
                    <div className="detail-item">
                      <div className="detail-value">{pipeline.collector.lastRun || 'N/A'}</div>
                      <div className="detail-label">최근 실행일</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-value">{pipeline.totalDates}일</div>
                      <div className="detail-label">누적 데일리</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="admin-overview-section" style={{ marginTop: '2rem' }}>
              <div className="admin-chart-container" style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.1rem', color: '#E9D5FF' }}>Builder's Log 성과</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>아티클 누적 및 일일 조회수 현황 (누적 조회수가 높은 순서로 정렬됩니다)</p>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>아티클 (Title)</th><th>Slug</th><th>일일 조회수 (오늘)</th><th>누적 조회수</th></tr>
                    </thead>
                    <tbody>
                      {buildersLogMeta
                        .map(article => {
                          const stat = buildersLogStats[article.slug] || { total: 0, daily: 0 };
                          // stats endpoint returns { total: X, daily: Y } for each slug
                          const total = stat.total !== undefined ? stat.total : (stat || 0);
                          const daily = stat.daily !== undefined ? stat.daily : 0;
                          return { ...article, totalViews: total, dailyViews: daily };
                        })
                        .sort((a, b) => b.totalViews - a.totalViews)
                        .slice(0, 10) // Top 10만 노출
                        .map((article, i) => (
                          <tr key={i}>
                            <td className="admin-subject-cell">{typeof article.title === 'object' ? article.title.ko : article.title}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{article.slug}</td>
                            <td><strong style={{ color: 'var(--admin-green)' }}>{article.dailyViews.toLocaleString()}회</strong></td>
                            <td><strong style={{ color: 'var(--admin-blue)' }}>{article.totalViews.toLocaleString()}회</strong></td>
                          </tr>
                        ))}
                      {buildersLogMeta.length === 0 && (
                        <tr><td colSpan={4} className="admin-empty">퍼블리싱된 아티클이 없습니다.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            {emailLogs && emailLogs.length > 0 && (
              <div className="admin-overview-section" style={{ marginTop: '2rem' }}>
                <div className="admin-chart-container" style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem', color: '#E9D5FF' }}>최근 데일리 발송 추이</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart data={[...emailLogs].reverse().slice(-14)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickFormatter={str => str.substring(5)} />
                        <YAxis stroke="#9CA3AF" fontSize={12} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-void)', borderColor: 'rgba(196,181,253,0.2)', borderRadius: '8px' }}
                          itemStyle={{ color: '#F5F3FF' }}
                        />
                        <Line type="monotone" name="수신" dataKey="totalRecipients" stroke="#7C3AED" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" name="성공" dataKey="successCount" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'subscribers' && (
          <div className="admin-subscribers">
            <div className="admin-section-header">
              <h2>👥 구독자 및 메일링 관리</h2>
              <button className="admin-btn-secondary" onClick={exportCsv}>📥 구독자 CSV 내보내기</button>
            </div>

            <div className="admin-test-send" style={{ marginBottom: '32px' }}>
              <h3>수동 이메일 발송 (테스트)</h3>
              <div className="admin-test-send-form">
                <input id="test-email-input" type="email" placeholder="수신 이메일"
                  value={testEmail} onChange={e => setTestEmail(e.target.value)} />
                <button className="admin-btn-primary" onClick={sendTestEmail}>📨 발송</button>
              </div>
              {sendStatus && <div className={`admin-send-status ${sendStatus.type}`}>{sendStatus.msg}</div>}
            </div>

            <h3>발송 이력</h3>
            <div className="admin-table-wrap" style={{ marginBottom: '32px' }}>
              <table className="admin-table">
                <thead><tr><th>날짜</th><th>제목</th><th>수신</th><th>성공</th><th>발송 시각</th></tr></thead>
                <tbody>
                  {emailLogs.map((log, i) => (
                    <tr key={i}>
                      <td>{log.date}</td>
                      <td className="admin-subject-cell">{log.subject || '-'}</td>
                      <td>{log.totalRecipients || 0}</td>
                      <td>{log.successCount || 0}</td>
                      <td>{log.sentAt ? new Date(log.sentAt).toLocaleString('ko') : '-'}</td>
                    </tr>
                  ))}
                  {emailLogs.length === 0 && (<tr><td colSpan={5} className="admin-empty">발송 이력이 없습니다</td></tr>)}
                </tbody>
              </table>
            </div>

            <h3>구독자 목록</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>이메일</th><th>상태</th><th>구독일</th><th>가입 경로</th></tr></thead>
                <tbody>
                  {subscribers.map((sub, i) => (
                    <tr key={i}>
                      <td className="admin-email-cell">{sub.email}</td>
                      <td><span className={`admin-status-badge ${sub.status}`}>{sub.status === 'active' ? '활성' : '해지'}</span></td>
                      <td>{sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString('ko') : '-'}</td>
                      <td>{sub.source || '-'}</td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && (<tr><td colSpan={4} className="admin-empty">구독자 데이터가 없습니다</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && pipeline && (
          <div className="admin-pipeline">
            <h2>⚙️ 파이프라인 현황</h2>
            <div className="admin-stat-grid">
              <StatCard label="Collector" value={pipeline.collector.status === 'success' ? '정상' : '대기'}
                icon="📡" color={pipeline.collector.status === 'success' ? 'var(--admin-green)' : 'var(--admin-orange)'} />
              <StatCard label="누적 데일리" value={`${pipeline.totalDates}일`} icon="📅" color="var(--admin-blue)" />
            </div>
            <h3>최근 7일</h3>
            <div className="admin-recent-dates">
              {(pipeline.recentDates || []).map(d => (<span key={d} className="admin-date-chip">{d}</span>))}
            </div>
          </div>
        )}

        {activeTab === 'admins' && isSuperAdmin && (
          <div className="admin-admins">
            <div className="admin-section-header">
              <h2>🔐 관리자 계정 관리</h2>
              <button className="admin-btn-primary btn-primary" onClick={openCreateAdmin}>➕ 관리자 추가</button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>이메일</th><th>이름</th><th>역할</th><th>생성일</th><th>최근 로그인</th><th>관리</th></tr></thead>
                <tbody>
                  {admins.map((admin, i) => (
                    <tr key={i}>
                      <td className="admin-email-cell">
                        {admin.email}
                        {admin.email === adminEmail && <span className="admin-me-badge">나</span>}
                      </td>
                      <td>{admin.displayName || <span className="admin-text-muted">—</span>}</td>
                      <td><span className={`admin-role-badge ${admin.role}`}>{ROLE_LABEL[admin.role] || admin.role}</span></td>
                      <td>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('ko') : '—'}</td>
                      <td>{admin.lastSignIn ? new Date(admin.lastSignIn).toLocaleDateString('ko') : '—'}</td>
                      <td className="admin-actions-cell">
                        {admin.uid && (
                          <>
                            <button className="admin-action-btn edit" onClick={() => openEditAdmin(admin)} title="수정">✏️</button>
                            {admin.email !== adminEmail && (
                              deleteConfirm === admin.uid ? (
                                <span className="admin-delete-confirm">
                                  <button className="admin-action-btn confirm-yes" onClick={() => handleDeleteAdmin(admin.uid)}>삭제</button>
                                  <button className="admin-action-btn confirm-no" onClick={() => setDeleteConfirm(null)}>취소</button>
                                </span>
                              ) : (
                                <button className="admin-action-btn delete" onClick={() => setDeleteConfirm(admin.uid)} title="삭제">🗑️</button>
                              )
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 && (<tr><td colSpan={6} className="admin-empty">관리자 계정이 없습니다</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="admin-subscribers">
            <div className="admin-section-header">
              <h2>📚 콘텐츠 관리</h2>
              {contentSubTab === 'legacy' && (
                <button className="admin-btn-primary btn-primary" onClick={openCreateContent}>➕ 수동 발행</button>
              )}
            </div>

            {/* 서브탭 토글 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {[{ id: 'legacy', label: '📚 기존 콘텐츠' }, { id: 'track', label: '🛰️ 테크 트랙' }].map(st => (
                <button
                  key={st.id}
                  onClick={() => setContentSubTab(st.id)}
                  style={{
                    padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                    border: contentSubTab === st.id ? '1px solid var(--admin-accent, #A78BFA)' : '1px solid rgba(148,163,184,0.25)',
                    background: contentSubTab === st.id ? 'rgba(167,139,250,0.14)' : 'transparent',
                    color: contentSubTab === st.id ? 'var(--admin-accent, #A78BFA)' : '#9CA3AF',
                  }}
                >{st.label}</button>
              ))}
            </div>

            {/* 기존 콘텐츠 (Signal + Study) */}
            {contentSubTab === 'legacy' && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>날짜</th><th>IT 시그널</th><th>AI 프롬프트</th><th>일본어 문장</th><th>관리</th></tr></thead>
                  <tbody>
                    {dailyContent.map((item, i) => (
                      <tr key={i}>
                        <td>{item.date}</td>
                        <td>{item.signal?.articles?.length || 0}건</td>
                        <td>{item.study?.prompt_snippet ? '✅' : '❌'}</td>
                        <td className="admin-subject-cell">{item.study?.sentence_jp || '-'}</td>
                        <td className="admin-actions-cell">
                          <button className="admin-action-btn edit" onClick={() => openEditContent(item)} title="수정">✏️</button>
                        </td>
                      </tr>
                    ))}
                    {dailyContent.length === 0 && (<tr><td colSpan={5} className="admin-empty">콘텐츠가 없습니다</td></tr>)}
                  </tbody>
                </table>
              </div>
            )}

            {/* 테크 트랙 모니터링 (tech-composer) */}
            {contentSubTab === 'track' && (
              <div>
                {/* 상태 배너 */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', borderRadius: 12, marginBottom: 18,
                  border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(255,255,255,0.02)',
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', fontSize: '0.88rem' }}>
                    <span style={{ color: '#9CA3AF' }}>⏱ 스케줄: <strong style={{ color: '#E9D5FF' }}>{trackStatus?.schedule || '매일 06:45 (Asia/Seoul)'}</strong></span>
                    <span style={{ color: '#9CA3AF' }}>index v: <strong style={{ color: '#E9D5FF' }}>{trackStatus?.indexVersion ?? '—'}</strong></span>
                    <span style={{ color: '#9CA3AF' }}>
                      최근 실행: {trackJobStatus?.exists ? (
                        <strong style={{ color: trackJobStatus.status === 'succeeded' ? '#10B981' : trackJobStatus.status === 'failed' ? '#EF4444' : '#FBBF24' }}>
                          {trackJobStatus.status === 'succeeded' ? '✅ 성공' : trackJobStatus.status === 'failed' ? '❌ 실패' : '⏳ 실행중'}
                          {trackJobStatus.completionTime ? ` · ${new Date(trackJobStatus.completionTime).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}` : ''}
                        </strong>
                      ) : <strong style={{ color: '#9CA3AF' }}>기록 없음</strong>}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="admin-btn-primary btn-primary" onClick={loadTrackStatus} disabled={trackLoading}>↻ 새로고침</button>
                    <button className="admin-btn-primary btn-primary" onClick={runTechComposer} disabled={trackRunning}
                      style={{ background: trackRunning ? '#6B7280' : undefined }}>
                      {trackRunning ? '실행 중…' : '▶ 지금 생성'}
                    </button>
                  </div>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>날짜</th><th>주니어</th><th>시니어</th><th>도메인</th><th>AC 완성</th><th>상태</th><th>관리</th></tr></thead>
                    <tbody>
                      {trackLoading && (<tr><td colSpan={7} className="admin-empty">불러오는 중…</td></tr>)}
                      {!trackLoading && (trackStatus?.rows || []).map((row, i) => {
                        const badge = row.status === 'ok'
                          ? { t: '✅ 정상', c: '#10B981' }
                          : row.status === 'partial' ? { t: '⚠️ 부분', c: '#FBBF24' } : { t: '❌ 미생성', c: '#EF4444' };
                        const cell = (tk) => tk.exists
                          ? `${tk.cardCount}카드 · ${tk.generatedAt ? new Date(tk.generatedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-'}`
                          : '—';
                        const acTotal = (row.junior.acTotal || 0) + (row.senior.acTotal || 0);
                        const acDone = (row.junior.acComplete || 0) + (row.senior.acComplete || 0);
                        return (
                          <tr key={i}>
                            <td><span className="admin-date-chip">{row.date}</span></td>
                            <td>{cell(row.junior)}</td>
                            <td>{cell(row.senior)}</td>
                            <td style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{(row.junior.domains || []).join(', ') || '—'}</td>
                            <td>{acTotal ? `${acDone}/${acTotal}` : '—'}</td>
                            <td><strong style={{ color: badge.c }}>{badge.t}</strong></td>
                            <td className="admin-actions-cell">
                              <button className="admin-action-btn edit" onClick={() => openTrackDetail(row.date)} title="상세 검수">🔍</button>
                            </td>
                          </tr>
                        );
                      })}
                      {!trackLoading && (trackStatus?.rows || []).length === 0 && (
                        <tr><td colSpan={7} className="admin-empty">트랙 피드가 없습니다</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 트랙 상세 검수 모달 */}
        {trackDetail && (
          <div className="admin-modal-overlay" onClick={() => setTrackDetail(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div onClick={e => e.stopPropagation()}
              style={{ width: 'min(820px, 92vw)', maxHeight: '86vh', overflowY: 'auto', background: '#1a1730', borderRadius: 16, padding: 24, border: '1px solid rgba(148,163,184,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>🛰️ 트랙 피드 검수 — {trackDetail.date}</h3>
                <button className="admin-action-btn" onClick={() => setTrackDetail(null)} style={{ cursor: 'pointer' }}>✕</button>
              </div>
              {trackDetailLoading ? (
                <div className="admin-empty">불러오는 중…</div>
              ) : (
                ['junior', 'senior'].map(tk => (
                  <div key={tk} style={{ marginBottom: 20 }}>
                    <h4 style={{ color: '#E9D5FF', borderBottom: '1px solid rgba(148,163,184,0.2)', paddingBottom: 6 }}>
                      {tk === 'junior' ? '🚀 주니어-미드' : '🧭 시니어-리더'} {trackDetail[tk] ? `(${(trackDetail[tk].cards || []).length}카드)` : '(없음)'}
                    </h4>
                    {!trackDetail[tk] && <div style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>피드 없음</div>}
                    {(trackDetail[tk]?.cards || []).map(card => (
                      <div key={card.id} style={{ padding: '10px 0', borderBottom: '1px dashed rgba(148,163,184,0.15)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#A78BFA', marginBottom: 2 }}>{card.domain} · {(card.tags || []).map(t => '#' + t).join(' ')}</div>
                        <div style={{ fontWeight: 600 }}>{card.title}</div>
                        <div style={{ fontSize: '0.85rem', color: '#9CA3AF', margin: '2px 0 6px' }}>{card.summary}</div>
                        {card.learning && (card.learning.concept || (card.learning.key_points || []).length > 0) && (
                          <div style={{ fontSize: '0.82rem', background: 'rgba(165,180,252,0.06)', borderLeft: '3px solid #A5B4FC', borderRadius: '0 6px 6px 0', padding: '8px 10px', margin: '0 0 8px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.72rem', color: '#A5B4FC', marginBottom: 4 }}>📚 학습</div>
                            {card.learning.concept && <div style={{ color: '#E2E8F0', lineHeight: 1.6 }}>{card.learning.concept}</div>}
                            {(card.learning.key_points || []).length > 0 && (
                              <ul style={{ margin: '6px 0 0', paddingLeft: 16, color: '#94A3B8' }}>
                                {card.learning.key_points.map((p, i) => (<li key={i}>{p}</li>))}
                              </ul>
                            )}
                          </div>
                        )}
                        {card.action_challenge && (
                          <div style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>
                            🎯 {card.action_challenge.title}
                            <ol style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                              {(card.action_challenge.tasks || []).map(tsk => (<li key={tsk.seq}>{tsk.text}</li>))}
                            </ol>
                          </div>
                        )}
                        {card.sourceUrl && (
                          <a href={card.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 8, fontSize: '0.8rem', color: '#22D3EE', textDecoration: 'none' }}>
                            🔗 {card.sourceName || '원문'} 읽기 →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'pacenotes' && (
          <div className="admin-subscribers">
            <div className="admin-section-header"><h2>⛵ Pace Note (Pacer) 현황</h2></div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>이메일</th><th>최근 접속 주차</th><th>현재 미션(개)</th><th>완료(개)</th></tr></thead>
                <tbody>
                  {pacers.map((l, i) => (
                    <tr key={i}>
                      <td className="admin-email-cell">{l.email}</td>
                      <td><strong>{l.lastWeekId}</strong></td>
                      <td>{l.currentTasks}</td>
                      <td>{l.completedTasks}</td>
                    </tr>
                  ))}
                  {pacers.length === 0 && (<tr><td colSpan={4} className="admin-empty">Pace Note 데이터가 없습니다</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pacenote_insights' && (
          <div className="admin-subscribers">
            <div className="admin-section-header">
              <h2>💡 유저 커스텀 목표 인사이트</h2>
            </div>
            <p style={{ color: '#9CA3AF', marginBottom: '24px' }}>
              Pacer들이 AI 추천에 의존하지 않고 직접 등록한 목표들을 분석하여, 향후 서비스 및 AI 추천 고도화에 활용할 수 있습니다.
            </p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>주차 (Week)</th><th>등록된 목표 (Title)</th><th>달성 여부</th></tr></thead>
                <tbody>
                  {paceInsights.map((insight, i) => (
                    <tr key={i}>
                      <td><span className="admin-date-chip">{insight.weekId}</span></td>
                      <td style={{ color: '#E9D5FF' }}>{insight.title}</td>
                      <td>
                        {insight.completed 
                          ? <span style={{ color: '#10B981', fontWeight: 'bold' }}>달성 완료</span> 
                          : <span style={{ color: '#9CA3AF' }}>진행 중</span>}
                      </td>
                    </tr>
                  ))}
                  {paceInsights.length === 0 && (<tr><td colSpan={3} className="admin-empty">유저가 직접 등록한 목표가 없습니다</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pacenote_pool' && (
          <div className="admin-subscribers">
            <div className="admin-section-header">
              <h2>🎯 AI 추천 풀 관리</h2>
              <button className="admin-btn-primary btn-primary" onClick={openCreatePool}>➕ 항목 수동 추가</button>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '4px solid #A78BFA' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#A78BFA', display: 'flex', alignItems: 'center', gap: '8px' }}>🚀 파이프라인 최근 실행 로그</h3>
              {paceMeta && paceMeta.lastRunTime ? (
                <>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}><strong>실행 일시:</strong> {new Date(paceMeta.lastRunTime).toLocaleString()}</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.4' }}><strong>상세 내역:</strong> {paceMeta.lastRunLog}</p>
                </>
              ) : (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>아직 파이프라인이 실행되지 않아 기록된 로그가 없습니다.</p>
              )}
            </div>
            <p style={{ color: '#9CA3AF', marginBottom: '24px' }}>
              LLM 파이프라인이 매일 생성하는 목표들이 누적되며, 사용자는 이 풀에서 무작위 3개를 추천받습니다.
            </p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>카테고리</th><th>목표 (Title)</th><th>상태</th><th>생성일</th><th>관리</th></tr></thead>
                <tbody>
                  {pacePool.map((item, i) => (
                    <tr key={i}>
                      <td><span className="admin-date-chip" style={{ backgroundColor: item.color || '#60A5FA', color: '#111' }}>{item.category}</span></td>
                      <td className="admin-subject-cell" style={{ opacity: item.isActive === false ? 0.5 : 1 }}>{typeof item.title === 'object' ? item.title.ko : item.title}</td>
                      <td>{item.isActive !== false ? '✅ 활성' : '❌ 비활성'}</td>
                      <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('ko') : '-'}</td>
                      <td className="admin-actions-cell">
                        <button className="admin-action-btn edit" onClick={() => openEditPool(item)} title="수정">✏️</button>
                        <button className="admin-action-btn delete" onClick={() => handleDeletePool(item.id)} title="삭제">🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {pacePool.length === 0 && (<tr><td colSpan={5} className="admin-empty">추천 항목이 없습니다.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'builderslog' && (
          <div className="admin-builderslog">
            <div className="admin-section-header">
              <h2>📝 Builder's Log 퍼블리싱</h2>
              <button className="admin-btn-primary btn-primary" onClick={openCreateBuildersLog}>📝 새 아티클 작성</button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Chapter</th><th>Slug</th><th>Title</th><th>Date</th><th>관리</th></tr></thead>
                <tbody>
                  {buildersLogMeta.map((item, i) => (
                    <tr key={i}>
                      <td><span className="admin-date-chip" style={{ backgroundColor: item.accent || '#6D28D9', color: '#fff' }}>EP. {item.chapterNo}</span></td>
                      <td style={{ color: '#9CA3AF' }}>{item.slug}</td>
                      <td className="admin-subject-cell">{typeof item.title === 'object' ? item.title.ko : item.title}</td>
                      <td>{item.date}</td>
                      <td className="admin-actions-cell">
                        <button className="admin-action-btn edit" onClick={() => openEditBuildersLog(item)} title="수정/배포">✏️</button>
                      </td>
                    </tr>
                  ))}
                  {buildersLogMeta.length === 0 && (<tr><td colSpan={5} className="admin-empty">아티클이 없습니다.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pool Modal */}
        {poolModal && (
          <div className="admin-modal-overlay" onClick={() => setPoolModal(null)}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{poolModal === 'create' ? '추천 항목 추가' : '추천 항목 수정'}</h3>
                <button className="admin-modal-close" onClick={() => setPoolModal(null)}>✕</button>
              </div>
              <form onSubmit={handlePoolSubmit}>
                <div className="admin-modal-body">
                  <div className="admin-modal-tabs" style={{ marginBottom: '12px', borderBottom: 'none', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex' }}>
                      {['ko', 'en', 'ja'].map(lang => (
                        <button
                          key={lang}
                          type="button"
                          className={`admin-modal-tab ${poolFormLocale === lang ? 'active' : ''}`}
                          onClick={() => setPoolFormLocale(lang)}
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="admin-btn-primary btn-primary"
                      onClick={handlePoolAiTranslate}
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        border: 'none'
                      }}
                    >
                      ✨ AI 자동 완역 (en / ja)
                    </button>
                  </div>
                  <label className="admin-form-label">목표 (Title - {poolFormLocale.toUpperCase()})
                    <input type="text" required value={poolForm.title[poolFormLocale] || ''} onChange={e => setPoolForm({ ...poolForm, title: { ...poolForm.title, [poolFormLocale]: e.target.value } })} />
                  </label>
                  <label className="admin-form-label">카테고리
                    <select required value={poolForm.category} onChange={e => setPoolForm({ ...poolForm, category: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--surface-bg)', color: 'var(--text-primary)', marginTop: '6px' }}>
                      <option value="">카테고리 선택</option>
                      {PACENOTE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </label>
                  <label className="admin-form-label">컬러 (Hex)
                    <input type="text" required value={poolForm.color} onChange={e => setPoolForm({ ...poolForm, color: e.target.value })} />
                  </label>
                  <label className="admin-form-label" style={{ flexDirection: 'row', alignItems: 'center' }}>
                    활성화 여부 (추천 리스트 노출)
                    <input type="checkbox" style={{ width: 'auto', marginLeft: '12px' }} checked={poolForm.isActive} onChange={e => setPoolForm({ ...poolForm, isActive: e.target.checked })} />
                  </label>
                  {poolAction && <div className={`admin-send-status ${poolAction.type}`}>{poolAction.msg}</div>}
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="admin-btn-secondary btn-secondary" onClick={() => setPoolModal(null)}>취소</button>
                  <button type="submit" className="admin-btn-primary btn-primary">저장</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Builders Log Modal */}
        {buildersLogModal && (
          <div className="admin-modal-overlay admin-content-modal" onClick={() => setBuildersLogModal(null)}>
            <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
              <div className="admin-modal-header">
                <h3>{buildersLogModal === 'create' ? '새 아티클 작성' : '아티클 수정 및 재배포'}</h3>
                <button className="admin-modal-close" onClick={() => setBuildersLogModal(null)}>✕</button>
              </div>
              <form onSubmit={handleBuildersLogSubmit}>
                <div className="admin-modal-body" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', maxHeight: '70vh', overflowY: 'auto' }}>
                  
                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div className="admin-modal-tabs" style={{ margin: 0, borderBottom: 'none' }}>
                      {['ko', 'en', 'ja'].map(lang => (
                        <button
                          key={lang}
                          type="button"
                          className={`admin-modal-tab ${buildersLogActiveTab === lang ? 'active' : ''}`}
                          onClick={() => setBuildersLogActiveTab(lang)}
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="admin-btn-primary btn-primary"
                      onClick={handleAiTranslate}
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        border: 'none'
                      }}
                    >
                      ✨ AI 자동 완역
                    </button>
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <label className="admin-form-label" style={{ marginBottom: 0, width: '100%' }}>
                      본문 Markdown ({buildersLogActiveTab.toUpperCase()} - AI 윤문 및 검열 파이프라인 연동)
                    </label>
                    <label className="admin-btn-secondary btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap', padding: '4px 12px', fontSize: '12px' }}>
                      📁 .md 파일 불러오기
                      <input 
                        type="file" 
                        accept=".md" 
                        style={{ display: 'none' }} 
                        onChange={async e => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async (evt) => {
                            const rawMarkdown = evt.target.result;
                            setBuildersLogForm(f => ({ ...f, markdown: { ...f.markdown, ko: rawMarkdown } }));
                            setBuildersLogAction({ type: 'loading', msg: 'AI가 초안을 분석하여 톤앤매너 교정 및 항목을 자동 작성 중입니다...' });
                            try {
                              const res = await fetchApi('/builderslog/analyze', { 
                                method: 'POST', 
                                body: JSON.stringify({ markdown: rawMarkdown }) 
                              });
                              setBuildersLogForm(f => ({
                                ...f,
                                title: { ...f.title, ko: res.title || f.title.ko },
                                subtitle: { ...f.subtitle, ko: res.subtitle || f.subtitle.ko },
                                description: { ...f.description, ko: res.description || f.description.ko },
                                slug: res.slug || f.slug,
                                tags: res.tags && res.tags.length > 0 ? res.tags.join(', ') : f.tags,
                                markdown: { ...f.markdown, ko: res.refinedMarkdown || rawMarkdown },
                                commits: res.commits && res.commits.length > 0 ? JSON.stringify(res.commits, null, 2) : f.commits
                              }));
                              if (res._warning) {
                                setBuildersLogAction({ type: 'warning', msg: `⚠️ ${res._warning}` });
                              } else {
                                setBuildersLogAction({ type: 'success', msg: '✨ AI 분석 및 자동 작성 완료. 내용을 확인하고 Publish를 눌러주세요.' });
                              }
                            } catch(err) {
                              setBuildersLogAction({ type: 'error', msg: `AI 분석 실패: ${err.message}` });
                            }
                          };
                          reader.readAsText(file);
                        }} 
                      />
                    </label>
                  </div>
                  <textarea required rows={15} value={buildersLogForm.markdown[buildersLogActiveTab] || ''} onChange={e => setBuildersLogForm(f => ({ ...f, markdown: { ...f.markdown, [buildersLogActiveTab]: e.target.value } }))} placeholder="# 작성된 마크다운 초고를 여기에 붙여넣거나 파일을 불러오세요..." style={{ gridColumn: 'span 2', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6', background: 'rgba(255,255,255,0.05)', color: '#FFF', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }} />

                  {buildersLogAction && (
                    <div className={`admin-send-status ${buildersLogAction.type}`} style={{ gridColumn: 'span 2' }}>{buildersLogAction.msg}</div>
                  )}

                  <hr style={{ gridColumn: 'span 2', borderColor: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />

                  <label className="admin-form-label">
                    ID (자동)
                    <input type="text" value={buildersLogForm.id} disabled />
                  </label>
                  <label className="admin-form-label">
                    Chapter No (예: 01)
                    <input type="text" required value={buildersLogForm.chapterNo} onChange={e => setBuildersLogForm(f => ({ ...f, chapterNo: e.target.value }))} />
                  </label>
                  <label className="admin-form-label" style={{ gridColumn: 'span 2' }}>
                    Slug (URL 경로, 영문/하이픈)
                    <input type="text" required value={buildersLogForm.slug} onChange={e => setBuildersLogForm(f => ({ ...f, slug: e.target.value }))} placeholder="my-awesome-update" />
                  </label>
                  <label className="admin-form-label" style={{ gridColumn: 'span 2' }}>
                    Title (메인 제목 - {buildersLogActiveTab.toUpperCase()})
                    <input type="text" required value={buildersLogForm.title[buildersLogActiveTab] || ''} onChange={e => setBuildersLogForm(f => ({ ...f, title: { ...f.title, [buildersLogActiveTab]: e.target.value } }))} />
                  </label>
                  <label className="admin-form-label" style={{ gridColumn: 'span 2' }}>
                    Subtitle (부제목/요약 - {buildersLogActiveTab.toUpperCase()})
                    <input type="text" value={buildersLogForm.subtitle[buildersLogActiveTab] || ''} onChange={e => setBuildersLogForm(f => ({ ...f, subtitle: { ...f.subtitle, [buildersLogActiveTab]: e.target.value } }))} />
                  </label>
                  <label className="admin-form-label" style={{ gridColumn: 'span 2' }}>
                    Description (요약 및 SEO 설명 - {buildersLogActiveTab.toUpperCase()})
                    <textarea rows={2} value={buildersLogForm.description[buildersLogActiveTab] || ''} onChange={e => setBuildersLogForm(f => ({ ...f, description: { ...f.description, [buildersLogActiveTab]: e.target.value } }))} placeholder="검색 엔진 및 리스트 카드에서 노출될 요약 정보입니다." />
                  </label>
                  <label className="admin-form-label">
                    Date (YYYY-MM-DD)
                    <input type="date" required value={buildersLogForm.date} onChange={e => setBuildersLogForm(f => ({ ...f, date: e.target.value }))} />
                  </label>
                  <label className="admin-form-label">
                    Accent Color (Hex)
                    <input type="text" value={buildersLogForm.accent} onChange={e => setBuildersLogForm(f => ({ ...f, accent: e.target.value }))} />
                  </label>
                  <label className="admin-form-label" style={{ gridColumn: 'span 2' }}>
                    Tags (콤마 분리)
                    <input type="text" value={buildersLogForm.tags} onChange={e => setBuildersLogForm(f => ({ ...f, tags: e.target.value }))} placeholder="Design, Architecture, Vercel" />
                  </label>
                  <label className="admin-form-label" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span>관련 커밋 (JSON 배열 - 옵션)</span>
                      <button type="button" onClick={handleFetchRecentCommits} className="admin-btn-secondary btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', height: 'auto' }}>
                        최근 커밋 10개 불러오기 ⬇️
                      </button>
                    </div>
                    <textarea rows={3} value={buildersLogForm.commits} onChange={e => setBuildersLogForm(f => ({ ...f, commits: e.target.value }))} placeholder='[{"message": "feat: init", "url": "https..."}]' />
                  </label>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="admin-btn-secondary btn-secondary" onClick={() => setBuildersLogModal(null)}>취소</button>
                  <button type="submit" className="admin-btn-primary btn-primary" disabled={buildersLogAction?.type === 'loading'}>
                    {buildersLogAction?.type === 'loading' ? '배포 중...' : 'GitHub 커밋 및 배포'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin Create/Edit Modal */}
        {adminModal && (
          <AdminModal
            mode={adminModal === 'create' ? 'create' : 'edit'}
            form={adminForm} setForm={setAdminForm}
            action={adminAction} onSubmit={handleAdminSubmit}
            onClose={() => setAdminModal(null)}
            showRole={true}
          />
        )}

        {/* Profile Modal */}
        {profileModal && (
          <div className="admin-modal-overlay" onClick={() => setProfileModal(false)}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>👤 마이페이지</h3>
                <button className="admin-modal-close" onClick={() => setProfileModal(false)}>✕</button>
              </div>
              <form onSubmit={handleProfileSubmit}>
                <div className="admin-modal-body">
                  <div className="admin-profile-card">
                    <div className="admin-profile-avatar-lg">👤</div>
                    <div className="admin-profile-detail">
                      <div className="admin-profile-email-lg">{profile?.email}</div>
                      <span className={`admin-role-badge ${profile?.role}`}>{ROLE_LABEL[profile?.role] || profile?.role}</span>
                    </div>
                  </div>
                  <div className="admin-profile-meta">
                    <span>가입: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ko') : '—'}</span>
                    <span>최근 접속: {profile?.lastSignIn ? new Date(profile.lastSignIn).toLocaleDateString('ko') : '—'}</span>
                  </div>
                  <label className="admin-form-label">
                    이름
                    <input type="text" value={profileForm.displayName}
                      onChange={e => setProfileForm(f => ({ ...f, displayName: e.target.value }))}
                      placeholder="표시 이름" />
                  </label>
                  <label className="admin-form-label">
                    새 비밀번호
                    <input type="password" value={profileForm.password}
                      onChange={e => setProfileForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="변경하지 않으려면 비워두세요" minLength={8} />
                  </label>
                  {profileAction && (
                    <div className={`admin-send-status ${profileAction.type}`}>{profileAction.msg}</div>
                  )}
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="admin-btn-secondary btn-secondary" onClick={() => setProfileModal(false)}>닫기</button>
                  <button type="submit" className="admin-btn-primary btn-primary">저장</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Content Create/Edit Modal */}
        {contentModal && (
          <div className="admin-modal-overlay" onClick={() => setContentModal(null)}>
            <div className="admin-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{contentModal.mode === 'create' ? '콘텐츠 수동 발행' : '콘텐츠 수정'}</h3>
                <button className="admin-modal-close" onClick={() => setContentModal(null)}>✕</button>
              </div>
              <form onSubmit={handleContentSubmit}>
                <div className="admin-modal-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div className="admin-modal-tabs" style={{ margin: 0, borderBottom: 'none' }}>
                      {['ko', 'en', 'ja'].map(lang => (
                        <button
                          key={lang}
                          type="button"
                          className={`admin-modal-tab ${contentFormLocale === lang ? 'active' : ''}`}
                          onClick={() => setContentFormLocale(lang)}
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>* 다국어 입력 선택</span>
                  </div>

                  <div className="admin-modal-tabs">
                    <button type="button" className={`admin-modal-tab ${contentModalTab === 'basic' ? 'active' : ''}`} onClick={() => setContentModalTab('basic')}>📅 기본 정보</button>
                    <button type="button" className={`admin-modal-tab ${contentModalTab === 'signal' ? 'active' : ''}`} onClick={() => setContentModalTab('signal')}>📰 IT Signal</button>
                    <button type="button" className={`admin-modal-tab ${contentModalTab === 'prompt' ? 'active' : ''}`} onClick={() => setContentModalTab('prompt')}>🤖 AI 프롬프트</button>
                    <button type="button" className={`admin-modal-tab ${contentModalTab === 'jp' ? 'active' : ''}`} onClick={() => setContentModalTab('jp')}>🇯🇵 일본어</button>
                  </div>

                  {contentModalTab === 'basic' && (
                    <>
                      <label className="admin-form-label">
                        날짜 (YYYY-MM-DD)
                        <input type="text" value={contentForm.date} onChange={e => setContentForm({...contentForm, date: e.target.value})} required disabled={contentModal.mode === 'edit'} />
                      </label>
                      <label className="admin-form-label">
                        공통 테마 (선택 - {contentFormLocale.toUpperCase()})
                        <input type="text" value={contentForm.study?.theme[contentFormLocale] || ''} onChange={e => setContentForm({...contentForm, study: {...contentForm.study, theme: { ...contentForm.study.theme, [contentFormLocale]: e.target.value }}})} />
                      </label>
                    </>
                  )}

                  {contentModalTab === 'signal' && (
                    <>
                      <label className="admin-form-label">
                        아티클 목록 (JSON 배열 - title, insight, summary, url, og_image, category 등)
                        <textarea value={contentForm.articles} onChange={e => setContentForm({...contentForm, articles: e.target.value})} rows={10} style={{ fontFamily: 'monospace' }} />
                      </label>
                    </>
                  )}

                  {contentModalTab === 'prompt' && (
                    <>
                      <label className="admin-form-label">
                        프롬프트 스니펫
                        <textarea value={contentForm.study?.prompt_snippet || ''} onChange={e => setContentForm({...contentForm, study: {...contentForm.study, prompt_snippet: e.target.value}})} rows={4} style={{ fontFamily: 'monospace' }} />
                      </label>
                      <label className="admin-form-label">
                        상세 설명 ({contentFormLocale.toUpperCase()})
                        <textarea value={contentForm.study?.explanation[contentFormLocale] || ''} onChange={e => setContentForm({...contentForm, study: {...contentForm.study, explanation: { ...contentForm.study.explanation, [contentFormLocale]: e.target.value }}})} rows={3} />
                      </label>
                      <label className="admin-form-label">
                        파라미터 설정 (JSON 배열 - name, description)
                        <textarea value={contentForm.parameters} onChange={e => setContentForm({...contentForm, parameters: e.target.value})} rows={4} style={{ fontFamily: 'monospace' }} />
                      </label>
                    </>
                  )}

                  {contentModalTab === 'jp' && (
                    <>
                      <label className="admin-form-label">
                        일본어 원문
                        <textarea value={contentForm.study?.sentence_jp || ''} onChange={e => setContentForm({...contentForm, study: {...contentForm.study, sentence_jp: e.target.value}})} rows={2} />
                      </label>
                      <label className="admin-form-label">
                        요미가나
                        <textarea value={contentForm.study?.sentence_furigana || ''} onChange={e => setContentForm({...contentForm, study: {...contentForm.study, sentence_furigana: e.target.value}})} rows={2} />
                      </label>
                      <label className="admin-form-label">
                        해석 (Translation - {contentFormLocale.toUpperCase()})
                        <textarea value={contentForm.study?.sentence_kr[contentFormLocale] || ''} onChange={e => setContentForm({...contentForm, study: {...contentForm.study, sentence_kr: { ...contentForm.study.sentence_kr, [contentFormLocale]: e.target.value }}})} rows={2} />
                      </label>
                      <label className="admin-form-label">
                        문장 한국어 발음
                        <textarea value={contentForm.study?.sentence_pronunciation_kr || ''} onChange={e => setContentForm({...contentForm, study: {...contentForm.study, sentence_pronunciation_kr: e.target.value}})} rows={2} placeholder="예: 사이킨노 에-아이..." />
                      </label>
                      <label className="admin-form-label">
                        단어장 (JSON 배열 - word, reading, pronunciation_kr, meaning)
                        <textarea value={contentForm.vocabulary} onChange={e => setContentForm({...contentForm, vocabulary: e.target.value})} rows={4} style={{ fontFamily: 'monospace' }} />
                      </label>
                      <label className="admin-form-label">
                        실무 활용 팁 (비즈니스 코멘트 - {contentFormLocale.toUpperCase()})
                        <textarea value={contentForm.study?.business_context[contentFormLocale] || ''} onChange={e => setContentForm({...contentForm, study: {...contentForm.study, business_context: { ...contentForm.study.business_context, [contentFormLocale]: e.target.value }}})} rows={3} />
                      </label>
                    </>
                  )}

                  {contentAction && <div className={`admin-send-status ${contentAction.type}`}>{contentAction.msg}</div>}
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="admin-btn-secondary btn-secondary" onClick={() => setContentModal(null)}>취소</button>
                  <button type="submit" className="admin-btn-primary btn-primary">저장</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}

// ─── Admin Modal ─────────────────────────────────

function AdminModal({ mode, form, setForm, action, onSubmit, onClose, showRole }) {
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{mode === 'create' ? '관리자 추가' : '관리자 수정'}</h3>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="admin-modal-body">
            <label className="admin-form-label">
              이메일
              <input type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required placeholder="admin@prisincera.com" />
            </label>
            <label className="admin-form-label">
              {mode === 'create' ? '비밀번호' : '새 비밀번호 (변경 시에만)'}
              <input type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                {...(mode === 'create' ? { required: true, minLength: 8 } : {})}
                placeholder={mode === 'create' ? '8자 이상' : '변경하지 않으려면 비워두세요'} />
            </label>
            <label className="admin-form-label">
              이름 (선택)
              <input type="text" value={form.displayName}
                onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                placeholder="관리자 이름" />
            </label>
            {showRole && (
              <label className="admin-form-label">
                역할
                <select value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="admin">관리자</option>
                  <option value="super_admin">슈퍼 관리자</option>
                </select>
              </label>
            )}
            {action && <div className={`admin-send-status ${action.type}`}>{action.msg}</div>}
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn-secondary btn-secondary" onClick={onClose}>취소</button>
            <button type="submit" className="admin-btn-primary btn-primary">{mode === 'create' ? '생성' : '저장'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────

function StatCard({ label, value, icon, color, onClick }) {
  return (
    <div 
      className={`admin-stat-card ${onClick ? 'clickable' : ''}`} 
      style={{ '--card-accent': color }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  );
}

// ─── Main Admin Page ─────────────────────────────

export default function AdminDashboard() {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token'));
  const [adminEmail, setAdminEmail] = useState(() => sessionStorage.getItem('admin_email'));

  const handleLogin = (idToken, email) => {
    setToken(idToken); setAdminEmail(email);
    sessionStorage.setItem('admin_token', idToken);
    sessionStorage.setItem('admin_email', email);
  };

  const handleLogout = () => {
    setToken(null); setAdminEmail(null);
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_email');
  };

  if (!token) return <LoginForm onLogin={handleLogin} />;
  return <Dashboard token={token} adminEmail={adminEmail} onLogout={handleLogout} />;
}

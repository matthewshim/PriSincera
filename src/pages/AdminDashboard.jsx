import { useState, useEffect, useCallback } from 'react';
import './AdminDashboard.css';

const API_BASE = '/admin/api';

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
          <button id="admin-login-btn" type="submit" disabled={loading} style={{ marginBottom: 12 }}>
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

  // PriStudy
  const [priStudyStats, setPriStudyStats] = useState(null);
  const [priStudyContent, setPriStudyContent] = useState([]);
  const [priStudyLearners, setPriStudyLearners] = useState([]);
  const [contentModal, setContentModal] = useState(null);
  const [contentForm, setContentForm] = useState(null);
  const [contentAction, setContentAction] = useState(null);

  const isSuperAdmin = role === 'super_admin';

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
      const data = await fetchApi('/pristudy/stats');
      setPriStudyStats(data);
    } catch (err) { if (err.message === 'AUTH_EXPIRED') onLogout(); }
  }

  async function loadPriStudyContent() {
    try {
      const data = await fetchApi('/pristudy/content');
      setPriStudyContent(data.contents || []);
    } catch (err) { if (err.message === 'AUTH_EXPIRED') onLogout(); }
  }

  async function loadPriStudyLearners() {
    try {
      const data = await fetchApi('/pristudy/learners');
      setPriStudyLearners(data.learners || []);
    } catch (err) { if (err.message === 'AUTH_EXPIRED') onLogout(); }
  }

  function openEditContent(item) {
    setContentForm({ ...item, vocabulary: JSON.stringify(item.vocabulary || [], null, 2) });
    setContentAction(null);
    setContentModal({ mode: 'edit', date: item.date });
  }

  function openCreateContent() {
    setContentForm({ date: '', theme: '', sentence_jp: '', sentence_furigana: '', sentence_pronunciation_kr: '', sentence_kr: '', vocabulary: '[]', business_context: '' });
    setContentAction(null);
    setContentModal({ mode: 'create' });
  }

  async function handleContentSubmit(e) {
    e.preventDefault();
    setContentAction({ type: 'loading', msg: '저장 중...' });
    try {
      const body = { ...contentForm, vocabulary: JSON.parse(contentForm.vocabulary || '[]') };
      if (contentModal.mode === 'create') {
        await fetchApi('/pristudy/content', { method: 'POST', body: JSON.stringify(body) });
      } else {
        await fetchApi(`/pristudy/content/${contentModal.date}`, { method: 'PUT', body: JSON.stringify(body) });
      }
      setContentAction({ type: 'success', msg: '저장 완료!' });
      setTimeout(() => { setContentModal(null); loadPriStudyContent(); }, 1000);
    } catch (err) {
      setContentAction({ type: 'error', msg: `오류: ${err.message}` });
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
    if (activeTab === 'subscribers') loadSubscribers();
    if (activeTab === 'emails') loadEmailLogs();
    if (activeTab === 'admins' && isSuperAdmin) loadAdmins();
    if (activeTab === 'pristudy_overview') loadPriStudyStats();
    if (activeTab === 'pristudy_content') loadPriStudyContent();
    if (activeTab === 'pristudy_learners') loadPriStudyLearners();
  }, [activeTab]);

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" />데이터 로딩 중...</div>;
  }

  const ROLE_LABEL = { super_admin: '슈퍼 관리자', admin: '관리자' };

  const menuGroups = [
    {
      id: 'prisignal',
      label: 'Signal',
      items: [
        { id: 'overview', label: '📊 대시보드' },
        { id: 'subscribers', label: '👥 구독자' },
        { id: 'emails', label: '📧 이메일' },
        { id: 'pipeline', label: '⚙️ 파이프라인' },
      ]
    },
    {
      id: 'pristudy',
      label: 'Study',
      items: [
        { id: 'pristudy_overview', label: '📊 대시보드' },
        { id: 'pristudy_content', label: '📚 콘텐츠 관리' },
        { id: 'pristudy_learners', label: '🏆 학습자 현황' },
      ]
    },
    ...(isSuperAdmin ? [{
      id: 'common',
      label: 'Common',
      items: [
        { id: 'admins', label: '🔐 관리자' }
      ]
    }] : [])
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <span className="admin-logo">🛡️</span>
          <h1>PriSincera Admin</h1>
        </div>
        <div className="admin-header-right">
          <button className="admin-profile-btn" onClick={openProfile} title="마이페이지">
            <span className="admin-avatar">👤</span>
            <span className="admin-profile-info">
              <span className="admin-profile-email">{adminEmail}</span>
              <span className={`admin-role-badge ${role}`}>{ROLE_LABEL[role] || role}</span>
            </span>
          </button>
          <button className="admin-logout-btn" onClick={onLogout}>로그아웃</button>
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
        {activeTab === 'overview' && stats && (
          <div className="admin-overview">
            <div className="admin-stat-grid">
              <StatCard label="활성 구독자" value={stats.subscribers.active} icon="👥" color="var(--admin-accent)" onClick={() => setActiveTab('subscribers')} />
              <StatCard label="전체 구독자" value={stats.subscribers.total} icon="📋" color="var(--admin-blue)" onClick={() => setActiveTab('subscribers')} />
              <StatCard label="해지" value={stats.subscribers.unsubscribed} icon="🚪" color="var(--admin-orange)" onClick={() => setActiveTab('subscribers')} />
              <StatCard label="발송 이력" value={stats.emails.totalSent} icon="📧" color="var(--admin-green)" onClick={() => setActiveTab('emails')} />
            </div>
            {pipeline && (
              <div className="admin-pipeline-summary">
                <h3>파이프라인 상태</h3>
                <div className={`admin-pipeline-badge ${pipeline.collector.status}`}>
                  {pipeline.collector.status === 'success' ? '✅ 오늘 수집 완료' : '⏳ 대기 중'}
                </div>
                <p>최근 실행: {pipeline.collector.lastRun || 'N/A'}</p>
                <p>누적 데일리: {pipeline.totalDates}일</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'subscribers' && (
          <div className="admin-subscribers">
            <div className="admin-section-header">
              <h2>구독자 관리</h2>
              <button className="admin-btn-secondary" onClick={exportCsv}>📥 CSV 내보내기</button>
            </div>
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

        {activeTab === 'emails' && (
          <div className="admin-emails">
            <div className="admin-section-header"><h2>이메일 발송</h2></div>
            <div className="admin-test-send">
              <h3>테스트 발송</h3>
              <div className="admin-test-send-form">
                <input id="test-email-input" type="email" placeholder="수신 이메일"
                  value={testEmail} onChange={e => setTestEmail(e.target.value)} />
                <button className="admin-btn-primary" onClick={sendTestEmail}>📨 테스트 발송</button>
              </div>
              {sendStatus && <div className={`admin-send-status ${sendStatus.type}`}>{sendStatus.msg}</div>}
            </div>
            <h3>발송 이력</h3>
            <div className="admin-table-wrap">
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
          </div>
        )}

        {activeTab === 'pipeline' && pipeline && (
          <div className="admin-pipeline">
            <h2>파이프라인 현황</h2>
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
              <h2>관리자 계정 관리</h2>
              <button className="admin-btn-primary" onClick={openCreateAdmin}>➕ 관리자 추가</button>
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

        {activeTab === 'pristudy_overview' && priStudyStats && (
          <div className="admin-overview">
            <div className="admin-section-header"><h2>Study 대시보드</h2></div>
            <div className="admin-stat-grid">
              <StatCard label="누적 콘텐츠" value={priStudyStats.totalContent} icon="📚" color="var(--admin-blue)" onClick={() => setActiveTab('pristudy_content')} />
              <StatCard label="총 학습자" value={priStudyStats.totalLearners} icon="👥" color="var(--admin-green)" onClick={() => setActiveTab('pristudy_learners')} />
            </div>
          </div>
        )}

        {activeTab === 'pristudy_content' && (
          <div className="admin-subscribers">
            <div className="admin-section-header">
              <h2>콘텐츠 관리</h2>
              <button className="admin-btn-primary" onClick={openCreateContent}>➕ 수동 발행</button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>날짜</th><th>일본어 문장</th><th>테마</th><th>관리</th></tr></thead>
                <tbody>
                  {priStudyContent.map((item, i) => (
                    <tr key={i}>
                      <td>{item.date}</td>
                      <td className="admin-subject-cell">{item.sentence_jp}</td>
                      <td>{item.theme || '-'}</td>
                      <td className="admin-actions-cell">
                        <button className="admin-action-btn edit" onClick={() => openEditContent(item)} title="수정">✏️</button>
                      </td>
                    </tr>
                  ))}
                  {priStudyContent.length === 0 && (<tr><td colSpan={4} className="admin-empty">콘텐츠가 없습니다</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pristudy_learners' && (
          <div className="admin-subscribers">
            <div className="admin-section-header"><h2>우수 학습자 현황</h2></div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>이메일</th><th>최장 연속(일)</th><th>현재 연속(일)</th><th>누적 학습(일)</th><th>최근 학습일</th></tr></thead>
                <tbody>
                  {priStudyLearners.map((l, i) => (
                    <tr key={i}>
                      <td className="admin-email-cell">{l.email}</td>
                      <td><strong>{l.longest_streak}</strong></td>
                      <td>{l.current_streak}</td>
                      <td>{l.total_completed}</td>
                      <td>{l.last_study_date}</td>
                    </tr>
                  ))}
                  {priStudyLearners.length === 0 && (<tr><td colSpan={5} className="admin-empty">학습자 데이터가 없습니다</td></tr>)}
                </tbody>
              </table>
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
                  <button type="button" className="admin-btn-secondary" onClick={() => setProfileModal(false)}>닫기</button>
                  <button type="submit" className="admin-btn-primary">저장</button>
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
                  <label className="admin-form-label">
                    날짜 (YYYY-MM-DD)
                    <input type="text" value={contentForm.date} onChange={e => setContentForm({...contentForm, date: e.target.value})} required disabled={contentModal.mode === 'edit'} />
                  </label>
                  <label className="admin-form-label">
                    테마 (선택)
                    <input type="text" value={contentForm.theme} onChange={e => setContentForm({...contentForm, theme: e.target.value})} />
                  </label>
                  <label className="admin-form-label">
                    일본어 원문
                    <textarea value={contentForm.sentence_jp} onChange={e => setContentForm({...contentForm, sentence_jp: e.target.value})} required rows={2} />
                  </label>
                  <label className="admin-form-label">
                    요미가나
                    <textarea value={contentForm.sentence_furigana} onChange={e => setContentForm({...contentForm, sentence_furigana: e.target.value})} required rows={2} />
                  </label>
                  <label className="admin-form-label">
                    한국어 해석
                    <textarea value={contentForm.sentence_kr} onChange={e => setContentForm({...contentForm, sentence_kr: e.target.value})} required rows={2} />
                  </label>
                  <label className="admin-form-label">
                    문장 한국어 발음
                    <textarea value={contentForm.sentence_pronunciation_kr} onChange={e => setContentForm({...contentForm, sentence_pronunciation_kr: e.target.value})} rows={2} placeholder="예: 사이킨노 에-아이..." />
                  </label>
                  <label className="admin-form-label">
                    단어장 (JSON 배열 - pronunciation_kr 속성 포함)
                    <textarea value={contentForm.vocabulary} onChange={e => setContentForm({...contentForm, vocabulary: e.target.value})} rows={3} style={{ fontFamily: 'monospace' }} />
                  </label>
                  <label className="admin-form-label">
                    비즈니스 코멘트
                    <textarea value={contentForm.business_context} onChange={e => setContentForm({...contentForm, business_context: e.target.value})} rows={3} />
                  </label>
                  {contentAction && <div className={`admin-send-status ${contentAction.type}`}>{contentAction.msg}</div>}
                </div>
                <div className="admin-modal-footer">
                  <button type="button" className="admin-btn-secondary" onClick={() => setContentModal(null)}>취소</button>
                  <button type="submit" className="admin-btn-primary">저장</button>
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
            <button type="button" className="admin-btn-secondary" onClick={onClose}>취소</button>
            <button type="submit" className="admin-btn-primary">{mode === 'create' ? '생성' : '저장'}</button>
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

import { useState, useEffect, useCallback } from 'react';
import './AdminDashboard.css';

const API_BASE = '/admin/api';

/**
 * Firebase Auth — 클라이언트 (CDN import 대신 REST API 사용)
 * Cloud Run 환경에서는 Firebase SDK를 번들에 포함하지 않고
 * REST API로 인증 처리 (번들 크기 최적화)
 */
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY || '';

async function signInWithEmail(email, password) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Login failed');
  }
  return res.json();
}

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
      const result = await signInWithEmail(email, password);
      onLogin(result.idToken, result.email);
    } catch (err) {
      setError(err.message === 'INVALID_LOGIN_CREDENTIALS'
        ? '이메일 또는 비밀번호가 올바르지 않습니다.'
        : err.message);
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
            id="admin-email"
            type="email"
            placeholder="관리자 이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            id="admin-password"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="admin-error">{error}</div>}
          <button id="admin-login-btn" type="submit" disabled={loading}>
            {loading ? '인증 중...' : '로그인'}
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
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
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

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [statsRes, pipelineRes] = await Promise.allSettled([
        fetchApi('/stats'),
        fetchApi('/pipeline/status'),
      ]);
      setStats(statsRes.status === 'fulfilled' ? statsRes.value : {
        subscribers: { active: 0, total: 0, unsubscribed: 0 },
        emails: { totalSent: 0, lastSentDate: null },
      });
      setPipeline(pipelineRes.status === 'fulfilled' ? pipelineRes.value : {
        collector: { status: 'pending', lastRun: null },
        totalDates: 0,
        recentDates: [],
      });
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') onLogout();
      console.error('Dashboard load error:', err);
    }
    setLoading(false);
  }

  async function loadSubscribers() {
    try {
      const data = await fetchApi('/subscribers?limit=50');
      setSubscribers(data.subscribers || []);
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') onLogout();
    }
  }

  async function loadEmailLogs() {
    try {
      const data = await fetchApi('/email/logs?limit=20');
      setEmailLogs(data.logs || []);
    } catch (err) {
      if (err.message === 'AUTH_EXPIRED') onLogout();
    }
  }

  async function exportCsv() {
    try {
      const res = await fetch(`${API_BASE}/subscribers/export`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }

  async function sendTestEmail() {
    if (!testEmail) return;
    setSendStatus({ type: 'loading', msg: '발송 중...' });
    try {
      const result = await fetchApi('/email/send-test', {
        method: 'POST',
        body: JSON.stringify({ to: testEmail }),
      });
      setSendStatus({ type: 'success', msg: `✅ 발송 성공 (${result.messageId})` });
    } catch (err) {
      setSendStatus({ type: 'error', msg: `❌ 발송 실패: ${err.message}` });
    }
  }

  useEffect(() => {
    if (activeTab === 'subscribers') loadSubscribers();
    if (activeTab === 'emails') loadEmailLogs();
  }, [activeTab]);

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" />데이터 로딩 중...</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <span className="admin-logo">🛡️</span>
          <h1>PriSincera Admin</h1>
        </div>
        <div className="admin-header-right">
          <span className="admin-user">{adminEmail}</span>
          <button className="admin-logout-btn" onClick={onLogout}>로그아웃</button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="admin-tabs">
        {[
          { id: 'overview', label: '📊 대시보드', },
          { id: 'subscribers', label: '👥 구독자' },
          { id: 'emails', label: '📧 이메일' },
          { id: 'pipeline', label: '⚙️ 파이프라인' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="admin-content">
        {activeTab === 'overview' && stats && (
          <div className="admin-overview">
            <div className="admin-stat-grid">
              <StatCard label="활성 구독자" value={stats.subscribers.active} icon="👥" color="var(--admin-accent)" />
              <StatCard label="전체 구독자" value={stats.subscribers.total} icon="📋" color="var(--admin-blue)" />
              <StatCard label="해지" value={stats.subscribers.unsubscribed} icon="🚪" color="var(--admin-orange)" />
              <StatCard label="발송 이력" value={stats.emails.totalSent} icon="📧" color="var(--admin-green)" />
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
                <thead>
                  <tr>
                    <th>이메일</th>
                    <th>상태</th>
                    <th>구독일</th>
                    <th>가입 경로</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub, i) => (
                    <tr key={i}>
                      <td className="admin-email-cell">{sub.email}</td>
                      <td>
                        <span className={`admin-status-badge ${sub.status}`}>
                          {sub.status === 'active' ? '활성' : '해지'}
                        </span>
                      </td>
                      <td>{sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString('ko') : '-'}</td>
                      <td>{sub.source || '-'}</td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && (
                    <tr><td colSpan={4} className="admin-empty">구독자 데이터가 없습니다</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="admin-emails">
            <div className="admin-section-header">
              <h2>이메일 발송</h2>
            </div>
            {/* Test send */}
            <div className="admin-test-send">
              <h3>테스트 발송</h3>
              <div className="admin-test-send-form">
                <input
                  id="test-email-input"
                  type="email"
                  placeholder="수신 이메일"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                />
                <button className="admin-btn-primary" onClick={sendTestEmail}>
                  📨 테스트 발송
                </button>
              </div>
              {sendStatus && (
                <div className={`admin-send-status ${sendStatus.type}`}>{sendStatus.msg}</div>
              )}
            </div>
            {/* Logs */}
            <h3>발송 이력</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>제목</th>
                    <th>수신</th>
                    <th>성공</th>
                    <th>발송 시각</th>
                  </tr>
                </thead>
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
                  {emailLogs.length === 0 && (
                    <tr><td colSpan={5} className="admin-empty">발송 이력이 없습니다</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && pipeline && (
          <div className="admin-pipeline">
            <h2>파이프라인 현황</h2>
            <div className="admin-stat-grid">
              <StatCard
                label="Collector"
                value={pipeline.collector.status === 'success' ? '정상' : '대기'}
                icon="📡"
                color={pipeline.collector.status === 'success' ? 'var(--admin-green)' : 'var(--admin-orange)'}
              />
              <StatCard label="누적 데일리" value={`${pipeline.totalDates}일`} icon="📅" color="var(--admin-blue)" />
            </div>
            <h3>최근 7일</h3>
            <div className="admin-recent-dates">
              {(pipeline.recentDates || []).map(d => (
                <span key={d} className="admin-date-chip">{d}</span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────

function StatCard({ label, value, icon, color }) {
  return (
    <div className="admin-stat-card" style={{ '--card-accent': color }}>
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
    setToken(idToken);
    setAdminEmail(email);
    sessionStorage.setItem('admin_token', idToken);
    sessionStorage.setItem('admin_email', email);
  };

  const handleLogout = () => {
    setToken(null);
    setAdminEmail(null);
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_email');
  };

  if (!token) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Dashboard token={token} adminEmail={adminEmail} onLogout={handleLogout} />;
}

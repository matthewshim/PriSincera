import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import useSEO from '../../hooks/useSEO';
import { useWaymarkApi } from './waymarkApi';
import { DOMAINS, EMOTIONS, IMPORTANCE, TONES } from '../../data/waymarkModel.mjs';
import './WaymarkApp.css';

/**
 * Waymark 앱 (/waymark/app) — M1-A 결정 코어 · 반응형 마스터-디테일.
 * 데스크톱 2-pane(좌 타임라인 사이드바 + 우 상세·대화), 모바일 단일 컬럼.
 * GNB는 body.hero-ready로 노출(§9-1). 데이터는 server REST(Bearer) → admin Firestore. 전 문자열 i18n.
 */

const Svg = ({ d, w = 18, sw = 1.5 }) => (
  <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const BackIcon = () => <Svg d={<path d="M15 18l-6-6 6-6" />} w={16} sw={2} />;
const SendIcon = () => <Svg d={<path d="M12 19V5M5 12l7-7 7 7" />} w={16} sw={2} />;
const PlusIcon = () => <Svg d={<path d="M12 5v14M5 12h14" />} w={16} sw={2} />;
const GearIcon = () => <Svg d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>} w={16} />;

const tsToMs = (ts) => {
  if (!ts) return 0;
  if (ts.toMillis) return ts.toMillis();
  if (ts._seconds != null) return ts._seconds * 1000;
  if (ts.seconds != null) return ts.seconds * 1000;
  return Date.parse(ts) || 0;
};
const timeAgo = (ts, t) => {
  const ms = tsToMs(ts);
  if (!ms) return '';
  const days = Math.floor((Date.now() - ms) / 86400000);
  return days <= 0 ? t('waymark.app.today') : t('waymark.app.daysAgo', { n: days });
};

function PaneHeader({ title }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <header className="wma-top">
      <button type="button" className="wma-back" onClick={() => navigate('/waymark/app')}><BackIcon /> {t('waymark.app.back')}</button>
      <span className="wma-brand">{title}</span>
    </header>
  );
}

function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const api = useWaymarkApi();
  const [st, setSt] = useState({ loading: true, decisions: [], events: [], error: null });
  const activeId = (location.pathname.match(/\/d\/([^/]+)/) || [])[1];

  useEffect(() => {
    let alive = true;
    Promise.all([api.listDecisions(), api.upcomingEvents()])
      .then(([d, e]) => { if (alive) setSt({ loading: false, decisions: d.decisions || [], events: e.events || [], error: null }); })
      .catch((err) => { if (alive) setSt((s) => ({ ...s, loading: false, error: err.message })); });
    return () => { alive = false; };
  }, [api, location.key]);

  return (
    <aside className="wma-side">
      <div className="wma-side-head">
        <span className="wma-brand">Waymark</span>
        <Link to="/waymark/app/me" className="wma-iconlink" aria-label={t('waymark.app.tabMe')}><GearIcon /></Link>
      </div>
      <Link to="/waymark/app/new" className="wma-btn wma-side-new"><PlusIcon /> {t('waymark.app.newDecision')}</Link>

      <div className="wma-side-scroll">
        {st.error && <p className="wma-state wma-err">{st.error}</p>}
        {st.events.length > 0 && (
          <>
            <div className="u-eyebrow wma-sect">{t('waymark.app.upcoming')}</div>
            {st.events.map((ev) => (
              <Link key={ev.id} to={`/waymark/app/d/${ev.decisionId}`} className={`wma-card wma-card-accent wma-listitem${activeId === ev.decisionId ? ' wma-active' : ''}`}>
                <div className="u-eyebrow wma-lead">{t(`waymark.detail.lead.${ev.type}`)}</div>
                <div className="wma-dtitle wma-mt">{ev.decisionTitle || ''}</div>
              </Link>
            ))}
          </>
        )}

        <div className="u-eyebrow wma-sect">{t('waymark.app.myDecisions')}</div>
        {st.loading && <p className="wma-state">{t('waymark.app.loading')}</p>}
        {!st.loading && st.decisions.length === 0 && !st.error && <p className="wma-state">{t('waymark.app.emptyTimeline')}</p>}
        {st.decisions.map((d) => (
          <Link key={d.id} to={`/waymark/app/d/${d.id}`} className={`wma-card wma-listitem${activeId === d.id ? ' wma-active' : ''}`}>
            <div className="wma-cardrow"><span className="wma-dtitle">{d.title}</span><span className={`wma-badge ${d.status}`}>{t(`waymark.enum.status.${d.status}`)}</span></div>
            <div className="wma-cardrow wma-mt"><span className="wma-dmeta">{t(`waymark.enum.domain.${d.domain}`)}</span><span className="wma-time">{timeAgo(d.createdAt, t)}</span></div>
          </Link>
        ))}
      </div>
    </aside>
  );
}

function Welcome() {
  const { t } = useTranslation();
  return <section className="wma-pane wma-welcome"><p className="wma-state">{t('waymark.app.welcome')}</p></section>;
}

function NewDecision() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const api = useWaymarkApi();
  const [f, setF] = useState({ title: '', context: '', optionsRaw: '', chosen: '', emotionTags: [], domain: '', importance: 2 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const toggleEmotion = (e) => setF((s) => ({ ...s, emotionTags: s.emotionTags.includes(e) ? s.emotionTags.filter((x) => x !== e) : [...s.emotionTags, e].slice(0, 6) }));
  const valid = f.title.trim() && f.context.trim() && f.chosen.trim() && f.domain && f.emotionTags.length > 0;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true); setError(null);
    try {
      const { id } = await api.createDecision({
        title: f.title, context: f.context, chosen: f.chosen,
        options: f.optionsRaw.split(/[,\n]/).map((s) => s.trim()).filter(Boolean),
        emotionTags: f.emotionTags, domain: f.domain, importance: f.importance,
      });
      navigate(`/waymark/app/d/${id}`, { replace: true });
    } catch (err) { setError(err.message); setBusy(false); }
  };
  const ask = (key) => <div className="wma-m them">{t(key)}</div>;

  return (
    <section className="wma-pane">
      <PaneHeader title={t('waymark.app.newTitle')} />
      <div className="wma-pane-body">
        <div className="wma-thread">
          {ask('waymark.new.qTitle')}
          <div className="wma-field"><input className="wma-input" value={f.title} maxLength={80} onChange={(e) => set('title', e.target.value)} placeholder={t('waymark.new.phTitle')} /></div>
          {ask('waymark.new.qContext')}
          <div className="wma-field"><textarea className="wma-textarea" value={f.context} maxLength={4000} onChange={(e) => set('context', e.target.value)} placeholder={t('waymark.new.phContext')} /></div>
          {ask('waymark.new.qOptions')}
          <div className="wma-field"><input className="wma-input" value={f.optionsRaw} onChange={(e) => set('optionsRaw', e.target.value)} placeholder={t('waymark.new.phOptions')} /></div>
          {ask('waymark.new.qChosen')}
          <div className="wma-field"><input className="wma-input" value={f.chosen} onChange={(e) => set('chosen', e.target.value)} placeholder={t('waymark.new.phChosen')} /></div>
          {ask('waymark.new.qEmotion')}
          <div className="wma-chips">{EMOTIONS.map((e) => <button type="button" key={e} className={`wma-chip${f.emotionTags.includes(e) ? ' on' : ''}`} onClick={() => toggleEmotion(e)}>{t(`waymark.enum.emotion.${e}`)}</button>)}</div>
          {ask('waymark.new.qDomain')}
          <div className="wma-chips">{DOMAINS.map((d) => <button type="button" key={d} className={`wma-chip${f.domain === d ? ' on' : ''}`} onClick={() => set('domain', d)}>{t(`waymark.enum.domain.${d}`)}</button>)}</div>
          {ask('waymark.new.qImportance')}
          <div className="wma-seg">{IMPORTANCE.map((n) => <button type="button" key={n} className={f.importance === n ? 'on' : ''} onClick={() => set('importance', n)}>{t(`waymark.enum.importance.${n}`)}</button>)}</div>
        </div>
        {error && <p className="wma-state wma-err">{error}</p>}
        <button type="button" className="wma-btn" disabled={!valid || busy} onClick={submit}>{busy ? t('waymark.app.saving') : t('waymark.new.save')}</button>
      </div>
    </section>
  );
}

function Detail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const api = useWaymarkApi();
  const [st, setSt] = useState({ loading: true, error: null, decision: null, messages: [] });
  const [tone, setTone] = useState(null);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    let alive = true;
    setTone(null);
    api.getDecision(id)
      .then((r) => { if (alive) setSt({ loading: false, error: null, decision: r.decision, messages: r.messages || [] }); })
      .catch((err) => { if (alive) setSt((s) => ({ ...s, loading: false, error: err.message })); });
    return () => { alive = false; };
  }, [api, id]);
  useEffect(() => load(), [load]);

  const sendNote = async () => {
    if (!note.trim() || sending) return;
    setSending(true);
    try { await api.addMessage(id, note); setNote(''); load(); }
    catch (err) { setSt((s) => ({ ...s, error: err.message })); }
    finally { setSending(false); }
  };

  if (st.loading) return <section className="wma-pane"><PaneHeader title="Waymark" /><div className="wma-pane-body"><p className="wma-state">{t('waymark.app.loading')}</p></div></section>;
  if (!st.decision) return <section className="wma-pane"><PaneHeader title="Waymark" /><div className="wma-pane-body"><p className="wma-state wma-err">{st.error || t('waymark.app.notFound')}</p></div></section>;

  const d = st.decision;
  const companion = st.messages.filter((m) => m.type !== 'user_note');
  const lastId = companion.length ? companion[companion.length - 1].id : null;
  const lastTone = companion.length ? companion[companion.length - 1].tone : null;

  const renderCompanion = (m) => {
    const useToneVal = (m.id === lastId && tone) ? tone : m.tone;
    const lead = m.type === 'nudge' ? t(`waymark.enum.tone.${useToneVal}`) : t(`waymark.detail.lead.${m.type}`);
    return (
      <div className="wma-m them" key={m.id}>
        <span className="u-eyebrow wma-lead">{lead}</span>
        {t(`waymark.companion.${useToneVal}.msg`, m.vars || {})}
        <span className="wma-close">{t(`waymark.companion.${useToneVal}.close`)}</span>
      </div>
    );
  };

  return (
    <section className="wma-pane">
      <PaneHeader title={t(`waymark.enum.domain.${d.domain}`)} />
      <div className="wma-pane-body">
        <div className="wma-card wma-flat">
          <div className="wma-cardrow"><span className="wma-dtitle">{d.title}</span><span className={`wma-badge ${d.status}`}>{t(`waymark.enum.status.${d.status}`)}</span></div>
          <div className="wma-dmeta wma-mt">{d.emotionTags?.length ? d.emotionTags.map((e) => t(`waymark.enum.emotion.${e}`)).join('·') : ''}</div>
        </div>

        <div className="wma-thread">
          {st.messages.map((m) => (m.type === 'user_note'
            ? <div className="wma-m me" key={m.id}>{m.text}</div>
            : renderCompanion(m)))}
        </div>

        {lastId && (
          <div className="wma-tones">
            {TONES.map((tn) => <button type="button" key={tn} className={`wma-tone${(tone || lastTone) === tn ? ' on' : ''}`} onClick={() => setTone(tn)}>{t(`waymark.enum.tone.${tn}`)}</button>)}
          </div>
        )}

        <div className="wma-ai">
          <div className="wma-ai-h"><span>{t('waymark.detail.aiTitle')}</span><span className="wma-ai-soon">{t('waymark.detail.aiSoon')}</span></div>
          <span className="wma-ai-note">{t('waymark.detail.principle')}</span>
        </div>

        {st.error && <p className="wma-state wma-err">{st.error}</p>}
        <div className="wma-composer">
          <input className="wma-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('waymark.detail.notePlaceholder')} onKeyDown={(e) => { if (e.key === 'Enter') sendNote(); }} />
          <button type="button" className="wma-send" disabled={!note.trim() || sending} onClick={sendNote} aria-label={t('waymark.detail.send')}><SendIcon /></button>
        </div>
      </div>
    </section>
  );
}

function Settings() {
  const { t } = useTranslation();
  return <section className="wma-pane"><PaneHeader title={t('waymark.app.tabMe')} /><div className="wma-pane-body"><p className="wma-state">{t('waymark.app.settingsSoon')}</p></div></section>;
}

function AppShell() {
  const location = useLocation();
  const isIndex = /\/waymark\/app\/?$/.test(location.pathname);
  return (
    <div className={`wma-app${isIndex ? '' : ' wma-app--pane'}`}>
      <Sidebar />
      <Routes>
        <Route index element={<Welcome />} />
        <Route path="new" element={<NewDecision />} />
        <Route path="d/:id" element={<Detail />} />
        <Route path="me" element={<Settings />} />
        <Route path="*" element={<Navigate to="/waymark/app" replace />} />
      </Routes>
    </div>
  );
}

export default function WaymarkApp() {
  const { user, loginWithGoogle } = useAuth();
  const { t } = useTranslation();
  useSEO({ title: t('waymark.app.seoTitle'), description: t('waymark.app.seoDesc'), ogUrl: 'https://www.prisincera.com/waymark/app' });

  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => document.body.classList.remove('hero-ready');
  }, []);

  if (!user) {
    return (
      <div className="wma-gate">
        <div className="wma-gate-card">
          <h1 className="wma-gate-title">Waymark</h1>
          <p className="wma-gate-sub">{t('waymark.app.signInPrompt')}</p>
          <button type="button" className="wma-btn" onClick={loginWithGoogle}>{t('waymark.app.signInBtn')}</button>
          <p className="wma-gate-note">{t('waymark.app.sharedAccount')}</p>
          <p className="wma-gate-note">{t('waymark.app.betaNote')}</p>
        </div>
      </div>
    );
  }
  return <AppShell />;
}

import { useState, useEffect, useRef, useCallback, createContext, useContext, useMemo } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import useSEO from '../../hooks/useSEO';
import { useWaymarkApi } from './waymarkApi';
import { DOMAINS, EMOTIONS, IMPORTANCE, TONES, OUTCOMES } from '../../data/waymarkModel.mjs';
import { saveByok, getByok, byokProvider, clearByok, byokSystem, byokOpeningSystem, callByok } from './byok';
import Icon from '../../components/common/Icon';
import ByokConnect from './ByokConnect';
import { enablePush, disablePush } from './push';
import './WaymarkApp.css';

const RefreshContext = createContext({ version: 0, bump: () => {} });

/**
 * Waymark 앱 (/waymark/app) — M1-A 결정 코어 + M1-B 알림 + M1-D 회고.
 * 반응형 마스터-디테일. GNB는 body.hero-ready로 노출(§9-1). 데이터는 server REST(Bearer)→admin Firestore.
 */

const Svg = ({ d, w = 18, sw = 1.5 }) => (
  <svg viewBox="0 0 24 24" width={w} height={w} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const BackIcon = () => <Svg d={<path d="M15 18l-6-6 6-6" />} w={16} sw={2} />;
const SendIcon = () => <Svg d={<path d="M12 19V5M5 12l7-7 7 7" />} w={16} sw={2} />;
const PlusIcon = () => <Svg d={<path d="M12 5v14M5 12h14" />} w={16} sw={2} />;
const ArrowIcon = () => <Svg d={<path d="M5 12h14M13 6l6 6-6 6" />} w={16} sw={2} />;
const BellIcon = () => <Svg d={<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.5 21a1.5 1.5 0 0 1-3 0" /></>} w={18} />;
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
const emoList = (t, arr) => (arr && arr.length ? arr.map((e) => t(`waymark.enum.emotion.${e}`)).join('·') : '—');

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
  const { version: refreshVersion } = useContext(RefreshContext);
  const [st, setSt] = useState({ loading: true, decisions: [], events: [], unread: 0, error: null });
  const activeId = (location.pathname.match(/\/d\/([^/]+)/) || [])[1];

  useEffect(() => {
    let alive = true;
    api.home()
      .then((r) => { if (alive) setSt({ loading: false, decisions: r.decisions || [], events: r.events || [], unread: r.unread || 0, error: null }); })
      .catch((err) => { if (alive) setSt((s) => ({ ...s, loading: false, error: err.message })); });
    return () => { alive = false; };
  }, [api, refreshVersion]);

  return (
    <aside className="wma-side">
      <div className="wma-side-head">
        <span className="wma-brand">Waymark</span>
        <div className="wma-side-actions">
          <Link to="/waymark/app/alerts" className="wma-iconlink" aria-label={t('waymark.app.alerts')}><BellIcon />{st.unread > 0 && <span className="wma-dot-badge" aria-hidden="true" />}</Link>
          <Link to="/waymark/app/me" className="wma-iconlink" aria-label={t('waymark.app.tabMe')}><GearIcon /></Link>
        </div>
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

function Alerts() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const api = useWaymarkApi();
  const { bump } = useContext(RefreshContext);
  const [st, setSt] = useState({ loading: true, items: [], error: null });
  const refresh = useCallback(() => {
    api.listNotifications()
      .then((r) => setSt({ loading: false, items: r.notifications || [], error: null }))
      .catch((e) => setSt((s) => ({ ...s, loading: false, error: e.message })));
  }, [api]);
  useEffect(() => { refresh(); }, [refresh]);
  const markAll = async () => { try { await api.markNotification('all'); refresh(); bump(); } catch (e) { setSt((s) => ({ ...s, error: e.message })); } };
  const open = async (n) => { try { await api.markNotification(n.id); } catch { /* noop */ } navigate(`/waymark/app/d/${n.decisionId}`); };

  return (
    <section className="wma-pane">
      <PaneHeader title={t('waymark.app.alerts')} />
      <div className="wma-pane-body">
        {st.error && <p className="wma-state wma-err">{st.error}</p>}
        {st.loading && <p className="wma-state">{t('waymark.app.loading')}</p>}
        {!st.loading && st.items.length === 0 && !st.error && <p className="wma-state">{t('waymark.app.alertsEmpty')}</p>}
        {st.items.length > 0 && <button type="button" className="wma-markall" onClick={markAll}>{t('waymark.app.markAllRead')}</button>}
        {st.items.map((n) => (
          <button type="button" key={n.id} className={`wma-card wma-listitem${n.read ? '' : ' wma-active'}`} onClick={() => open(n)}>
            <span className="u-eyebrow wma-lead">{t(`waymark.detail.lead.${n.type}`)}</span>
            <div className="wma-dtitle wma-mt">{t(`waymark.home.ask.${n.type}`)}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function NewDecision() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const api = useWaymarkApi();
  const { bump } = useContext(RefreshContext);
  const [f, setF] = useState({ title: '', context: '', options: [], chosen: '', emotionTags: [], domain: '', importance: 2 });
  const [optDraft, setOptDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const toggleEmotion = (e) => setF((s) => ({ ...s, emotionTags: s.emotionTags.includes(e) ? s.emotionTags.filter((x) => x !== e) : [...s.emotionTags, e].slice(0, 6) }));
  const removeOption = (i) => setF((s) => ({ ...s, options: s.options.filter((_, x) => x !== i) }));
  const commitOpt = () => { const vals = optDraft.split(/[,\n]/).map((x) => x.trim()).filter(Boolean); if (vals.length) setF((s) => ({ ...s, options: [...s.options, ...vals].slice(0, 12) })); setOptDraft(''); };
  const onOptKey = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commitOpt(); } else if (e.key === 'Backspace' && !optDraft && f.options.length) { removeOption(f.options.length - 1); } };
  const valid = f.title.trim() && f.context.trim() && f.chosen.trim() && f.domain && f.emotionTags.length > 0;
  const missing = [];
  if (!f.title.trim()) missing.push(t('waymark.new.lTitle'));
  if (!f.context.trim()) missing.push(t('waymark.new.lContext'));
  if (!f.chosen.trim()) missing.push(t('waymark.new.lChosen'));
  if (f.emotionTags.length === 0) missing.push(t('waymark.new.lEmotion'));
  if (!f.domain) missing.push(t('waymark.new.lDomain'));

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true); setError(null);
    try {
      const { id } = await api.createDecision({
        title: f.title, context: f.context, chosen: f.chosen,
        options: f.options,
        emotionTags: f.emotionTags, domain: f.domain, importance: f.importance,
      });
      bump();
      navigate(`/waymark/app/d/${id}`, { replace: true });
    } catch (err) { setError(err.message); setBusy(false); }
  };
  const Q = (key, req) => <label className="wma-q">{t(key)}{req ? <span className="wma-req">*</span> : null}</label>;

  return (
    <section className="wma-pane">
      <PaneHeader title={t('waymark.app.newTitle')} />
      <div className="wma-pane-body wma-form">
        <div className="wma-ff">
          {Q('waymark.new.qTitle', true)}
          <input className="wma-input" value={f.title} maxLength={80} onChange={(e) => set('title', e.target.value)} placeholder={t('waymark.new.phTitle')} />
          <span className="wma-count">{f.title.length}/80</span>
        </div>
        <div className="wma-ff">
          {Q('waymark.new.qContext', true)}
          <textarea className="wma-textarea wma-ftext" value={f.context} maxLength={4000} onChange={(e) => set('context', e.target.value)} placeholder={t('waymark.new.phContext')} />
          <span className="wma-count">{f.context.length}/4000</span>
        </div>
        <div className="wma-ff">
          {Q('waymark.new.qOptions', false)}
          <div className="wma-tagin">
            {f.options.map((o, i) => (
              <span className="wma-tag" key={i}>{o}<button type="button" className="wma-tag-x" aria-label={t('waymark.new.remove')} onClick={() => removeOption(i)}>×</button></span>
            ))}
            <input className="wma-tag-input" value={optDraft} onChange={(e) => setOptDraft(e.target.value)} onKeyDown={onOptKey} onBlur={commitOpt} placeholder={f.options.length ? '' : t('waymark.new.phOptions')} />
          </div>
          <span className="wma-count">{t('waymark.new.optHint')}</span>
        </div>
        <div className="wma-ff">
          {Q('waymark.new.qChosen', true)}
          <input className="wma-input" value={f.chosen} onChange={(e) => set('chosen', e.target.value)} placeholder={t('waymark.new.phChosen')} />
        </div>
        <div className="wma-ff">
          {Q('waymark.new.qEmotion', true)}
          <div className="wma-chips">{EMOTIONS.map((e) => <button type="button" key={e} className={'wma-chip' + (f.emotionTags.includes(e) ? ' on' : '')} onClick={() => toggleEmotion(e)}>{t('waymark.enum.emotion.' + e)}</button>)}</div>
        </div>
        <div className="wma-ff">
          {Q('waymark.new.qDomain', true)}
          <div className="wma-chips">{DOMAINS.map((d) => <button type="button" key={d} className={'wma-chip' + (f.domain === d ? ' on' : '')} onClick={() => set('domain', d)}>{t('waymark.enum.domain.' + d)}</button>)}</div>
        </div>
        <div className="wma-ff">
          {Q('waymark.new.qImportance', false)}
          <div className="wma-seg">{IMPORTANCE.map((n) => <button type="button" key={n} className={f.importance === n ? 'on' : ''} onClick={() => set('importance', n)}>{t('waymark.enum.importance.' + n)}</button>)}</div>
        </div>
        {error && <p className="wma-state wma-err">{error}</p>}
        {!valid && missing.length > 0 && <p className="wma-missing">{t('waymark.new.missing')} {missing.join(', ')}</p>}
        <button type="button" className="wma-btn wma-form-save" disabled={!valid || busy} onClick={submit}>{busy ? t('waymark.app.saving') : t('waymark.new.save')}</button>
      </div>
    </section>
  );
}

function Retro() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const api = useWaymarkApi();
  const { bump } = useContext(RefreshContext);
  const [st, setSt] = useState({ loading: true, decision: null, error: null });
  const [outcome, setOutcome] = useState(null);
  const [emotionNow, setEmotionNow] = useState([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    api.getDecision(id)
      .then((r) => { if (alive) { setSt({ loading: false, decision: r.decision, error: null }); setOutcome(r.decision.outcome || null); setEmotionNow(r.decision.emotionNow || []); setNote(r.decision.outcomeNote || ''); } })
      .catch((e) => { if (alive) setSt((s) => ({ ...s, loading: false, error: e.message })); });
    return () => { alive = false; };
  }, [api, id]);
  const toggleEmotion = (e) => setEmotionNow((p) => p.includes(e) ? p.filter((x) => x !== e) : [...p, e].slice(0, 6));

  const save = async () => {
    if (!outcome || busy) return;
    setBusy(true);
    try {
      await api.patchDecision(id, { outcome, emotionNow, outcomeNote: note, status: outcome === 'ongoing' ? 'revisited' : 'closed' });
      bump();
      navigate(`/waymark/app/d/${id}`, { replace: true });
    } catch (e) { setSt((s) => ({ ...s, error: e.message })); setBusy(false); }
  };

  if (st.loading) return <section className="wma-pane"><PaneHeader title={t('waymark.retro.title')} /><div className="wma-pane-body"><p className="wma-state">{t('waymark.app.loading')}</p></div></section>;
  if (!st.decision) return <section className="wma-pane"><PaneHeader title={t('waymark.retro.title')} /><div className="wma-pane-body"><p className="wma-state wma-err">{st.error || t('waymark.app.notFound')}</p></div></section>;
  const d = st.decision;

  return (
    <section className="wma-pane">
      <PaneHeader title={t('waymark.retro.title')} />
      <div className="wma-pane-body">
        <div className="wma-m them">{t('waymark.home.ask.retro')}</div>
        <div className="wma-card wma-flat"><div className="wma-dtitle">{d.title}</div></div>

        <div className="wma-vs">
          <div className="wma-vs-col"><span className="u-eyebrow wma-lead">{t('waymark.retro.then')}</span><span className="wma-vs-emo">{emoList(t, d.emotionTags)}</span></div>
          <span className="wma-vs-arrow" aria-hidden="true"><ArrowIcon /></span>
          <div className="wma-vs-col"><span className="u-eyebrow wma-lead">{t('waymark.retro.now')}</span><span className="wma-vs-emo">{emoList(t, emotionNow)}</span></div>
        </div>

        <div className="u-eyebrow wma-sect">{t('waymark.retro.outcomeQ')}</div>
        <div className="wma-seg">{OUTCOMES.map((o) => <button type="button" key={o} className={outcome === o ? 'on' : ''} onClick={() => setOutcome(o)}>{t(`waymark.enum.outcome.${o}`)}</button>)}</div>

        <div className="u-eyebrow wma-sect">{t('waymark.retro.emotionQ')}</div>
        <div className="wma-chips">{EMOTIONS.map((e) => <button type="button" key={e} className={`wma-chip${emotionNow.includes(e) ? ' on' : ''}`} onClick={() => toggleEmotion(e)}>{t(`waymark.enum.emotion.${e}`)}</button>)}</div>

        <div className="wma-field"><textarea className="wma-textarea" value={note} maxLength={4000} onChange={(e) => setNote(e.target.value)} placeholder={t('waymark.retro.notePh')} /></div>
        {st.error && <p className="wma-state wma-err">{st.error}</p>}
        <button type="button" className="wma-btn" disabled={!outcome || busy} onClick={save}>{busy ? t('waymark.app.saving') : t('waymark.retro.save')}</button>
      </div>
    </section>
  );
}

function Detail() {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const api = useWaymarkApi();
  const [st, setSt] = useState({ loading: true, error: null, decision: null, messages: [] });
  const [tone, setTone] = useState('comfort');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiNote, setAiNote] = useState(null);
  const [aiRemaining, setAiRemaining] = useState(null);
  const [byok, setByok] = useState(null);
  const [byokOpen, setByokOpen] = useState(false);
  const [byokKey, setByokKey] = useState('');
  const [byokBusy, setByokBusy] = useState(false);
  const [byokProv, setByokProv] = useState('anthropic');
  const { bump } = useContext(RefreshContext);
  const [delConfirm, setDelConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) { setMenuOpen(false); setDelConfirm(false); } };
    const onKey = (e) => { if (e.key === 'Escape') { setMenuOpen(false); setDelConfirm(false); } };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [menuOpen]);

  const load = useCallback(() => {
    let alive = true;
    api.getDecision(id)
      .then((r) => { if (alive) setSt({ loading: false, error: null, decision: r.decision, messages: r.messages || [] }); })
      .catch((err) => { if (alive) setSt((s) => ({ ...s, loading: false, error: err.message })); });
    return () => { alive = false; };
  }, [api, id]);
  useEffect(() => load(), [load]);
  const bottomRef = useRef(null);
  useEffect(() => { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [st.messages, aiBusy]);
  const taRef = useRef(null);
  useEffect(() => { const el = taRef.current; if (!el) return; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 160) + 'px'; }, [note]);
  useEffect(() => { byokProvider().then((p) => setByok(p)).catch(() => {}); }, []);

  // C: BYOK 연결 사용자 한정 — 기록 직후 '첫 한마디'를 맥락 기반 AI로 1회 생성(실패 시 템플릿 유지)
  const openingRef = useRef(false);
  useEffect(() => {
    if (openingRef.current || !byok || st.loading || !st.decision) return;
    const msgs = st.messages || [];
    const nudge = msgs.find((m) => m.type === 'nudge');
    // 스레드가 템플릿 넛지 하나뿐일 때만(대화·AI·오프닝이 이미 있으면 생성 안 함)
    if (!nudge || !(msgs.length > 0 && msgs.every((m) => m.type === 'nudge'))) return;
    openingRef.current = true;
    (async () => {
      try {
        const cred = await getByok();
        if (!cred) { setByok(null); return; }
        const oTone = nudge.tone || 'comfort';
        const d0 = st.decision;
        const parts = ['결정: ' + d0.title]; // i18n-ok: AI 입력(UI 아님)
        if (d0.context) parts.push('상황: ' + String(d0.context).slice(0, 1500)); // i18n-ok: AI 입력(UI 아님)
        if (d0.chosen) parts.push('선택: ' + d0.chosen); // i18n-ok: AI 입력(UI 아님)
        if (d0.options && d0.options.length) parts.push('고려한 선택지: ' + d0.options.join(', ')); // i18n-ok: AI 입력(UI 아님)
        if (d0.emotionTags && d0.emotionTags.length) parts.push('처음 감정: ' + d0.emotionTags.join(', ')); // i18n-ok: AI 입력(UI 아님)
        setAiBusy(true);
        const aiText = await callByok(cred.provider, cred.key, byokOpeningSystem(oTone, locale), parts.join('\n'));
        if (aiText) { await api.aiByokMessage(id, oTone, aiText, cred.provider, 'opening'); load(); }
      } catch (e) { console.error('[Waymark] opening 생성 실패(템플릿 유지)', e, e && e.body || ''); }
      finally { setAiBusy(false); }
    })();
  }, [byok, st.loading, st.decision, st.messages, locale, api, id, load]);

  const sendNote = async () => {
    if (!note.trim() || sending) return;
    setSending(true);
    try { await api.addMessage(id, note); setNote(''); load(); }
    catch (err) { setSt((s) => ({ ...s, error: err.message })); }
    finally { setSending(false); }
  };

  const removeDecision = async () => {
    if (deleting) return;
    setDeleting(true);
    try { await api.deleteDecision(id); bump(); navigate('/waymark/app', { replace: true }); }
    catch (err) { setSt((s) => ({ ...s, error: err.message })); setDeleting(false); setDelConfirm(false); }
  };

  if (st.loading) return <section className="wma-pane"><PaneHeader title="Waymark" /><div className="wma-pane-body"><p className="wma-state">{t('waymark.app.loading')}</p></div></section>;
  if (!st.decision) return <section className="wma-pane"><PaneHeader title="Waymark" /><div className="wma-pane-body"><p className="wma-state wma-err">{st.error || t('waymark.app.notFound')}</p></div></section>;

  const d = st.decision;
  const companion = st.messages.filter((m) => m.type !== 'user_note');
  const hasOpening = st.messages.some((m) => m.type === 'ai' && m.kind === 'opening');
  const last = companion.length ? companion[companion.length - 1] : null;
  const send = async () => {
    const text = note.trim();
    if (!text || aiBusy) return;
    setNote('');
    const tempId = 'temp-' + Date.now();
    setSt((cur) => ({ ...cur, messages: [...cur.messages, { id: tempId, type: 'user_note', text }] }));
    setAiBusy(true); setAiError(null); setAiNote(null);
    const useTone = tone || 'comfort';
    const ctx = String(d.context || '').slice(0, 1500);
    const emoStr = (d.emotionTags || []).join(', '); // i18n-ok: AI 입력(UI 아님)
    const pLines = ['아래 대화에서 너는 Waymark 동반자다. 맨 아래 "지금 한 말"에 직접, 구체적으로 응답하라. 일반론으로 빠지지 마라.', '', '[배경 — 참고만]', '결정: ' + d.title]; // i18n-ok: AI 프롬프트(UI 아님)
    if (ctx) pLines.push('상황: ' + ctx); // i18n-ok: AI 프롬프트(UI 아님)
    if (emoStr) pLines.push('처음 감정: ' + emoStr); // i18n-ok: AI 프롬프트(UI 아님)
    const pRecent = (st.messages || []).filter((m) => m.text && String(m.text).trim()).slice(-8);
    if (pRecent.length) { pLines.push('', '[지금까지의 대화]'); pRecent.forEach((m) => pLines.push((m.type === 'user_note' ? '사용자' : 'Waymark') + ': ' + m.text)); } // i18n-ok: AI 프롬프트(UI 아님)
    pLines.push('', '[지금 한 말 — 여기에 답하라]', text); // i18n-ok: AI 프롬프트(UI 아님)
    const userMsg = pLines.join('\n'); // i18n-ok: AI 입력(UI 아님)
    try {
      await api.addMessage(id, text);
      if (byok) {
        try {
          const cred = await getByok();
          if (!cred) { setByok(null); throw Object.assign(new Error('nokey'), { status: 0 }); }
          const aiText = await callByok(cred.provider, cred.key, byokSystem(useTone), userMsg);
          if (!aiText) throw Object.assign(new Error('empty'), { status: 502 });
          await api.aiByokMessage(id, useTone, aiText, cred.provider);
          load();
        } catch (byokErr) {
          console.error('[Waymark] BYOK 실패, 체험 AI 폴백', byokErr, byokErr && byokErr.body || '');
          const r = await api.aiCompanion(id, useTone, text);
          setAiRemaining(r.remaining);
          load();
          setAiNote(t('waymark.detail.byokFellBack'));
        }
      } else {
        const r = await api.aiCompanion(id, useTone, text);
        setAiRemaining(r.remaining);
        load();
      }
    } catch (e) {
      console.error('[Waymark] send error', e, e && e.body || '');
      if (e.status === 402) setAiError(t('waymark.detail.aiCapReached'));
      else if (e.status === 503) setAiError(t('waymark.detail.aiUnavailable'));
      else if (e.status === 401 || e.status === 403) setAiError(t('waymark.detail.byokBadKey'));
      else setAiError(t('waymark.detail.aiRetry'));
    } finally { setAiBusy(false); }
  };

  const connectByok = async () => {
    if (!byokKey.trim() || byokBusy) return;
    setByokBusy(true); setAiError(null);
    try { await saveByok(byokProv, byokKey.trim()); setByok(byokProv); setByokOpen(false); setByokKey(''); }
    catch (e) { setAiError(t('waymark.detail.byokSaveFail')); }
    finally { setByokBusy(false); }
  };
  const disconnectByok = async () => { try { await clearByok(); } catch (e) { /* noop */ } setByok(null); };

  const renderCompanion = (m) => {
    if (m.type === 'ai') {
      const srcLabel = m.source === 'byok'
        ? t('waymark.detail.srcByok') + ' (' + (m.provider === 'gemini' ? 'Gemini' : 'Anthropic') + ')'
        : t('waymark.detail.srcTrial');
      return (<div className="wma-m them" key={m.id}><span className="u-eyebrow wma-lead">{srcLabel}{m.tone ? ' · ' + t('waymark.enum.tone.' + m.tone) : ''}</span>{m.text}</div>);
    }
    if (m.type !== 'nudge') {
      return (
        <div className="wma-m them" key={m.id}>
          <span className="u-eyebrow wma-lead">{t(`waymark.detail.lead.${m.type}`)}</span>
          {t(`waymark.home.ask.${m.type}`)}
        </div>
      );
    }
    const TONES_SAFE = ['comfort', 'counsel', 'cheer', 'clarify', 'verify'];
    const useToneVal = TONES_SAFE.includes(m.tone) ? m.tone : 'comfort';
    return (
      <div className="wma-m them" key={m.id}>
        <span className="u-eyebrow wma-lead">{t(`waymark.enum.tone.${useToneVal}`)}</span>
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
          <div className="wma-cardrow">
            <span className="wma-dtitle">{d.title}</span>
            <span className={`wma-badge ${d.status}`}>{t(`waymark.enum.status.${d.status}`)}</span>
            <div className="wma-menu-wrap" ref={menuRef}>
              <button type="button" className="wma-menu-btn" aria-haspopup="menu" aria-expanded={menuOpen} aria-label={t('waymark.detail.menuLabel')} onClick={() => { setMenuOpen((v) => !v); setDelConfirm(false); }}><Icon name="more" size={18} /></button>
              {menuOpen && (
                <div className="wma-menu" role="menu">
                  {!delConfirm ? (
                    <>
                      <button type="button" role="menuitem" className="wma-menu-item" onClick={() => { setMenuOpen(false); navigate(`/waymark/app/retro/${d.id}`); }}><Icon name={d.outcome ? 'pen' : 'cycle'} size={14} />{t(d.outcome ? 'waymark.detail.reviewEdit' : 'waymark.detail.reviewBtn')}</button>
                      <button type="button" role="menuitem" className="wma-menu-item wma-menu-danger" onClick={() => setDelConfirm(true)}><Icon name="trash" size={14} />{t('waymark.detail.deleteBtn')}</button>
                    </>
                  ) : (
                    <div className="wma-menu-confirm">
                      <span className="wma-ai-note">{t('waymark.detail.deleteConfirm')}</span>
                      <div className="wma-byok-actions">
                        <button type="button" className="wma-linkbtn" onClick={() => setDelConfirm(false)}>{t('waymark.detail.deleteNo')}</button>
                        <button type="button" className="wma-review wma-del-yes" disabled={deleting} onClick={removeDecision}>{t('waymark.detail.deleteYes')}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="wma-dmeta wma-mt">{emoList(t, d.emotionTags)}</div>
        </div>

        {d.outcome && (
          <div className="wma-card wma-flat">
            <span className="u-eyebrow wma-lead">{t('waymark.detail.outcomeLabel')} · {t(`waymark.enum.outcome.${d.outcome}`)}</span>
            <div className="wma-vs">
              <div className="wma-vs-col"><span className="u-eyebrow wma-lead">{t('waymark.retro.then')}</span><span className="wma-vs-emo">{emoList(t, d.emotionTags)}</span></div>
              <span className="wma-vs-arrow" aria-hidden="true"><ArrowIcon /></span>
              <div className="wma-vs-col"><span className="u-eyebrow wma-lead">{t('waymark.retro.now')}</span><span className="wma-vs-emo">{emoList(t, d.emotionNow)}</span></div>
            </div>
          </div>
        )}

        <div className="wma-thread">
          {st.messages.filter((m) => !(hasOpening && m.type === 'nudge')).map((m) => (m.type === 'user_note'
            ? <div className="wma-m me" key={m.id}>{m.text}</div>
            : renderCompanion(m)))}
          {aiBusy && (
            <div className="wma-m them wma-typing loading" aria-label={t('waymark.detail.typing')}>
              <span className="wma-typing-dot" /><span className="wma-typing-dot" /><span className="wma-typing-dot" />
            </div>
          )}
        </div>

        {st.error && <p className="wma-state wma-err">{st.error}</p>}
        <div ref={bottomRef} aria-hidden="true" />
      </div>
        <div className="wma-cinput">
          <div className="wma-cinput-bar">
            <div className="wma-tones">
              {TONES.map((tn) => <button type="button" key={tn} className={'wma-tone' + (tone === tn ? ' on' : '')} onClick={() => setTone(tn)}>{t('waymark.enum.tone.' + tn)}</button>)}
            </div>
            <div className="wma-cinput-meta">
            {aiRemaining != null && <span className="wma-meta-remain">{t('waymark.detail.aiRemaining', { n: aiRemaining })}</span>}
            {byok
              ? <button type="button" className="wma-linkbtn" onClick={() => setByokOpen((v) => !v)}>{t('waymark.detail.byokConnected')} · {byok === 'gemini' ? 'Gemini' : 'Anthropic'}</button>
              : <><a className="wma-linkbtn wma-byok-guide" href="/guide/api-key?for=waymark" target="_blank" rel="noreferrer">{t('waymark.detail.byokGuideLink')}<Icon name="external" size={12} /></a><button type="button" className="wma-byok-cta" onClick={() => setByokOpen((v) => !v)}>{t('waymark.detail.byokOpen')}</button></>}
            </div>
          </div>
          {byokOpen && (byok ? (
            <div className="wma-byok-form"><span className="wma-ai-note">{t('waymark.detail.byokConnected')} · {byok === 'gemini' ? 'Gemini' : 'Anthropic'} <button type="button" className="wma-linkbtn" onClick={disconnectByok}>{t('waymark.detail.byokDisconnect')}</button></span></div>
          ) : (
            <div className="wma-byok-form">
              <div className="wma-chips">
                <button type="button" className={'wma-chip' + (byokProv === 'anthropic' ? ' on' : '')} onClick={() => setByokProv('anthropic')}>Anthropic</button>
                <button type="button" className={'wma-chip' + (byokProv === 'gemini' ? ' on' : '')} onClick={() => setByokProv('gemini')}>Gemini</button>
              </div>
              <span className="wma-ai-note">{t('waymark.detail.byokIntro')}</span>
              <input className="wma-input" type="password" value={byokKey} onChange={(e) => setByokKey(e.target.value)} placeholder={t(byokProv === 'gemini' ? 'waymark.detail.byokPhGemini' : 'waymark.detail.byokPlaceholder')} />
              <div className="wma-byok-actions">
                <button type="button" className="wma-review" disabled={byokBusy || !byokKey.trim()} onClick={connectByok}>{t('waymark.detail.byokConnect')}</button>
                <button type="button" className="wma-linkbtn" onClick={() => setByokOpen(false)}>{t('waymark.detail.byokCancel')}</button>
              </div>
              <span className="wma-ai-note wma-byok-warn">{t(byokProv === 'gemini' ? 'waymark.detail.byokWarnGemini' : 'waymark.detail.byokWarn')}</span>
            </div>
          ))}
          {aiError && <span className="wma-ai-note wma-err">{aiError}</span>}
          {aiNote && (
            <div className="wma-trial">
              <span className="wma-trial-note">{aiNote}</span>
            </div>
          )}
          <div className="wma-composer">
            <textarea ref={taRef} className="wma-input wma-composer-ta" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('waymark.detail.msgPlaceholder')} rows={1} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} disabled={aiBusy} />
            <button type="button" className="wma-send" disabled={!note.trim() || aiBusy} onClick={send} aria-label={t('waymark.detail.send')}><SendIcon /></button>
          </div>
        </div>
    </section>
  );
}

function Settings() {
  const { t, locale, setLocale, SUPPORTED_LANGUAGES } = useTranslation();
  const { logout } = useAuth();
  const api = useWaymarkApi();
  const [s, setS] = useState(null);
  const [err, setErr] = useState(null);
  const [saved, setSaved] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  useEffect(() => {
    let a = true;
    api.getMe().then((r) => { if (a) setS(r.settings); }).catch((e) => { if (a) setErr(e.message); });
    return () => { a = false; };
  }, [api]);
  const save = async (patch) => {
    setS((prev) => ({ ...prev, ...patch }));
    try { await api.patchMe(patch); setSaved(true); setTimeout(() => setSaved(false), 1400); }
    catch (e) { setErr(e.message); }
  };
  const setLang = (code) => { setLocale(code); save({ locale: code }); };
  const togglePush = async () => {
    if (pushBusy) return;
    setPushBusy(true); setErr(null);
    try {
      if (s.pushEnabled) { await disablePush(api); setS((p) => ({ ...p, pushEnabled: false })); }
      else { await enablePush(api); setS((p) => ({ ...p, pushEnabled: true })); setSaved(true); setTimeout(() => setSaved(false), 1400); }
    } catch (e) {
      console.error('[Waymark] push toggle error', e, e && e.code, e && e.message);
      setErr(e.code === 'denied' ? t('waymark.settings.pushDenied') : e.code === 'unsupported' ? t('waymark.settings.pushUnsupported') : t('waymark.settings.pushFail'));
    } finally { setPushBusy(false); }
  };

  if (!s) return (
    <section className="wma-pane">
      <PaneHeader title={t('waymark.app.tabMe')} />
      <div className="wma-pane-body"><p className={'wma-state' + (err ? ' wma-err' : '')}>{err || t('waymark.app.loading')}</p></div>
    </section>
  );
  const cad = [['tight', 'cadenceTight'], ['normal', 'cadenceNormal'], ['loose', 'cadenceLoose']];
  return (
    <section className="wma-pane">
      <PaneHeader title={t('waymark.app.tabMe')} />
      <div className="wma-pane-body">
        <div className="u-eyebrow wma-sect">{t('waymark.settings.notify')}</div>
        <div className="wma-card wma-flat">
          <div className="wma-setrow">
            <span className="wma-setk">{t('waymark.settings.quietHours')}</span>
            <span className="wma-times">
              <input type="time" className="wma-input wma-time-in" value={s.quietStart || '22:00'} onChange={(e) => save({ quietStart: e.target.value })} />
              <span className="wma-dmeta">–</span>
              <input type="time" className="wma-input wma-time-in" value={s.quietEnd || '08:00'} onChange={(e) => save({ quietEnd: e.target.value })} />
            </span>
          </div>
          <div className="wma-setrow">
            <span className="wma-setk">{t('waymark.settings.email')}</span>
            <button type="button" aria-label={t('waymark.settings.email')} aria-pressed={s.emailOptIn !== false} className={'wma-toggle' + (s.emailOptIn !== false ? ' on' : '')} onClick={() => save({ emailOptIn: !(s.emailOptIn !== false) })} />
          </div>
          <div className="wma-setrow">
            <span className="wma-setk">{t('waymark.settings.push')}</span>
            <button type="button" aria-label={t('waymark.settings.push')} aria-pressed={!!s.pushEnabled} disabled={pushBusy} className={'wma-toggle' + (s.pushEnabled ? ' on' : '')} onClick={togglePush} />
          </div>
        </div>

        <div className="u-eyebrow wma-sect">{t('waymark.settings.cadence')}</div>
        <div className="wma-seg">{cad.map(([k, l]) => <button type="button" key={k} className={(s.cadence || 'normal') === k ? 'on' : ''} onClick={() => save({ cadence: k })}>{t('waymark.settings.' + l)}</button>)}</div>

        <div className="u-eyebrow wma-sect">{t('waymark.settings.language')}</div>
        <div className="wma-chips">{SUPPORTED_LANGUAGES.map((lng) => <button type="button" key={lng.code} className={'wma-chip' + (locale === lng.code ? ' on' : '')} onClick={() => setLang(lng.code)}>{lng.nativeLabel}</button>)}</div>

        <div className="u-eyebrow wma-sect">{t('waymark.settings.byok')}</div>
        <div className="wma-card wma-flat"><ByokConnect /></div>

        <div className="u-eyebrow wma-sect">{t('waymark.settings.account')}</div>
        <button type="button" className="wma-review" onClick={logout}>{t('waymark.settings.logout')}</button>

        {saved && <p className="wma-state">{t('waymark.settings.saved')}</p>}
        {err && <p className="wma-state wma-err">{err}</p>}
      </div>
    </section>
  );
}

function Onboarding({ onDone }) {
  const { t } = useTranslation();
  const api = useWaymarkApi();
  const [busy, setBusy] = useState(false);
  const start = async () => {
    setBusy(true);
    try { await api.patchMe({ onboarded: true, emailOptIn: true, quietStart: '22:00', quietEnd: '08:00' }); } catch (e) { /* fail-open */ }
    onDone();
  };
  return (
    <div className="wma-gate">
      <div className="wma-gate-card">
        <h1 className="wma-gate-title">Waymark</h1>
        <p className="wma-gate-sub">{t('waymark.onboard.lead')}</p>
        <p className="wma-gate-values">{t('waymark.onboard.values')}</p>
        <button type="button" className="wma-btn" disabled={busy} onClick={start}>{t('waymark.onboard.start')}</button>
        <p className="wma-gate-note">{t('waymark.onboard.consent')}</p>
      </div>
    </div>
  );
}

// 미승인(none) — 약관 동의 + 체험 신청 화면
function RequestAccess() {
  const { t } = useTranslation();
  const api = useWaymarkApi();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const submit = async () => {
    if (!agreed || busy) return;
    setBusy(true);
    try { await api.requestAccess({ tosAgreed: true }); setDone(true); }
    catch (e) { setBusy(false); }
  };
  if (done) {
    return (
      <div className="wma-gate"><div className="wma-gate-card">
        <h1 className="wma-gate-title">Waymark</h1>
        <p className="wma-gate-sub">{t('waymark.access.requestedTitle')}</p>
        <p className="wma-gate-values">{t('waymark.access.requestedDesc')}</p>
        <button type="button" className="wma-btn" onClick={() => navigate('/waymark')}>{t('waymark.access.backHome')}</button>
      </div></div>
    );
  }
  return (
    <div className="wma-gate"><div className="wma-gate-card">
      <h1 className="wma-gate-title">{t('waymark.access.applyTitle')}</h1>
      <p className="wma-gate-sub">{t('waymark.access.applyDesc')}</p>
      <p className="wma-gate-values">{t('waymark.access.privacy')}</p>
      <label className="wma-consent"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} /><span>{t('waymark.access.agree')}</span></label>
      <button type="button" className="wma-btn" disabled={!agreed || busy} onClick={submit}>{t('waymark.access.apply')}</button>
      <button type="button" className="wma-linkbtn wma-gate-back" onClick={() => navigate('/waymark')}>{t('waymark.access.backHome')}</button>
    </div></div>
  );
}

function AppShell() {
  const location = useLocation();
  const isIndex = /\/waymark\/app\/?$/.test(location.pathname);
  const [version, setVersion] = useState(0);
  const refresh = useMemo(() => ({ version, bump: () => setVersion((v) => v + 1) }), [version]);
  const api = useWaymarkApi();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [onboarded, setOnboarded] = useState(null);
  const [access, setAccess] = useState(null);
  useEffect(() => {
    let a = true;
    api.getMe().then((r) => {
      if (!a) return;
      const status = r.accessStatus || 'none';
      setAccess(status);
      if (status === 'approved') setOnboarded(!!r.settings.onboardedAt);
      else if (status === 'pending') { window.alert(t('waymark.access.pending')); navigate('/waymark', { replace: true }); }
      else if (status === 'rejected') { window.alert(t('waymark.access.rejected')); navigate('/waymark', { replace: true }); }
    }).catch(() => { if (a) { setAccess('error'); navigate('/waymark', { replace: true }); } });
    return () => { a = false; };
  }, [api, navigate, t]);
  if (access === null) return null;
  if (access === 'none') return <RequestAccess />;
  if (access !== 'approved') return null;
  if (onboarded === null) return null;
  if (!onboarded) return <Onboarding onDone={() => setOnboarded(true)} />;
  return (
    <RefreshContext.Provider value={refresh}>
      <div className={`wma-app${isIndex ? '' : ' wma-app--pane'}`}>
      <Sidebar />
      <Routes>
        <Route index element={<Welcome />} />
        <Route path="new" element={<NewDecision />} />
        <Route path="d/:id" element={<Detail />} />
        <Route path="retro/:id" element={<Retro />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="me" element={<Settings />} />
        <Route path="*" element={<Navigate to="/waymark/app" replace />} />
      </Routes>
      </div>
    </RefreshContext.Provider>
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

  useEffect(() => {
    const els = [];
    const add = (tag, attrs) => { const el = document.createElement(tag); Object.assign(el, attrs); document.head.appendChild(el); els.push(el); };
    add("link", { rel: "manifest", href: "/waymark-manifest.webmanifest" });
    add("meta", { name: "theme-color", content: "#020205" });
    add("meta", { name: "apple-mobile-web-app-capable", content: "yes" });
    add("meta", { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" });
    add("link", { rel: "apple-touch-icon", href: "/waymark-icon.svg" });
    return () => els.forEach((el) => el.remove());
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

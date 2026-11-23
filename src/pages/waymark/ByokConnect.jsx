import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { saveByok, byokProvider, clearByok } from './byok';
import Icon from '../../components/common/Icon';

/* Waymark BYOK 키 연결 — 설정 화면용(대화 도크와 동일 동작). 키는 IndexedDB에만 저장. */
export default function ByokConnect() {
  const { t } = useTranslation();
  const [byok, setByok] = useState(null);
  const [prov, setProv] = useState('anthropic');
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => { byokProvider().then((p) => setByok(p)).catch(() => {}); }, []);

  const connect = async () => {
    const k = key.trim();
    if (!k || busy) return;
    setBusy(true); setErr(null);
    try { await saveByok(prov, k); setByok(prov); setKey(''); }
    catch (e) { setErr(t('waymark.detail.byokSaveFail')); }
    finally { setBusy(false); }
  };
  const disconnect = async () => { try { await clearByok(); } catch (e) { /* noop */ } setByok(null); };

  if (byok) {
    return (
      <div className="wma-byok-form">
        <span className="wma-ai-note">{t('waymark.detail.byokConnected')} · {byok === 'gemini' ? 'Gemini' : 'Anthropic'} <button type="button" className="wma-linkbtn" onClick={disconnect}>{t('waymark.detail.byokDisconnect')}</button></span>
      </div>
    );
  }
  return (
    <div className="wma-byok-form">
      <div className="wma-chips">
        <button type="button" className={'wma-chip' + (prov === 'anthropic' ? ' on' : '')} onClick={() => setProv('anthropic')}>Anthropic</button>
        <button type="button" className={'wma-chip' + (prov === 'gemini' ? ' on' : '')} onClick={() => setProv('gemini')}>Gemini</button>
      </div>
      <span className="wma-ai-note">{t('waymark.detail.byokIntro')}</span>
      <input className="wma-input" type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder={t(prov === 'gemini' ? 'waymark.detail.byokPhGemini' : 'waymark.detail.byokPlaceholder')} />
      <div className="wma-byok-actions">
        <button type="button" className="wma-review" disabled={busy || !key.trim()} onClick={connect}>{t('waymark.detail.byokConnect')}</button>
        <a className="wma-linkbtn wma-byok-guide" href="/guide/api-key?for=waymark" target="_blank" rel="noreferrer">{t('waymark.detail.byokGuideLink')}<Icon name="external" size={12} /></a>
      </div>
      <span className="wma-ai-note wma-byok-warn">{t(prov === 'gemini' ? 'waymark.detail.byokWarnGemini' : 'waymark.detail.byokWarn')}</span>
      {err && <span className="wma-ai-note wma-err">{err}</span>}
    </div>
  );
}

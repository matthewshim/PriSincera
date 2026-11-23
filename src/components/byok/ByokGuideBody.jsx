import React from 'react';
import Icon from '../common/Icon';
import './ByokGuide.css';

/* ==========================================================================
   ByokGuideBody — BYOK API Key 가이드 공용 본문 (Sylphio·Waymark 공용)
   provider 발급 안내(Gemini·OpenAI·Anthropic)는 공용 로케일 byokGuide.providers.*,
   서비스별 히어로·연결 단계·FAQ·보안 문구는 각 지면이 props로 주입한다.
   ========================================================================== */

/* "라벨: 내용" 줄 — 사전 문자열의 `- 원인: …` 줄을 접근 가능한 목록 항목으로 */
const LABEL_RE = /^([^:：]{1,24})([:：])\s*(.+)$/;

export function Facts({ text }) {
  const lines = String(text || '')
    .split('\n')
    .map((line) => line.replace(/^-\s*/, '').trim())
    .filter(Boolean);
  return (
    <ul className="byokg-facts">
      {lines.map((line, i) => {
        const m = line.match(LABEL_RE);
        return (
          <li key={i}>
            {m ? (<><span className="byokg-fact-label">{m[1]}{m[2]}</span><span>{m[3]}</span></>) : line}
          </li>
        );
      })}
    </ul>
  );
}

export function Steps({ items }) {
  return (
    <ol className="byokg-steps">
      {items.map((content, i) => (
        <li className="byokg-step-item" key={i}>
          <span className="byokg-step-number" aria-hidden="true">{i + 1}</span>
          <span className="byokg-step-text">{content}</span>
        </li>
      ))}
    </ol>
  );
}

export const ExtLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="byokg-step-link">{children}</a>
);

const PROVIDER_LINK = {
  gemini: { href: 'https://aistudio.google.com/', label: 'Google AI Studio (aistudio.google.com)' },
  openai: { href: 'https://platform.openai.com/', label: 'OpenAI API Platform (platform.openai.com)' },
  anthropic: { href: 'https://console.anthropic.com/', label: 'Anthropic Console (console.anthropic.com)' },
};

/* 1단계는 문장 중간에 링크가 박힌 로케일별 리치 텍스트 */
function buildStep1(id, locale, linkEl) {
  if (id === 'gemini') {
    return locale === 'ko'
      ? <>웹 브라우저에서 {linkEl}에 접속해 개인 Google 계정으로 로그인합니다.</> /* i18n-ok: 링크가 박힌 로케일별 리치 텍스트 */
      : locale === 'ja'
        ? <>ブラウザで{linkEl}にアクセスし、Googleアカウントでログインします。</>
        : <>Open {linkEl} in your browser and sign in with your personal Google account.</>;
  }
  return locale === 'ko'
    ? <>{linkEl}에 접속해 가입한 뒤 로그인합니다.</> /* i18n-ok: 링크가 박힌 로케일별 리치 텍스트 */
    : locale === 'ja'
      ? <>{linkEl} にアクセスし、登録してログインします。</>
      : <>Visit {linkEl}, sign up, and log in.</>;
}

const LETTER = ['A', 'B', 'C', 'D'];

function ProviderSection({ id, data, locale, recommended, usageNote, index }) {
  const link = PROVIDER_LINK[id];
  const linkEl = <ExtLink href={link.href}>{link.label}</ExtLink>;
  const steps = [buildStep1(id, locale, linkEl), ...(data.steps || [])];
  const eyebrow = 'Option ' + LETTER[index] + (recommended ? ' · Recommended' : '');
  return (
    <section className="byokg-section" id={'section-' + id}>
      <p className={'byokg-eyebrow' + (recommended ? ' is-recommended' : '')}>{eyebrow}</p>
      <h2>{data.title}</h2>
      <p className="byokg-lead">{data.intro}</p>

      {data.warningTitle && (
        <div className="byokg-callout is-warning">
          <span className="byokg-callout-icon"><Icon name="warning" /></span>
          <div>
            <h3 className="byokg-callout-title">{data.warningTitle}</h3>
            <p>{data.warningDesc}</p>
          </div>
        </div>
      )}

      <Steps items={steps} />

      <div className="byokg-callout">
        <div>
          <h3 className="byokg-callout-title">{data.priceHeader}</h3>
          {data.freeTitle ? (
            <div className="byokg-tiers">
              <div><h4>{data.freeTitle}</h4><Facts text={data.freeDesc} /></div>
              <div><h4>{data.payTitle}</h4><p>{data.payDesc}</p></div>
            </div>
          ) : (
            <Facts text={data.priceDesc} />
          )}
          {usageNote && <Facts text={usageNote} />}
        </div>
      </div>
    </section>
  );
}

/* providers: [{ id, data, recommended?, usageNote? }] · security: { title, desc }
   faq: { header, items: [{ q, a }] } · children: 서비스별 '연결' 섹션 */
export default function ByokGuideBody({ verified, uiLangNotice, security, chooseOne, providers, locale, children, faq }) {
  return (
    <>
      <p className="byokg-verified">{verified}</p>
      {uiLangNotice && <p className="byokg-verified">{uiLangNotice}</p>}

      <div className="byokg-callout is-info">
        <span className="byokg-callout-icon"><Icon name="shield" /></span>
        <div>
          <h2 className="byokg-callout-title">{security.title}</h2>
          <p>{security.desc}</p>
        </div>
      </div>

      <p className="byokg-choose">{chooseOne}</p>

      {providers.map((p, i) => (
        <ProviderSection key={p.id} index={i} locale={locale} id={p.id} data={p.data} recommended={p.recommended} usageNote={p.usageNote} />
      ))}

      {children}

      {faq && (
        <section className="byokg-section" id="section-faq">
          <p className="byokg-eyebrow">FAQ</p>
          <h2>{faq.header}</h2>
          {faq.items.map((it, i) => (
            <div className="byokg-faq-item" key={i}>
              <h3>{it.q}</h3>
              <Facts text={it.a} />
            </div>
          ))}
        </section>
      )}
    </>
  );
}

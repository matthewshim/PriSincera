/**
 * PromptSection — 오늘의 AI 프롬프트 (터미널 카드)
 *
 * ReLearn Phase B-0 추출: DailyDigest의 detailTab==='prompt' 렌더 블록을
 * 동작·마크업 동일하게 컴포넌트화. /daily 와 /relearn(배움 채널)이 공용.
 * 스킨(CSS)은 DailyDigest.css 공유.
 */
import { useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { trackRelearn } from '../relearn/funnel';
import '../../pages/DailyDigest.css';

export default function PromptSection({ study, compact }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(!compact); // compact = 스니펫 프리뷰 접힘

  if (!study?.prompt_snippet) return null;

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
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
          <button className={`terminal-copy-btn ${copied ? 'copied' : ''}`} onClick={() => copyToClipboard(study.prompt_snippet)}>
            {copied ? t('dailyDigest.copied') : t('dailyDigest.copy')}
          </button>
        </div>
        <div className="terminal-body">
          <div className={`study-snippet-container${expanded ? '' : ' rl-snippet-collapsed'}`}>
            <pre className="study-snippet"><code>{study.prompt_snippet}</code></pre>
          </div>
          {!expanded && (
            <button
              className="rl-expand-btn"
              onClick={() => { setExpanded(true); trackRelearn('relearn_learn_expand', { block: 'prompt_snippet' }); }}
            >
              프롬프트 전체 보기 ▾
            </button>
          )}
          {study.explanation && <div className="study-kr">{study.explanation}</div>}
          {study.business_context && (
            <div className="signal-insight ai-insight">
              <div className="insight-badge">{t('dailyDigest.practicalTip')}</div>
              <p>{study.business_context}</p>
            </div>
          )}
          {study.parameters && study.parameters.length > 0 && (() => {
            const paramsTable = (
              <div className="params-table">
                <div className="params-table-header">
                  <span className="col-name">{t('dailyDigest.paramNameCol')}</span>
                  <span className="col-desc">{t('dailyDigest.paramDescCol')}</span>
                </div>
                <div className="params-list">
                  {study.parameters.map((p, i) => (
                    <div key={i} className="param-row">
                      <span className="param-name">[{p.name}]</span>
                      <span className="param-desc">{p.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
            return (
              <div className="prompt-params-container">
                {compact ? (
                  <details
                    className="rl-fold"
                    onToggle={(e) => e.currentTarget.open && trackRelearn('relearn_learn_expand', { block: 'prompt_params' })}
                  >
                    <summary className="rl-fold-summary">{t('dailyDigest.promptParams')} 보기</summary>
                    {paramsTable}
                  </details>
                ) : (
                  <>
                    <div className="params-header">{t('dailyDigest.promptParams')}</div>
                    {paramsTable}
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

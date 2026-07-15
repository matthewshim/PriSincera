/**
 * JapaneseSection — 오늘의 비즈니스 일본어 원픽
 *
 * ReLearn Phase B-0 추출: DailyDigest의 detailTab==='japanese' 렌더 블록을
 * 동작·마크업 동일하게 컴포넌트화. /daily 와 /relearn(배움 채널)이 공용.
 * 스킨(CSS)은 DailyDigest.css 공유.
 */
import { useTranslation } from '../../contexts/LanguageContext';
import '../../pages/DailyDigest.css';

export default function JapaneseSection({ study }) {
  const { t } = useTranslation();

  if (!study?.sentence_jp) return null;

  const playAudio = (text) => {
    if (!text || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    synth.speak(utterance);
  };

  return (
    <div className="daily-section fade-in">
      <div className="daily-section-header">
        <span className="daily-section-icon">🇯🇵</span>
        <h2 className="daily-section-title">{t('dailyDigest.businessJpOnePick')}</h2>
        <button className="japanese-audio-play-main" onClick={() => playAudio(study.sentence_jp)}>
          <svg viewBox="0 0 24 24" width="14" height="14" style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}>
            <path fill="currentColor" d="M12 3v18l-6-6H2V9h4l6-6zm4.5 9c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v2.06c2.89.86 5 3.54 5 6.49s-2.11 5.63-5 6.49v2.06c4.01-.91 7-4.49 7-8.55s-2.99-7.64-7-8.55z"/>
          </svg>
          {t('dailyDigest.playFullAudio')}
        </button>
      </div>
      <div className="japanese-study-card">
        <div className="japanese-hero-block">
          <div className="japanese-sentence-box">
            <div className="study-jp">{study.sentence_jp}</div>
            <div className="study-furigana">{study.sentence_furigana}</div>
          </div>
          {study.sentence_pronunciation_kr && (
            <div className="study-pronunciation">
              <span className="pronunciation-label">{t('dailyDigest.koreanPronunciation')}</span>
              <span className="pronunciation-text">[{study.sentence_pronunciation_kr}]</span>
            </div>
          )}
          <div className="study-translation">
            {study.sentence_kr}
          </div>
        </div>

        {(!study.prompt_snippet && study.business_context) && (
          <div className="signal-insight jp-insight">
            <div className="insight-badge">{t('dailyDigest.businessContextTip')}</div>
            <p>{study.business_context}</p>
          </div>
        )}

        {study.vocabulary && study.vocabulary.length > 0 && (
          <div className="vocab-section">
            <h3 className="vocab-title">{t('dailyDigest.keyVocab')}</h3>
            <div className="study-vocab-grid">
              {study.vocabulary.map((v, i) => (
                <div key={i} className="study-vocab-card">
                  <div className="vocab-card-header">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="vocab-word">{v.word}</span>
                      <span className="vocab-reading">[{v.reading}]</span>
                    </div>
                    <button
                      className="vocab-audio-btn"
                      onClick={() => playAudio(v.word)}
                      title={t('dailyDigest.listenPron')}
                    >
                      <svg className="play-svg" viewBox="0 0 24 24" width="12" height="12">
                        <path fill="currentColor" d="M12 3v18l-6-6H2V9h4l6-6zm4.5 9c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                      </svg>
                    </button>
                  </div>
                  {v.pronunciation_kr && (
                    <span className="vocab-pronunciation">[{v.pronunciation_kr}]</span>
                  )}
                  <div className="vocab-meaning">{v.meaning}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

/**
 * Belief intro — narrative title, lead copy, and brand declaration (left column).
 * Personal philosophy opener with concluding brand statement.
 */
export default function BeliefIntro() {
  const { t } = useTranslation();

  return (
    <div className="philosophy-text">
      <h2 className="philosophy-title reveal-item" style={{ '--reveal-delay': '0.1s' }}>
        <span className="title-line">{t('home.philosophyTitleLine1')}</span>
        <span className="title-line accent">{t('home.philosophyTitleLine2')}</span>
      </h2>
      <p className="philosophy-lead reveal-item" style={{ '--reveal-delay': '0.3s' }}>
        {t('home.philosophyLead1').split('\n').map((line, idx) => (
          <React.Fragment key={idx}>
            {line}
            <br/>
          </React.Fragment>
        ))}
      </p>
      <p className="philosophy-lead reveal-item" style={{ '--reveal-delay': '0.45s' }}>
        {t('home.philosophyLead2').split('\n').map((line, idx) => (
          <React.Fragment key={idx}>
            {line}
            <br/>
          </React.Fragment>
        ))}
      </p>
      <p className="philosophy-lead reveal-item" style={{ '--reveal-delay': '0.6s' }}>
        {t('home.philosophyLead3')}
      </p>
      <div className="belief-declaration reveal-item" style={{ '--reveal-delay': '0.8s' }}>
        <p className="declaration-text">
          {t('home.philosophyDeclaration').split('\n').map((line, idx) => (
            <React.Fragment key={idx}>
              {line.includes('PriSincera') ? (
                <>
                  {line.split('PriSincera')[0]}<strong>PriSincera</strong>{line.split('PriSincera')[1]}
                </>
              ) : line}
              <br/>
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
}


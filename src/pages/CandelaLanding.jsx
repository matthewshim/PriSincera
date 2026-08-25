import { useEffect } from 'react';
import useSEO from '../hooks/useSEO';
import { useTranslation } from '../contexts/LanguageContext';
import './CandelaLanding.css';

/**
 * Candela 서비스 소개 랜딩 (/candela).
 *
 * 실서비스(실적) 전 "소개" 단계 페이지 — 날조 데이터 없음, 아키텍처 서사 중심.
 * 규범: docs/candela/ui_specification.md §2 (소개 랜딩 선공개) · design_system §9-1
 * 운영 세부 비노출: security_spec N-9 (역할 일반명만, 경로·명령·인프라 미표기).
 * 데이터 라우트(/candela/performance·/journal)는 실운용 후(P5) 별도 등록 — G-2가 강제.
 */
export default function CandelaLanding() {
  const { t } = useTranslation();

  useSEO({
    title: t('candela.seo.title'),
    description: t('candela.seo.description'),
    ogUrl: 'https://www.prisincera.com/candela',
  });

  useEffect(() => {
    document.body.classList.add('hero-ready');
    return () => document.body.classList.remove('hero-ready');
  }, []);

  const principleCount = 6;

  return (
    <div className="cdl-page">
      <header className="cdl-hero">
        <div className="cdl-hero-icon" aria-hidden="true">🕯️</div>
        <h1 className="cdl-hero-title">Candela</h1>
        <p className="cdl-hero-sub">{t('candela.hero.sub')}</p>
        <div className="cdl-status">🚧 {t('candela.hero.status')}</div>
      </header>

      <section className="cdl-section">
        <h2 className="cdl-sec-title">{t('candela.duo.heading')}</h2>
        <div className="cdl-duo">
          <article className="cdl-card">
            <span className="cdl-tag cdl-tag-core">{t('candela.duo.coreTag')}</span>
            <h3 className="cdl-card-title">{t('candela.duo.coreTitle')}</h3>
            <p className="cdl-card-body">{t('candela.duo.coreBody')}</p>
          </article>
          <article className="cdl-card">
            <span className="cdl-tag cdl-tag-web">{t('candela.duo.webTag')}</span>
            <h3 className="cdl-card-title">{t('candela.duo.webTitle')}</h3>
            <p className="cdl-card-body">{t('candela.duo.webBody')}</p>
          </article>
        </div>
      </section>

      <section className="cdl-section">
        <h2 className="cdl-sec-title">{t('candela.arch.heading')}</h2>
        <p className="cdl-sec-desc">{t('candela.arch.desc')}</p>
        <div className="cdl-arch">
          <div className="cdl-tier">
            <span className="cdl-tier-name">{t('candela.arch.t1name')}</span>
            <span className="cdl-tier-note">{t('candela.arch.t1note')}</span>
          </div>
          <div className="cdl-tier">
            <span className="cdl-tier-name">{t('candela.arch.t2name')}</span>
            <span className="cdl-tier-note">{t('candela.arch.t2note')}</span>
          </div>
          <div className="cdl-boundary">{t('candela.arch.boundary')}</div>
          <div className="cdl-tier cdl-tier-worker">
            <span className="cdl-tier-name">{t('candela.arch.t3name')}</span>
            <span className="cdl-tier-note">{t('candela.arch.t3note')}</span>
          </div>
        </div>
        <p className="cdl-caption">{t('candela.arch.caption')}</p>
      </section>

      <section className="cdl-section">
        <h2 className="cdl-sec-title">{t('candela.control.heading')}</h2>
        <div className="cdl-card">
          <p className="cdl-control-body">{t('candela.control.body')}</p>
          <p className="cdl-control-note">{t('candela.control.note')}</p>
        </div>
      </section>

      <section className="cdl-section">
        <h2 className="cdl-sec-title">{t('candela.principles.heading')}</h2>
        <p className="cdl-sec-desc">{t('candela.principles.desc')}</p>
        <div className="cdl-principles">
          {Array.from({ length: principleCount }).map((_, i) => (
            <span className="cdl-principle" key={i}>{t(`candela.principles.items.${i}`)}</span>
          ))}
        </div>
      </section>

      <footer className="cdl-foot">{t('candela.footer')}</footer>
    </div>
  );
}

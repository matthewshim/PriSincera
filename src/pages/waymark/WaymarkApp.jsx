import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import useSEO from '../../hooks/useSEO';
import './WaymarkApp.css';
import Icon from '../../components/common/Icon';

/**
 * Waymark 서비스 앱 셸 (/waymark/app) — 인증 게이트 + 홈 스캐폴드 (M0).
 *
 * 통합: 기존 PriSincera SPA에 편입. 데이터는 server REST(Bearer) → admin Firestore.
 * M0 범위 = 로그인 게이트 + 빈 홈. 결정 기록·타임라인·먼저찾아옴은 M1에서 연결.
 * 참고: docs/waymark/functional_spec.md §2(IA)·F-1
 */
export default function WaymarkApp() {
  const { user, loginWithGoogle, logout } = useAuth();
  const { t } = useTranslation();

  useSEO({
    title: t('waymark.app.seoTitle'),
    description: t('waymark.app.seoDesc'),
    ogUrl: 'https://www.prisincera.com/waymark/app',
  });

  // 로그인 게이트
  if (!user) {
    return (
      <div className="wma-gate">
        <div className="wma-gate-card">
          <h1 className="wma-gate-title">Waymark</h1>
          <p className="wma-gate-sub">{t('waymark.app.signInPrompt')}</p>
          <button type="button" className="wma-btn" onClick={loginWithGoogle}>
            {t('waymark.app.signInBtn')}
          </button>
          <p className="wma-gate-note">{t('waymark.app.betaNote')}</p>
        </div>
      </div>
    );
  }

  // 앱 셸 (M0 — 빈 홈)
  return (
    <div className="wma-shell">
      <header className="wma-top">
        <span className="wma-brand">Waymark</span>
        <button type="button" className="wma-logout" onClick={logout}>
          {t('waymark.app.logout')}
        </button>
      </header>
      <main className="wma-main">
        <div className="wma-empty">
          <div className="wma-empty-mark" aria-hidden="true"><Icon name="star" size={28} /></div>
          <h2 className="wma-empty-title">{t('waymark.app.emptyTitle')}</h2>
          <p className="wma-empty-desc">{t('waymark.app.emptyDesc')}</p>
          <button type="button" className="wma-btn" disabled>
            {t('waymark.app.newDecision')}
          </button>
          <p className="wma-gate-note">{t('waymark.app.betaNote')}</p>
        </div>
      </main>
    </div>
  );
}

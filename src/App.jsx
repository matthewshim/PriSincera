import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import GoogleAnalytics from './components/common/GoogleAnalytics';
import ErrorBoundary from './components/common/ErrorBoundary';

/* ── Code Splitting: page-level lazy imports ── */
const Home = lazy(() => import('./pages/Home'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const DailyView = lazy(() => import('./pages/DailyView'));
const PlannersView = lazy(() => import('./pages/PlannersView'));
const BuildersLog = lazy(() => import('./pages/BuildersLog'));
const BuildersLogDetail = lazy(() => import('./pages/BuildersLogDetail'));

/* ── Sylphio Pages ── */
const SylphioLanding = lazy(() => import('./pages/SylphioLanding'));
const SylphioApiKeyGuide = lazy(() => import('./pages/SylphioApiKeyGuide'));
const SylphioPrivacy = lazy(() => import('./pages/SylphioPrivacy'));

/* ── Candela ── */
const CandelaLanding = lazy(() => import('./pages/CandelaLanding'));

/** Minimal loading fallback — invisible, prevents layout shift */
const PageFallback = (
  <div style={{ minHeight: '100vh', background: 'var(--bg-void, var(--bg-void))' }} />
);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <GoogleAnalytics />
      <Suspense fallback={PageFallback}>
        <Routes>
          {/* Admin — Layout 밖 (독립 레이아웃) */}
          <Route path="admin" element={<AdminDashboard />} />

          {/* Public — Layout 안 (GNB/Footer) */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            {/* Planner's View — 뷰 중심 IA: 루트=최신 글, 슬러그=퍼머링크 (목록 페이지 없음).
                'archive'·'all'·'index'는 향후 목록 라우트를 위한 예약 슬러그로 쓰지 않는다. */}
            <Route path="planners-view" element={<PlannersView />} />
            <Route path="planners-view/:slug" element={<PlannersView />} />

            <Route path="builders-log" element={<BuildersLog />} />
            <Route path="builders-log/:slug" element={<BuildersLogDetail />} />

            {/* Daily Digest·Pace Note는 ReLearn으로 통합 — 서버 301이 선행 처리 */}
            {/* ReLearn — 하나의 날짜 뷰(DailyView): date 없으면 오늘, 있으면 그 날짜 (일자축 Phase 2) */}
            <Route path="relearn" element={<DailyView />} />
            <Route path="relearn/daily/:date" element={<DailyView />} />
            
            {/* Sylphio Routes */}
            <Route path="sylphio" element={<SylphioLanding />} />
            <Route path="sylphio/guide" element={<SylphioApiKeyGuide />} />
            <Route path="sylphio/privacy" element={<SylphioPrivacy />} />

            {/* Candela — 소개 랜딩만 공개(수치 없음). 데이터 라우트는 P5·G-2 이후 */}
            <Route path="candela" element={<CandelaLanding />} />
            
            {/* Legacy Redirects */}
            <Route path="signal/*" element={<Navigate to="/relearn" replace />} />
            <Route path="study/*" element={<Navigate to="/relearn" replace />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;

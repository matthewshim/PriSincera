import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import GoogleAnalytics from './components/common/GoogleAnalytics';

/* ── Code Splitting: page-level lazy imports ── */
const Home = lazy(() => import('./pages/Home'));
const DailyDigest = lazy(() => import('./pages/DailyDigest'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PaceNoteDashboard = lazy(() => import('./pages/PaceNoteDashboard'));
const BuildersLog = lazy(() => import('./pages/BuildersLog'));
const BuildersLogDetail = lazy(() => import('./pages/BuildersLogDetail'));/** Minimal loading fallback — invisible, prevents layout shift */
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
    <>
      <ScrollToTop />
      <GoogleAnalytics />
      <Suspense fallback={PageFallback}>
        <Routes>
          {/* Admin — Layout 밖 (독립 레이아웃) */}
          <Route path="admin" element={<AdminDashboard />} />

          {/* Public — Layout 안 (GNB/Footer) */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="builders-log" element={<BuildersLog />} />
            <Route path="builders-log/:slug" element={<BuildersLogDetail />} />

            {/* Unified Daily Digest Routes */}
            <Route path="daily" element={<DailyDigest />} />
            <Route path="daily/:date" element={<DailyDigest />} />

            {/* Pace Note Routes */}
            <Route path="pacenote" element={<PaceNoteDashboard />} />
            
            {/* Legacy Redirects */}
            <Route path="signal/*" element={<Navigate to="/daily" replace />} />
            <Route path="study/*" element={<Navigate to="/daily" replace />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;

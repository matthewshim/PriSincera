import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

/* ── Code Splitting: page-level lazy imports ── */
const Home = lazy(() => import('./pages/Home'));
const DailyDigest = lazy(() => import('./pages/DailyDigest'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PaceNoteDashboard = lazy(() => import('./pages/PaceNoteDashboard'));



/** Minimal loading fallback — invisible, prevents layout shift */
const PageFallback = (
  <div style={{ minHeight: '100vh', background: 'var(--bg-void, #0A0714)' }} />
);

function App() {
  return (
    <Suspense fallback={PageFallback}>
      <Routes>
        {/* Admin — Layout 밖 (독립 레이아웃) */}
        <Route path="admin" element={<AdminDashboard />} />

        {/* Public — Layout 안 (GNB/Footer) */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
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
  );
}

export default App;

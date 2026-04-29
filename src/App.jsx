import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

/* ── Code Splitting: page-level lazy imports ── */
const Home = lazy(() => import('./pages/Home'));
const PriSignal = lazy(() => import('./pages/PriSignal'));
const PriSignalDaily = lazy(() => import('./pages/PriSignalDaily'));
const PriSignalIssue = lazy(() => import('./components/prisignal/PriSignalIssue'));

/**
 * Route discriminator: /prisignal/:param
 * - YYYY-MM-DD → PriSignalDaily (데일리 시그널)
 * - UUID/other → PriSignalIssue (레거시 뉴스레터 아카이브)
 */
function PriSignalParamRoute() {
  const param = window.location.pathname.split('/prisignal/')[1]?.split('/')[0] || '';
  const isDate = /^\d{4}-\d{2}-\d{2}$/.test(param);
  return isDate ? <PriSignalDaily /> : <PriSignalIssue />;
}

/** Minimal loading fallback — invisible, prevents layout shift */
const PageFallback = (
  <div style={{ minHeight: '100vh', background: 'var(--bg-void, #0A0714)' }} />
);

function App() {
  return (
    <Suspense fallback={PageFallback}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="prisignal" element={<PriSignal />} />
          <Route path="prisignal/:date" element={<PriSignalParamRoute />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;

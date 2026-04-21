import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import PriSignal from './pages/PriSignal';
import PriSignalDaily from './pages/PriSignalDaily';
import PriSignalIssue from './components/prisignal/PriSignalIssue';

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

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="prisignal" element={<PriSignal />} />
        <Route path="prisignal/:date" element={<PriSignalParamRoute />} />
      </Route>
    </Routes>
  );
}

export default App;

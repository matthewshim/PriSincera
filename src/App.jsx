import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import PriSignal from './pages/PriSignal';
import PriSignalIssue from './components/prisignal/PriSignalIssue';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="prisignal" element={<PriSignal />} />
        <Route path="prisignal/:issueId" element={<PriSignalIssue />} />
      </Route>
    </Routes>
  );
}

export default App;

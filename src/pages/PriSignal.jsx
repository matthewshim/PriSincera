import { useEffect } from 'react';
import PriSignalHero from '../components/prisignal/PriSignalHero';
import PriSignalValue from '../components/prisignal/PriSignalValue';
import PriSignalCategories from '../components/prisignal/PriSignalCategories';
import PriSignalSubscribe from '../components/prisignal/PriSignalSubscribe';
import PriSignalFAQ from '../components/prisignal/PriSignalFAQ';
import './PriSignal.css';

/**
 * PriSignal Landing Page — /prisignal
 * Dedicated page for the PriSignal weekly newsletter service.
 * Sections: Hero → Value → Categories → Subscribe CTA → FAQ
 */
export default function PriSignal() {
  useEffect(() => {
    document.title = 'PriSignal — 노이즈 속에서 시그널을 포착하다 | PriSincera';
    window.scrollTo(0, 0);

    // Set meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = '20년차 PO가 매주 골라내는 태도와 트렌드의 교차점. PriSignal은 PriSincera의 주간 인사이트 큐레이션 뉴스레터입니다.';

    return () => {
      document.title = 'PriSincera — Sincerity, Prioritized.';
    };
  }, []);

  return (
    <div className="prisignal-page">
      <PriSignalHero />
      <PriSignalValue />
      <PriSignalCategories />
      <PriSignalSubscribe />
      <PriSignalFAQ />
    </div>
  );
}

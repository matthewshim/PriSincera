import { useEffect } from 'react';
import PriSignalHero from '../components/prisignal/PriSignalHero';
import PriSignalValue from '../components/prisignal/PriSignalValue';
import PriSignalCategories from '../components/prisignal/PriSignalCategories';
import PriSignalArchive from '../components/prisignal/PriSignalArchive';
import PriSignalSubscribe from '../components/prisignal/PriSignalSubscribe';
import PriSignalFAQ from '../components/prisignal/PriSignalFAQ';
import './PriSignal.css';

/**
 * PriSignal Landing Page — /prisignal
 * Dedicated page for the PriSignal weekly newsletter service.
 * Sections: Hero → Value → Categories → Archive → Subscribe CTA → FAQ
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

    // Set OG meta tags
    const ogTags = {
      'og:title': 'PriSignal — 노이즈 속에서 시그널을 포착하다',
      'og:description': '20년차 PO가 매주 골라내는 태도와 트렌드의 교차점. 주간 인사이트 큐레이션 뉴스레터.',
      'og:image': 'https://www.prisincera.com/prisignal-og.png',
      'og:url': 'https://www.prisincera.com/prisignal',
      'og:type': 'website',
      'twitter:card': 'summary_large_image',
      'twitter:title': 'PriSignal — 노이즈 속에서 시그널을 포착하다',
      'twitter:description': '20년차 PO가 매주 골라내는 태도와 트렌드의 교차점.',
      'twitter:image': 'https://www.prisincera.com/prisignal-og.png',
    };

    const createdMetas = [];
    Object.entries(ogTags).forEach(([property, content]) => {
      const attr = property.startsWith('twitter:') ? 'name' : 'property';
      let tag = document.querySelector(`meta[${attr}="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, property);
        document.head.appendChild(tag);
        createdMetas.push(tag);
      }
      tag.content = content;
    });

    // PriSignal 페이지에는 Hero 인트로가 없으므로 GNB를 즉시 표시
    document.body.classList.add('hero-ready');

    return () => {
      document.title = 'PriSincera — Sincerity, Prioritized.';
      document.body.classList.remove('hero-ready');
      createdMetas.forEach(t => t.remove());
    };
  }, []);

  return (
    <div className="prisignal-page">
      <PriSignalHero />
      <PriSignalValue />
      <PriSignalCategories />
      <PriSignalArchive />
      <PriSignalSubscribe />
      <PriSignalFAQ />
    </div>
  );
}

import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import PriSignalHero from '../components/prisignal/PriSignalHero';
import PriSignalValue from '../components/prisignal/PriSignalValue';
import PriSignalCategories from '../components/prisignal/PriSignalCategories';
import PriSignalSignal from '../components/prisignal/PriSignalSignal';
import PriSignalArchive from '../components/prisignal/PriSignalArchive';
import PriSignalSubscribe from '../components/prisignal/PriSignalSubscribe';
import PriSignalFAQ from '../components/prisignal/PriSignalFAQ';
import './PriSignal.css';

/**
 * PriSignal Landing Page — /prisignal
 * Dedicated page for the PriSignal daily AI-curated newsletter service.
 *
 * Layout: Hero (shared) → Sub-tabs [소개 | 아티클]
 *   - 소개 (default): Value → Categories → Signal → Subscribe CTA → FAQ
 *   - 아티클: Archive (Daily signal list)
 */

const TABS = [
  { key: 'intro', label: '서비스 소개', icon: '📋' },
  { key: 'articles', label: '데일리 시그널', icon: '📰' },
];

export default function PriSignal() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('intro');
  const tabsRef = useRef(null);
  const indicatorRef = useRef(null);
  const tabsNavRef = useRef(null);

  // Position the indicator under the active tab button
  const updateIndicator = useCallback(() => {
    if (!tabsRef.current || !indicatorRef.current) return;
    const activeBtn = tabsRef.current.querySelector('.prisignal-tab.active');
    if (!activeBtn) return;
    const containerRect = tabsRef.current.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    indicatorRef.current.style.left = `${btnRect.left - containerRect.left}px`;
    indicatorRef.current.style.width = `${btnRect.width}px`;
  }, []);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab, updateIndicator]);

  // Sync tab bar top position with GNB actual height
  useEffect(() => {
    const gnb = document.querySelector('.nav');
    if (!gnb || !tabsNavRef.current) return;

    const syncTop = () => {
      const h = gnb.getBoundingClientRect().height;
      tabsNavRef.current.style.top = `${h}px`;
    };

    syncTop();

    // Observe GNB height changes (scroll state, resize)
    const ro = new ResizeObserver(syncTop);
    ro.observe(gnb);
    window.addEventListener('scroll', syncTop, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', syncTop);
    };
  }, []);

  // Hash-based tab switching: #daily → articles tab
  useEffect(() => {
    if (location.hash === '#daily') {
      setActiveTab('articles');
    }
  }, [location.hash]);


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
    meta.content = '20년차 PO의 기준으로 설계된 AI 큐레이션 뉴스레터. PriSignal은 매일 35개 글로벌 소스에서 SIGNAL 기준으로 의미 있는 시그널만 포착합니다.';

    // Set OG meta tags
    const ogTags = {
      'og:title': 'PriSignal — 노이즈 속에서 시그널을 포착하다',
      'og:description': '20년차 PO의 기준으로 설계된 AI 큐레이션 뉴스레터. 매일 SIGNAL 기준으로 시그널을 포착합니다.',
      'og:image': 'https://www.prisincera.com/prisignal-og.png',
      'og:url': 'https://www.prisincera.com/prisignal',
      'og:type': 'website',
      'twitter:card': 'summary_large_image',
      'twitter:title': 'PriSignal — 노이즈 속에서 시그널을 포착하다',
      'twitter:description': '20년차 PO의 기준으로 설계된 AI 큐레이션 뉴스레터.',
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

  const handleTabChange = (key) => {
    setActiveTab(key);
    // Scroll to tab bar so user sees content change
    const tabBar = document.getElementById('prisignal-tabs');
    if (tabBar) {
      const top = tabBar.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="prisignal-page">
      <PriSignalHero />

      {/* ── Sub-tab navigation ── */}
      <nav className="prisignal-tabs" id="prisignal-tabs" ref={tabsNavRef} role="tablist" aria-label="PriSignal 콘텐츠 탭">
        <div className="prisignal-tabs-inner" ref={tabsRef}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={activeTab === tab.key}
              aria-controls={`panel-${tab.key}`}
              className={`prisignal-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              <span className="prisignal-tab-icon">{tab.icon}</span>
              <span className="prisignal-tab-label">{tab.label}</span>
            </button>
          ))}
          {/* Animated active indicator */}
          <span className="prisignal-tab-indicator" ref={indicatorRef} />
        </div>
      </nav>


      {/* ── Tab panels ── */}
      <div
        className="prisignal-tab-panel"
        role="tabpanel"
        id="panel-intro"
        aria-labelledby="tab-intro"
        hidden={activeTab !== 'intro'}
      >
        <PriSignalValue />
        <PriSignalCategories />
        <PriSignalSignal />
        <PriSignalSubscribe />
        <PriSignalFAQ />
      </div>

      <div
        className="prisignal-tab-panel"
        role="tabpanel"
        id="panel-articles"
        aria-labelledby="tab-articles"
        hidden={activeTab !== 'articles'}
      >
        <PriSignalArchive />
      </div>
    </div>
  );
}


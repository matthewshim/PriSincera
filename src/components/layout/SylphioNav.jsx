import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';
import './SylphioNav.css';
import Icon from '../common/Icon';

const NAV_ITEMS = {
  ko: [
    { type: 'route', icon: 'document', label: '서비스 소개', path: '/sylphio', end: true },
    { type: 'route', icon: 'key', label: 'API Key 발급 가이드', path: '/sylphio/guide' },
    { type: 'route', icon: 'shield', label: '개인정보 처리방침', path: '/sylphio/privacy' },
    { type: 'link', icon: 'mail', label: '고객지원', path: 'mailto:support@prisincera.com' }
  ],
  en: [
    { type: 'route', icon: 'document', label: 'Introduction', path: '/sylphio', end: true },
    { type: 'route', icon: 'key', label: 'API Key Guide', path: '/sylphio/guide' },
    { type: 'route', icon: 'shield', label: 'Privacy Policy', path: '/sylphio/privacy' },
    { type: 'link', icon: 'mail', label: 'Support', path: 'mailto:support@prisincera.com' }
  ],
  ja: [
    { type: 'route', icon: 'document', label: 'サービス紹介', path: '/sylphio', end: true },
    { type: 'route', icon: 'key', label: 'APIキー連携ガイド', path: '/sylphio/guide' },
    { type: 'route', icon: 'shield', label: '個人情報保護方針', path: '/sylphio/privacy' },
    { type: 'link', icon: 'mail', label: 'サポート', path: 'mailto:support@prisincera.com' }
  ]
};

export default function SylphioNav() {
  const { locale } = useTranslation();
  const items = NAV_ITEMS[locale] || NAV_ITEMS['ko'];

  return (
    <nav className="sylphio-tabs-nav" role="tablist">
      <div className="sylphio-tabs-inner">
        {items.map((item, idx) => {
          if (item.type === 'route') {
            return (
              <NavLink
                key={idx}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `sylphio-tab haptic-trigger ${isActive ? 'active' : ''}`}
                role="tab"
              >
                {item.icon && <span className="sylphio-tab-icon"><Icon name={item.icon} /></span>}
                <span className="sylphio-tab-label">{item.label}</span>
              </NavLink>
            );
          } else {
            return (
              <a
                key={idx}
                href={item.path}
                className="sylphio-tab support-link haptic-trigger"
                role="tab"
              >
                {item.icon && <span className="sylphio-tab-icon"><Icon name={item.icon} /></span>}
                <span className="sylphio-tab-label">{item.label}</span>
              </a>
            );
          }
        })}
      </div>
    </nav>
  );
}

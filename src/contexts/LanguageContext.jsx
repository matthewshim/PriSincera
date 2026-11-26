import React, { createContext, useContext, useState, useEffect } from 'react';
import ko from '../locales/ko.json';
import en from '../locales/en.json';
import ja from '../locales/ja.json';

const LanguageContext = createContext();
const dictionaries = { ko, en, ja };

// 언어 목록 데이터 메타데이터 (GNB 셀렉트 박스에서 동적 렌더링에 활용)
export const SUPPORTED_LANGUAGES = [
  { code: 'ko', label: '한국어', nativeLabel: '한국어' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' }
];

export function LanguageProvider({ children }) {
  /* 우선순위: ?lang= 쿼리 > 저장된 선택 > navigator.language > ko
     쿼리를 최우선에 둔 이유는 SSR 과의 일치다. hreflang 이 ?lang=en 을 영문 주소로
     선언하고 서버가 그 URL 에 영문 메타를 방출하는데, 클라이언트가 쿼리를 무시하면
     같은 문서가 한국어로 렌더돼 메타와 본문이 어긋난다(공유된 영문 링크도 한국어로 열린다).

     localStorage 접근은 프라이빗 창·차단 설정에서 throw 할 수 있다. 초기화 함수에서
     터지면 앱 전체가 렌더되지 않으므로 감싼다. */
  const [locale, setLocale] = useState(() => {
    try {
      const fromQuery = new URLSearchParams(window.location.search).get('lang');
      if (dictionaries[fromQuery]) return fromQuery;
    } catch { /* URL 파싱 실패는 무시하고 다음 신호로 */ }

    try {
      const saved = localStorage.getItem('prs_locale');
      if (dictionaries[saved]) return saved;
    } catch { /* 스토리지 차단 — 감지로 넘어간다 */ }

    const browserLang = navigator.language?.split('-')[0] || 'ko';
    return dictionaries[browserLang] ? browserLang : 'ko';
  });

  useEffect(() => {
    try { localStorage.setItem('prs_locale', locale); } catch { /* 스토리지 차단 시 무시 */ }
    document.documentElement.lang = locale; // HTML lang 속성 동기화
  }, [locale]);

  // 번역 도우미 헬퍼 t() 함수 구현 (번역 키가 없는 경우 fallback 방어막 장착 및 변수 치환 지원)
  const t = (keyPath, params = {}) => {
    let value = keyPath.split('.').reduce((acc, key) => {
      return acc && acc[key] ? acc[key] : undefined;
    }, dictionaries[locale]);

    if (value === undefined) {
      // 현재 로케일에서 번역 키를 찾지 못한 경우, 1차적으로 한국어 원본 fallback
      value = keyPath.split('.').reduce((acc, key) => {
        return acc && acc[key] ? acc[key] : undefined;
      }, dictionaries['ko']);
    }

    if (value === undefined) return keyPath;

    // 파라미터가 있는 경우 {key} 형태의 문자열 치환
    if (params && Object.keys(params).length > 0 && typeof value === 'string') {
      return Object.entries(params).reduce((str, [k, v]) => {
        return str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      }, value);
    }

    return value;
  };

  // 동적 로컬라이제이션 맵 파싱용 헬퍼 함수
  const localize = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'object') {
      return obj[locale] || obj['ko'] || '';
    }
    return obj;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, localize, SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);


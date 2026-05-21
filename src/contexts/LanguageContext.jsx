import React, { createContext, useContext, useState, useEffect } from 'react';
import ko from '../locales/ko.json';
import en from '../locales/en.json';

const LanguageContext = createContext();
const dictionaries = { ko, en };

export function LanguageProvider({ children }) {
  // 브라우저 캐시 스토리지 우선 복원 또는 navigator.language 기반 자동 감지 (Lazy Initializer)
  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem('prs_locale');
    if (saved) return saved;
    
    // navigator.language 검출 (en 계열이면 en, 이외에는 한국어 fallback)
    const browserLang = navigator.language?.split('-')[0] || 'ko';
    return dictionaries[browserLang] ? browserLang : 'ko';
  });

  useEffect(() => {
    localStorage.setItem('prs_locale', locale);
    document.documentElement.lang = locale; // HTML lang 속성 동기화
  }, [locale]);

  // 번역 도우미 헬퍼 t() 함수 구현 (번역 키가 없는 경우 fallback 방어막 장착)
  const t = (keyPath) => {
    const value = keyPath.split('.').reduce((acc, key) => {
      return acc && acc[key] ? acc[key] : undefined;
    }, dictionaries[locale]);

    if (value !== undefined) return value;

    // 현재 로케일에서 번역 키를 찾지 못한 경우, 1차적으로 한국어 원본 fallback
    const fallbackValue = keyPath.split('.').reduce((acc, key) => {
      return acc && acc[key] ? acc[key] : undefined;
    }, dictionaries['ko']);

    return fallbackValue !== undefined ? fallbackValue : keyPath;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);

---
status: draft
domain: Core
last_updated: 2026-05-21
version: v1.0
target_files:
  - src/components/layout/Header.jsx
  - src/contexts/LanguageContext.jsx
  - server.mjs
---

# 🌐 PriSincera 글로벌 다국어 지원(i18n) 확장 계획서

PriSincera 플랫폼이 글로벌 사용자를 대상으로 다국어(Korean, English) 서비스를 매끄럽게 제공할 수 있도록 프론트엔드 다국어 바인딩, Firestore 콘텐츠 스키마 다국어화, SEO 최적화 및 인프라 가속화 전략을 수록한 표준 구현 계획서입니다.

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-05-21 | Antigravity AI | 최초 글로벌 다국어(i18n) 확장 표준 아키텍처 및 3단계 로드맵 정의 | Global Platform Integration |

---

## 1. 🔍 기술 검토 의견 및 아키텍처 비전

PriSincera를 글로벌 서비스로 확장하기 위한 다국어(i18n) 시스템 구축은 기술적으로 매우 명확하고 실현 가능성이 높습니다. 플랫폼의 경량성과 React 19의 호환성을 동시에 잡기 위해 **Custom Context 기반의 번들 프리 i18n 엔진**을 구축할 것을 제안합니다.

* **최소한의 오버헤드**: 서드파티 라이브러리(`react-i18next` 등)를 도입하여 번들 사이즈를 낭비하지 않고, React 네이티브 Context API와 Custom Hook으로 0.5KB 미만의 초경량 번역 시스템을 확보합니다.
* **백엔드/데이터 연동 일관성**: Firestore 콘텐츠를 `{ko, en}` 맵 구조로 단일화하고 Node.js API 서버가 클라이언트의 `Accept-Language` 헤더에 맞추어 런타임에 다국어 데이터를 선별 반환함으로써 컴포넌트 마크업 수정을 최소화합니다.
* **글로벌 크롤러 친화성**: 구글 검색 엔진이 각 언어 버전을 올바르게 수집하고 검색 랭킹에 가점을 주도록 하위 경로(`/en/`, `/ko/`) 라우팅과 `hreflang` 태그 동적 삽입을 지원합니다.

---

## 🎨 2. 프론트엔드: 초경량 다국어(i18n) 엔진 설계

### 2.1 로케일 사전 (Translation Dictionary)
`src/locales/` 경로 하위에 언어별 JSON 번역 사전을 적재합니다.

```json
// src/locales/ko.json
{
  "header": {
    "buildersLog": "빌더스 로그",
    "dailyDigest": "데일리 다이제스트",
    "paceNote": "페이스노트"
  }
}
```

```json
// src/locales/en.json
{
  "header": {
    "buildersLog": "Builder's Log",
    "dailyDigest": "Daily Digest",
    "paceNote": "PaceNote"
  }
}
```

### 2.2 LanguageProvider 구현 (`src/contexts/LanguageContext.jsx`)
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import ko from '../locales/ko.json';
import en from '../locales/en.json';

const LanguageContext = createContext();
const dictionaries = { ko, en };

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem('prs_locale');
    if (saved) return saved;
    const browserLang = navigator.language.split('-')[0];
    return dictionaries[browserLang] ? browserLang : 'ko';
  });

  useEffect(() => {
    localStorage.setItem('prs_locale', locale);
    document.documentElement.lang = locale; // HTML lang 속성 동기화
  }, [locale]);

  const t = (keyPath) => {
    return keyPath.split('.').reduce((acc, key) => {
      return acc && acc[key] ? acc[key] : keyPath;
    }, dictionaries[locale]);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);
```

---

## 🗄️ 3. 백엔드 & Firestore DB 스키마 다국어 설계

### 3.1 Firestore 스키마 개편 (Localization Map형)
동적 데이터를 한글판/영문판 문구별로 문서를 여러 개 쪼개지 않고, 하나의 Firestore 레코드 내에서 `Map` 자료형을 활용하여 다국어를 영속화합니다.

```json
// Firestore: /chapters/chapter_05
{
  "chapterNo": 5,
  "date": "2026-05-21",
  "title": {
    "ko": "21주차 나의 궤도 & 항해 일지",
    "en": "Week 21 My Orbit & Sailing Log"
  },
  "description": {
    "ko": "PriSincera의 개발 현황과 비전을 요약한 내용입니다.",
    "en": "Summary of PriSincera's development status and vision."
  }
}
```

### 3.2 Express API 다국어 필터링 미들웨어 (`server.mjs`)
클라이언트로부터 넘어오는 `Accept-Language` 헤더 또는 쿼리를 파싱하여, 클라이언트에 전송 시 알맞은 언어 필드만 골라 동적 리스트 구조를 런타임 가공해 반환합니다.

```javascript
app.use((req, res, next) => {
  const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'ko';
  req.locale = lang;
  next();
});

// 데이터 선별 및 전송 로직 예시
app.get('/api/builders-log', async (req, res) => {
  const snapshot = await db.collection('chapters').get();
  const localizedData = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title[req.locale] || data.title['ko'], // fallback to ko
      description: data.description[req.locale] || data.description['ko']
    };
  });
  res.json(localizedData);
});
```

---

## 📈 4. SEO 및 라우팅 (검색엔진 가치 극대화)

### 4.1 URL 구조 (Sub-path 라우팅 적용)
단순 쿠키/로컬스토리지 기반 치환 방식은 검색엔진 크롤러가 영문 페이지를 단독 인덱싱하지 못하는 원인이 됩니다. 따라서 언어별 서브경로 라우팅을 도입합니다.
* **한국어**: `https://www.prisincera.com/builders-log` (기본)
* **영어**: `https://www.prisincera.com/en/builders-log`

### 4.2 hreflang 태그 주입
`useSEO` 훅에 검색엔진 봇에게 다국어 페이지 상관관계를 선언해주는 링크 태그 주입 메커니즘을 이식합니다.

```javascript
useEffect(() => {
  const rawPath = window.location.pathname.replace(/^\/(en|ko)/, '');
  
  const linkEn = document.createElement('link');
  linkEn.rel = 'alternate';
  linkEn.hreflang = 'en';
  linkEn.href = `https://www.prisincera.com/en${rawPath}`;
  
  document.head.appendChild(linkEn);
  return () => {
    document.head.removeChild(linkEn);
  };
}, [locale]);
```

---

## 🛣️ 5. 3단계 점진적 구현 로드맵

시스템 변화의 안전성을 지탱하고 데이터를 안정적으로 마이그레이션하기 위해 점진적인 **3단계 연대기적 확장**을 실행합니다.

### 📅 [1단계] Foundation & Static (기반 & GNB 구현)
* **주요 작업**:
  - `LanguageProvider` 및 다국어 훅(`useTranslation`) 코어 구축.
  - GNB, Footer, 레이아웃에 노출되는 전체 정적 문구 번역 분리 적용.
  - Header(GNB) 우측 상단에 HSL 광원 효과와 미세 호버 물리 인터랙션을 담아낸 프리미엄 **로케일 선택 스위치(KR | EN)** 탑재.

### 📅 [2단계] API & Database Localization (동적 데이터 매핑)
* **주요 작업**:
  - Builders Log 메타 데이터 및 Firestore 도메인 필드 Map형 구조로 마이그레이션.
  - Express API 서버 미들웨어 연동 및 다국어 필터링 전송 이식.

### 📅 [3단계] Global SEO & Cloud Deployment (검색 최적화 및 인프라)
* **주요 작업**:
  - `useSEO` 훅 내 다국어 Meta 데이터 지원 및 `hreflang` 태그 연동.
  - Sub-path 기반 `react-router-dom` 라우팅 리팩토링.
  - GCP Cloud CDN 캐시 동기화 검증 및 배포 정상화.

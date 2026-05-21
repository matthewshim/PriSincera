---
status: draft
domain: Core
last_updated: 2026-05-21
version: v1.1
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
| v1.1 | 2026-05-21 | Antigravity AI | 누수 리스크 진단, 로케일 감지 우선순위 플로우 및 GNB UI 포지셔닝 스펙 보강 | Global Platform Integration |

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

## 🛡️ 5. 누수 리스크 진단 및 안전장치 (Leak Diagnosis)

글로벌 론칭 단계에서 발생할 수 있는 치명적인 Edge Case를 방어하기 위한 4중 안전장치 규격입니다.

1. **SEO 인덱싱 누수 방지**: 단순 `useState` 상태값 스왑에 의존하지 않고 로케일별 서브경로 라우팅과 `hreflang` 태그 명시를 결합하여 구글 봇이 두 언어 버전을 각각 완벽하게 수집하도록 강제합니다.
2. **초기 Hydration 깜빡임 방지 (Flicker Effect)**: `LanguageProvider` 마운트 전, 브라우저 스토리지에서 캐싱 로케일을 동기 평가하는 **Lazy Initializer** 방식을 사용하며, 프론트엔드가 페인팅되기 전에 `<html>` 의 `lang` 어트리뷰트를 강제 일치시켜 시각적 튐 현상을 소거합니다.
3. **번역 키 누락 방어 폴백 (Fallback Mechanism)**: 특정 번역 사전에서 특정 키가 누락되었을 때 화면에 `undefined`나 레이아웃 깨짐이 발생하는 것을 방어하기 위해, `t()` 함수는 누락 키 감지 시 기본 한국어 원문(`ko.json`) 사전에서 값을 2차 조회하거나, 키 자체의 경로 문자열을 반환하여 UI 붕괴를 예방합니다.
4. **날짜 및 숫자 포맷 누수 방지**: Builders Log 등 동적 날짜 표현에 대해 JS `toLocaleDateString` 등의 국제화 표준 API를 로케일 변수와 동적 바인딩하여, 한국어 환경에서는 `2026. 05. 21.`, 영어 환경에서는 `May 21, 2026` 형식으로 로케일 감응형 렌더링을 적용합니다.

---

## 🌐 6. 방문자 언어 감지 및 흐름도 (Language Detection Engine)

첫 방문자의 진입 마찰을 소거하기 위해 다음과 같은 감지 엔진 알고리즘을 런타임 가동합니다.

```
                    [ 방문자 언어 감지 및 설정 순서도 ]
                    
     사용자 최초 진입 ──► 1. 진입 URL 내 /en/ 경로 포함 여부 판단
                                   │
                     ┌─────────────┴─────────────┐
                     ▼ [Yes]                     ▼ [No]
                영어로 강제 노출            2. 로컬 스토리지 확인
                                            (기존 방문 내역 파싱)
                                                 │
                                   ┌─────────────┴─────────────┐
                                   ▼ [Yes]                     ▼ [No]
                            설정 기록 언어 적용       3. 브라우저 언어 감지
                                                    (navigator.language en 감지)
                                                                 │
                                                   ┌─────────────┴─────────────┐
                                                   ▼ [Yes]                     ▼ [No]
                                              영어로 자동 노출           한국어로 우선 노출
```

* **1순위 (명시적 경로)**: 사용자가 `/en/` 경로로 명시적 진입 시 브라우저 환경에 관계없이 영어 렌더링.
* **2순위 (수동 변경 기억)**: 로컬스토리지(`prs_locale`)에 이전 설정이 보존되어 있는 경우 해당 사용자의 설정을 최우선 보존.
* **3순위 (환경 감지)**: 첫 방문 시 `navigator.language` 언어 코드가 `en` 계열인 경우 영어 자동 노출, 이외의 환경 및 판별 불가 시 기본값 **한국어(Fallback)**로 노출.

---

## 🎨 7. 로케일 토글 스위치 GNB & 모바일 배치 전략

Star Prism의 다크 테마 아이덴티티와 한 손 엄지 손가락 반경 내 최적의 모바일 사용성을 보장하는 다국어 제어 인터페이스 설계 규격입니다.

### 7.1 데스크톱(Desktop) 뷰포트 설계
* **포지션**: GNB(Header) 최우측, BGM 음원 조작 토글 아이콘 바로 좌측 영역.
* **디자인**: 
  - `[ KR | EN ]` 형태의 은은한 반투명 유리막(Glassmorphism) 캡슐형 콤팩트 스위치.
  - 현재 활성화된 로케일 쪽 글씨 좌측에 Star Prism 테마 시그니처 컬러를 지닌 **미세 네온 광원 점(Active Laser Dot)**을 점등하여 현재 선택 상태를 심미적으로 표기.
* **인터랙션**: 호버 시 `150ms` 트랜지션 기반의 미세한 배경 광원 HSL 셰이딩 및 부드러운 스케일 업 물리 효과 피드백 제공.

### 7.2 모바일 & 태블릿(Mobile 뷰포트) 설계
* **포지션**: 모바일 Header GNB의 공간 효율을 극대화하기 위해 우측 햄버거 메뉴 탭 시 열리는 **전체 화면 네비게이션 드로어(Full-screen Drawer Menu)의 최하단 Footer 영역**에 넓고 직관적인 2분할 버튼 구조로 배치.
* **인터랙션**: 한 손 엄지 조작 영역(Thumb Zone)을 정밀 타격하여 조작 마찰을 0에 가깝게 소거.

---

## 🛣️ 8. 3단계 점진적 구현 로드맵

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

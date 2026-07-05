---
status: draft
domain: Core
last_updated: 2026-05-21
version: v2.0
target_files:
  - src/components/layout/Header.jsx
  - src/contexts/LanguageContext.jsx
  - src/locales/ja.json
  - server.mjs
  - admin-api.mjs
  - pacenote-api.mjs
  - src/pages/AdminDashboard.jsx
---

# 🗺️ 다국어 지원(i18n) 확장 계획서

PriSincera 플랫폼이 글로벌 사용자를 대상으로 다국어(Korean, English, Japanese 등) 서비스를 매끄럽게 제공할 수 있도록 프론트엔드 다국어 바인딩, Firestore 콘텐츠 스키마 다국어화, SEO 최적화 및 인프라 가속화 전략을 수록한 표준 구현 계획서입니다.

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-05-21 | Antigravity AI | 최초 글로벌 다국어(i18n) 확장 표준 아키텍처 및 3단계 로드맵 정의 | Global Platform Integration |
| v1.1 | 2026-05-21 | Antigravity AI | 누수 리스크 진단, 로케일 감지 우선순위 플로우 및 GNB UI 포지셔닝 스펙 보강 | Global Platform Integration |
| v1.2 | 2026-05-21 | Antigravity AI | 확장 가능한 셀렉트 드롭다운 UI 사양 도입 및 일본어(JA) 다국어 사전 스펙 추가 | Global Platform Integration |
| v1.3 | 2026-05-21 | Antigravity AI | 브랜드 정체성 강화를 위해 서비스 및 GNB/Footer 메뉴 명칭을 영문명으로 단일화 반영 | Global Platform Integration |
| v1.4 | 2026-05-21 | Antigravity AI | 테두리 없는 심플한 언어 선택 버튼 디자인(GNB 최적화) 반영 | Global Platform Integration |
| v2.0 | 2026-05-21 | Antigravity AI | 2단계 동적 데이터(API/DB) 현지화 및 어드민(Admin) 다국어 입력/관리 스펙 통합 추가 | Global Platform Integration |

---

## 1. 🔍 기술 검토 의견 및 아키텍처 비전

PriSincera를 글로벌 서비스로 확장하고, 특히 글로벌 론칭 예정인 **Sylphio** 서비스를 서포트하기 위한 다국어(i18n) 시스템은 지속적인 언어 확장성(Scalability)을 확보해야 합니다. 기존의 KR/EN 2분할 캡슐 버튼은 언어 추가 시 레이아웃 한계에 직면하므로, **유리막 스타일의 Premium Custom Select Dropdown UI**로 아키텍처를 전면 전환합니다.

* **지속 가능한 다국어 확장**: 사전에 신규 언어 리소스(`ja.json` 등)를 정의하고 이를 `dictionaries` 매핑 테이블에 한 줄 등록하는 것만으로 모든 UI가 동적 스케일링됩니다.
* **최소한의 오버헤드**: 외부 라이브러리 없이 자체 `LanguageContext` 내에서 0.6KB 미만의 초경량 번들로 드롭다운 상태를 기동합니다.
* **일본어(JA) 우선 결합**: Sylphio 글로벌 데뷔 스케줄을 감안하여 기존 한국어, 영어 외에 **일본어**를 정규 로케일로 편입하고 사전을 정의합니다.
* **서비스 및 메뉴명 영문 일관성**: 브랜드 아이덴티티와 글로벌 가독성을 극대화하기 위해 `Builder's Log`, `Daily Digest`, `Pace Note`, `Sylphio` 등 GNB/Footer의 주요 서비스/메뉴 명칭은 모든 로케일(KO, EN, JA)에서 영문명으로 공통 고정 적용합니다. 단, 로컬라이즈된 알림창 메시지(`sylphioAlert` 등)나 SEO 메타 키워드는 각 국가별 최적 자연어로 차별 노출합니다.

---

## 🎨 2. 프론트엔드: 초경량 다국어(i18n) 엔진 설계

### 2.1 로케일 사전 (Translation Dictionaries)
`src/locales/` 경로 하위에 언어별 JSON 번역 사전을 적재합니다.

```json
// src/locales/ko.json
{
  "header": {
    "buildersLog": "Builder's Log",
    "dailyDigest": "Daily Digest",
    "paceNote": "Pace Note",
    "sylphio": "Sylphio",
    "sylphioAlert": "앗, 아직은 안 돼요! 🙈\n\n바람의 정령 Sylphio가 지금 열심히 데뷔 준비를 하고 있습니다..."
  }
}
```

```json
// src/locales/en.json
{
  "header": {
    "buildersLog": "Builder's Log",
    "dailyDigest": "Daily Digest",
    "paceNote": "Pace Note",
    "sylphio": "Sylphio",
    "sylphioAlert": "Oops, not yet! 🙈\n\nSylphio, the wind spirit, is working hard on preparing for its debut..."
  }
}
```

```json
// src/locales/ja.json
{
  "header": {
    "buildersLog": "Builder's Log",
    "dailyDigest": "Daily Digest",
    "paceNote": "Pace Note",
    "sylphio": "Sylphio",
    "sylphioAlert": "おっと、まだ準備中ですよ！ 🙈\n\n風の精霊 Sylphio がデビューに向けて一生懸命準備しています..."
  }
}
```

### 2.2 LanguageProvider 구현 (`src/contexts/LanguageContext.jsx`)
```javascript
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
    const value = keyPath.split('.').reduce((acc, key) => {
      return acc && acc[key] ? acc[key] : undefined;
    }, dictionaries[locale]);

    if (value !== undefined) return value;

    // 현재 로케일에서 번역이 없는 경우, 한국어를 Fallback으로 사용
    const fallbackValue = keyPath.split('.').reduce((acc, key) => {
      return acc && acc[key] ? acc[key] : undefined;
    }, dictionaries['ko']);

    return fallbackValue !== undefined ? fallbackValue : keyPath;
  };

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
```

---

## 🗄️ 3. 백엔드 & Firestore DB 스키마 다국어 설계

### 3.1 Firestore 스키마 개편 (Localization Map형)
동적 데이터를 한글판/영문판/일문판으로 문서를 쪼개지 않고, 하나의 Firestore 레코드 내에서 `Map` 자료형을 활용하여 다국어를 영속화합니다.

```json
// Firestore: /chapters/chapter_05
{
  "chapterNo": 5,
  "date": "2026-05-21",
  "title": {
    "ko": "21주차 나의 궤도 & 항해 일지",
    "en": "Week 21 My Orbit & Sailing Log",
    "ja": "21週目 私の軌道＆航해日誌"
  }
}
```

### 3.2 서버 사이드 다국어 감지 미들웨어
클라이언트에서 `Accept-Language` 헤더 또는 `?lang=en` 쿼리 파라미터로 요청한 언어 설정을 파싱하는 Express 공통 미들웨어를 도입하여 `req.locale` 컨텍스트를 제공합니다.

```javascript
// server.mjs 공통 미들웨어
app.use('/api/', (req, res, next) => {
  const queryLang = req.query.lang;
  const headerLang = req.headers['accept-language']?.split(',')[0]?.split('-')[0];
  const allowed = ['ko', 'en', 'ja'];
  req.locale = allowed.includes(queryLang) ? queryLang : (allowed.includes(headerLang) ? headerLang : 'ko');
  next();
});
```

### 3.3 Dynamic Content 현지화 필터링
서버는 데이터베이스에서 조회한 번역 맵 객체(Map) 중, 클라이언트가 요청한 `req.locale`에 일치하는 값을 평탄화(Flatten)하여 클라이언트에 응답합니다. 이 설계는 기존 프론트엔드의 데이터 수신 구조와 호환성을 해치지 않으며 극도의 단순함을 유지합니다.
* 예: Firestore에 저장된 `title: { ko: "가다", en: "Go" }` -> 클라이언트가 영문(en) 요청 시 서버가 `title: "Go"`로 평탄화하여 전송.

---

## 🛠️ 4. Admin 대시보드 동적 데이터 i18n 관리 아키텍처

동적 데이터(Daily Digest, Pace Note AI 추천 풀, Builder's Log 메타 등)를 영속화하고 발행하는 **Admin 대시보드 백오피스**의 다국어 기획 스펙입니다.

### 4.1 데이터 무결성 및 다국어 입력 UI 기획
어드민 패널(`AdminDashboard.jsx`)에서 콘텐츠를 추가/수정하는 모달 에디터 내에 **다국어 입력 탭(KO / EN / JA)**을 탑재합니다.
* **로케일 탭 전환 모델**: 에디터 내에 글로벌 국기 또는 언어 스위처를 제공하여 각 언어별 `Title`, `Subtitle`, `Description`을 개별 입력할 수 있도록 구성합니다.
* **어드민 폼 바인딩**: 폼 제출 시 각각의 입력 상태를 통합하여 서버로 전송합니다.
  ```javascript
  const payload = {
    title: { ko: titleKo, en: titleEn, ja: titleJa },
    description: { ko: descKo, en: descEn, ja: descJa }
  };
  ```

### 4.2 Gemini AI 기반 자동 번역 파이프라인 (보조 에이전트)
어드민이 모든 언어의 제목과 설명을 번거롭게 수동으로 작성하는 리스크를 방어하기 위해, **Gemini AI 자동 번역 파이프라인**을 어드민 백엔드(`admin-api.mjs`)에 통합합니다.
* 어드민이 하나의 기본 언어(한국어)로 타이틀과 설명을 입력한 상태에서 **[AI 자동 완역]** 버튼을 클릭하거나 문서를 발행할 때, `/builderslog/analyze` API가 Gemini 모델을 호출하여 원문을 고품질의 영어(`en`) 및 일본어(`ja`)로 자동 정밀 현지화하여 Map 필드를 자동 완성해줍니다.
* 자동 생성된 결과물은 어드민이 최종 저장 전에 검수 및 수동으로 보정할 수 있도록 인터랙션 화면을 제공합니다.

### 4.3 마크다운 본문 멀티 로케일 배포
* **마크다운 상세 본문 번역**: 기술 아티클과 같이 긴 텍스트의 본문은 각 언어별 마크다운 파일(예: `[slug].md`, `[slug]_en.md`, `[slug]_ja.md`)로 빌드하여 배포합니다.
* 어드민 배포 API `/builderslog/publish`에서 다국어 마크다운 필드를 받아서 해당하는 경로에 각각 커밋(Commit & Push)하도록 GitHub API 파이프라인을 확장합니다.

---

## 🛡️ 5. 누수 리스크 진단 및 안전장치 (Leak Diagnosis)

1. **SEO 인덱싱 누수 방지**: 라우팅 리팩토링 시 로케일별 서브경로 라우팅과 `hreflang` 태그 명시를 결합하여 구글 봇이 세 개의 언어 버전을 각각 수집하도록 강제합니다.
2. **번역 키 누락 방어 폴백 (Fallback Mechanism)**: 신규 추가된 일본어 사전에서 특정 키가 누락되었을 때 화면에 `undefined`가 노출되는 것을 방지하기 위해 `t()` 헬퍼가 한국어 사전에서 값을 우회 탐색하도록 합니다.
3. **날짜 및 숫자 포맷 누수 방지**: 날짜 표현 시 `toLocaleDateString` 등의 국제화 표준 API에 `'ko-KR'`, `'en-US'`, `'ja-JP'` 로케일 인자를 연동하여 자동 포맷 조율을 적용합니다.

---

## 🌐 6. 방문자 언어 감지 및 흐름도 (Language Detection Engine)

```
 사용자 최초 진입 ──► 1. 진입 URL 내 /en/ 또는 /ja/ 경로 포함 여부 판단
                                │
                 ┌─────────────┴─────────────┐
                 ▼ [Yes]                     ▼ [No]
            해당 언어로 강제 노출            2. 로컬 스토리지 확인
                                        (기존 방문 내역 파싱)
                                             │
                                ┌─────────────┴─────────────┐
                                ▼ [Yes]                     ▼ [No]
                         설정 기록 언어 적용       3. 브라우저 언어 감지
                                                (ko/en/ja 감지)
                                                             │
                                               ┌─────────────┴─────────────┐
                                               ▼ [Yes]                     ▼ [No]
                                          해당 언어로 노출           한국어로 우선 노출
```

---

## 🎨 7. 확장형 로케일 셀렉트 드롭다운 GNB & 모바일 배치 전략

### 7.1 데스크톱(Desktop) 뷰포트 설계
* **포지션**: GNB(Header) 최우측, BGM 음원 조작 토글 아이콘 바로 좌측 영역.
* **디자인**:
  - `🌐 KO`, `🌐 EN`, `🌐 JA` 형태로 현재 활성화된 언어를 간결하게 상시 노출하는 **테두리 없는 심플한 트리거 버튼** 탑재.
  - 마우스 클릭 또는 호버 시 하단으로 미세하게 드롭되는 **유리막 컨테이너(Select Dropdown Menu)** 전개.
  - 드롭다운 내부 아이템 호버 시 `var(--glass-bg)` 스케일 업 및 미세 HSL 셰이딩 활성화.
  - 활성화된 로케일 아이템 좌측에 **Active Laser Dot (Active HSL 네온 광원 점)**을 점등하여 정밀 상태 표시.
* **안전장치**: 드롭다운 전개 시 컴포넌트 외부 영역 클릭을 감지하여 팝업이 안전하게 닫히는 **Click Outside** 핸들러 탑재.

### 7.2 모바일 & 태블릿(Mobile 뷰포트) 설계
* **포지션**: 전체화면 오버레이 드로어의 최하단 Footer 영역에 넓고 정돈된 형태의 **3단 가로 그리드 캡슐 버튼** 배치.
* **인터랙션**: 한 손 조작 엄지 영역을 완벽하게 커버하며, 버튼 클릭 즉시 부드럽게 창이 닫히며 언어 변환 완료.

---

## 🛣️ 8. 3단계 점진적 구현 로드맵 (확장 버전)

### 📅 [1단계] Foundation & Static (기반 & GNB 구현) - 🎉 완료
* **주요 작업**:
  - `LanguageProvider` 및 다국어 훅(`useTranslation`) 코어 일본어 포함 삼차원 바인딩.
  - GNB, Footer, 레이아웃에 노출되는 전체 정적 문구 삼중 번역 이식.
  - Header(GNB) 우측 상단에 확장 가능한 **OLED Premium Custom Dropdown Selector** 개발 및 탑재.
  - GNB 로케일 드롭다운 트리거의 테두리(border), 배경(background) 캡슐 및 그림자(shadow)를 완전 차단하여 비주얼 정제화.
  - 모바일 드로어 풋터 메뉴 최하단 3단 스위치 이식.

### 📅 [2단계] API & Database Localization (동적 데이터 매핑 및 어드민 통합)
* **주요 작업**:
  - Express API 공통 로케일 감지 미들웨어 및 로케일별 응답 단일화 평탄화 레이어 도입.
  - Builders Log 메타 데이터 및 Firestore 도메인 필드 Map형 구조로 마이그레이션.
  - Pace Note 기본 목표 및 AI 추천 풀 전체 다국어 Map화 및 현지화 서빙.
  - AdminDashboard 에디터 모달 내 다국어 입력용 KO/EN/JA 전환 탭 UI 추가.
  - `admin-api.mjs` 내 Gemini `/builderslog/analyze` 자동 번역 파이프라인 확장 및 다국어 마크다운 발행 지원.

### 📅 [3단계] Global SEO & Cloud Deployment (검색 최적화 및 인프라)
* **주요 작업**:
  - `useSEO` 훅 내 다국어 Meta 데이터 지원 및 `hreflang` 태그 연동.
  - Sub-path 기반 `react-router-dom` 라우팅 리팩토링.
  - GCP Cloud CDN 캐시 동기화 검증 및 배포 정상화.

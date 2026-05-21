---
status: draft
domain: Core
last_updated: 2026-05-21
version: v1.2
target_files:
  - src/components/layout/Header.jsx
  - src/contexts/LanguageContext.jsx
  - src/locales/ja.json
  - server.mjs
---

# 🌐 PriSincera 글로벌 다국어 지원(i18n) 확장 계획서

PriSincera 플랫폼이 글로벌 사용자를 대상으로 다국어(Korean, English, Japanese 등) 서비스를 매끄럽게 제공할 수 있도록 프론트엔드 다국어 바인딩, Firestore 콘텐츠 스키마 다국어화, SEO 최적화 및 인프라 가속화 전략을 수록한 표준 구현 계획서입니다.

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-05-21 | Antigravity AI | 최초 글로벌 다국어(i18n) 확장 표준 아키텍처 및 3단계 로드맵 정의 | Global Platform Integration |
| v1.1 | 2026-05-21 | Antigravity AI | 누수 리스크 진단, 로케일 감지 우선순위 플로우 및 GNB UI 포지셔닝 스펙 보강 | Global Platform Integration |
| v1.2 | 2026-05-21 | Antigravity AI | 확장 가능한 셀렉트 드롭다운 UI 사양 도입 및 일본어(JA) 다국어 사전 스펙 추가 | Global Platform Integration |

---

## 1. 🔍 기술 검토 의견 및 아키텍처 비전

PriSincera를 글로벌 서비스로 확장하고, 특히 글로벌 론칭 예정인 **Sylphio** 서비스를 서포트하기 위한 다국어(i18n) 시스템은 지속적인 언어 확장성(Scalability)을 확보해야 합니다. 기존의 KR/EN 2분할 캡슐 버튼은 언어 추가 시 레이아웃 한계에 직면하므로, **유리막 스타일의 Premium Custom Select Dropdown UI**로 아키텍처를 전면 전환합니다.

* **지속 가능한 다국어 확장**: 사전에 신규 언어 리소스(`ja.json` 등)를 정의하고 이를 `dictionaries` 매핑 테이블에 한 줄 등록하는 것만으로 모든 UI가 동적 스케일링됩니다.
* **최소한의 오버헤드**: 외부 라이브러리 없이 자체 `LanguageContext` 내에서 0.6KB 미만의 초경량 번들로 드롭다운 상태를 기동합니다.
* **일본어(JA) 우선 결합**: Sylphio 글로벌 데뷔 스케줄을 감안하여 기존 한국어, 영어 외에 **일본어**를 정규 로케일로 편입하고 사전을 정의합니다.

---

## 🎨 2. 프론트엔드: 초경량 다국어(i18n) 엔진 설계

### 2.1 로케일 사전 (Translation Dictionaries)
`src/locales/` 경로 하위에 언어별 JSON 번역 사전을 적재합니다.

```json
// src/locales/ko.json
{
  "header": {
    "buildersLog": "빌더스 로그",
    "dailyDigest": "데일리 다이제스트",
    "paceNote": "페이스노트",
    "sylphio": "실피오",
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
    "buildersLog": "ビルダーズログ",
    "dailyDigest": "デイリーダイジェスト",
    "paceNote": "ペースノート",
    "sylphio": "シルフィオ",
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

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, SUPPORTED_LANGUAGES }}>
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
    "ja": "21週目 私の軌道＆航海日誌"
  }
}
```

---

## 🛡️ 4. 누수 리스크 진단 및 안전장치 (Leak Diagnosis)

1. **SEO 인덱싱 누수 방지**: 라우팅 리팩토링 시 로케일별 서브경로 라우팅과 `hreflang` 태그 명시를 결합하여 구글 봇이 세 개의 언어 버전을 각각 수집하도록 강제합니다.
2. **번역 키 누락 방어 폴백 (Fallback Mechanism)**: 신규 추가된 일본어 사전에서 특정 키가 누락되었을 때 화면에 `undefined`가 노출되는 것을 방지하기 위해 `t()` 헬퍼가 한국어 사전에서 값을 우회 탐색하도록 합니다.
3. **날짜 및 숫자 포맷 누수 방지**: 날짜 표현 시 `toLocaleDateString` 등의 국제화 표준 API에 `'ko-KR'`, `'en-US'`, `'ja-JP'` 로케일 인자를 연동하여 자동 포맷 조율을 적용합니다.

---

## 🌐 5. 방문자 언어 감지 및 흐름도 (Language Detection Engine)

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

## 🎨 6. 확장형 로케일 셀렉트 드롭다운 GNB & 모바일 배치 전략

### 6.1 데스크톱(Desktop) 뷰포트 설계
* **포지션**: GNB(Header) 최우측, BGM 음원 조작 토글 아이콘 바로 좌측 영역.
* **디자인**:
  - `🌐 KO`, `🌐 EN`, `🌐 JA` 형태로 현재 활성화된 언어를 간결하게 상시 노출하는 **Premium Glassmorphic Trigger Button** 탑재.
  - 마우스 클릭 또는 호버 시 하단으로 미세하게 드롭되는 **유리막 컨테이너(Select Dropdown Menu)** 전개.
  - 드롭다운 내부 아이템 호버 시 `var(--glass-bg)` 스케일 업 및 미세 HSL 셰이딩 활성화.
  - 활성화된 로케일 아이템 좌측에 **Active Laser Dot (Active HSL 네온 광원 점)**을 점등하여 정밀 상태 표시.
* **안전장치**: 드롭다운 전개 시 컴포넌트 외부 영역 클릭을 감지하여 팝업이 안전하게 닫히는 **Click Outside** 핸들러 탑재.

### 6.2 모바일 & 태블릿(Mobile 뷰포트) 설계
* **포지션**: 전체화면 오버레이 드로어의 최하단 Footer 영역에 넓고 정돈된 형태의 **3단 가로 그리드 캡슐 버튼** 배치.
* **인터랙션**: 한 손 조작 엄지 영역을 완벽하게 커버하며, 버튼 클릭 즉시 부드럽게 창이 닫히며 언어 변환 완료.

---

## 🛣️ 7. 3단계 점진적 구현 로드맵 (확장 버전)

### 📅 [1단계] Foundation & Static (기반 & GNB 구현)
* **주요 작업**:
  - `LanguageProvider` 및 다국어 훅(`useTranslation`) 코어 일본어 포함 삼차원 바인딩.
  - GNB, Footer, 레이아웃에 노출되는 전체 정적 문구 삼중 번역 이식.
  - Header(GNB) 우측 상단에 확장 가능한 **OLED Premium Custom Dropdown Selector** 개발 및 탑재.
  - 모바일 드로어 메뉴 최하단 3단 스위치 이식.

### 📅 [2단계] API & Database Localization (동적 데이터 매핑)
* **주요 작업**:
  - Builders Log 메타 데이터 및 Firestore 도메인 필드 Map형 구조로 마이그레이션.
  - Express API 서버 미들웨어 연동 및 다국어 필터링 전송 이식.

### 📅 [3단계] Global SEO & Cloud Deployment (검색 최적화 및 인프라)
* **주요 작업**:
  - `useSEO` 훅 내 다국어 Meta 데이터 지원 및 `hreflang` 태그 연동.
  - Sub-path 기반 `react-router-dom` 라우팅 리팩토링.
  - GCP Cloud CDN 캐시 동기화 검증 및 배포 정상화.

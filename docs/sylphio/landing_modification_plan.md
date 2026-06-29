# 📝 Sylphio 웹 소개 페이지(Landing Page) 팩트 및 정책 수정 계획서 (v2.1)

본 계획서는 macOS 데스크톱 앱의 최신 정책(**영어 및 한국어 무제한 무료 지원, 그 외 10개 이상 다국어 및 AI 회의록 요약은 Pro Lifetime 라이선스 전용**)을 웹 소개 페이지에 정밀 반영하기 위한 수정 계획입니다.

기존 v2.0 계획서의 "영어만 무료" 기획을 갱신하여 **"영어와 한국어 공동 무료 지원"** 팩트를 스토어 피처 리스트 및 가상 시뮬레이터에 적용하고, 시뮬레이터 시나리오를 고도화하여 무료 언어(영어, 한국어)와 유료 Pro 언어(일본어)의 동작 차이를 직관적으로 경험할 수 있도록 설계했습니다.

---

## 🔍 수정 대상 파일 및 세부 계획

### 1. [SylphioLanding.jsx](file:///Users/shimks/Documents/문서 - kwang-sik의 MacBook Pro/PriSincera/www/src/pages/SylphioLanding.jsx)

#### ① 무료/프로 라이선스 비교 피처 텍스트 교정 (ko, en, ja)
* **한국어 (ko) 수정**:
  - `freeFeature1`: `"영어(English) 음성 인식 및 기본 번역 무제한 지원"` ➔ `"영어 및 한국어 음성 인식 및 기본 번역 무제한 지원"`
  - `freeFeature3`: `"영어 전용 실시간 오프라인/하이브리드 번역 자막 제공"` ➔ `"영어 및 한국어 실시간 오프라인/하이브리드 번역 자막 제공"`
  - `proFeature1`: `"12개 다국어(한국어, 일본어, 중국어 등) 잠금 전면 해제"` ➔ `"10개 이상 다국어(일본어, 중국어, 프랑스어 등) 잠금 전면 해제"`
* **영어 (en) 수정**:
  - `freeFeature1`: `"Unlimited English speech-to-text & basic translation"` ➔ `"Unlimited English & Korean speech-to-text & basic translation"`
  - `freeFeature3`: `"English-only real-time offline/hybrid translation subtitles"` ➔ `"English & Korean real-time offline/hybrid translation subtitles"`
  - `proFeature1`: `"Unlock all 12 global languages (Korean, Japanese, etc.)"` ➔ `"Unlock all 10+ global languages (Japanese, Chinese, etc.)"`
* **일본어 (ja) 수정**:
  - `freeFeature1`: `"英語(English)の音声認識および基本翻訳の無制限サポート"` ➔ `"英語(English)と韓国語(Korean)の音声認識および基本翻訳の無制限サポート"`
  - `freeFeature3`: `"英語専用のリアルタイム・オフライン/ハイブリッド翻訳字幕の提供"` ➔ `"英語と韓国語専用のリアルタイム・オフライン/ハイブリッド翻訳字幕の提供"`
  - `proFeature1`: `"12の多言語（韓国語、日本語、中国語など）ロックを全面解除"` ➔ `"10以上の多言語（日本語、中国語、フランス語など）ロックを全面解除"`

---

#### ② 시뮬레이터 시나리오 고도화 (한국어 무료 세션 추가)
기존 시뮬레이터가 🇺🇸영어(무료)와 🇯🇵일본어(Pro)만 제공하여 한국어 무료 작동을 직접적으로 인지하기 어려웠던 부분을 개선하기 위해, **🇰🇷한국어 회의 시나리오를 추가하고 이를 무료 개방**하도록 기획합니다.

##### 🛠️ 시뮬레이터 시나리오 데이터(`SCENARIOS`) 보완
```javascript
const SCENARIOS = {
  en: {
    speaker: "Steve (Product Manager)",
    source: "Good morning everyone. Today we are gathered to discuss our product roadmap for the next quarter, including the integration of our new AI engine.",
    translated: "여러분 안녕하십니까. 오늘은 새로운 AI 엔진 통합을 포함한 다음 분기 제품 로드맵을 논의하기 위해 모였습니다."
  },
  ko: {
    speaker: "민수 (프로젝트 리더)",
    source: "안녕하세요 여러분. 오늘 회의에서는 다음 분기 릴리즈 일정과 새롭게 추가될 실시간 번역 기능의 안정성에 대해 논의하겠습니다.",
    translated: "Hello everyone. In today's meeting, we will discuss the next quarter's release schedule and the stability of the newly added real-time translation feature."
  },
  jp: {
    speaker: "Kenji (AI Engineer)",
    source: "皆さん、こんにちは。本日のセミナーでは、オンデバイスAI技術が私たちの日常生活에どのような変化をもたらすかについてお話しします。",
    translated: "여러분, 안녕하십니까. 오늘 세미나에서는 온디바이스 AI 기술이 우리의 일상 생활에 어떤 변화를 가져올지에 대해 말씀드리겠습니다."
  }
};
```

##### 🛠️ 시나리오 클릭 이벤트 핸들러(`handlePlayScenario`) 조건 수정
* `ko`와 `en`은 무료(Free)이므로 클릭 즉시 시뮬레이션 작동.
* `jp`는 Pro 잠금 언어이므로 `isProUnlocked`가 `false`일 때 결제창(Mock Paywall) 팝업 동작 유지.
```javascript
const handlePlayScenario = (key) => {
  // 일본어(jp) 시나리오 클릭 시에만 Pro 라이선스 검증 적용 (영어/한국어는 무료 해방)
  if (key === 'jp' && !isProUnlocked) {
    setShowMockPaywall(true);
    return;
  }
  // (이하 타이머 초기화 및 시뮬레이터 재생 로직 동일)
  ...
};
```

##### 🛠️ 시뮬레이터 컨트롤 버튼 마크업 수정
```jsx
<div className="sylphio-simulator-controls">
  <button 
    className={`btn-simulator ${activeScenario === 'en' ? 'active' : ''}`}
    onClick={() => handlePlayScenario('en')}
    disabled={isPlaying && activeScenario === 'en'}
    id="btn-sim-english"
  >
    🇺🇸 English Meeting ( Steve )
  </button>
  <button 
    className={`btn-simulator ${activeScenario === 'ko' ? 'active' : ''}`}
    onClick={() => handlePlayScenario('ko')}
    disabled={isPlaying && activeScenario === 'ko'}
    id="btn-sim-korean"
  >
    🇰🇷 Korean Meeting ( Minsoo )
  </button>
  <button 
    className={`btn-simulator ${activeScenario === 'jp' ? 'active' : ''}`}
    onClick={() => handlePlayScenario('jp')}
    disabled={isPlaying && activeScenario === 'jp'}
    id="btn-sim-japanese"
  >
    🇯🇵 Japanese Seminar ( Kenji )
    {!isProUnlocked && <span className="btn-sim-pro-badge">✨ PRO</span>}
  </button>
</div>
```

##### 🛠️ 윈도우 헤더 내 언어 코드 동적 매핑
기존에는 언어 코드를 `activeScenario === 'en' ? 'EN' : 'JA'`로 단순 삼항 연산했으나, 한국어가 추가됨에 따라 대문자 변환 코드로 동적 매핑합니다.
```jsx
<div className="sylphio-sim-lang-code">
  {activeScenario.toUpperCase()}
</div>
```

---

## 📅 예상 일정 및 기대 효과
* **작업 소요 시간**: 약 20분 내외 (단순 JSX 텍스트 치환, 시나리오 데이터 확장 및 모달 연결 조건 수정)
* **기대 효과**:
  - 실제 Mac 앱의 최신 정책과 랜딩 페이지 간의 정보 불일치(영어가 아닌 한국어도 무료로 작동함)를 즉시 해결하여 정보의 신뢰성 극대화.
  - 한국어 실시간 자막/번역 가상 데모를 추가 제공함으로써 국내 방문자의 다운로드 전환율(CTA) 및 체험 만족도를 획기적으로 상승.

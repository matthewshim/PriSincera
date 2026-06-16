# 📝 Sylphio 웹 소개 페이지(Landing Page) 팩트 및 정책 수정 계획서 (v2.0)

본 계획서는 macOS 데스크톱 앱의 최신 정책(**영어만 무료 작동, 한국어 포함 11개 다국어 및 AI 요약 보고서는 Pro Lifetime 라이선스 전용**)을 웹 소개 페이지에 정밀 반영하기 위한 가이드라인입니다.

가상 자막바 미리 체험하기 시뮬레이터를 실제 macOS 앱의 투명 HUD 디자인 및 2줄 적층 레이아웃과 동일하게 일치시키고, 일본어 시나리오 클릭 시 결제 팝업(Mock StoreKit 2)이 작동해 라이선스를 간접 구매해 볼 수 있는 인터랙티브 흐름을 설계했습니다.

---

## 🔍 수정 대상 파일 및 세부 계획

### 1. [SylphioLanding.jsx](file:///Users/shimks/Documents/문서 - kwang-sik의 MacBook Pro/PriSincera/www/src/pages/SylphioLanding.jsx)

#### ① 무료/프로 라이선스 비교 피처 텍스트 교정 (ko, en, ja)
* **한국어 (ko) 수정**:
  * `freeFeature1`: `"로컬 및 하이브리드 STT 무제한 작동"` ➔ `"영어(English) 음성 인식 및 기본 번역 무제한 지원"`
  * `freeFeature3`: `"Apple 내장 프레임워크 기반 기본 하이브리드 번역"` ➔ `"영어 전용 실시간 오프라인/하이브리드 번역 자막 제공"`
  * `proFeature1`: `"Free 티어의 모든 핵심 가치 포함"` ➔ `"12개 다국어(한국어, 일본어, 중국어 등) 잠금 전면 해제"`
* **영어 (en) 수정**:
  * `freeFeature1`: `"Unlimited Hybrid Local STT"` ➔ `"Unlimited English speech-to-text & basic translation"`
  * `freeFeature3`: `"Basic hybrid translation via Apple frameworks"` ➔ `"English-only real-time offline/hybrid translation subtitles"`
  * `proFeature1`: `"Includes all Free tier core benefits"` ➔ `"Unlock all 12 global languages (Korean, Japanese, etc.)"`
* **일본어 (ja) 수정**:
  * `freeFeature1`: `"ハイブリッドローカルSTTの無制限稼働"` ➔ `"英語(English)の音声認識および基本翻訳の無制限サポート"`
  * `freeFeature3`: `"Appleフレームワークベースの基本ハイブリッド翻訳"` ➔ `"英語専用のリアルタイム・オフライン/ハイブリッド翻訳字幕の提供"`
  * `proFeature1`: `"Freeティアのすべての価値を含む"` ➔ `"12の多言語（韓国語、日本語、中国語など）ロックを全面解除"`

---

#### ② 시뮬레이터 Pro 락다운 & 모의 결제창(Mock Paywall) 로직 연동

##### 🛠️ 추가되는 State 및 핸들러 로직
```javascript
// Pro 라이선스 구매 여부 모의 제어
const [isProUnlocked, setIsProUnlocked] = useState(false);
const [showMockPaywall, setShowMockPaywall] = useState(false);
const [isPurchasing, setIsPurchasing] = useState(false);
const [purchaseStatus, setPurchaseStatus] = useState("");
const [showSuccessCheck, setShowSuccessCheck] = useState(false);

// 시나리오 클릭 이벤트 헨들러 수정
const handlePlayScenario = (key) => {
  // 일본어 시나리오 클릭 시 Pro 라이선스가 잠겨있다면 결제 모달 팝업 가동
  if (key === 'jp' && !isProUnlocked) {
    setShowMockPaywall(true);
    return;
  }

  if (typingTimerRef.current) clearInterval(typingTimerRef.current);
  if (translateDelayTimerRef.current) clearTimeout(translateDelayTimerRef.current);
  if (translateTypingTimerRef.current) clearInterval(translateTypingTimerRef.current);
  
  setActiveScenario(key);
  setDisplayedSource("");
  setDisplayedTranslated("");
  setShowTranslated(false);
  setIsPlaying(true);
  
  const scenario = SCENARIOS[key];
  let sourceIdx = 0;
  
  typingTimerRef.current = setInterval(() => {
    if (sourceIdx < scenario.source.length) {
      setDisplayedSource((prev) => prev + scenario.source[sourceIdx]);
      sourceIdx++;
    } else {
      clearInterval(typingTimerRef.current);
    }
  }, 30);
  
  translateDelayTimerRef.current = setTimeout(() => {
    setShowTranslated(true);
    let transIdx = 0;
    
    translateTypingTimerRef.current = setInterval(() => {
      if (transIdx < scenario.translated.length) {
        setDisplayedTranslated((prev) => prev + scenario.translated[transIdx]);
        transIdx++;
      } else {
        clearInterval(translateTypingTimerRef.current);
        setIsPlaying(false);
      }
    }, 40);
  }, 1200);
};

// 결제 모사 핸들러 (StoreKit 2 구매 트랜잭션 흉내내기)
const handlePurchasePro = () => {
  setIsPurchasing(true);
  setPurchaseStatus(locale === 'ko' ? "App Store와 통신 중..." : locale === 'ja' ? "App Storeと通信中..." : "Communicating with App Store...");
  
  setTimeout(() => {
    setPurchaseStatus(locale === 'ko' ? "구매 성공! 감사합니다." : locale === 'ja' ? "購入成功！ありがとうございます。" : "Purchase successful! Thank you.");
    setIsPurchasing(false);
    setShowSuccessCheck(true);
    
    setTimeout(() => {
      setIsProUnlocked(true);
      setShowMockPaywall(false);
      setShowSuccessCheck(false);
      // 구매 즉시 잠겨있던 일본어 시나리오 자동 재생 가동
      handlePlayScenario('jp');
    }, 1500);
  }, 1500);
};
```

---

##### 🛠️ 가상 자막바 마크업 리팩토링 (macOS HUD 윈도우 스타일 구현)
```jsx
<div className="sylphio-simulator-box">
  {/* 상단 시나리오 버튼 제어부 (PRO 뱃지 보강) */}
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
      className={`btn-simulator ${activeScenario === 'jp' ? 'active' : ''}`}
      onClick={() => handlePlayScenario('jp')}
      disabled={isPlaying && activeScenario === 'jp'}
      id="btn-sim-japanese"
    >
      🇯🇵 Japanese Seminar ( Kenji )
      {!isProUnlocked && <span className="btn-sim-pro-badge">✨ PRO</span>}
    </button>
  </div>
  
  {/* 실제 데스크톱 앱과 100% 싱크 맞춘 HUD 윈도우 프레임 */}
  <div className="sylphio-virtual-window">
    <div className="sylphio-window-header">
      <div className="sylphio-window-traffic">
        <span className="dot red"></span>
        <span className="dot yellow"></span>
        <span className="dot green"></span>
      </div>
      <div className="sylphio-window-title">Sylphio Live Translator</div>
      <div className="sylphio-window-badges">
        <span className={`badge-tier ${isProUnlocked ? 'pro' : 'free'}`}>
          {isProUnlocked ? '✨ PRO' : 'FREE'}
        </span>
        <span className="badge-source">🎙️ {locale === 'ko' ? '내장 마이크' : locale === 'ja' ? '内蔵マイク' : 'Built-in Mic'}</span>
      </div>
    </div>
    
    <div className="sylphio-virtual-bar">
      {activeScenario ? (
        <div className="sylphio-sim-message-block">
          <div className="sylphio-sim-lang-code">
            {activeScenario === 'en' ? 'EN' : 'JA'}
          </div>
          
          <div className="sylphio-sim-text-stack">
            {/* 원문 출력 (반투명 백색) */}
            <p className="sylphio-sim-source">
              {displayedSource}
              {isPlaying && displayedSource.length < SCENARIOS[activeScenario].source.length && (
                <span className="sylphio-cursor-pulse">|</span>
              )}
            </p>
            
            {/* 번역문 출력 (링고민트 볼드) */}
            {showTranslated && (
              <p className="sylphio-sim-translated">
                {displayedTranslated}
                {isPlaying && displayedTranslated.length < SCENARIOS[activeScenario].translated.length && (
                  <span className="sylphio-cursor-pulse" style={{ color: '#10B981' }}>|</span>
                )}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="sylphio-virtual-bar-placeholder">
          {d.simPlaceholder}
        </div>
      )}
    </div>
  </div>
</div>

{/* 모의 결제 모달 Paywall */}
{showMockPaywall && (
  <div className="sylphio-mock-paywall-overlay">
    <div className="sylphio-mock-paywall-modal">
      <div className="paywall-close" onClick={() => setShowMockPaywall(false)}>✕</div>
      
      {showSuccessCheck ? (
        <div className="paywall-success-screen">
          <div className="success-checkmark">✓</div>
          <h3>{purchaseStatus}</h3>
        </div>
      ) : (
        <>
          <div className="paywall-header">
            <h2>✨ Sylphio Pro Lifetime ✨</h2>
            <p>{locale === 'ko' ? "평생 소장 라이선스로 모든 기능을 무제한 해제하세요." : "Unlock everything permanently with a lifetime license."}</p>
          </div>
          
          <div className="paywall-grid">
            <div className="paywall-item">🔒 ➔ 🔓 12개 다국어 전면 해제</div>
            <div className="paywall-item">🎨 자막 커스텀 그라데이션</div>
            <div className="paywall-item">📊 AI 요약 정밀 회의록 기능</div>
            <div className="paywall-item">⚙️ 고성능 AI 엔진 연동 (BYOK)</div>
          </div>
          
          <button 
            className="btn-paywall-purchase" 
            onClick={handlePurchasePro} 
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <span className="spinner"></span>
            ) : (
              <span>Sylphio Pro Lifetime 평생 소장하기 ($9.99)</span>
            )}
          </button>
          {isPurchasing && <p className="paywall-status">{purchaseStatus}</p>}
        </>
      )}
    </div>
  </div>
)}
```

---

### 2. [SylphioLanding.css](file:///Users/shimks/Documents/문서 - kwang-sik의 MacBook Pro/PriSincera/www/src/pages/SylphioLanding.css)

#### ① 실제 macOS HUD 윈도우 테마 디자인 규칙 신설
```css
/* macOS HUD Window Frame */
.sylphio-virtual-window {
  background: rgba(10, 12, 18, 0.8);
  border: 1.5px solid rgba(59, 130, 246, 0.25);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 
    0 12px 30px rgba(0, 0, 0, 0.5),
    0 0 1px rgba(255, 255, 255, 0.15);
  margin-top: 10px;
}

.sylphio-window-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1.0px solid rgba(255, 255, 255, 0.06);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* macOS Traffic lights */
.sylphio-window-traffic {
  display: flex;
  gap: 6px;
}
.sylphio-window-traffic .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.sylphio-window-traffic .dot.red { background: #ff5f56; }
.sylphio-window-traffic .dot.yellow { background: #ffbd2e; }
.sylphio-window-traffic .dot.green { background: #27c93f; }

.sylphio-window-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  font-family: var(--font-display);
  letter-spacing: 0.02em;
}

.sylphio-window-badges {
  display: flex;
  gap: 6px;
}

.badge-tier {
  font-size: 0.65rem;
  font-weight: 900;
  padding: 2.5px 6px;
  border-radius: 4px;
  color: white;
}
.badge-tier.free {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.65);
}
.badge-tier.pro {
  background: linear-gradient(135deg, #ffb800, #ff8a00);
  box-shadow: 0 2px 6px rgba(255, 138, 0, 0.3);
}

.badge-source {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2.5px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.55);
}

/* 2줄 적층 레이아웃 & 언어 태그 배지 */
.sylphio-sim-message-block {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.sylphio-sim-lang-code {
  font-size: 0.65rem;
  font-weight: 900;
  color: white;
  padding: 3px 6.5px;
  background: #3b82f6;
  border-radius: 5px;
  flex-shrink: 0;
  margin-top: 4px;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.35);
}

.sylphio-sim-text-stack {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sylphio-sim-source {
  font-size: 0.95rem; /* font scale match */
  font-weight: 600;
  color: rgba(255, 255, 255, 0.48); /* 48% dim text */
  margin: 0;
  line-height: 1.5;
}

.sylphio-sim-translated {
  font-size: 1.15rem; /* font scale scaleup */
  font-weight: 700;
  color: #10B981; /* lingoMint color */
  margin: 0;
  line-height: 1.5;
}

/* PRO 뱃지 스타일 */
.btn-sim-pro-badge {
  background: linear-gradient(135deg, #ffb800, #ff8a00);
  color: #050505;
  font-size: 0.58rem;
  font-weight: 900;
  padding: 1.5px 4px;
  border-radius: 3px;
  letter-spacing: 0.05em;
  margin-left: 4px;
}
```

---

#### ② 모의 결제창(Mock Paywall) 스타일링 신설
```css
/* Paywall Overlay */
.sylphio-mock-paywall-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.25s ease-out;
}

/* Paywall Modal */
.sylphio-mock-paywall-modal {
  background: #11131c;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  width: 90%;
  max-width: 480px;
  padding: 30px;
  border-radius: 20px;
  position: relative;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.paywall-close {
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 18px;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: color 0.2s;
}
.paywall-close:hover {
  color: white;
}

.paywall-header h2 {
  font-size: 1.6rem;
  font-weight: 900;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #3b82f6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.paywall-header p {
  color: #94a3b8;
  font-size: 0.85rem;
  margin: 0 0 24px 0;
}

.paywall-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}
.paywall-item {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  padding: 10px;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #e2e8f0;
  text-align: left;
}

.btn-paywall-purchase {
  width: 100%;
  background: #3b82f6;
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.btn-paywall-purchase:hover {
  background: #2563eb;
  transform: translateY(-1px);
}
.btn-paywall-purchase:active {
  transform: translateY(0);
}

.paywall-status {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 12px;
  margin-bottom: 0;
}

/* Success Screen */
.paywall-success-screen {
  padding: 20px 0;
}
.success-checkmark {
  width: 60px;
  height: 60px;
  background: rgba(16, 185, 129, 0.12);
  border: 1.5px solid #10B981;
  color: #10B981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  margin: 0 auto 16px;
  animation: popSuccess 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes popSuccess {
  from { transform: scale(0.6); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

import React from 'react';
import './SylphioApiKeyGuide.css';

export default function SylphioApiKeyGuide() {
  return (
    <div className="sylphio-guide">
      <div className="sylphio-guide-container">
        
        <div className="sylphio-guide-header">
          <h1>Sylphio API Key 연동 가이드</h1>
          <p className="sylphio-guide-subtitle">
            개인용 AI API Key를 실피오에 연동하여 월 고정 구독료 없이 최고의 AI 실시간 번역 및 회의록 요약 기능을 한계 없이 누려보세요.
          </p>
        </div>

        <div className="sylphio-guide-byok-note">
          <div className="sylphio-guide-byok-icon">🛡️</div>
          <div className="sylphio-guide-byok-content">
            <h4>BYOK (Bring Your Own Key) 아키텍처의 장점</h4>
            <p>
              Sylphio는 사용자 개인이 소유한 API Key를 직접 입력하는 안전한 방식(BYOK)을 사용합니다. 수집된 모든 오디오와 번역 텍스트는 개발사의 중개 서버를 전혀 거치지 않고 오직 사용자의 로컬 환경과 AI 제공사의 보안 API 엔드포인트 간에만 다이렉트로 전송되며, 저장된 키는 macOS의 최고 보안 금고인 <strong>Secure Keychain(키체인)</strong>에 암호화 보존됩니다.
            </p>
          </div>
        </div>

        {/* --- PART 1: Google Gemini --- */}
        <section className="sylphio-guide-section">
          <div className="sylphio-guide-section-title">
            <span className="sylphio-guide-section-badge gemini-badge">Highly Recommended</span>
            <h2>1. Google Gemini API Key 발급 프로세스 (무료 추천)</h2>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>
            Google Gemini는 대단히 뛰어난 번역 텍스트 이해도와 더불어 **압도적인 무료 혜택(Free Tier)**을 제공하여 실피오 사용 장벽을 극적으로 낮춰 줍니다.
          </p>

          <ol className="sylphio-guide-steps">
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">1</span>
              <span className="sylphio-guide-step-text">
                웹 브라우저를 열고 <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="sylphio-guide-step-link">Google AI Studio (aistudio.google.com)</a>에 접속하여 개인 구글 계정으로 로그인합니다.
              </span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">2</span>
              <span className="sylphio-guide-step-text">
                좌측 상단 사이드바 메뉴의 <strong>Get API key</strong> 버튼을 클릭합니다.
              </span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">3</span>
              <span className="sylphio-guide-step-text">
                화면 중앙의 <strong>Create API key</strong> 버튼을 클릭한 뒤, 나타나는 팝업에서 <strong>Create API key in new project</strong>를 클릭하여 키를 생성합니다.
              </span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">4</span>
              <span className="sylphio-guide-step-text">
                생성 완료 즉시 제공되는 복사 버튼을 눌러 <code>AIzaSy...</code>로 시작하는 고유 API Key 문자열을 메모장 등에 안전하게 복사하여 보관합니다.
              </span>
            </li>
          </ol>

          <div className="sylphio-guide-pricing-card">
            <div className="sylphio-guide-pricing-header">Gemini 요금제 및 무료 등급 가이드</div>
            <div className="sylphio-guide-pricing-list">
              <div className="sylphio-guide-pricing-item free">
                <h5>무료 버전 (Free Tier)</h5>
                <p>
                  <strong>비용: 100% 무료</strong>
                  <br />
                  지원 한도: 1분당 15회 요청(15 RPM), 1일 1,500회 요청.
                  <br />
                  실피오 번역은 1.5초 묵음 감지 시 단락마다 1회 요청하므로, 평범하게 대화 시 요금 결제 연동 없이도 실질적으로 <strong>무제한 무료 가동</strong>할 수 있습니다.
                </p>
              </div>
              <div className="sylphio-guide-pricing-item pay">
                <h5>유료 버전 (Pay-as-you-go)</h5>
                <p>
                  제한 없는 초고속 통역을 원할 경우 종량제를 선택 등록할 수 있습니다. 요금은 100만 토큰당 약 0.075달러(한화 약 100원) 수준으로 상상을 초월할 만큼 저렴합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- PART 2: OpenAI --- */}
        <section className="sylphio-guide-section">
          <div className="sylphio-guide-section-title">
            <span className="sylphio-guide-section-badge openai-badge">Pro Specialist</span>
            <h2>2. OpenAI API Key 발급 프로세스 (고성능 전문가용)</h2>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>
            OpenAI의 GPT-4o-mini 엔진은 뛰어난 언어 스위칭 정확성과 대화 요약 능력을 보장하며, 고속 응답성에 특화되어 있습니다.
          </p>

          <div className="sylphio-guide-warning-box">
            <span className="sylphio-guide-warning-icon">⚠️</span>
            <div className="sylphio-guide-warning-content">
              <h5>OpenAI 필수 유의사항: 결제 크레딧 사전 충전 (Prerequisite)</h5>
              <p>
                OpenAI는 구글과 달리 **무료 체험용 Credit이 비어있을 경우, Key를 생성하여 연동하더라도 인식을 개시하자마자 번역 에러(Quota Exceeded)를 반환**하며 작동하지 않습니다. 반드시 발급 전 최저 5달러($5)를 선충전해주셔야 작동합니다.
              </p>
            </div>
          </div>

          <ol className="sylphio-guide-steps">
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">1</span>
              <span className="sylphio-guide-step-text">
                <a href="https://platform.openai.com/" target="_blank" rel="noreferrer" className="sylphio-guide-step-link">OpenAI API Platform (platform.openai.com)</a>에 접속하여 가입 후 로그인합니다.
              </span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">2</span>
              <span className="sylphio-guide-step-text">
                좌측 내비게이션 바에서 열쇠 모양 아이콘인 <strong>API keys</strong> 메뉴를 선택합니다.
              </span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">3</span>
              <span className="sylphio-guide-step-text">
                화면 우측 상단의 <strong>+ Create new secret key</strong> 버튼을 클릭하고, 키의 이름을 입력한 뒤 생성합니다.
              </span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">4</span>
              <span className="sylphio-guide-step-text">
                생성된 <code>sk-proj-...</code> 비밀 키를 즉시 복사하여 보관합니다. (창을 닫은 후에는 키를 다시 확인할 수 없습니다.)
              </span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">5</span>
              <span className="sylphio-guide-step-text">
                좌측 메뉴의 <strong>Settings &gt; Billing</strong>으로 이동해 <strong>Add to balance</strong>를 클릭하여 **최소 5달러**의 해외결제 크레딧을 사전 결제 충전합니다.
              </span>
            </li>
          </ol>

          <div className="sylphio-guide-pricing-card">
            <div className="sylphio-guide-pricing-header">OpenAI (GPT-4o-mini) 요금제 정보</div>
            <div className="sylphio-guide-pricing-item" style={{ background: 'none', border: 'none', padding: 0 }}>
              <p>
                - 입력 토큰당 비용: \$0.150 / 1M tokens (100만 토큰당 약 200원)
                <br />
                - 출력 토큰당 비용: \$0.600 / 1M tokens (100만 토큰당 약 800원)
                <br />
                - 실시간 자막 통역 세션을 **한 시간 내내 쉬지 않고 가동하더라도 실제 소비되는 충전액은 약 5원 ~ 10원 미만** 수준으로 대단히 저렴합니다.
              </p>
            </div>
          </div>
        </section>

        {/* --- PART 3: App Integration --- */}
        <section className="sylphio-guide-section">
          <div className="sylphio-guide-section-title">
            <span className="sylphio-guide-section-badge app-badge">App Setup</span>
            <h2>3. Sylphio 앱 내 API Key 최종 연동 가이드</h2>
          </div>

          <ol className="sylphio-guide-steps" style={{ marginBottom: 0 }}>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">1</span>
              <span className="sylphio-guide-step-text">macOS에 단독 설치된 <strong>Sylphio.app</strong>을 기동합니다.</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">2</span>
              <span className="sylphio-guide-step-text">대기 화면 우측 상단의 <strong>설정 기어 버튼(⚙️)</strong>을 클릭하여 환경설정 창을 엽니다.</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">3</span>
              <span className="sylphio-guide-step-text">좌측 탭 메뉴에서 <strong>AI Engine (인공지능 번역 엔진)</strong>을 선택합니다.</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">4</span>
              <span className="sylphio-guide-step-text"><strong>AI PRO 실시간 통역 엔진 활성화</strong> 스위치를 <strong>ON(켬)</strong> 상태로 전환합니다.</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">5</span>
              <span className="sylphio-guide-step-text">유저가 선호하는 AI 엔진 플랫폼(Google Gemini 또는 OpenAI)을 선택합니다.</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">6</span>
              <span className="sylphio-guide-step-text">복사해 두었던 API Key 문자열을 붙여넣기(<code>CMD + V</code>) 합니다.</span>
            </li>
            <li className="sylphio-guide-step-item">
              <span className="sylphio-guide-step-number">7</span>
              <span className="sylphio-guide-step-text"><strong>API Key 연동 성공 및 활성화</strong> 표시를 확인한 뒤 설정창을 닫으면 다국어 자동 감지 및 실시간 번역 통역이 해제되어 완벽 가동됩니다!</span>
            </li>
          </ol>
        </section>

        {/* --- FAQ & Troubleshooting --- */}
        <section className="sylphio-guide-faq">
          <h3>🚨 긴급 장애 극복 및 트러블슈팅 (Troubleshooting)</h3>
          
          <div className="sylphio-guide-faq-item">
            <h5>Q1. "설정 ⚙️에서 AI 번역을 활성화하세요" 또는 "번역 에러" 가 계속 발생합니다.</h5>
            <p>
              - <strong>원인:</strong> 입력하신 API Key 내부에 불필요한 공백 문자나 줄바꿈(<code>\n</code>)이 섞여 들어갔거나, 키 자체가 유효하지 않을 때 발생합니다.
              <br />
              - <strong>해결법:</strong> 키 입력란을 완전히 비운 후, 메모장에 키를 붙여넣어 공백이 없는지 확인하고 다시 복사하여 깨끗하게 입력해 주십시오.
            </p>
          </div>

          <div className="sylphio-guide-faq-item">
            <h5>Q2. OpenAI Key를 넣었는데 계속 "Quota Exceeded" 에러가 뜹니다.</h5>
            <p>
              - <strong>원인:</strong> 사용 중인 OpenAI 플랫폼 계정에 사전 충전된 Balance(달러 크레딧)가 <code>0</code>인 상태이거나, 등록했던 카드 결제 정보가 만료되어 계정이 일시 잠금 상태일 때 발생합니다.
              <br />
              - <strong>해결법:</strong> platform.openai.com으로 이동하셔서 충전 잔액이 남아 있는지 재차 확인하시고 최소 5달러를 결제/충전해 두셔야 정상 가동됩니다.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}

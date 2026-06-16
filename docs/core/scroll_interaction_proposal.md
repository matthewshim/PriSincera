---
status: active
domain: Core
last_updated: 2026-06-16
version: v1.0
target_files:
  - src/pages/Home.jsx
  - src/styles/index.css
  - src/components/hero/StarField.jsx
  - src/components/philosophy/PhilosophySection.css
  - src/components/journey/JourneySection.css
  - src/components/work/WorkSection.css
  - src/components/connect/ConnectSection.css
---

# ☄️ 스크롤 인터랙션 디자인 강화 제안서 — 별똥별 모티브

본 제안서는 메인 페이지(`Home.jsx`)의 스크롤 및 호버 인터랙션 디자인 품질을 **"별똥별(Shooting Star)" 모티브**를 기반으로 강화하기 위한 구체적인 계획을 제시합니다. 미세한 마이크로 애니메이션과 천체 물리 기믹을 결합하여 사용자에게 프리미엄하고 역동적인 UX를 제공하는 것을 목표로 합니다.

## 📝 개정 이력 (Revision History)

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-16 | Antigravity | 최초 스크롤 인터랙션 디자인 품질 강화 제안서 작성 (별똥별 모티브) | Home, StarField, Section CSS |

---

## 🔍 사용자 검토 필요 사항

고품질의 마이크로 인터랙션을 위해 아래 제안들에 대한 검토 및 피드백을 요청드립니다.

> [!IMPORTANT]
> **1. 카드 테두리 빔 애니메이션 (별똥별 궤적)**
> 카드가 스크롤되어 화면에 나타날 때(Reveal), 카드의 테두리를 따라 밝은 스타라이트 광원 빔이 왼쪽 위에서 오른쪽 아래로 빠르게 흘러 지나가는 효과입니다. 호버 시에도 이 효과가 마우스의 방향이나 진입에 반응하여 재트리거됩니다.
> 
> **2. 타임라인 메테오 펄스 (Journey 섹션)**
> `Journey` 섹션의 연도를 잇는 수직 타임라인 라인을 따라, 사용자가 스크롤을 내릴 때마다 밝게 빛나는 에너지 펄스(별똥별)가 위에서 아래로 흐르는 동적 스크롤 인터랙션을 추가합니다.
> 
> **3. 3D 틸트 및 스타라이트 반사 효과**
> 카드를 호버할 때 카드가 마우스 포인터 방향으로 미세하게 3D 틸팅(기울기)되며, 카드 표면에 별빛이 비치는 듯한 부드러운 그라데이션 반사광(sheen)이 마우스 움직임을 동적으로 추적하도록 구현합니다.

---

## ❓ 해결 과제 및 의사결정 사항

> [!WARNING]
> **1. 별똥별 광원의 색상 규격**
> 카드의 별똥별 궤적 광원 색상을 각 섹션의 고유 액센트 컬러(Base: 골드, Builder's Log: 인디고, Daily Digest: 시안, Pace Note: 그린, Sylphio: 블루)에 맞추어 다채롭게 다변화할지, 아니면 단일한 스타라이트 크림 골드(`#E5B25D`)로 통일하여 일관성을 높일지 결정해야 합니다.
> * **추천안**: 섹션 아이덴티티 강화를 위해 카드는 고유 액센트 컬러를 따르되, 전역적인 타임라인 라인 등은 스타라이트 골드/실버 계열을 적용하여 전체적인 톤앤매너를 유지합니다.
> 
> **2. 모바일 환경 최적화 설계**
> 모바일 기기(<= 768px)에서의 부드러운 스크롤 성능(120Hz)을 보장하고 배터리 소모를 방지하기 위해, 모바일 뷰포트에서는 어두운 배경의 캔버스 별똥별 연산과 마우스 추적 렌즈 필터를 비활성화하고, GPU 가속을 활용하는 가벼운 CSS 기반 트랜지션으로 대체할지 여부입니다.
> * **추천안**: 모바일은 CSS 하드웨어 가속만을 사용하는 깔끔한 스크롤 Reveal 효과로 대체하여 고성능을 유지합니다.

---

## 🛠️ 컴포넌트별 변경 계획

인터랙션 강화 계획은 다음과 같은 형태로 코드 및 스타일시트에 반영될 예정입니다.

### 1. 전역 스타일 가이드 개편

#### [MODIFY] [index.css](file:///d:/prisincera/www/src/styles/index.css)
* 대각선 별똥별 흐름 애니메이션 키프레임(`@keyframes shooting-star-sweep`) 추가
* 타임라인 수직 라인 전용 그라데이션 흐름 키프레임(`@keyframes timeline-pulse-sweep`) 추가
* 마우스 움직임에 따른 카드 반사 좌표용 CSS Custom Properties 수용 설계

---

### 2. Philosophy (Belief) 섹션

#### [MODIFY] [PhilosophySection.css](file:///d:/prisincera/www/src/components/philosophy/PhilosophySection.css)
* `.concept-card` 내부에 절대 위치로 배치된 `::after` 유사 요소를 이용해, 스크롤 진입(`revealed`) 시 한 차례 빛이 쓸고 지나가는 효과 구현
* 호버 시 테두리 액센트 라인이 확장되며 내부 그라데이션 반사광이 강해지는 미세 인터랙션 정의

---

### 3. Journey (Timeline) 섹션

#### [MODIFY] [JourneySection.css](file:///d:/prisincera/www/src/components/journey/JourneySection.css)
* 수직 타임라인 라인에 그라데이션 광원을 중첩하여 메테오 펄스가 쓸고 내려가는 구조 스타일링
* 개별 `.milestone-card`가 나타날 때 단순 페이드인을 넘어, 우주 먼지가 모여 별이 되듯 미세한 번짐 효과와 함께 떠오르는 스케일 및 블러 애니메이션 병합

---

### 4. Work (Services) 섹션

#### [MODIFY] [WorkSection.css](file:///d:/prisincera/www/src/components/work/WorkSection.css)
* 다섯 개의 플래그십 카드(`.flagship-card`)가 스크롤 진입 시, 각자의 고유 색상을 지닌 굵직한 별똥별 궤적이 배경 오라(Aura)와 테두리 빔을 형성하는 강렬한 인터랙션 추가
* 목업 비주얼의 빛 구체(`.visual-blur-orb`)가 스크롤 깊이 및 호버 상태에 따라 유기적으로 반응하여 팽창/수축하도록 개선

---

### 5. Connect 섹션

#### [MODIFY] [ConnectSection.css](file:///d:/prisincera/www/src/components/connect/ConnectSection.css)
* 링크 카드(`.btn-primary`, `.btn-secondary`)에 우주 성운 질감의 은은한 메테오 라인이 대각선으로 흘러가도록 보완

---

### 6. 백경 성도 캔버스 최적화

#### [MODIFY] [StarField.jsx](file:///d:/prisincera/www/src/components/hero/StarField.jsx)
* 기존 `IntersectionObserver`가 Hero 영역 이탈 시 캔버스를 완전히 멈추던 방식을 개선하여 **"심우주 모드 (Ambient Deep Space Mode)"**로의 소프트 전환 구현:
  * Hero 이탈 시 FPS 제한(15~20fps)을 두어 CPU 점유율 최소화
  * 무거운 마우스 마그네틱 효과 및 HUD 좌표계 텍스트 렌더링 생략
  * 대신 뒤편에 희귀하고 은은한 별똥별 흐름을 잔잔히 지속하여 콘텐츠 영역 너머의 공간적 일관성 확보

---

## 🧠 메모리 누수 및 성능 최적화 기술 검토 (Memory & Performance Review)

인터랙션 고도화 과정에서 발생할 수 있는 메모리 누수(Memory Leak)와 가비지 컬렉션(GC) 병목을 예방하기 위해 아래의 기술적 제약 사항을 사전에 검토하고 구현에 반영합니다.

### 1. Canvas 자원 및 가비지 컬렉션(GC) 압박 최소화
* **문제 상황**: 브라우저 창 크기가 조절될 때마다 `resize()` 함수가 호출되어 성운 묘사용 오프스크린 캔버스(`offCanvas`)가 매번 새로 생성됩니다. 이는 단시간에 메모리 점유율을 급증시키고 가비지 컬렉터의 잦은 호출로 인한 화면 끊김(Jank) 현상을 유발합니다.
* **대비책**: 
  * `resize` 이벤트 핸들러에 **100ms 디바운스(Debounce)**를 적용하여 불필요한 연속 캔버스 재생성을 억제합니다.
  * 기존 생성된 오프스크린 캔버스의 레퍼런스를 명시적으로 해제(`offCanvas = null` 등)하여 가비지 컬렉션이 즉각적으로 자원을 회수할 수 있도록 돕습니다.

### 2. requestAnimationFrame(rAF) 루프 중첩 및 누수 방지
* **문제 상황**: 컴포넌트가 언마운트되거나 상태 변화로 인해 `useEffect`가 재실행될 때, 진행 중이던 `requestAnimationFrame` 루프가 확실하게 취소되지 않으면 백그라운드에서 좀비 루프가 병렬로 작동하여 CPU 사용량을 극대화시킵니다.
* **대비책**:
  * 애니메이션 루프의 핸들러 ID(`frameId`)를 클린업 단계에서 반드시 `cancelAnimationFrame(frameId)`을 통해 확실하게 취소(Unregister)합니다.
  * `StarField`가 "심우주 모드"로 전환될 때도 rAF 타이밍이 중복으로 제어되지 않도록 애니메이션 루프 가동 플래그(`isLooping`)를 단일 진실 공급원(Single Source of Truth)으로 철저하게 제어합니다.

### 3. 이벤트 리스너(Scroll, Mouse Move) 탈루 차단
* **문제 상황**: 3D 틸트나 마우스 추적 반사광 구현을 위해 DOM에 직접 바인딩한 `mousemove` 리스너나 타임라인 스크롤 연동을 위한 `scroll` 리스너가 컴포넌트 소멸 시 제거되지 않으면, 소멸된 DOM 객체의 레퍼런스가 메모리에 잔존하여 **Detached DOM Node** 누수가 발생합니다.
* **대비책**:
  * React 내부 컴포넌트 단에서는 최대한 React의 합성 이벤트(`onMouseMove`, `onMouseEnter`)를 활용하여 생명주기 관리를 React 엔진에 위임합니다.
  * `window` 객체에 직접 연결해야 하는 `scroll` 이벤트 리스너의 경우, 반드시 `useEffect` 클린업 함수에서 `removeEventListener`를 실행합니다.
  * 스크롤 이벤트에는 `{ passive: true }` 옵션을 강제하여 메인 스레드의 렌더링 블로킹을 우회합니다.

### 4. GPU Compositor 가속 극대화 (CSS-First)
* **문제 상황**: 자바스크립트 스레드에서 직접 카드의 스타일 속성을 매 프레임 수정하는 경우(예: Left/Top 좌표 계산), 브라우저의 리플로우(Reflow)와 리페인트(Repaint)가 반복적으로 유발되어 렌더링 파이프라인 병목이 생깁니다.
* **대비책**:
  * 카드 테두리 빔 애니메이션 등은 자바스크립트 연산 없이 CSS Keyframe과 GPU 가속 속성(`transform`, `opacity`, `filter`)만을 이용하여 브라우저의 Compositor 스레드에서 단독 처리되도록 구성합니다.
  * 3D 틸트와 같이 마우스 좌표 연동이 필수적인 경우에만 CSS Custom Properties(`--mouse-x`, `--mouse-y`) 값만 업데이트하고, 실제 기울기 연산은 CSS `transform: rotateX() rotateY()`에서 처리하도록 자바스크립트와 스타일 연산을 철저히 격리합니다.

---

## 🌐 크로스 브라우징 및 반응형 대응 검토 (Cross-Browsing & Responsiveness)

모든 브라우저와 디바이스 환경에서 일관되고 끊김 없는 사용자 경험을 보장하기 위해 크로스 브라우징 및 반응형 설계를 사전에 검토하고 설계에 반영합니다.

### 1. 크로스 브라우징 (Cross-Browsing) 기술 표준 적용
* **Safari 브라우저 지원 (Webkit 엔진)**:
  * 글라스모피즘 구현 시 필수적인 `backdrop-filter` 속성이 Safari 브라우저에서 올바르게 렌더링되도록 `-webkit-backdrop-filter` 공급자 접두사를 상시 중복 적용합니다.
  * Safari에서 3D 틸트 효과가 뭉개지거나 엘리먼트가 잘려 나가는 버그(Clipping)를 방지하기 위해, 카드 자체뿐만 아니라 부모 컨테이너에도 명시적인 `perspective(1000px)`를 부여하고 `transform-style: preserve-3d` 상속 계계를 정밀 정렬합니다.
* **Firefox 브라우저 성능 확보 (Gecko 엔진)**:
  * Firefox의 WebRender 엔진에서 대형 Canvas가 렌더링될 때 발생할 수 있는 레이턴시를 제어하기 위해, `StarField.jsx` 내의 미세 아기별 그리드(Stardust)를 색상/투명도 단위로 사전 그룹화(Batching)하여 렌더링 패스 횟수를 최소화합니다.
* **최신 CSS 스펙 한계 극복 (Scroll-driven Animations)**:
  * Chrome/Chromium 진영의 최신 CSS 스크롤 연동 스펙(`animation-timeline: scroll()`)은 현재 Safari 및 Firefox에서 표준 지원되지 않습니다.
  * 따라서 크로스 브라우저 호환성을 100% 확보하기 위해, 브라우저 표준 명세인 **`IntersectionObserver`** API를 사용하여 컴포넌트의 뷰포트 교차 상태를 감지하고 CSS 클래스(`.revealed`)를 토글하는 하이브리드 접근법을 고수합니다.

### 2. 디바이스 반응형 (Responsive) 레이아웃 최적화
* **데스크톱 환경 (Desktop, > 1024px)**:
  * 마우스 호버에 실시간 반응하는 3D 틸팅 및 스타라이트 반사 슬라이딩 효과를 전면 가동하여 풍부한 입체감을 제공합니다.
* **태블릿 환경 (Tablet, 769px ~ 1024px)**:
  * 2열 카드 그리드 배치로 레이아웃이 유동적으로 변형됩니다. 이때 가로 배열에 따른 시각적 엇갈림이 자연스럽도록 홀수/짝수 카드 인덱스에 따라 동적으로 계산되는 지연 시간(`--reveal-delay`) 규칙을 재정의합니다.
* **모바일 환경 (Mobile, <= 768px)**:
  * 모바일 기기 특성상 마우스 포인터가 없으며 터치 스크롤 중 카드 호버 효과가 강제로 활성화(Sticky Hover)되는 터치 부작용이 있습니다.
  * 따라서 모바일 해상도 진입 시 3D 틸트 및 마우스 추적 그라데이션 반사 효과는 **미디어 쿼리(`@media (hover: hover)`)**를 활용하여 자동으로 차단하고, 화면 터치 반응형 액티브 크기 축소(Haptic Active pressed scaling)와 깔끔한 스크롤 페이드/스케일 reveal로 스위칭합니다.
  * 모바일 뷰포트에서 가로 방향으로 스크롤되는 카드 그룹(`.concept-cards` 가로 슬라이더)의 가로 뷰포트 밖 reveal 타이밍이 끊기지 않도록 가로 방향 교차 검증 속성을 `useScrollReveal` 옵션에 조율 가능하게 설계합니다.

### 3. 접근성 지원 (Accessibility & Motion Sensitivity)
* **`prefers-reduced-motion: reduce` 운영체제 설정 대응**:
  * 운영체제 레벨에서 애니메이션 최소화를 요청한 사용자의 인지 및 시각적 건강(멀미 예방)을 보호하기 위해, 미디어 쿼리를 통해 화려한 별똥별 테두리 빔 애니메이션과 3D 틸트 모션을 비활성화하고 정적인 페이드인(`opacity` 변화)으로 자동 폴백합니다.

---

## 🧪 검증 및 성능 평가 계획

### 1. 스크롤 반응성 체크
* 모든 섹션 및 카드가 뷰포트 진입 시 엇갈림 딜레이(`--reveal-delay`) 규격을 지키며 별똥별 빔 효과가 어색함 없이 발현되는지 육안 확인
* 마우스 휠 및 모바일 터치 스크롤 도중 끊김 현상(Jank)이 발생하지 않는지 모니터링

### 2. 호버 3D 효과 피드백
* 데스크톱 브라우저에서 호버 진입/탈출 시 가속도(Easing) 곡선이 부드러운지 확인
* 마우스 좌표 연동에 따른 카드 반사광 이동 속도가 렉 없이 일치하는지 검증

### 3. 성능 프로파일링
* Chrome 개발자 도구의 Performance 탭을 활용하여 60FPS(또는 120Hz 모니터 표준)가 고르게 유지되는지 확인
* 메모리 누수 방지를 위한 Canvas 애니메이션 정지 타이밍 점검

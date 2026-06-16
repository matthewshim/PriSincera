---
status: active
domain: Core
last_updated: 2026-06-16
version: v1.3
target_files:
  - src/styles/index.css
  - src/hooks/useScrollProgress.js
  - src/hooks/useScrollReveal.js
  - src/components/hero/StarField.jsx
  - src/components/philosophy/PhilosophySection.css
  - src/components/journey/JourneySection.css
  - src/components/journey/JourneySection.jsx
  - src/components/work/WorkSection.css
  - src/components/work/WorkSection.jsx
  - src/components/connect/ConnectSection.css
  - src/components/connect/ConnectSection.jsx
---

# ☄️ 스크롤 인터랙션 디자인 강화 제안서 — 실시간 스크롤 연동 및 프리미엄 톤앤매너 고도화

본 제안서는 메인 페이지(`Home.jsx`)의 스크롤 및 호버 인터랙션 디자인 품질을 **"실시간 스크롤 연동(Scroll-linked Interactions)"** 및 **"미니멀 프리미엄(Restrained Premium)"** 톤앤매너를 기반으로 고도화하기 위한 구체적인 계획을 제시합니다. 인위적인 카드 레벨의 모션을 배제하고 우주 배경 공간의 천체 물리 현상과 글래스모피즘(Glassmorphism)의 굴절 특성을 활용하여 깊이감 있는 프리미엄 UX를 제공하는 것을 목표로 합니다.

## 📝 개정 이력 (Revision History)

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-06-16 | Antigravity | 최초 스크롤 인터랙션 디자인 품질 강화 제안서 작성 (별똥별 모티브) | Home, StarField, Section CSS |
| v1.1 | 2026-06-16 | Antigravity | 피드백 반영: 미니멀리스트 프리미엄 톤앤매너로 3D 틸트 각도 축소(2.2도) 및 별똥별 글레어 미세 조정, 타임라인 브리딩 전환 | Home, StarField, Section CSS |
| v1.2 | 2026-06-16 | Antigravity | 피드백 2차 반영: 요란한 카드 3D 효과 및 Sheen 전면 롤백, 배경 캔버스 별똥별 투과 연동, 스크롤 연동형 자기그림 타임라인 및 카드 포커스 스펙 고도화 | Home, StarField, Section CSS, Hooks |
| v1.3 | 2026-06-16 | Antigravity | 최종 피드백 반영: Hero/Connect의 텍스트 반짝임(Shimmer) 전면 삭제, SERVICES(Work) 카드의 테두리 광원 및 사선 쓸림 효과, 내부 모형 가속 애니메이션 삭제. 오직 카드의 미세한 스케일 업(1.025)과 타 카드 디밍을 활용한 심플 포커스 효과로 최종 정제 | Home, Hero, Connect, Work, CSS |


---

## 🔍 사용자 검토 필요 사항

고품질의 마이크로 인터랙션을 위해 반영된 디자인 핵심 사항입니다.

> [!IMPORTANT]
> **1. 플랫 글래스모피즘 카드로의 원복 및 정제**
> * 요란하게 흔들리는 카드 레벨의 3D 틸트 효과(`onMouseMove`, `onMouseLeave`)와 카드 내 대각선 그라데이션 반사광(sheen) 레이어를 전면 제거했습니다.
> * 호버 시에는 카드가 물리적으로 기울지 않고, 은은하고 세련된 테두리(border)의 하이라이트 투명도 변화와 은은한 그림자 팽창만을 유도하여 가독성과 톤앤매너의 안정성을 최우선으로 확보했습니다.
> 
> **2. 배경 캔버스 별똥별 투과 연동 (3D 레이어 깊이감)**
> * 카드가 스크롤되어 화면에 진입하는 순간(Reveal), 카드의 뷰포트 좌표와 고유 액센트 색상 정보가 글로벌 커스텀 이벤트(`trigger-shooting-star`)를 통해 뒷면의 별밭 배경 캔버스(`StarField.jsx`)로 전달됩니다.
> * 이에 따라 카드가 드러나는 시점에 맞추어 배경에서 별똥별이 떨어집니다. 별똥별의 흐름과 꼬리가 반투명 유리판(`backdrop-filter: blur`) 뒤를 지나가며 자연스럽게 굴절되고 디퓨즈(흐려짐)되어, 평면적인 카드에 기하학적인 입체 심도(Depth)를 제공합니다.
> 
> **3. 실시간 스크롤 연동 자기그림 타임라인 (Journey 섹션)**
> * Journey 섹션의 타임라인 선을 **배경의 연한 보조선(Opacity 0.05)**과 **실제 사용자가 스크롤한 만큼 자라나는 하이라이트 광원선**의 2중 구조로 변경합니다.
> * 사용자가 스크롤을 내릴 때마다 선이 실시간으로 발화하며 앞으로 전진하고(데스크톱은 가로, 모바일은 세로), 선이 마일스톤 점에 닿을 때 마일스톤 카드가 은은하게 스케일업 되며 불이 켜지는 세련된 인터랙션을 구현합니다.
> 
> **4. 스크롤 위치 기반 미니멀 카드 포커스 (Work 섹션)**
> * Work 섹션의 큰 플래그십 카드들이 뷰포트의 정중앙에 가까워질 때 활성화되는 심플 포커스 효과입니다.
> * 불필요하게 요란해 보일 수 있는 테두리 그라데이션 광원, 사선 빛 쓸림(Shimmer Sweep), 내부 아트워크의 속도 가속화 기믹을 전면 배제했습니다.
> * 대신, 화면 중앙에 들어선 활성 카드만 부드럽게 `scale(1.025)`로 확대되고 깊은 드롭 쉐도우를 입으며, 나머지 카드들은 `opacity: 0.45` 수준으로 차분히 디밍(Dimming)되어 사용자의 읽기 몰입감을 방해 없이 완성합니다.

---

## ❓ 해결 과제 및 의사결정 사항

> [!WARNING]
> **1. 별똥별 광원의 색상 규격**
> 배경 캔버스에서 연동되어 떨어지는 별똥별의 색상은 각 카드가 가지고 있는 고유한 아이덴티티 컬러(Base: 골드, Builder's Log: 인디고, Daily Digest: 시안, Pace Note: 그린, Sylphio: 블루)의 RGB 값으로 매칭되어, 시각적 일관성과 개성을 완성도 높게 전달합니다.
> 
> **2. 스크롤 연동 성능 최적화**
> 실시간 스크롤 트래킹 시 렌더링 스레드의 과부하를 예방하기 위해, React 렌더링 사이클 외부에서 CSS Custom Properties(`--scroll-progress`)를 조작하여 브라우저 GPU 가속을 유도합니다.

---

## 🛠️ 컴포넌트별 변경 계획

배경 별똥별 및 스크롤 연동 고도화 계획은 다음과 같이 코드 및 스타일시트에 반영되었습니다.

### 1. 전역 스타일 가이드 및 신규 훅 도입

#### [NEW] [useScrollProgress.js](file:///d:/prisincera/www/src/hooks/useScrollProgress.js)
* 특정 컴포넌트가 화면 내에서 차지하는 스크롤 비율(0 ~ 1)을 측정하는 커스텀 훅 정의
* 브라우저 스크롤 이벤트를 수신하되, CPU 스레드를 차단하지 않는 비동기 passive 리스너 바인딩 구성

#### [MODIFY] [index.css](file:///d:/prisincera/www/src/styles/index.css)
* 대각선 극세 별똥별 글레어 흐름 애니메이션 키프레임 및 `.shooting-star-sweep-wrap` CSS 클래스 전면 삭제

---

### 2. Philosophy (Belief) 섹션

#### [MODIFY] [ConceptCards.jsx](file:///d:/prisincera/www/src/components/philosophy/ConceptCards.jsx)
* 카드 내 마우스 호버 트래킹 이벤트 리스너 제거
* 각 카드에 `data-accent-color="229,178,93"` 등의 고유 RGB 값 속성 할당

#### [MODIFY] [PhilosophySection.css](file:///d:/prisincera/www/src/components/philosophy/PhilosophySection.css)
* 호버 시 3D 기울기 회전 및 마우스 추적 반사광 삭제, 은은한 테두리 광원 업데이트로 정제
* `cubic-bezier(0.16, 1, 0.3, 1)` (Expo Out) 부드러운 스크롤 페이드/슬라이딩 애니메이션 튜닝

---

### 3. Journey (Timeline) 섹션

#### [MODIFY] [JourneySection.jsx](file:///d:/prisincera/www/src/components/journey/JourneySection.jsx)
* `useScrollProgress` 훅을 바인딩하여 뷰포트 대비 스크롤 진척도를 계산하고 컨테이너의 CSS 변수(`--scroll-progress`)로 연동
* 타임라인 수직/수평 라인의 진행 상태가 특정 마일스톤 노드를 통과할 때, 노드에 `.active` 클래스를 추가하여 마일스톤 정보 카드 활성화

#### [MODIFY] [JourneySection.css](file:///d:/prisincera/www/src/components/journey/JourneySection.css)
* 타임라인 수직/수평 라인의 브리딩 펄스 애니메이션 삭제 및 단정하게 고정된 백그라운드 보조선 정의
* `--scroll-progress`에 맞춰 실시간으로 자라나는 `.timeline-progress` 게이지 물리 연동
* 마일스톤 호버 틸트 및 셰도우 그라데이션 반사광 삭제 및 액티브 점등식 전환 효과 적용

---

### 4. Work (Services) 섹션

#### [MODIFY] [WorkSection.jsx](file:///d:/prisincera/www/src/components/work/WorkSection.jsx)
* 5대 플래그십 카드가 화면 수직 중앙 영역을 통과할 때 이를 계산하는 스크롤 리스너 바인딩
* 가장 중앙에 근접한 카드 한 개에 `.active-focus` 클래스를 추가하고 나머지 카드는 흐리게 유지

#### [MODIFY] [WorkSection.css](file:///d:/prisincera/www/src/components/work/WorkSection.css)
* 활성화된 `.active-focus` 카드의 불투명도를 복구하고 `scale(1.025)`로 소폭 확대하며, 깊은 드롭 쉐도우를 입혀 주목도를 높였습니다. (불필요한 테두리 광원이나 빔 애니메이션, 내부 아트워크 속도 가속화 제거)
* 주변의 비활성화 카드는 옅은 가독성 디밍(`opacity: 0.45` 및 미세 스케일 다운)을 주어 스크롤에 따라 시선을 부드럽게 모읍니다.

---

### 5. Connect 섹션

#### [MODIFY] [ConnectSection.jsx](file:///d:/prisincera/www/src/components/connect/ConnectSection.jsx)
* 연락망 카드(`.connect-container`)에 `data-accent-color` 부여 및 `useScrollProgress` 연동

#### [MODIFY] [ConnectSection.css](file:///d:/prisincera/www/src/components/connect/ConnectSection.css)
* 하단 스크롤 도달 시 뒷면의 오라(Aura) 팽창 반경이 `--scroll-progress`와 직접 상호작용 하도록 반응형 튜닝

---

### 6. 스크롤 감지 훅 고도화

#### [MODIFY] [useScrollReveal.js](file:///d:/prisincera/www/src/hooks/useScrollReveal.js)
* 섹션이 스크롤되어 화면에 진입(`revealed`)할 때, 하위의 `data-accent-color` 속성을 지닌 카드들을 쿼리
* 카드의 스태거링 딜레이 시간(`--reveal-delay`)을 계산하여 정확한 밀리초 단위의 `setTimeout`을 연동, 캔버스 별똥별 생성 이벤트(`trigger-shooting-star`)를 순차적으로 발행

---

### 7. 백경 성도 캔버스 물리 통합

#### [MODIFY] [StarField.jsx](file:///d:/prisincera/www/src/components/hero/StarField.jsx)
* window 레벨에서 `trigger-shooting-star` 이벤트를 수신하는 리스너 설치
* 이벤트 수신 시 카드의 viewport 공간적 좌표 `(x, y)` 및 크기 값을 기준으로, 카드의 뒤쪽 궤적을 대각선으로 가로지르는 물리적 별똥별 객체 생성 및 렌더링 루프 연동
* 컴포넌트 소멸(unmount) 시 리스너 해제 보장

---

## 🧠 메모리 누수 및 성능 최적화 기술 검토 (Memory & Performance Review)

인터랙션 고도화 과정에서 발생할 수 있는 메모리 누수(Memory Leak)와 가비지 컬렉션(GC) 병목을 예방하기 위해 아래의 기술적 제약 사항을 사전에 검토하고 구현에 반영합니다.

### 1. Canvas 자원 및 가비지 컬렉션(GC) 압박 최소화
* **대비책**: 
  * `resize` 이벤트 핸들러에 **100ms 디바운스(Debounce)**를 적용하여 불필요한 연속 캔버스 재생성을 억제합니다.
  * 기존 생성된 오프스크린 캔버스의 레퍼런스를 명시적으로 해제(`offCanvas = null` 등)하여 가비지 컬렉터의 동작을 보조합니다.

### 2. requestAnimationFrame(rAF) 루프 중첩 및 누수 방지
* **대비책**:
  * 애니메이션 루프의 핸들러 ID(`frameId`)를 클린업 단계에서 반드시 `cancelAnimationFrame(frameId)`을 통해 확실하게 취소(Unregister)합니다.
  * 애니메이션 루프 가동 플래그(`isLooping`)를 단일 진실 공급원(Single Source of Truth)으로 제어합니다.

### 3. 이벤트 리스너(Scroll, Mouse Move) 탈루 차단
* **대비책**:
  * `window` 객체에 직접 연결해야 하는 실시간 스크롤 리스너의 경우, 반드시 `useEffect` 클린업 함수에서 `removeEventListener`를 실행합니다.
  * 스크롤 이벤트에는 `{ passive: true }` 옵션을 강제하여 메인 스레드의 렌더링 블로킹을 우회합니다.

### 4. GPU Compositor 가속 극대화 (CSS-First)
* **대비책**:
  * 카드 테두리 빔 애니메이션 등은 자바스크립트 연산 없이 CSS Keyframe과 GPU 가속 속성(`transform`, `opacity`, `filter`)만을 이용하여 브라우저의 Compositor 스레드에서 단독 처리되도록 구성합니다.
  * 실시간 스크롤 연동 시에도 자바스크립트로는 오직 CSS Custom Properties 값만 업데이트하고, 실제 렌더링 처리는 브라우저 Compositor에 일임하여 프레임 레이트 저하를 원천 방지합니다.

---

## 🌐 크로스 브라우징 및 반응형 대응 검토 (Cross-Browsing & Responsiveness)

모든 브라우저와 디바이스 환경에서 일관되고 끊김 없는 사용자 경험을 보장하기 위해 크로스 브라우징 및 반응형 설계를 사전에 검토하고 설계에 반영합니다.

### 1. 크로스 브라우징 (Cross-Browsing) 기술 표준 적용
* **Safari 브라우저 지원 (Webkit 엔진)**:
  * 글라스모피즘 구현 시 필수적인 `backdrop-filter` 속성이 Safari 브라우저에서 올바르게 렌더링되도록 `-webkit-backdrop-filter` 공급자 접두사를 상시 중복 적용합니다.
* **Firefox 브라우저 성능 확보 (Gecko 엔진)**:
  * Firefox의 WebRender 엔진에서 대형 Canvas가 렌더링될 때 발생할 수 있는 레이턴시를 제어하기 위해, `StarField.jsx` 내의 미세 아기별 그리드(Stardust)를 색상/투명도 단위로 사전 그룹화(Batching)하여 렌더링 패스 횟수를 최소화합니다.
* **최신 CSS 스펙 한계 극복 (Scroll-driven Animations)**:
  * Chrome/Chromium 진영의 최신 CSS 스크롤 연동 스펙(`animation-timeline: scroll()`)은 현재 Safari 및 Firefox에서 표준 지원되지 않습니다.
  * 따라서 크로스 브라우저 호환성을 100% 확보하기 위해, 브라우저 표준 명세인 **`IntersectionObserver`** 및 자바스크립트 스레드 바인딩 기반의 반응형 훅 방식을 혼용합니다.

### 2. 디바이스 반응형 (Responsive) 레이아웃 최적화
* **데스크톱 환경 (Desktop, > 1024px)**:
  * 마우스 호버 및 가로 정렬된 타임라인의 실시간 진행에 맞춰 성도 게이지가 부드럽게 증가합니다.
* **모바일 환경 (Mobile, <= 768px)**:
  * 모바일 진입 시 세로로 전환되는 타임라인 방향에 반응하여 가로 크기(`width`) 대신 세로 크기(`height`)가 아래로 자라나도록 반응형 분기 처리를 내장합니다.
  * 모바일 기기 특성상 마우스 포인터가 없으므로 불필요한 호버 하이라이트 처리를 자동으로 배제합니다.

### 3. 접근성 지원 (Accessibility & Motion Sensitivity)
* **`prefers-reduced-motion: reduce` 운영체제 설정 대응**:
  * 운영체제 레벨에서 애니메이션 최소화를 요청한 사용자의 인지 및 시각적 건강(멀미 예방)을 보호하기 위해, 미디어 쿼리를 통해 화려한 별똥별 테두리 빔 애니메이션과 3D 틸트 모션을 비활성화하고 정적인 페이드인(`opacity` 변화)으로 자동 폴백합니다.

---

## 🧪 검증 및 성능 평가 계획

### 1. 스크롤 반응성 체크
* 모든 섹션 및 카드가 뷰포트 진입 시 엇갈림 딜레이(`--reveal-delay`) 규격을 지키며 별똥별이 어색함 없이 백그라운드에서 교차하는지 확인
* 마우스 휠 및 모바일 터치 스크롤 도중 끊김 현상(Jank)이 발생하지 않는지 모니터링
* 타임라인 스크롤 진행선이 스크롤 속도를 유려하게 밀착 추종하는지 확인

### 2. 호버 3D 효과 피드백
* 데스크톱 브라우저에서 호버 진입/탈출 시 가속도(Easing) 곡선이 부드러운지 확인
* 포커스 카드와 비포커스 카드 간의 디밍 명암비가 가독성에 방해되지 않는 적정 감도로 유지되는지 검증

### 3. 성능 프로파일링
* Chrome 개발자 도구의 Performance 탭을 활용하여 60FPS(또는 120Hz 모니터 표준)가 고르게 유지되는지 확인
* 메모리 누수 방지를 위한 Canvas 애니메이션 정지 타이밍 점검

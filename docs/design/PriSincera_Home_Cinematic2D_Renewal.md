# PriSincera Hero: Cinematic 2D Renewal Plan (v2.1)

## 1. 개요 및 방향 수정 (Pivot Strategy)
최근 시도되었던 **3D WebGL (Three.js) 기반의 전면 개편은 하드웨어 호환성 및 렌더링 안정성(Context Lost Crash) 문제로 인해 공식적으로 백지화**되었습니다.

새로운 방향성은 **"가장 안정적인 기술(SVG + CSS + Framer Motion)을 극한으로 끌어올려 3D보다 더 고급스럽고 경이로운(World-class) 시각적 경험을 제공하는 것"**입니다. Apple, Linear, Vercel 등 글로벌 탑티어 서비스들이 채택하는 **High-Fidelity 2D Cinematic** 어프로치를 통해 메모리 누수나 크래시 없이 완벽한 퍼포먼스와 압도적인 디자인 퀄리티를 동시에 달성합니다.

---

## 2. 핵심 디자인 및 기술 개선안

### A. OLED True Black 바탕의 Volumetric Glow (체적광 효과)
기존의 단순한 보라색 배경(`--bg-void`)을 완전히 걷어내고, 무한한 깊이감을 주는 OLED True Black(`#000000` 또는 `#050505`)을 베이스로 사용합니다.
- **다중 CSS Radial Gradients:** 단일 그라데이션이 아닌 3~4겹의 부드러운 방사형 그라데이션을 겹쳐 빛이 번지는 듯한 깊이감 있는 우주 공간을 연출합니다.
- **성능:** WebGL 셰이더 연산 대비 GPU 메모리 점유율을 95% 이상 절감하면서도 더 깔끔한 화질을 보장합니다.

### B. SVG 별자리(Constellation)의 Cinematic Bloom 적용
기존 2D SVG 그래픽을 재사용하되, SVG `feGaussianBlur` 필터와 CSS `drop-shadow`를 정밀하게 결합하여 네온사인이 발광하는 듯한 프리미엄 빛 번짐(Bloom) 효과를 입힙니다.
- **크리스탈 노드(Nodes):** 선분이 교차하는 꼭짓점에 다이아몬드처럼 빛나는 섬광 효과 추가.
- **에너지 순환(Energy Circulation):** 기존처럼 불투명한 선이 돌아가는 것이 아니라, `mix-blend-mode: screen`을 활용하여 두 빛이 교차할 때 하얗게 타오르는 듯한 광학적 렌더링을 2D로 모사합니다.

### C. 초정밀 마이크로 인터랙션 (Framer Motion)
단순한 CSS Transition(`ease-out`)을 버리고, 스프링 물리학에 기반한 정밀한 마우스 반응형 인터랙션을 적용합니다.
- **Parallax Layering:** 별자리(Foreground), 우주 먼지(Midground), 오로라 빛(Background)의 마우스 트래킹 이동 속도를 각각 다르게 설정(Parallax)하여 실제 3D 공간에 있는 듯한 심도(Depth)를 창출합니다.
- **Magnetic Physics:** 사용자의 커서가 버튼이나 텍스트 근처로 갈 때 부드럽게 끌려가는 자성 효과 적용.

### D. Cinematic Typography (시네마틱 텍스트 렌더링)
메인 타이틀("Sincerity, Prioritized.")의 등장 방식을 영화 오프닝처럼 우아하게 개선합니다.
- **Blur-Reveal Animation:** 글자가 나타날 때 단순히 투명도(Opacity)만 조절하는 것이 아니라, `filter: blur(10px)`에서 점차 또렷해지는 블러 페이드인(Blur Fade-in) 효과를 도입.
- **Sub-pixel 렌더링:** 텍스트에 미세한 텍스트 섀도우를 추가하여 유리판에 글씨가 새겨진 듯한 양각/음각 효과 부여.

---

## 3. 디자인 시스템 2.1 통합 (하위 페이지 확장을 위한 재검토)
이러한 Cinematic 2D 기법은 메인 페이지뿐만 아니라, **모든 하위 서비스(Admin, PaceNote, DailyDigest)의 카드 UI와 모달**에도 동일한 문법으로 적용되어야 합니다.

- **Glassmorphism 2.1:** 기존의 뿌연 블러(blur 12px)에서 탈피하고, `backdrop-filter: blur(24px)`와 1px의 투명한 화이트 보더라인(Border-line) 조명 효과를 결합하여 **가볍고 투명한 유리 질감** 확립.
- **Shadow System:** 짙고 탁한 그림자를 없애고, 투명도가 높은 다중 그림자(Multi-layered Shadows)로 카드 컴포넌트가 화면에서 살짝 떠 있는 듯한 플로팅(Floating) 감각 극대화.

---

## 4. 진행 단계 (Action Plan)

1. **Phase 1: Cinematic Hero SVG Upgrade (현재 최우선)**
   - `StarField.jsx`, `ConstellationAssembly.jsx`, `EnergyCirculation.jsx`의 SVG 필터 및 색상 코드 업그레이드.
   - OLED Black 배경 및 다중 방사형 그라데이션(`HeroSection.css`) 전면 교체.
2. **Phase 2: Physics & Parallax Interaction**
   - 기존의 끊기는 CSS 트랜지션을 폐기하고 마우스 트래킹에 물리 엔진(Spring) 기반 Parallax 적용.
   - 텍스트 Blur-Reveal 타이밍 조율.
3. **Phase 3: Design System 2.1 Synchronization**
   - 확립된 Cinematic 2.1 문법을 `index.css`의 `.premium-card` 전역 클래스로 정의.
   - 모든 하위 페이지(Admin, PaceNote 등)에 일괄 동기화하여 완벽한 통일성 구축.

> **결론:** 무겁고 불안정한 3D WebGL을 완전히 버리고, 현존하는 가장 우아하고 가벼운 2D 합성 기술의 극치를 보여줌으로써 사용자가 기대하는 "업계 최고 품질의 감동"을 안전하게 전달합니다.

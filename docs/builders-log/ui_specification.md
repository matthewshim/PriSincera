---
status: active
domain: BuildersLog
last_updated: 2026-08-05
version: v1.3
target_files:
  - src/pages/BuildersLog.jsx
  - src/pages/BuildersLog.css
  - src/pages/BuildersLogDetail.jsx
  - src/pages/BuildersLogDetail.css
---

# 📐 Builder's Log UI 명세서

본 명세서는 `Builder's Log` 콘텐츠 목록이 가지는 탐색 편의성과 시각적 밀도를 최상으로 끌어올리기 위한 프론트엔드 UI/UX 설계 지침입니다. 최신 포스트의 시인성 확보와 하위 포스트의 높은 인지 효율을 동시에 달성하기 위한 레이아웃, 반응형 중단점, 그리고 정교한 마이크로 인터랙션 사양을 규정합니다.

---

## 📝 Revision History

| Version | Date | Author | Description | Impact Area |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 2026-05-21 | AI Agent | Builder's Log 목록 카드 UI/UX 및 반응형 그리드 명세 정의 | BuildersLog.jsx, BuildersLog.css |
| v1.1 | 2026-07-22 | AI Agent | §5 인터랙션 현행화 — v4.5 JS 3D Tilt 이관 반영, `prefers-reduced-motion` 가드·`:focus-visible` 키보드 패리티 규정, 폐기된 호버 커밋 패널 잔재 CSS 정리 | BuildersLog.jsx, BuildersLog.css |
| v1.2 | 2026-07-22 | AI Agent | 상세 헤더 뒤로가기 `← Builder's Log` → 위치 경로 브레드크럼 `Builder's Log › 아티클`(로케일 대응, [design_system §9-9](../core/design_system.md)) — 리런 아카이브와 상세 내비 문법 통일 | BuildersLogDetail.jsx, BuildersLogDetail.css |
| v1.3 | 2026-08-05 | AI Agent | **§6 상세 페이지 2단 레이아웃 신설** — 브레드크럼 전폭(1200)·본문 860 좌측·사이드바 300(TOC 스크롤스파이 主 + 다른 챕터 副, sticky)·1100px 이하 붕괴. §5 호버 물리 v5.14 절제(3D 틸트 제거·CSS 부유) 현행화 (오너 "상세 뷰 좁음" QA 환류) | BuildersLogDetail.jsx, BuildersLogDetail.css, 언어팩 3종 |

---

## 1. 개요 및 설계 목적
*   **As-Is 한계**: 과도하게 거대했던 최상단 Featured 카드(`span 12`, 세로 600px+)로 인해 뷰포트 내 하위 포스트의 인지율이 급격히 저하되었습니다. 또한, 비대칭 Bento Grid(`12->7->5->5->7`)가 높이 불일치 현상과 스캔 피로를 가중시켰습니다.
*   **To-Be 목적**: 최상단 Featured 포스트의 세로 높이를 절반 수준(`350px` 내외)으로 압축하여 첫 화면에서 후속 아티클들을 즉각 탐색할 수 있도록 유도하고, 균등 2열 Grid를 통해 시선의 동선을 안정화합니다.

---

## 2. 레이아웃 구조 명세 (Layout Specifications)

### 2.1. 최상단 Featured 포스트 (Horizontal Split)
*   **구조**: 12컬럼 전체 폭을 유지하되, 내부 콘텐츠를 **좌측 60%(텍스트 및 메타 영역)**와 **우측 40%(비주얼 및 메타 서머리 영역)**로 가로 분할(Flex/Grid)하여 구성합니다.
*   **구현 제안**:
    *   **좌측 (Text Block)**: 챕터 배지(Chapter Badge), 메인 타이틀, 요약글(Description), 태그 칩을 배치하여 명독성을 강화합니다.
    *   **우측 (Visual Block)**: 아티클 고유의 액센트 컬러(`chapter.accent`)를 은은하게 투영하는 대형 Radial Glow 백그라운드와 기사의 핵심 메타 요약(리딩 타임, 업데이트 일자 등)을 시각적으로 단정하게 렌더링합니다.
*   **세로폭 상한**: 최대 `380px`를 넘지 않도록 세로 여백 및 폰트 크기를 통제합니다.

### 2.2. 하위 포스트 (Equal 2-Column Grid)
*   **구조**: 데스크톱 해상도(`1024px` 이상) 기준 완벽히 대칭을 이루는 **균등 2열 Grid (`grid-column: span 6`)** 레이아웃을 도입합니다.
*   **가변 높이 정돈 (Equal Height)**: 각 카드가 텍스트 길이에 관계없이 동일한 가로/세로 비율과 높이를 가지도록 `display: flex; flex-direction: column;` 및 `height: 100%` 구조를 고수합니다.

---

## 3. 정보 계층화 및 메타데이터 (Information Architecture)

```
[ 기존 포스트 카드 (As-Is) ]
+------------------------------------+
| Chapter Badge, Title, Subtitle     |
| ---------------------------------- |
| Long Description Text              |
| ---------------------------------- |
| Key Shipments (Full Commits Timeline)| -> 카드 높이를 무한정 늘리는 주범
| Show More Toggle Button            |
+------------------------------------+

[ 개선된 포스트 카드 (To-Be) ]
+------------------------------------+
| Chapter Badge, Title, Subtitle     |
| ---------------------------------- |
| Long Description Text              |
| ---------------------------------- |
| Tags Chips (Tag1, Tag2)            | -> 메타데이터 강화 및 밀도 향상
| Read Time (5 min) / Views (120+)   |
+------------------------------------+
* 커밋 리스트는 마우스 호버(Hover) 시에만 나타나는 드롭다운/슬라이드 형태 또는
  상세 페이지 내부로 완전히 이관하여 목록을 깔끔하게 유지합니다.
```

*   **정보 다이어트 (Timeline Reduction)**: 카드 목록에 노출되던 복잡하고 무거운 `commits` 타임라인 리스트를 기본 상태에서는 과감히 제거하여 카드의 수직 길이를 축소합니다.
*   **메타데이터 보강**: 기술 블로그 및 빌더 저널에 대한 독자의 신뢰도를 높이고 클릭률을 향상시키기 위해 다음 요소를 하단 영역에 정교하게 추가합니다.
    *   **태그 칩 (Tag Chips)**: 챕터의 핵심 기술 및 도메인 태그 노출 (`chapter.tags` 바인딩).
    *   **조회수 (Views)** 및 **기사 분량 (Read Time)**: "읽는 시간"을 텍스트 길이 기준으로 자동 산정하거나 메타데이터화하여 카드 하단 꼬리말(Footer)에 단정하게 배치.

---

## 4. 반응형 멀티 디바이스 대응 스펙 (Multi-Device Responsive Spec)

모든 크기의 디바이스에서 막힘없는 탐색 경험(F-Shape Scan)을 보장하기 위해 3단계 디바이스 중단점을 엄격하게 준수합니다.

### 4.1. 데스크톱 (`1024px` 이상)
*   **그리드**: Featured 포스트 가로 분할 2열 배치 / 하위 포스트 균등 `2-Column Grid`.
*   **여백**: 카드 패딩 `24px`.
*   **타이틀 폰트**: Featured 타이틀 `2.2rem`, 일반 포스트 타이틀 `1.8rem`.

### 4.2. 태블릿 (`768px` ~ `1023px` - iPad 등)
*   **Featured**: 가로폭 부족으로 Split 레이아웃을 해제하고 **세로형 1열 구조**로 자동 롤오버(Roll-over) 전환. 우측의 대형 비주얼 데코 블록은 숨겨 세로폭 증가를 최소화.
*   **하위 포스트**: 가독성 확보를 위해 균등 `2-Column Grid`를 고수하되, 카드 패딩을 `20px`로 다이어트하고 폰트 크기를 `1.5rem` 내외로 축소 조절.

### 4.3. 모바일 (`767px` 이하 - 스마트폰)
*   **그리드**: 전체 포스트 **1열 단일 리스트 배치(Single Column Layout)**로 전면 전환.
*   **여백**: 카드 내부 패딩을 `16px`로 극한으로 압축하여 가로 뷰포트 공간의 낭비를 제거.
*   **Line-Clamp (텍스트 길이 제어)**: 모바일 스크롤 지옥(Scroll Fatigue)을 원천 해결하기 위해 요약글(Description)의 높이를 **최대 2줄**로 제한하고 말줄임 처리합니다 (`display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;`).
*   **폰트**: Featured 타이틀 `1.4rem`, 일반 포스트 타이틀 `1.2rem`으로 스케일다운 적용.

---

## 5. 비주얼 및 인터랙션 디자인 (Visuals & Interactions)

*   **Glassmorphism 2.0**: 불필요한 백그라운드 명도를 걷어내고, 초저명도 백그라운드(`rgba(255, 255, 255, 0.01)`)와 하이 블러(`backdrop-filter: blur(32px)`)를 조합하여 미니멀하고 단정한 유리 질감을 연출합니다.
*   **Radial Glow Border**: 마우스를 카드 위에 올렸을 때(Hover), 액센트 컬러(`chapter.accent`)가 테두리를 따라 부드럽게 감싸는 그라데이션 보더 효과를 적용하여 생동감을 불어넣습니다.
*   **Hover 물리 (v5.14 절제 — 3D 틸트 제거)**: 마우스 추적 3D 틸트·scale는 **제거**했습니다(홈 플래그십 Chapter 11과 동일 절제 철학, [design_system §6-3](../core/design_system.md)). 호버는 **CSS `translateY(-2px)` 부유 + 액센트 보더 + 은은한 글로우(opacity 0.08)** 로만 구성하고, "Read Article →" 화살표는 `x: 4px` 밀림을 유지합니다.
*   **접근성 가드 (필수)**:
    *   **모션 민감**: 호버가 CSS 전용이므로 전역 `prefers-reduced-motion` 킬 스위치가 자동 처리합니다(JS 인라인 transform 없음 → 별도 JS 가드 불필요, §6-3).
    *   **키보드 패리티**: 카드 전체가 단일 `<Link>`이므로, 호버 표면 피드백(부유·액센트 보더·배경·그림자)을 `:focus-visible`에 미러링하고 가시 포커스 링을 병행합니다 (디자인 시스템 §9-3).
*   **폐기 이력**: 카드 하단 확장형 호버 커밋 패널(`.card-hover-commits-panel`)은 정적 인라인 Shipments 패널로 대체되어 폐기되었습니다. 관련 잔재 CSS는 2026-07-22 정리 완료. featured 카드 배포 패널 뒤 글로우 스피어(`.visual-glow-sphere`)는 유리 패널 배경을 얼룩지게 해 2026-08-05 제거(패널은 `--glass-bg` 균일 재질).

---

## 6. 상세 페이지 레이아웃 (Article Detail — `/builders-log/:slug`)

장문 아티클의 **가독성(860 프로스 단)** 과 **넓은 지면 활용(1200 셸)** 을 동시에 달성하기 위한 2단 레이아웃입니다. (오너 QA 환류 2026-08-05 — "상세 뷰가 상대적으로 좁다": 셸 1200인데 헤더·본문·푸터를 모두 860으로 묶어 지면이 답답했음)

*   **폭 구조** ([design_system §3-3](../core/design_system.md) 규칙 2 정합):
    *   **브레드크럼**: 셸 **전폭(1200)** — 프로스가 아니므로 가독 단 제한 없음.
    *   **본문 `.detail-main`(헤더·마크다운·푸터)**: **860(`--measure`) 좌측 정렬** — 장문 프로스 가독 폭 유지.
    *   **사이드바 `.detail-aside`**: 남는 **300px**(셸 1200 − 본문 860 − 갭 40) 우측 배치.
*   **사이드바 구성 (목차 主 · 다른 챕터 副)**:
    *   **목차(TOC)**: 본문 마크다운 H2/H3를 파싱(코드펜스 제외)해 앵커 리스트 생성. 렌더 시 헤딩에 `id` 주입(무의존 slugify — 한글·CJK 보존), `IntersectionObserver` 스크롤스파이로 현재 섹션 액센트 활성화. 클릭 시 `scroll-margin-top: 100px`로 GNB 가림 방지.
    *   **다른 챕터**: `buildersLogMeta.json`에서 현재 글 제외 최근 6개(신규 API 0). 교차 탐색은 본문 하단 "다른 여정 살펴보기"와 역할 분리(사이드바=상시 점프, 하단=완독 후 제안).
    *   **sticky**: `position: sticky; top: 100px`로 스크롤 내내 고정(짧은 사이드바가 밀려 여백이 비는 것 방지). `max-height: calc(100vh - 120px)` 내부 스크롤.
*   **반응형 붕괴**: `max-width: 1100px` 이하에서 사이드바 **숨김**, 본문은 860 **중앙 복귀**. (860+40+300이 안 들어가는 폭)
*   **설계 근거**: 다른 *글* 카드를 상시 노출하면 몰입 독서를 흩뜨리므로, 사이드바 주력은 *이 글*의 목차로 두어 넓이 문제 해소와 읽기 보조를 동시 달성.

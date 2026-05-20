# PriSincera: 모바일 GNB 네비게이션 개선 (Hamburger Menu UX)

## 1. 개요 및 배경 (Overview & Background)
현재 PriSincera 데스크탑 GNB(Global Navigation Bar)는 `PriSincera(로고)`, `Home`, `PriSignal`, `PriStudy` 등의 메뉴 항목이 가로로 나열되어 있습니다. 
하지만 모바일 기기와 같이 가로가 좁은 해상도에서는 메뉴 항목들이 서로 좁게 배치되거나 로고와 겹쳐서 클릭(터치)이 어려운 사용성 이슈가 확인되었습니다.

이를 해결하기 위해 **모바일 환경 전용 햄버거 메뉴(Hamburger Menu) 및 전체화면 오버레이 네비게이션**을 도입하여 UI/UX를 쾌적하게 개선하는 것이 목표입니다.

---

## 2. 작업 목표 (Objectives)
1. **반응형 헤더:** 화면 폭 `768px` 이하의 모바일 환경에서 기존 가로 메뉴를 숨기고 직관적인 헤더 UI(로고 + 햄버거 아이콘) 제공.
2. **오버레이 팝업:** 햄버거 아이콘(☰)을 터치 시 전체화면을 부드럽게 덮는 모바일 네비게이션 구현.
3. **편의성 향상:** 큼직한 메뉴 텍스트와 넓은 터치 영역을 확보하여 오작동 없는 모바일 사용 경험 보장.

---

## 3. 세부 구현 계획 (Implementation Plan)

### Phase 1: `Header.jsx` 컴포넌트 로직 추가
- 네비게이션 오픈 상태를 관리할 `[isMobileMenuOpen, setIsMobileMenuOpen]` State 추가.
- 모바일 해상도에서만 렌더링될 햄버거 버튼(☰) 및 닫기 버튼(✕) SVG 아이콘 마크업 추가.
- `react-router-dom`의 `useLocation`을 활용하여 페이지(경로) 이동 시 모바일 메뉴가 자동으로 닫히도록 Effect 연동.

### Phase 2: Mobile Overlay UI 설계 (`Header.css`)
- `@media (max-width: 768px)` 미디어 쿼리를 추가하여 기존 데스크탑 `.nav-links`를 `display: none;` 처리.
- 팝업 형태로 등장할 `.mobile-nav-overlay` 스타일 정의
  - 화면 전체(`100vw`, `100vh`)를 덮는 다크/블러 배경(`backdrop-filter: blur()`).
  - 모바일 메뉴 항목들은 세로형(Flex Column)으로 배치하고, 각 항목의 간격(Gap)과 폰트 사이즈를 키워 터치 반경 극대화.
- 메뉴 오픈 시 애니메이션(Fade-in / Slide-down 등) 추가로 고급스러운 느낌 연출.

### Phase 3: UX 및 인터랙션 보완
- **자동 닫힘 (Auto Close):** 메뉴 팝업 안에서 링크(예: `PriSignal`, `PriStudy`) 클릭 시 자동으로 오버레이 메뉴 닫힘 처리.
- **배경 스크롤 방지 (Scroll Lock):** 모바일 오버레이 메뉴가 열려 있을 때는 `document.body`에 `overflow: hidden` 클래스를 부여하여 뒤쪽 페이지가 위아래로 스크롤되지 않도록 제어.

---

## 4. 참고 파일 (Target Files)
- **대상 컴포넌트:** `src/components/layout/Header.jsx`
- **대상 스타일시트:** `src/styles/layout.css` 또는 `src/components/layout/Header.css` (GNB 스타일이 정의된 파일)
- **디자인 가이드:** `docs/design/PriSincera_DesignSystem.md`

---

## 5. Next Steps
다음 작업 세션에서 본 문서를 인계받은 작업자(개발자 또는 AI 에이전트)는 본 명세서를 바탕으로 즉시 코드 작성을 시작하십시오. 구현 완료 후, 크롬 개발자 도구를 열고 모바일 해상도(Mobile View)에서 화면을 테스트하여 터치 영역 및 애니메이션이 설계대로 잘 작동하는지 최종 확인한 뒤 Git Commit을 진행하시면 됩니다.

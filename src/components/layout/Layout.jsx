import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * [D-3 결정 — 2026-11-01] TelescopeCursor를 전역 레이아웃에서 제거했다.
 * 삭제가 아니라 **스코프 한정**이다 — 홈(Home.jsx)에서만 마운트한다.
 *
 * 전역 마운트는 html에 `cursor: none !important`를 걸어 **모든 지면**에서
 * I-beam(텍스트 선택 가능 신호)과 pointer(링크 신호)를 지웠다. 장문 아티클
 * (Builder's Log 상세·Planner's View·정책 지면)에서 특히 해롭다.
 * 또 망원경 모티브가 참조하는 `#starConstellation`은 홈 히어로에만 있어,
 * 다른 지면에서는 기능 없는 금색 레티클만 남는 상태였다.
 * 근거: ai_pattern_audit.md §2-4 D4
 */
function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default Layout;

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Shared mouse position hook with smooth lerp tracking.
 * Used by TelescopeCursor and StarField for coordinated interactions.
 */
export default function useMousePosition() {
  const [position, setPosition] = useState({ x: -200, y: -200 });
  const targetRef = useRef({ x: -200, y: -200 });
  const smoothRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef(null);

  const onMove = useCallback((e) => {
    targetRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  /* 터치 지원 — 별자리 렌즈·상세는 포인터 위치로만 열려서 터치 기기에서는 볼 방법이 없었다.
     탭한 지점을 포인터로 삼으면 기존 로직이 그대로 동작한다. 빈 하늘을 탭하면 아무 별자리도
     가깝지 않아 자연히 해제된다 — 별도 해제 처리가 필요 없다.
     `TelescopeCursor`는 `pointer: coarse`에서 이미 꺼져 있어 영향받지 않는다. */
  const onTouch = useCallback((e) => {
    if (e.pointerType !== 'touch') return;
    targetRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onLeave = useCallback(() => {
    targetRef.current = { x: -200, y: -200 };
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('pointerdown', onTouch, { passive: true });

    function animate() {
      const s = smoothRef.current;
      const t = targetRef.current;
      s.x += (t.x - s.x) * 0.12;
      s.y += (t.y - s.y) * 0.12;
      setPosition({ x: s.x, y: s.y });
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('pointerdown', onTouch);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onMove, onLeave, onTouch]);

  return { smooth: position, raw: targetRef };
}

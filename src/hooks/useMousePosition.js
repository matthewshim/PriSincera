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

  const onLeave = useCallback(() => {
    targetRef.current = { x: -200, y: -200 };
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onMove, onLeave]);

  return { smooth: position, raw: targetRef };
}

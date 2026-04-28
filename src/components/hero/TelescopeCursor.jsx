import { useRef, useEffect } from 'react';
import './TelescopeCursor.css';

/**
 * Telescope cursor — compact golden reticle that follows the mouse.
 * Optimised: no React state in animation loop, RAF-only positioning,
 * classList mutations instead of setState, passive listeners.
 */
export default function TelescopeCursor() {
  const cursorRef = useRef(null);
  const infoRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    /* ── Pointer coordinates ── */
    let targetX = -200, targetY = -200;
    let curX = -200, curY = -200;

    /* ── Cached constellation rect (refreshed sparingly) ── */
    let stageRect = null;
    let stageCenter = { x: 0, y: 0 };
    let stageThreshold = 0;
    let rectTick = 0;

    function refreshStageRect() {
      const stage = document.getElementById('starConstellation');
      if (stage) {
        stageRect = stage.getBoundingClientRect();
        stageCenter.x = stageRect.left + stageRect.width / 2;
        stageCenter.y = stageRect.top + stageRect.height / 2;
        stageThreshold = stageRect.width * 0.7;
      }
    }

    /* ── Event handlers ── */
    function onMove(e) { targetX = e.clientX; targetY = e.clientY; }
    function onLeave() { cursor.classList.remove('visible'); targetX = -200; targetY = -200; }
    function onEnter() { cursor.classList.add('visible'); }
    function onOver(e) {
      if (e.target.closest('a, button, input, textarea, select, label, [role="button"], [tabindex]')) {
        cursor.classList.add('hovering-interactive');
      }
    }
    function onOut(e) {
      if (e.target.closest('a, button, input, textarea, select, label, [role="button"], [tabindex]')) {
        cursor.classList.remove('hovering-interactive');
      }
    }

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseout', onOut, { passive: true });

    /* ── Show after short delay ── */
    const timer = setTimeout(() => cursor.classList.add('visible'), 500);

    /* ── Animation loop (zero React state) ── */
    let frameId;
    const info = infoRef.current;

    function animate() {
      curX += (targetX - curX) * 0.15;
      curY += (targetY - curY) * 0.15;
      cursor.style.transform = `translate(${curX - 40}px, ${curY - 40}px)`;

      /* Refresh constellation rect every ~30 frames (~0.5s) */
      if (++rectTick % 30 === 0) refreshStageRect();

      if (stageRect) {
        const dist = Math.hypot(curX - stageCenter.x, curY - stageCenter.y);
        if (dist < stageThreshold) {
          cursor.classList.add('near-star');
          if (info) {
            const angle = Math.atan2(curY - stageCenter.y, curX - stageCenter.x) * (180 / Math.PI);
            const norm = (dist / stageThreshold * 100).toFixed(0);
            info.textContent = `${angle.toFixed(0)}° · ${norm}%`;
          }
        } else {
          cursor.classList.remove('near-star');
          if (info) info.textContent = '';
        }
      }

      frameId = requestAnimationFrame(animate);
    }
    frameId = requestAnimationFrame(animate);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameId);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  return (
    <div className="telescope-cursor" ref={cursorRef}>
      <svg className="telescope-ring" viewBox="0 0 80 80" fill="none">
        {/* Outer reticle circle */}
        <circle cx="40" cy="40" r="38" stroke="rgba(253,230,138,0.35)" strokeWidth="1" />
        {/* Cross-hairs — short ticks */}
        <line x1="40" y1="4"  x2="40" y2="16" stroke="rgba(253,230,138,0.4)" strokeWidth="0.8" />
        <line x1="40" y1="64" x2="40" y2="76" stroke="rgba(253,230,138,0.4)" strokeWidth="0.8" />
        <line x1="4"  y1="40" x2="16" y2="40" stroke="rgba(253,230,138,0.4)" strokeWidth="0.8" />
        <line x1="64" y1="40" x2="76" y2="40" stroke="rgba(253,230,138,0.4)" strokeWidth="0.8" />
        {/* Center dot — click point */}
        <circle cx="40" cy="40" r="3" fill="rgba(253,230,138,0.6)" />
        <circle cx="40" cy="40" r="1" fill="rgba(253,230,138,0.9)" />
      </svg>
      <div className="telescope-glow"></div>
      <div className="telescope-info" ref={infoRef}></div>
    </div>
  );
}

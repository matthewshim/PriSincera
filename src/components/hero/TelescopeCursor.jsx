import { useRef, useEffect, useState } from 'react';
import './TelescopeCursor.css';

/**
 * Telescope cursor — golden reticle that follows the mouse.
 * Shows proximity info near the star constellation.
 */
export default function TelescopeCursor() {
  const cursorRef = useRef(null);
  const infoRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [nearStar, setNearStar] = useState(false);
  const [hoveringInteractive, setHoveringInteractive] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let curX = -200, curY = -200, targetX = -200, targetY = -200;

    const timer = setTimeout(() => setVisible(true), 500);

    function onMove(e) { targetX = e.clientX; targetY = e.clientY; }
    function onLeave() { setVisible(false); targetX = -200; targetY = -200; }
    function onEnter() { setVisible(true); }

    function onOver(e) {
      if (e.target.closest('a, button, .nav-link, .cta-primary, .cta-secondary')) {
        setHoveringInteractive(true);
      }
    }
    function onOut(e) {
      if (e.target.closest('a, button, .nav-link, .cta-primary, .cta-secondary')) {
        setHoveringInteractive(false);
      }
    }

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);

    let frameId;
    function animate() {
      curX += (targetX - curX) * 0.12;
      curY += (targetY - curY) * 0.12;
      cursor.style.left = curX + 'px';
      cursor.style.top = curY + 'px';

      // Check proximity to star
      const stage = document.getElementById('starConstellation');
      if (stage) {
        const rect = stage.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(curX - cx, curY - cy);
        const threshold = rect.width * 0.7;
        if (dist < threshold) {
          setNearStar(true);
          if (infoRef.current) {
            const angle = Math.atan2(curY - cy, curX - cx) * (180 / Math.PI);
            const norm = (dist / threshold * 100).toFixed(0);
            infoRef.current.textContent = `${angle.toFixed(0)}° · ${norm}%`;
          }
        } else {
          setNearStar(false);
          if (infoRef.current) infoRef.current.textContent = '';
        }
      }

      frameId = requestAnimationFrame(animate);
    }
    frameId = requestAnimationFrame(animate);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const cls = [
    'telescope-cursor',
    visible && 'visible',
    nearStar && 'near-star',
    hoveringInteractive && 'hovering-interactive',
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} ref={cursorRef}>
      <div className="telescope-ring">
        <svg viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="56" stroke="rgba(253,230,138,0.45)" strokeWidth="1.2"/>
          <circle cx="60" cy="60" r="52" stroke="rgba(253,230,138,0.18)" strokeWidth="0.5"/>
          <line x1="60" y1="6" x2="60" y2="28" stroke="rgba(253,230,138,0.4)" strokeWidth="1"/>
          <line x1="60" y1="92" x2="60" y2="114" stroke="rgba(253,230,138,0.4)" strokeWidth="1"/>
          <line x1="6" y1="60" x2="28" y2="60" stroke="rgba(253,230,138,0.4)" strokeWidth="1"/>
          <line x1="92" y1="60" x2="114" y2="60" stroke="rgba(253,230,138,0.4)" strokeWidth="1"/>
          <line x1="60" y1="2" x2="60" y2="8" stroke="rgba(253,230,138,0.65)" strokeWidth="1.5"/>
          <line x1="60" y1="112" x2="60" y2="118" stroke="rgba(253,230,138,0.65)" strokeWidth="1.5"/>
          <line x1="2" y1="60" x2="8" y2="60" stroke="rgba(253,230,138,0.65)" strokeWidth="1.5"/>
          <line x1="112" y1="60" x2="118" y2="60" stroke="rgba(253,230,138,0.65)" strokeWidth="1.5"/>
          <circle cx="60" cy="60" r="2.5" fill="rgba(253,230,138,0.5)"/>
          <circle cx="60" cy="60" r="56" stroke="rgba(253,230,138,0.12)" strokeWidth="0.4" strokeDasharray="1.5 7.3"/>
        </svg>
      </div>
      <div className="telescope-glow"></div>
      <div className="telescope-info" ref={infoRef}></div>
    </div>
  );
}

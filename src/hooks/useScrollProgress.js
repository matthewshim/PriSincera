import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook to measure the scroll progress of a DOM element through the viewport.
 * Returns a React ref to attach to the target element and a progress float between 0 and 1.
 * 
 * - 0.0: The top of the element is just entering the bottom of the viewport.
 * - 1.0: The bottom of the element is just leaving the top of the viewport.
 */
export default function useScrollProgress() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const viewHeight = window.innerHeight;
        
        // Calculate scroll progress through viewport
        const totalRange = viewHeight + rect.height;
        const currentY = viewHeight - rect.top;
        
        let p = currentY / totalRange;
        p = Math.max(0, Math.min(1, p));
        
        setProgress(p);
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Trigger initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return [ref, progress];
}

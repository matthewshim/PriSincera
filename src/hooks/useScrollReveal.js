import { useEffect, useRef } from 'react';

/**
 * Custom hook for scroll-triggered reveal animations.
 * Adds 'revealed' class when element enters viewport.
 */
export default function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');

          // Trigger background shooting stars for elements with data-accent-color
          const cards = Array.from(el.querySelectorAll('[data-accent-color]'));
          if (el.hasAttribute('data-accent-color')) {
            cards.push(el);
          }

          cards.forEach((card) => {
            const delayStr = card.style.getPropertyValue('--reveal-delay') || '0s';
            const delayMs = parseFloat(delayStr) * 1000 || 0;

            setTimeout(() => {
              const rect = card.getBoundingClientRect();
              window.dispatchEvent(
                new CustomEvent('trigger-shooting-star', {
                  detail: {
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height,
                    color: card.getAttribute('data-accent-color'),
                  },
                })
              );
            }, delayMs);
          });

          observer.unobserve(el); // Only trigger once
        }
      },
      {
        threshold: options.threshold ?? 0.15,
        rootMargin: options.rootMargin ?? '0px 0px -60px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return ref;
}

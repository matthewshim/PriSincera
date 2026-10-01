/**
 * useMarkReveal — 하이라이트가 읽는 속도에 맞춰 '그어지게' 한다
 *
 * 설계 원칙: **가시성이 본질이고 애니메이션은 덤이다.**
 * CSS 기본값이 '그려진 상태'이고, 아직 화면 아래에 있어 그을 차례가 아닌 것만
 * .pending 을 붙여 0 에서 출발시킨다. 관찰자가 동작하지 않거나 IntersectionObserver 가
 * 없는 환경에서도 하이라이트는 **항상 보인다**.
 */
import { useEffect } from 'react';

/** 이 비율보다 아래에 있으면 '아직 읽을 차례가 아니다'로 본다 */
const BELOW_FOLD = 0.9;

export default function useMarkReveal(containerRef, deps = []) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return undefined;

    const marks = root.querySelectorAll('mark');
    if (marks.length === 0) return undefined;
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const vh = window.innerHeight || 0;
    const pending = [];

    marks.forEach((m) => {
      // 이미 화면 안이거나 위로 지나간 문장은 손대지 않는다 — 그대로 보인다
      if (m.getBoundingClientRect().top > vh * BELOW_FOLD) {
        m.classList.add('pending');
        pending.push(m);
      }
    });

    if (pending.length === 0) return undefined;

    const ob = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting || e.boundingClientRect.bottom < 0) {
            e.target.classList.remove('pending');
            ob.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 }
    );

    pending.forEach((m) => ob.observe(m));

    return () => {
      ob.disconnect();
      pending.forEach((m) => m.classList.remove('pending'));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

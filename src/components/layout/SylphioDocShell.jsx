/**
 * SylphioDocShell — Sylphio 문서형 지면(API Key 가이드·개인정보) 공통 셸 (§9-11)
 *
 * 본문 860(좌) + 목차 300(우) 2단, 1024px 이하에서 사이드바를 숨긴다.
 * 이전에는 두 페이지가 레이아웃·목차·스크롤스파이를 각각 복제하고 있었다.
 *
 * [접이식 목차 — 2026-11-15] 사이드바가 사라지는 폭에서는 문서 안 이동 수단이 0이었다.
 * 섹션 4~8개짜리 장문이라 본문 맨 앞에 접이식 목차를 둔다(§9-11 "사이드바가 유일한
 * 탐색 수단이면 하단/대체 내비를 상시 배치"의 문서 내 적용).
 */
import React, { useEffect, useState } from 'react';
import './SylphioDocShell.css';

export default function SylphioDocShell({ items, tocLabel, children }) {
  const [activeId, setActiveId] = useState('');
  const ids = items.map((item) => item.id).join('|');

  // 스크롤스파이 — 뷰포트 상단 15~25% 띠에 걸린 섹션을 활성 표시
  useEffect(() => {
    const els = items.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (els.length === 0) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  const list = (
    <ul>
      {items.map((item) => (
        <li key={item.id} className={`sylphio-toc-item${activeId === item.id ? ' active' : ''}`}>
          <a href={`#${item.id}`}>{item.label}</a>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="sylphio-doc-layout">
      <div className="sylphio-doc-main">
        <details className="sylphio-doc-toc-inline">
          <summary className="sylphio-doc-toc-label">{tocLabel}</summary>
          <nav aria-label={tocLabel}>{list}</nav>
        </details>
        {children}
      </div>

      <aside className="sylphio-doc-aside">
        <nav className="sylphio-doc-toc" aria-label={tocLabel}>
          <div className="sylphio-doc-toc-label">{tocLabel}</div>
          {list}
        </nav>
      </aside>
    </div>
  );
}

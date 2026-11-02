import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';
import useScrollReveal from '../../hooks/useScrollReveal';
import './WorkSection.css';
import Icon from '../common/Icon';

/**
 * WorkSection (홈 `Proof of Work`) — 균일 압축 2열 그리드.
 *
 * [2026-11-02 재편 — 안 B] 구 구조는 제품 1개당 전폭 카드 1장(약 404px)이 세로로 쌓여
 * 5개에서 섹션이 **2,216px(900px 뷰포트 2.5화면)** 였고, 제품이 늘면 그대로 비례해 자랐다.
 * 카드마다 정보가 7단위(서술태그·영문라벨·제목·설명 2~3행·태그 3~4개·CTA·CSS 아트+캡션)
 * 였고 같은 위계로 5번 반복돼 무엇을 먼저 볼지 신호가 없었다.
 *
 * 재편 원칙 — **모든 제품을 동등하게 둔다**(서비스 간 우선순위를 매길 수 없다는 오너 결정).
 *   · 정보 3단위 고정: 제품명 / 한 줄 요약 / 태그 2개 — **카드 자체가 링크**이고
 *     어포던스는 우측 하단 화살표가 맡는다(별도 CTA 버튼을 두지 않는다)
 *   · 액센트는 아이콘 1개 — 기존 51종 세트에서 고른다(제품당 전용 CSS 아트 918줄 폐지)
 *   · 데스크톱 2열 · 모바일 1열. 제품 추가 비용은 아래 PRODUCTS 배열에 1항목이다.
 *
 * [모바일] 구 구조는 `scroll-snap-type: x mandatory` 가로 캐러셀이었는데 스크롤바를
 * 양쪽 다 숨겨 스와이프 표식이 없었고, `column-reverse`로 카드가 뷰포트보다 높아
 * **CTA를 보려면 세로로 내려야 하는데 컨테이너는 가로로 스냅**했다(오너 "기이현상" 제보).
 * 압축 카드는 한 화면에 들어오므로 캐러셀이 필요 없다 — 순수 세로 1축으로 되돌렸다.
 * 가로 거리로 활성 카드를 고르던 스크롤 스포트라이트도 함께 제거했다(비활성 카드를
 * `opacity: .45` + `blur()`로 흐려 비교를 방해했다).
 *
 * 규범: design_system.md §9-14 제품 카드 규격.
 */

/* 제품 5종 — 추가 시 이 배열에 1항목만 넣는다(아이콘 1개 + 요약 1행 + 태그 2개).
   `icon`은 `components/common/Icon` 세트의 이름이고, `accent`는 제품 액센트 토큰이다. */
const PRODUCTS = [
  { key: 'Planner',  name: "Planner's View", to: '/planners-view', icon: 'compass',  accent: 'var(--accent-planner)' },
  { key: 'Builders', name: "Builder's Log",  to: '/builders-log',  icon: 'document', accent: 'var(--accent-log)' },
  { key: 'ReLearn',  name: 'ReLearn',        to: '/relearn',       icon: 'cycle',    accent: 'var(--accent-relearn)' },
  { key: 'Waymark',  name: 'Waymark',        to: '/waymark',       icon: 'trail',    accent: 'var(--accent-waymark)' },
  { key: 'Sylphio',  name: 'Sylphio',        to: '/sylphio',       icon: 'mic',      accent: 'var(--accent-sylphio)' },
];

function ProductCard({ product, index }) {
  const { t } = useTranslation();
  const tags = t(`home.service${product.key}Tags`);
  const cta = t(`home.service${product.key}Cta`);
  /* CTA가 이미 제품명을 품은 경우(예: "Waymark 만나보기") 접두를 붙이면 이름이 두 번 읽힌다.
     어느 쪽이든 보이는 제품명이 접근명에 포함되므로 WCAG 2.5.3을 충족한다. */
  const label = cta.includes(product.name) ? cta : `${product.name} — ${cta}`;

  return (
    /* 카드 자체가 링크다(오너 결정 2026-11-02) — 카드 안에 별도 CTA 버튼을 두면
       클릭 대상이 둘이 되고 정보 단위가 하나 늘어난다. 어포던스는 우측 하단 화살표가 맡는다.
       `aria-label`에 **제품명을 포함**해야 한다 — 보이는 텍스트가 접근명에 들어가지 않으면
       WCAG 2.5.3(Label in Name) 위반이다. 기존 CTA 문구는 여기서 계속 쓰인다. */
    <Link
      to={product.to}
      className="work-card reveal-item"
      aria-label={label}
      /* 인스턴스별 데이터(액센트·리빌 지연)는 커스텀 프로퍼티로 넘긴다 —
         클래스로 빼면 제품 수만큼 단일 사용 클래스가 생긴다(P3-13 판단). */
      style={{ '--card-accent': product.accent, '--reveal-delay': `${0.1 + index * 0.06}s` }}
    >
      <div className="work-card-head">
        <span className="work-card-mark" aria-hidden="true">
          <Icon name={product.icon} size={16} />
        </span>
        <h3 className="work-card-name">{product.name}</h3>
      </div>

      <p className="work-card-line">{t(`home.service${product.key}One`)}</p>

      <div className="work-card-foot">
        <div className="work-card-tags">
          {(Array.isArray(tags) ? tags : []).map((tag) => (
            <span className="work-tag" key={tag}>{tag}</span>
          ))}
        </div>
        {/* 어포던스 전용 — 의미는 카드의 aria-label이 담당하므로 보조기술에서 숨긴다 */}
        <span className="work-card-arrow" aria-hidden="true">
          <Icon name="arrowRight" size={16} />
        </span>
      </div>
    </Link>
  );
}

export default function WorkSection() {
  const { t } = useTranslation();
  const [sectionRef, revealed] = useScrollReveal({ threshold: 0.08 });

  return (
    <section className={`work reveal-section${revealed ? ' revealed' : ''}`} id="work" ref={sectionRef}>
      <div className="work-container">
        <div className="section-label">Proof of Work</div>

        <div className="work-header reveal-item" style={{ '--reveal-delay': '0.1s' }}>
          <h2 className="work-title">
            {t('home.servicesTitle')}<br />
            <span className="accent">{t('home.servicesTitleAccent')}</span>
          </h2>
          <p className="work-subtitle">
            {t('home.servicesSubtitle').split('\n').map((line, idx, arr) => (
              <React.Fragment key={idx}>
                {line}
                {/* 마지막 줄 뒤 <br />는 문단 아래에 빈 줄을 만든다 — CSS margin과 이중으로 벌어졌다 */}
                {idx < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        </div>

        <div className="work-grid">
          {PRODUCTS.map((product, i) => (
            <ProductCard product={product} index={i} key={product.key} />
          ))}
        </div>
      </div>
    </section>
  );
}

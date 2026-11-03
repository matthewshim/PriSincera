import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../contexts/LanguageContext';
import useScrollReveal from '../../hooks/useScrollReveal';
import './WorkSection.css';
import Icon from '../common/Icon';

/**
 * WorkSection (홈 `Proof of Work`) — 균일 압축 2열 그리드.
 *
 * 규범과 결정 경로: design_system.md **§9-14 제품 카드 규격**.
 * 아래는 코드를 읽을 때 필요한 제약만 적는다 — 근거는 정본이 보관한다.
 *
 *   · **모든 제품이 동등하다**(우선순위 부여 불가, 오너 결정). 이게 이 파일의 전제다.
 *   · 정보 **3단위**: 제품명 / 한 줄 요약 / 태그 2개. 더하려면 §9-14를 개정해야 한다.
 *   · **카드 자체가 링크**다. 안에 버튼을 두지 않는다 — 클릭 대상이 둘이 된다.
 *   · **스크롤 연동 모션·등장 스태거를 쓰지 않는다.** 색인은 눈을 끌지 않고 비켜준다.
 *     간격을 주면 우선순위 없는 집합에 **없는 순서가 생긴다**.
 *   · 모션 투자는 상호작용(호버·포커스·누름)에 둔다. 누름은 전역 haptic(`a:active`)이 맡는다.
 *   · 제품 추가 비용은 `PRODUCTS` 배열 1항목 + 로케일 3종이다.
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

/**
 * 카드별 등장 관찰 — 각 카드가 뷰포트에 **도착할 때** 발화한다.
 * 섹션 단위 1회 발화를 쓰지 않는 이유: 섹션이 756px이라 발화 순간 카드 5장이 이미
 * 화면에 있어 **시선이 닿기 전에 끝난다**(§9-14).
 */
function useCardReveal(count) {
  const [shown, setShown] = React.useState(() => Array(count).fill(false));
  const refs = React.useRef([]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = Number(entry.target.dataset.cardIndex);
          setShown((prev) => (prev[i] ? prev : prev.map((v, j) => (j === i ? true : v))));
          observer.unobserve(entry.target);   // 한 번만
        }
      },
      /* 발화 시점이 모션 인지의 **가장 큰 변수**다. 뷰포트 하단 22%를 비워,
         168px 카드가 화면 안쪽에서 발화하게 한다(§9-14). */
      { threshold: 0.25, rootMargin: '0px 0px -22% 0px' },
    );
    for (const el of refs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [count]);

  return [refs, shown];
}

function ProductCard({ product, index, cardRef, shown }) {
  const { t } = useTranslation();
  const tags = t(`home.service${product.key}Tags`);
  const cta = t(`home.service${product.key}Cta`);
  /* CTA가 이미 제품명을 품은 경우(예: "Waymark 만나보기") 접두를 붙이면 이름이 두 번 읽힌다.
     어느 쪽이든 보이는 제품명이 접근명에 포함되므로 WCAG 2.5.3을 충족한다. */
  const label = cta.includes(product.name) ? cta : `${product.name} — ${cta}`;

  return (
    /* 카드 자체가 링크다. `aria-label`에 **보이는 제품명을 포함**해야 한다 —
       빠지면 WCAG 2.5.3(Label in Name) 위반이다. */
    <Link
      to={product.to}
      ref={cardRef}
      data-card-index={index}
      className={`work-card${shown ? ' is-in' : ''}`}
      aria-label={label}
      /* 인스턴스별 데이터는 커스텀 프로퍼티로 — 클래스로 빼면 제품 수만큼
         단일 사용 클래스가 생긴다(P3-13). 등장 지연은 두지 않는다(§9-14). */
      style={{ '--card-accent': product.accent }}
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
  /* 섹션 단위 리빌은 **헤더에만** 쓴다. 카드는 각자 도착할 때 발화한다. */
  const [sectionRef, revealed] = useScrollReveal({ threshold: 0.08 });
  const [cardRefs, cardShown] = useCardReveal(PRODUCTS.length);

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
            <ProductCard
              product={product}
              index={i}
              cardRef={(el) => { cardRefs.current[i] = el; }}
              shown={cardShown[i]}
              key={product.key}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

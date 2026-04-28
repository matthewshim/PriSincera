# PriSignal UX 전면 리디자인 — 구현 완료 보고

> **작성일:** 2026-04-28  
> **최종 업데이트:** 2026-04-28  
> **상태:** ✅ 전 모듈 구현 완료 (배포됨)  
> **범위:** 랜딩 · 데일리 상세 · 아카이브 목록 · Work 섹션 — 전 영역

---

## 1. 구현 완료 요약

| 모듈 | 내용 | 커밋 | 상태 |
|------|------|------|------|
| **A: 카드 인터랙션** | 호버 고도화, 마우스 글로우, 스태거 애니메이션 | `e19e4a6` | ✅ |
| **B: 에디터 코멘트** | Editor's Signal 프리미엄 인용 디자인, 접힘/펼침 | `e19e4a6` | ✅ |
| **C: 구독 전환 UX** | 플로팅 CTA, 소셜 프루프, 인라인 구독 폼 | `44068b2` ~ `2c3b60f` | ✅ |
| **D: 아카이브 카드** | 스트라이프 글로우, 호버 스케일, 스태거 진입 | `e19e4a6` | ✅ |
| **E: 필터 칩** | 활성 글로우, scale 피드백, 전환 애니메이션 | `e19e4a6` | ✅ |
| **F: 마이크로 인터랙션** | 스크롤 프로그레스, 카테고리 언더라인 | `e19e4a6` | ✅ |

### 추가 개선 (Module C 이후)

| 개선 항목 | 커밋 | 상태 |
|----------|------|------|
| 탭 인디케이터 CSS ::after 통일 | `2b515d0` | ✅ |
| 구독 메타 폰트 `font-mono` → `font-body` | `2c3b60f` | ✅ |
| 콘텐츠 가로 폭 전면 통일 (`space-xl` 기준) | `a314f17` | ✅ |
| 아카이브 그리드 700px 제한 제거 | `b35beba` | ✅ |
| 카드 전체 클릭 + 프로그래매틱 앵커 방식 | `08f97e2`, `35cce0b` | ✅ |
| Work 섹션 카드 구조/카피/컬러 통일 | `6cf293c`, `d08106e`, `bdc6719` | ✅ |
| 망원경 커서 컴팩트화 + 퍼포먼스 최적화 | `a5befa9` | ✅ |

---

## 2. Module A: 카드 인터랙션 — 구현 상세

### A-1. 호버 상태

```css
.prisignal-daily-card:hover {
  transform: translateY(-4px);
  border-color: rgba(196, 181, 253, 0.2);
  background: rgba(255, 255, 255, 0.055);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 16px 48px rgba(124,58,237,0.08);
}
```

- 마우스 추적 `::before` 글로우 (JS `--mouse-x`/`--mouse-y`)
- DM Pick 카드: 보라 글로우 강도 2배

### A-2. 카드 진입 스태거

```css
.prisignal-daily-card {
  animation: cardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--card-index, 0) * 60ms);
}
```

### A-3. 카드 전체 클릭 (추가 구현)

- `<article>` 전체에 `onClick` 핸들러 적용
- `document.createElement('a').click()` 방식으로 팝업 차단기 우회
- Editor's Signal 토글은 `e.stopPropagation()`으로 독립 동작
- 호버 시 제목 색상 변경 + "원문 읽기" 텍스트 페이드인
- 개별 제목 `<a>` 태그 및 하단 링크 `<a>` 태그 제거 → `<span>` 전환

---

## 3. Module B: 에디터 코멘트 — 구현 상세

```
│ ┌──┐                                       │
│ │""│ Editor's Signal                   ∨    │
│ └──┘                                       │
│ "첫 1줄 프리뷰 텍스트..."                    │
└────────────────────────────────────────────┘
```

- CSS grid `grid-template-rows: 0fr/1fr` 기반 부드러운 펼침/접힘
- 좌측 3px 퍼플 보더 인용문 스타일
- 기본 템플릿 문구 `isDefaultComment()` 자동 필터링

---

## 4. Module C: 구독 전환 — 구현 상세

### C-1. 플로팅 CTA 바
- `FloatingCTA.jsx` 신규 생성
- `IntersectionObserver`로 히어로 이탈 시 슬라이드업
- 세션 내 닫기 가능, 모바일 대응

### C-2. 소셜 프루프
- 구독 폼 하단에 사용자 그룹 아바타 추가

### C-3. 인라인 구독 폼
- `SubscribeForm variant="inline"` props로 레이아웃 제어
- 아카이브 하단 + 데일리 상세 하단에 동일 컴포넌트 사용
- 문구 통일: "시그널을 놓치고 계신가요?" / "매일 선별된 5개의 시그널을 이메일로 받아보세요."

### C-4. 구독 메타 폰트 수정
- `.subscribe-meta` 폰트: `var(--font-mono)` → `var(--font-body)` — 디자인 시스템 준수

---

## 5. 레이아웃 정합성 — 콘텐츠 폭 통일

**통일 기준:** `max-width: 900px` + `padding: 0 var(--space-xl)` (48px)

| 영역 | Before | After |
|------|--------|-------|
| 아카이브 카드 그리드 | 700px (하드코딩) | 부모 전폭 (900px - 패딩) |
| 아카이브 CTA | 이중 패딩으로 708px | 900px - 패딩 |
| 데일리 아티클 카드 | space-lg(32px) 패딩 | space-xl(48px) 패딩 |
| 데일리 CTA | 인라인 마이너스 마진 불규칙 | CSS 공유, 인라인 스타일 제거 |

---

## 6. Work 섹션 — 카드 통일

### 구조 변경
- PriSignal 박스: 배너(`prisignal-banner`) → `work-card.prisignal` 클래스
- 두 카드 모두 동일 구조: 좌측 아이콘 + 우측 `label > name > desc > tags`

### 카피 패턴 통일
- 레이블: 2단어 영문 카테고리 (Personal Branding / Daily Curation)
- 서브태그: URL (prisincera.com / prisincera.com/prisignal)
- 설명: 슬로건 + 과정 서술 패턴 동일

### 컬러 통일
- 두 카드 레이블 모두 `var(--orbit-cyan)` 사용 (featured 오버라이드 제거)

---

## 7. 망원경 커서 — 퍼포먼스 최적화

| 항목 | Before | After |
|------|--------|-------|
| 크기 | 120px | 80px |
| 중앙 도트 | 2.5px 단일 | 3px + 1px 이중 |
| React state | 3개 (`useState`) | 0개 (`classList` 직접) |
| 위치 지정 | `left/top` | `transform: translate()` (GPU) |
| DOM 쿼리 | 매 프레임 `getBoundingClientRect` | 30프레임마다 1회 |
| 인터랙티브 호버 | `scale(0.6)` | `scale(0.35)` |
| SVG 회전 | 상시 `animation` | 제거 |
| 접근성 | — | `prefers-reduced-motion` 대응 |

---

## 8. 디자인 원칙 (유지)

1. **Purposeful Motion** — 모든 애니메이션은 정보 전달 또는 피드백 목적
2. **GPU-Friendly** — `transform`, `opacity`만 애니메이션
3. **Reduced Motion 존중** — `prefers-reduced-motion: reduce` 대응
4. **Liquid Easing** — Material Design 표준 커브 사용
5. **8px 그리드** — 모든 간격은 8의 배수

---

## 9. 수정 파일 목록

| 파일 | 주요 변경 |
|------|----------|
| `PriSignalDaily.jsx` | 카드 전체 클릭, 탭 네비, 인라인 구독 폼 |
| `PriSignalDaily.css` | 카드 호버/스태거, 탭 ::after, 폭 통일 |
| `PriSignal.css` | 아카이브 카드, CTA, 그리드 폭 |
| `PriSignalArchive.jsx` | 인라인 구독 폼 추가 |
| `SubscribeForm.jsx` / `.css` | 소셜 프루프, 폰트 수정 |
| `FloatingCTA.jsx` / `.css` | 신규 — 플로팅 구독 바 |
| `WorkSection.jsx` / `.css` | 카드 구조/카피/컬러 통일 |
| `TelescopeCursor.jsx` / `.css` | 컴팩트화, 퍼포먼스 최적화 |

---

*최종 업데이트: 2026-04-28*

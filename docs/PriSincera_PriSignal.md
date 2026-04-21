# PriSignal — 구독 서비스 기획서

> **"노이즈 속에서 시그널을 포착하다"**
>
> Pri(Priority) + Signal — PriSincera의 큐레이션 뉴스레터 서비스

---

## 1. 서비스 개요

| 항목 | 내용 |
|------|------|
| **서비스명** | PriSignal |
| **네이밍 의미** | Pri(Priority) + Signal — 정보 과잉 시대, 노이즈 속에서 의미 있는 시그널만 포착 |
| **서비스 형태** | 주 1회 이메일 뉴스레터 (큐레이션형) |
| **핵심 가치** | 업무 태도 + AI/Tech 트렌드를 20년차 PO의 시선으로 큐레이션 |
| **차별점** | 단순 링크 모음이 아닌, **에디터 코멘트**가 붙는 아티클 큐레이션 |
| **타겟** | PM/PO, 기획자, 주니어~미드레벨 리더, AI 전환기의 IT 실무자 |
| **비용 모델** | 무료 (퍼스널 브랜딩 목적, 향후 프리미엄 티어 고려 가능) |
| **목적** | prisincera.com 유입 확대 + 업계 트렌드·인사이트 축적 |

### 구독 → 유입 → 신뢰 플라이휠

```
아티클 수집 → 에디터 코멘트 → 뉴스레터 발송 → prisincera.com 유입 → 신뢰 축적 → 구독자 확산 → (반복)
```

---

## 2. 카테고리 설계 (5개)

| # | 카테고리 | 설명 | 키워드 |
|---|---------|------|--------|
| 1 | 🎯 **Attitude** | 업무를 임하는 태도, 리더십, 팀 문화, 조직 역학 | 리더십, 팀빌딩, 성장 마인드셋, 조직문화 |
| 2 | ⚡ **Priority** | 우선순위 설정, 의사결정 프레임워크, 생산성 | OKR, 의사결정, 시간관리, 전략적 사고 |
| 3 | 🤖 **AI & Future** | AI 트렌드, 도구 리뷰, 업무 적용 사례 | GenAI, AI Agent, 프롬프트 엔지니어링, 자동화 |
| 4 | 🌍 **Global Lens** | 글로벌 업무 문화, 해외 트렌드, 다문화 소통 | 글로벌 리더십, 리모트, 문화 차이, 해외 진출 |
| 5 | 📦 **Product Craft** | 프로덕트 설계, UX 인사이트, 기획 방법론 | 사용자 리서치, MVP, 그로스, 프레임워크 |

---

## 3. 콘텐츠 소싱 전략

### 3-1. 소싱 방식 구분

| 방식 | 설명 | 비중 |
|------|------|:---:|
| **RSS 자동 수집** | Cloud Run Job이 매일 35+ 소스에서 자동 수집 | 80% |
| **뉴스레터 2차 큐레이션** | 뉴스레터 RSS를 통한 자동 재큐레이션 (출처 명기) | 20% |

> [!IMPORTANT]
> **완전 자동화 운영**: 사람의 개입 없이 수집 → 선별 → 작성 → 발송까지 전 과정이 자동화됩니다.
> 품질은 **채널 신뢰등급(Tier 1/2/3)** 기반으로 사전에 보증됩니다.

### 3-2. RSS 피드 소스 (카테고리별)

#### 🎯 Attitude — 태도와 리더십

| 소스 | URL / RSS | 설명 | 언어 |
|------|-----------|------|:---:|
| **Harvard Business Review** | `hbr.org/the-latest` | 경영·리더십·조직 행동의 글로벌 표준 | EN |
| **First Round Review** | `review.firstround.com` | 스타트업 리더십, 매니지먼트 딥 다이브 | EN |
| **McKinsey Leading Off** | `mckinsey.com/featured-insights` | 시니어 경영진 대상 글로벌 리더십 | EN |
| **Gallup Workplace** | `gallup.com/workplace` | 데이터 기반 직원 몰입도·조직 행동 연구 | EN |
| **Charter** | `charter.com` | 미래 업무 방식, 하이브리드 모델, AI 통합 | EN |
| **eo planet** | `eonetwork.org/blog` | 기업가 조직(EO) 커뮤니티 인사이트 | EN |

#### ⚡ Priority — 우선순위와 의사결정

| 소스 | URL / RSS | 설명 | 언어 |
|------|-----------|------|:---:|
| **Farnam Street (fs.blog)** | `fs.blog/blog` | 멘탈 모델, 의사결정 프레임워크 | EN |
| **Sahil Bloom Newsletter** | `sahilbloom.substack.com` | 생산성·의사결정·자기계발 | EN |
| **James Clear (3-2-1)** | `jamesclear.com/3-2-1` | 습관·생산성·사고 프레임워크 (Atomic Habits 저자) | EN |
| **Stratechery** | `stratechery.com` | 테크 전략·비즈니스 의사결정 분석 | EN |
| **The Profile** | `theprofile.substack.com` | 성공한 리더들의 의사결정 패턴 분석 | EN |

#### 🤖 AI & Future — AI 트렌드와 실무 적용

| 소스 | URL / RSS | 설명 | 언어 |
|------|-----------|------|:---:|
| **TLDR AI** | `tldr.tech/ai` | 일간 AI 뉴스 요약 (간결, 기술 중심) | EN |
| **The Rundown AI** | `therundownai.com` | 일간 AI 비즈니스 적용 사례 | EN |
| **Import AI** | `importai.substack.com` | AI 연구·정책 심층 분석 (Jack Clark) | EN |
| **Ben's Bites** | `bensbites.com` | 스타트업/프로덕트 관점 AI 트렌드 | EN |
| **Superhuman AI** | `superhumanai.beehiiv.com` | AI 생산성 도구·워크플로우 최적화 | EN |
| **MIT Tech Review (AI)** | `technologyreview.com/topic/artificial-intelligence` | AI 기술 심층 분석 | EN |
| **OpenAI Blog** | `openai.com/blog` | OpenAI 공식 발표·연구 | EN |
| **Google DeepMind Blog** | `deepmind.google/blog` | DeepMind 연구 발표 | EN |
| **TechCrunch AI** | `techcrunch.com/category/artificial-intelligence` | AI 스타트업·투자·제품 뉴스 | EN |
| **GeekNews** | `news.hada.io` | 한국어 기술 뉴스 큐레이션 (HN 스타일) | KR |
| **요즘IT** | `yozm.wishket.com` | 한국 IT 트렌드·개발·기획 아티클 | KR |

#### 🌍 Global Lens — 글로벌 시각과 문화

| 소스 | URL / RSS | 설명 | 언어 |
|------|-----------|------|:---:|
| **Rest of World** | `restofworld.org` | 서구 이외 지역의 테크 산업 심층 보도 | EN |
| **The Economist (Business)** | `economist.com/business` | 글로벌 비즈니스·경제 트렌드 | EN |
| **WIRED** | `wired.com` | 기술·문화·과학 크로스오버 | EN |
| **Nikkei Asia** | `asia.nikkei.com` | 아시아 비즈니스·테크 시장 | EN |
| **TIME Leadership Brief** | `time.com` | 글로벌 리더십·비즈니스 문화 | EN |

#### 📦 Product Craft — 프로덕트와 기획 인사이트

| 소스 | URL / RSS | 설명 | 언어 |
|------|-----------|------|:---:|
| **Lenny's Newsletter** | `lennysnewsletter.com` | PM 필독 — 전략·그로스·커리어 심층 분석 | EN |
| **SVPG (Marty Cagan)** | `svpg.com/insights` | 프로덕트 리더십·조직 변혁 | EN |
| **Product Growth (Aakash Gupta)** | `productgrowth.substack.com` | 프로덕트 그로스 프레임워크·메트릭 | EN |
| **The Beautiful Mess** | `cutlefish.substack.com` | 프로덕트 개발의 현실·크로스펑셔널 역학 | EN |
| **Product Talk** | `producttalk.org/blog` | 사용자 중심 디스커버리·가설 검증 | EN |
| **Mind the Product** | `mindtheproduct.com` | PM 커뮤니티·주간 큐레이션 (Prioritised) | EN |
| **TLDR Product** | `tldr.tech/product` | 일간 PM 뉴스·도구·트렌드 다이제스트 | EN |
| **Nielsen Norman Group** | `nngroup.com/articles` | UX 리서치·사용성·디자인 원칙 | EN |

### 3-3. 자동화 파이프라인 워크플로우

```
┌──────────────────────────────────────────────────────────────────┐
│  Fully Automated Pipeline (사람 개입 제로)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⏰ CRON 1 — 매일 06:00 KST (Cloud Run Job: collector)          │
│     └── 35+ RSS 소스 병렬 수집                                   │
│     └── 지난 24시간 신규 아티클 추출                              │
│     └── 채널 Tier 메타데이터 태깅                                │
│     └── 중복 제거 후 GCS 주간 후보 풀에 적재                      │
│                                                                  │
│  ⏰ CRON 2 — 매주 일요일 08:00 KST (Cloud Run Job: composer)    │
│     └── 주간 후보 풀 로드 (7일치 누적)                            │
│     └── Gemini Flash AI로 SIGNAL 6항목 스코어링                  │
│     └── Tier 가중치 적용 → 상위 3~5개 선정                       │
│     └── 에디터 노트 + 코멘트 AI 자동 생성                        │
│     └── Markdown 뉴스레터 조립                                   │
│     └── Buttondown API → 월요일 08:00 KST 예약 발송              │
│                                                                  │
│  📡 월요일 AM 8:00 KST — Buttondown 자동 발송                    │
│     └── 절대 건너뛰지 않음 (공휴일/연휴 무관)                     │
│                                                                  │
│  ⏰ CRON 3 — 매주 월요일 08:30 KST (Cloud Run Job: monitor)     │
│     └── Buttondown API 발송 상태 확인                            │
│     └── 실패 시 Cloud Monitoring → matthew.shim@prisincera.com   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 3-4. 채널 신뢰등급 체계

> 품질은 "이 글이 좋은가?"가 아니라 **"이 채널이 신뢰할 만한가?"**로 사전에 결정됩니다.

| Tier | 신뢰도 | 기준 | 가중치 | 예시 |
|:----:|:------:|------|:------:|------|
| **T1** | 🟢 최고 | 글로벌 레퍼런스, 10년+ 발행 이력 | ×1.5 | HBR, Lenny's, Stratechery, MIT Tech Review |
| **T2** | 🟡 높음 | 전문가 운영, 꾸준한 발행, 업계 인정 | ×1.0 | First Round Review, SVPG, Ben's Bites, fs.blog |
| **T3** | 🔵 보통 | 양질이나 발행 불규칙 또는 신규 | ×0.7 | 개인 Substack, 커뮤니티 블로그 |

### 3-5. SIGNAL 선정 기준 (AI 자동 평가)

| 기준 | 질문 | 가중치 |
|------|------|:------:|
| **S** — Substance | 깊이 있는 인사이트가 있는가? | ★★★ |
| **I** — Impact | 독자의 업무에 실제 영향을 줄 수 있는가? | ★★★ |
| **G** — Gap | 다른 한국어 뉴스레터에서 다루지 않는 시각인가? | ★★ |
| **N** — Now | 이번 주에 읽어야 의미 있는 글인가? | ★★ |
| **A** — Actionable | 바로 적용할 수 있는 것이 있는가? | ★ |
| **L** — Lens | PriSincera의 시선으로 코멘트할 관점이 있는가? | ★★★ |

### 3-6. 자동화 인프라

| 도구 | 용도 | 비용 |
|------|------|------|
| **Cloud Run Jobs** | Collector / Composer / Monitor 3개 Job | $0 (무료 티어) |
| **Cloud Scheduler** | 3개 크론 트리거 | $0 (3개 무료) |
| **Cloud Storage** | 후보 풀, 발행 이력 JSON | $0 (5GB 무료) |
| **Gemini Flash API** | 스코어링, 코멘트 생성 | $0 (무료 티어) |
| **Buttondown** | 예약 발송, 구독자 관리 | $0 (100명까지 무료) |
| **Secret Manager** | API 키 관리 | $0 (6개 무료) |

> [!TIP]
> **월 운영비: $0** — 모든 구성 요소가 GCP/Gemini 무료 티어 내에서 운영됩니다.
> 구독자 100명 초과 시 Buttondown $9/월만 추가됩니다.

---

## 4. 뉴스레터 포맷

### 이메일 구조 (1회 분량, 읽기 5분 이내)

```
┌─────────────────────────────────────────────────┐
│  📡 PriSignal #001                              │
│  "이번 주의 시그널"                               │
├─────────────────────────────────────────────────┤
│                                                 │
│  ✍️ 에디터 노트 (3~5줄)                          │
│  — 이번 주 큐레이션 맥락, PriSincera 시선의 한 줄  │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  🎯 [Attitude] "제목"                            │
│  출처 · 읽기 시간                                 │
│  → 에디터 코멘트 (2~3줄)                          │
│                                                 │
│  🤖 [AI & Future] "제목"                         │
│  출처 · 읽기 시간                                 │
│  → 에디터 코멘트 (2~3줄)                          │
│                                                 │
│  ⚡ [Priority] "제목"                             │
│  출처 · 읽기 시간                                 │
│  → 에디터 코멘트 (2~3줄)                          │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  💬 이번 주의 한 마디                              │
│  — 인사이트 요약 또는 질문                         │
│                                                 │
│  🔗 prisincera.com에서 더 보기                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 핵심 원칙

1. **에디터 코멘트가 핵심** — AI가 PriSincera 톤으로 "왜 이 글을 골랐는지" 코멘트 생성
2. **읽기 5분 이내** — 바쁜 월요일 아침에도 훑어볼 수 있는 분량 (3~5개 아티클)
3. **매주 2개 이상 카테고리** — 5개 카테고리에서 최소 2개 이상 포함, T1 소스 최소 1개 보장
4. **절대 건너뛰지 않는다** — 매주 월요일 08:00 KST 반드시 발송 (공휴일/연휴 무관)
5. **채널 신뢰등급 기반 품질** — Tier 1/2/3 가중치로 채널 수준이 곧 콘텐츠 수준
6. **CTA는 자연스럽게** — 매 이슈 하단에 prisincera.com 유입 링크

---

## 5. 기술 구현 — 현재 상태

> ✅ **Phase A + B 구현 완료** (2026-04-20)

### 5-1. 구독 수집 (프론트엔드) — ✅ 완료

| 항목 | 내용 | 상태 |
|------|------|:---:|
| **구독 폼 위치** | Work 섹션 PriSignal 배너 + `/prisignal` 랜딩 페이지 (Hero, CTA 섹션) | ✅ |
| **수집 필드** | 이메일 (필수) | ✅ |
| **UX** | 인라인 폼 + 성공/에러 피드백 애니메이션, glassmorphism 디자인 | ✅ |
| **API 연동** | `POST /api/subscribe` → Nginx 프록시 → Buttondown API | ✅ |
| **컴포넌트** | `src/components/prisignal/SubscribeForm.jsx` (공유 컴포넌트) | ✅ |

### 5-2. 이메일 플랫폼: Buttondown — ✅ 연동 완료

| 항목 | 내용 | 상태 |
|------|------|:---:|
| **계정** | Buttondown 계정 생성 완료, 뉴스레터명 "PriSignal" 설정 | ✅ |
| **API Key** | Cloud Run 환경변수 `BUTTONDOWN_API_KEY`로 관리 | ✅ |
| **무료 티어** | 구독자 100명까지 (현재 사용 중) | ✅ |
| **커스텀 도메인** | 미사용 (선택사항 — 구독자 500명+ 시 검토) | ⏸️ |
| **아카이브** | Phase C에서 API 연동 예정 | 🔜 |

### 5-3. API Key 보호 — Nginx 리버스 프록시 ✅ 완료

```nginx
# nginx.conf (실제 적용 중)
location /api/subscribe {
    proxy_pass https://api.buttondown.email/v1/subscribers;
    proxy_set_header Authorization "Token $BUTTONDOWN_API_KEY";
    proxy_set_header Content-Type "application/json";
    proxy_method POST;
}

location /api/archive {
    proxy_pass https://api.buttondown.email/v1/emails;
    proxy_set_header Authorization "Token $BUTTONDOWN_API_KEY";
}
```

> [!NOTE]
> `$BUTTONDOWN_API_KEY`는 Dockerfile에서 `envsubst`를 통해 런타임 시 주입됩니다.
> Cloud Run 환경변수로 관리되어 소스코드에 노출되지 않습니다.

### 5-4. 아키텍처 (실제 운영 중)

```
prisincera.com (구독 폼)
    ↓ POST /api/subscribe { email }
Nginx 리버스 프록시 (Cloud Run 컨테이너)
    ↓ Authorization: Token $BUTTONDOWN_API_KEY
    ↓ POST https://api.buttondown.email/v1/subscribers
Buttondown
    ↓ 구독자 등록 완료
    ↓ 주 1회 예약 발송 (월요일 AM 8:00)
구독자 이메일 수신
    ↓ CTA 클릭
prisincera.com 유입
```

---

## 6. PriSignal 랜딩 페이지

> 뉴스레터 구독만으로는 방문자 확보와 리텐션이 어렵습니다.
> PriSignal 전용 랜딩 페이지를 통해 서비스 소개, 과거 이슈 아카이브, 구독 전환을 한 곳에서 처리합니다.

### 6-1. 페이지 목적

| 역할 | 설명 |
|------|------|
| **서비스 소개** | PriSignal이 무엇인지, 왜 구독해야 하는지 |
| **구독 전환** | 이메일 입력 → 즉시 구독 (Buttondown API) |
| **아카이브 열람** | 과거 이슈를 직접 읽을 수 있는 허브 |
| **SEO 유입** | 아카이브 콘텐츠를 통한 검색 엔진 유입 |
| **리텐션** | 구독자가 prisincera.com에 다시 방문할 이유 |

### 6-2. URL 전략

| 방식 | URL | 장점 | 단점 |
|------|-----|------|------|
| **서브 라우트 (추천)** | `prisincera.com/prisignal` | 기존 사이트와 통합, SEO 도메인 파워 공유, 동일 디자인 시스템 적용 가능 | 추가 React 페이지 구현 필요 |
| 서브도메인 | `signal.prisincera.com` | 독립 서비스 느낌, Buttondown 호스팅 활용 가능 | 별도 디자인 커스텀 제한, 도메인 파워 분산 |

> [!IMPORTANT]
> **추천: 서브 라우트 (`/prisignal`)**
> - prisincera.com의 디자인 시스템(glassmorphism, Star Map 배경)을 그대로 사용
> - SEO 도메인 파워를 공유하여 검색 유입 극대화
> - GNB/Footer를 통한 자연스러운 사이트 내 네비게이션
> - Buttondown은 API 전용으로 활용 (구독 관리 + 발송만), 아카이브는 직접 렌더링

### 6-3. 페이지 섹션 구조

```
┌─────────────────────────────────────────────────────────┐
│  GNB: PriSincera  Home  PriSignal  PriStudy             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ① Hero                                                │
│  📡 PriSignal                                           │
│  "노이즈 속에서 시그널을 포착하다"                         │
│  20년차 PO의 기준으로 설계된, AI 큐레이션 뉴스레터         │
│                                                         │
│  [이메일 입력] [구독하기]                                 │
│  ✓ 매주 월요일 · ✓ 무료 · ✓ 언제든 해지                   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ② Value Proposition — "왜 PriSignal인가?"              │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                 │
│  │ 📡 시그널│ │ ✍️ PO의  │ │ ⏱️ 5분   │                 │
│  │ 만 포착  │ │ 시선     │ │ 이면     │                 │
│  │ SIGNAL AI│ │ 20년의   │ │ 충분     │                 │
│  │ 평가 기반│ │ 기준     │ │          │                 │
│  └──────────┘ └──────────┘ └──────────┘                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ③ Categories — "다루는 시그널"                          │
│                                                         │
│  🎯 Attitude  ⚡ Priority  🤖 AI & Future               │
│  🌍 Global Lens  📦 Product Craft                       │
│  (각 카테고리 카드 + 짧은 설명)                           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ④ SIGNAL 선정 기준 — "시그널을 고르는 기준" ★ NEW       │
│                                                         │
│  ┌─S─┐ ┌─I─┐ ┌─G─┐ ┌─N─┐ ┌─A─┐ ┌─L─┐                │
│  │Sub│ │Imp│ │Gap│ │Now│ │Act│ │Len│                │
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                │
│  + AI 자동 평가 + 채널 Tier 가중치 설명                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⑤ Latest Issues — "최근 시그널"                         │
│  (Buttondown API로 최근 3~5개 이슈 카드 렌더링)           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⑥ Subscribe CTA (반복)                                │
│  "시그널을 놓치지 마세요."                                │
│  [이메일 입력] [구독하기]                                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⑦ FAQ (6문항)                                         │
│  - PriSignal은 무엇인가요?                               │
│  - 시그널은 어떻게 선정되나요? ★ NEW                     │
│  - 얼마나 자주 발송되나요?                                │
│  - 구독은 무료인가요?                                    │
│  - 해지는 어떻게 하나요?                                  │
│  - 어떤 주제를 다루나요?                                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Footer: Navigate(Home·PriSignal·PriStudy) / Connect    │
└─────────────────────────────────────────────────────────┘
```

### 6-4. 기술 구현 — ✅ 완료

#### 컴포넌트 구조 (현재 배포 상태)

```
src/
├── pages/
│   ├── PriSignal.jsx            # ✅ 랜딩 페이지 컨테이너 (SEO + OG 메타 설정)
│   └── PriSignal.css            # ✅ 랜딩 페이지 + 이슈 상세 전체 스타일
├── components/prisignal/
│   ├── PriSignalHero.jsx        # ✅ ① Hero + 구독 폼
│   ├── PriSignalValue.jsx       # ✅ ② Value Proposition 3카드
│   ├── PriSignalCategories.jsx  # ✅ ③ 카테고리 5카드
│   ├── PriSignalArchive.jsx     # ✅ ④ 최근 이슈 목록 (Buttondown API 연동 + 빈 상태 UI)
│   ├── PriSignalSubscribe.jsx   # ✅ ⑤ 구독 CTA (SubscribeForm 재사용)
│   ├── PriSignalFAQ.jsx         # ✅ ⑥ FAQ 5문항 아코디언
│   ├── PriSignalIssue.jsx       # ✅ 개별 이슈 상세 페이지 (/prisignal/:issueId)
│   ├── SubscribeForm.jsx        # ✅ 이메일 입력 + API 연동 (공유 컴포넌트)
│   └── SubscribeForm.css        # ✅ 구독 폼 스타일
├── public/
│   └── prisignal-og.png         # ✅ OG 이미지 (SNS 공유용)
├── docs/
│   └── prisignal-email-template.html  # ✅ Buttondown 이메일 템플릿
```

#### 라우팅 (App.jsx) — ✅ 적용 완료

```jsx
<Route index element={<Home />} />
<Route path="prisignal" element={<PriSignal />} />
<Route path="prisignal/:issueId" element={<PriSignalIssue />} />  // ✅ 개별 이슈 상세
```

#### Buttondown API 연동 현황

| API | 엔드포인트 | 용도 | 상태 |
|-----|-----------|------|:---:|
| **구독 등록** | `POST /api/subscribe` | 구독 폼 → 신규 구독자 등록 | ✅ |
| **아카이브 조회** | `GET /api/archive` | 최근 발행 이슈 목록 조회 | ✅ |
| **이슈 상세** | `GET /api/archive/:id` | 개별 이슈 HTML 본문 조회 | ✅ |

### 6-5. GNB 통합 — ✅ 현행화 (2026-04-21)

| 방식 | Before | After |
|------|--------|-------|
| **GNB 메뉴** | Belief · Journey · Work · PriSignal · Connect | **Home · PriSignal · PriStudy** |
| **Footer Navigate** | Belief · Journey · Work · PriSignal · Connect | **Home · PriSignal · PriStudy** |
| **Footer Connect** | LinkedIn · Email | LinkedIn · Email |

> - PriSignal은 페이지 라우트(`/prisignal`)로 연결됩니다.
> - PriStudy는 준비중 얼럿으로 동작합니다.
> - BGM 토글은 Header에 내장되어 전 페이지에서 동작합니다.

### 6-6. 사용자 플로우

```
[신규 방문자]
    ↓ GNB "PriSignal" 클릭 or Work 섹션 배너 클릭
    ↓ /prisignal 랜딩 페이지
    ↓ Hero 구독 폼에서 이메일 입력 → 구독 완료
    ↓ 매주 월요일 이메일 수신
    ↓ 이메일 내 CTA 클릭 → prisincera.com 재방문
    ↓ 아카이브 열람 → 추가 이슈 탐색
    ↓ LinkedIn 공유 → 신규 방문자 유입 (반복)

[기존 구독자]
    ↓ 이메일 수신 → "웹에서 읽기" 클릭
    ↓ /prisignal/:issueId 상세 페이지
    ↓ 하단 "이전 이슈" 탐색 → 리텐션
    ↓ prisincera.com 메인으로 이동 → Belief/Journey/Work 탐색
```

### 6-7. 디자인 원칙

| 원칙 | 적용 |
|------|------|
| **기존 디자인 시스템 유지** | glassmorphism 컨테이너, 동일 컬러 팔레트, 동일 타이포그래피 |
| **Star Map 배경 유지** | 메인과 동일한 StarField 캔버스 배경 (고정) |
| **구독 폼 최소화** | 이메일 1개 필드만, 마찰 최소화 |
| **아카이브 카드 디자인** | Belief 카드와 동일한 glassmorphism + hover glow 패턴 |
| **모바일 퍼스트** | 단일 열 레이아웃, 터치 최적화 |

---

## 7. 메인 페이지 반영 — ✅ 완료

### Work 섹션 — PriSignal 배너 ✅

```
📡 PriSignal
   노이즈 속에서 시그널을 포착합니다.

   [이메일 입력 필드] [구독하기]

   ✓ 매주 월요일 발송  ✓ 무료  ✓ 언제든 해지

   [자세히 보기 →]  → /prisignal 랜딩 페이지
```

### GNB / Footer ✅ — 현행화 (2026-04-21)

```
GNB:     Home  PriSignal  PriStudy(준비중 얼럿)  [BGM 토글]
Footer:  Home / PriSignal / PriStudy(준비중 얼럿)
```

> - 섹션 앵커 링크(Belief/Journey/Work/Connect) 제거
> - 페이지 레벨 네비게이션으로 전환
> - BGM 플레이어: Header 내장 (전 페이지 공통)
> - CI 그리기 효과: sessionStorage 기반 최초 방문 시에만 실행

---

## 8. 추진 로드맵

### Phase A: 기반 구축 — ✅ 완료 (2026-04-20)
- [x] Buttondown 계정 생성 + API Key 발급
- [x] Nginx 프록시 설정 (API Key 보호, envsubst 런타임 주입)
- [x] Cloud Run 환경변수 `BUTTONDOWN_API_KEY` 설정
- [x] `SubscribeForm.jsx` 공유 컴포넌트 구현 (구독 폼 + API 연동)
- [x] Work 섹션 PriSignal 배너 전환 (Coming Soon → 구독 폼)
- [x] 라이브 구독 테스트 완료 (`test@prisincera.com`)
- [ ] 이메일 템플릿 디자인 (PriSincera 브랜딩) → Phase C로 이동
- [x] ~~DNS 설정~~ → 커스텀 도메인 미사용 결정 (500명+ 시 재검토)

### Phase B: 랜딩 페이지 구축 — ✅ 완료 (2026-04-20)
- [x] `/prisignal` 라우트 추가 (App.jsx)
- [x] PriSignal 랜딩 페이지 6개 섹션 구현
  - [x] ① Hero (타이틀 + 태그라인 + 구독 폼)
  - [x] ② Value Proposition (3카드: 시그널만 포착 / PO의 시선 / 5분)
  - [x] ③ Categories (5카드: Attitude, Priority, AI & Future, Global Lens, Product Craft)
  - [x] ④ Latest Issues 아카이브 섹션 (Buttondown API 연동 + 빈 상태 UI)
  - [x] ⑤ Subscribe CTA (글라스모피즘 컨테이너 + 반복 구독 폼)
  - [x] ⑥ FAQ (5문항 아코디언)
- [x] GNB + Footer에 PriSignal 메뉴 추가
- [x] SEO 메타데이터 설정 (title, description)
- [x] `/prisignal/:issueId` 상세 페이지 (개별 이슈 렌더링)
- [x] OG 이미지 제작 (SNS 공유용 프리뷰 `prisignal-og.png`)
- [x] OG/Twitter 메타 태그 설정

### Phase C: 콘텐츠 파이프라인 + 아카이브 구축 — ✅ 기술 구현 완료 (2026-04-21)

#### C-1. 아카이브 기능 (기술) — ✅ 완료
- [x] `PriSignalArchive.jsx` — Buttondown `GET /api/archive` 연동, 최근 이슈 카드 렌더링 + 빈 상태 UI
- [x] `PriSignalIssue.jsx` — 개별 이슈 상세 페이지 (`/prisignal/:issueId`) + 에러 상태 UI
- [x] PriSignal 랜딩 페이지에 ④ Latest Issues 섹션 추가
- [x] Nginx `/api/archive/:id` 개별 이슈 프록시 엔드포인트 추가
- [x] SPA fallback 확인 (`try_files $uri $uri/ /index.html` — 기존 설정으로 커버)

#### C-2. 이메일 템플릿 — ✅ 완료
- [x] Buttondown 이메일 템플릿 디자인 (`docs/prisignal-email-template.html`)
- [x] OG 이미지 제작 (`public/prisignal-og.png`)
- [x] OG/Twitter 메타 태그 설정 (PriSignal.jsx에서 동적 주입)

#### C-3. 자동화 파이프라인 구축 — ✅ 완료 (2026-04-21)
- [x] `pipeline/` 디렉토리 구조 생성 (Collector / Composer / Monitor)
- [x] RSS 수집 자동화 (`collector.mjs` — 35+ 소스 병렬 수집 + 중복 제거)
- [x] AI 스코어링 (`gemini.mjs` — Gemini Flash, SIGNAL 6항목 자동 평가)
- [x] 선정 + 코멘트 생성 (`composer.mjs` — Tier 가중치, 다양성 보장, 자동 예약 발송)
- [x] 발송 모니터링 (`monitor.mjs` — Buttondown 상태 확인 + 알림)
- [x] 채널 소스 설정 (`config/sources.json` — 35개 소스, Tier 1/2/3 배정)
- [x] Cloud Build CI/CD (`cloudbuild-pipeline.yaml`)
- [x] GCP 인프라 설정 스크립트 (`setup-infra.sh`)
- [x] Buttondown 이메일 템플릿 제작 (`docs/prisignal-email-template.html`)
- [x] 기획서 정책 전면 업데이트 (자동화 체제, SIGNAL 기준, 채널 신뢰등급)

> **인프라 프로비저닝 완료** (2026-04-21): GCS 버킷, Cloud Run Jobs 3개, Cloud Scheduler 3개, Secret Manager 등록, 첫 Collector 실행 성공 (119개 아티클 수집)

### Phase D: 공개 런칭 — 🔄 진행 중

#### D-1. Buttondown 설정 — ✅ 완료 (2026-04-21)
- [x] Accent Color `#a78bfa` (PriSincera 브랜드 컬러) 적용
- [x] Modern 이메일 템플릿 선택
- [x] Description: "Capturing signals in noise — 20-year PO curation of attitude and trends"
- [x] Author: PriSincera
- [ ] Custom CSS (Basic 플랜 $9/월 필요 — 구독자 100명+ 시 함께 업그레이드)

#### D-2. 런칭 대기 — ⏰ 자동 진행 예정
- [ ] 첫 뉴스레터 자동 발송 확인 (4/28 월요일 08:00 KST)
- [ ] LinkedIn 런칭 포스트
- [ ] 아카이브 페이지에 첫 이슈 표시 확인
- [ ] 성과 트래킹 설정 (오픈율, 클릭율, 구독자 수)

### Phase E: 운영 및 확장 (지속)

| 항목 | 주기 |
|------|------|
| 뉴스레터 발행 | 주 1회 (월요일 AM 8:00) |
| 구독자 분석 (오픈율, 클릭율) | 월 1회 |
| 아카이브 페이지 UX 개선 | 분기 1회 |
| 카테고리 검토 | 분기 1회 |
| 프리미엄 티어 검토 | 구독자 500명+ 도달 시 |
| 커스텀 도메인 검토 | 구독자 500명+ 도달 시 |

---

## 9. 확인 사항 — ✅ 전체 확정

| # | 항목 | 결정 | 상태 |
|---|------|------|:---:|
| 1 | **발송 주기** | 주 1회 | ✅ |
| 2 | **발송 요일/시간** | 월요일 오전 8시 | ✅ |
| 3 | **이메일 플랫폼** | Buttondown (무료 티어) | ✅ |
| 4 | **커스텀 도메인** | 미사용 (기본 도메인 운영, 500명+ 시 재검토) | ✅ |
| 5 | **랜딩 페이지 URL** | `/prisignal` (서브 라우트) | ✅ |
| 6 | **GNB 메뉴** | Home · PriSignal · PriStudy 3메뉴 구조 | ✅ |
| 7 | **런칭 시기** | 즉시 착수 (Phase A~B 완료) | ✅ |
| 8 | **에디터 코멘트 언어** | 한국어 | ✅ |
| 9 | **카테고리 구성** | 5개 (Attitude, Priority, AI & Future, Global Lens, Product Craft) | ✅ |

---

## 10. 라이브 URL

| 페이지 | URL |
|--------|-----|
| **메인 (Work 섹션 배너)** | https://www.prisincera.com/#work |
| **PriSignal 랜딩 페이지** | https://www.prisincera.com/prisignal |
| **Buttondown 관리자** | https://buttondown.com/home |
| **API Key 관리** | https://buttondown.com/keys |


---
status: archived
domain: Core
last_updated: 2026-05-21
version: v1.0
---

# 🌐 메인 페이지 및 서비스 통합·엔지니어링 파이프라인 진화 이력 아카이브

이 문서는 2024년 론칭 당시의 초기 메인 페이지 기획에서 시작하여, 모바일 반응형 네비게이션(GNB Hamburger Menu) 도입, 개별 서브 서비스(PriSignal, PriStudy)의 Daily Digest 통폐합, 서비스 중심의 벤트 박스(Bento Box) 메인 개편, 그리고 백엔드 파이프라인(`composer.mjs`) 기술 부채 청산까지의 모든 역사적 이정표와 설계 결정을 타임라인 순으로 통합하여 수록한 종합 기록 문서입니다.

---

## 1. 초기 2024 메인 페이지 기획 및 퍼스널 브랜딩 (2024-08)

### 1-1. 기획 개요 및 브랜드 아이덴티티
초기의 PriSincera 공식 홈페이지는 **"진심을 우선순위에 둔다 (Sincerity, Prioritized.)"**라는 핵심 철학을 바탕으로 한 프리미엄 퍼스널 브랜딩 사이트로 기획되었습니다. 단순한 서비스 소개서가 아닌, "이 사람은 누구이며, 무엇을 믿는가"를 전달하는 것을 최우선 목표로 삼았습니다.

* **핵심 디자인 컨셉**: The Archive of Priority — 20년 IT 경험에서 발견한 태도와 철학의 기록
* **페르소나**: 혼돈 속의 우선순위 설계자
* **디자인 톤앤매너**: 프리미엄 다크 모드, 시네마틱 스크롤, 절제된 화려함 (Restrained Authority)

### 1-2. 디자인 시스템 및 타이포그래피 사양
* **컬러 팔레트**:
  * 배경: Deep Space (`#0B0B14`), Charcoal Navy (`#12121A`)
  * 액센트 및 브랜드 그라디언트: Crystal Violet (`#C4B5FD`) ➡️ Amethyst (`#A78BFA`) ➡️ Deep Prism (`#7C3AED`), Orbit Cyan (`#22D3EE`), Amber Glow (`#FDE68A`)
* **타이포그래피**:
  * 영문 헤드라인: **Outfit** (Geometric & Modern, Display/Bold)
  * 영문 본문: **Inter** (Highly Legible)
  * 국문 본문: **Noto Sans KR**
  * 코드 및 지표: **JetBrains Mono**
* **메인 페이지 레이아웃 섹션 흐름**:
  ```
  [Navigation Bar (Fixed, Glassmorphism)] 
      ➡️ [Hero Section] ("Sincerity, Prioritized.") 
      ➡️ [Belief Section] (Note A · Priority · Sincera 카드) 
      ➡️ [Journey Section] (20년 연도별 커리어 수직 타임라인) 
      ➡️ [Work Section] (Vibe Studio, Noto A 등 프로젝트 쇼케이스) 
      ➡️ [Connect Section] (LinkedIn & 이메일 대화 초대 CTA)
  ```

---

## 2. 모바일 반응형 GNB 및 햄버거 메뉴 UX 개선 (2025-11)

### 2-1. 개선 배경
데스크탑용 가로형 GNB 메뉴가 가로 해상도가 좁은 모바일 환경에서 로고와 겹치거나 터치 반경이 좁아지는 치명적인 사용성 문제가 발견되었습니다. 이를 방지하기 위해 모바일 전용의 햄버거 메뉴 및 전체화면 오버레이 인터랙션을 구축했습니다.

### 2-2. 세부 구현 사항
* **반응형 미디어 쿼리**: 폭 `768px` 이하 환경에서 데스크탑 `.nav-links`를 숨기고 햄버거 아이콘(☰) 노출.
* **오버레이 컴포넌트 (`Header.jsx` & `Header.css`)**:
  * 터치 시 화면 전체(`100vw`, `100vh`)를 부드럽게 덮는 반투명 글래스모피즘 오버레이 팝업(`backdrop-filter: blur(20px)`).
  * 메뉴 폰트 크기를 키우고 터치 반응 반경(Gap)을 충분히 늘려 오터치 방지.
* **모바일 UX 디테일 터치**:
  * **자동 닫힘 (Auto Close)**: 모바일 네비게이션 내에서 메뉴 링크 선택 시 `react-router-dom`의 `useLocation` 스파이를 통해 자동으로 팝업이 닫히도록 유도.
  * **스크롤 고정 (Scroll Lock)**: 모바일 오버레이 메뉴 활성화 시 `document.body.style.overflow = 'hidden'`을 주입하여 후면 본문 스크롤 현상을 완벽히 차단.

---

## 3. 개별 서브 서비스의 'Daily Digest' 대통합 (2026-04)

### 3-1. 통합 배경 및 가치 일원화
생태계 내에서 개별 도메인으로 파편화되어 운영되던 **PriSignal (IT 트렌드 인사이트)**과 **PriStudy (실무 지식 및 프롬프트 학습)**를 단 하나의 통합 서비스인 **`Daily Digest`**로 통합하여 유저 이탈을 낮추고, 단 한 번의 방문으로 유용한 정보와 성장의 잔디를 심을 수 있도록 제품 구조를 완전히 일원화했습니다.

### 3-2. Daily Digest 통합 구현 특징
* **핀터레스트 스타일 아카이브 (Masonry Grid)**: `/daily` 메인 아카이브 뷰에 Masonry 그리드를 도입해 과거 발행된 지식을 세련되게 나열.
* **통합 데일리 상세 뷰 (Daily View)**: 하루 5분 투자로 **IT Tech Signal**, **AI Prompt 1-Pick**, **Business Japanese 1-Pick**을 스크롤 한 번으로 학습하도록 단일 상세 구조 렌더링.
* **Growth Streak Dashboard**: 구글 로그인 연동 후 학습을 마칠 때마다 인터랙티브한 GitHub 스타일의 14일 연속 성장의 잔디(Streak)를 심어주는 게임화(Gamification) 요소 적용.
* **백엔드 API 통합**: Firestore 내 파편화되어 존재하던 `signals` 컬렉션과 `study_content` 컬렉션을 서버(server.mjs) 단의 `/api/daily/:date` 브릿지 API에서 `Promise.all`로 병렬 처리하여 하나의 고밀도 JSON 데이터로 전송.

---

## 4. 메인 Landing Page의 서비스 플랫폼 중심 리뉴얼 (2026-05)

### 4-1. 개편 배경: 퍼스널 브랜딩에서 SaaS 플랫폼으로
기존의 메인 페이지는 개인 이력 중심의 포트폴리오 성격이 지나치게 강해 신규 서비스(`Daily Digest`, `Pace Note`)로의 가입 전환을 유도하기 어려웠습니다. 이에 **서비스 중심의 웹 플랫폼**으로의 대대적인 메인 랜딩 리뉴얼을 집행했습니다.

### 4-2. 레이아웃 재구성 및 Bento Box 도입
* **Hero & Belief (철학 유지)**: 브랜드 고유의 진정성을 나타내는 철학적 영감은 그대로 유지.
* **Journey (커리어 축약 및 스토리 브릿지화)**: 7개의 연도별 상세 타임라인을 3단계 핵심 스토리텔링으로 요약하여 시선이 자연스레 하단 서비스 소개로 가도록 시각적 화살표 브릿지 설계.
* **Work (Bento Box 기반 쇼케이스 승격 및 CTA 배치 ⭐️)**:
  * 3단 단순 프로젝트 카드를 해체하고, Daily Digest와 Pace Note를 와이드 화면으로 분리해 각각의 핵심 앱 목업과 구독 버튼 배치.
  * **Daily Digest**: `✨ 하루 5분, 다이제스트 무료 구독` CTA 전면화.
  * **Pace Note**: `✨ 3초 만에 로그인하고 나만의 궤도 만들기` CTA 전면화.
  * **PriSincera Base**: 브랜드의 근본을 드러내는 소개 영역은 서브 카드로 톤 다운하여 하단 배치.

---

## 5. 백엔드 파이프라인 (`prisignal-composer`) 리팩토링 (2026-05)

### 5-1. 기술 부채(Technical Debt) 진단 및 위험 요소
* **God Class (SRP 위반)**: `composer.mjs` 하나가 API 호출, 스코어링 계산, 메일 HTML 빌드 및 Nodemailer 발송까지 전담하여 안정성이 낮았습니다.
* **GCS 상태 관리 부채**: 구독자 리스트와 시그널 메인 인덱스를 데이터베이스가 아닌 Cloud Storage의 JSON 덮어쓰기 방식으로 처리해 파일 잠금 및 트랜잭션 충돌 이슈가 상존했습니다.
* **네트워크 일시 지연 대응 무**: 외부 API(Gemini AI) 및 SMTP 서버 전송 오류 발생 시 지수 백오프(Retry) 로직이 전무하여 배치 실패 확률이 존재했습니다.

### 5-2. 3단계 리팩토링 이행 스펙
1. **아키텍처 레이어 모듈화**:
   * `composer.mjs`는 전체 조율(Controller)만 담당.
   * `ScoringService.mjs`(Gemini AI 및 스코어링 전담), `MailService.mjs`(HTML 렌더링 및 SMTP 발송 전담), `DailyRepository.mjs`(Firestore DB 인터페이스 전담)로 모듈 완전 독립 분리.
2. **GCS 레거시 청산 및 Firestore 전면 도입**:
   * 구독자 정보 및 데일리 데이터 관리를 GCS JSON 파일에서 Firestore 컬렉션(`daily_signals`, `subscribers`)으로 마이그레이션 및 낡은 Fallback 코드 완전 삭제.
3. **네트워크 탄력성 및 안정성(Robustness) 보장**:
   * 지수 백오프 기반 API 호출 재시도 패턴 주입.
   * `Promise.allSettled`를 도입하여 일부 유저에게 메일 발송이 실패해도 전체 발송이 깨지지 않도록 비동기 전송의 결합도를 낮추고, 실패한 이메일은 `failed_emails` 컬렉션에 적재해 예외 복구 대기열 마련.

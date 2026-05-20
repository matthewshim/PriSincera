# PriSincera 서비스 통합 방안 및 완료 보고 (PriSignal + PriStudy ➔ Daily Digest)

## 1. 배경 및 필요성
과거 PriSincera 생태계 내에서 분리되어 운영되던 **PriSignal(IT 트렌드 인사이트)**과 **PriStudy(실무 지식 학습: 비즈니스 일본어 & AI 프롬프트)**는 파편화된 사용자 경험(UX)과 유지보수의 어려움을 초래했습니다. 이를 해결하기 위해 두 서비스를 **"PriSincera Daily Digest"**라는 하나의 강력한 데일리 피드 경험으로 성공적으로 통합 완료했습니다.

---

## 2. 통합 서비스: "PriSincera Daily Digest" (적용 완료)

사용자는 매일 아침 배달되는 단 하나의 대시보드(피드)를 통해 모든 가치를 소비합니다. 

### 2.1 UI/UX 및 디자인 시스템 통합
*   **통합 아카이브 (Masonry Grid):**
    *   메인 페이지(`/daily`)에서는 과거 발행된 다이제스트 목록을 핀터레스트(Pinterest) 스타일의 Masonry Grid 형태로 세련되게 나열합니다.
*   **서비스 소개 (Bento Box & Interaction):**
    *   기존의 PriSignal/PriStudy라는 개별 브랜딩을 제거하고, 서비스 본연의 가치(큐레이션, 실무 프롬프트, 어학, 잔디심기)를 트렌디한 **Bento Box** 레이아웃과 스크롤 인터랙션(Reveal 애니메이션)을 통해 직관적으로 소개합니다.
*   **통합 데일리 피드 (Detail View):**
    *   특정 날짜를 클릭하면, 해당 일자의 IT Tech Signal, AI 프롬프트 1-Pick, 비즈니스 일본어 1-Pick이 하나의 페이지 안에서 섹션별로 매끄럽게 이어집니다. 
*   **통합 잔디 심기 (Streak Dashboard):**
    *   단순한 버튼 형태에서 벗어나, GitHub 스타일의 14일 연속 **Growth Streak Dashboard**를 구현했습니다. 구글 로그인 및 데일리 열람 완료 시 인터랙티브한 잔디가 심어지며 사용자 리텐션을 극대화합니다.
*   **CTA 및 구독 경험 고도화:**
    *   사용자 친화적인 구독(Subscribe) 및 언제든 원할 때 쉽게 해제할 수 있는 구독 취소(Unsubscribe) UI를 구축하여 프리미엄 구독 경험을 제공합니다.

### 2.2 이메일 및 API 파이프라인 통합
*   **원빌드(One-Build) 메일링:** 
    *   매일 아침 발송되는 단일 뉴스레터 템플릿에 세 가지 트랙의 핵심 요약본을 담아 발송합니다.
*   **구독 및 해제 API:**
    *   프론트엔드와 직접 통신하는 `/api/subscribe`, `/api/unsubscribe` 엔드포인트를 통해 원클릭 이메일 구독/해제 처리를 지원합니다.

---

## 3. 백엔드 및 아키텍처 (현행)

프론트엔드는 통합되었으나, 안정성을 위해 백엔드 파이프라인의 물리적 독립성은 유지하고 논리적으로만 통합했습니다.

### 3.1 API 엔드포인트 통합
*   **엔드포인트:** `/api/daily/index` (목록 반환) 및 `/api/daily/:date` (상세 반환)
*   서버(server.mjs)에서 Firestore의 `signals` 컬렉션과 `study_content` 컬렉션을 동시에 조회(`Promise.all`)하여 하나의 종합된 JSON 응답으로 프론트엔드에 전달합니다.

### 3.2 데이터 수집 파이프라인
*   데이터를 생성하는 `collector.mjs`(Signal)와 `study-composer.mjs`(Study)는 각각의 특수성(AI 스코어링 방식 차이 등)을 고려하여 기존처럼 **독립적으로 스케줄링되어 실행**됩니다.

---

## 4. 진행 현황 및 향후 계획

### ✅ 완료된 로드맵 (Phases 1 & 2)
*   **[완료] Phase 1: API Aggregation 및 백엔드 통합:** `/api/daily` 브릿지 API 신설 및 DB 스키마 논리적 병합
*   **[완료] Phase 2: 프론트엔드 UI/UX 통합:** `DailyDigest.jsx`로의 컴포넌트 통폐합, Bento Box 인트로 및 Masonry 아카이브 적용, Streak Dashboard 구현, 구독 CTA 고도화

### 🚀 향후 과제 (Phase 3)
*   **Phase 3: 개인화(Personalization) 및 레거시 청산**
    *   로그인 사용자를 위한 관심사 필터링 (원하는 트랙만 피드에 노출)
    *   잔존해 있는 구버전 라우트(`/signal`, `/study`) 하드 리다이렉트 완전 적용 및 데드 코드(Dead Code) 제거
    *   새로 적용된 프리미엄 CTA 디자인을 통한 실제 구독 전환율(Conversion Rate) 데이터 모니터링 및 분석

# 📚 PriSincera Documentation Index

PriSincera 프로젝트의 모든 기획, 디자인, 엔지니어링 문서는 이 페이지를 통해 체계적으로 탐색할 수 있습니다. 
새로 합류한 개발자나 AI 에이전트는 프로젝트 구조 및 비즈니스 철학을 파악할 때 이 인덱스를 가장 먼저 정독해 주세요.

---

## 💼 Business & Product (비즈니스 및 제품 기획)
퍼스널 브랜드의 비전, 서비스 포지셔닝 및 서브 비즈니스 모델에 관한 기획서입니다.
- **[PriSincera Business](business/PriSincera_Business.md)**: 전체 비즈니스 모델, BM, 주요 대상 고객 정의서
- **[PriSincera Branding](business/PriSincera_Branding.md)**: 브랜드 아이덴티티, 로고, 컬러, 슬로건 등 비주얼 브랜드 가이드라인
- **[Pace Note Strategy](business/PriSincera_PaceNote.md)**: 마이크로 트래커 기반 액션 플랫폼 'Pace Note' 서비스 개요 및 AI 설계서
- **[Builders Log Guide](business/PriSincera_BuildersLog_Publishing_Guide.md)**: 빌더스 로그 퍼블리싱 시나리오 및 관리자 발행 워크플로우

## 🎨 Design & UX/UI (디자인 시스템 및 사용자 경험)
사용자 경험(UX/UI), 프론트엔드 모션 원칙, 컬러 스키마 사양서입니다.
- **[Design System](design/PriSincera_DesignSystem.md)**: 컬러 토큰, 타이포그래피, 마이크로 그리드, 공통 컴포넌트 디자인 가이드
- **[Daily Digest Calendar UI](design/PriSincera_Daily_Calendar_UI.md)**: 인터랙티브 캘린더 그리드(Chrono-Calendar) 및 0-Lag 퀵피크 UX 구현 명세서
- **[PaceNote Weekly Calendar UI](design/PriSincera_PaceNote_Calendar_UI.md)**: 분기별 13주 벤트 박스 매트릭스 기반 주차별 캘린더 & 항해 지평선 UI 구현 명세서
- **[OG Image Strategy](design/PriSincera_OGImage.md)**: 동적 Open Graph 이미지 자동 생성 아키텍처 및 렌더링 규격
- **[BI Centered UX Guide](design/PriSincera_BI_Centered_Renewal.md)**: 화려함을 걷어내고 철학과 가독성을 극대화한 절제된 프리미엄 다크 테마 디자인 수칙


## 🏗️ Architecture & Development (아키텍처 및 백엔드 개발)
시스템 엔지니어링, 보안 표준, 스케일업 전략, AI 자동화 파이프라인 설계서입니다.
- **[Development Guide](architecture/PriSincera_DevelopmentGuide.md)**: 로컬 개발 환경 셋업, Git 브랜치 전략, 코드 린팅 규격
- **[Security Audit](architecture/PriSincera_SecurityAudit.md)**: 보안 취약점 점검 결과 및 대응 조치 가이드 (XSS 방어, Rate Limit 등)
- **[Scaling Plan](architecture/PriSincera_ScalingPlan.md)**: 트래픽 급증에 대비한 GCP Cloud Run 다중 인스턴스 및 DB 샤딩 로드맵
- **[Builders Log Admin Integration](architecture/PriSincera_BuildersLog_Admin_Integration.md)**: 정적 리소스의 Git-less Commit 자동화를 위한 GitHub REST API 기반 CMS 아키텍처
- **[PaceNote AI Engine](architecture/PriSincera_PaceNote_AI_Expansion.md)**: AI 추천 가이드 자동 시딩 및 스스로 학습하는 프롬프트 피드백 루프 / Dynamic Eviction 알고리즘 명세
- **[API Usage Analysis](architecture/PriSincera_API_Usage_Analysis.md)**: AI 커밋 자동 매칭에 따른 API 사용량, 토큰 한도 및 GCP 과금 안정성 분석 리포트
- **[Authentication Architecture](architecture/PriSincera_Authentication_Architecture.md)**: JWT 및 쿠키 미들웨어를 활용한 Admin 대시보드 로그인 및 권한 검증 흐름도

---

## 🗄️ Archive (완료된 리팩토링 및 레거시 보관소)
서비스 개편(Daily Digest로의 통합 완수) 및 주요 마일스톤 완료에 따라 역사적 참고용으로 보관된 과거 문서입니다.

### 💼 Business & Product Archive
- [Index Renewal Plan (26-05)](archive/PriSincera_Index_Renewal.md): 메인 페이지의 서비스 중심 개편 및 Bento Box 적용 기획안
- [Service Integration Report (26-05)](archive/PriSincera_Service_Integration.md): PriSignal + PriStudy의 Daily Digest 통폐합 완료 보고서
- [PriSignal Overview](archive/PriSincera_PriSignal.md): 과거 독립 서비스 시절의 PriSignal IT Curation 기획서
- [PriStudy Overview](archive/PriSincera_PriStudy.md): 과거 독립 서비스 시절의 PriStudy 마이크로러닝 기획서
- [PriStudy Expansion Plan](archive/PriSincera_Study_Phase3_Expansion.md): 독립 앱 시절 기획된 어학 과목 추가 확장 전략 제안서

### 🎨 Design & UX/UI Archive
- [Mobile Nav UX Plan](archive/PriSincera_MobileNavUX.md): 모바일 반응형 햄버거 메뉴 및 오버레이 전체 화면 GNB 개선안
- [Daily Signal UX Spec](archive/PriSincera_DailySignalUX.md): 구버전 PriSignal 목록 및 데일리 상세 페이지 인터랙션 사양서
- [Signal UX Redesign Report](archive/PriSincera_SignalUX_Redesign.md): 카드 스태거 진입, 커서 최적화, 에디터 코멘트 리디자인 구현 완료서
- [Subscribe UX Report](archive/PriSincera_SubscribeUX.md): 플로팅 구독 CTA 및 소셜 프루프 컴포넌트 릴리즈 완수 보고서
- [Email Renewal Plan](archive/PriSincera_EmailRenewal.md): 중복 이메일 발송(Double Dispatch) 방지를 위한 선행 락(Pending Lock) 설계 기획안
- [Email Design Archive](archive/PriSincera_EmailDesign.md): 구버전 이메일 HTML 템플릿 마크업 분석 및 개선 내역
- [Email Migration Archive](archive/PriSincera_EmailMigration.md): 외부 서비스(Buttondown)에서 자체 SMTP 이메일 엔진으로의 전환 마이그레이션 일지

### 🏗️ Architecture Archive
- [PriStudy MVP Plan](archive/PriSincera_PriStudy_MVP.md): 독립 어학 서비스 시절의 MVP 구축 계획 및 초기 Firestore 스키마
- [Main Page Plan](archive/PriSincera_MainPagePlan.md): 2024년 론칭 당시의 초기 메인 페이지 레이아웃 기획서 (완료됨)
- [Pipeline Refactoring Archive](archive/PriSincera_PipelineRefactoring.md): 파이프라인 모듈화 및 GCS(Google Cloud Storage) 기술 부채 청산 내역

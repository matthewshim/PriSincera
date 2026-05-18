# PriSincera Builder's Log 프론트엔드 구조 개선 및 블로그 아키텍처 기획

## 1. 현재 구조의 문제점 (Current Limitations)
현재 `src/pages/BuildersLog.jsx`는 `chapters` 배열에 하드코딩된 단락(description) 단위의 텍스트를 카드 형태로 한 페이지에 모두 나열하는 **단일 페이지(Single-Page) 스크롤 뷰** 구조입니다. 
- **확장성 부족:** `docs` 폴더 내의 방대한 아키텍처, 고민, 철학이 담긴 전문적인 마크다운(MD) 문서들을 하나의 페이지에 모두 담으면 UI가 무너지고 스크롤이 끝없이 길어집니다.
- **SEO 한계:** 각 콘텐츠(주제)별로 고유한 URL이 존재하지 않아, 검색 엔진 최적화(SEO) 및 외부 링크 공유(LinkedIn 퍼스널 브랜딩 등)가 불가능합니다.
- **가독성 저하:** 긴 호흡의 기술 아티클과 다이어그램, 코드를 담아내기에는 현재의 요약형 '카드 컴포넌트' 레이아웃이 적합하지 않습니다.

---

## 2. 구조적 개선 방향 (Architecture Redesign Strategy)

Builder's Log를 프리신세라의 공식 **'테크 블로그(Tech Blog) 시스템'**으로 격상시키기 위한 프론트엔드 라우팅 및 데이터 구조 개선안입니다.

### 2.1. URL 라우팅 분리 (List & Detail View)
기존의 단일 페이지를 두 개의 계층으로 분리합니다.
1. **목록 페이지 (`/builders-log`):**
   - 아티클들의 썸네일, 제목, 요약, 태그, 작성일이 나열된 갤러리/리스트 뷰.
   - 페이지네이션(Pagination) 또는 무한 스크롤(Infinite Scroll) 도입.
2. **상세 페이지 (`/builders-log/:slug`):**
   - `docs/`에 있는 방대한 마크다운 전문을 실제로 읽을 수 있는 뷰어 페이지.
   - 우측 목차(TOC, Table of Contents) 네비게이션 제공 및 코드 하이라이팅 적용.

### 2.2. 마크다운 렌더링 파이프라인 (MD Rendering Engine)
Vite 기반 React 환경에서 서버리스로 마크다운을 렌더링하기 위한 아키텍처입니다.

**[선택안 A] 로컬 정적 에셋(Static Asset) 방식 (추천 🌟)**
- **방식:** `docs`에 있는 MD 파일들을 정제하여 `public/content/logs/`에 저장합니다.
- **프론트엔드:** `react-markdown`, `remark-gfm`, `rehype-highlight` 라이브러리를 추가하여, 사용자가 상세 페이지에 접속하면 `fetch('/content/logs/article-name.md')`로 파일을 불러와 화면에 렌더링합니다.
- **장점:** 마크다운 파일만 폴더에 넣으면 배포 시 자동 적용되므로 개발자 경험(DX)이 압도적으로 뛰어납니다. Firestore 비용이 전혀 발생하지 않습니다.

**[선택안 B] Firestore 기반 CMS 구조**
- **방식:** 관리자 대시보드에 `[블로그 에디터]` 탭을 만들고, MD 본문을 Firestore DB에 저장합니다.
- **장점:** 코드를 수정/배포(Push)하지 않아도 관리자 페이지에서 바로바로 아티클을 수정하고 발행할 수 있습니다.
- **단점:** 초기 에디터 및 DB 구조 개발 리소스가 다소 큽니다.

*(PriSincera는 메이커 개인 주도 프로젝트이므로, VS Code에서 즉시 작성하고 Git으로 푸시하면 아티클이 퍼블리싱되는 **[선택안 A: 로컬 정적 방식]**이 퍼포먼스와 개발 효율성 측면에서 가장 적합합니다.)*

---

## 3. 실행 프로세스 (Execution Roadmap)

**Phase 1. 프론트엔드 라우터 및 UI 뼈대 공사**
- `react-router-dom`에 `/builders-log/:slug` 라우트 추가.
- 아티클 목록을 관리할 `src/data/buildersLogMeta.json` (메타데이터 리스트) 생성.
- `react-markdown` 패키지 설치 및 뷰어(ArticleView) 컴포넌트 디자인.

**Phase 2. 콘텐츠 이관 (Migration & Cleansing)**
- 현재 `docs/` 하위에 흩어진 `Architecture`, `Design` 관련 MD 파일들의 내용 중 기밀(보안 인증키 등)을 제외하고 블로그 포맷으로 윤문.
- `public/content/logs/` 로 이동.

**Phase 3. 부가 기능 적용**
- **SEO 메타태그 자동화:** 각 아티클 진입 시 `useSEO` 훅을 통해 해당 아티클의 제목과 요약으로 Open Graph 데이터 동적 변경.
- **코드 신택스 하이라이팅(Syntax Highlighting):** 소스 코드 설명 시 프리미엄 다크 모드에 어울리는 코드 테마 적용.

---

## 4. 결론
이 구조적 개편이 선행된다면, 향후 `docs`에 어떤 문서를 추가하든 별도의 UI 작업 없이 **MD 파일 업로드 + 메타데이터 1줄 추가**만으로도 즉각 고품질의 퍼스널 브랜딩 아티클이 퍼블리싱되는 **확장성 높은 블로그 시스템**이 완성됩니다.

# PriSignal Module C: 구독 전환 UX 고도화

## 현황 분석

### 현재 구독 터치포인트 (2개소)
| 위치 | 컴포넌트 | 문제점 |
|------|----------|--------|
| 히어로 상단 | PriSignalHero → SubscribeForm | 스크롤 시 즉시 사라짐 |
| 서비스 소개 하단 | PriSignalSubscribe → SubscribeForm | FAQ 전에 위치하여 도달률이 낮음 |

### 미존재 요소
- 플로팅 CTA (히어로 이탈 후 상시 접근 불가)
- 소셜 프루프 (신뢰 요소 없음)
- 데일리 시그널 탭 내 구독 유도
- 데일리 상세 페이지 내 효과적 CTA

## 구현 범위

### C-1. 플로팅 구독 CTA 바
- IntersectionObserver로 히어로 이탈 시 하단 슬라이드 인
- 48px 슬림 바, 글래스모피즘 배경
- 세션 동안 닫기 가능
- 모바일: CTA 버튼만 표시

### C-2. 소셜 프루프 배지
- 구독자 아바타 그룹 + 카운트 텍스트
- 히어로 구독 폼 하단에 표시

### C-3. 아카이브 하단 CTA
- 데일리 시그널 탭 목록 하단에 인라인 구독 폼

## 변경 파일
- FloatingCTA.jsx / .css (신규)
- SubscribeForm.jsx / .css (수정)
- PriSignal.jsx (수정)
- PriSignalArchive.jsx / PriSignal.css (수정)

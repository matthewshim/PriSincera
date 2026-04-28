# PriSignal Module C: 구독 전환 UX 고도화

> **최종 업데이트:** 2026-04-28  
> **상태:** ✅ 구현 완료 (배포됨)

---

## 구현 완료 사항

### C-1. 플로팅 구독 CTA 바 ✅
- **파일:** `src/components/prisignal/FloatingCTA.jsx` / `.css` (신규)
- `IntersectionObserver`로 히어로 섹션 이탈 시 하단 슬라이드업 노출
- 48px 슬림 바, 글래스모피즘 배경 (`backdrop-filter: blur(20px)`)
- 세션 동안 닫기 가능 (X 버튼)
- 모바일: CTA 버튼만 표시

### C-2. 소셜 프루프 배지 ✅
- **파일:** `src/components/prisignal/SubscribeForm.jsx`
- 구독자 아바타 그룹 + 카운트 텍스트
- 히어로 구독 폼 하단에 표시

### C-3. 인라인 구독 폼 (아카이브 + 데일리) ✅
- **파일:** `PriSignalArchive.jsx`, `PriSignalDaily.jsx`
- `<SubscribeForm variant="inline" />` props로 레이아웃 제어
- 아카이브 목록 하단 + 데일리 상세 하단 동일 배치
- 문구 통일: "시그널을 놓치고 계신가요?" + "매일 선별된 5개의 시그널을 이메일로 받아보세요."

### C-4. 구독 메타 폰트 일관성 ✅
- **파일:** `src/components/prisignal/SubscribeForm.css`
- `.subscribe-meta` 폰트: `var(--font-mono)` → `var(--font-body)` (디자인 시스템 준수)
- `font-size: 0.65rem` → `0.72rem`, `letter-spacing: 0.06em` → `0.02em`

---

## 변경 파일 요약

| 파일 | 유형 | 커밋 |
|------|------|------|
| `FloatingCTA.jsx` / `.css` | 신규 | `44068b2` |
| `SubscribeForm.jsx` / `.css` | 수정 | `44068b2`, `2c3b60f` |
| `PriSignal.jsx` | 수정 | `44068b2` |
| `PriSignalArchive.jsx` | 수정 | `ff97261` |
| `PriSignalDaily.jsx` | 수정 | `ff97261` |
| `PriSignal.css` | 수정 | `ff97261`, `a314f17` |
| `PriSignalDaily.css` | 수정 | `ff97261`, `a314f17` |

---

*최종 업데이트: 2026-04-28*

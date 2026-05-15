# Alpha v0.12.1 배포 보고서 — GitHub / Vercel 공개

작성일: 2026-05-15

## 요약

v0.12.1 카드-퍼즐 시너지 빌드를 GitHub 공개 저장소에 푸시하고, Vercel 프로덕션 URL로 공개 배포했다.

## 공개 위치

- GitHub: https://github.com/sgeniusk/ai-company-tycoon-boundaryless
- Vercel: https://ai-company-tycoon.vercel.app
- Vercel 배포 상세: https://vercel.com/gomgomee-s-projects/ai-company-tycoon/9siFU9naDiLogpAUUWryD9HoJRSt

## 배포 기준

- 브랜치: `main`
- 최신 기능 기준: `0.12.1-alpha`
- 주요 포함 기능:
  - 로그라이트 덱빌딩 기초
  - 개발 퍼즐 직접 선택 UI
  - 전략 카드의 퍼즐 점수, 난이도, 선택 제한 보정
  - 메타 해금과 새 런 시작 기반

## 검증 결과

- 로컬 게이트: `npm run harness:gate` 통과
- Vercel 빌드: `tsc && vite build` 통과
- 공개 URL 응답: `HTTP/2 200`

## 에이전트 리뷰

### Executive Producer Agent

- P0/P1 없음.
- 공개 링크가 확보되어 외부 피드백 루프를 시작할 수 있다.

### Systems Architect Agent

- P0/P1 없음.
- Vercel 설정은 `vercel.json`에 유지되며, 로컬 `.vercel` 연결 정보는 `.gitignore` 대상이다.

### QA Agent

- P0/P1 없음.
- 공개 URL이 정상 응답하며 빌드 산출물이 배포되었다.

### UX Agent

- P1 없음.
- 다음 검증에서는 Vercel 공개 URL 기준으로 신규 플레이어 30초 이해도와 모바일 화면 판독성을 다시 확인해야 한다.

## 다음 액션

1. v0.12.2에서 카드 보상 3지선다와 덱 편집을 추가한다.
2. 공개 URL 기준 브라우저 QA 시나리오를 추가한다.
3. Vercel 배포 링크를 기준으로 외부 테스터 보고서 포맷을 정리한다.

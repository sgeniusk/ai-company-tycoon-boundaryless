# v0.32-alpha QA 보고서

작성일: 2026-05-17

## 범위

로그라이트 재시작 설계 계산, 빠른 시작 payload, 메타 해금 추천 카테고리, 덱 메뉴 상단 배치, `restart-setup` QA URL, 미나 튜토리얼 추가.

## 자동 테스트

- `npm test -- src/game/meta-progression.test.ts src/game/qa-scenarios.test.ts src/game/tutorial-guide.test.ts src/ui/layout-contract.test.ts`
- 결과: 통과
- 파일/테스트: 4 files / 53 tests

- `npm run validate:data`
- 결과: 통과

- `npm run build`
- 결과: 통과

- `npm run harness:gate`
- 결과: 통과
- 파일/테스트: 35 files / 221 tests
- 추가 확인: 데이터 검증 통과, 프로덕션 빌드 통과

## 브라우저 QA

대상 URL:

- `http://127.0.0.1:5184/?scenario=restart-setup&menu=deck`

확인 결과:

- Browser DOM QA에서 `다음 런 설계실`, `안전 재시작`, 추천 해금 카테고리, 빠른 시작 텍스트 확인.
- 초반 `deck` QA 시나리오에서는 다음 런 설계실이 노출되지 않아 초반 덱 학습을 방해하지 않음.
- 콘솔 오류 0건.
- 데스크톱 1280x720에서 재시작 설계실이 우측 덱 콘솔 첫 화면에 표시됨.
- 모바일 390x844에서 가로 오버플로 없음.
- 모바일에서는 사무실 장면과 메뉴 시작부가 우선 보이며, 재시작 설계실은 덱 메뉴 내부 스크롤 아래쪽에 있음.

스크린샷:

- 데스크톱: `/tmp/ai-company-v032-restart-setup-desktop.png`
- 모바일: `/tmp/ai-company-v032-restart-setup-mobile.png`

## 확인한 동작

- 실패/위험 런은 `복구 런 설계` 초점을 만든다.
- 현금이 0 이하이면 `현금 흐름 붕괴` 경고가 표시된다.
- 신뢰가 낮으면 `평가 하네스 기억`이 품질/신뢰 추천 후보로 올라온다.
- 빠른 시작 payload로 `resetRunWithMetaUnlocks()`를 호출하면 다음 런 번호, 해금 목록, 시작 덱, 런 기록이 함께 갱신된다.
- `restart-setup` QA URL은 새 런 수락 전 상태를 유지한다.
- 10개월 이후 처음 덱 메뉴에 들어온 플레이어는 `next_run_setup` 미나 튜토리얼을 받는다.

## 위험 및 후속 조치

- P1: 모바일에서는 다음 런 설계실이 첫 뷰포트 밖으로 내려가므로 v0.33 이후 덱 메뉴 상단 요약을 더 줄인다.
- P1: 추천 해금 점수식이 장기적으로 한 후보에 쏠리는지 10년 시뮬레이션에서 분포를 확인한다.
- P2: 추천 해금 버튼에 새로 열리는 카드의 실제 효과 미리보기를 붙인다.

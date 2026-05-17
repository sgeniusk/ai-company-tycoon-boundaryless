# v0.21-alpha QA 보고서

작성일: 2026-05-17

## 확인 범위

- 20인 페르소나 데이터 검증
- `runPersonaPlaytestReview()` 하네스
- `?scenario=persona20` QA URL
- 우측 보조 패널 탭 구조
- Vite 청크 분리 설정

## 자동 테스트

1차 계약 테스트:

- `npm test -- src/game/content.test.ts src/game/persona-playtest.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts src/ui/build-config.test.ts`
- 결과: 통과
- 범위: 5개 파일, 39개 테스트

전체 게이트:

- `npm run harness:gate`
- 결과: 통과
- 범위: 27개 테스트 파일, 178개 테스트
- 데이터 검증: 통과
- 프로덕션 빌드: 통과
- 빌드 청크: `game-data`, `react-vendor`, `index`로 분리되어 기존 대형 청크 경고가 사라짐

브라우저 QA:

- URL: `http://127.0.0.1:5179/?scenario=persona20`
- 스크린샷: `/tmp/ai-company-v021-persona20.png`
- 확인: QA pill, 20인 페르소나 타임라인, 로그 메뉴, 우측 탭 패널 표시

## QA 체크

- 20인 페르소나가 10:10 성비로 구성된다.
- 모든 페르소나가 벤치마크와 우려점을 가진다.
- 20인 보고서가 점수, 판정, 우선순위, 페르소나별 메모를 낸다.
- `persona20` 시나리오는 로그 메뉴로 진입한다.
- 우측 보조 패널은 탭 UI 계약을 가진다.
- Vite 설정은 `react-vendor`, `game-data` 청크를 분리한다.

## 잔여 리스크

- 우측 탭 구조가 데스크톱에서는 좋아졌지만, 모바일에서는 추가 터치 QA가 필요하다.

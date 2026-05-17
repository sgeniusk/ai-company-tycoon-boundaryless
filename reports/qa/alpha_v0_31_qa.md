# v0.31-alpha QA 보고서

작성일: 2026-05-17

## 범위

덱 시너지 데이터, 활성 조건 계산, 월간 전략 효과 반영, 카드 효과 보너스, 덱 메뉴 표시, `deck-synergy` 브라우저 QA 시나리오.

## 자동 테스트

- `npm test -- src/game/qa-scenarios.test.ts src/game/deckbuilding.test.ts src/ui/layout-contract.test.ts`
- 결과: 통과
- 파일/테스트: 3 files / 63 tests

- `npm run validate:data`
- 결과: 통과

- `npm run build`
- 결과: 통과

- `npm run harness:gate`
- 결과: 통과
- 파일/테스트: 34 files / 216 tests
- 추가 확인: 데이터 검증 통과, 프로덕션 빌드 통과

## 브라우저 스크린샷 QA

대상 URL:

- `http://127.0.0.1:5183/?scenario=deck-synergy&menu=deck`

확인 화면:

- 데스크톱: 1366x768, `/tmp/ai-company-v031-deck-synergy-desktop.png`
- 모바일: 390x844, `/tmp/ai-company-v031-deck-synergy-mobile.png`

확인 결과:

- 데스크톱 덱 메뉴에서 `런칭 머신` 활성 시너지와 다음 후보 빌드가 보인다.
- 월간 효과, 카드 보너스 배율, 부족 태그, 위험 문구가 덱 콘솔 안에 표시된다.
- 모바일에서는 고정 게임 화면과 덱 메뉴 진입이 유지된다.
- 모바일 덱 상세는 우측 콘솔 내부 스크롤 아래쪽으로 들어가므로 v0.32 이후 추가 압축이 필요하다.

## 확인한 동작

- 카드 태그가 `growth`, `market`, `product` 조건을 채우면 `launch_machine`이 활성화된다.
- 활성 덱 시너지의 월간 효과가 `calculateMonthlyEconomy()`의 `strategyEffects`에 합산된다.
- 활성 시너지 태그와 맞는 카드의 긍정 효과가 기본 효과보다 커진다.
- QA URL `?scenario=deck-synergy`가 덱 메뉴로 진입한다.
- 데이터 검증 하네스가 `deck_synergies.json`의 필수 필드, 월간 효과 리소스, 배율 범위를 검사한다.

## 위험 및 후속 조치

- P1: 장기 시뮬레이션에서 `런칭 머신`이 초반 사용자 증가를 과도하게 키우는지 확인한다.
- P1: 카드 보상 후보에 시너지 미리보기를 붙여 선택 이유를 더 선명하게 만든다.
- P2: 모바일 덱 메뉴 상단에 시너지 요약 한 줄을 더 압축해서 표시한다.
- P2: 미나 튜토리얼이 첫 시너지 활성 순간을 안내하도록 연결한다.

# v0.25-alpha 제작 보고서 — 콘텐츠 가속과 엔딩 커버리지

작성일: 2026-05-17

## 결론

한판은 하네스 기준으로 120개월, 즉 10년 엔딩까지 돈다. 이번 버전에서는 그 사실을 더 명확히 검증하기 위해 `evaluateEndToEndCampaignCoverage()`를 추가했고, 엔딩뿐 아니라 카드 보상 선택과 사무실 성장까지 함께 확인하도록 했다.

## 구현한 콘텐츠

- 전략 카드: 11장 → 19장
- 로그라이트 메타 해금: 3개 → 8개
- 시작 덱: 4개 → 7개
- 사무실 확장 단계: 4단계 → 6단계
- 사무실 장식 시너지: 4개 → 8개
- 아이템: 37개 → 45개

## 추가된 방향성

- 덱빌딩: 합성 사용자 실험, 연산 차익 거래, 로봇 랩 야간조, 칩 공급, AI 카페 팝업 같은 카드로 빌드 성향을 넓혔다.
- 로그라이트: 합성 실험실, 라이벌 전쟁실, 로봇공학 씨앗, 연산 공급, 경계 없는 브랜드 기억을 추가했다.
- 회사 운영/공간 성장: 지역 총괄 본부와 바운더리리스 캠퍼스를 추가해 후반 사무실 성장 목표를 만들었다.
- 공간 시너지: 플레이테스트 시네마, 로봇 차고 라인, 칩 랩 코너, 경계 없는 쇼룸을 추가했다.

## 하네스 에이전트 판단

- Executive Producer Agent: 이제 `v0.25`는 “끝까지 도는가”와 “콘텐츠 풀이 충분히 늘었는가”를 동시에 검증한다.
- Deck System Engineer: 시작 덱이 7개로 늘어 런 시작 선택지가 의미 있게 늘었다.
- Roguelite Meta Engineer: 메타 해금이 8개로 늘어 실패 후 재시작 동기가 더 선명해졌다.
- Solo Dev Scope Agent: 콘텐츠는 JSON 중심으로 확장해 코드 유지 부담을 낮췄다.
- Balance Simulation Engineer: 새 콘텐츠는 일단 하네스 게이트에 들어갔고, 다음 단계에서 카드 체인 악용과 사무실 경제를 따로 조정해야 한다.

## 다음 작업

- v0.26: 사무실 화면에서 확장 단계와 배치 슬롯을 더 직접적으로 보여준다.
- v0.27: 카드 조합/시너지/희귀도별 덱 방향을 더 강하게 만든다.
- v0.28: 새 런 시작 화면에서 메타 해금과 시작 덱 선택을 더 게임답게 보여준다.

## 검증

- `npm test -- src/game/run-simulator.test.ts src/game/content-expansion.test.ts` 통과
- `npm test -- src/game/annual-strategy-advisor.test.ts src/game/office.test.ts src/game/run-simulator.test.ts src/game/content-expansion.test.ts` 통과
- `npm run harness:gate` 통과, 30개 테스트 파일 / 193개 테스트
- 데이터 검증 통과
- 프로덕션 빌드 통과

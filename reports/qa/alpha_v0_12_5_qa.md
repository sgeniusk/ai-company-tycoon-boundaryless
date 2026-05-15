# Alpha v0.12.5 QA 보고서

작성일: 2026-05-16

## 범위

이번 QA는 런 결과 스포트라이트, 새 런 기록, 제품 도메인 필터, 저장 호환성을 확인했다.

## 자동 검증

| 항목 | 결과 |
|---|---|
| 런 결과 대표 제품 표시 | 통과 |
| 런 결과 대표 카드 표시 | 통과 |
| 런 결과 경쟁사 압박 표시 | 통과 |
| 실패 런 회복 조언 표시 | 통과 |
| 새 런 시작 시 런 기록 저장 | 통과 |
| 제품 도메인 필터 생성 | 통과 |
| 잠긴 도메인 필터 표시 | 통과 |
| `?scenario=result` 생성 | 통과 |
| 저장/불러오기 호환 | 통과 |

## 실행 명령

- `npm test -- src/game/run-summary.test.ts src/game/product-filters.test.ts src/game/qa-scenarios.test.ts src/game/deckbuilding.test.ts src/game/save-integrity.test.ts`: 통과, 32 tests.
- `npm run build`: 통과.

## 브라우저 QA 체크리스트

확인 URL:

- `http://localhost:5173/?scenario=result`
- `http://localhost:5173/?scenario=staffing`
- `http://localhost:5173/?scenario=deck`

| 항목 | 결과 |
|---|---|
| 결과 카드에 대표 제품/카드/경쟁 압박 표시 | 통과 |
| 창업 통찰 보상 breakdown 표시 | 통과 |
| `통찰 받고 새 런` 버튼 표시 | 통과 |
| 버튼 클릭 후 런 2, 통찰 14 상태로 새 런 시작 | 통과 |
| 새 런 이후 덱 메뉴에 최근 런 기록 표시 | 통과 |
| 제품 메뉴에 산업 필터 표시 | 통과 |
| 제품 필터가 잠김 도메인 조건과 후보 제품을 함께 표시 | 통과 |

## 이슈

- P0/P1 없음.
- P2: 제품 필터의 잠금 조건은 현재 능력치 ID 기반으로 표시된다. 다음 버전에서 능력치 한글명으로 더 다듬는 것이 좋다.
- P2: 좁은 모바일 폭에서 결과 카드와 필터가 겹치지 않는지 추가 확인하면 더 안전하다.

## 결론

v0.12.5는 자동 검증, 빌드, Chrome 브라우저 QA 기준으로 다음 단계 진행 가능하다.

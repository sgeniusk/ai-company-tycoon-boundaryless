# v0.41-alpha QA 보고서 — 사무실 픽셀 시뮬레이션

작성일: 2026-05-19

## 검증 범위

- 데이터 기반 사무실 오브젝트 로딩
- 사무실 구획 활성/잠금 표시
- 사람, AI 에이전트, 로봇 액터 상태 표시
- QA URL `?scenario=office-visuals`
- 고정 게임 화면 레이아웃 계약

## 자동 테스트

명령:

```bash
npm test -- src/game/office-scene.test.ts src/game/qa-scenarios.test.ts src/game/content-expansion.test.ts src/ui/layout-contract.test.ts
```

결과:

- 4 files passed
- 64 tests passed

전체 게이트:

```bash
npm run harness:gate
```

결과:

- 40 files passed
- 285 tests passed
- Data validation passed
- Production build passed

## 확인 항목

| 항목 | 결과 |
|---|---|
| `office_scene.json` 오브젝트 10개 이상 | Pass |
| 캠퍼스 연구동 상태에서 연산 베이/로봇 베이/칩 랩 표시 | Pass |
| 경계 없는 쇼룸은 5단계 전 잠금 이유 표시 | Pass |
| 제품 배치 직원이 `working` 상태로 표시 | Pass |
| 낮은 충성도 직원이 `warning` 상태로 표시 | Pass |
| 로봇 타입이 별도 액터로 표시 | Pass |
| reduced-motion 환경에서 애니메이션 비활성화 계약 | Pass |

## Browser QA

URL:

- `http://127.0.0.1:5201/?scenario=office-visuals`

결과:

- QA pill: `v0.41 사무실 픽셀 시뮬레이션 QA`
- 사무실 오브젝트 10개, 모바일 표시 오브젝트 6개
- 액터 6명/기, 표시 액터 6명/기
- 로봇 1기, 작업 상태 1명, 경고 상태 1명
- 운영 의제 카드 3개
- 가로 오버플로 없음
- 콘솔 런타임 오류 없음

## 잔여 리스크

- 현재 픽셀 그래픽은 CSS 기반 플레이스홀더다. 실제 에셋으로 교체할 때 좌표/레이어 충돌 QA가 필요하다.
- 액터 클릭 상호작용은 아직 없다. v0.42에서 직원 상세/케어 액션 연결이 필요하다.

# v0.42-alpha QA 보고서 — 사무실 액터 클릭

작성일: 2026-05-19

## 검증 범위

- 액터 클릭/선택 상태
- 직원 포커스 패널
- 작업/경고 상태별 추천 메뉴 라우팅
- 모바일 압축 표시
- 레이아웃 계약

## 자동 테스트

명령:

```bash
npm test -- src/game/office-scene.test.ts src/ui/layout-contract.test.ts
```

결과:

- 2 files passed
- 28 tests passed

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
| 작업 중 액터가 제품 메뉴 액션을 가진다 | Pass |
| 케어 경고 액터가 에이전트 메뉴 액션을 가진다 | Pass |
| 액터가 `pointer-events: auto`로 클릭 가능하다 | Pass |
| 선택 패널이 고정 게임 화면 안에 절대 배치된다 | Pass |
| 체력/충성도 미터가 2열로 표시된다 | Pass |
| reduced-motion 계약을 유지한다 | Pass |

## Browser QA

URL:

- `http://127.0.0.1:5201/?scenario=office-visuals`

결과:

- QA pill: `v0.42 사무실 액터 QA`
- 액터 버튼 6개
- 기본 포커스 패널 1개
- 경고 액터 1명, 작업 액터 1명
- 작업 중 액터 클릭 후 포커스 버튼이 `프로젝트 보기`로 변경
- 포커스 액션 클릭 후 제품 메뉴로 이동
- 프로젝트 정보 카드는 포인터를 통과해 액터 클릭을 막지 않음
- 가로 오버플로 없음
- 콘솔 런타임 오류 없음

## 잔여 리스크

- 아직 패널에서 휴식/연봉 협상/배치 변경을 직접 실행하지는 않는다.
- 실제 픽셀아트가 들어오면 클릭 히트박스와 말풍선 충돌을 다시 확인해야 한다.

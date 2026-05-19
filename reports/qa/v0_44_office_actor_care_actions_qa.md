# v0.44-alpha QA 보고서 — 사무실 액터 직접 케어 액션

작성일: 2026-05-19

## 자동 검증

- `npm test -- src/ui/layout-contract.test.ts src/game/qa-scenarios.test.ts`
  - 결과: 통과
  - 범위: 2 files / 61 tests
- `npm test -- src/game/staff-career.test.ts src/game/office-scene.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 범위: 4 files / 93 tests
- `npm run build`
  - 결과: 통과
- `npm run harness:gate`
  - 결과: 통과
  - 범위: 40 files / 287 tests, 데이터 검증 통과, 프로덕션 빌드 통과

## 브라우저 QA

URL:

- `http://127.0.0.1:5201/?scenario=office-visuals`

확인 결과:

- QA 라벨: `v0.44 액터 케어/사무실 액터 QA`
- 포커스 패널 직접 케어 버튼: `즉시 휴식`, `연봉 협상`
- `연봉 협상` 클릭 후 타임라인: `연봉 협상: 시골 운영 도우미 충성도 회복, 월 유지비 상승`
- `즉시 휴식` 클릭 후 타임라인: `유급 휴식: 프롬프트 설계가 컨디션 회복`
- 가로 오버플로: 없음

## 판정

P0/P1 없음. 포커스 패널 직접 케어 액션은 다음 작업으로 넘길 수 있다.

## 남은 리스크

- 작업 중 액터의 프로젝트 배치 변경/해제는 아직 직접 실행되지 않는다.
- 케어 성공 후 사무실 말풍선/플래시 연출은 아직 없다.

# v0.47-alpha QA 보고서 — 시트 프리뷰와 깊이 정렬

작성일: 2026-05-19

## 자동 검증

- `npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts src/game/qa-scenarios.test.ts`
  - 결과: 통과
  - 범위: 3 files / 70 tests
- `npm run harness:gate`
  - 결과: 통과
  - 범위: 40 files / 291 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- `curl -I http://127.0.0.1:5201/?scenario=office-visuals`
  - 결과: 200 OK
- `curl -I http://127.0.0.1:5201/assets/sprites/v046-agents-hires.png`
  - 결과: 200 OK, `Content-Type: image/png`
- `curl -I http://127.0.0.1:5201/assets/sprites/v046-office-objects-hires.png`
  - 결과: 200 OK, `Content-Type: image/png`

## 검증 범위

- `asset_manifest.json` 버전이 `0.47-alpha`로 올라갔다.
- 고밀도 캐릭터/오브젝트 시트에 `density: 2`와 `preview_frames`가 있다.
- 모든 preview frame index는 각 시트의 `frame_count` 범위 안에 있다.
- `GameChrome`은 QA 시나리오에서 `OfficeSpriteSheetInspector`를 렌더링한다.
- 프리뷰 프레임은 기존 `getSpriteSheetFrameStyle` slicing 경로를 재사용한다.
- 사무실 구획, 장식, 액터가 y좌표 기반 깊이 스타일을 받는다.

## 남은 리스크

- Playwright 기반 스크린샷 자동 검증은 현재 로컬 Codex Node REPL에서 모듈을 찾지 못해 아직 보류 상태다.
- 실제 AI 생성 시트 교체 후에는 투명 배경, 프레임 기준점, 행 순서, 모바일 프리뷰 압축 상태를 다시 확인해야 한다.

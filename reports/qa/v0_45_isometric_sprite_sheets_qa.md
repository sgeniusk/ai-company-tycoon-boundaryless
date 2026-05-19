# v0.45-alpha QA 보고서 — 고해상도 픽셀 시트 기반 사무실

작성일: 2026-05-19

## 자동 검증

- `npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 범위: 2 files / 34 tests
- `npm run validate:data`
  - 결과: 통과
- `npm run build`
  - 결과: 통과
- `npm run harness:gate`
  - 결과: 통과
  - 범위: 40 files / 290 tests, 데이터 검증 통과, 프로덕션 빌드 통과

## 에셋 생성/응답 확인

- `npm run assets:v045`
  - 결과: 통과
  - 산출물:
    - `public/assets/sprites/v045-agents.png`
    - `public/assets/sprites/v045-office-objects.png`
    - `public/assets/backgrounds/v045-isometric-office.png`
- `curl -I http://127.0.0.1:5201/assets/sprites/v045-agents.png`
  - 결과: 200 OK, `Content-Type: image/png`
- `curl -I http://127.0.0.1:5201/assets/sprites/v045-office-objects.png`
  - 결과: 200 OK, `Content-Type: image/png`
- `curl -I http://127.0.0.1:5201/assets/backgrounds/v045-isometric-office.png`
  - 결과: 200 OK, `Content-Type: image/png`
- `curl -I http://127.0.0.1:5201/?scenario=office-visuals`
  - 결과: 200 OK

## 브라우저 QA

URL:

- `http://127.0.0.1:5201/?scenario=office-visuals`

상태:

- Playwright 런치가 로컬 Codex Node REPL 환경에서 120초 타임아웃되어 DOM 스크린샷 자동 검증은 완료하지 못했다.
- 정적 산출물 미리보기로 캐릭터 시트, 오브젝트 시트, 배경 PNG는 확인했다.

## 판정

P0 없음. P1은 브라우저 자동 스크린샷 검증 보류 1건이다.

## 남은 리스크

- 실제 AI 생성 시트로 교체하면 프레임 정렬, 투명 배경, 액터 기준점, 시각 대비를 다시 검증해야 한다.
- 아이소메트릭 좌표 보정은 아직 퍼센트 좌표를 그대로 쓰므로, 레퍼런스 수준의 바닥 그리드 정렬은 다음 패스에서 필요하다.

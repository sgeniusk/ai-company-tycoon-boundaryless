# v1.0 모바일 크롬 압축 QA

작성일: 2026-06-05

## 배경

모바일 메뉴 라벨 독만 반영된 첫 패스는 사용자가 체감하기에 부족했다. 하단 메뉴는 텍스트 중심이 되었지만, 상단 바/자원 HUD/명령줄이 여전히 게임 화면을 많이 덮어 “반영이 안 된 것처럼” 보였다.

## 반영 내용

- 모바일 첫 화면에서 `top-command-center`를 숨기고 브랜드 영역을 74px 수준으로 압축했다.
- 자원 HUD를 4개 핵심 지표 1줄로 줄였다. 5번째 이후 자원 타일과 보조 라벨/델타는 모바일 첫 화면에서 숨긴다.
- 명령줄을 `다음 달` 중심 1개 큰 버튼 + 3개 보조 버튼으로 압축했다.
- 하단 모바일 독은 아이콘+설명 혼합 대신 `운영 / 회사 / 성장 / 시장 / 더보기` 큰 글자 라벨만 보이게 유지했다.
- 레이아웃 계약 테스트에서 예전 “모바일 자원 HUD 2줄 보드” 요구를 “오피스를 가리지 않는 1줄 핵심 지표” 요구로 갱신했다.

## 브라우저 스모크

대상: `http://127.0.0.1:5201/`

- viewport: 535 x 734
- top bar: 74px
- game stage: 456px
- office scene: 434px
- office fraction of shell: 0.591
- resource strip: 42px, `gridTemplateRows: 42px`, `maxHeight: 42px`
- command row: 50px, `gridTemplateColumns: 222px 42px 42px 42px`
- launcher: 64px
- dock labels: `운영`, `회사`, `성장`, `시장`, `더보기`
- dock subtitles hidden: true
- visible resources: 4
- horizontal overflow: 0

## 검증

- `npx tsc --noEmit --pretty false`: 통과
- `npm test -- src/ui/layout-contract.test.ts -t "mobile bottom economy HUD|v1.0 mobile-first" --maxWorkers=1`: 3 passed
- `npm test -- src/ui/layout-contract.test.ts -t "v1.0" --maxWorkers=1`: 15 passed / 124 skipped
- `npm run build`: 통과
- `npm run harness:gate`: 통과, 54 files / 664 tests, data validation passed, beta readiness 15/15, route coverage 40/40, production build passed

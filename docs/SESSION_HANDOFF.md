# 세션 핸드오프 — AI Company Tycoon: Boundaryless

작성일: 2026-05-21

## 한 줄 요약

현재 빌드는 `v0.55-alpha`이고 다음 작업 목표는 `v0.56-alpha-playtest-slice-lock`이다. **카이로소프트식 AI 회사 경영 + 로그라이트 덱빌딩 + 10년 캠페인 + 경계 없는 산업 확장**을 목표로 하되, 다음 단계에서는 새 시스템보다 20~30분 플레이 가능한 웹 알파 검증 슬라이스를 잠근다.

## 현재 작업 위치

- 로컬 폴더: `/Users/taewookkim/Downloads/ai-company-tycoon`
- GitHub: `https://github.com/sgeniusk/ai-company-tycoon-boundaryless`
- 현재 브랜치: `main`
- 최신 구현 커밋: `df57811 Polish v0.55 mobile command hand QA`
- 현재 목표: `v0.56-alpha-playtest-slice-lock`
- 오늘 마감 상태: v0.55 스크린샷 QA와 모바일 하단 전략 손패 보정은 완료. 최종 원본 아트 교체는 `docs/ART_INTAKE.md`의 P2 작업으로 분리.
- 로컬 실행 주소: `http://127.0.0.1:5201/`
- 현재 시각 QA 진입 주소: `http://127.0.0.1:5201/?scenario=office-visuals`
- 현재 페르소나 QA 진입 주소: `http://127.0.0.1:5201/?scenario=persona20`
- 루트 시작 문서: `AGENTS.md`
- 구조화 상태 파일: `feature_list.json`, `progress.md`

## 실행과 검증

```bash
npm run dev -- --port 5201
npm run assets:v054
npm run assets:v053
npm run qa:office-visuals:screenshots
npm run harness:gate
./init.sh
```

최종 오브젝트/배경 원본을 받을 때:

```bash
npm run assets:v054 -- --objects-source <path-to-2560x1920-rgba-png> --backdrop-source <path-to-5120x2880-rgba-png>
```

최종 캐릭터 원본을 받을 때:

```bash
npm run assets:v053 -- --source <path-to-1152x9600-rgba-png>
```

최근 전체 검증 기준:

- `npm run qa:office-visuals:screenshots`: desktop 1366×768 / mobile 390×844 PNG 생성
- `file reports/qa/screenshots/v0_55_office_visuals_desktop.png`: 1366×768 PNG 확인
- `file reports/qa/screenshots/v0_55_office_visuals_mobile.png`: 390×844 PNG 확인
- `npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts`: 2개 테스트 파일 / 43개 테스트 통과
- `npm test -- src/game/qa-scenarios.test.ts src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts`: 3개 테스트 파일 / 78개 테스트 통과
- `npm run harness:gate`: 40개 테스트 파일 / 303개 테스트 통과
- 데이터 검증 통과
- 프로덕션 빌드 통과
- `?scenario=office-visuals` HTTP 200 OK

## 핵심 플레이 루프

1. 한국 시골 차고에서 작은 AI 회사를 시작한다.
2. 사람 직원과 AI 에이전트를 고용한다.
3. 소재/산업, 제품 타입, 파격 옵션을 조합해 제품 아이디어를 만든다.
4. 직원을 제품에 배치해 AI 모델/서비스를 개발한다.
5. 기존 제품은 메이저 업데이트, 리뉴얼, 파생 라인으로 다시 출시할 수 있다.
6. 카드와 개발 이슈 대응으로 완성도와 출시 결과를 올린다.
7. 경쟁사, 시장 충격, 연간 심사, 직원 사건이 회사를 흔든다.
8. 10년차 최종 평가까지 가거나 실패 후 통찰과 해금을 들고 새 런을 시작한다.

## 최근 완성된 버전

### v0.55-alpha

- `asset_manifest.json` 버전을 `0.55-alpha`로 올렸다.
- `scripts/qa/capture-office-visuals-screenshots.mjs`를 추가했다.
- `npm run qa:office-visuals:screenshots`가 `office-visuals`를 1366×768 desktop과 390×844 mobile PNG로 캡처한다.
- `visual_qa.office_visuals_v055_screenshot_qa` 계약을 추가했다.
- 스크린샷 산출물은 `reports/qa/screenshots/`에 저장한다.
- 모바일 headless 캡처에서 앱 셸이 왼쪽에서 잘리지 않도록 좁은 화면 정렬을 보정했다.
- 모바일 하단 전략 손패를 고정 4칸 HUD로 압축해 390×844 스크린샷에서 오른쪽으로 잘리지 않게 했다.
- `visual_qa.office_visuals_v055_screenshot_qa.checks`에 `mobile_command_hand_fit`을 추가했다.
- `office-visuals` QA 시나리오가 `v0.55 스크린샷 QA`로 열린다.

### v0.54-alpha

- `asset_manifest.json` 버전을 `0.54-alpha`로 올렸다.
- `scripts/assets/import-v054-office-art.mjs`를 추가했다.
- `npm run assets:v054`로 오브젝트 2560×1920 원본과 배경 5120×2880 원본을 검증하고 2x 런타임 PNG를 생성한다.
- `office_objects_v054_final_art_import`와 `office_isometric_v054_final_art_import` 계약을 추가했다.
- scene backdrop source/import metadata를 데이터 검증에 포함했다.
- `GameChrome`이 배치 장식 프롭과 사무실 배경을 v0.54 에셋에서 렌더링한다.
- `office-visuals` QA 시나리오가 `v0.54 오브젝트/배경 임포트 QA`로 열린다.

### v0.53-alpha

- `asset_manifest.json` 버전을 `0.53-alpha`로 올렸다.
- `scripts/assets/import-v053-character-source.mjs`를 추가했다.
- `npm run assets:v053`로 1152×9600 원본 PNG를 검증하고 576×4800 게임용 시트를 생성한다.
- `agents_v053_final_art_import` 시트 계약을 추가했다.
- `source_origin`, `import_pipeline`, `normalization_method` 메타데이터를 추가했다.
- `GameChrome`이 우선순위 액터를 v0.53 시트에서 렌더링한다.
- `office-visuals` QA 시나리오가 `v0.53 최종 아트 임포트 QA`로 열린다.

### v0.52-alpha

- 이벤트 포즈 시트를 4배 원본 PNG와 2배 게임용 정규화 PNG로 분리했다.
- 원본 프레임 384×384, 게임 프레임 192×192, 3열×25행, 75프레임 계약을 테스트로 고정했다.

### v0.51-alpha

- `agents_v051_event_poses` 시트 계약을 추가했다.
- 우선순위 에이전트 5종이 `idle`, `work`, `card_use`, `cheer`, `alert` 3프레임 row를 가진다.
- `getOfficeScenePlan()`이 카드 사용을 `card_use`, 출시를 `cheer`, 케어/경쟁 경보를 `alert` 포즈로 연결한다.

## 주요 문서

- 루트 시작 계약: `AGENTS.md`
- 상태 추적: `feature_list.json`
- 진행 로그: `progress.md`
- PRD: `docs/PRD.md`
- 로드맵: `docs/ROADMAP.md`
- 최근 변경 로그: `docs/CHANGELOG.md`
- QA 진입점: `docs/QA_SCENARIOS.md`
- 인수 기준: `docs/ACCEPTANCE_CRITERIA.md`
- 아트 수급/교체: `docs/ART_INTAKE.md`
- 블라인드 테스트 체크리스트: `docs/BLIND_PLAYTEST_CHECKLIST.md`
- 제작 보고서: `reports/production_alpha_v0_55_final_source_art_screenshot_qa.md`
- QA 보고서: `reports/qa/v0_55_final_source_art_screenshot_qa.md`

## 중요한 코드 위치

- 메인 게임 크롬: `src/components/GameChrome.tsx`
- 사무실/운영 시뮬레이션: `src/game/simulation.ts`
- 타입: `src/game/types.ts`
- QA 시나리오: `src/game/qa-scenarios.ts`
- 에셋 매니페스트: `data/asset_manifest.json`
- v0.54 오피스 아트 임포트 스크립트: `scripts/assets/import-v054-office-art.mjs`
- v0.54 오브젝트 원본 시트: `public/assets/sprites/source/v054-office-objects-final-source.png`
- v0.54 오브젝트 게임용 시트: `public/assets/sprites/v054-office-objects-final.png`
- v0.54 배경 원본: `public/assets/backgrounds/source/v054-isometric-office-final-source.png`
- v0.54 배경 게임용 이미지: `public/assets/backgrounds/v054-isometric-office-final.png`
- v0.55 스크린샷 스크립트: `scripts/qa/capture-office-visuals-screenshots.mjs`
- v0.55 데스크톱 스크린샷: `reports/qa/screenshots/v0_55_office_visuals_desktop.png`
- v0.55 모바일 스크린샷: `reports/qa/screenshots/v0_55_office_visuals_mobile.png`
- v0.55 스크린샷 manifest: `reports/qa/screenshots/v0_55_office_visuals_screenshots.json`
- v0.53 캐릭터 임포트 스크립트: `scripts/assets/import-v053-character-source.mjs`
- v0.53 원본 시트: `public/assets/sprites/source/v053-agents-event-poses-final-source.png`
- v0.53 게임용 시트: `public/assets/sprites/v053-agents-event-poses-final.png`
- 사무실 반응 데이터: `data/office_reactions.json`
- 레이아웃/픽셀 CSS: `src/App.css`

## 현재 좋은 점

- 한 판은 120개월 10년 엔딩까지 시뮬레이션으로 돈다.
- 제품 조합은 5,184개 기본 조합을 만든다.
- 로그라이트 새 런, 통찰, 메타 해금, 시작 덱이 있다.
- 고밀도 픽셀 시트와 아이소메트릭 사무실 배경이 실제 게임 화면에 연결됐다.
- 사무실 액터가 클릭 가능하고 직접 케어 액션까지 이어진다.
- 카드 사용과 케어 경보가 말풍선뿐 아니라 캐릭터 포즈로도 읽힌다.
- 캐릭터 포즈, 오피스 오브젝트, 오피스 배경은 이제 외부/AI 최종 원본 PNG를 받을 수 있는 임포트 경로가 있다.
- 최신 20인 페르소나 QA에서 미해결 P0/P1은 0건이다.

## 아직 부족한 점

- 실제 이미지 생성 또는 외부 제작 최종 캐릭터/오브젝트/배경 원본은 아직 별도 제공되지 않았다. 현재 v0.53/v0.54 source는 임포트 가능한 draft candidate다.
- 최종 원본 시트 교체 후 프레임 anchor, 발 위치, 실루엣 drift, 오브젝트 depth, 배경 프레이밍을 브라우저 스크린샷으로 검수해야 한다.
- 실제 5명 블라인드 플레이테스트 기록이 아직 없다.
- 첫 제품 출시 결과에서 카드 영향, 리뷰, 경쟁사 반응이 한눈에 보이는 연출이 아직 약하다.
- 모바일 하단 전략 손패의 오른쪽 잘림은 v0.55 안에서 해결했다. 다만 최종 아트가 들어오면 메뉴 패널 내부의 촘촘한 정보 밀도는 다시 봐야 한다.
- 최종 픽셀아트, 음악, 사운드가 없다.
- Playwright는 이번 환경에 없지만, v0.55부터 로컬 headless Chrome 스크린샷 QA로 desktop/mobile 캡처를 남길 수 있다.

## 다음 추천 작업

1. v0.56 플레이테스트 슬라이스 잠금
   - 첫 제품 출시 결과 연출 강화
   - 카드 영향 체감 표시
   - 경쟁사 사건 1개와 직원 사건 1개를 화면 사건으로 표시
   - 연간 심사 1회까지 설명 없이 도달 가능하게 정리
   - `docs/BLIND_PLAYTEST_CHECKLIST.md` 기준으로 5명 테스트 기록

2. Art Intake는 병렬 P2로 관리
   - 캐릭터: 1152×9600 RGBA PNG
   - 오피스 오브젝트: 2560×1920 RGBA PNG
   - 오피스 배경: 5120×2880 RGBA PNG
   - `npm run assets:v053 -- --source <캐릭터 원본PNG>`
   - `npm run assets:v054 -- --objects-source <오브젝트 원본PNG> --backdrop-source <배경 원본PNG>`
   - `npm run qa:office-visuals:screenshots`

3. 지금 하지 않을 것
   - 새 대형 시스템 추가
   - 제품 조합 수 추가
   - 산업군 대량 확장
   - 모바일 완성도 깊게 파기

## 주의사항

- 사용자는 보고서를 한국어로 읽고 싶어 한다.
- 작은 작업마다 Vercel 배포하지 않는다. 큰 버전업 때만 배포한다.
- 현재 Vercel은 이전에 무료 배포 한도 오류가 났다.
- 기존 변경을 되돌리지 말고, 작업 후 `npm run harness:gate`를 통과시킨다.
- 파일 수정은 되도록 `apply_patch`를 쓴다.
- 브라우저 QA는 `http://127.0.0.1:5201/?scenario=office-visuals`와 `http://127.0.0.1:5201/?scenario=persona20`를 함께 본다.

## 새 세션 시작 프롬프트

```text
프로젝트는 `/Users/taewookkim/Downloads/ai-company-tycoon`의 AI Company Tycoon: Boundaryless야.

먼저 `AGENTS.md`, `feature_list.json`, `progress.md`, `docs/SESSION_HANDOFF.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, `docs/QA_SCENARIOS.md`를 읽고 이어서 개발해줘.

현재 버전은 v0.55-alpha이고 다음 목표는 `v0.56-alpha-playtest-slice-lock`이야. 최신 구현 커밋은 `df57811 Polish v0.55 mobile command hand QA`야. 스택은 Vite + React + TypeScript야.

로컬 실행은 `npm run dev -- --port 5201`, 시각 QA는 `http://127.0.0.1:5201/?scenario=office-visuals`, 페르소나 QA는 `http://127.0.0.1:5201/?scenario=persona20`, 전체 검증은 `npm run harness:gate`야.

현재 feature는 `v0.56-alpha-playtest-slice-lock`이고 상태는 in_progress야. v0.55 스크린샷 QA 하네스는 완료로 보고, 최종 외부/AI 원본 아트 교체는 `docs/ART_INTAKE.md`의 P2 작업으로 분리했어. 다음 작업은 첫 제품 출시/카드 영향/경쟁사 사건/직원 사건/블라인드 테스트 슬라이스에 집중해줘. 완료 후 한국어로 변경점, 검증 결과, 다음 추천 작업을 짧게 보고해줘.
```

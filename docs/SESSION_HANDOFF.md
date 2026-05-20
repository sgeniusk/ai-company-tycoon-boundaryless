# 세션 핸드오프 — AI Company Tycoon: Boundaryless

작성일: 2026-05-20

## 한 줄 요약

현재 빌드는 `v0.53-alpha`다. **카이로소프트식 AI 회사 경영 + 로그라이트 덱빌딩 + 10년 캠페인 + 경계 없는 산업 확장**을 목표로 하며, 캐릭터 이벤트 포즈 시트는 이제 최종 원본 PNG를 받아 게임용 시트로 정규화하는 임포트 파이프라인까지 갖췄다.

## 현재 작업 위치

- 로컬 폴더: `/Users/taewookkim/Downloads/ai-company-tycoon`
- GitHub: `https://github.com/sgeniusk/ai-company-tycoon-boundaryless`
- 현재 브랜치: `main`
- 최신 구현 커밋: `2dcd1e0 Add v0.53 character art import pipeline`
- 로컬 실행 주소: `http://127.0.0.1:5201/`
- 현재 시각 QA 진입 주소: `http://127.0.0.1:5201/?scenario=office-visuals`
- 현재 페르소나 QA 진입 주소: `http://127.0.0.1:5201/?scenario=persona20`
- 루트 시작 문서: `AGENTS.md`
- 구조화 상태 파일: `feature_list.json`, `progress.md`

## 실행과 검증

```bash
npm run dev -- --port 5201
npm run assets:v053
npm run harness:gate
./init.sh
```

최종 캐릭터 원본을 받을 때:

```bash
npm run assets:v053 -- --source <path-to-1152x9600-rgba-png>
```

최근 전체 검증 기준:

- `npm run assets:v053`: v0.53 원본 후보 임포트 및 런타임 시트 생성
- `file public/assets/sprites/source/v053-agents-event-poses-final-source.png`: 1152×9600 PNG 확인
- `file public/assets/sprites/v053-agents-event-poses-final.png`: 576×4800 PNG 확인
- `npm test -- src/game/asset-manifest.test.ts src/game/office-scene.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`: 4개 테스트 파일 / 80개 테스트 통과
- `npm run harness:gate`: 40개 테스트 파일 / 298개 테스트 통과
- 데이터 검증 통과
- 프로덕션 빌드 통과
- `?scenario=office-visuals` HTTP 200 OK
- `v053-agents-event-poses-final.png` HTTP 200 OK
- `source/v053-agents-event-poses-final-source.png` HTTP 200 OK

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
- 제작 보고서: `reports/production_alpha_v0_53_final_character_art_import.md`
- QA 보고서: `reports/qa/v0_53_final_character_art_import_qa.md`

## 중요한 코드 위치

- 메인 게임 크롬: `src/components/GameChrome.tsx`
- 사무실/운영 시뮬레이션: `src/game/simulation.ts`
- 타입: `src/game/types.ts`
- QA 시나리오: `src/game/qa-scenarios.ts`
- 에셋 매니페스트: `data/asset_manifest.json`
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
- 캐릭터 포즈 시트는 이제 외부/AI 최종 원본 PNG를 받을 수 있는 임포트 경로가 있다.
- 최신 20인 페르소나 QA에서 미해결 P0/P1은 0건이다.

## 아직 부족한 점

- 실제 이미지 생성 또는 외부 제작 최종 캐릭터 원본은 아직 별도 제공되지 않았다. 현재 v0.53 source는 임포트 가능한 draft candidate다.
- 오브젝트 시트와 배경도 캐릭터처럼 최종 원본 임포트 경로가 필요하다.
- 최종 원본 시트 교체 후 프레임 anchor, 발 위치, 실루엣 drift를 브라우저 스크린샷으로 검수해야 한다.
- 최종 픽셀아트, 음악, 사운드가 없다.
- Browser screenshot capture는 이번 세션에서 Playwright가 없어 재실행하지 못했고 HTTP/테스트/빌드로 검증했다.

## 다음 추천 작업

1. `v0.54-alpha`: 오브젝트/배경 아트 임포트
   - 사무실 오브젝트 시트도 원본 PNG 임포트/정규화 경로 추가
   - 아이소메트릭 배경도 source/runtime 경로 문서화
   - `office-visuals`에서 배치 장식과 배경 렌더링 확인

2. 이후 그래픽 퀄리티 패스
   - 실제 최종 캐릭터 원본을 `npm run assets:v053 -- --source <원본PNG>`로 교체
   - 모바일/데스크톱 스크린샷 재검증
   - 사운드/짧은 효과음 후보 정리

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

현재 버전은 v0.53-alpha이고, 최신 구현 커밋은 `2dcd1e0 Add v0.53 character art import pipeline`야. 스택은 Vite + React + TypeScript야.

로컬 실행은 `npm run dev -- --port 5201`, 시각 QA는 `http://127.0.0.1:5201/?scenario=office-visuals`, 페르소나 QA는 `http://127.0.0.1:5201/?scenario=persona20`, 전체 검증은 `npm run harness:gate`야.

다음 추천 목표는 `feature_list.json`의 현재 feature인 `v0.54-alpha-office-object-backdrop-art-import`야. 완료 후 한국어로 변경점, 검증 결과, 다음 추천 작업을 짧게 보고해줘.
```

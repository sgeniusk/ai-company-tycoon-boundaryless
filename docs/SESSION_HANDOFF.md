# 세션 핸드오프 — AI Company Tycoon: Boundaryless

작성일: 2026-05-20

## 한 줄 요약

현재 빌드는 `v0.49-alpha`다. **카이로소프트식 AI 회사 경영 + 로그라이트 덱빌딩 + 10년 캠페인 + 경계 없는 산업 확장**을 목표로 하며, 고밀도 픽셀 시트와 데이터 기반 사무실 렌더링을 붙여 “스크린샷부터 게임처럼 보이는 알파”로 옮기는 중이다.

## 현재 작업 위치

- 로컬 폴더: `/Users/taewookkim/Downloads/ai-company-tycoon`
- GitHub: `https://github.com/sgeniusk/ai-company-tycoon-boundaryless`
- 현재 브랜치: `main`
- 최신 구현 커밋: `0300048 Add v0.49 office event reactions`
- 로컬 실행 주소: `http://127.0.0.1:5201/`
- 현재 QA 진입 주소: `http://127.0.0.1:5201/?scenario=office-visuals`
- 루트 시작 문서: `AGENTS.md`
- 구조화 상태 파일: `feature_list.json`, `progress.md`

## 실행과 검증

```bash
npm run dev -- --port 5201
npm run harness:gate
./init.sh
```

최근 전체 검증 기준:

- `npm run harness:gate`
- v0.49 좁은 검증: 3개 테스트 파일 / 67개 테스트
- 전체 게이트: 40개 테스트 파일 / 294개 테스트
- 데이터 검증
- 프로덕션 빌드
- QA URL HTTP 200 OK
- Browser QA 기준 진입점: `?scenario=office-visuals`

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

### v0.49-alpha

- `data/office_reactions.json`을 추가해 카드 사용, 제품 출시, 경쟁 속보, 인사 경보 반응을 데이터화했다.
- `getOfficeScenePlan()`이 최근 카드 사용/출시/경쟁/인사 상태를 `eventReactions`로 변환한다.
- `OfficeEventReactionLayer`가 사무실 플레이필드 위에 말풍선형 픽셀 플래시를 표시한다.
- `office-visuals` QA 시나리오가 `프롬프트 스프린트` 카드 사용 반응을 바로 보여준다.

### v0.48-alpha

- `asset_manifest.json` 버전을 `0.48-alpha`로 올렸다.
- 에이전트 idle/work 애니메이션에 `duration_ms`를 추가했다.
- `getAnimatedSpriteSheetFrameStyle`로 같은 atlas row의 3프레임을 CSS `steps()` 애니메이션으로 순환한다.
- 사무실 액터는 `sprite-sheet-animated` 클래스를 받아 idle/work 상태에 맞게 프레임을 넘긴다.
- `prefers-reduced-motion`에서는 애니메이션을 끈다.

### v0.47-alpha

- 게임 내 시트 프리뷰와 y좌표 기반 깊이 정렬을 추가했다.
- `office-visuals` QA 진입점에서 캐릭터/오브젝트 대표 프레임을 바로 검수할 수 있다.

### v0.46-alpha

- 2x 고밀도 픽셀 시트와 2560×1440 아이소메트릭 사무실 배경을 도입했다.
- 에이전트/오브젝트/배경 시트 계약을 `asset_manifest.json`으로 관리한다.

### v0.45-alpha

- 초안 픽셀 시트 생성 파이프라인과 sprite-sheet slicing 경로를 추가했다.
- 기존 액터 클릭, 포커스 패널, 직접 케어 액션은 유지했다.

### v0.44-alpha

- 사무실 액터 포커스 패널에서 `즉시 휴식`과 `연봉 협상`을 바로 실행하게 했다.

## 주요 문서

- 루트 시작 계약: `AGENTS.md`
- 상태 추적: `feature_list.json`
- 진행 로그: `progress.md`
- PRD: `docs/PRD.md`
- 로드맵: `docs/ROADMAP.md`
- 최근 변경 로그: `docs/CHANGELOG.md`
- QA 진입점: `docs/QA_SCENARIOS.md`
- 인수 기준: `docs/ACCEPTANCE_CRITERIA.md`
- 제작 보고서: `reports/production_alpha_v0_49_event_reactions.md`
- QA 보고서: `reports/qa/v0_49_event_reactions_qa.md`

## 중요한 코드 위치

- 메인 게임 크롬: `src/components/GameChrome.tsx`
- 사무실/운영 시뮬레이션: `src/game/simulation.ts`
- 타입: `src/game/types.ts`
- 데이터 로딩: `src/game/data.ts`
- 사무실 시각 데이터: `data/office_scene.json`
- 사무실 반응 데이터: `data/office_reactions.json`
- 사무실 구획 데이터: `data/office_zones.json`
- 에셋 매니페스트: `data/asset_manifest.json`
- QA 시나리오: `src/game/qa-scenarios.ts`
- 레이아웃/픽셀 CSS: `src/App.css`
- 에셋 매니페스트 테스트: `src/game/asset-manifest.test.ts`
- 레이아웃 계약 테스트: `src/ui/layout-contract.test.ts`

## 현재 좋은 점

- 한 판은 120개월 10년 엔딩까지 시뮬레이션으로 돈다.
- 제품 조합은 5,184개 기본 조합을 만든다.
- 로그라이트 새 런, 통찰, 메타 해금, 시작 덱이 있다.
- 사무실 확장, 구획, 장식, 채용 브랜드, 직원 사건, 후폭풍, 운영 의제가 있다.
- 고밀도 픽셀 시트와 아이소메트릭 사무실 배경이 실제 게임 화면에 연결됐다.
- 사무실 액터가 클릭 가능하고 직접 케어 액션까지 이어진다.

## 아직 부족한 점

- 카드 사용, 제품 출시, 경쟁사 사건의 말풍선 반응은 들어갔지만, 캐릭터 포즈 자체는 아직 idle/work 행을 재사용한다.
- 실제 AI 생성 원본 시트로 교체한 뒤 프레임 anchor와 실루엣 drift를 검수해야 한다.
- 최종 픽셀아트, 음악, 사운드가 없다.
- 시스템이 많아졌기 때문에 메뉴 요약/접힘/튜토리얼 재정리가 필요하다.
- 20인 페르소나 재검증을 최신 화면 기준으로 다시 돌려야 한다.

## 다음 추천 작업

1. `v0.50-alpha`: 알파 후보 정리
   - 모바일/데스크톱 정보 압축 2차
   - 20인 페르소나 플레이테스트 재실행
   - P0/P1만 해결하고 큰 버전 후보로 묶기

2. `v0.51-alpha`: 이벤트 포즈 시트 확장
   - 환호/경고/카드 사용 행 추가
   - actor state와 reaction trigger를 포즈 row에 연결

## 주의사항

- 사용자는 보고서를 한국어로 읽고 싶어 한다.
- 작은 작업마다 Vercel 배포하지 않는다. 큰 버전업 때만 배포한다.
- 현재 Vercel은 이전에 무료 배포 한도 오류가 났다.
- 기존 변경을 되돌리지 말고, 작업 후 `npm run harness:gate`를 통과시킨다.
- 파일 수정은 되도록 `apply_patch`를 쓴다.
- 브라우저 QA는 `http://127.0.0.1:5201/?scenario=office-visuals`를 우선 사용한다.

## 새 세션 시작 프롬프트

```text
프로젝트는 `/Users/taewookkim/Downloads/ai-company-tycoon`의 AI Company Tycoon: Boundaryless야.

먼저 `AGENTS.md`, `feature_list.json`, `progress.md`, `docs/SESSION_HANDOFF.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, `docs/QA_SCENARIOS.md`를 읽고 이어서 개발해줘.

현재 버전은 v0.49-alpha이고, 최신 구현 커밋은 `0300048 Add v0.49 office event reactions`야. 스택은 Vite + React + TypeScript야.

로컬 실행은 `npm run dev -- --port 5201`, 브라우저 QA는 `http://127.0.0.1:5201/?scenario=office-visuals`, 전체 검증은 `npm run harness:gate`야.

다음 추천 목표는 `feature_list.json`의 현재 feature인 `v0.50-alpha-candidate`야. 완료 후 한국어로 변경점, 검증 결과, 다음 추천 작업을 짧게 보고해줘.
```

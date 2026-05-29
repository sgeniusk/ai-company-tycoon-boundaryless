# 하네스 점검 — v0.59 진입 (2026-05-29)

점검자: Claude Code (하네스 트랙)
맥락: v0.58 종료 직후, v0.59 코딩을 Codex CLI(gpt-5.5, xhigh)에 위임하면서 하네스 건강 상태와 계약 일관성을 점검했다.

## 1. 검증 게이트 건강 상태 — GREEN

`npm run harness:gate` = `npm test -- --maxWorkers=1 && npm run validate:data && npm run build`

2026-05-29 실행 결과.

- 테스트 — 43 files / 415 tests 통과
- 데이터 검증 — `scripts/harness/validate-data.mjs` 통과 (40여 개 JSON 데이터 파일의 id 유일성, 참조 무결성, 자원 맵, 자산 매니페스트, 로케일 키 등 검사)
- 프로덕션 빌드 — `tsc && vite build`, 105 modules, 715ms

게이트 자체에 결함이나 플레이크는 없다.

## 2. 발견한 드리프트 — 계약 문서가 v0.57에 정체

검증 게이트는 건강했으나, 에이전트 운영 계약 문서들이 v0.58 종료 상태를 반영하지 못하고 있었다. 특히 Codex의 config는 `AGENTS.md`를 orchestration brain으로 읽고, 프로젝트 `AGENTS.md`는 "feature_list.json의 current feature를 읽으라"고 지시하므로, 이 드리프트는 Codex 핸드오프의 선결 차단 요인이었다.

| 문서 | 드리프트 (수정 전) | 수정 후 |
|------|------|------|
| `AGENTS.md` Current Source Of Truth | `v0.57-alpha` / `v0.57-alpha-core-fun-polish (completed)` | `v0.58-alpha` (closed) / `v0.59-alpha-resource-visibility` (in progress) |
| `AGENTS.md` Validation Policy | v0.58 종료·AGY Track B 반영 안 됨 | v0.58 종료 + AGY 발송 가능 + 아트 인테이크 해제 반영 |
| `feature_list.json` | current = `v0.58-...` (이미 completed) | current = `v0.59-alpha-resource-visibility` (신규 항목 추가) |
| `progress.md` | "다음 마일스톤 미선정" | v0.59 선택·진행 중 (Codex 위임) |
| `CLAUDE.md` | `v0.58 Track A in progress` | v0.59 진행 중·역할 분담 |

5개 문서를 v0.59 상태로 일관 동기화했다. JSON 유효성 재확인 통과 (current_feature_id = `v0.59-alpha-resource-visibility`, features 6개).

## 3. 코딩 위임 — Codex CLI Track

- 모델 — `gpt-5.5`, reasoning effort `xhigh` ("very high" 매핑), sandbox `workspace-write`, approval `never` (비대화형, 멈춤 없음)
- 핸드오프 — `reports/codex-handoff/v0_59_resource_visibility.md`
- 역할 분담 — Codex는 코드 구현만. 커밋·계약 파일 편집은 금지. Claude Code가 diff 리뷰 + 게이트 독립 검증 + closeout 커밋 소유
- feature 범위 — 연구 패널에 derive-only 자원 인디케이터 3종 (월간 compute 부하, 월간 데이터 생성량, 다음 출시 전 필요 compute). `data/products.json`의 기존 필드만 사용. 시뮬레이션 tick·GameState 모델 불변

## 4. Codex 반환 후 검증 계획

1. `npm run harness:gate` 독립 재실행 — 목표 43 files / 416+ tests
2. diff 리뷰 — `src/game/simulation.ts` tick 변경 없음, 신규 `GameState` 필드 없음 확인 (derive-only 보장)
3. `?scenario=resource-visibility`에서 인디케이터 3종이 모두 0이 아닌지 확인
4. 통과 시 v0.59 closeout 커밋 + `feature_list.json` evidence·`progress.md` 갱신

## 5. 결론

검증 하네스는 건강하다. 유일한 리스크는 계약 문서 드리프트였고 이번에 해소했다. v0.59 코딩은 Codex가 진행 중이며, Claude Code가 게이트로 최종 검증한다.

# v0.69 Parallel Harness QA Run

Status: PASS after integration

## Scope

- Lane: QA/harness only.
- Change: `qa:v068-beta-candidate` child gates now have a bounded timeout and deterministic timeout diagnostic.
- Reason: v0.69/v0.70 beta-candidate checks should fail fast instead of hanging indefinitely when a child `npm` gate stalls.
- Protected files edited by this lane: none.

## Harness Improvement

- Default child-gate timeout: 15 minutes.
- Test override: `ACT_BETA_CANDIDATE_CHECK_TIMEOUT_MS`.
- Timeout result: check status becomes `fail`, `exitStatus` is `null`, and diagnostic is `timeout after <ms>ms; child gate did not finish`.
- Normal command shape is preserved; the clearer diagnostic is added only for timeout/spawn-error paths.

## TDD Evidence

| Phase | Command | Result |
| --- | --- | --- |
| RED | `npm test -- src/game/v068-beta-candidate-script.test.ts < /dev/null` | Failed as expected: new timeout test received candidate `status: pass` before implementation. |
| GREEN | `npm test -- src/game/v068-beta-candidate-script.test.ts < /dev/null` | Passed: 1 test file, 7 tests. |
| Recheck | `npm test -- src/game/v068-beta-candidate-script.test.ts < /dev/null` | Passed again after parallel-lane worktree changes: 1 test file, 7 tests. |
| Manifest smoke | `npm run qa:v068-beta-candidate -- --list-json < /dev/null` | Passed and listed the existing harness/flow-smoke child gates. |

## Gate Evidence

- `npm test -- src/game/v068-beta-candidate-script.test.ts src/ui/layout-contract.test.ts src/game/beta-readiness.test.ts src/game/world-events.test.ts --maxWorkers=1 < /dev/null`
  - 4 files / 113 tests passed after parallel-lane integration.
- `npm run harness:gate < /dev/null`
  - 53 files / 602 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check` passed with 15/15 readiness checks.
  - `npm run build` passed.
- `npm run qa:v068-beta-candidate < /dev/null`
  - PASS and refreshed the beta-candidate Markdown/JSON artifacts.
- `npm run qa:v068-beta-candidate:check < /dev/null`
  - PASS with 2/2 child checks, `Report: PASS`, `Summary: PASS`.

## Integration Notes

- The candidate harness still runs child gates with stdin ignored, so it remains compatible with `< /dev/null` gate usage.
- Existing `--list-json` output is unchanged.
- The earlier parallel-lane RED failures were resolved in the integrated UI/game selector pass.

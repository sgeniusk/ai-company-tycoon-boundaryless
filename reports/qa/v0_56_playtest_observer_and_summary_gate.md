# v0.56 Playtest Observer And Summary Gate QA

Date: 2026-05-22
Status: implemented, pending real human sessions

## Goal

Keep development moving until final asset intake by making the real blind-test step easier to run and harder to fake.

The observer HUD is opt-in and only appears when the URL includes `?playtest=v056`. The session summary script reads the five prepared session files and blocks final graphic asset intake until all real sessions are recorded, open P0 issues are closed, and completed sessions have explicit P0 entries. Open P1 findings are counted separately for follow-up tuning, but they do not block the art gate when P0 and evidence checks pass.

## Implementation

- Added `createBlindPlaytestObserverSummary()` in `src/game/blind-playtest-observer.ts`.
- Added an in-game `BlindPlaytestObserverPanel` in `src/App.tsx`.
- Added `?playtest=v056&session=1` observer mode for any QA route.
- Added `npm run qa:blind-summary`.
- Added `reports/playtests/v0_56_blind_playtest_summary.md`.
- Corrected the summary parser so pending `Status: 예정` session templates show `-` for P0/P1 instead of leaking template labels into the gate table.
- Added a `P0 미기록` gate so completed sessions must explicitly record `P0: 없음` or a concrete P0 finding before final art can start.
- Added a `상태 미인정` gate so only exact `Status: 완료` records count as real completed sessions.
- Added a `증거 미기록` gate so completed sessions must include tester profile, date/time, environment, all six checkpoint observations, and five exit interview answers.
- Added an `열린 P1` summary count so medium findings remain visible without changing the final-art gate rule.
- Added a per-session `증거` summary column that shows `OK`, `-`, or concrete missing evidence labels.
- Changed the session templates so exit questions are fillable answer fields rather than passive question text.
- Changed the prepared tester target/method lines into fillable fields so completed sessions must identify who and how the test was run.
- Added `reports/playtests/v0_56_blind_playtest_request_packet.md` so an external facilitator or AGY can receive one request/checklist packet before running real sessions.
- Added `reports/playtests/v0_56_blind_playtest_agy_outbox.md` as a copy-paste AGY message, kept at `발송 준비 / 실제 발송 미확인` until a human confirms sending.
- Added `reports/playtests/v0_56_blind_playtest_dispatch_log.md` so actual handoff status can be recorded without touching session outcomes.
- Added `npm run qa:blind-readiness`, writing `reports/playtests/v0_56_blind_playtest_readiness.md` to confirm request/outbox readiness, untouched session files, and waiting art gate before handoff.
- Added `npm run qa:blind-intake`, writing `reports/playtests/v0_56_blind_playtest_intake.md` and importing returned AGY/facilitator session files only when they use the expected filename, exact `Status: 완료`, and a non-empty `P0:` line.
- Added `npm run qa:blind-issues`, writing `reports/playtests/v0_56_blind_playtest_issue_queue.md` to extract completed-session P0/P1 findings, next fix candidates, and confusing moments for post-session triage.
- Added `npm run qa:art-gate`, writing `reports/playtests/v0_56_final_art_intake_gate.md` after rerunning the blind summary and issue queue so final asset intake has one combined decision.
- Added `npm run qa:asset-handoff`, writing `reports/playtests/v0_56_final_art_handoff_packet.md` after rerunning the final art gate so AGY/external art requests stay blocked until final asset intake is allowed.
- Expanded the local Node type shim for the temp-file and child-process helpers used by the regression test.

## Screenshot Evidence

- `reports/qa/screenshots/v0_56_playtest_observer_fresh_desktop.png` — 1366x768
- `reports/qa/screenshots/v0_56_playtest_observer_fresh_mobile.png` — 390x844
- `reports/qa/screenshots/v0_56_playtest_observer_year_two_desktop.png` — 1366x768

## Verification

- `npm test -- src/game/blind-playtest-observer.test.ts src/ui/layout-contract.test.ts`
  - Passed: 2 files / 46 tests
- `npm run build`
  - Passed: TypeScript and Vite production build
- `curl -I 'http://127.0.0.1:5201/?scenario=fresh&playtest=v056&session=1'`
  - Passed: 200 OK
- Headless Chrome screenshots
  - Passed: desktop/mobile observer screenshots generated
- `file reports/qa/screenshots/v0_56_playtest_observer_*.png`
  - Passed: desktop 1366x768, mobile 390x844
- `npm run qa:blind-summary`
  - Passed: summary report generated, art gate remains `대기` with 0/5 real sessions, open P0 0, open P1 0, missing P0 0, unrecognized status 0, missing evidence 0, pending P0/P1/evidence cells show `-`
- `npm run qa:blind-readiness`
  - Passed: readiness report generated, Ready to send yes, Sessions untouched yes, Real sessions 0/5, Art gate `대기`
- `npm run qa:blind-intake`
  - Passed: intake report generated with `수신 대기` because no returned session folder was provided
- `npm run qa:blind-issues`
  - Passed: issue queue report generated, real sessions 0/5, P0 queue 0, P1 queue 0, unrecognized status 0
- `npm run qa:art-gate`
  - Passed: final art gate report generated, real sessions 0/5, summary art gate `대기`, P0 queue 0, final art intake `대기`
- `npm run qa:asset-handoff`
  - Passed: final art handoff packet generated, final art intake `대기`, AGY send status `발송 금지`
- `npm test -- src/game/blind-playtest-records.test.ts`
  - Passed: 1 file / 23 tests
- `npm test -- src/game/blind-playtest-records.test.ts src/game/blind-playtest-observer.test.ts src/ui/layout-contract.test.ts`
  - Passed: 3 files / 69 tests
- `git diff --check`
  - Passed: no whitespace errors
- `npm run harness:gate`
  - Passed: 43 files / 363 tests, data validation, production build

## Current Gate

- Real sessions: 0/5
- Open P0: 0
- Open P1: 0
- Missing P0: 0
- Unrecognized status: 0
- Missing evidence: 0
- Art gate: `대기`
- Issue queue: P0 queue 0, P1 queue 0, status `실제 세션 대기`
- Final art intake: `대기`
- Final art handoff: `아트 요청 대기`, AGY send status `발송 금지`
- Reason: actual human blind-test records are still empty by design.
- Table evidence: pending sessions show `-`; completed sessions will show `OK` or the missing tester-profile/checkpoint/exit-question field labels.

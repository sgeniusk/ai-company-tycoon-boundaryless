# v0.96 First-Screen Composition QA

Date: 2026-06-01 23:10 KST

## Scope

- Goal: make the first viewport read as a protected pixel game scene first, with UI chrome supporting the office rather than crowding it.
- Code path: visual-only `App` shell marker, scoped `App.css` first-screen composition rules, static layout contract, and browser smoke harness.
- Added `first-screen-composition` to the existing game shell without rebuilding the app grid.
- Added a scoped crowding guard for resource, command, event, and menu surfaces; decorative labels yield before they can overflow.
- No simulation, save, data, economy, tick, or RNG behavior changed.

## TDD Evidence

- RED: `npm test -- src/ui/layout-contract.test.ts`
  - Result: failed as expected.
  - Failure: `v0.96 composes the first screen as a protected game scene` could not find `first-screen-composition` in `appSource`.
  - Coverage at RED: 1 test file / 120 tests, 119 passed and 1 failed.
- GREEN: `npm test -- src/ui/layout-contract.test.ts`
  - Result: passed.
  - Coverage: 1 test file / 120 tests.

## Browser Smoke

Command:

```sh
node scripts/qa/check-v096-first-screen.mjs 'http://127.0.0.1:5222/?scenario=office-visuals'
```

Scenario:

- `http://127.0.0.1:5222/?scenario=office-visuals`

Environment note:

- This Codex App shell blocks Chromium localhost navigation from Node with `ERR_ACCESS_DENIED`.
- The tracked smoke keeps the URL path for normal environments and uses a local `dist/index.html` fallback only when that sandbox denial occurs.

Threshold calibration:

- Desktop observed office visible fraction: `0.260`; threshold set to `0.23`, about 12% lower.
- Mobile observed office visible fraction: `0.246`; threshold set to `0.21`, about 15% lower.
- This keeps the gate below the measured composition while still catching meaningful first-screen office shrinkage.

Desktop metrics:

- Office visible fraction: 0.260
- Office visible height: 390px
- Actors visible: 6
- Surface text overflow: 0
- Office center occluded: false
- Document overflow: 0

Mobile metrics:

- Office visible fraction: 0.246
- Office visible height: 230px
- Actors visible: 6
- Surface text overflow: 0
- Office center occluded: false
- Document overflow: 0

Screenshots:

- `reports/qa/screenshots/v0_96_first_screen_desktop.png`
- `reports/qa/screenshots/v0_96_first_screen_mobile.png`

## Gate

Command:

```sh
npm run harness:gate < /dev/null
```

Result: PASS

- `npm test -- --maxWorkers=1`: 53 files / 643 tests passed
- `npm run validate:data`: passed
- `npm run qa:beta-readiness:check`: PASS, readiness 15/15, route coverage 4/4 axes and 40/40 options
- `npm run build`: passed
- Known note: Vite still reports the existing >500 kB chunk warning.

## Visual-Only Proof

Command:

```sh
git --no-pager diff --stat -- src/game/simulation.ts src/game/types.ts data/
```

Result: empty output.

## Notes

- The existing desktop composition remains intact: top/status, office stage, sightline event rail, command console, resource HUD, and menu cabinet remain distinct surfaces.
- Mobile row sizing is explicitly restored at the scoped marker specificity so the desktop first-screen rule cannot collapse the office row on narrow viewports.

## Claude 독립 검증 (편집장)

Codex 자가보고를 신뢰하지 않고 편집장이 실제 환경에서 재검증했다.

- **라이브 서버 재실행** — Codex 샌드박스는 localhost Chromium 접근이 막혀(`ERR_ACCESS_DENIED`) `dist/index.html` 폴백으로만 측정했다. 편집장은 실제 dev server(`:5222`)에 대해 스모크를 직접 재실행했고 desktop/mobile **exit 0**, overflow 0/0, officeVisibleFraction 0.26/0.246, actors 6/6, 오피스 중심 비가림 — Codex 자가보고와 일치 확인.
- **700–1100px 회귀 의심 검증** — `@media (max-width: 1100px)` 마커 행 규칙이 base 의 1100px 단일컬럼 브레이크포인트(`App.css:12233`)와 일치함을 1000/900/760px 렌더로 확인(bottomGap ≈ 8px, dead band 없음). 의심했던 빈 하단 밴드 버그는 존재하지 않았다.
- **데스크톱 HUD 풍부함 조사 (→ v0.97 이월)** — `display: none` 이 데스크톱에서도 픽셀 자원 아이콘/증감 델타/커맨드 라벨을 숨기는 점을 점검했다. 콤팩션을 ≤1100px 로 스코프해 데스크톱 풍부함 복원을 시도했으나, 데스크톱 자원 영역(약 60px 타일)이 좁아 **18개 표면 텍스트 오버플로(자원 값 truncation 포함)** 가 발생해 되돌렸다. 콤팩션은 공간 제약상 필수이며, 데스크톱 픽셀 아이콘 복원은 HUD 레이아웃 재설계가 필요하므로 **v0.97 Pixel-Art Consistency Sweep 으로 이월**한다.
- **스모크 타이밍** — HMR 직후 1회 transient 1-overflow 를 관측했으나, 1500ms settle 로 3회 재현 시 모두 0. 정착 후 안정적 0.
- **게이트** — `npm run harness:gate < /dev/null` PASS, 53 files / 643 tests(+1 = v0.96 계약), build 1.33s.
- **Visual-only 재확인** — `git diff --exit-code -- src/game/simulation.ts src/game/types.ts data/` 비어 있음.

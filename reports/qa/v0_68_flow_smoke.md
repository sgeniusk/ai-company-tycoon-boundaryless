# v0.68 Flow Smoke QA

Status: PASS

## Scope
- Command: `npm run qa:v068-flow-smoke`
- Version lane: 0.68-beta-stabilization
- Browser load smoke for the core reloadable beta flow URLs.
- Standalone local QA only; not part of `harness:gate` because it requires Chrome/Chromium.

## Environment
- Base URL: http://127.0.0.1:5220/
- Chrome: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
- Routes: 8/8

## Routes
| ID | Path | Status | DOM bytes | Failed checks |
| --- | --- | --- | ---: | --- |
| fresh | `/?scenario=fresh` | PASS | 276763 | - |
| beta-readiness | `/?scenario=beta-readiness` | PASS | 262144 | - |
| beta-readiness-complete | `/?scenario=beta-readiness-complete` | PASS | 262144 | - |
| ending-fallback-final | `/?scenario=ending-fallback-final` | PASS | 262145 | - |
| ending-nearmiss-final | `/?scenario=ending-nearmiss-final` | PASS | 262144 | - |
| ten-year-ending-route-start | `/?scenario=ten-year-ending-route-start` | PASS | 262144 | - |
| ten-year-next-run | `/?scenario=ten-year-next-run` | PASS | 262144 | - |
| ending-nearmiss-retry-start | `/?scenario=ending-nearmiss-retry-start` | PASS | 309698 | - |

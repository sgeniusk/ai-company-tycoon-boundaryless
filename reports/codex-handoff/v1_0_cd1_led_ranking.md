# Codex CLI 인계 — v1.0 CD-1 LED 전국 랭킹 전광판

작성일: 2026-06-05
작성자: Claude Code (편집장)
대상: Codex CLI — reasoning effort **medium**
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: `main`. 마스터 `reports/v1_0_claude_design_reflection_plan.md`. 디자인 근거 = 사용자 확정 Claude Design 목업.

> **Codex 는 dev server / 브라우저 스모크 금지.** TSX/CSS + 단위 테스트 + `npm run build`(tsc) 까지만. 브라우저 검증·스크린샷·게이트·커밋은 편집장(Claude). `phase: starting` 멈춤 시 편집장이 취소·직접.

## 한 줄 요약

기존 오피스 전광판(`.office-scoreboard`)이 지금은 제품 상태 + 6개 지표를 보여준다. 이를 **확정 디자인의 핵심 훅 — 전국 AI 기업 랭킹 LED** 로 재배치한다. 데이터는 편집장이 이미 작성·검증한 파생 모듈에서 가져오고, Codex 는 **렌더 + CSS** 만. visual/additive (simulation.ts·types.ts·data·save 빈 diff).

## 데이터 계약 (이미 존재 · 그대로 import)

`src/ui/scoreboard-ranking.ts` (편집장 작성, 9 tests green). **새로 만들지 말 것 — import 만.**

```ts
import { deriveNationalRanking, buildScoreboardMarquee } from "../ui/scoreboard-ranking";
// deriveNationalRanking(gameState) => { rank: number; total: number; delta: number; marketShare: number }
//   rank: 1=전국 1위(낮을수록 좋음), total: 전국 기업 수, delta: 전월 대비(>0 ▲ 상승, <0 ▼ 하락, 0 유지)
// buildScoreboardMarquee(gameState) => string[]  // 마퀴에 " · " 로 이어 흐르게
```

GameChrome.tsx 의 다른 파생값 근처(예: `scoreboardHeadline` 계산 위치 ~700행대)에서
`const nationalRanking = deriveNationalRanking(gameState);`
`const scoreboardMarquee = buildScoreboardMarquee(gameState);` 계산.

## 현재 위치

- JSX — `src/components/GameChrome.tsx:1142–1156` (`<div className="office-scoreboard">` → `.scoreboard-main`(kicker/headline/detail) + `.scoreboard-metrics`(6 span)). 이 내부를 랭킹 레이아웃으로 교체.
- CSS — `src/App.css:871–940+` (`.office-scoreboard`, `::before`/`::after` 도트매트릭스·스캔라인·글로우, `.scoreboard-main`, `.scoreboard-metrics`). **도트매트릭스/글로우/스캔라인 자산은 재사용** — 구조만 랭킹용으로.
- 기존 파생값 `scoreboardHeadline`/`scoreboardDetail`/`scoreboardMetrics`(GameChrome ~712–732) 는 LED 가 랭킹 전용이 되면 불필요. 제거 가능(다른 사용처 없으면). 제품 상태는 이미 `office-hud`·다음 행동 칩이 담당.

## ⚠️ 계약 테스트 랜드마인 (반드시 함께 갱신)

기존 `src/ui/layout-contract.test.ts` 가 옛 구조를 단언한다 — 새 구조에 맞게 **다시 작성**:
- `:281–285` — `office-scoreboard`/`scoreboard-metrics`/`.scoreboard-metrics { grid-template-columns: repeat(3,...) }` 단언. 새 랭킹 구조(랭크 번호 + LIVE + 마퀴)를 단언하도록 교체.
- `:869–870` — 모바일(≤700px) `.office-scoreboard { min-height: 42px }` + `.scoreboard-metrics { display: none }`. **모바일 컴팩트 푸트프린트(min-height ~42px)는 유지**하되 metrics 대신 새 셀렉터 기준으로 교체.

## 디자인 비주얼 타깃 (목업 `.led` — 게임 토큰으로 적용)

목업 CDN 폰트(Galmuri) 가져오지 말 것. **기존 게임 픽셀 폰트/토큰(`--pixel-radius`, `--pixel-steps`) 재사용.** 아래는 비주얼 의도.

- 컨테이너 — 어두운 LED 패널, 하드 섀도, 내부 글로우. (기존 `.office-scoreboard` 다크그린 + 도트매트릭스 ::after 유지)
- 상단 행 — 좌측 `전국 AI 기업 랭킹` 태그(작게, 청록 글로우) + 우측 `LIVE` 뱃지(점멸, 빨강 배경).
  - 점멸 `@keyframes blink{ 50%{opacity:.45} }` `animation: blink 1.4s steps(2) infinite;` — `prefers-reduced-motion` 에서 멈춤(opacity 1).
- 랭크 행 — 큰 골드 번호 `#{rank}`(글로우, ~24–28px), 옆에 작게 `/ {total.toLocaleString("en-US")}사`, 우측에 `▲{delta}`(상승 초록) / `▼{|delta|}`(하락 로즈) / `—`(0).
- 마퀴 행 — 상단 얇은 구분선 아래 한 줄, `scoreboardMarquee.join(" · ")` 가 우→좌로 흐름.
  - `@keyframes marq{ from{transform:translateX(100%)} to{transform:translateX(-100%)} }` `animation: marq 13s linear infinite;` overflow hidden. reduced-motion 에서 애니메이션 제거(정적, 넘치면 ellipsis).
- 색 — 골드 `#f2a93b`(랭크), 청록 `#5fd2b4`(태그), 옐로 `#f2cd5e`(마퀴), 초록 `#56d07a`(▲), 로즈(▼). 기존 App.css 팔레트와 조화.

## 작업 (TDD)

- [ ] **1. 데이터 와이어** — GameChrome.tsx 에 derive import + `nationalRanking`/`scoreboardMarquee` 계산.
- [ ] **2. JSX 교체** — `.office-scoreboard` 내부를 랭킹 레이아웃으로(태그+LIVE / `#rank` /total사 ▲delta / 마퀴). delta 부호로 ▲/▼/— + 클래스 분기. 접근성 `aria-label="전국 AI 기업 랭킹"` 유지.
- [ ] **3. CSS** — `.office-scoreboard` 랭킹 레이아웃 + LIVE 점멸 + 마퀴 애니메이션 + ▲/▼ 색. `--pixel-radius`/`--pixel-steps`/하드 섀도, 도트매트릭스 재사용. `@media (prefers-reduced-motion: reduce)` 로 blink·marq 정지. 모바일(≤700px) 컴팩트(min-height ~42px) 유지.
- [ ] **4. 계약 테스트 갱신** — layout-contract.test.ts `:281–285`, `:869–870` 을 새 구조로 교체. 추가로 GameChrome 이 `deriveNationalRanking`/`buildScoreboardMarquee` 를 import·렌더하는지(소스 문자열 단언, 하우스 패턴) + LED 가 `#`+랭크·`LIVE`·마퀴 구조를 가지는지 단언하는 `it("v1.0 CD-1 ...")` 추가.
- [ ] **5. 검증** — `npm test -- src/ui/layout-contract.test.ts src/ui/scoreboard-ranking.test.ts --maxWorkers=1` 통과 + `npm run build`(tsc) 통과. `git diff --stat` 에 simulation.ts·types.ts·data·save 변경 없음(빈 diff). **dev server/브라우저/커밋 안 함.**

## 완료 기준

1. LED 가 파생 모듈에서 전국 랭킹(#rank /total사 ▲delta) + 마퀴를 렌더. 2. LIVE 점멸·마퀴 흐름·reduced-motion 가드. 3. 모바일 컴팩트 푸트프린트 유지. 4. 갱신된 계약 테스트 + scoreboard-ranking 테스트 + build 그린. 5. additive 빈 diff. 6. 보고 — 변경 파일 목록 + 교체한 계약 단언.

## 편집장 검증 (Claude)

- 실서버 390×844 + 데스크톱 — LED 랭킹 가독·마퀴 흐름·LIVE 점멸 육안 + 스크린샷.
- 랭크 수치 캘리브레이션 점검(차고 초반 = 깊은 순위, 성장 시 상승). 어색하면 편집장이 곡선 상수만 조정(파생 테스트 그린 유지).
- `check-v096-first-screen`(officeFrac ≥0.40, overflow 0) 회귀 + 게이트 + additive. 통과 시 Lore 커밋. → CD-2 진행.

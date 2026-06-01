# Codex CLI 인계 — v0.98 #2 키보드 디스미스(ESC) + 초기 포커스

작성일: 2026-06-02
작성자: Claude Code (기획·하네스·검증·커밋 트랙 / 편집장)
대상: Codex CLI — reasoning effort **medium**
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: `main` @ `c2e1503` (v0.98 #1 어포던스). 게이트 53 files / 646 tests.

> **Codex 는 dev server / 브라우저 스모크 금지**(샌드박스 행). **TSX + 단위 테스트(`npm test`)까지만.** 브라우저 검증은 Claude.

---

## 한 줄 요약

민감 오버레이(big-event / payoff-celebration / world-reveal)를 **Escape 키로 닫고**, 떴을 때 **디스미스 버튼에 초기 포커스**를 준다. 기존 디스미스 핸들러를 재사용한다 — 새 게임 로직 없음. additive. 시뮬·세이브·데이터 불변.

## 절대 제약
- additive — `src/game/simulation.ts`, `src/game/types.ts`, 세이브, `data/**` diff 비어야 함. (기존 핸들러 재사용 — `dismissChallengerEntry` 등 이미 존재, 새로 만들지 말 것.)
- **Rules of Hooks 엄수** — 훅은 조건부 return 위에. 특히 `BigEventModal` 은 현재 훅이 없고 `if (!pendingId) return null` 로 일찍 빠진다. 훅을 컴포넌트 최상단으로 올리고, 이른 return 은 훅 뒤로 옮기되 effect 내부에서 가드한다.
- `git commit` 금지, 계약 파일 편집 금지.

## 작업 (TDD)

### Task 1 — RED: 계약
`src/ui/layout-contract.test.ts` (헤더에 `bigEventModal`/`payoffCelebrationModal`/`worldRevealModal` readFileSync 이미 존재) — 마지막 블록 뒤에 추가.
```ts
  it("v0.98 lets keyboard Escape dismiss the sensitive overlays", () => {
    for (const src of [bigEventModal, payoffCelebrationModal, worldRevealModal]) {
      expect(src).toMatch(/addEventListener\(\s*["']keydown["']/);
      expect(src).toMatch(/["']Escape["']/);
    }
  });
```
- [ ] Step 1.1 추가 후 `npm test -- src/ui/layout-contract.test.ts` → **FAIL**.

### Task 2 — GREEN: ESC + 초기 포커스
각 모달에 아래 패턴 적용(이미 `useEffect`/`useRef` import 된 곳은 재사용, 없으면 추가).

**공통 패턴**
```tsx
const dismissRef = useRef<HTMLButtonElement>(null);
useEffect(() => {
  if (!SHOWN) return;            // 오버레이가 떠 있을 때만
  dismissRef.current?.focus();
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") { event.preventDefault(); DISMISS(); }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [SHOWN, /* DISMISS deps */]);
```
그리고 디스미스 `<button ref={dismissRef} ...>`.

- [ ] **WorldRevealModal** — 훅은 이미 있음(`shouldShow` 계산 후). `SHOWN = shouldShow`, `DISMISS = () => setDismissedSeeds(c => { const n = new Set(c); n.add(selection.seed); return n; })`. effect 는 `if (!shouldShow) return null` **위**에 둔다(이미 다른 effect 들이 위에 있으니 동일 위치). `world-reveal-dismiss` 버튼에 ref.
- [ ] **PayoffCelebrationModal** — 훅 이미 있음. `SHOWN = !!moment`(현재 `if (!moment) return null` 직전 계산), `DISMISS = () => setQueue(c => c.slice(1))`. effect 를 `if (!moment) return null` **위**로(훅 순서 유지). `payoff-celebration-dismiss` 버튼에 ref. (큐형 — ESC 한 번 = 다음으로, 정상.)
- [ ] **BigEventModal** — **현재 훅 없음 + 이른 return**. `useEffect`/`useRef` import 추가. 훅을 컴포넌트 최상단(현재 `const pendingId = ...; if (!pendingId) return null;` **위**)으로 올린다. `SHOWN = !!gameState.pendingChallengerEntryIds[0]`, `DISMISS = () => setGameState(c => dismissChallengerEntry(c))`. 이른 return 들(`!pendingId`, `!definition`)은 훅 뒤로. `big-event-dismiss` 버튼에 ref.
- [ ] (선택) **App.tsx offline-modal** — `SHOWN = !!offlineSettlement`, `DISMISS = () => setOfflineSettlement(undefined)`, `.offline-modal button` 에 초기 포커스. (없어도 #2 통과 가능 — 모달 3종이 핵심.)
- [ ] Step 2.x `npm test -- src/ui/layout-contract.test.ts` → **PASS**.

### Task 3 — 단위 테스트(렌더+키보드)
`src/components/` 또는 기존 테스트에 ESC 동작 렌더 테스트 추가(vitest + @testing-library 가 repo에 있으면 사용; 없으면 가능한 방식으로). 최소 1개 — 예: BigEventModal 을 pending 큐 있는 상태로 렌더 → `window.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"}))` → dismiss 호출/상태 변화 확인. (테스트 인프라가 렌더를 지원하지 않으면, 핸들러 로직을 순수 함수로 빼지 말고 — 대신 계약 테스트 + Claude 스모크로 대체하고 이 Task 는 생략 가능. 생략 시 보고에 명시.)
- [ ] `npm test -- --maxWorkers=1` 전체 통과.
- [ ] additive — `git --no-pager diff --stat -- src/game/simulation.ts src/game/types.ts data/` 비어 있음.

## 완료 기준 (Codex)
1. ESC 계약 RED→GREEN.
2. 3 모달 ESC-to-dismiss + 초기 포커스(+선택 offline-modal). Rules of Hooks 준수(빌드/타입 통과).
3. `npm test` 전체 통과. additive diff 비어 있음.
4. `git commit` 안 함. 보고에 변경 파일 + RED→GREEN + 테스트 + Task 3 수행/생략 여부 + diff.

## 편집장 검증 (Claude, 실서버)
- `check-v098-overlays.mjs` 를 ESC 변형으로 돌려(또는 수동) payoff-juice/big-event 에서 **Escape 로 오버레이가 닫히는지** 확인. 초기 포커스가 디스미스 버튼에 가는지 확인.
- `npm run harness:gate < /dev/null` PASS + build(rules-of-hooks/타입 회귀 없음).
- 통과 시 Lore 커밋(두 Co-Authored-By) + push.

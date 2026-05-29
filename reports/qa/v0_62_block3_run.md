# v0.62 Block #3 QA Run - Milestone Fanfare + Annual Near-Miss

작성일: 2026-05-29

## 범위

- 블록 #3만 구현했다.
- 기존 `GameState.unlockedAchievements` 증가를 UI 이전/현재 비교로 감지해 마일스톤 팡파레 큐에 넣었다.
- 기존 `GameState.annualReviewHistory`와 `annual-review.ts` 요구치 계산만으로 최근 연간 심사의 최박빙 조건 마진을 derive해 near-miss relief 카드를 표시했다.
- 새 `GameState` 필드, 새 저장 필드, 새 시스템은 추가하지 않았다.

## 변경 파일

- `data/achievements.json`
- `src/game/achievements.ts`
- `src/game/achievements.test.ts`
- `src/game/annual-review.ts`
- `src/game/annual-review.test.ts`
- `src/components/PayoffCelebrationModal.tsx`
- `src/components/MenuPanels.tsx`
- `src/game/qa-scenarios.ts`
- `src/game/qa-scenarios.test.ts`
- `src/ui/layout-contract.test.ts`
- `src/App.css`
- `reports/qa/v0_62_block3_run.md`

## 구현 요약

- 마일스톤 팡파레: `getAchievementCelebrationMoments`와 `getNewAchievementUnlockIds`를 추가했다. 팡파레는 `PayoffCelebrationModal`의 기존 큐/톤을 재사용하고, 실제 신규 해금 감지는 React ref의 이전 unlocked achievement set과 현재 `unlockedAchievements` 비교로만 처리한다.
- 연간 심사 near-miss: `getAnnualReviewNearMissSignal`을 추가했다. 최근 `annualReviewHistory` 항목의 보상을 현재 자원에서 역산해 심사 직전 자원 상태를 derive하고, 해당 연간 심사 요구치 중 가장 좁은 마진을 찾아 `relief`/`recovery` 표시만 한다.
- QA 시나리오: `?scenario=milestones`를 등록했다. 회사 패널에서 첫 업적 팡파레와 1년차 연간 심사 아슬아슬 통과 relief를 바로 확인할 수 있다.
- 모바일/접근성: 390x844 layout contract를 추가했고, 팡파레/near-miss 애니메이션은 `prefers-reduced-motion: reduce`에서 제거된다.

## achievements.json 추가

- `first_major_war_chest`: `min_cash: 1000000`, 보상 `cash +15000`, `hype +5`
- `agi_threshold_lab`: `min_capability_upgrades: 18`, 보상 `compute +80`, `data +60`

물리 산업 전용 업적은 추가하지 않았다. 현재 achievement condition whitelist가 물리 도메인/제품만을 표현하지 못하므로, 검증 규칙을 넓히지 않고 §5-safe 범위에 머물렀다.

## 불변 확인

- 밸런스/심사 기준: 연간 심사 pass/fail 기준은 변경하지 않았다.
- tick: `src/game/simulation.ts`는 변경하지 않았다.
- save: 새 `GameState` 필드나 저장 필드를 추가하지 않았다. save round-trip shape는 변경하지 않았다.

## 검증 Evidence

### Targeted red/green

명령:

```bash
npm test -- src/game/achievements.test.ts src/game/annual-review.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts
```

결과:

```text
Test Files  4 passed (4)
Tests  140 passed (140)
Duration  980ms
```

### Full gate

명령:

```bash
npm run harness:gate
```

결과:

```text
Test Files  44 passed (44)
Tests  448 passed (448)
Data validation passed.
✓ 112 modules transformed.
✓ built in 896ms
```

## 남은 리스크

- 실제 브라우저 스크린샷 QA는 별도로 실행하지 않았다. 이번 블록의 요구 layout contract와 full gate는 통과했다.

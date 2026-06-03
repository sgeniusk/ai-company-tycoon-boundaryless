# Codex CLI 인계 — v1.0 #7 기록 세부화 (타임라인/도감/업적)

작성일: 2026-06-03
작성자: Claude Code (편집장)
대상: Codex CLI — reasoning effort **medium**
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: `main` @ `dc615eb`(또는 블록 6 이후). 게이트 53 files / 652 tests. 설계 Q2=타임라인/도감/업적 승인. 마스터 `reports/v1_0_completion_plan.md`.

> **Codex 는 dev server / 브라우저 스모크 금지.** CSS/TSX + 단위 테스트 + build 까지만. 브라우저 검증은 Claude. `phase: starting` 멈춤 시 편집장이 취소·직접.

## 한 줄 요약

`기록(log)` 메뉴 팝업(`TimelinePanel`, MenuPanels ~3766)을 **타임라인 / 도감 / 업적** 3 서브탭으로 세부화. 콘텐츠는 기존 것 재배치 — **신규 게임 로직 없음**. visual/additive.
- **타임라인** = 기존 `TimelinePanel` 내용(`gameState.timeline`).
- **도감** = 발견 수집물 — `gameState.roguelite.discoveredArchetypeIds`(태그 파생 아키타입, `getDerivedArchetypes`/`derivationRules`) + `gameState.discoveredPayoffIds`(v0.62 collection-lite). 기존 collection-lite UI 가 다른 메뉴(예 회사/덱)에 있으면 그걸 옮기거나 재사용.
- **업적** = `gameState.unlockedAchievements` + `achievements`(`getAchievementCelebrationMoments` 등 기존).

## 작업 (TDD)

### Task 1 — RED: 계약
`src/ui/layout-contract.test.ts` 추가.
```ts
  it("v1.0 block7 splits the log popup into timeline/collection/achievements subtabs", () => {
    expect(menuPanels).toMatch(/log-subtab|기록.*탭|timeline-tab|collection-tab|achievement-tab/);
    expect(menuPanels).toMatch(/discoveredArchetypeIds|도감/);
    expect(menuPanels).toMatch(/unlockedAchievements|업적/);
  });
```
- [ ] `npm test -- src/ui/layout-contract.test.ts` → **FAIL**.

### Task 2 — GREEN: 서브탭
- [ ] **2.1** `TimelinePanel` 에 서브탭 상태(예 `useState<"timeline"|"collection"|"achievements">("timeline")`) + 탭 버튼(stage-side-tabs 패턴/스타일 재사용 가능).
- [ ] **2.2** 각 탭 렌더 — 타임라인(기존), 도감(discoveredArchetypeIds → `getDerivedArchetypes`/derivationRules 의 title/description, discoveredPayoffIds), 업적(unlockedAchievements → achievements 정의 title/description). **읽기 전용 표시**, 기존 데이터/셀렉터만 사용.
- [ ] **2.3** 도감/업적 UI 가 이미 다른 패널에 있으면 거기서 제거하고 기록으로 통합(중복 방지). 없으면 신규 표시(로직 없이 derive).

### Task 3 — 검증
- [ ] `npm test -- --maxWorkers=1` 통과. `npm run build`(tsc) 통과. additive diff(simulation/types/data) 비어 있음.

## 완료 기준
1. 계약 RED→GREEN. 2. 기록 팝업 = 타임라인/도감/업적 3탭, 콘텐츠 재배치. 3. `npm test`+build, additive 비어 있음. 4. `git commit` 안 함. 보고 동일.

## 편집장 검증 (Claude)
기록 팝업 3탭 전환 동작 + 각 탭 콘텐츠 표시. `check-v1_0-menu-popup`(log) 회귀. 게이트+additive. 통과 시 Lore 커밋+push.

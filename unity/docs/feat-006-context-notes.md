# feat-006 컨텍스트 노트 — Claude Design 첫 화면 반영

작업 중 내린 결정과 그 이유. 멀티세션 핸드오프용.

## 왜 이 작업인가
사용자가 클로드 디자인 핸드오프로 받아 React(v1.0)에 적용했던 첫 화면 디자인이 Unity 포트에 안 옮겨졌다. 메뉴/레이아웃이 정돈 안 돼 보이고, 요소가 안 움직이고, 약속했던 전광판 순위가 없다. 이 디자인은 분실된 게 아니라 reports/에 온전히 문서화돼 있다. 재발명 금지, 충실히 포팅한다.

## 정본 (Source of Truth)
- 마스터 — `reports/v1_0_claude_design_reflection_plan.md`
- 전광판 — `reports/codex-handoff/v1_0_cd1_led_ranking.md`
- 코어3 HUD — `reports/codex-handoff/v1_0_cd2_resource_hud_goal_decor.md`
- 메뉴 IA — `reports/v1_0_menu_uiux_design_review.md`
- 아트 방향 — `reports/v0_62_design_direction.md`
- 순위 파생 로직 — `src/ui/scoreboard-ranking.ts` (+ .test.ts 9통과)
- 경쟁사 데이터 — `data/competitors.json` (12사)
- React 구현 — `src/components/GameChrome.tsx`, `src/App.css` (LED ~876–1055)

## 핵심 디자인 결정 (잠금)
- 오피스 = 주인공. HUD/내비는 씬 위에 뜨는 칩, officeFrac ≥ 0.40 유지.
- 코어 3 자원 = 자금·이용자·연산력. 나머지(데이터·인재·신뢰·화제성·자동화)는 ＋트레이.
- 전광판 = 핵심 훅. `#랭크 / 전국N사 ▲델타` + LIVE 점멸 + 마퀴.
- derive-only — 코어 시뮬(Core/Systems/Save)을 바꾸지 않고 읽어서 파생, additive 지향.

## 순위 파생 공식 (scoreboard-ranking.ts에서 포팅)
- standing = 0.65·점유율(0–1) + 0.35·경쟁권내우위(0–1), clamp 0–1
- 전국순위 = round( (1−standing)^1.6 · (total−1) ) + 1
- total = 2140 + max(0, month−1)·4
- delta = 전월 순위 − 당월 순위 (marketShareHistory 필요)
- 마퀴 = 라이벌 추월 격차 · 이번 달 목표 · 행동 예고 · 글로벌 D-day · 전국 점유율
- 상수 — SHARE_WEIGHT 0.65, LEAD_WEIGHT 0.35, RANK_CURVE_GAMMA 1.6, FIELD_BASE 2140, GROWTH_PER_MONTH 4

## 경쟁사 12사 (data/competitors.json)
chatgody(24%)·jemiinni(21%)·cloyi(17%)·modelforge(15%)·automaru(14%)·chipspark(13%)·novarun(12%)·vizionlab(11%) = 초기 8사, autonova_motors(12월)·brewchain(12월)·toycloud(24월)·ironoracle(24월) = 연차 도전자. 로고 아틀라스 v072 이미 Unity 반영됨.

## Unity 어댑테이션
- CSS 없음 → LED 룩은 Image + 색/그림자/도트 텍스처로 재현. 점멸·마퀴는 코루틴(기존 UiTween/ReactionBubble 패턴).
- React가 가진 guidance/campaign/rival-counters 시스템이 Unity엔 없음 → 마퀴는 우선 가용 신호(순위·점유율·라이벌 격차)로 구성. 가이던스·D-day 라인은 후속 블록.
- 레거시 uGUI 유지. TMP 전환은 backlog.

## 미확인 / 다음 세션이 확인할 것
- React simulation.ts의 getPlayerMarketShare/getMarketRankings/getPlayerCompetitiveScore 정확한 공식. Block A에서 정독 후 포팅.
- marketShareHistory를 Unity GameModel에 어떻게 둘지. delta 계산용, 월 정산 시 append, save 마이그레이션.
- Unity에 경쟁사/시장점유율 로직 전무 확인됨(탐색). Block A가 바닥부터.

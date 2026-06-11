# feat-010 컨텍스트 노트 — 살아있는 오피스 + 수익 도파민

사용자 방향(2026-06-11) — "키우기 게임처럼 사무실 운영하는 재미와 수익이 올라가며 느끼는 도파민적 재미. UI는 간편하게, 볼거리는 풍성하게." React 정본은 v0.62 도파민 4-레버(발견×변주×페이오프×긴장-해소)와 v0.81~0.95 상용 폴리시(코믹 workloop·사건 시야 보호·페이오프 연출).

## 기존 인프라 (재사용)
- `ReactionBubble`+`SpawnReaction` — 직원 위 이모트(승급/출시/해금/강화에 단발 연결됨)
- `FxManager.Celebrate` — 파티클 분출. `UiTween.PopIn`, `ResourceTicker`(숫자 카운트업)
- v081 반응 이모트 6종·v077 축하 엠블럼 3종 — 임포트 완료, 사용처 일부만 연결
- `MonthSummary.WorldEventTitles` — feat-007 #3이 채워줌

## 블록 분해
### #1 수익 도파민 — 플로팅 숫자 + 직원 환호
- `FloatingText.cs` — 오피스 위로 떠오르며 사라지는 텍스트(+$매출 골드/+이용자 블루). 금액 클수록 크고 多.
- 월 정산 후 Revenue/NewUsers 팝 + 수익 달엔 `react_cheer`/`react_coffee` 랜덤 직원 환호.
### #2 코믹 워크루프 — 항상 일하는 오피스
- `WorkLoop.cs` — 액터 셀마다 3~7초 무작위 간격으로 작업 이모트(`react_codespark`/`react_gear`/`react_idea`) 소형 버블. 턴 사이에도 오피스가 산다.
### #3 마일스톤 축하 + 니어미스 (긴장-해소)
- 승급 — `FxManager.Celebrate` + v077 `celebrate_achievement` 중앙 빅팝. 첫 출시 — `celebrate_combo` + 파티클.
- `Systems/MilestoneService.cs` (헤드리스) — 승리 3조건 진행률 계산, 최고 진행 ≥80%면 니어미스 한 줄("승리까지 이용자 X!"). EditMode 테스트. 월 요약에 노출.
### #4 사건 리본 — 오피스를 가리지 않는 알림
- `ToastRibbon.cs` — 오피스 상단 토스트 큐(슬라이드 인→유지→아웃). 세계 이벤트·승급·니어미스가 흐른다. React v0.95 "사건 시야 보호" 대응.

## 결정
- 코어(Core/Systems/Save) 무변경 — #3 MilestoneService만 Systems 추가(derive-only, UI 비의존).
- 연출은 전부 UI 레이어. 캡처 검증 — 월 진행 직후 0.3s 시점 캡처(10-dopamine)로 플로팅·토스트 확인.

## 진행 기록
- 2026-06-11 — 설계. 사용자 feat-010 우선 승인.
- 2026-06-11 — **4블록 완료.** #1 FloatingText(수익 스케일 1~3발+환호) #2 WorkLoop(액터별 3.5~7.5s 위상 어긋난 작업 이모트) #3 SpawnCelebration(승급 celebrate_achievement+첫 출시 celebrate_combo+FxManager 파티클) + MilestoneService 니어미스(MilestoneTests 4) #4 ToastRibbon(세계 이벤트·승급·니어미스 큐, 오피스 비가림). EditMode 54/54 + 캡처 10-dopamine(플로팅·토스트·가이던스 FAB 동시 확인).

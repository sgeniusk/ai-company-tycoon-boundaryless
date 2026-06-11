# CHANGELOG — Unity Port

구조·아키텍처 변경만 기록한다.

## 2026-06-07 — P0 부트스트랩
- `unity/` Unity 6000.4.10f1 프로젝트 신설 (모노레포 하위, 사용자 선택).
- 패키지 — URP 17.4.0, com.unity.2d.sprite, Input System 1.19.0, uGUI 2.0.0(TMP), Test Framework 1.6.0.
- 아키텍처 결정 — 코어(Core/Data/Systems/Save)는 헤드리스 순수 C# 레이어, UI/Presentation 분리. 이벤트는 정적 `GameEvents` 허브(Godot EventBus 대응)로 시작.
- 코어 시드 — GameModel(GameState 대응), ResourceId(+데이터 키 매핑), GameEvents, ResourceDef(SO 패턴).
- 하네스 — Unity 전용 CLAUDE/AGENTS/feature_list/progress/session-handoff/init.sh. 루트 React/Godot 하네스 보존.

## 2026-06-11 — feat-012 테크트리 + 경제 정렬 (구조 변경 3건)
- **노출 상태 머신** — `Systems.ProductVisibilityService` 신설. 제품·도메인 5상태(숨김→???티저→실명→해금→출시) derive-only 파생, 세이브 필드 없음. UI(제품/능력 팝업)가 이 서비스를 단일 진실로 사용.
- **세이브 v4** — `SaveData.productLevels` 추가 (제품 레벨업 포팅). 구세이브(v3 이하)는 출시 제품 레벨 1 파생으로 무손실 마이그레이션.
- **경제 공식 React 정렬** — (a) `MonthController` 자동화 할인을 연산비 포함 전체 비용에 적용 + 상한 75% (기존은 연산비 할인 제외 — Godot 잔재). (b) `ProductService` 하이프 성장 *10 증폭 제거, React growthMultiplier 공식으로. (c) `RecruitService` 신설 — 반복 인재 채용 (talent 공급원, balance.json recruit_* 키). 게임플레이 영향 — 이용자 성장 속도 React 수준(~1/10), 자동화 투자 가치 상승.
- **데이터 정본 확장 (additive)** — products.json 36→51종 (teaser/tier/prerequisite_products/미래 웨이브 15종), capabilities.json category. 그래프 무결성은 EditMode `TechTreeGraphTests`가 게이트. 루트 React 고정 기대값 2건이 이 확장으로 깨짐 (React 트랙 stale, 보류).
- **경제 완주 가능성 게이트 보류** — `TechTreeReachabilityTests` (10년 tier4 목표 지향 봇) Inconclusive. 구조 진단 포함, feat-013에서 Fail 게이트로 복원 예정.

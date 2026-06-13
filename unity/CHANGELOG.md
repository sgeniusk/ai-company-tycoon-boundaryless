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

## 2026-06-11 (밤) — feat-013 경제 완주 가능성 (구조 변경 4건 + 버그 수정 1건)
- **산업 시너지/콤보 레이어** — `IndustrySynergyDef`(SO)·`IndustrySynergyService` 신설, `industry_synergies.json`+`industry_combos.json` 임포트(React v0.60 동치). 도메인 포트폴리오(해금 ∪ 출시 제품 도메인)가 월간 효과로 보상받는다. `MonthController` 3.6 additive 훅.
- **이용자 수익화** — `balance.json`에 `revenue_per_1000_users`(additive, React 비파괴). 이용자가 순수 부채(연산비만)이던 구조를 자산으로 전환. 키 없으면 기존 동작.
- **GPU 증설** — `RecruitService.BuyCompute`(`compute_pack_cost/amount`). 연산력의 유일한 반복 공급원 (기존은 일회성 +110이 전부라 장기 연구가 영구 차단).
- **연산력 소모 공식 React 정렬** — `ProductService.ApplyMonthly`를 총 이용자 비례에서 React computePressure(신규 이용자 기반)로. 누적 이용자의 무한 잠식 제거.
- **도메인 해금 순서 버그 수정** — `CapabilityService.Upgrade`가 능력별 unlocks_domains 매핑 레벨에서만 TryUnlock해, 다중 요건 도메인(반도체=최적화2+코드2 등)이 연구 순서에 따라 영구 미해금. `Domains.CheckAll()`로 교체.
- 게이트 — `TechTreeReachabilityTests`를 Fail 게이트로 복원. 목표 지향 봇 기준 tier4 44개월 해금. EditMode 97/97.

## 2026-06-13 — feat-014 경영 탭 + feat-015 자본 사다리 (Unity 오리지널 콘텐츠)
- **경영 탭 개편** — 도크 [제품·연구·경영]. 채용·GPU·시설·전략·투자·경영정보를 경영 탭에 통합.
- **feat-014 #1 채용 3택1** — agent_types 22종 임포트, 시드 결정론 후보(희귀도 가중)+로스터(세이브 v5)+research/engineering 비용 할인+프리랜서 계약(정원 무관 talent).
- **feat-014 #2 시설** — office_expansions 6단계 구매형 확장(세이브 v6 officeLevel, 구세이브 성급 파생)+company_locations 5곳 본사 이전(위치 고정비 모디파이어 0.82~1.8, 사람 영입 할인). ThresholdEval min_star 오버로드.
- **feat-015 지분·자본 사다리 (Unity 오리지널 1호, React에 없음)** — 5블록:
  - #1 EquityService(밸류에이션=월매출*24+이용자*2+현금, 창업자 지분·주주 명부, 세이브 v7)+경영정보 카드.
  - #2 StartupInterview(개업 스토리 3장: 엔젤/공동창업/은행)+0성 크레스트(첫 출시 전)+대출 코어(LoanPrincipal, 월 이자 1.5% 고정비, 세이브 v8).
  - #3 LoanService(한도=월매출*6, 대출/상환)+FundingService(성급 일회성 시리즈 라운드, 밸류에이션 가격, 세이브 v9).
  - #4 IpoService(4성 IPO, 공모 10/20/30% 프리미엄 1.5, 월별 주가=신뢰 드리프트+시드 노이즈, 세이브 v10)+시가총액 진화.
  - #5 RichestRanking(상장 후 세계 부자 순위 전광판+등반 토스트)+EquityEnding(지분 형태별 특별 결말 4종, endings.json 비변형).
- 세이브 v4→v10 누적, 전부 구세이브 무손실 마이그레이션. EditMode 114→133. TechTreeReachability 게이트 그린 유지(자본 액션은 UI 옵트인, 봇 무영향).

## 2026-06-13 (이어서) — feat-014 경영 탭 #3~#5 (잔여 완결)
- **#3 인재 개발력 전체 환산** — RosterBonus 8축(research/engineering 비용 할인 + product 매출% + growth 이용자% + autonomy 연산-% + operations 고정비-% + safety 월신뢰 + creativity 월화제성). 전부 derive-only·상한·로스터 없으면 0. TOPS 단위 표기 + 제품 예상 월매출 + 정산 기대 vs 실제.
- **#4 전략 활동** — StrategyService(마케팅 캠페인=화제성·이용자, 경쟁사 견제=신뢰 리스크로 1위 라이벌 점수 -15%·기세 0) + 6개월 쿨다운(세이브 v11).
- **#5 성급 비주얼 사다리** — StageVisual 배경 키 매핑(차고/성장/데이터센터/랜드마크) + GameScreen 단계 승급 배경 스왑(아트 미반입 시 office 폴백, 드롭인 준비). 배경 3장 PNG는 Codex 절차 생성(office.png 떠있는 등각 플랫폼 앵커).
- 세이브 v10→v11. EditMode 136→145. 봇 무영향(전략·시설은 UI 옵트인). 경영 탭 5섹션 완성 — 경영정보·인재·시설·전략 활동·전략·투자.

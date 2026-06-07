# Codex Handoff — feat-003 Vertical Slice 모바일 UI

자기완결적이다. Codex는 zero-context로 시작하니 여기 적힌 베이스 API만으로 작업한다.

## 목표
이미 구현·검증된 헤드리스 코어를 세로 모바일 화면에 연결하는 Vertical Slice UI를 코드로 만든다. 씬/프리팹을 손으로 만들지 말고 C#로 런타임에 UI를 생성한다(프로그래매틱 uGUI). 검증은 컴파일 + 사람이 Unity 실행으로 한다.

## 환경 / 경로 (repo 루트가 workspace, Unity 프로젝트는 unity/)
- Unity 6000.4.10f1, URP, asmdef 분리.
- 수정 금지 — `data/`, repo 루트, 기존 `Scripts/{Core,Data,Systems,Save}`·`Schema/` 파일(읽기만 한다). 새 파일만 추가한다.
- 작업 범위 — `unity/` 안에서만.

## 스택 제약 (중요)
- 레거시 `UnityEngine.UI`를 쓴다(TextMeshPro 금지). TMP는 에디터 essentials 임포트가 필요해 헤드리스에서 막힌다. `Text/Button/Image/VerticalLayoutGroup/HorizontalLayoutGroup/LayoutElement/ContentSizeFitter` 사용.
- 폰트는 `Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf")`.
- 스크롤은 단순화 가능 — VS에서는 VerticalLayoutGroup 스택으로 충분하다(완전한 ScrollRect는 선택). 오버플로우는 주석으로 남겨라.
- 새 파일은 한 줄 한국어 헤더로 시작하고, 한국어 문장은 콜론으로 끝내지 않는다.

## 이미 있는 안정된 베이스 (읽고 호출만 한다 — 수정 금지)
- `AICompanyTycoon.Systems.SimulationContext.Create(DataCatalog catalog, int seed = 12345)` → 모든 서비스가 배선된 컨텍스트. 필드 — Model, Catalog, Resources, Domains, Capabilities, Products, Upgrades, Automation, Stages, Events, Month.
- `MonthController.AdvanceMonth()` → `MonthSummary`(필드 — Month, BaseCost, SalaryCost, ComputeCost, TotalCashCost, Revenue, NewUsers, Warnings(List<string>), GameOver, GameWon, Outcome, StageChangedTo).
- `ProductService` — GetAvailable():List<ProductDef>, Launch(id):bool, IsActive(id):bool, CanLaunch(id):bool. 잠금 사유는 직접 구성한다(도메인 미해금/능력 부족/신뢰 부족/비용 부족).
- `CapabilityService` — GetLevel(id):int, CanUpgrade(id):bool, Upgrade(id):bool, GetUpgradeCost(id):List<ResourceAmount>.
- `UpgradeService` — CanPurchase(id):bool, Purchase(id):bool, IsPurchased(id):bool.
- `AutomationService` — CanPurchase(id):bool, Purchase(id):bool, IsPurchased(id):bool.
- `DomainService` — IsUnlocked(id):bool. `RandomEventService` — TryTrigger():GameEventDef, Resolve(choiceId):bool, Current{get}.
- `AICompanyTycoon.Core.GameEvents` (정적 이벤트, 구독/해지) — ResourceChanged(ResourceId,double,double), ResourcesUpdated(), MonthAdvanced(int), CompanyStageChanged(string), ProductLaunched(string), DomainUnlocked(string), CapabilityUpgraded(string,int), LogMessage(string).
- `AICompanyTycoon.Core.ResourceFormat.Format(ResourceId, double)` → 표시 문자열. `ResourceIds.All`(ResourceId[]), `ResourceIds.ToKey(id)`. `ResourceId` enum — Cash, Users, Compute, Data, Talent, Trust, Hype, Automation.
- `AICompanyTycoon.Save.SaveService` — 생성자(path 생략 가능), Save(GameModel), Load(GameModel):bool, HasSave():bool, Delete().
- 데이터 — `Resources.Load<DataCatalog>("DataCatalog")`. Def 필드는 `Scripts/Data/Schema/*.cs` 참조(예 ProductDef.displayName/baseRevenue/launchCost/requiredCapabilities/trustRequirement, CapabilityDef.maxLevel/upgradeCosts/icon, DomainDef.displayName, UpgradeDef.cost/requirements, GameEventDef.choices[EventChoice.id/text]).

## 산출물
1. `Assets/_Project/Scripts/UI/AICompanyTycoon.UI.asmdef` — references: `AICompanyTycoon.Core`, `AICompanyTycoon.Data`, `AICompanyTycoon.Systems`, `AICompanyTycoon.Save`, `UnityEngine.UI`.
2. `Assets/_Project/Scripts/UI/UiFactory.cs` — 정적 헬퍼. CreateCanvas(name)(ScreenSpaceOverlay + CanvasScaler ScaleWithScreenSize, referenceResolution 1080x1920, matchWidthOrHeight=1 + GraphicRaycaster), EnsureEventSystem()(EventSystem + StandaloneInputModule, 이미 있으면 skip), Panel(parent,color), Label(parent,text,fontSize), Button(parent,labelText)->(Button,Text), VBox(parent,spacing,padding), HBox(parent,spacing). 모든 Text의 font는 LegacyRuntime.ttf.
3. `Assets/_Project/Scripts/UI/GameScreen.cs` — UI 트리 생성 + GameEvents 구독 + 핸들러.
   - 상단바 — 타이틀, "N월차"(MonthAdvanced 구독), 회사 단계(Catalog.GetStage(Model.CompanyStageId).displayName).
   - 자원 HUD — 8행(ResourceIds.All), 각 행은 아이콘+이름과 ResourceFormat.Format 값. ResourceChanged/ResourcesUpdated 구독으로 갱신.
   - 탭 — 제품/능력/업그레이드 버튼 + 패널 전환.
   - 제품 탭 — 활성/출시가능(출시 버튼 → Products.Launch)/잠금(사유 텍스트). 능력 탭 — 도메인 목록(해금 여부) + 능력(레벨/최대, 업글 버튼 → Capabilities.Upgrade, 비용 표시). 업그레이드 탭 — 일반(구매 → Upgrades.Purchase)+자동화(구매 → Automation.Purchase).
   - 월 요약 — 마지막 MonthSummary(비용/매출/경고) 텍스트.
   - 이벤트 모달 — 평소 숨김. 이벤트 발생 시 제목/설명/선택지 버튼(→ Events.Resolve). 펜딩 이벤트가 있으면 다음 달을 막는다.
   - 하단바 — 다음 달(Month.AdvanceMonth → 요약 갱신 → balance.eventTriggerChance 확률로 Events.TryTrigger → 모달), 저장, 불러오기, 새 게임(컨텍스트 재생성 + 전체 새로고침).
   - 액션 후 리스트와 HUD를 새로고침한다. 게임오버/승리 시 다음 달 버튼 비활성.
4. `Assets/_Project/Scripts/UI/GameBootstrap.cs` (MonoBehaviour) — Start(): catalog 로드, SimulationContext.Create, SaveService 생성, UiFactory.EnsureEventSystem, GameScreen 생성·빌드·초기 새로고침. 핸들러를 public 메서드로 노출(향후 PlayMode 테스트용).
5. `Assets/Editor/SceneBuilder.cs` (Editor) — [MenuItem("AICT/Create Game Scene")] + static CreateGameScene(): 새 씬 생성, "GameBootstrap" GameObject에 GameBootstrap 부착, `Assets/_Project/Scenes/Game.unity`로 저장, EditorBuildSettings에 추가. -executeMethod로 호출 가능.

## Done 기준
- [ ] UI asmdef 포함 전체 컴파일(사람이 init.sh로 확인).
- [ ] `Game.unity` 생성, GameBootstrap 포함.
- [ ] 새 파일만 추가, 기존 코어 미수정, `data/`·루트 미수정.
- [ ] 새 파일 한 줄 한국어 헤더, 한국어 문장 콜론 종결 금지.
- 샌드박스로 Unity 실행 불가하면 코드만 완성하고 "검증 보류"를 명시하라 — 사람이 SceneBuilder.CreateGameScene + init.sh로 권위 검증한다.

## 참고 (정답지)
Godot UI 구조 — `../scripts/ui/MainScreen.gd`(탭/카드/모달/요약 생성 패턴), `../scripts/ui/ResourcePanel.gd`(자원 행 패턴).

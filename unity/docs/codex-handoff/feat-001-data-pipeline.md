# Codex Handoff — feat-001 데이터 파이프라인

이 문서는 자기완결적이다. Codex는 zero-context로 시작하니 여기에 적힌 경로와 계약만으로 작업한다.

## 목표
repo 루트 `data/*.json`(한국어 1차)을 Unity ScriptableObject 자산으로 임포트하는 파이프라인을 만든다. 산출물은 세 가지다. (1) Editor 임포터, (2) 런타임 `DataCatalog`, (3) EditMode 테스트.

## 환경 / 경로 (working dir = `unity/`)
- Unity 6000.4.10f1, URP, asmdef 분리 프로젝트.
- 소스 JSON — repo 루트 `data/`. Unity에서는 `Path.GetFullPath(Path.Combine(Application.dataPath, "..", "..", "data"))`.
- **수정 금지** — `../data/**`, repo 루트 파일, `Assets/_Project/Scripts/Data/Schema/**`(아래 계약). 필드가 모자라면 고치지 말고 보고하라.
- **작업 범위** — `unity/` 안에서만.

## 이미 작성된 SO 계약 (수정 금지, 그대로 채운다)
경로 `Assets/_Project/Scripts/Data/Schema/`, 네임스페이스 `AICompanyTycoon.Data`. **정확한 필드명은 각 .cs를 직접 읽어 확인하라.**
- 공유 타입 `SharedTypes.cs` — `ResourceAmount{ResourceId resource; double amount}`, `CostTier{List<ResourceAmount> amounts}`, `CapabilityLevel{string capabilityId; int level}`, `DomainUnlock{int level; string domainId}`, `Threshold{string key; double value}`.
- `ResourceId`(enum, `AICompanyTycoon.Core`) 와 문자열 변환 — `ResourceIds.TryParse(key, out id)`, `ResourceIds.ToKey(id)`. 키는 cash/users/compute/data/talent/trust/hype/automation.
- SO — `ResourceDef`(기존), `ProductDef`, `CapabilityDef`, `DomainDef`, `UpgradeDef`, `AutomationDef`, `GameEventDef`(+`EventChoice`), `CompanyStageDef`, `BalanceConfig`.

## JSON 파싱
- **UPM 패키지를 추가하지 말 것**(샌드박스에 네트워크가 없다). 대신 MiniJSON 단일 파일(퍼블릭 도메인)을 `Assets/_Project/Scripts/Data/ThirdParty/MiniJson.cs`에 벤더링한다. `MiniJSON.Json.Deserialize(text)`가 중첩 `Dictionary<string,object>`/`List<object>`를 반환하게 한다. 동적 키 딕셔너리(balance, costs, conditions, unlocks_domains)에 적합하다.
- MiniJSON은 숫자를 long/double로 준다 — object→double/int 캐스팅 헬퍼를 두라.
- 자원 키는 `ResourceIds.TryParse`로 변환하고 미지 키는 경고 로그 후 skip.

## 매핑 규칙 (파일별)
JSON 키 → SO 필드. 정답지가 필요하면 Godot 원본 `../scripts/systems/*.gd`, `../scripts/core/DataLoader.gd`를 본다.

- **resources.json**(`resources` 맵, 8개) → ResourceDef — id, name→displayName, description, initial_value→initialValue, min_value→minValue, max_value→maxValue, icon, category.
- **balance.json**(`balance` 평면 맵) → BalanceConfig — 아래 명명 키만 필드로, 나머지(staff_aftermath_* 등)는 `extra`(Threshold)로.
  base_monthly_cash_cost→baseMonthlyCashCost, salary_per_talent→salaryPerTalent, compute_cost_per_1000_users→computeCostPer1000Users, monthly_hype_decay→monthlyHypeDecay, trust_recovery_threshold→trustRecoveryThreshold, trust_recovery_amount→trustRecoveryAmount, growth_rate_base→growthRateBase, hype_growth_multiplier→hypeGrowthMultiplier, trust_multiplier_high_threshold→trustMultiplierHighThreshold, trust_multiplier_low_threshold→trustMultiplierLowThreshold, trust_enterprise_bonus→trustEnterpriseBonus, trust_low_penalty→trustLowPenalty, automation_cost_reduction_per_point→automationCostReductionPerPoint, game_over_cash_threshold→gameOverCashThreshold, game_over_trust_threshold→gameOverTrustThreshold, success_users_threshold→successUsersThreshold, success_cash_threshold→successCashThreshold, success_automation_threshold→successAutomationThreshold, success_min_products→successMinProducts(int), event_trigger_chance→eventTriggerChance.
- **products.json**(`products` 배열) → ProductDef — id, name→displayName, description, domain, required_capabilities{cap:lvl}→requiredCapabilities, trust_requirement→trustRequirement, launch_cost{res:amt}→launchCost, base_revenue→baseRevenue, base_users_per_month→baseUsersPerMonth, data_generated_per_month→dataGeneratedPerMonth, compute_per_1000_users→computePer1000Users, hype_on_launch→hypeOnLaunch, level(기본 1), tags[]→tags.
- **capabilities.json**(배열, 12개) → CapabilityDef — id, name→displayName, description, max_level→maxLevel, upgrade_costs[{res:amt}]→upgradeCosts(List&lt;CostTier&gt;), unlocks_domains{"lvl":domainId}→unlocksDomains(DomainUnlock{level=int(lvl), domainId}), effects_per_level{res:amt}→effectsPerLevel, icon.
- **domains.json**(배열, 15개) → DomainDef — id, name→displayName, description, unlocked_by_default→unlockedByDefault, unlock_requirements{cap:lvl}→unlockRequirements, market_size→marketSize, risk_level→riskLevel, icon.
- **upgrades.json**(`upgrades` 배열) → UpgradeDef — id, name→displayName, description, cost{res:amt}→cost, effects{res:amt}→effects, requirements{min_*:val}→requirements(List&lt;Threshold&gt;), one_time→oneTime(기본 true).
- **automation_upgrades.json**(`automation_upgrades` 배열) → AutomationDef — id, name→displayName, description, cost→cost, automation_gain→automationGain, effects{res:amt}→effects, requirements{min_*}→requirements, monthly_benefit→monthlyBenefitText.
  - `monthlyEffects`는 JSON에 없다. 아래 맵으로 시드한다 (Godot `AutomationSystem.gd`의 `match auto_id`).
    automated_marketing→[{Hype,2}], product_analytics_agent→[{Data,5}], model_optimization_pipeline→[{Compute,10}], autonomous_sales_agent→[{Cash,1000}], 그 외→빈 리스트.
- **events.json**(`events` 배열) → GameEventDef — id, name→displayName, description, weight(기본 5), conditions{min_*:val}→conditions(List&lt;Threshold&gt;), choices[{id,text,description,effects{res:amt}}]→choices(List&lt;EventChoice&gt;).
- **company_stages.json**(`company_stages` 배열, 6개) → CompanyStageDef — id, name→displayName, description, requirements{min_*:val}→requirements(List&lt;Threshold&gt;), order.

## 산출물 1 — Editor 임포터
- `Assets/Editor/DataImporter.cs` (Assembly-CSharp-Editor. Core/Data는 autoReferenced, Newtonsoft 사용 가능).
- `[MenuItem("AICT/Import Data From JSON")] public static void ImportAll()` — 배치모드 `-executeMethod DataImporter.ImportAll`로도 호출 가능한 static.
- 카테고리별 자산 경로 — `Assets/_Project/ScriptableObjects/{ResourceDefs,Products,Capabilities,Domains,Upgrades,Automation,Events,Stages}/<id>.asset`, `.../ScriptableObjects/BalanceConfig.asset`.
- **멱등** — id 기준으로 기존 자산을 갱신(없으면 생성). 다시 돌려도 중복이 안 생겨야 한다.
- 마지막에 DataCatalog 자산을 갱신한다(아래).

## 산출물 2 — DataCatalog (런타임)
- `Assets/_Project/Scripts/Data/DataCatalog.cs`, `AICompanyTycoon.Data`, `[CreateAssetMenu(menuName="AICT/Data Catalog")]`.
- 필드 — `List<ResourceDef> resources; List<ProductDef> products; List<CapabilityDef> capabilities; List<DomainDef> domains; List<UpgradeDef> upgrades; List<AutomationDef> automation; List<GameEventDef> events; List<CompanyStageDef> stages; BalanceConfig balance;`
- 조회 — `GetResource/GetProduct/GetCapability/GetDomain/GetUpgrade/GetAutomation/GetEvent/GetStage(string id)`, 없으면 null.
- 임포터가 `Assets/_Project/Resources/DataCatalog.asset`에 생성/갱신 → 런타임 `Resources.Load<DataCatalog>("DataCatalog")` 가능.

## 산출물 3 — EditMode 테스트
- `Assets/_Project/Tests/EditMode/DataImportTests.cs`. 필요하면 `AICompanyTycoon.Tests.EditMode.asmdef`에 참조 추가.
- DataCatalog.asset를 로드해 검증 — resources==8, capabilities==12, domains==15, stages==6, products/upgrades/automation/events == 각 JSON 배열 길이(>0).
- 샘플 — capability "language" maxLevel==5 && upgradeCosts.Count==5, domain "creator_tools" unlockRequirements에 (vision,1), balance.baseMonthlyCashCost==400, automation "automated_marketing" monthlyEffects에 (Hype,2), GetProduct(유효 id)!=null.
- 테스트 전 임포트가 돼 있어야 한다 — 먼저 `-executeMethod DataImporter.ImportAll`로 자산을 생성한 뒤 `./init.sh`.

## Done 기준
- [ ] `./init.sh` green (기존 3 + 신규 데이터 테스트 통과).
- [ ] ScriptableObjects/ 자산 생성, Resources/DataCatalog.asset 채워짐.
- [ ] Schema/`../data`/루트 미수정.
- [ ] 새 파일은 한 줄 한국어 헤더로 시작, 한국어 문장은 콜론으로 끝내지 않음.
- 샌드박스로 Unity 실행이 막히면 코드만 완성하고 "검증 보류"를 명시하라 — 권위 검증(임포터 실행 + init.sh)은 사람이 한다.

## 검증 명령
```bash
cd unity
UNITY="/Applications/Unity/Hub/Editor/6000.4.10f1/Unity.app/Contents/MacOS/Unity"
"$UNITY" -batchmode -nographics -quit -projectPath . -executeMethod DataImporter.ImportAll -logFile -
./init.sh
```

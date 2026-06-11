// 루트 data JSON을 Unity ScriptableObject 자산으로 변환하는 에디터 임포터.
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;
using MiniJSON;
using UnityEditor;
using UnityEngine;

public static class DataImporter
{
    private const string ScriptableObjectRoot = "Assets/_Project/ScriptableObjects";
    private const string CatalogPath = "Assets/_Project/Resources/DataCatalog.asset";

    [MenuItem("AICT/Import Data From JSON")]
    public static void ImportAll()
    {
        EnsureFolder(ScriptableObjectRoot);

        var resources = ImportResources();
        var balance = ImportBalance();
        var products = ImportProducts();
        var capabilities = ImportCapabilities();
        var domains = ImportDomains();
        var upgrades = ImportUpgrades();
        var automation = ImportAutomation();
        var events = ImportEvents();
        var stages = ImportStages();
        var competitors = ImportCompetitors(ReadLocale("ko.json"));
        var runModifiers = ImportRunModifiers();
        var runTagEffects = ImportRunTagEffects();
        var worldEvents = ImportWorldEvents();
        var difficultyTiers = ImportDifficultyTiers();
        var archetypes = ImportArchetypes();
        var endings = ImportEndings();

        UpdateCatalog(resources, products, capabilities, domains, upgrades, automation, events, stages, competitors, runModifiers, runTagEffects, worldEvents, difficultyTiers, archetypes, endings, balance);

        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();
        Debug.Log("[DataImporter] JSON data import complete.");
    }

    private static List<ResourceDef> ImportResources()
    {
        var root = ReadJsonObject("resources.json");
        var resources = GetObject(root, "resources");
        var imported = new List<ResourceDef>();
        EnsureFolder(ScriptableObjectRoot + "/ResourceDefs");

        foreach (var key in SortedKeys(resources))
        {
            var source = AsObject(resources[key], "resources." + key);
            var id = GetString(source, "id", key);
            var asset = LoadOrCreate<ResourceDef>(ScriptableObjectRoot + "/ResourceDefs/" + id + ".asset");
            asset.id = id;
            asset.displayName = GetString(source, "name");
            asset.description = GetString(source, "description");
            asset.initialValue = GetDouble(source, "initial_value");
            asset.minValue = GetDouble(source, "min_value");
            asset.maxValue = GetDouble(source, "max_value", 999999999);
            asset.icon = GetString(source, "icon");
            asset.category = GetString(source, "category");
            EditorUtility.SetDirty(asset);
            imported.Add(asset);
        }

        imported.Sort((left, right) => string.Compare(left.id, right.id, StringComparison.Ordinal));
        return imported;
    }

    private static BalanceConfig ImportBalance()
    {
        var root = ReadJsonObject("balance.json");
        var source = GetObject(root, "balance");
        var asset = LoadOrCreate<BalanceConfig>(ScriptableObjectRoot + "/BalanceConfig.asset");
        asset.extra = new List<Threshold>();

        foreach (var key in SortedKeys(source))
        {
            var value = GetDouble(source, key);
            switch (key)
            {
                case "base_monthly_cash_cost":
                    asset.baseMonthlyCashCost = value;
                    break;
                case "salary_per_talent":
                    asset.salaryPerTalent = value;
                    break;
                case "compute_cost_per_1000_users":
                    asset.computeCostPer1000Users = value;
                    break;
                case "monthly_hype_decay":
                    asset.monthlyHypeDecay = value;
                    break;
                case "trust_recovery_threshold":
                    asset.trustRecoveryThreshold = value;
                    break;
                case "trust_recovery_amount":
                    asset.trustRecoveryAmount = value;
                    break;
                case "growth_rate_base":
                    asset.growthRateBase = value;
                    break;
                case "hype_growth_multiplier":
                    asset.hypeGrowthMultiplier = value;
                    break;
                case "trust_multiplier_high_threshold":
                    asset.trustMultiplierHighThreshold = value;
                    break;
                case "trust_multiplier_low_threshold":
                    asset.trustMultiplierLowThreshold = value;
                    break;
                case "trust_enterprise_bonus":
                    asset.trustEnterpriseBonus = value;
                    break;
                case "trust_low_penalty":
                    asset.trustLowPenalty = value;
                    break;
                case "automation_cost_reduction_per_point":
                    asset.automationCostReductionPerPoint = value;
                    break;
                case "game_over_cash_threshold":
                    asset.gameOverCashThreshold = value;
                    break;
                case "game_over_trust_threshold":
                    asset.gameOverTrustThreshold = value;
                    break;
                case "success_users_threshold":
                    asset.successUsersThreshold = value;
                    break;
                case "success_cash_threshold":
                    asset.successCashThreshold = value;
                    break;
                case "success_automation_threshold":
                    asset.successAutomationThreshold = value;
                    break;
                case "success_min_products":
                    asset.successMinProducts = GetInt(source, key);
                    break;
                case "event_trigger_chance":
                    asset.eventTriggerChance = value;
                    break;
                default:
                    asset.extra.Add(new Threshold { key = key, value = value });
                    break;
            }
        }

        EditorUtility.SetDirty(asset);
        return asset;
    }

    private static List<ProductDef> ImportProducts()
    {
        var items = GetRootList("products.json", "products");
        var imported = new List<ProductDef>();
        EnsureFolder(ScriptableObjectRoot + "/Products");

        foreach (var item in items)
        {
            var source = AsObject(item, "products item");
            var id = GetString(source, "id");
            var asset = LoadOrCreate<ProductDef>(ScriptableObjectRoot + "/Products/" + id + ".asset");
            asset.id = id;
            asset.displayName = GetString(source, "name");
            asset.description = GetString(source, "description");
            asset.domain = GetString(source, "domain");
            asset.requiredCapabilities = ToCapabilityLevels(GetOptionalObject(source, "required_capabilities"));
            asset.trustRequirement = GetDouble(source, "trust_requirement");
            asset.launchCost = ToResourceAmounts(GetOptionalObject(source, "launch_cost"), id + ".launch_cost");
            asset.baseRevenue = GetDouble(source, "base_revenue");
            asset.baseUsersPerMonth = GetDouble(source, "base_users_per_month");
            asset.dataGeneratedPerMonth = GetDouble(source, "data_generated_per_month");
            asset.computePer1000Users = GetDouble(source, "compute_per_1000_users");
            asset.hypeOnLaunch = GetDouble(source, "hype_on_launch");
            asset.level = GetInt(source, "level", 1);
            asset.tags = ToStringList(GetOptionalList(source, "tags"));
            asset.teaser = GetString(source, "teaser");
            asset.prerequisiteProducts = ToStringList(GetOptionalList(source, "prerequisite_products"));
            asset.tier = GetInt(source, "tier", 1);
            asset.maxLevel = GetInt(source, "max_level", 1);
            asset.upgradeCostMultiplier = GetDouble(source, "upgrade_cost_multiplier", 1.5);
            EditorUtility.SetDirty(asset);
            imported.Add(asset);
        }

        SortById(imported);
        return imported;
    }

    private static List<CapabilityDef> ImportCapabilities()
    {
        var items = GetRootList("capabilities.json", "capabilities");
        var imported = new List<CapabilityDef>();
        EnsureFolder(ScriptableObjectRoot + "/Capabilities");

        foreach (var item in items)
        {
            var source = AsObject(item, "capabilities item");
            var id = GetString(source, "id");
            var asset = LoadOrCreate<CapabilityDef>(ScriptableObjectRoot + "/Capabilities/" + id + ".asset");
            asset.id = id;
            asset.displayName = GetString(source, "name");
            asset.description = GetString(source, "description");
            asset.maxLevel = GetInt(source, "max_level", 1);
            asset.upgradeCosts = ToCostTiers(GetOptionalList(source, "upgrade_costs"), id + ".upgrade_costs");
            asset.unlocksDomains = ToDomainUnlocks(GetOptionalObject(source, "unlocks_domains"));
            asset.effectsPerLevel = ToResourceAmounts(GetOptionalObject(source, "effects_per_level"), id + ".effects_per_level");
            asset.icon = GetString(source, "icon");
            asset.category = GetString(source, "category");
            EditorUtility.SetDirty(asset);
            imported.Add(asset);
        }

        SortById(imported);
        return imported;
    }

    private static List<DomainDef> ImportDomains()
    {
        var items = GetRootList("domains.json", "domains");
        var imported = new List<DomainDef>();
        EnsureFolder(ScriptableObjectRoot + "/Domains");

        foreach (var item in items)
        {
            var source = AsObject(item, "domains item");
            var id = GetString(source, "id");
            var asset = LoadOrCreate<DomainDef>(ScriptableObjectRoot + "/Domains/" + id + ".asset");
            asset.id = id;
            asset.displayName = GetString(source, "name");
            asset.description = GetString(source, "description");
            asset.unlockedByDefault = GetBool(source, "unlocked_by_default");
            asset.unlockRequirements = ToCapabilityLevels(GetOptionalObject(source, "unlock_requirements"));
            asset.marketSize = GetString(source, "market_size");
            asset.riskLevel = GetString(source, "risk_level");
            asset.icon = GetString(source, "icon");
            EditorUtility.SetDirty(asset);
            imported.Add(asset);
        }

        SortById(imported);
        return imported;
    }

    private static List<UpgradeDef> ImportUpgrades()
    {
        var items = GetRootList("upgrades.json", "upgrades");
        var imported = new List<UpgradeDef>();
        EnsureFolder(ScriptableObjectRoot + "/Upgrades");

        foreach (var item in items)
        {
            var source = AsObject(item, "upgrades item");
            var id = GetString(source, "id");
            var asset = LoadOrCreate<UpgradeDef>(ScriptableObjectRoot + "/Upgrades/" + id + ".asset");
            asset.id = id;
            asset.displayName = GetString(source, "name");
            asset.description = GetString(source, "description");
            asset.cost = ToResourceAmounts(GetOptionalObject(source, "cost"), id + ".cost");
            asset.effects = ToResourceAmounts(GetOptionalObject(source, "effects"), id + ".effects");
            asset.requirements = ToThresholds(GetOptionalObject(source, "requirements"));
            asset.oneTime = GetBool(source, "one_time", true);
            EditorUtility.SetDirty(asset);
            imported.Add(asset);
        }

        SortById(imported);
        return imported;
    }

    private static List<AutomationDef> ImportAutomation()
    {
        var items = GetRootList("automation_upgrades.json", "automation_upgrades");
        var imported = new List<AutomationDef>();
        EnsureFolder(ScriptableObjectRoot + "/Automation");

        foreach (var item in items)
        {
            var source = AsObject(item, "automation_upgrades item");
            var id = GetString(source, "id");
            var asset = LoadOrCreate<AutomationDef>(ScriptableObjectRoot + "/Automation/" + id + ".asset");
            asset.id = id;
            asset.displayName = GetString(source, "name");
            asset.description = GetString(source, "description");
            asset.cost = ToResourceAmounts(GetOptionalObject(source, "cost"), id + ".cost");
            asset.automationGain = GetDouble(source, "automation_gain");
            asset.effects = ToResourceAmounts(GetOptionalObject(source, "effects"), id + ".effects");
            asset.monthlyEffects = SeedMonthlyAutomationEffects(id);
            asset.requirements = ToThresholds(GetOptionalObject(source, "requirements"));
            asset.monthlyBenefitText = GetString(source, "monthly_benefit");
            EditorUtility.SetDirty(asset);
            imported.Add(asset);
        }

        SortById(imported);
        return imported;
    }

    private static List<GameEventDef> ImportEvents()
    {
        var items = GetRootList("events.json", "events");
        var imported = new List<GameEventDef>();
        EnsureFolder(ScriptableObjectRoot + "/Events");

        foreach (var item in items)
        {
            var source = AsObject(item, "events item");
            var id = GetString(source, "id");
            var asset = LoadOrCreate<GameEventDef>(ScriptableObjectRoot + "/Events/" + id + ".asset");
            asset.id = id;
            asset.displayName = GetString(source, "name");
            asset.description = GetString(source, "description");
            asset.weight = GetDouble(source, "weight", 5);
            asset.conditions = ToThresholds(GetOptionalObject(source, "conditions"));
            asset.choices = ToEventChoices(GetOptionalList(source, "choices"), id);
            EditorUtility.SetDirty(asset);
            imported.Add(asset);
        }

        SortById(imported);
        return imported;
    }

    private static List<CompanyStageDef> ImportStages()
    {
        var items = GetRootList("company_stages.json", "company_stages");
        var imported = new List<CompanyStageDef>();
        EnsureFolder(ScriptableObjectRoot + "/Stages");

        foreach (var item in items)
        {
            var source = AsObject(item, "company_stages item");
            var id = GetString(source, "id");
            var asset = LoadOrCreate<CompanyStageDef>(ScriptableObjectRoot + "/Stages/" + id + ".asset");
            asset.id = id;
            asset.displayName = GetString(source, "name");
            asset.description = GetString(source, "description");
            asset.requirements = ToThresholds(GetOptionalObject(source, "requirements"));
            asset.order = GetInt(source, "order");
            EditorUtility.SetDirty(asset);
            imported.Add(asset);
        }

        imported.Sort((left, right) => left.order.CompareTo(right.order));
        return imported;
    }

    private static List<CompetitorDef> ImportCompetitors(Dictionary<string, object> locale)
    {
        var items = GetRootList("competitors.json", "competitors");
        var imported = new List<CompetitorDef>();
        EnsureFolder(ScriptableObjectRoot + "/Competitors");

        foreach (var item in items)
        {
            var source = AsObject(item, "competitors item");
            var id = GetString(source, "id");
            var asset = LoadOrCreate<CompetitorDef>(ScriptableObjectRoot + "/Competitors/" + id + ".asset");
            asset.id = id;
            asset.displayName = ResolveLocale(locale, GetString(source, "name_key"), id);
            asset.tagline = ResolveLocale(locale, GetString(source, "tagline_key"), "");
            asset.focusDomains = ToStringList(GetOptionalList(source, "focus_domains"));
            asset.color = GetString(source, "color");
            asset.startingScore = GetDouble(source, "starting_score");
            asset.startingMarketShare = GetInt(source, "starting_market_share");
            asset.monthlyGrowth = GetDouble(source, "monthly_growth");
            asset.aggression = GetDouble(source, "aggression");
            asset.entryMonth = GetInt(source, "entry_month", 1);
            asset.rivalTier = GetString(source, "rival_tier", "initial");
            EditorUtility.SetDirty(asset);
            imported.Add(asset);
        }

        SortById(imported);
        return imported;
    }

    // run_modifiers.json 4축(start_cities/world_lore/market_conditions/founder_traits) -> RunModifierOptionDef (feat-007).
    private static List<RunModifierOptionDef> ImportRunModifiers()
    {
        var root = ReadJsonObject("run_modifiers.json");
        var imported = new List<RunModifierOptionDef>();
        EnsureFolder(ScriptableObjectRoot + "/RunModifiers");

        foreach (var axis in new[] { "start_cities", "world_lore", "market_conditions", "founder_traits" })
        {
            var items = GetList(root, axis);
            foreach (var item in items)
            {
                var source = AsObject(item, "run_modifiers." + axis);
                var id = GetString(source, "id");
                var asset = LoadOrCreate<RunModifierOptionDef>(ScriptableObjectRoot + "/RunModifiers/" + axis + "_" + id + ".asset");
                asset.id = id;
                asset.axis = axis;
                asset.displayName = GetString(source, "name");
                asset.description = GetString(source, "description");
                var deltas = GetOptionalObject(source, "starting_deltas");
                asset.startingResourceDeltas = ToResourceAmounts(
                    deltas == null ? null : GetOptionalObject(deltas, "resources"), axis + "." + id + ".resources");
                asset.startingCapabilityDeltas = ToCapabilityLevels(
                    deltas == null ? null : GetOptionalObject(deltas, "capabilities"));
                asset.tags = ToStringList(GetOptionalList(source, "tags"));
                EditorUtility.SetDirty(asset);
                imported.Add(asset);
            }
        }

        return imported;
    }

    // run_modifiers.json tag_effects -> RunTagEffectsConfig 단일 SO (feat-007, 블록 #2 틱 훅 소비).
    private static RunTagEffectsConfig ImportRunTagEffects()
    {
        var root = ReadJsonObject("run_modifiers.json");
        var source = GetObject(root, "tag_effects");
        var asset = LoadOrCreate<RunTagEffectsConfig>(ScriptableObjectRoot + "/RunTagEffectsConfig.asset");
        asset.effects = new List<RunTagEffect>();

        foreach (var tag in SortedKeys(source))
        {
            asset.effects.Add(new RunTagEffect
            {
                tag = tag,
                monthlyEffects = ToResourceAmounts(AsObject(source[tag], "tag_effects." + tag), "tag_effects." + tag)
            });
        }

        EditorUtility.SetDirty(asset);
        return asset;
    }

    // world_events.json -> WorldEventDef (feat-007 블록 #3). 배열 순서 유지 (스케줄 동률 시 id 비교라 순서 무관하나 일관성 위해).
    private static List<WorldEventDef> ImportWorldEvents()
    {
        var items = GetRootList("world_events.json", "world_events");
        var imported = new List<WorldEventDef>();
        EnsureFolder(ScriptableObjectRoot + "/WorldEvents");

        foreach (var item in items)
        {
            var source = AsObject(item, "world_events item");
            var id = GetString(source, "id");
            var asset = LoadOrCreate<WorldEventDef>(ScriptableObjectRoot + "/WorldEvents/" + id + ".asset");
            asset.id = id;
            asset.title = GetString(source, "title");
            asset.description = GetString(source, "description");
            asset.trigger = GetString(source, "trigger");
            var range = GetOptionalList(source, "year_range");
            asset.yearMin = range != null && range.Count > 0 ? (int)ToDouble(range[0], id + ".year_range[0]") : 1;
            asset.yearMax = range != null && range.Count > 1 ? (int)ToDouble(range[1], id + ".year_range[1]") : 10;
            asset.resourceEffects = ToResourceAmounts(GetOptionalObject(source, "resource_effects"), id + ".resource_effects");
            asset.worldLoreTags = ToStringList(GetOptionalList(source, "world_lore_tags"));
            EditorUtility.SetDirty(asset);
            imported.Add(asset);
        }

        return imported;
    }

    // difficulty_tiers.json -> DifficultyTierDef (feat-008 #1). 배열 순서 유지 (티어 선택 UI 표시 순).
    private static List<DifficultyTierDef> ImportDifficultyTiers()
    {
        var items = GetRootList("difficulty_tiers.json", "difficulty_tiers");
        var imported = new List<DifficultyTierDef>();
        EnsureFolder(ScriptableObjectRoot + "/DifficultyTiers");

        foreach (var item in items)
        {
            var source = AsObject(item, "difficulty_tiers item");
            var id = GetString(source, "id");
            var asset = LoadOrCreate<DifficultyTierDef>(ScriptableObjectRoot + "/DifficultyTiers/" + id + ".asset");
            asset.id = id;
            asset.displayName = GetString(source, "name");
            asset.description = GetString(source, "description");
            asset.monthlyHeadwind = ToResourceAmounts(GetOptionalObject(source, "monthly_headwind"), id + ".monthly_headwind");
            asset.rewardMultiplier = GetDouble(source, "reward_multiplier", 1.0);
            EditorUtility.SetDirty(asset);
            imported.Add(asset);
        }

        return imported;
    }

    // derivation_rules.json -> ArchetypeDef (feat-008 #2). 태그 조합 파생 + bonus 월간 효과.
    private static List<ArchetypeDef> ImportArchetypes()
    {
        var items = GetRootList("derivation_rules.json", "derivation_rules");
        var imported = new List<ArchetypeDef>();
        EnsureFolder(ScriptableObjectRoot + "/Archetypes");

        foreach (var item in items)
        {
            var source = AsObject(item, "derivation_rules item");
            var id = GetString(source, "id");
            var asset = LoadOrCreate<ArchetypeDef>(ScriptableObjectRoot + "/Archetypes/" + id + ".asset");
            asset.id = id;
            asset.displayName = GetString(source, "title");
            asset.description = GetString(source, "description");
            asset.requires = ToStringList(GetOptionalList(source, "requires"));
            asset.discoveryId = GetString(source, "discovery_id");
            var yields = GetOptionalObject(source, "yields");
            asset.yieldsKind = yields != null ? GetString(yields, "kind") : "";
            asset.yieldsSummary = yields != null ? GetString(yields, "summary") : "";
            asset.monthlyEffects = ToResourceAmounts(
                yields == null ? null : GetOptionalObject(yields, "monthly_effect"), id + ".monthly_effect");
            EditorUtility.SetDirty(asset);
            imported.Add(asset);
        }

        return imported;
    }

    // endings.json -> EndingDef (feat-008 #3). 조건은 평면 필드로.
    private static List<EndingDef> ImportEndings()
    {
        var items = GetRootList("endings.json", "endings");
        var imported = new List<EndingDef>();
        EnsureFolder(ScriptableObjectRoot + "/Endings");

        foreach (var item in items)
        {
            var source = AsObject(item, "endings item");
            var id = GetString(source, "id");
            var asset = LoadOrCreate<EndingDef>(ScriptableObjectRoot + "/Endings/" + id + ".asset");
            asset.id = id;
            asset.priority = GetInt(source, "priority");
            asset.title = GetString(source, "title");
            asset.flavor = GetString(source, "flavor");
            asset.metaRewardBonus = GetInt(source, "meta_reward_bonus");
            var cond = GetOptionalObject(source, "condition") ?? new Dictionary<string, object>();
            asset.conditionStatus = GetString(cond, "status", "any");
            asset.minMonth = GetInt(cond, "min_month");
            asset.minProducts = GetInt(cond, "min_products");
            asset.minResources = ToResourceAmounts(GetOptionalObject(cond, "min_resources"), id + ".min_resources");
            asset.startCityIds = ToStringList(GetOptionalList(cond, "start_city_ids"));
            asset.worldLoreIds = ToStringList(GetOptionalList(cond, "world_lore_ids"));
            asset.marketConditionIds = ToStringList(GetOptionalList(cond, "market_condition_ids"));
            asset.founderTraitIds = ToStringList(GetOptionalList(cond, "founder_trait_ids"));
            asset.challengeTierIds = ToStringList(GetOptionalList(cond, "challenge_tier_ids"));
            asset.growthPathIds = ToStringList(GetOptionalList(cond, "growth_path_ids"));
            asset.archetypeIds = ToStringList(GetOptionalList(cond, "archetype_ids"));
            asset.fallback = GetBool(cond, "fallback");
            EditorUtility.SetDirty(asset);
            imported.Add(asset);
        }

        return imported;
    }

    private static void UpdateCatalog(
        List<ResourceDef> resources,
        List<ProductDef> products,
        List<CapabilityDef> capabilities,
        List<DomainDef> domains,
        List<UpgradeDef> upgrades,
        List<AutomationDef> automation,
        List<GameEventDef> events,
        List<CompanyStageDef> stages,
        List<CompetitorDef> competitors,
        List<RunModifierOptionDef> runModifierOptions,
        RunTagEffectsConfig runTagEffects,
        List<WorldEventDef> worldEvents,
        List<DifficultyTierDef> difficultyTiers,
        List<ArchetypeDef> archetypes,
        List<EndingDef> endings,
        BalanceConfig balance)
    {
        EnsureFolder("Assets/_Project/Resources");
        var catalog = LoadOrCreate<DataCatalog>(CatalogPath);
        catalog.resources = resources;
        catalog.products = products;
        catalog.capabilities = capabilities;
        catalog.domains = domains;
        catalog.upgrades = upgrades;
        catalog.automation = automation;
        catalog.events = events;
        catalog.stages = stages;
        catalog.competitors = competitors;
        catalog.runModifierOptions = runModifierOptions;
        catalog.runTagEffects = runTagEffects;
        catalog.worldEvents = worldEvents;
        catalog.difficultyTiers = difficultyTiers;
        catalog.archetypes = archetypes;
        catalog.endings = endings;
        catalog.balance = balance;
        EditorUtility.SetDirty(catalog);
    }

    // data/locales/{file} 평면 키-값 사전 로드 (경쟁사 표시명 해석용). 없으면 빈 사전.
    private static Dictionary<string, object> ReadLocale(string fileName)
    {
        var path = Path.GetFullPath(Path.Combine(Application.dataPath, "..", "..", "data", "locales", fileName));
        if (!File.Exists(path))
        {
            Debug.LogWarning("[DataImporter] 로케일 없음 - " + path);
            return new Dictionary<string, object>();
        }

        return Json.Deserialize(File.ReadAllText(path)) as Dictionary<string, object> ?? new Dictionary<string, object>();
    }

    private static string ResolveLocale(Dictionary<string, object> locale, string key, string fallback)
    {
        if (string.IsNullOrEmpty(key))
        {
            return fallback;
        }

        if (locale != null && locale.ContainsKey(key) && locale[key] != null)
        {
            return locale[key].ToString();
        }

        return fallback;
    }

    private static List<ResourceAmount> SeedMonthlyAutomationEffects(string id)
    {
        var effects = new List<ResourceAmount>();
        switch (id)
        {
            case "automated_marketing":
                effects.Add(new ResourceAmount { resource = ResourceId.Hype, amount = 2 });
                break;
            case "product_analytics_agent":
                effects.Add(new ResourceAmount { resource = ResourceId.Data, amount = 5 });
                break;
            case "model_optimization_pipeline":
                effects.Add(new ResourceAmount { resource = ResourceId.Compute, amount = 10 });
                break;
            case "autonomous_sales_agent":
                effects.Add(new ResourceAmount { resource = ResourceId.Cash, amount = 1000 });
                break;
        }

        return effects;
    }

    private static List<EventChoice> ToEventChoices(List<object> choices, string eventId)
    {
        var converted = new List<EventChoice>();
        foreach (var choice in choices)
        {
            var source = AsObject(choice, eventId + ".choices item");
            converted.Add(new EventChoice
            {
                id = GetString(source, "id"),
                text = GetString(source, "text"),
                description = GetString(source, "description"),
                effects = ToResourceAmounts(GetOptionalObject(source, "effects"), eventId + ".choices.effects")
            });
        }

        return converted;
    }

    private static List<CostTier> ToCostTiers(List<object> tiers, string context)
    {
        var converted = new List<CostTier>();
        for (var i = 0; i < tiers.Count; i++)
        {
            converted.Add(new CostTier
            {
                amounts = ToResourceAmounts(AsObject(tiers[i], context + "[" + i + "]"), context + "[" + i + "]")
            });
        }

        return converted;
    }

    private static List<ResourceAmount> ToResourceAmounts(Dictionary<string, object> source, string context)
    {
        var converted = new List<ResourceAmount>();
        if (source == null)
        {
            return converted;
        }

        foreach (var key in SortedKeys(source))
        {
            ResourceId resource;
            if (!ResourceIds.TryParse(key, out resource))
            {
                Debug.LogWarning("[DataImporter] Unknown resource key skipped: " + context + "." + key);
                continue;
            }

            converted.Add(new ResourceAmount
            {
                resource = resource,
                amount = GetDouble(source, key)
            });
        }

        return converted;
    }

    private static List<CapabilityLevel> ToCapabilityLevels(Dictionary<string, object> source)
    {
        var converted = new List<CapabilityLevel>();
        if (source == null)
        {
            return converted;
        }

        foreach (var key in SortedKeys(source))
        {
            converted.Add(new CapabilityLevel
            {
                capabilityId = key,
                level = GetInt(source, key)
            });
        }

        return converted;
    }

    private static List<DomainUnlock> ToDomainUnlocks(Dictionary<string, object> source)
    {
        var converted = new List<DomainUnlock>();
        if (source == null)
        {
            return converted;
        }

        foreach (var key in SortedKeys(source))
        {
            int level;
            if (!int.TryParse(key, out level))
            {
                Debug.LogWarning("[DataImporter] Domain unlock level skipped: " + key);
                continue;
            }

            converted.Add(new DomainUnlock
            {
                level = level,
                domainId = GetString(source, key)
            });
        }

        return converted;
    }

    private static List<Threshold> ToThresholds(Dictionary<string, object> source)
    {
        var converted = new List<Threshold>();
        if (source == null)
        {
            return converted;
        }

        foreach (var key in SortedKeys(source))
        {
            converted.Add(new Threshold
            {
                key = key,
                value = GetDouble(source, key)
            });
        }

        return converted;
    }

    private static List<string> ToStringList(List<object> source)
    {
        var converted = new List<string>();
        foreach (var item in source)
        {
            if (item != null)
            {
                converted.Add(item.ToString());
            }
        }

        return converted;
    }

    private static Dictionary<string, object> ReadJsonObject(string fileName)
    {
        var path = Path.GetFullPath(Path.Combine(Application.dataPath, "..", "..", "data", fileName));
        if (!File.Exists(path))
        {
            throw new FileNotFoundException("Data JSON not found.", path);
        }

        var parsed = Json.Deserialize(File.ReadAllText(path)) as Dictionary<string, object>;
        if (parsed == null)
        {
            throw new InvalidDataException(fileName + " root must be a JSON object.");
        }

        return parsed;
    }

    private static List<object> GetRootList(string fileName, string key)
    {
        return GetList(ReadJsonObject(fileName), key);
    }

    private static Dictionary<string, object> GetObject(Dictionary<string, object> source, string key)
    {
        if (!source.ContainsKey(key))
        {
            throw new KeyNotFoundException("Missing JSON object key: " + key);
        }

        return AsObject(source[key], key);
    }

    private static Dictionary<string, object> GetOptionalObject(Dictionary<string, object> source, string key)
    {
        if (source == null || !source.ContainsKey(key) || source[key] == null)
        {
            return null;
        }

        return AsObject(source[key], key);
    }

    private static List<object> GetList(Dictionary<string, object> source, string key)
    {
        if (!source.ContainsKey(key))
        {
            throw new KeyNotFoundException("Missing JSON list key: " + key);
        }

        return AsList(source[key], key);
    }

    private static List<object> GetOptionalList(Dictionary<string, object> source, string key)
    {
        if (source == null || !source.ContainsKey(key) || source[key] == null)
        {
            return new List<object>();
        }

        return AsList(source[key], key);
    }

    private static Dictionary<string, object> AsObject(object value, string context)
    {
        var dict = value as Dictionary<string, object>;
        if (dict == null)
        {
            throw new InvalidDataException(context + " must be a JSON object.");
        }

        return dict;
    }

    private static List<object> AsList(object value, string context)
    {
        var list = value as List<object>;
        if (list == null)
        {
            throw new InvalidDataException(context + " must be a JSON array.");
        }

        return list;
    }

    private static string GetString(Dictionary<string, object> source, string key, string defaultValue = "")
    {
        if (source == null || !source.ContainsKey(key) || source[key] == null)
        {
            return defaultValue;
        }

        return source[key].ToString();
    }

    private static double GetDouble(Dictionary<string, object> source, string key, double defaultValue = 0)
    {
        if (source == null || !source.ContainsKey(key) || source[key] == null)
        {
            return defaultValue;
        }

        return ToDouble(source[key], key);
    }

    private static int GetInt(Dictionary<string, object> source, string key, int defaultValue = 0)
    {
        if (source == null || !source.ContainsKey(key) || source[key] == null)
        {
            return defaultValue;
        }

        return Convert.ToInt32(ToDouble(source[key], key));
    }

    private static bool GetBool(Dictionary<string, object> source, string key, bool defaultValue = false)
    {
        if (source == null || !source.ContainsKey(key) || source[key] == null)
        {
            return defaultValue;
        }

        var value = source[key];
        if (value is bool)
        {
            return (bool)value;
        }

        bool parsed;
        if (bool.TryParse(value.ToString(), out parsed))
        {
            return parsed;
        }

        return defaultValue;
    }

    private static double ToDouble(object value, string context)
    {
        if (value is double)
        {
            return (double)value;
        }

        if (value is float)
        {
            return (float)value;
        }

        if (value is int)
        {
            return (int)value;
        }

        if (value is long)
        {
            return (long)value;
        }

        double parsed;
        if (double.TryParse(value.ToString(), NumberStyles.Float, CultureInfo.InvariantCulture, out parsed))
        {
            return parsed;
        }

        throw new InvalidDataException(context + " must be numeric.");
    }

    private static T LoadOrCreate<T>(string assetPath) where T : ScriptableObject
    {
        EnsureParentFolder(assetPath);
        var asset = AssetDatabase.LoadAssetAtPath<T>(assetPath);
        if (asset != null)
        {
            return asset;
        }

        asset = ScriptableObject.CreateInstance<T>();
        AssetDatabase.CreateAsset(asset, assetPath);
        return asset;
    }

    private static void EnsureParentFolder(string assetPath)
    {
        var lastSlash = assetPath.LastIndexOf("/", StringComparison.Ordinal);
        if (lastSlash <= 0)
        {
            return;
        }

        EnsureFolder(assetPath.Substring(0, lastSlash));
    }

    private static void EnsureFolder(string folder)
    {
        if (AssetDatabase.IsValidFolder(folder))
        {
            return;
        }

        var parts = folder.Split('/');
        var current = parts[0];
        for (var i = 1; i < parts.Length; i++)
        {
            var next = current + "/" + parts[i];
            if (!AssetDatabase.IsValidFolder(next))
            {
                AssetDatabase.CreateFolder(current, parts[i]);
            }

            current = next;
        }
    }

    private static List<string> SortedKeys(Dictionary<string, object> source)
    {
        var keys = new List<string>(source.Keys);
        keys.Sort(StringComparer.Ordinal);
        return keys;
    }

    private static void SortById<T>(List<T> items) where T : ScriptableObject
    {
        items.Sort((left, right) => string.Compare(GetAssetId(left), GetAssetId(right), StringComparison.Ordinal));
    }

    private static string GetAssetId(ScriptableObject asset)
    {
        var resource = asset as ResourceDef;
        if (resource != null)
        {
            return resource.id;
        }

        var product = asset as ProductDef;
        if (product != null)
        {
            return product.id;
        }

        var capability = asset as CapabilityDef;
        if (capability != null)
        {
            return capability.id;
        }

        var domain = asset as DomainDef;
        if (domain != null)
        {
            return domain.id;
        }

        var upgrade = asset as UpgradeDef;
        if (upgrade != null)
        {
            return upgrade.id;
        }

        var automation = asset as AutomationDef;
        if (automation != null)
        {
            return automation.id;
        }

        var gameEvent = asset as GameEventDef;
        if (gameEvent != null)
        {
            return gameEvent.id;
        }

        var competitor = asset as CompetitorDef;
        if (competitor != null)
        {
            return competitor.id;
        }

        return asset.name;
    }
}

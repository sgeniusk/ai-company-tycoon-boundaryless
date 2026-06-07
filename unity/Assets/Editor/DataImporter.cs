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

        UpdateCatalog(resources, products, capabilities, domains, upgrades, automation, events, stages, balance);

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

    private static void UpdateCatalog(
        List<ResourceDef> resources,
        List<ProductDef> products,
        List<CapabilityDef> capabilities,
        List<DomainDef> domains,
        List<UpgradeDef> upgrades,
        List<AutomationDef> automation,
        List<GameEventDef> events,
        List<CompanyStageDef> stages,
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
        catalog.balance = balance;
        EditorUtility.SetDirty(catalog);
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

        return asset.name;
    }
}

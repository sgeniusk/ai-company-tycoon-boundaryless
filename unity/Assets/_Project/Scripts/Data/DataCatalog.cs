// 런타임에서 정적 데이터 ScriptableObject를 한 번에 찾기 위한 카탈로그.
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "DataCatalog", menuName = "AICT/Data Catalog")]
    public class DataCatalog : ScriptableObject
    {
        public List<ResourceDef> resources = new List<ResourceDef>();
        public List<ProductDef> products = new List<ProductDef>();
        public List<CapabilityDef> capabilities = new List<CapabilityDef>();
        public List<DomainDef> domains = new List<DomainDef>();
        public List<UpgradeDef> upgrades = new List<UpgradeDef>();
        public List<AutomationDef> automation = new List<AutomationDef>();
        public List<GameEventDef> events = new List<GameEventDef>();
        public List<CompanyStageDef> stages = new List<CompanyStageDef>();
        public List<CompetitorDef> competitors = new List<CompetitorDef>();
        public List<RunModifierOptionDef> runModifierOptions = new List<RunModifierOptionDef>();
        public RunTagEffectsConfig runTagEffects;
        public List<WorldEventDef> worldEvents = new List<WorldEventDef>();
        public List<DifficultyTierDef> difficultyTiers = new List<DifficultyTierDef>();
        public List<ArchetypeDef> archetypes = new List<ArchetypeDef>();
        public List<EndingDef> endings = new List<EndingDef>();
        // 산업 시너지/콤보 (feat-013 #1) — 도메인 포트폴리오 월간 보상.
        public List<IndustrySynergyDef> industrySynergies = new List<IndustrySynergyDef>();
        public List<IndustrySynergyDef> industryCombos = new List<IndustrySynergyDef>();
        public BalanceConfig balance;

        public ResourceDef GetResource(string id)
        {
            return resources.Find(item => item != null && item.id == id);
        }

        public ProductDef GetProduct(string id)
        {
            return products.Find(item => item != null && item.id == id);
        }

        public CapabilityDef GetCapability(string id)
        {
            return capabilities.Find(item => item != null && item.id == id);
        }

        public DomainDef GetDomain(string id)
        {
            return domains.Find(item => item != null && item.id == id);
        }

        public UpgradeDef GetUpgrade(string id)
        {
            return upgrades.Find(item => item != null && item.id == id);
        }

        public AutomationDef GetAutomation(string id)
        {
            return automation.Find(item => item != null && item.id == id);
        }

        public GameEventDef GetEvent(string id)
        {
            return events.Find(item => item != null && item.id == id);
        }

        public CompanyStageDef GetStage(string id)
        {
            return stages.Find(item => item != null && item.id == id);
        }

        public CompetitorDef GetCompetitor(string id)
        {
            return competitors.Find(item => item != null && item.id == id);
        }

        public List<RunModifierOptionDef> GetRunOptions(string axis)
        {
            return runModifierOptions.FindAll(item => item != null && item.axis == axis);
        }

        public RunModifierOptionDef GetRunOption(string axis, string id)
        {
            return runModifierOptions.Find(item => item != null && item.axis == axis && item.id == id);
        }

        public DifficultyTierDef GetDifficultyTier(string id)
        {
            return difficultyTiers.Find(item => item != null && item.id == id);
        }

        public ArchetypeDef GetArchetype(string id)
        {
            return archetypes.Find(item => item != null && item.id == id);
        }
    }
}

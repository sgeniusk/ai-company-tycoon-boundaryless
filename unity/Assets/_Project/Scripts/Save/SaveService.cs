// 런타임 상태 세이브/로드 (Godot SaveManager.gd 대응). GameModel <-> JSON, persistentDataPath.
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using AICompanyTycoon.Core;

namespace AICompanyTycoon.Save
{
    public class SaveService
    {
        readonly string _path;

        public SaveService(string path = null)
        {
            _path = string.IsNullOrEmpty(path)
                ? Path.Combine(Application.persistentDataPath, "savegame.json")
                : path;
        }

        public string SavePath => _path;
        public bool HasSave() => File.Exists(_path);
        public void Delete() { if (File.Exists(_path)) File.Delete(_path); }

        public void Save(GameModel m)
        {
            File.WriteAllText(_path, JsonUtility.ToJson(ToData(m), true));
        }

        public bool Load(GameModel into)
        {
            if (!File.Exists(_path)) return false;
            var d = JsonUtility.FromJson<SaveData>(File.ReadAllText(_path));
            if (d == null) return false;
            Apply(d, into);
            return true;
        }

        static SaveData ToData(GameModel m)
        {
            var d = new SaveData
            {
                cash = m.Cash, users = m.Users, compute = m.Compute, data = m.Data,
                talent = m.Talent, trust = m.Trust, hype = m.Hype, automation = m.Automation,
                currentMonth = m.CurrentMonth, companyStageId = m.CompanyStageId,
                unlockedDomains = new List<string>(m.UnlockedDomains),
                activeProducts = new List<string>(m.ActiveProducts),
                purchasedUpgrades = new List<string>(m.PurchasedUpgrades),
                purchasedAutomation = new List<string>(m.PurchasedAutomation),
                triggeredEvents = new List<string>(m.TriggeredEvents),
            };
            foreach (var kv in m.Capabilities)
                d.capabilities.Add(new CapEntry { id = kv.Key, level = kv.Value });
            foreach (var kv in m.ProductLevels)
                d.productLevels.Add(new CapEntry { id = kv.Key, level = kv.Value });
            d.hiredAgents = new List<string>(m.HiredAgentIds);
            foreach (var c in m.CompetitorStates)
                d.competitorStates.Add(new CompetitorSave { id = c.id, score = c.score, marketShare = c.marketShare, momentum = c.momentum });
            foreach (var h in m.MarketShareHistory)
                d.marketShareHistory.Add(new MarketShareSave { month = h.month, player = h.player, topRivalShare = h.topRivalShare, topRivalId = h.topRivalId });
            var rm = m.RunModifiers ?? new RunModifiersState();
            d.runModifiers = new RunModifiersSave
            {
                seed = rm.Seed, startCityId = rm.StartCityId, worldLoreId = rm.WorldLoreId,
                marketConditionId = rm.MarketConditionId, founderTraitId = rm.FounderTraitId,
                challengeTier = rm.ChallengeTier, tags = new List<string>(rm.Tags),
            };
            d.worldEventHistory = new List<string>(m.WorldEventHistory);
            return d;
        }

        static void Apply(SaveData d, GameModel m)
        {
            m.Cash = d.cash; m.Users = d.users; m.Compute = d.compute; m.Data = d.data;
            m.Talent = d.talent; m.Trust = d.trust; m.Hype = d.hype; m.Automation = d.automation;
            m.CurrentMonth = d.currentMonth; m.CompanyStageId = d.companyStageId;
            m.UnlockedDomains = new List<string>(d.unlockedDomains ?? new List<string>());
            m.ActiveProducts = new List<string>(d.activeProducts ?? new List<string>());
            m.PurchasedUpgrades = new List<string>(d.purchasedUpgrades ?? new List<string>());
            m.PurchasedAutomation = new List<string>(d.purchasedAutomation ?? new List<string>());
            m.TriggeredEvents = new List<string>(d.triggeredEvents ?? new List<string>());
            m.Capabilities = new Dictionary<string, int>();
            if (d.capabilities != null)
                foreach (var c in d.capabilities) m.Capabilities[c.id] = c.level;
            // 제품 레벨 (v4) — 구세이브는 빈 사전, 출시 제품은 GetLevel에서 1로 파생.
            m.ProductLevels = new Dictionary<string, int>();
            if (d.productLevels != null)
                foreach (var p in d.productLevels) m.ProductLevels[p.id] = p.level;
            // 인재 로스터 (v5) — 구세이브는 빈 로스터.
            m.HiredAgentIds = new List<string>(d.hiredAgents ?? new List<string>());
            m.CompetitorStates = new List<CompetitorState>();
            if (d.competitorStates != null)
                foreach (var c in d.competitorStates)
                    m.CompetitorStates.Add(new CompetitorState { id = c.id, score = c.score, marketShare = c.marketShare, momentum = c.momentum });
            m.MarketShareHistory = new List<MarketShareEntry>();
            if (d.marketShareHistory != null)
                foreach (var h in d.marketShareHistory)
                    m.MarketShareHistory.Add(new MarketShareEntry { month = h.month, player = h.player, topRivalShare = h.topRivalShare, topRivalId = h.topRivalId });
            // 런 모디파이어 — 구세이브/결손 필드는 기본값. id 유효성 재검증은 카탈로그 가진 쪽에서 RunModifierService.Sanitize로.
            var rm = d.runModifiers;
            m.RunModifiers = rm == null
                ? new RunModifiersState()
                : new RunModifiersState
                {
                    Seed = string.IsNullOrEmpty(rm.seed) ? RunModifiersState.DefaultSeed : rm.seed,
                    StartCityId = string.IsNullOrEmpty(rm.startCityId) ? RunModifiersState.DefaultStartCityId : rm.startCityId,
                    WorldLoreId = string.IsNullOrEmpty(rm.worldLoreId) ? RunModifiersState.DefaultWorldLoreId : rm.worldLoreId,
                    MarketConditionId = string.IsNullOrEmpty(rm.marketConditionId) ? RunModifiersState.DefaultMarketConditionId : rm.marketConditionId,
                    FounderTraitId = string.IsNullOrEmpty(rm.founderTraitId) ? RunModifiersState.DefaultFounderTraitId : rm.founderTraitId,
                    ChallengeTier = string.IsNullOrEmpty(rm.challengeTier) ? RunModifiersState.DefaultChallengeTier : rm.challengeTier,
                    Tags = new List<string>(rm.tags ?? new List<string>()),
                };
            m.WorldEventHistory = new List<string>(d.worldEventHistory ?? new List<string>());
        }
    }
}

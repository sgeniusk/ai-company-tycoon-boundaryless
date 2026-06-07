// AI 능력 레벨업과 도메인 해금 트리거 (Godot CapabilitySystem.gd 대응).
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class CapabilityService
    {
        readonly GameModel _m;
        readonly DataCatalog _c;
        readonly ResourceService _r;
        readonly DomainService _d;

        public CapabilityService(GameModel m, DataCatalog c, ResourceService r, DomainService d)
        {
            _m = m; _c = c; _r = r; _d = d;
        }

        public int GetLevel(string id) => _m.Capabilities.TryGetValue(id, out var lv) ? lv : 0;

        public List<ResourceAmount> GetUpgradeCost(string id)
        {
            var cap = _c.GetCapability(id);
            if (cap == null) return null;
            int lv = GetLevel(id);
            if (lv >= cap.upgradeCosts.Count) return null;
            return cap.upgradeCosts[lv].amounts;
        }

        public bool CanUpgrade(string id)
        {
            var cap = _c.GetCapability(id);
            if (cap == null) return false;
            if (GetLevel(id) >= cap.maxLevel) return false;
            var cost = GetUpgradeCost(id);
            if (cost == null) return false;
            return _r.CanAfford(cost);
        }

        public bool Upgrade(string id)
        {
            if (!CanUpgrade(id)) return false;
            var cap = _c.GetCapability(id);
            var cost = GetUpgradeCost(id);
            if (!_r.SpendMultiple(cost)) return false;

            int newLevel = GetLevel(id) + 1;
            _m.Capabilities[id] = newLevel;

            if (cap.effectsPerLevel != null && cap.effectsPerLevel.Count > 0)
                _r.ApplyEffects(cap.effectsPerLevel);

            foreach (var du in cap.unlocksDomains)
                if (du.level == newLevel) _d.TryUnlock(du.domainId);

            GameEvents.RaiseCapabilityUpgraded(id, newLevel);
            return true;
        }
    }
}

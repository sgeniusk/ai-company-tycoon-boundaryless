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
            // 로스터 research 합 → 현금 비용 할인 (feat-014 #1, SO 원본 비변형 사본).
            return RosterBonus.ApplyCashDiscount(cap.upgradeCosts[lv].amounts, RosterBonus.GetResearchDiscount(_m, _c));
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

            // 전 도메인 재검사 (feat-013 #1 버그 수정) — 기존엔 이 능력의 unlocks_domains 매핑 레벨에서만
            // TryUnlock해, 다중 요건 도메인(반도체=최적화2+코드2 등)이 연구 순서에 따라 영구 미해금됐다.
            // TryUnlock이 도메인 요건 전체를 검증하므로 CheckAll이 정확하고, 이미 해금된 도메인은 no-op다.
            _d.CheckAll();

            GameEvents.RaiseCapabilityUpgraded(id, newLevel);
            return true;
        }
    }
}

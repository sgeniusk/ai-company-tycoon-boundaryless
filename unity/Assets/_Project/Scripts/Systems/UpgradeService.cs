// 일반 업그레이드 구매 (Godot UpgradeSystem.gd 대응).
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class UpgradeService
    {
        readonly GameModel _m;
        readonly DataCatalog _c;
        readonly ResourceService _r;

        public UpgradeService(GameModel m, DataCatalog c, ResourceService r) { _m = m; _c = c; _r = r; }

        public bool IsPurchased(string id) => _m.PurchasedUpgrades.Contains(id);

        public bool CanPurchase(string id)
        {
            var u = _c.GetUpgrade(id);
            if (u == null) return false;
            if (u.oneTime && IsPurchased(id)) return false;
            if (!ThresholdEval.Meets(_m, u.requirements)) return false;
            return _r.CanAfford(u.cost);
        }

        public bool Purchase(string id)
        {
            if (!CanPurchase(id)) return false;
            var u = _c.GetUpgrade(id);
            if (!_r.SpendMultiple(u.cost)) return false;
            _m.PurchasedUpgrades.Add(id);
            if (u.effects != null && u.effects.Count > 0) _r.ApplyEffects(u.effects);
            return true;
        }
    }
}

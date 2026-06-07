// 자동화 업그레이드 구매와 월별 보너스 (Godot AutomationSystem.gd 대응). 월별 효과는 데이터(monthlyEffects)로 적용한다.
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class AutomationService
    {
        readonly GameModel _m;
        readonly DataCatalog _c;
        readonly ResourceService _r;

        public AutomationService(GameModel m, DataCatalog c, ResourceService r) { _m = m; _c = c; _r = r; }

        public bool IsPurchased(string id) => _m.PurchasedAutomation.Contains(id);

        public bool CanPurchase(string id)
        {
            var a = _c.GetAutomation(id);
            if (a == null || IsPurchased(id)) return false;
            if (!ThresholdEval.Meets(_m, a.requirements)) return false;
            return _r.CanAfford(a.cost);
        }

        public bool Purchase(string id)
        {
            if (!CanPurchase(id)) return false;
            var a = _c.GetAutomation(id);
            if (!_r.SpendMultiple(a.cost)) return false;
            _m.PurchasedAutomation.Add(id);
            if (a.automationGain > 0) _r.Add(ResourceId.Automation, a.automationGain);
            if (a.effects != null && a.effects.Count > 0) _r.ApplyEffects(a.effects);
            return true;
        }

        public void ApplyMonthly()
        {
            foreach (var id in _m.PurchasedAutomation)
            {
                var a = _c.GetAutomation(id);
                if (a == null || a.monthlyEffects == null) continue;
                foreach (var e in a.monthlyEffects) _r.Add(e.resource, e.amount);
            }
        }
    }
}

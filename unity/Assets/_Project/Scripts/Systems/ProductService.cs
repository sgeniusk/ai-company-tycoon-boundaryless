// 제품 출시 판정·출시·월별 매출/이용자/데이터 산출 (Godot ProductSystem.gd 대응).
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class ProductService
    {
        readonly GameModel _m;
        readonly DataCatalog _c;
        readonly ResourceService _r;

        public ProductService(GameModel m, DataCatalog c, ResourceService r) { _m = m; _c = c; _r = r; }

        public bool IsActive(string id) => _m.ActiveProducts.Contains(id);

        public bool CanLaunch(string id)
        {
            var p = _c.GetProduct(id);
            if (p == null || IsActive(id)) return false;
            if (!string.IsNullOrEmpty(p.domain) && !_m.UnlockedDomains.Contains(p.domain)) return false;
            foreach (var rc in p.requiredCapabilities)
            {
                int have = _m.Capabilities.TryGetValue(rc.capabilityId, out var lv) ? lv : 0;
                if (have < rc.level) return false;
            }
            if (_m.Trust < p.trustRequirement) return false;
            return _r.CanAfford(p.launchCost);
        }

        public bool Launch(string id)
        {
            if (!CanLaunch(id)) return false;
            var p = _c.GetProduct(id);
            if (!_r.SpendMultiple(p.launchCost)) return false;
            _m.ActiveProducts.Add(id);
            if (p.hypeOnLaunch > 0) _r.Add(ResourceId.Hype, p.hypeOnLaunch);
            GameEvents.RaiseProductLaunched(id);
            GameEvents.RaiseResourcesUpdated();
            return true;
        }

        public List<ProductDef> GetAvailable()
        {
            var list = new List<ProductDef>();
            foreach (var p in _c.products)
                if (p != null && !IsActive(p.id) && CanLaunch(p.id)) list.Add(p);
            return list;
        }

        // 월별 효과 — 매출/신규 이용자/데이터 증가, 연산력 소모.
        public void ApplyMonthly(MonthSummary s)
        {
            var b = _c.balance;
            double hypeMult = 1.0 + (_m.Hype / 100.0) * (b.hypeGrowthMultiplier - 1.0) * 10.0;
            double trustMult = 1.0;
            if (_m.Trust > b.trustMultiplierHighThreshold) trustMult = b.trustEnterpriseBonus;
            else if (_m.Trust < b.trustMultiplierLowThreshold) trustMult = b.trustLowPenalty;

            double revenue = 0, newUsers = 0, data = 0, computeCost = 0;
            foreach (var id in _m.ActiveProducts)
            {
                var p = _c.GetProduct(id);
                if (p == null) continue;
                double level = p.level <= 0 ? 1 : p.level;
                bool isEnterprise = p.tags != null && p.tags.Contains("enterprise");
                double pTrustMult = isEnterprise ? trustMult : 1.0;
                revenue += p.baseRevenue * level * pTrustMult;
                newUsers += p.baseUsersPerMonth * hypeMult;
                data += p.dataGeneratedPerMonth;
                computeCost += (_m.Users / 1000.0) * p.computePer1000Users * 0.1;
            }
            if (revenue > 0) _r.Add(ResourceId.Cash, revenue);
            if (newUsers > 0) _r.Add(ResourceId.Users, newUsers);
            if (data > 0) _r.Add(ResourceId.Data, data);
            if (computeCost > 0) _r.Add(ResourceId.Compute, -computeCost);

            s.Revenue = revenue;
            s.NewUsers = newUsers;
            s.DataGenerated = data;
            s.ComputeConsumed = computeCost;
        }
    }
}

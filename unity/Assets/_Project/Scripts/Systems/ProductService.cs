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
            // feat-012 테크트리 — 선행 제품 전부 출시돼야 한다 (additive, 빈 목록이면 기존 동작 그대로).
            if (p.prerequisiteProducts != null)
                foreach (var pre in p.prerequisiteProducts)
                    if (!string.IsNullOrEmpty(pre) && !_m.ActiveProducts.Contains(pre)) return false;
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

        // ---- 제품 레벨업 (React getProductLevel/upgradeProduct 동치, feat-012 #4) ----

        // 출시 제품의 기본 레벨 1, 미출시 0.
        public int GetLevel(string id)
        {
            if (_m.ProductLevels.TryGetValue(id, out var lv)) return lv;
            return IsActive(id) ? 1 : 0;
        }

        // 강화 비용 — launch_cost * upgrade_cost_multiplier * 현재 레벨 (자원별 반올림, React 동일).
        public List<ResourceAmount> GetLevelUpCost(string id)
        {
            var p = _c.GetProduct(id);
            if (p == null) return null;
            int level = System.Math.Max(1, GetLevel(id));
            var costs = new List<ResourceAmount>();
            foreach (var c in p.launchCost)
                costs.Add(new ResourceAmount { resource = c.resource, amount = System.Math.Round(c.amount * p.upgradeCostMultiplier * level) });
            // 로스터 engineering 합 → 현금 비용 할인 (feat-014 #1).
            return RosterBonus.ApplyCashDiscount(costs, RosterBonus.GetEngineeringDiscount(_m, _c));
        }

        public bool CanLevelUp(string id)
        {
            var p = _c.GetProduct(id);
            if (p == null || !IsActive(id)) return false;
            if (GetLevel(id) >= p.maxLevel) return false;
            return _r.CanAfford(GetLevelUpCost(id));
        }

        public bool LevelUp(string id)
        {
            if (!CanLevelUp(id)) return false;
            if (!_r.SpendMultiple(GetLevelUpCost(id))) return false;
            _m.ProductLevels[id] = GetLevel(id) + 1;
            GameEvents.RaiseResourcesUpdated();
            return true;
        }

        // 레벨 멀티플라이어 (React 동치) — 매출 +35%/Lv, 이용자 +25%/Lv, 연산 +15%/Lv.
        double RevenueMultiplier(string id) => 1.0 + System.Math.Max(0, GetLevel(id) - 1) * 0.35;
        double UserMultiplier(string id) => 1.0 + System.Math.Max(0, GetLevel(id) - 1) * 0.25;
        double ComputeMultiplier(string id) => 1.0 + System.Math.Max(0, GetLevel(id) - 1) * 0.15;

        // 예상 월매출 (derive-only) — 현재 포트폴리오·레벨·신뢰 기준. 밸류에이션(feat-015)과 기대수익 표기에 재사용.
        public double EstimateMonthlyRevenue()
        {
            var b = _c.balance;
            double trustMult = 1.0;
            if (_m.Trust > b.trustMultiplierHighThreshold) trustMult = b.trustEnterpriseBonus;
            else if (_m.Trust < b.trustMultiplierLowThreshold) trustMult = b.trustLowPenalty;

            double revenue = 0;
            foreach (var id in _m.ActiveProducts)
            {
                var p = _c.GetProduct(id);
                if (p == null) continue;
                bool isEnterprise = p.tags != null && p.tags.Contains("enterprise");
                revenue += p.baseRevenue * RevenueMultiplier(id) * (isEnterprise ? trustMult : 1.0);
            }

            if (_m.ActiveProducts.Count > 0 && b.revenuePerThousandUsers > 0)
                revenue += (_m.Users / 1000.0) * b.revenuePerThousandUsers;
            return revenue;
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
            // React growthMultiplier 동치 (feat-012 #4 밸런스 정렬) — 기존 *10 증폭은 이용자(=연산 현금비용)를
            // React 대비 10배로 불려 장기 경제를 파산시키는 Godot 프로토타입 잔재였다.
            double hypeMult = b.growthRateBase + (_m.Hype / 100.0) * (b.hypeGrowthMultiplier - 1.0);
            double trustMult = 1.0;
            if (_m.Trust > b.trustMultiplierHighThreshold) trustMult = b.trustEnterpriseBonus;
            else if (_m.Trust < b.trustMultiplierLowThreshold) trustMult = b.trustLowPenalty;

            double revenue = 0, newUsers = 0, data = 0, computePressure = 0;
            foreach (var id in _m.ActiveProducts)
            {
                var p = _c.GetProduct(id);
                if (p == null) continue;
                bool isEnterprise = p.tags != null && p.tags.Contains("enterprise");
                double pTrustMult = isEnterprise ? trustMult : 1.0;
                // 레벨 멀티플라이어 (feat-012 #4) — 레벨 1이면 전부 1.0이라 기존 동작 그대로.
                revenue += p.baseRevenue * RevenueMultiplier(id) * pTrustMult;
                newUsers += p.baseUsersPerMonth * UserMultiplier(id) * hypeMult;
                data += p.dataGeneratedPerMonth;
                computePressure += p.computePer1000Users * ComputeMultiplier(id);
            }

            // 연산력 소모 — React computePressure 동치 (feat-013 #1 정렬). 기존(총 이용자 비례)은
            // 누적 이용자가 연산력을 무한 잠식해 장기 연구·강화가 영구 차단되는 Godot 잔재였다.
            double computeCost = _m.ActiveProducts.Count > 0
                ? System.Math.Ceiling(computePressure * System.Math.Max(1.0, newUsers / 1000.0) * 0.08)
                : 0;
            // 이용자 수익화 (feat-013 #1) — 보유 이용자가 매출을 낸다. 제품이 하나라도 살아 있어야 과금이 돈다.
            if (_m.ActiveProducts.Count > 0 && b.revenuePerThousandUsers > 0)
                revenue += (_m.Users / 1000.0) * b.revenuePerThousandUsers;

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

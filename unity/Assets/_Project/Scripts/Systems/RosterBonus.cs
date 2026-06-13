// 로스터 능력치 환산 — 영입한 인재 8축 스탯이 회사 개발력이 된다 (feat-014 #3 전체 환산).
// 전부 derive-only(누적 없음). 비용 할인은 사본으로, 월간 보너스는 MonthController/ProductService가 매달 파생 적용.
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public enum AgentStat { Research, Engineering, Product, Growth, Safety, Operations, Creativity, Autonomy }

    public static class RosterBonus
    {
        // 비용 할인 — 포인트당 1%, 상한 25%.
        public const double DiscountPerPoint = 0.01;
        public const double MaxDiscount = 0.25;
        // 월간 배수 보너스 — 포인트당 0.5%, 상한 25%.
        public const double MultiplierPerPoint = 0.005;
        public const double MaxMultiplier = 0.25;
        // 운영 고정비 절감 — 포인트당 0.4%, 상한 20%.
        public const double OpsReductionPerPoint = 0.004;
        public const double MaxOpsReduction = 0.20;
        // 월간 자원 트리클 — 포인트당. 신뢰는 100 상한·하이프는 매월 감쇠라 누적 폭주 없음.
        public const double TrustPerPoint = 0.1;
        public const double HypePerPoint = 0.1;

        public static int SumStat(GameModel m, DataCatalog c, AgentStat stat)
        {
            if (m == null || c == null || m.HiredAgentIds == null) return 0;
            int sum = 0;
            foreach (var id in m.HiredAgentIds)
            {
                var a = c.GetAgentType(id);
                if (a == null) continue;
                sum += Pick(a, stat);
            }
            return sum;
        }

        static int Pick(AgentTypeDef a, AgentStat stat)
        {
            switch (stat)
            {
                case AgentStat.Research: return a.statResearch;
                case AgentStat.Engineering: return a.statEngineering;
                case AgentStat.Product: return a.statProduct;
                case AgentStat.Growth: return a.statGrowth;
                case AgentStat.Safety: return a.statSafety;
                case AgentStat.Operations: return a.statOperations;
                case AgentStat.Creativity: return a.statCreativity;
                case AgentStat.Autonomy: return a.statAutonomy;
                default: return 0;
            }
        }

        // research → 능력 강화 현금 할인 / engineering → 제품 강화 현금 할인.
        public static double GetResearchDiscount(GameModel m, DataCatalog c)
            => System.Math.Min(MaxDiscount, SumStat(m, c, AgentStat.Research) * DiscountPerPoint);
        public static double GetEngineeringDiscount(GameModel m, DataCatalog c)
            => System.Math.Min(MaxDiscount, SumStat(m, c, AgentStat.Engineering) * DiscountPerPoint);

        // product → 제품 월매출 +% / growth → 신규 이용자 +% / autonomy → 연산 압력 -%.
        public static double GetRevenueBonus(GameModel m, DataCatalog c)
            => System.Math.Min(MaxMultiplier, SumStat(m, c, AgentStat.Product) * MultiplierPerPoint);
        public static double GetUserBonus(GameModel m, DataCatalog c)
            => System.Math.Min(MaxMultiplier, SumStat(m, c, AgentStat.Growth) * MultiplierPerPoint);
        public static double GetComputeReduction(GameModel m, DataCatalog c)
            => System.Math.Min(MaxMultiplier, SumStat(m, c, AgentStat.Autonomy) * MultiplierPerPoint);
        // operations → 월 고정비 -%.
        public static double GetOpsCostReduction(GameModel m, DataCatalog c)
            => System.Math.Min(MaxOpsReduction, SumStat(m, c, AgentStat.Operations) * OpsReductionPerPoint);
        // safety → 월간 신뢰 + / creativity → 월간 하이프 +.
        public static double GetMonthlyTrust(GameModel m, DataCatalog c)
            => SumStat(m, c, AgentStat.Safety) * TrustPerPoint;
        public static double GetMonthlyHype(GameModel m, DataCatalog c)
            => SumStat(m, c, AgentStat.Creativity) * HypePerPoint;

        // 현금만 할인한 비용 사본 — SO 원본 리스트를 절대 변형하지 않는다.
        public static List<ResourceAmount> ApplyCashDiscount(List<ResourceAmount> costs, double discount)
        {
            if (costs == null) return null;
            if (discount <= 0) return costs;
            var result = new List<ResourceAmount>(costs.Count);
            foreach (var c in costs)
            {
                var amount = c.resource == ResourceId.Cash
                    ? System.Math.Round(c.amount * (1.0 - discount))
                    : c.amount;
                result.Add(new ResourceAmount { resource = c.resource, amount = amount });
            }
            return result;
        }
    }
}

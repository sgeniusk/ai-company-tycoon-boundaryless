// 로스터 능력치 환산 — 영입한 인재의 스탯이 개발력이 된다 (feat-014 #1 thin 슬라이스, 전체 환산은 #3).
// research 합 → 능력 강화 현금 비용 할인, engineering 합 → 제품 강화 현금 비용 할인. 상한 25%.
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public static class RosterBonus
    {
        public const double DiscountPerPoint = 0.01;
        public const double MaxDiscount = 0.25;

        public static double GetResearchDiscount(GameModel m, DataCatalog c)
            => System.Math.Min(MaxDiscount, SumStat(m, c, research: true) * DiscountPerPoint);

        public static double GetEngineeringDiscount(GameModel m, DataCatalog c)
            => System.Math.Min(MaxDiscount, SumStat(m, c, research: false) * DiscountPerPoint);

        static int SumStat(GameModel m, DataCatalog c, bool research)
        {
            if (m == null || c == null || m.HiredAgentIds == null) return 0;
            int sum = 0;
            foreach (var id in m.HiredAgentIds)
            {
                var a = c.GetAgentType(id);
                if (a != null) sum += research ? a.statResearch : a.statEngineering;
            }
            return sum;
        }

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

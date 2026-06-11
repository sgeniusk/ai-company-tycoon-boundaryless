// 산업 시너지/콤보 — 도메인 포트폴리오(해금 ∪ 출시 제품 도메인)가 월간 효과로 보상받는다 (React industry-synergies/combos 동치, feat-013 #1).
// Unity 포트 경제에 빠져 있던 다층 수익 스트림의 첫 층 — 깊은 연구·교차 출시가 현금 엔진이 된다.
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public static class IndustrySynergyService
    {
        // React getActiveIndustryDomainIds 동치 — 해금 도메인 + 출시 제품의 도메인.
        public static HashSet<string> GetActiveDomainIds(GameModel m, DataCatalog c)
        {
            var ids = new HashSet<string>(m.UnlockedDomains);
            foreach (var pid in m.ActiveProducts)
            {
                var p = c.GetProduct(pid);
                if (p != null && !string.IsNullOrEmpty(p.domain)) ids.Add(p.domain);
            }
            return ids;
        }

        public static bool IsActive(IndustrySynergyDef def, HashSet<string> activeDomains)
        {
            if (def == null || def.requiredDomains == null || def.requiredDomains.Count == 0) return false;
            foreach (var d in def.requiredDomains)
                if (!activeDomains.Contains(d)) return false;
            return true;
        }

        // 활성 시너지+콤보 목록 (시너지 먼저, 카탈로그 순).
        public static List<IndustrySynergyDef> GetActive(GameModel m, DataCatalog c)
        {
            var list = new List<IndustrySynergyDef>();
            if (c == null) return list;
            var domains = GetActiveDomainIds(m, c);
            if (c.industrySynergies != null)
                foreach (var s in c.industrySynergies)
                    if (IsActive(s, domains)) list.Add(s);
            if (c.industryCombos != null)
                foreach (var s in c.industryCombos)
                    if (IsActive(s, domains)) list.Add(s);
            return list;
        }

        // 월 정산 훅 — 활성 효과 합산 적용 (MonthController 3.6단계, additive).
        public static void ApplyMonthly(GameModel m, DataCatalog c, ResourceService r)
        {
            foreach (var def in GetActive(m, c))
                if (def.monthlyEffects != null)
                    foreach (var e in def.monthlyEffects)
                        r.Add(e.resource, e.amount);
        }
    }
}

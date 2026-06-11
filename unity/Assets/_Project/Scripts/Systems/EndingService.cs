// 멀티 엔딩 판정 — 조건 매칭 후 우선순위 내림차순 첫 항목, 없으면 폴백 (React getCampaignEnding 동일 포팅, feat-008 #3).
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public static class EndingService
    {
        // won — 승리 판정 결과 (status: success/failure 매핑).
        public static EndingDef Determine(GameModel model, DataCatalog catalog, bool won)
        {
            if (model == null || catalog == null || catalog.endings == null || catalog.endings.Count == 0) return null;

            EndingDef best = null;
            int bestIndex = -1;
            for (int i = 0; i < catalog.endings.Count; i++)
            {
                var ending = catalog.endings[i];
                if (ending == null || !Matches(ending, model, catalog, won)) continue;
                if (best == null || ending.priority > best.priority || (ending.priority == best.priority && i < bestIndex))
                {
                    best = ending;
                    bestIndex = i;
                }
            }

            // React: 매칭 없으면 마지막 엔딩(데이터 정본의 폴백)으로.
            return best ?? catalog.endings[catalog.endings.Count - 1];
        }

        // React conditionMatchesState 대응. growth_path는 Unity VS에 없는 시스템 — 요구 시 미매칭.
        static bool Matches(EndingDef e, GameModel m, DataCatalog catalog, bool won)
        {
            var status = won ? "success" : "failure";
            if (!string.IsNullOrEmpty(e.conditionStatus) && e.conditionStatus != "any" && e.conditionStatus != status) return false;
            if (e.minMonth > 0 && m.CurrentMonth < e.minMonth) return false;
            if (e.minProducts > 0 && m.ActiveProducts.Count < e.minProducts) return false;
            foreach (var minimum in e.minResources)
                if (m.Get(minimum.resource) < minimum.amount) return false;

            var run = m.RunModifiers ?? new RunModifiersState();
            if (!OneOf(run.StartCityId, e.startCityIds)) return false;
            if (!OneOf(run.WorldLoreId, e.worldLoreIds)) return false;
            if (!OneOf(run.MarketConditionId, e.marketConditionIds)) return false;
            if (!OneOf(run.FounderTraitId, e.founderTraitIds)) return false;
            if (!OneOf(run.ChallengeTier, e.challengeTierIds)) return false;
            if (e.growthPathIds.Count > 0) return false;

            if (e.archetypeIds.Count > 0)
            {
                var derived = new HashSet<string>();
                foreach (var rule in ArchetypeService.GetDerived(run, catalog)) derived.Add(rule.id);
                foreach (var id in e.archetypeIds)
                    if (!derived.Contains(id)) return false;
            }

            return e.fallback || HasAnySpecificCondition(e);
        }

        static bool OneOf(string value, List<string> allowed)
        {
            return allowed == null || allowed.Count == 0 || (!string.IsNullOrEmpty(value) && allowed.Contains(value));
        }

        static bool HasAnySpecificCondition(EndingDef e)
        {
            return (!string.IsNullOrEmpty(e.conditionStatus) && e.conditionStatus != "any")
                || e.minMonth > 0
                || e.minProducts > 0
                || e.minResources.Count > 0
                || e.startCityIds.Count > 0
                || e.worldLoreIds.Count > 0
                || e.marketConditionIds.Count > 0
                || e.founderTraitIds.Count > 0
                || e.challengeTierIds.Count > 0
                || e.growthPathIds.Count > 0
                || e.archetypeIds.Count > 0;
        }
    }
}

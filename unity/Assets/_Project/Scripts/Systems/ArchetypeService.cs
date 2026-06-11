// 태그 파생 아키타입 엔진 — 런 태그 조합에서 아키타입을 파생한다 (React tag-derivation.ts 동일 포팅, feat-008 #2).
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public static class ArchetypeService
    {
        // 런의 활성 태그가 requires를 전부 포함하는 아키타입 목록 (id 정렬 — React와 동일 결정론).
        public static List<ArchetypeDef> GetDerived(RunModifiersState run, DataCatalog catalog)
        {
            var derived = new List<ArchetypeDef>();
            if (run == null || run.Tags == null || catalog == null || catalog.archetypes == null) return derived;

            var tags = new HashSet<string>(run.Tags);
            foreach (var rule in catalog.archetypes)
            {
                if (rule == null) continue;
                bool all = true;
                foreach (var required in rule.requires)
                    if (!tags.Contains(required)) { all = false; break; }
                if (all) derived.Add(rule);
            }

            derived.Sort((a, b) => string.CompareOrdinal(a.id, b.id));
            return derived;
        }

        // bonus 아키타입의 월간 효과 목록 (React getArchetypeMonthlyEffects 대응).
        public static List<ResourceAmount> GetMonthlyEffects(RunModifiersState run, DataCatalog catalog)
        {
            var effects = new List<ResourceAmount>();
            foreach (var rule in GetDerived(run, catalog))
                if (rule.yieldsKind == "bonus")
                    effects.AddRange(rule.monthlyEffects);
            return effects;
        }

        // 도감에 없는 신규 발견 id (React getNewlyDiscoveredArchetypes 대응).
        public static List<string> GetNewlyDiscovered(ICollection<string> collection, List<ArchetypeDef> derived)
        {
            var fresh = new List<string>();
            foreach (var rule in derived)
                if (collection == null || !collection.Contains(rule.id))
                    fresh.Add(rule.id);
            return fresh;
        }
    }
}

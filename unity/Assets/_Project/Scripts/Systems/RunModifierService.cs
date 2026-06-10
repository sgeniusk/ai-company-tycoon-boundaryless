// 런 모디파이어 선택·적용 엔진 (React run-modifiers.ts 동일 포팅, feat-007 블록 #1). 같은 시드면 React와 같은 세계를 굴린다.
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    // 새 런 입력 — null/빈 값은 기본값. 시드가 "standard"가 아니면 미지정 축을 시드로 굴린다.
    public class RunModifierInput
    {
        public string Seed;
        public string StartCityId;
        public string WorldLoreId;
        public string MarketConditionId;
        public string FounderTraitId;
    }

    public static class RunModifierService
    {
        // (축, 기본 id, 해시 salt) — React dimensions 배열과 동일 순서·값.
        static readonly (string axis, string defaultId, string salt)[] Dimensions =
        {
            ("start_cities", RunModifiersState.DefaultStartCityId, "city"),
            ("world_lore", RunModifiersState.DefaultWorldLoreId, "world"),
            ("market_conditions", RunModifiersState.DefaultMarketConditionId, "market"),
            ("founder_traits", RunModifiersState.DefaultFounderTraitId, "founder"),
        };

        // 4축 선택 — 명시 id 우선, 없으면 시드 결정론. 기본 시드는 기본 옵션(델타 0).
        public static RunModifiersState Select(DataCatalog catalog, RunModifierInput input)
        {
            if (catalog == null) return new RunModifiersState();
            var seed = NormalizeSeed(input?.Seed);
            var explicitIds = new[] { input?.StartCityId, input?.WorldLoreId, input?.MarketConditionId, input?.FounderTraitId };
            var picked = new RunModifierOptionDef[Dimensions.Length];

            for (int i = 0; i < Dimensions.Length; i++)
            {
                var (axis, defaultId, salt) = Dimensions[i];
                picked[i] = SelectOption(catalog.GetRunOptions(axis), defaultId, explicitIds[i], seed, salt);
            }

            var state = new RunModifiersState
            {
                Seed = seed,
                StartCityId = picked[0] != null ? picked[0].id : RunModifiersState.DefaultStartCityId,
                WorldLoreId = picked[1] != null ? picked[1].id : RunModifiersState.DefaultWorldLoreId,
                MarketConditionId = picked[2] != null ? picked[2].id : RunModifiersState.DefaultMarketConditionId,
                FounderTraitId = picked[3] != null ? picked[3].id : RunModifiersState.DefaultFounderTraitId,
                Tags = MergeTags(picked),
            };
            return state;
        }

        // 선택된 4축의 시작 델타를 모델에 적용 — 자원은 ResourceService 클램프, 능력은 0..maxLevel 클램프.
        public static void ApplyStartingDeltas(GameModel model, DataCatalog catalog, ResourceService resources)
        {
            if (model == null || model.RunModifiers == null || catalog == null) return;
            foreach (var option in GetSelectedOptions(model.RunModifiers, catalog))
            {
                if (option == null) continue;
                foreach (var delta in option.startingResourceDeltas)
                    resources.Add(delta.resource, delta.amount);
                foreach (var delta in option.startingCapabilityDeltas)
                {
                    var def = catalog.GetCapability(delta.capabilityId);
                    int max = def != null ? def.maxLevel : int.MaxValue;
                    int current;
                    model.Capabilities.TryGetValue(delta.capabilityId, out current);
                    int next = current + delta.level;
                    if (next < 0) next = 0;
                    if (next > max) next = max;
                    model.Capabilities[delta.capabilityId] = next;
                }
            }
        }

        public static List<RunModifierOptionDef> GetSelectedOptions(RunModifiersState state, DataCatalog catalog)
        {
            var ids = new[] { state.StartCityId, state.WorldLoreId, state.MarketConditionId, state.FounderTraitId };
            var options = new List<RunModifierOptionDef>();
            for (int i = 0; i < Dimensions.Length; i++)
            {
                var option = catalog.GetRunOption(Dimensions[i].axis, ids[i]);
                if (option != null) options.Add(option);
            }
            return options;
        }

        // 세이브 위생 처리 — 알 수 없는 id는 기본값으로, 태그는 카탈로그에서 재파생.
        public static RunModifiersState Sanitize(RunModifiersState loaded, DataCatalog catalog)
        {
            if (loaded == null || catalog == null) return loaded ?? new RunModifiersState();
            var input = new RunModifierInput
            {
                Seed = loaded.Seed,
                StartCityId = ValidId(catalog, "start_cities", loaded.StartCityId),
                WorldLoreId = ValidId(catalog, "world_lore", loaded.WorldLoreId),
                MarketConditionId = ValidId(catalog, "market_conditions", loaded.MarketConditionId),
                FounderTraitId = ValidId(catalog, "founder_traits", loaded.FounderTraitId),
            };
            var state = Select(catalog, input);
            state.ChallengeTier = string.IsNullOrEmpty(loaded.ChallengeTier)
                ? RunModifiersState.DefaultChallengeTier
                : loaded.ChallengeTier;
            return state;
        }

        static string ValidId(DataCatalog catalog, string axis, string id)
        {
            return !string.IsNullOrEmpty(id) && catalog.GetRunOption(axis, id) != null ? id : null;
        }

        static string NormalizeSeed(string seed)
        {
            if (string.IsNullOrEmpty(seed)) return RunModifiersState.DefaultSeed;
            var trimmed = seed.Trim();
            return trimmed.Length > 0 ? trimmed : RunModifiersState.DefaultSeed;
        }

        // React selectOption 동일 — 명시 id > 기본 시드는 기본 옵션 > 시드 풀(기본 제외)에서 해시 인덱스.
        static RunModifierOptionDef SelectOption(
            List<RunModifierOptionDef> options, string defaultId, string explicitId, string seed, string salt)
        {
            if (options == null || options.Count == 0) return null;

            if (!string.IsNullOrEmpty(explicitId))
            {
                var explicitOption = options.Find(o => o != null && o.id == explicitId);
                if (explicitOption != null) return explicitOption;
            }

            var defaultOption = options.Find(o => o != null && o.id == defaultId) ?? options[0];
            if (seed == RunModifiersState.DefaultSeed) return defaultOption;

            var pool = options.FindAll(o => o != null && o.id != defaultId);
            if (pool.Count == 0) return defaultOption;

            return pool[(int)(HashSeed(seed + ":" + salt) % (uint)pool.Count)];
        }

        // FNV-1a 32bit — React hashSeed와 동일 (ASCII 시드 기준 동치).
        public static uint HashSeed(string value)
        {
            uint hash = 2166136261u;
            foreach (char c in value)
            {
                hash ^= c;
                hash *= 16777619u;
            }
            return hash;
        }

        static List<string> MergeTags(RunModifierOptionDef[] picked)
        {
            var tags = new List<string>();
            foreach (var option in picked)
            {
                if (option == null) continue;
                foreach (var tag in option.tags)
                    if (!string.IsNullOrEmpty(tag) && !tags.Contains(tag))
                        tags.Add(tag);
            }
            return tags;
        }
    }
}

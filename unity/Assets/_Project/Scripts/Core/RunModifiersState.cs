// 런 모디파이어 상태 — 시드와 4축 선택, 파생 태그 (React RunModifiersState 대응, feat-007 블록 #1).
using System;
using System.Collections.Generic;

namespace AICompanyTycoon.Core
{
    [Serializable]
    public class RunModifiersState
    {
        public const string DefaultSeed = "standard";
        public const string DefaultStartCityId = "default_city";
        public const string DefaultWorldLoreId = "standard";
        public const string DefaultMarketConditionId = "steady_market";
        public const string DefaultFounderTraitId = "no_founder";
        public const string DefaultChallengeTier = "standard";

        public string Seed = DefaultSeed;
        public string StartCityId = DefaultStartCityId;
        public string WorldLoreId = DefaultWorldLoreId;
        public string MarketConditionId = DefaultMarketConditionId;
        public string FounderTraitId = DefaultFounderTraitId;
        // feat-008 난이도 축 예약 — 블록 #1에서는 항상 "standard"(효과 없음).
        public string ChallengeTier = DefaultChallengeTier;
        public List<string> Tags = new List<string>();

        public bool IsDefaultRun()
        {
            return StartCityId == DefaultStartCityId
                && WorldLoreId == DefaultWorldLoreId
                && MarketConditionId == DefaultMarketConditionId
                && FounderTraitId == DefaultFounderTraitId;
        }
    }
}

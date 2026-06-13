// 세이브 직렬화 DTO (JsonUtility는 Dictionary를 못 다뤄 능력은 리스트로 둔다).
using System;
using System.Collections.Generic;

namespace AICompanyTycoon.Save
{
    [Serializable]
    public class CapEntry
    {
        public string id;
        public int level;
    }

    [Serializable]
    public class CompetitorSave
    {
        public string id;
        public double score;
        public int marketShare;
        public double momentum;
    }

    [Serializable]
    public class MarketShareSave
    {
        public int month;
        public int player;
        public int topRivalShare;
        public string topRivalId;
    }

    // 런 모디파이어 세이브 (feat-007). 구세이브(필드 없음)는 기본값으로 로드된다.
    [Serializable]
    public class RunModifiersSave
    {
        public string seed = "standard";
        public string startCityId = "default_city";
        public string worldLoreId = "standard";
        public string marketConditionId = "steady_market";
        public string founderTraitId = "no_founder";
        public string challengeTier = "standard";
        public List<string> tags = new List<string>();
    }

    [Serializable]
    public class ShareholderSave
    {
        public string name;
        public string kind;
        public double equity;
    }

    [Serializable]
    public class SaveData
    {
        public int version = 11;
        public double cash;
        public double users;
        public double compute;
        public double data;
        public double talent;
        public double trust;
        public double hype;
        public double automation;
        public int currentMonth = 1;
        public string companyStageId = "garage_prototype";
        public List<string> unlockedDomains = new List<string>();
        public List<CapEntry> capabilities = new List<CapEntry>();
        public List<string> activeProducts = new List<string>();
        // 제품 레벨 (v4, feat-012). 구세이브(필드 없음)는 빈 리스트 — 출시 제품은 레벨 1로 파생된다.
        public List<CapEntry> productLevels = new List<CapEntry>();
        // 인재 로스터 (v5, feat-014). 구세이브는 빈 로스터 — 익명 talent로 무손실.
        public List<string> hiredAgents = new List<string>();
        // 시설 (v6, feat-014 #2). 구세이브 officeLevel 0 → 성급 파생 마이그레이션, locationId 빈값 → 차고.
        public int officeLevel;
        public string locationId = "";
        // 지분 (v7, feat-015). 구세이브 founderEquity 0 → 100%로 마이그레이션.
        public double founderEquity;
        public List<ShareholderSave> shareholders = new List<ShareholderSave>();
        // 융자 (v8, feat-015 #2). 구세이브 0 = 무차입.
        public double loanPrincipal;
        // 시리즈 투자 라운드 (v9, feat-015 #3). 구세이브 빈 목록.
        public List<string> investmentRoundsOffered = new List<string>();
        // 상장 (v10, feat-015 #4). 구세이브 미상장.
        public bool isPublic;
        public double sharePrice;
        // 전략 쿨다운 (v11, feat-014 #4). 구세이브 빈 목록 — 즉시 사용 가능.
        public List<CapEntry> strategyCooldowns = new List<CapEntry>();
        public List<string> purchasedUpgrades = new List<string>();
        public List<string> purchasedAutomation = new List<string>();
        public List<string> triggeredEvents = new List<string>();
        public List<CompetitorSave> competitorStates = new List<CompetitorSave>();
        public List<MarketShareSave> marketShareHistory = new List<MarketShareSave>();
        public RunModifiersSave runModifiers = new RunModifiersSave();
        public List<string> worldEventHistory = new List<string>();
    }
}

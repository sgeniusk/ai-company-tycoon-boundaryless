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
    public class SaveData
    {
        public int version = 1;
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
        public List<string> purchasedUpgrades = new List<string>();
        public List<string> purchasedAutomation = new List<string>();
        public List<string> triggeredEvents = new List<string>();
    }
}

// 시장(도메인) 정의 (domains.json + DomainSystem.gd 대응).
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "DomainDef", menuName = "AICT/Domain Definition")]
    public class DomainDef : ScriptableObject
    {
        public string id;
        public string displayName;
        [TextArea] public string description;
        public bool unlockedByDefault;
        public List<CapabilityLevel> unlockRequirements = new List<CapabilityLevel>();
        public string marketSize;  // small / medium / large / huge
        public string riskLevel;   // low / medium / high
        public string icon;
    }
}

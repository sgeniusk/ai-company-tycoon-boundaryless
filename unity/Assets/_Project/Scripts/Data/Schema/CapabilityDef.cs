// AI 능력 정의 (capabilities.json + CapabilitySystem.gd 대응).
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "CapabilityDef", menuName = "AICT/Capability Definition")]
    public class CapabilityDef : ScriptableObject
    {
        public string id;
        public string displayName;
        [TextArea] public string description;
        public int maxLevel = 1;
        // upgradeCosts[L] = 현재 레벨 L 에서 L+1 로 올리는 비용.
        public List<CostTier> upgradeCosts = new List<CostTier>();
        public List<DomainUnlock> unlocksDomains = new List<DomainUnlock>();
        public List<ResourceAmount> effectsPerLevel = new List<ResourceAmount>();
        public string icon;
    }
}

// 일반 업그레이드 정의 (upgrades.json + UpgradeSystem.gd 대응).
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "UpgradeDef", menuName = "AICT/Upgrade Definition")]
    public class UpgradeDef : ScriptableObject
    {
        public string id;
        public string displayName;
        [TextArea] public string description;
        public List<ResourceAmount> cost = new List<ResourceAmount>();
        public List<ResourceAmount> effects = new List<ResourceAmount>();
        public List<Threshold> requirements = new List<Threshold>();
        public bool oneTime = true;
    }
}

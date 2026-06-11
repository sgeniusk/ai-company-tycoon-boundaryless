// 난이도 티어 정의 (difficulty_tiers.json 대응, feat-008 #1). 헤드윈드는 월간 가산, 보상 배수는 메타 진행용 예약.
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "DifficultyTierDef", menuName = "AICT/Difficulty Tier Definition")]
    public class DifficultyTierDef : ScriptableObject
    {
        public string id;
        public string displayName;
        [TextArea] public string description;
        public List<ResourceAmount> monthlyHeadwind = new List<ResourceAmount>();
        public double rewardMultiplier = 1.0;
    }
}

// 멀티 엔딩 정의 (endings.json 대응, feat-008 #3). 우선순위 내림차순으로 첫 매칭이 결말.
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "EndingDef", menuName = "AICT/Ending Definition")]
    public class EndingDef : ScriptableObject
    {
        public string id;
        public int priority;
        public string title;
        [TextArea] public string flavor;
        public int metaRewardBonus;

        // 조건 (빈 리스트/0 은 미요구). growth_path는 Unity VS에 없는 시스템 — 요구되면 미매칭 처리.
        public string conditionStatus = "any"; // "success" | "failure" | "any"
        public int minMonth;
        public int minProducts;
        public List<ResourceAmount> minResources = new List<ResourceAmount>();
        public List<string> startCityIds = new List<string>();
        public List<string> worldLoreIds = new List<string>();
        public List<string> marketConditionIds = new List<string>();
        public List<string> founderTraitIds = new List<string>();
        public List<string> challengeTierIds = new List<string>();
        public List<string> growthPathIds = new List<string>();
        public List<string> archetypeIds = new List<string>();
        public bool fallback;
    }
}

// 사무실 확장 정의 (office_expansions.json 대응 — feat-014). #1은 정원(hire_capacity)만 쓰고 구매는 #2에서.
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "OfficeExpansionDef", menuName = "AICT/Office Expansion Definition")]
    public class OfficeExpansionDef : ScriptableObject
    {
        public string id;
        public int level = 1;
        public string displayName;
        [TextArea] public string description;
        public int hireCapacity = 3;
        public int decorationSlots;
        public List<ResourceAmount> cost = new List<ResourceAmount>();
        public List<Threshold> unlockRequirements = new List<Threshold>();
        public List<ResourceAmount> monthlyEffects = new List<ResourceAmount>();
    }
}

// 본사 위치 정의 (company_locations.json 대응, React locations 동치 — feat-014 #2 본사 이전).
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "CompanyLocationDef", menuName = "AICT/Company Location Definition")]
    public class CompanyLocationDef : ScriptableObject
    {
        public string id;
        public string displayName;
        public string region;
        [TextArea] public string description;
        public string talentPool;
        public double monthlyCostModifier = 1.0; // 고정비 곱 (차고 0.82 ~ 글로벌 캠퍼스 1.8)
        public double humanHireDiscount;          // 사람 인재 영입비 할인 (음수 = 할증)
        public double aiOperationBonus;           // 후속 환산용 (#3) — #2는 보관만.
        public List<ResourceAmount> cost = new List<ResourceAmount>();
        public List<Threshold> unlockRequirements = new List<Threshold>();
    }
}

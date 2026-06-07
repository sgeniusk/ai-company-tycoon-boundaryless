// 회사 단계 정의 (company_stages.json + CompanyStageSystem.gd 대응).
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "CompanyStageDef", menuName = "AICT/Company Stage Definition")]
    public class CompanyStageDef : ScriptableObject
    {
        public string id;
        public string displayName;
        [TextArea] public string description;
        public List<Threshold> requirements = new List<Threshold>();
        public int order;
    }
}

// 산업 시너지/콤보 정의 (industry_synergies.json + industry_combos.json 대응, React v0.60 동치 — feat-013 #1).
// 요구 도메인이 전부 활성(해금 ∪ 출시 제품 도메인)이면 월간 효과가 흐른다. 콤보는 riskLabel이 있는 고보상형.
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "IndustrySynergyDef", menuName = "AICT/Industry Synergy Definition")]
    public class IndustrySynergyDef : ScriptableObject
    {
        public string id;
        public string title;
        [TextArea] public string description;
        public List<string> requiredDomains = new List<string>();
        public List<ResourceAmount> monthlyEffects = new List<ResourceAmount>();
        public string riskLabel; // 콤보 전용 — 시너지는 빈 문자열.
        public List<string> tags = new List<string>();
    }
}

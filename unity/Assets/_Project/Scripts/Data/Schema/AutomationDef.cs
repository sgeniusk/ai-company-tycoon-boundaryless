// 자동화 업그레이드 정의 (automation_upgrades.json + AutomationSystem.gd 대응).
// 월별 효과는 Godot에서 ID별 하드코딩(match auto_id)이었다 — 여기서는 monthlyEffects로 데이터화한다.
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "AutomationDef", menuName = "AICT/Automation Definition")]
    public class AutomationDef : ScriptableObject
    {
        public string id;
        public string displayName;
        [TextArea] public string description;
        public List<ResourceAmount> cost = new List<ResourceAmount>();
        public double automationGain;
        public List<ResourceAmount> effects = new List<ResourceAmount>();         // 구매 즉시 효과
        public List<ResourceAmount> monthlyEffects = new List<ResourceAmount>();  // 월별 효과(데이터화)
        public List<Threshold> requirements = new List<Threshold>();
        public string monthlyBenefitText;
    }
}

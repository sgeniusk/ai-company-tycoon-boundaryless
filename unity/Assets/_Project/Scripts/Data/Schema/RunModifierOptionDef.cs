// 런 모디파이어 옵션 정의 (run_modifiers.json 4축 항목 대응, feat-007). 축은 start_cities/world_lore/market_conditions/founder_traits.
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "RunModifierOptionDef", menuName = "AICT/Run Modifier Option")]
    public class RunModifierOptionDef : ScriptableObject
    {
        public string id;
        public string displayName;
        [TextArea] public string description;
        public string axis; // "start_cities" | "world_lore" | "market_conditions" | "founder_traits"
        public List<ResourceAmount> startingResourceDeltas = new List<ResourceAmount>();
        // CapabilityLevel.level 을 델타로 재사용한다 (음수 허용).
        public List<CapabilityLevel> startingCapabilityDeltas = new List<CapabilityLevel>();
        public List<string> tags = new List<string>();
    }
}

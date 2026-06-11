// 태그 파생 아키타입 정의 (derivation_rules.json 대응, feat-008 #2). 런 태그 조합이 모이면 발견된다.
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "ArchetypeDef", menuName = "AICT/Archetype Definition")]
    public class ArchetypeDef : ScriptableObject
    {
        public string id;
        public string displayName;
        [TextArea] public string description;
        public List<string> requires = new List<string>(); // 전부 충족해야 파생
        public string discoveryId;
        public string yieldsKind; // "bonus" | "product" | "event"
        [TextArea] public string yieldsSummary;
        public List<ResourceAmount> monthlyEffects = new List<ResourceAmount>(); // kind==bonus일 때만
    }
}

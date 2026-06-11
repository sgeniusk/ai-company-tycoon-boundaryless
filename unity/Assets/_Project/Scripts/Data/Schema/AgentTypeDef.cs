// 인재(에이전트) 정의 (agent_types.json 대응, React AgentTypeDefinition 동치 — feat-014 #1 채용 3택1).
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "AgentTypeDef", menuName = "AICT/Agent Type Definition")]
    public class AgentTypeDef : ScriptableObject
    {
        public string id;
        public string displayName;
        public string role;
        [TextArea] public string description;
        public string kind;   // human / ai_agent / robot
        public string rarity; // common / uncommon / rare / epic
        // 능력치 8축 — #1은 표시 + research/engineering 할인 환산, 나머지는 #3에서.
        public int statResearch;
        public int statEngineering;
        public int statProduct;
        public int statGrowth;
        public int statSafety;
        public int statOperations;
        public int statCreativity;
        public int statAutonomy;
        public List<ResourceAmount> hireCost = new List<ResourceAmount>();
        public List<Threshold> unlockRequirements = new List<Threshold>();
        public string quirk; // 한 줄 개성 — 후보 카드 풍미.
    }
}

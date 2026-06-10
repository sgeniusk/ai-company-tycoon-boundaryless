// 런 태그 -> 월간 자원 효과 사전 (run_modifiers.json tag_effects 대응, feat-007). 블록 #2 틱 훅이 소비한다.
using System;
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [Serializable]
    public class RunTagEffect
    {
        public string tag;
        public List<ResourceAmount> monthlyEffects = new List<ResourceAmount>();
    }

    [CreateAssetMenu(fileName = "RunTagEffectsConfig", menuName = "AICT/Run Tag Effects Config")]
    public class RunTagEffectsConfig : ScriptableObject
    {
        public List<RunTagEffect> effects = new List<RunTagEffect>();

        public RunTagEffect GetEffect(string tag)
        {
            return effects.Find(item => item != null && item.tag == tag);
        }
    }
}

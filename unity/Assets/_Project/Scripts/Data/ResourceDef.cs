// 자원 1종의 정적 정의 (Godot resources.json 항목 대응). 데이터-as-ScriptableObject 패턴의 첫 예시.
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "ResourceDef", menuName = "AICT/Resource Definition")]
    public class ResourceDef : ScriptableObject
    {
        public string id;
        public string displayName;
        [TextArea] public string description;
        public double initialValue;
        public double minValue;
        public double maxValue = 999999999;
        public string icon;
        public string category;
    }
}

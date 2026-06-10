// 연중 세계 이벤트 정의 (world_events.json 대응, feat-007 블록 #3). 시드 파생 스케줄로 매년 1건 발동.
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "WorldEventDef", menuName = "AICT/World Event Definition")]
    public class WorldEventDef : ScriptableObject
    {
        public string id;
        public string title;
        [TextArea] public string description;
        public string trigger; // 발동 조건 서술 (표시용)
        public int yearMin = 1;
        public int yearMax = 10;
        public List<ResourceAmount> resourceEffects = new List<ResourceAmount>();
        public List<string> worldLoreTags = new List<string>(); // 세계관 태그 일치 시 선택 편향
    }
}

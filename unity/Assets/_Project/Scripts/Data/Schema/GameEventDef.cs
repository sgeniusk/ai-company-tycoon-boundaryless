// 이벤트 정의 (events.json + EventSystem.gd 대응).
using System;
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [Serializable]
    public class EventChoice
    {
        public string id;
        public string text;
        [TextArea] public string description;
        public List<ResourceAmount> effects = new List<ResourceAmount>();
    }

    [CreateAssetMenu(fileName = "GameEventDef", menuName = "AICT/Event Definition")]
    public class GameEventDef : ScriptableObject
    {
        public string id;
        public string displayName;
        [TextArea] public string description;
        public double weight = 5;
        public List<Threshold> conditions = new List<Threshold>();
        public List<EventChoice> choices = new List<EventChoice>();
    }
}

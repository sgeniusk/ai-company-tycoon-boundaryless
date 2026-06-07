// 조건 기반 가중 랜덤 이벤트 추첨과 선택지 결과 적용 (Godot EventSystem.gd 대응).
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class RandomEventService
    {
        readonly GameModel _m;
        readonly DataCatalog _c;
        readonly ResourceService _r;
        readonly IRng _rng;

        public GameEventDef Current { get; private set; }

        public RandomEventService(GameModel m, DataCatalog c, ResourceService r, IRng rng)
        {
            _m = m; _c = c; _r = r; _rng = rng;
        }

        public List<GameEventDef> Eligible()
        {
            var list = new List<GameEventDef>();
            foreach (var e in _c.events)
                if (e != null && ThresholdEval.Meets(_m, e.conditions)) list.Add(e);
            return list;
        }

        public GameEventDef TryTrigger()
        {
            var eligible = Eligible();
            if (eligible.Count == 0) return null;

            double total = 0;
            foreach (var e in eligible) total += (e.weight <= 0 ? 5 : e.weight);
            double roll = _rng.NextDouble() * total;
            double cum = 0;
            foreach (var e in eligible)
            {
                cum += (e.weight <= 0 ? 5 : e.weight);
                if (roll <= cum)
                {
                    Current = e;
                    if (!_m.TriggeredEvents.Contains(e.id)) _m.TriggeredEvents.Add(e.id);
                    GameEvents.RaiseLog(e.displayName);
                    return e;
                }
            }
            Current = eligible[0];
            return eligible[0];
        }

        public bool Resolve(string choiceId)
        {
            if (Current == null) return false;
            EventChoice chosen = null;
            foreach (var ch in Current.choices)
                if (ch.id == choiceId) { chosen = ch; break; }
            if (chosen == null) return false;
            if (chosen.effects != null)
                foreach (var e in chosen.effects) _r.Add(e.resource, e.amount);
            GameEvents.RaiseResourcesUpdated();
            Current = null;
            return true;
        }
    }
}

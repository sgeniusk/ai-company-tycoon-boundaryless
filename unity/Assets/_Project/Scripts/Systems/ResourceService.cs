// 모든 자원 변경의 단일 통로 (Godot ResourceSystem.gd 대응). 클램프 한계는 DataCatalog에서 가져온다.
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class ResourceService
    {
        readonly GameModel _m;
        readonly Dictionary<ResourceId, (double min, double max)> _limits;

        public ResourceService(GameModel model, DataCatalog catalog)
        {
            _m = model;
            _limits = BuildLimits(catalog);
        }

        static Dictionary<ResourceId, (double, double)> BuildLimits(DataCatalog c)
        {
            var d = new Dictionary<ResourceId, (double, double)>
            {
                { ResourceId.Cash, (-999999999, 999999999) },
                { ResourceId.Users, (0, 999999999) },
                { ResourceId.Compute, (0, 999999) },
                { ResourceId.Data, (0, 999999) },
                { ResourceId.Talent, (0, 999) },
                { ResourceId.Trust, (0, 100) },
                { ResourceId.Hype, (0, 100) },
                { ResourceId.Automation, (0, 100) },
            };
            if (c != null && c.resources != null)
                foreach (var r in c.resources)
                    if (r != null && ResourceIds.TryParse(r.id, out var id))
                        d[id] = (r.minValue, r.maxValue);
            return d;
        }

        public double Get(ResourceId id) => _m.Get(id);

        public void Add(ResourceId id, double amount)
        {
            double old = _m.Get(id);
            double nv = Clamp(id, old + amount);
            _m.Set(id, nv);
            GameEvents.RaiseResourceChanged(id, old, nv);
        }

        double Clamp(ResourceId id, double v)
        {
            var (min, max) = _limits[id];
            if (v < min) return min;
            if (v > max) return max;
            return v;
        }

        // cash는 마이너스(부채) 허용, 나머지는 부족하면 false (Godot can_afford 대응).
        public bool CanAfford(IEnumerable<ResourceAmount> costs)
        {
            if (costs == null) return true;
            foreach (var c in costs)
                if (c.resource != ResourceId.Cash && _m.Get(c.resource) < c.amount) return false;
            return true;
        }

        public bool SpendMultiple(IEnumerable<ResourceAmount> costs)
        {
            if (!CanAfford(costs)) return false;
            if (costs != null)
                foreach (var c in costs) Add(c.resource, -c.amount);
            return true;
        }

        public void ApplyEffects(IEnumerable<ResourceAmount> effects)
        {
            if (effects != null)
                foreach (var e in effects) Add(e.resource, e.amount);
            GameEvents.RaiseResourcesUpdated();
        }
    }
}

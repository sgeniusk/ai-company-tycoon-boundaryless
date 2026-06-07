// 시장(도메인) 해금 판정과 해금 (Godot DomainSystem.gd 대응).
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class DomainService
    {
        readonly GameModel _m;
        readonly DataCatalog _c;

        public DomainService(GameModel m, DataCatalog c) { _m = m; _c = c; }

        public void InitDefaults()
        {
            foreach (var d in _c.domains)
                if (d != null && d.unlockedByDefault && !_m.UnlockedDomains.Contains(d.id))
                    _m.UnlockedDomains.Add(d.id);
        }

        public bool IsUnlocked(string id) => _m.UnlockedDomains.Contains(id);

        public bool TryUnlock(string id)
        {
            if (IsUnlocked(id)) return false;
            var d = _c.GetDomain(id);
            if (d == null) return false;
            foreach (var req in d.unlockRequirements)
            {
                int have = _m.Capabilities.TryGetValue(req.capabilityId, out var lv) ? lv : 0;
                if (have < req.level) return false;
            }
            _m.UnlockedDomains.Add(id);
            GameEvents.RaiseDomainUnlocked(id);
            return true;
        }

        public void CheckAll()
        {
            foreach (var d in _c.domains)
                if (d != null) TryUnlock(d.id);
        }
    }
}

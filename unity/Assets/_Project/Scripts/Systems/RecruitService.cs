// 인재 채용 — 반복 가능한 talent 공급 액션. React hireAgent의 Unity 최소 포팅 (feat-012 #4 테크트리 도달성 보장).
// 배경 — 능력 강화는 talent를 소모하는데 Unity 포트엔 공급원이 초기 3 + 채용 업그레이드 3뿐이라
// tier 3~4 제품이 경제적으로 영구 도달 불가였다. 비용은 보유 talent 기하 증가 + 월급(salary_per_talent)으로 자체 균형.
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class RecruitService
    {
        public const double DefaultBaseCost = 2500;
        public const double DefaultCostGrowth = 1.25;

        readonly GameModel _m;
        readonly DataCatalog _c;
        readonly ResourceService _r;

        public RecruitService(GameModel m, DataCatalog c, ResourceService r) { _m = m; _c = c; _r = r; }

        double GetExtra(string key, double fallback)
        {
            var balance = _c != null ? _c.balance : null;
            if (balance == null || balance.extra == null) return fallback;
            foreach (var t in balance.extra)
                if (t.key == key) return t.value;
            return fallback;
        }

        // 채용 비용 — 보유 인재가 많을수록 기하 증가 (derive-only, 세이브 필드 없음).
        public double GetCost()
        {
            double baseCost = GetExtra("recruit_base_cost", DefaultBaseCost);
            double growth = GetExtra("recruit_cost_growth", DefaultCostGrowth);
            int talent = (int)_m.Get(ResourceId.Talent);
            if (talent < 0) talent = 0;
            return System.Math.Round(baseCost * System.Math.Pow(growth, talent));
        }

        public bool CanRecruit() => _m.Get(ResourceId.Cash) >= GetCost();

        public bool Recruit()
        {
            if (!CanRecruit()) return false;
            _r.Add(ResourceId.Cash, -GetCost());
            _r.Add(ResourceId.Talent, 1);
            GameEvents.RaiseResourcesUpdated();
            return true;
        }
    }
}

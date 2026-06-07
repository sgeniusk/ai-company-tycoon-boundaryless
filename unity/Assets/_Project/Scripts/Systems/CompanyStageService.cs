// 진행도 기준 회사 단계 승급 (Godot CompanyStageSystem.gd 대응).
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class CompanyStageService
    {
        readonly GameModel _m;
        readonly List<CompanyStageDef> _sorted;

        public CompanyStageService(GameModel m, DataCatalog c)
        {
            _m = m;
            _sorted = new List<CompanyStageDef>();
            foreach (var s in c.stages) if (s != null) _sorted.Add(s);
            _sorted.Sort((a, b) => a.order.CompareTo(b.order));
        }

        int CurrentOrder()
        {
            foreach (var s in _sorted) if (s.id == _m.CompanyStageId) return s.order;
            return 0;
        }

        // 현재보다 높은 단계 중 요구조건을 만족하는 가장 높은 단계까지 올린다.
        public void CheckAdvancement(MonthSummary summary)
        {
            int cur = CurrentOrder();
            foreach (var s in _sorted)
            {
                if (s.order <= cur) continue;
                if (ThresholdEval.Meets(_m, s.requirements))
                {
                    _m.CompanyStageId = s.id;
                    summary.StageChangedTo = s.id;
                    GameEvents.RaiseCompanyStageChanged(s.id);
                }
            }
        }
    }
}

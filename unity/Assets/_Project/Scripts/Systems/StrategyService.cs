// 전략 활동 — 자본으로 하는 경영 액션 (feat-014 #4). 마케팅 캠페인 + 경쟁사 견제(리스크).
// 쿨다운으로 스팸 방지. 경쟁사 견제는 신뢰를 걸고 1위 라이벌의 기세를 꺾는다.
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class StrategyService
    {
        public const string Marketing = "marketing_blitz";
        public const string Sabotage = "competitor_sabotage";
        public const int CooldownMonths = 6;

        // 마케팅 — 현금으로 화제성·이용자 끌어올리기.
        public const double MarketingCost = 2500;
        public const double MarketingHype = 12;
        public const double MarketingUsers = 800;
        // 경쟁사 견제 — 현금 + 신뢰 리스크로 1위 라이벌 점수·기세 깎기.
        public const double SabotageCost = 3000;
        public const double SabotageTrustHit = 6;
        public const double SabotageScoreCut = 0.15;

        readonly GameModel _m;
        readonly ResourceService _r;
        readonly MarketService _market;

        public StrategyService(GameModel m, ResourceService r, MarketService market) { _m = m; _r = r; _market = market; }

        public int GetCooldownRemaining(string id)
        {
            foreach (var e in _m.StrategyCooldowns)
                if (e != null && e.id == id) return System.Math.Max(0, e.level - _m.CurrentMonth);
            return 0;
        }

        void SetCooldown(string id)
        {
            int until = _m.CurrentMonth + CooldownMonths;
            foreach (var e in _m.StrategyCooldowns)
                if (e != null && e.id == id) { e.level = until; return; }
            _m.StrategyCooldowns.Add(new CooldownEntry { id = id, level = until });
        }

        public double GetCost(string id) => id == Sabotage ? SabotageCost : MarketingCost;

        public string GetLockReason(string id)
        {
            if (GetCooldownRemaining(id) > 0) return "재사용 대기 " + GetCooldownRemaining(id) + "개월";
            if (_m.Cash < GetCost(id)) return "자금 부족";
            if (id == Sabotage && TopRival() == null) return "견제할 경쟁사가 없습니다";
            return null;
        }

        public bool CanRun(string id) => GetLockReason(id) == null;

        public bool Run(string id)
        {
            if (!CanRun(id)) return false;
            _r.Add(ResourceId.Cash, -GetCost(id));
            if (id == Marketing)
            {
                _r.Add(ResourceId.Hype, MarketingHype);
                _r.Add(ResourceId.Users, MarketingUsers);
            }
            else if (id == Sabotage)
            {
                _r.Add(ResourceId.Trust, -SabotageTrustHit);
                var rival = TopRival();
                if (rival != null)
                {
                    rival.score = System.Math.Max(1, rival.score * (1 - SabotageScoreCut));
                    rival.momentum = System.Math.Min(rival.momentum, 0);
                }
            }

            SetCooldown(id);
            GameEvents.RaiseResourcesUpdated();
            return true;
        }

        // 최고 점수 경쟁사 — 견제 대상.
        public CompetitorState TopRival()
        {
            CompetitorState top = null;
            foreach (var c in _m.CompetitorStates)
                if (c != null && (top == null || c.score > top.score)) top = c;
            return top;
        }

        public string TopRivalName(DataCatalog c)
        {
            var rival = TopRival();
            if (rival == null) return null;
            var def = c != null ? c.GetCompetitor(rival.id) : null;
            return def != null && !string.IsNullOrEmpty(def.displayName) ? def.displayName : rival.id;
        }
    }
}

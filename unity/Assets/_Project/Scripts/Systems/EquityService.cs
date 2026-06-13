// 지분·회사 가치 — 창업자 지분, 주주 명부, 밸류에이션 파생 (feat-015 #1, Unity 오리지널 콘텐츠).
// 가난한 차고에서 지분 가치가 자라는 게 보이는 도파민 코어. 상장(IPO)·융자는 후속 블록.
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class EquityService
    {
        // 밸류에이션 = 예상 월매출 * 배수 + 이용자 * 단가 + 현금(양수만). 밸런스 패스 조정 대상.
        public const double RevenueMultiple = 24;
        public const double ValuePerUser = 2;

        readonly GameModel _m;
        readonly DataCatalog _c;
        readonly ProductService _p;

        public EquityService(GameModel m, DataCatalog c, ProductService p) { _m = m; _c = c; _p = p; }

        public double GetValuation()
        {
            double cash = _m.Cash > 0 ? _m.Cash : 0;
            return _p.EstimateMonthlyRevenue() * RevenueMultiple + _m.Users * ValuePerUser + cash;
        }

        // 시가총액 — 상장 후엔 밸류에이션에 주가 지수(100 기준)를 곱한다 (feat-015 #4).
        public double GetMarketCap()
            => _m.IsPublic ? GetValuation() * (_m.SharePrice / 100.0) : GetValuation();

        // 내 자산 — 시가총액 * 창업자 지분. 부자 순위(#5)의 기준값.
        public double GetFounderNetWorth() => GetMarketCap() * (_m.FounderEquity / 100.0);

        // 외부 주주 지분 합 — 불변식: 창업자 + 주주 합 = 100.
        public double GetOutsideEquity()
        {
            double sum = 0;
            foreach (var s in _m.Shareholders)
                if (s != null) sum += s.equity;
            return sum;
        }

        // 지분 양도 — 인터뷰·투자 라운드·상장이 호출한다. 잔여 지분 부족이면 거부.
        public bool GrantEquity(string holderName, string kind, double equityPercent, double cashIn, ResourceService r)
        {
            if (equityPercent <= 0 || _m.FounderEquity - equityPercent < 0) return false;
            _m.FounderEquity -= equityPercent;
            _m.Shareholders.Add(new ShareholderEntry { name = holderName, kind = kind, equity = equityPercent });
            if (cashIn > 0 && r != null) r.Add(ResourceId.Cash, cashIn);
            GameEvents.RaiseResourcesUpdated();
            return true;
        }
    }
}

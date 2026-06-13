// 융자 — 추가 대출과 상환 (feat-015 #3). 한도는 예상 월매출 기반, 이자는 MonthController가 매달 부과.
// 빚으로 빠르게 크되 이자가 고정비를 누른다 — 지분 사수 vs 레버리지의 또 다른 축.
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class LoanService
    {
        public const double MonthlyInterestRate = 0.015;
        public const double MinLimit = 4000;
        public const double RevenueLimitMultiple = 6;

        readonly GameModel _m;
        readonly ResourceService _r;
        readonly ProductService _p;

        public LoanService(GameModel m, ResourceService r, ProductService p) { _m = m; _r = r; _p = p; }

        // 신용 한도 — 예상 월매출 * 배수, 최소 보장. 매출이 자라면 더 빌릴 수 있다.
        public double GetLimit() => System.Math.Max(MinLimit, _p.EstimateMonthlyRevenue() * RevenueLimitMultiple);

        public double GetAvailable() => System.Math.Max(0, GetLimit() - _m.LoanPrincipal);

        public double GetMonthlyInterest() => _m.LoanPrincipal * MonthlyInterestRate;

        public double SuggestedBorrow()
        {
            // 한도 잔여를 1천 단위로 내림 — UI 기본 버튼.
            double avail = GetAvailable();
            return System.Math.Floor(avail / 1000.0) * 1000.0;
        }

        public bool CanBorrow(double amount) => amount > 0 && amount <= GetAvailable() + 0.001;

        public bool Borrow(double amount)
        {
            if (!CanBorrow(amount)) return false;
            _m.LoanPrincipal += amount;
            _r.Add(ResourceId.Cash, amount);
            GameEvents.RaiseResourcesUpdated();
            return true;
        }

        // 상환 가능액 — 잔액과 보유 현금 중 작은 쪽.
        public double MaxRepay() => System.Math.Min(_m.LoanPrincipal, System.Math.Max(0, _m.Cash));

        public bool CanRepay(double amount) => amount > 0 && amount <= MaxRepay() + 0.001;

        public bool Repay(double amount)
        {
            if (!CanRepay(amount)) return false;
            _r.Add(ResourceId.Cash, -amount);
            _m.LoanPrincipal -= amount;
            if (_m.LoanPrincipal < 0) _m.LoanPrincipal = 0;
            GameEvents.RaiseResourcesUpdated();
            return true;
        }
    }
}

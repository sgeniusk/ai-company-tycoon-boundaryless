// 상장(IPO) + 월별 주가 — 4성 빅 모먼트와 그 이후의 주식 시장 (feat-015 #4, Unity 오리지널).
// 상장하면 공모 지분만큼 대형 현금이 들어오고, 이후 주가가 실적·신뢰·시드 노이즈로 매달 움직인다.
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class IpoService
    {
        public const int RequiredStarTier = 4;          // 4성(enterprise_ai_vendor) 이상
        public const double MinTrust = 55;
        public const double IpoPremium = 1.5;           // 공모가 프리미엄 — 시장이 미래에 값을 매긴다.
        public const double BaseSharePrice = 100;

        readonly GameModel _m;
        readonly DataCatalog _c;
        readonly EquityService _e;

        public IpoService(GameModel m, DataCatalog c, EquityService e) { _m = m; _c = c; _e = e; }

        public string GetLockReason()
        {
            if (_m.IsPublic) return "이미 상장했습니다.";
            if (ThresholdEval.GetStar(_m, _c) < RequiredStarTier) return "4성 기업부터 상장할 수 있습니다.";
            if (_m.Trust < MinTrust) return "신뢰 " + _m.Trust.ToString("F0") + "/" + MinTrust + " — 시장 신뢰가 부족합니다.";
            if (_e.GetValuation() <= 0) return "기업 가치가 부족합니다.";
            return null;
        }

        public bool CanIpo() => GetLockReason() == null;

        // 공모가 — 밸류에이션 * 공모지분% * 프리미엄.
        public double GetOfferingCash(double publicPercent)
            => System.Math.Round(_e.GetValuation() * (publicPercent / 100.0) * IpoPremium);

        public bool Ipo(double publicPercent, ResourceService r)
        {
            if (!CanIpo() || publicPercent <= 0 || _m.FounderEquity - publicPercent < 0) return false;
            double cash = GetOfferingCash(publicPercent);
            if (!_e.GrantEquity("공개 주주", "public", publicPercent, cash, r)) return false;
            _m.IsPublic = true;
            _m.SharePrice = BaseSharePrice;
            GameEvents.RaiseResourcesUpdated();
            return true;
        }

        // 시가총액 — 상장 후엔 밸류에이션에 주가 지수를 곱한다.
        public double GetMarketCap()
            => _m.IsPublic ? _e.GetValuation() * (_m.SharePrice / BaseSharePrice) : _e.GetValuation();

        // 월별 주가 변동 — 펀더멘털(신뢰 드리프트) + 시드 노이즈. 결정론(같은 시드·달이면 같은 변동).
        public static void ApplyMonthlyStock(GameModel m, DataCatalog c)
        {
            if (!m.IsPublic) return;
            double trustDrift = (m.Trust - 50.0) / 1000.0;                 // ±5%
            string seed = m.RunModifiers != null ? m.RunModifiers.Seed : "standard";
            uint h = RunModifierService.HashSeed(seed + ":stock:" + m.CurrentMonth);
            double noise = ((int)(h % 21u) - 10) / 200.0;                  // ±5%
            double factor = 1.0 + trustDrift + noise;
            if (factor < 0.7) factor = 0.7;
            m.SharePrice *= factor;
            if (m.SharePrice < 1) m.SharePrice = 1;
        }
    }
}

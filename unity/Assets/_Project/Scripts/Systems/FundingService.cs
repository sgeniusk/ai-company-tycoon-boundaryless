// 시리즈 투자 권유 — 성급 승급 때 등장하는 일회성 라운드 (feat-015 #3).
// 현재 밸류에이션 기준으로 지분을 팔아 현금을 당긴다. 거절해도 한 번 제안되면 끝(일회성).
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class InvestmentRound
    {
        public string StageId;
        public string Title;
        public string Investor;
        public double EquityPercent;
        public double CashIn;
    }

    public class FundingService
    {
        readonly GameModel _m;
        readonly DataCatalog _c;
        readonly EquityService _e;

        public FundingService(GameModel m, DataCatalog c, EquityService e) { _m = m; _c = c; _e = e; }

        // 성급(스테이지)별 라운드 정의 — 지분%만 고정, 현금은 밸류에이션에서 파생(가치를 가르치는 가격).
        static readonly Dictionary<string, (string title, string investor, double equity)> Rounds =
            new Dictionary<string, (string, string, double)>
            {
                { "seed_startup", ("시리즈 시드", "엔젤 연합", 8) },
                { "viral_app_company", ("시리즈 A", "벤처캐피탈 미래로", 12) },
                { "enterprise_ai_vendor", ("시리즈 B", "글로벌 성장펀드", 15) },
            };

        // 해당 성급에 아직 제안하지 않은 라운드가 있으면 반환. 잔여 지분이 부족하면 null.
        public InvestmentRound GetOffer(string stageId)
        {
            if (string.IsNullOrEmpty(stageId) || _m.InvestmentRoundsOffered.Contains(stageId)) return null;
            if (!Rounds.TryGetValue(stageId, out var def)) return null;
            if (_m.FounderEquity - def.equity < 0) return null;
            return new InvestmentRound
            {
                StageId = stageId,
                Title = def.title,
                Investor = def.investor,
                EquityPercent = def.equity,
                CashIn = System.Math.Round(_e.GetValuation() * (def.equity / 100.0)),
            };
        }

        public void MarkOffered(string stageId)
        {
            if (!string.IsNullOrEmpty(stageId) && !_m.InvestmentRoundsOffered.Contains(stageId))
                _m.InvestmentRoundsOffered.Add(stageId);
        }

        public bool Accept(InvestmentRound round, ResourceService r)
        {
            if (round == null) return false;
            MarkOffered(round.StageId);
            return _e.GrantEquity(round.Investor, "investor", round.EquityPercent, round.CashIn, r);
        }

        public void Decline(InvestmentRound round)
        {
            if (round != null) MarkOffered(round.StageId);
        }
    }
}

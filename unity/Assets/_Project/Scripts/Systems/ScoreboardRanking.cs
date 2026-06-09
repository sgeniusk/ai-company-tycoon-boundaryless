// 전국 AI 기업 랭킹 전광판을 GameModel/MarketService에서 파생 (scoreboard-ranking.ts 이식). 상태 불변.
using System;
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public static class ScoreboardRanking
    {
        // 시장 점유율(절대 강함) 0.65 + 경쟁권 내 우위(상대) 0.35 → 0–1 standing.
        const double ShareWeight = 0.65;
        const double LeadWeight = 0.35;
        // 상위 구간 압축 — #1 도달은 압도적 지배를 요구, 초반 성장은 순위가 크게 움직이게.
        const double RankCurveGamma = 1.6;
        // 전국 필드는 캠페인이 진행될수록 천천히 커진다 (살아있는 생태계 연출).
        const int FieldBase = 2140;
        const int FieldGrowthPerMonth = 4;

        public struct NationalRanking
        {
            public int rank;        // 1 = 전국 1위 (낮을수록 좋음)
            public int total;       // 전국 기업 수
            public int delta;       // 전월 대비 (>0 ▲ 상승, <0 ▼ 하락, 0 유지)
            public int marketShare; // 0–100
        }

        public static NationalRanking DeriveNationalRanking(MarketService market, GameModel m)
        {
            int total = FieldSize(m);
            int rank = RankFor(PlayerStanding(market), total);

            int delta = 0;
            var history = m.MarketShareHistory;
            if (history != null && history.Count >= 2)
            {
                var last = history[history.Count - 1];
                var prev = history[history.Count - 2];
                int cur = RankFor(StandingFrom(last.player / 100.0, LeadOf(last)), total);
                int old = RankFor(StandingFrom(prev.player / 100.0, LeadOf(prev)), total);
                delta = old - cur;
            }

            return new NationalRanking
            {
                rank = rank,
                total = total,
                delta = delta,
                marketShare = market.PlayerMarketShare(),
            };
        }

        // 마퀴 — 라이벌 추월 격차 · 전국 점유율 · 현재 단계 · 순위 추세.
        public static List<string> BuildScoreboardMarquee(MarketService market, GameModel m, DataCatalog catalog)
        {
            var nr = DeriveNationalRanking(market, m);
            var entries = new List<string>();
            var rankings = market.GetMarketRankings();

            int rivalIndex = rankings.FindIndex(e => !e.isPlayer);
            if (rivalIndex >= 0)
            {
                var rival = rankings[rivalIndex];
                double rivalLead = rankings.Count <= 1 ? 0 : (double)(rankings.Count - rivalIndex - 1) / (rankings.Count - 1);
                int rivalRank = RankFor(StandingFrom(rival.marketShare / 100.0, rivalLead), nr.total);
                int gap = Math.Abs(rivalRank - nr.rank);
                var def = catalog != null ? catalog.GetCompetitor(rival.id) : null;
                string name = def != null && !string.IsNullOrEmpty(def.displayName) ? def.displayName : rival.id;
                entries.Add(rivalRank < nr.rank
                    ? "라이벌 '" + name + "' 추월까지 " + gap + "계단"
                    : "라이벌 '" + name + "' 대비 " + gap + "계단 우위");
            }

            entries.Add("전국 점유율 " + nr.marketShare + "%");

            var stage = catalog != null ? catalog.GetStage(m.CompanyStageId) : null;
            if (stage != null && !string.IsNullOrEmpty(stage.displayName))
            {
                entries.Add("현재 단계 — " + stage.displayName);
            }

            if (nr.delta > 0)
            {
                entries.Add("순위 상승 중 ▲" + nr.delta);
            }
            else if (nr.delta < 0)
            {
                entries.Add("순위 방어 필요 ▼" + Math.Abs(nr.delta));
            }

            return entries;
        }

        static double PlayerStanding(MarketService market)
        {
            var rankings = market.GetMarketRankings();
            int playerIndex = Math.Max(0, rankings.FindIndex(e => e.isPlayer));
            int fieldSize = rankings.Count;
            double share01 = market.PlayerMarketShare() / 100.0;
            double lead01 = fieldSize <= 1 ? 1 : (double)(fieldSize - playerIndex - 1) / (fieldSize - 1);
            return StandingFrom(share01, lead01);
        }

        static double LeadOf(MarketShareEntry e)
        {
            return e.player >= e.topRivalShare ? 0.8 : 0.2;
        }

        static double StandingFrom(double share01, double lead01)
        {
            return Clamp(ShareWeight * share01 + LeadWeight * lead01, 0, 1);
        }

        static int RankFor(double standing, int total)
        {
            double placement = Math.Pow(1 - standing, RankCurveGamma);
            return (int)Clamp(Math.Round(placement * (total - 1)) + 1, 1, total);
        }

        static int FieldSize(GameModel m)
        {
            return FieldBase + Math.Max(0, m.CurrentMonth - 1) * FieldGrowthPerMonth;
        }

        static double Clamp(double v, double lo, double hi)
        {
            return Math.Min(Math.Max(v, lo), hi);
        }
    }
}

// 세계 부자 순위 — 상장 후 내 자산(시가총액*지분)이 세계 부자 필드에서 몇 위인지 파생 (feat-015 #5, Unity 오리지널).
// 전국 기업 랭킹(ScoreboardRanking)의 부 버전. 1위 등반이 엔드게임 도파민의 정점.
using System;
using AICompanyTycoon.Core;

namespace AICompanyTycoon.Systems
{
    public static class RichestRanking
    {
        public const double WorldTopWealth = 100_000_000; // 세계 1위 자산 기준선(이 근처면 #1).
        public const int WorldFieldBase = 500;
        public const int WorldFieldGrowthPerMonth = 1;
        const double RankCurveGamma = 2.2; // 상위 구간 압축 — #1은 압도적 부를 요구.

        public struct Entry
        {
            public int rank;     // 1 = 세계 1위
            public int total;
            public double netWorth;
        }

        public static Entry Derive(GameModel m, EquityService equity)
        {
            int total = WorldFieldBase + Math.Max(0, m.CurrentMonth - 1) * WorldFieldGrowthPerMonth;
            double netWorth = equity.GetFounderNetWorth();
            double standing = Clamp(netWorth / WorldTopWealth, 0, 1);
            double placement = Math.Pow(1 - standing, RankCurveGamma);
            int rank = (int)Clamp(Math.Round(placement * (total - 1)) + 1, 1, total);
            return new Entry { rank = rank, total = total, netWorth = netWorth };
        }

        static double Clamp(double v, double lo, double hi) => Math.Min(Math.Max(v, lo), hi);
    }
}

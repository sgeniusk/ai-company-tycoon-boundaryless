// 승리 조건 니어미스 파생 — "거의 다 왔다"는 긴장-해소 한 줄을 만든다 (feat-010 #3, derive-only).
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class NearMissInfo
    {
        public string Text;
        public double Progress; // 0~1 (가장 가까운 승리 조건의 진행률)
    }

    public static class MilestoneService
    {
        // 승리 3조건(이용자/자금/자동화+제품) 중 가장 가까운 것의 진행률이 threshold 이상, 1.0 미만이면 니어미스.
        public static NearMissInfo GetNearMiss(GameModel m, BalanceConfig b, double threshold = 0.8)
        {
            if (m == null || b == null) return null;

            NearMissInfo best = null;

            if (b.successUsersThreshold > 0)
            {
                var p = m.Users / b.successUsersThreshold;
                best = Pick(best, p, "승리까지 이용자 " + Format(b.successUsersThreshold - m.Users) + " 남았습니다!");
            }

            if (b.successCashThreshold > 0)
            {
                var p = m.Cash / b.successCashThreshold;
                best = Pick(best, p, "승리까지 자금 $" + Format(b.successCashThreshold - m.Cash) + " 남았습니다!");
            }

            if (b.successAutomationThreshold > 0 && m.ActiveProducts.Count >= b.successMinProducts)
            {
                var p = m.Automation / b.successAutomationThreshold;
                best = Pick(best, p, "승리까지 자동화 " + Format(b.successAutomationThreshold - m.Automation) + " 남았습니다!");
            }

            if (best == null || best.Progress < threshold || best.Progress >= 1.0) return null;
            return best;
        }

        static NearMissInfo Pick(NearMissInfo current, double progress, string text)
        {
            if (current != null && current.Progress >= progress) return current;
            return new NearMissInfo { Progress = progress, Text = text };
        }

        static string Format(double value)
        {
            if (value >= 1000000) return (value / 1000000).ToString("0.#") + "M";
            if (value >= 1000) return (value / 1000).ToString("0.#") + "K";
            return System.Math.Ceiling(value).ToString("0");
        }
    }
}

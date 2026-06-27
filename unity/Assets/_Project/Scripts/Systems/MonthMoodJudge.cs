// 월 정산 결과를 오피스 분위 4분위로 판정한다. 코어 무의존 순수 함수 (EventResultJudge 패턴).
namespace AICompanyTycoon.Systems
{
    public enum MonthMood { Flat, Good, Great, Bad }

    public static class MonthMoodJudge
    {
        // 경고/손실은 Bad(우선), 승급·큰 순익·큰 성장은 Great, 그 외 순익 양수는 Good, 나머지는 Flat.
        public static MonthMood Judge(MonthSummary s)
        {
            if (s == null) return MonthMood.Flat;
            if (s.Warnings != null && s.Warnings.Count > 0) return MonthMood.Bad;
            double net = s.Revenue - s.TotalCashCost;
            if (net < 0) return MonthMood.Bad;
            bool promoted = !string.IsNullOrEmpty(s.StageChangedTo);
            if (promoted || net >= 8000 || s.NewUsers >= 80000) return MonthMood.Great;
            if (net > 0) return MonthMood.Good;
            return MonthMood.Flat;
        }
    }
}

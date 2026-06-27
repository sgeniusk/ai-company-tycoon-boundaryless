// 월 정산 결과(MonthSummary)를 브리핑 카드 표시 모델로 변환한다. 코어 무의존 순수 함수.
namespace AICompanyTycoon.Systems
{
    public struct MonthBriefingView
    {
        public int Month;
        public double Revenue, BaseCost, SalaryCost, ComputeCost, TotalCost, Net, NewUsers, DataGenerated;
        public MonthMood Mood;
        public bool HasWorldEvent, HasWarning, Promoted;
        public string WorldEventText, WarningText;
    }

    public static class MonthBriefing
    {
        public static MonthBriefingView Build(MonthSummary s)
        {
            var v = new MonthBriefingView();
            if (s == null) return v;
            v.Month = s.Month;
            v.Revenue = s.Revenue;
            v.BaseCost = s.BaseCost; v.SalaryCost = s.SalaryCost; v.ComputeCost = s.ComputeCost;
            v.TotalCost = s.TotalCashCost;
            v.Net = s.Revenue - s.TotalCashCost;
            v.NewUsers = s.NewUsers; v.DataGenerated = s.DataGenerated;
            v.Mood = MonthMoodJudge.Judge(s);
            v.HasWorldEvent = s.WorldEventTitles != null && s.WorldEventTitles.Count > 0;
            v.WorldEventText = v.HasWorldEvent ? s.WorldEventTitles[0] : null;
            v.HasWarning = s.Warnings != null && s.Warnings.Count > 0;
            v.WarningText = v.HasWarning ? s.Warnings[0] : null;
            v.Promoted = !string.IsNullOrEmpty(s.StageChangedTo);
            return v;
        }
    }
}

// 이벤트 선택 효과(자원 델타) 합의 부호로 컷씬 결과 톤을 판정한다. 코어 무의존 순수 함수.
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public enum EventResultTone { Neutral, Positive, Negative }

    public static class EventResultJudge
    {
        public static EventResultTone Judge(EventChoice choice)
        {
            if (choice == null || choice.effects == null) return EventResultTone.Neutral;
            double sum = 0;
            foreach (var e in choice.effects) sum += e.amount;
            if (sum > 0) return EventResultTone.Positive;
            if (sum < 0) return EventResultTone.Negative;
            return EventResultTone.Neutral;
        }
    }
}

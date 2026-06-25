// 이벤트 선택 효과(자원 델타) 합의 부호로 컷씬 결과 톤을, 이벤트 위협도(최악 선택 합)로 위기 여부를 판정한다. 코어 무의존 순수 함수.
using System.Collections.Generic;
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

        // 이벤트 위협도 — 어떤 선택을 해도 최악(min) 효과 합이 threshold 이하면 위기(발생 시 위기 모달). SO 비의존, choices만 받는다.
        public static bool IsCrisis(List<EventChoice> choices, double threshold)
        {
            if (choices == null || choices.Count == 0) return false;
            double worst = 0;
            bool any = false;
            foreach (var c in choices)
            {
                if (c?.effects == null) continue;
                double sum = 0;
                foreach (var e in c.effects) sum += e.amount;
                if (!any || sum < worst) { worst = sum; any = true; }
            }
            return any && worst <= threshold;
        }
    }
}

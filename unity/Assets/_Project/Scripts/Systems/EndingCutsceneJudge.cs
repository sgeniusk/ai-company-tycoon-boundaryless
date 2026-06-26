// 엔딩 결말을 컷씬 톤 버킷으로 판정한다. 코어 무의존 순수 함수 (EventResultJudge 패턴).
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public enum EndingBucket { Triumph, Legendary, Restart, Collapse }

    public static class EndingCutsceneJudge
    {
        // 승리는 위세(priority>=100=전설/그 외 성공), 패배는 파산 여부(cash<=0=몰락/그 외 차고로)로 가른다.
        // ending은 null 가능(폴백 미존재 데이터) — won이 우선이라 안전.
        public static EndingBucket Judge(EndingDef ending, GameModel model, bool won)
        {
            if (won)
                return (ending != null && ending.priority >= 100)
                    ? EndingBucket.Legendary : EndingBucket.Triumph;
            double cash = model != null ? model.Get(ResourceId.Cash) : 0;
            return cash <= 0 ? EndingBucket.Collapse : EndingBucket.Restart;
        }
    }
}

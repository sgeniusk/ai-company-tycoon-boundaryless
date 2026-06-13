// 지분 조건 특별 결말 — 게임 종료 시 지분 보유 형태에 따라 붙는 Unity 전용 보너스 엔딩 (feat-015 #5).
// endings.json(React 교차 픽스처)을 건드리지 않도록 결과 모달에서 추가 한 줄로만 표시한다.
using AICompanyTycoon.Core;

namespace AICompanyTycoon.Systems
{
    public static class EquityEnding
    {
        public struct Special
        {
            public string Title;
            public string Flavor;
        }

        // 우선순위 순서대로 첫 매칭. 없으면 null.
        public static Special? Get(GameModel m)
        {
            if (m == null) return null;

            // 고독한 제왕 — 상장까지 했는데 지분 90% 이상을 사수.
            if (m.IsPublic && m.FounderEquity >= 90)
                return new Special { Title = "고독한 제왕", Flavor = "상장의 종을 울리고도 회사의 9할이 당신의 것. 누구에게도 고개 숙이지 않았다." };

            // 세계 거부 — 상장 + 막대한 자산(시가총액 기준 본인 몫이 큼).
            if (m.IsPublic)
                return new Special { Title = "세계 거부", Flavor = "당신의 회사는 세계 시장의 별이 되었다. 부자 순위가 당신의 이름을 부른다." };

            // 무차입 자수성가 — 빚 없이, 외부 주주 없이 끝까지.
            if (m.LoanPrincipal <= 0 && m.FounderEquity >= 100)
                return new Special { Title = "무차입 자수성가", Flavor = "투자도 빚도 없이 차고에서 여기까지. 온전히 당신의 손으로 일군 제국." };

            // 지분 헐값 매각 — 지분 절반 이하만 남음.
            if (m.FounderEquity <= 50)
                return new Special { Title = "지분의 대가", Flavor = "빠르게 키웠지만 회사의 절반은 남의 것. 성장의 대가는 지분이었다." };

            return null;
        }
    }
}

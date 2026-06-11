// 개업 인터뷰 — 차고 0성 개업 스토리의 선택 시퀀스 3장 (feat-015 #2, Unity 오리지널).
// 엔젤(지분↔현금), 공동창업(지분↔동료), 은행(대출↔이자). 선택이 엔드게임 부자 순위를 가른다.
using System.Collections.Generic;
using AICompanyTycoon.Core;

namespace AICompanyTycoon.Systems
{
    public static class StartupInterview
    {
        public const double LoanOfferAmount = 6000;

        public class Choice
        {
            public string Id;
            public string Label;
            public string Description;
            public System.Action<SimulationContext> Apply;
        }

        public class Step
        {
            public string Id;
            public string Speaker;
            public string Prompt;
            public List<Choice> Choices = new List<Choice>();
        }

        public static List<Step> GetSteps()
        {
            return new List<Step>
            {
                new Step
                {
                    Id = "angel",
                    Speaker = "엔젤 투자자 한도연",
                    Prompt = "\"차고에서 AI 회사라... 재밌네요. 투자를 좀 할게요. 대신 주식을 나눠주시죠.\"",
                    Choices =
                    {
                        new Choice
                        {
                            Id = "decline", Label = "정중히 거절", Description = "지분 100%를 지킨다. 가난하지만 전부 내 것.",
                            Apply = ctx => { }
                        },
                        new Choice
                        {
                            Id = "small", Label = "소액만 ($8K / 지분 10%)", Description = "숨통이 트인다. 지분 10%를 내준다.",
                            Apply = ctx => ctx.Equity.GrantEquity("엔젤 한도연", "angel", 10, 8000, ctx.Resources)
                        },
                        new Choice
                        {
                            Id = "big", Label = "통 큰 투자 ($20K / 지분 25%)", Description = "로켓 출발. 대신 회사의 4분의 1이 남의 것.",
                            Apply = ctx => ctx.Equity.GrantEquity("엔젤 한도연", "angel", 25, 20000, ctx.Resources)
                        }
                    }
                },
                new Step
                {
                    Id = "cofounder",
                    Speaker = "대학 동기 강민준",
                    Prompt = "\"나도 끼워줘. 월급은 됐고... 지분 5%면 인생을 걸게.\"",
                    Choices =
                    {
                        new Choice
                        {
                            Id = "accept", Label = "공동창업 (지분 5%)", Description = "인재 +1, 월급 부담 없이 합류. 지분 5%를 내준다.",
                            Apply = ctx =>
                            {
                                if (ctx.Equity.GrantEquity("공동창업자 강민준", "cofounder", 5, 0, ctx.Resources))
                                    ctx.Resources.Add(ResourceId.Talent, 1);
                            }
                        },
                        new Choice
                        {
                            Id = "pass", Label = "혼자 간다", Description = "지분은 소중하다. 친구는 응원만 받기로.",
                            Apply = ctx => { }
                        }
                    }
                },
                new Step
                {
                    Id = "bank",
                    Speaker = "은행 대출 상담사",
                    Prompt = "\"개업 축하 대출 상품이 있어요. $6K, 월 이자 1.5%. 사업은 빚으로 크는 법이죠.\"",
                    Choices =
                    {
                        new Choice
                        {
                            Id = "take", Label = "대출 받기 ($6K)", Description = "현금 +$6K. 매달 이자가 고정비에 붙는다.",
                            Apply = ctx =>
                            {
                                ctx.Model.LoanPrincipal += LoanOfferAmount;
                                ctx.Resources.Add(ResourceId.Cash, LoanOfferAmount);
                            }
                        },
                        new Choice
                        {
                            Id = "decline", Label = "무차입 경영", Description = "빚 없이 간다. 느리지만 단단하게.",
                            Apply = ctx => { }
                        }
                    }
                }
            };
        }
    }
}

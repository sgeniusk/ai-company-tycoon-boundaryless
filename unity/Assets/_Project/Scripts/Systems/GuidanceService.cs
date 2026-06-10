// AI 비서 가이던스 — 지금 가장 시급한 다음 행동 한 개를 고른다 (React getGuidanceStep 적응 포팅, feat-009).
// 중앙 FAB와 목표 리본이 이 스텝을 소비한다. 제안 스텝을 본(seen) 달에는 다음 우선순위로 넘어가 잠금이 없다.
using System.Collections.Generic;
using AICompanyTycoon.Core;

namespace AICompanyTycoon.Systems
{
    public class GuidanceStep
    {
        public string Id;
        public string Title;        // 목표 리본 문구 (헬퍼가 말하는 한 줄)
        public string ActionLabel;  // FAB 라벨
        public string TargetTab;    // "products" | "capabilities" | "upgrades" | null(=다음 달 진행)
        public string Tone;         // "primary" | "warning" | "steady"
    }

    public static class GuidanceService
    {
        public const string AdvanceId = "advance_month";

        // seen — 이번 달에 이미 열어 본 제안 id 집합 (월 진행 시 비움). null 허용.
        public static GuidanceStep GetStep(SimulationContext ctx, ISet<string> seen)
        {
            var steps = BuildSteps(ctx);
            foreach (var step in steps)
                if (seen == null || !seen.Contains(step.Id))
                    return step;
            return Advance();
        }

        static List<GuidanceStep> BuildSteps(SimulationContext ctx)
        {
            var steps = new List<GuidanceStep>();
            if (ctx == null || ctx.Model == null) { steps.Add(Advance()); return steps; }
            var m = ctx.Model;
            var b = ctx.Catalog != null ? ctx.Catalog.balance : null;

            // 1) 첫 제품 — 매출 0이면 게임이 굴러가지 않는다.
            if (m.ActiveProducts.Count == 0 && ctx.Products != null && ctx.Products.GetAvailable().Count > 0)
                steps.Add(new GuidanceStep
                {
                    Id = "launch_first_product",
                    Title = "첫 제품을 출시해 매출을 만드세요",
                    ActionLabel = "제품 출시",
                    TargetTab = "products",
                    Tone = "primary",
                });

            // 2) 신뢰 위기 — 게임오버 임계 부근이면 경고.
            if (b != null && m.Trust < b.gameOverTrustThreshold + 10)
                steps.Add(new GuidanceStep
                {
                    Id = "recover_trust",
                    Title = "신뢰가 위험 수위 — 안전 투자로 회복하세요",
                    ActionLabel = "위기 대응",
                    TargetTab = "upgrades",
                    Tone = "warning",
                });

            // 3) 능력 연구 — 지금 올릴 수 있는 능력이 있으면 성장 가속.
            if (ctx.Capabilities != null && ctx.Catalog != null)
                foreach (var cap in ctx.Catalog.capabilities)
                    if (cap != null && ctx.Capabilities.CanUpgrade(cap.id))
                    {
                        steps.Add(new GuidanceStep
                        {
                            Id = "research_capability",
                            Title = cap.displayName + " 능력을 강화할 수 있습니다",
                            ActionLabel = "능력 연구",
                            TargetTab = "capabilities",
                            Tone = "steady",
                        });
                        break;
                    }

            // 4) 자동화 기반 — 운영비 압박 완화 (React add_automation 대응).
            if (m.Automation < 10 && ctx.Automation != null && ctx.Catalog != null)
                foreach (var auto in ctx.Catalog.automation)
                    if (auto != null && ctx.Automation.CanPurchase(auto.id))
                    {
                        steps.Add(new GuidanceStep
                        {
                            Id = "add_automation",
                            Title = "자동화 투자로 운영비를 줄이세요",
                            ActionLabel = "자동화 투자",
                            TargetTab = "upgrades",
                            Tone = "steady",
                        });
                        break;
                    }

            steps.Add(Advance());
            return steps;
        }

        static GuidanceStep Advance()
        {
            return new GuidanceStep
            {
                Id = AdvanceId,
                Title = "이번 달 준비 완료 — 다음 달로 진행하세요",
                ActionLabel = "다음 달",
                TargetTab = null,
                Tone = "primary",
            };
        }
    }
}

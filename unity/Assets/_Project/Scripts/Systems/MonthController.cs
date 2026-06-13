// 월 진행 오케스트레이터 (Godot MonthSystem.gd 대응). 비용->매출->자동화->감쇠->회복->승급->승패 순으로 한 틱을 정산한다.
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class MonthSummary
    {
        public int Month;
        public double BaseCost;
        public double SalaryCost;
        public double ComputeCost;
        public double AutomationDiscountPct;
        public double TotalCashCost;
        public double Revenue;
        public double NewUsers;
        public double DataGenerated;
        public double ComputeConsumed;
        public List<string> Warnings = new List<string>();
        public bool GameOver;
        public bool GameWon;
        public string Outcome;
        public string StageChangedTo;
        public List<string> WorldEventTitles = new List<string>(); // 이번 달 발동한 세계 이벤트 (feat-007)
    }

    public class MonthController
    {
        readonly GameModel _m;
        readonly DataCatalog _c;
        readonly ResourceService _r;
        readonly ProductService _p;
        readonly AutomationService _a;
        readonly CompanyStageService _s;
        readonly MarketService _market;

        public MonthController(GameModel m, DataCatalog c, ResourceService r,
            ProductService p, AutomationService a, CompanyStageService s, MarketService market)
        {
            _m = m; _c = c; _r = r; _p = p; _a = a; _s = s; _market = market;
        }

        public MonthSummary AdvanceMonth()
        {
            var b = _c.balance;
            var s = new MonthSummary { Month = _m.CurrentMonth };

            // 1) 월별 비용 — 기본 + 급여 + 연산비, 자동화 할인 적용
            double baseCost = b.baseMonthlyCashCost;
            double salaryCost = _m.Talent * b.salaryPerTalent;
            double computeCost = (_m.Users / 1000.0) * b.computeCostPer1000Users;
            // React 동치 (feat-012 #4 밸런스 정렬) — 자동화 할인은 연산비 포함 전체에, 상한 75%.
            // 기존(Godot 잔재)은 연산비를 할인 밖에 둬 자동화 투자가 이용자 증가를 못 따라가 장기 파산했다.
            double autoReduction = System.Math.Min(0.75, System.Math.Max(0.0, _m.Automation * b.automationCostReductionPerPoint));
            double discountMult = 1.0 - autoReduction;
            // 본사 위치 고정비 모디파이어 (feat-014 #2, React locationCostModifier 동치 — 차고 0.82 ~ 글로벌 1.8).
            double locationMult = OfficeService.GetLocationCostModifier(_m, _c);
            // 대출 이자 (feat-015 #2) — 원금의 월 1.5%. 할인 대상 아님(금융비). 무차입이면 0.
            double interest = _m.LoanPrincipal > 0 ? _m.LoanPrincipal * 0.015 : 0;
            double totalCash = (baseCost + salaryCost + computeCost) * locationMult * discountMult + interest;
            _r.Add(ResourceId.Cash, -totalCash);
            s.BaseCost = baseCost;
            s.SalaryCost = salaryCost;
            s.ComputeCost = computeCost;
            s.AutomationDiscountPct = (1.0 - discountMult) * 100.0;
            s.TotalCashCost = totalCash;
            if (_m.Cash < 0) s.Warnings.Add("자금이 마이너스입니다.");

            // 2) 제품 월별 매출/이용자/데이터 (비용과 같은 틱에서 정산 — Godot 시그널 순서 quirk 정리)
            _p.ApplyMonthly(s);

            // 3) 자동화 월별 보너스
            _a.ApplyMonthly();

            // 3.5) 런 모디파이어 월간 효과 — 활성 태그의 tag_effects 합산 (feat-007 블록 #2). 표준 런 태그는 효과 0.
            ApplyRunModifierMonthly();

            // 3.6) 산업 시너지/콤보 월간 효과 — 도메인 포트폴리오 보상 (feat-013 #1, React 동치). 미활성이면 효과 0.
            IndustrySynergyService.ApplyMonthly(_m, _c, _r);

            // 3.7) 사무실 월간 효과 (feat-014 #2) — 1단계 차고는 효과 없음 = 기준선 보존.
            OfficeService.ApplyOfficeMonthly(_m, _c, _r);

            // 4) 화제성 감쇠
            if (_m.Hype > 0) _r.Add(ResourceId.Hype, -b.monthlyHypeDecay);

            // 5) 신뢰 회복 (임계값 미만일 때)
            if (_m.Trust < b.trustRecoveryThreshold) _r.Add(ResourceId.Trust, b.trustRecoveryAmount);

            // 6) 월 카운터 증가
            _m.CurrentMonth += 1;

            // 6.2) 연중 세계 이벤트 — 시드 파생 스케줄 도래분 발동 (feat-007 블록 #3, React applyDueWorldEvents 대응)
            s.WorldEventTitles = WorldEventService.ApplyDue(_m, _c, _r);

            // 6.3) 주가 변동 (feat-015 #4) — 상장 기업만. 신뢰 드리프트 + 시드 노이즈로 매월 결정론 변동.
            IpoService.ApplyMonthlyStock(_m, _c);

            // 6.5) 경쟁사 시장 진행 — 진입/성장/점유율/히스토리 (additive, 자원·승패 계산에 영향 없음)
            if (_market != null) _market.AdvanceCompetitors();

            // 7) 회사 단계 승급
            _s.CheckAdvancement(s);

            // 8) 승패 판정
            CheckGameOver(s, b);
            CheckWin(s, b);

            // 9) 신호
            GameEvents.RaiseMonthAdvanced(_m.CurrentMonth);
            GameEvents.RaiseResourcesUpdated();
            return s;
        }

        void ApplyRunModifierMonthly()
        {
            if (_m.RunModifiers == null || _c == null) return;

            var tags = _m.RunModifiers.Tags;
            var cfg = _c.runTagEffects;
            if (tags != null && cfg != null)
                foreach (var tag in tags)
                {
                    var fx = cfg.GetEffect(tag);
                    if (fx == null) continue;
                    foreach (var e in fx.monthlyEffects) _r.Add(e.resource, e.amount);
                }

            // 난이도 헤드윈드 (feat-008 #1) — story/standard는 빈 헤드윈드라 효과 0.
            var tier = _c.GetDifficultyTier(_m.RunModifiers.ChallengeTier);
            if (tier != null)
                foreach (var e in tier.monthlyHeadwind) _r.Add(e.resource, e.amount);

            // 파생 아키타입 월간 보너스 (feat-008 #2) — 표준 런 태그로는 아무 아키타입도 파생되지 않아 효과 0.
            foreach (var e in ArchetypeService.GetMonthlyEffects(_m.RunModifiers, _c))
                _r.Add(e.resource, e.amount);
        }

        void CheckGameOver(MonthSummary s, BalanceConfig b)
        {
            if (_m.Cash < b.gameOverCashThreshold && _m.Trust < b.gameOverTrustThreshold)
            {
                s.GameOver = true;
                s.Outcome = "자금과 신뢰가 한계 아래로 떨어졌습니다.";
            }
        }

        void CheckWin(MonthSummary s, BalanceConfig b)
        {
            if (_m.Users >= b.successUsersThreshold)
            {
                s.GameWon = true;
                s.Outcome = "이용자 목표를 달성했습니다!";
            }
            else if (_m.Cash >= b.successCashThreshold)
            {
                s.GameWon = true;
                s.Outcome = "자금 목표를 달성했습니다!";
            }
            else if (_m.Automation >= b.successAutomationThreshold && _m.ActiveProducts.Count >= b.successMinProducts)
            {
                s.GameWon = true;
                s.Outcome = "자동화와 제품 포트폴리오 목표를 달성했습니다!";
            }
        }
    }
}

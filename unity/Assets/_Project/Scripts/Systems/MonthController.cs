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
            double autoReduction = _m.Automation * b.automationCostReductionPerPoint;
            double discountMult = System.Math.Max(0.0, 1.0 - autoReduction);
            double totalCash = (baseCost + salaryCost) * discountMult + computeCost;
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

            // 4) 화제성 감쇠
            if (_m.Hype > 0) _r.Add(ResourceId.Hype, -b.monthlyHypeDecay);

            // 5) 신뢰 회복 (임계값 미만일 때)
            if (_m.Trust < b.trustRecoveryThreshold) _r.Add(ResourceId.Trust, b.trustRecoveryAmount);

            // 6) 월 카운터 증가
            _m.CurrentMonth += 1;

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

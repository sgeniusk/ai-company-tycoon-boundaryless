// 전역 밸런스 상수 (balance.json 대응). Godot 시스템이 쓰는 키는 명명 필드로, 나머지(staff_aftermath_* 등)는 extra로 보관한다.
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "BalanceConfig", menuName = "AICT/Balance Config")]
    public class BalanceConfig : ScriptableObject
    {
        public double baseMonthlyCashCost = 400;
        public double salaryPerTalent = 600;
        public double computeCostPer1000Users = 40;
        public double monthlyHypeDecay = 2;
        public double trustRecoveryThreshold = 50;
        public double trustRecoveryAmount = 1;
        public double growthRateBase = 1.0;
        public double hypeGrowthMultiplier = 1.3;
        public double trustMultiplierHighThreshold = 70;
        public double trustMultiplierLowThreshold = 30;
        public double trustEnterpriseBonus = 1.5;
        public double trustLowPenalty = 0.5;
        public double automationCostReductionPerPoint = 0.005;
        public double gameOverCashThreshold = -15000;
        public double gameOverTrustThreshold = 10;
        public double successUsersThreshold = 100000;
        public double successCashThreshold = 150000;
        public double successAutomationThreshold = 60;
        public int successMinProducts = 4;
        public double eventTriggerChance = 0.6;

        // balance.json의 기타 키를 위한 일반 보관소.
        public List<Threshold> extra = new List<Threshold>();
    }
}

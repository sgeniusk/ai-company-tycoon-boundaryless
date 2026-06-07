// min_* 임계값 조건을 GameModel 상태로 평가한다 (Godot conditions/requirements has() 체크 대응).
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public static class ThresholdEval
    {
        public static bool Meets(GameModel m, IEnumerable<Threshold> thresholds)
        {
            if (thresholds == null) return true;
            foreach (var t in thresholds)
                if (!MeetsOne(m, t.key, t.value)) return false;
            return true;
        }

        static bool MeetsOne(GameModel m, string key, double v)
        {
            switch (key)
            {
                case "min_month": return m.CurrentMonth >= v;
                case "min_products": return m.ActiveProducts.Count >= v;
                case "min_users": return m.Users >= v;
                case "min_trust": return m.Trust >= v;
                case "min_hype": return m.Hype >= v;
                case "min_talent": return m.Talent >= v;
                case "min_data": return m.Data >= v;
                case "min_cash": return m.Cash >= v;
                case "min_domains": return m.UnlockedDomains.Count >= v;
                case "min_automation": return m.Automation >= v;
                case "min_capabilities": return m.Capabilities.Count >= v;
                default: return true; // 미지의 키는 무시한다(Godot has() 부재 시 통과와 동일)
            }
        }
    }
}

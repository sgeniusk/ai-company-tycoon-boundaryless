// 시설 — 사무실 확장 구매 + 본사 이전 (feat-014 #2). 정원·월간 효과·비용 모디파이어의 단일 진실.
// 사무실 단계는 구매형(OfficeLevel), 본사는 이전형(LocationId). 구세이브는 SaveService에서 성급 파생으로 마이그레이션.
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class OfficeService
    {
        public const string DefaultLocationId = "rural_garage";

        readonly GameModel _m;
        readonly DataCatalog _c;
        readonly ResourceService _r;

        public OfficeService(GameModel m, DataCatalog c, ResourceService r) { _m = m; _c = c; _r = r; }

        // ---- 사무실 확장 ----

        public OfficeExpansionDef GetCurrent()
        {
            int level = _m.OfficeLevel < 1 ? 1 : _m.OfficeLevel;
            OfficeExpansionDef best = null;
            foreach (var o in _c.officeExpansions)
                if (o != null && o.level <= level && (best == null || o.level > best.level)) best = o;
            return best;
        }

        public OfficeExpansionDef GetNext()
        {
            int level = _m.OfficeLevel < 1 ? 1 : _m.OfficeLevel;
            OfficeExpansionDef next = null;
            foreach (var o in _c.officeExpansions)
                if (o != null && o.level > level && (next == null || o.level < next.level)) next = o;
            return next;
        }

        public string GetExpandLockReason()
        {
            var next = GetNext();
            if (next == null) return "최대 단계입니다.";
            if (!ThresholdEval.Meets(_m, _c, next.unlockRequirements)) return "요건 미충족";
            if (!_r.CanAfford(next.cost)) return "자금 부족";
            return null;
        }

        public bool CanExpand() => GetExpandLockReason() == null;

        public bool Expand()
        {
            var next = GetNext();
            if (next == null || !CanExpand()) return false;
            if (!_r.SpendMultiple(next.cost)) return false;
            _m.OfficeLevel = next.level;
            GameEvents.RaiseResourcesUpdated();
            return true;
        }

        // ---- 본사 이전 ----

        public CompanyLocationDef GetLocation()
        {
            var id = string.IsNullOrEmpty(_m.LocationId) ? DefaultLocationId : _m.LocationId;
            foreach (var l in _c.companyLocations)
                if (l != null && l.id == id) return l;
            return null;
        }

        public string GetRelocateLockReason(CompanyLocationDef target)
        {
            if (target == null) return "목적지가 없습니다.";
            var current = GetLocation();
            if (current != null && current.id == target.id) return "현재 본사입니다.";
            if (!ThresholdEval.Meets(_m, _c, target.unlockRequirements)) return "요건 미충족";
            if (!_r.CanAfford(target.cost)) return "자금 부족";
            return null;
        }

        public bool CanRelocate(CompanyLocationDef target) => GetRelocateLockReason(target) == null;

        public bool Relocate(CompanyLocationDef target)
        {
            if (!CanRelocate(target)) return false;
            if (!_r.SpendMultiple(target.cost)) return false;
            _m.LocationId = target.id;
            GameEvents.RaiseResourcesUpdated();
            return true;
        }

        // ---- 게이팅 질의 ----

        // 꾸미기 해금 — 차고를 벗어나 첫 사무실 확장(레벨2+)을 한 뒤 열린다 (feat-031 — 시연용 노출과 조건 해금 분리).
        public static bool IsDecorationUnlocked(GameModel m)
        {
            int level = m != null && m.OfficeLevel > 0 ? m.OfficeLevel : 1;
            return level >= 2;
        }

        // 오피스 구성 밀도 티어 — 0(솔로 차고·휑하게) / 1(팀 형성) / 2(가득). 성장이 화면에 보이게 (feat-031).
        public static int OfficeFillTier(GameModel m)
        {
            int talent = (int)(m != null ? m.Get(ResourceId.Talent) : 0);
            int level = m != null && m.OfficeLevel > 0 ? m.OfficeLevel : 1;
            if (level >= 4 || talent >= 8) return 2;
            if (level >= 2 || talent >= 3) return 1;
            return 0;
        }

        // ---- 월 정산 훅 ----

        // 위치 고정비 모디파이어 (React locationCostModifier 동치). 데이터 없으면 1.0.
        public static double GetLocationCostModifier(GameModel m, DataCatalog c)
        {
            if (c == null || c.companyLocations == null) return 1.0;
            var id = string.IsNullOrEmpty(m.LocationId) ? DefaultLocationId : m.LocationId;
            foreach (var l in c.companyLocations)
                if (l != null && l.id == id) return l.monthlyCostModifier;
            return 1.0;
        }

        // 사무실 월간 효과 — 상위 사무실의 보너스 (1단계 차고는 효과 없음 = 기준선 보존).
        public static void ApplyOfficeMonthly(GameModel m, DataCatalog c, ResourceService r)
        {
            if (c == null || c.officeExpansions == null) return;
            int level = m.OfficeLevel < 1 ? 1 : m.OfficeLevel;
            OfficeExpansionDef best = null;
            foreach (var o in c.officeExpansions)
                if (o != null && o.level <= level && (best == null || o.level > best.level)) best = o;
            if (best == null || best.monthlyEffects == null) return;
            foreach (var e in best.monthlyEffects)
                r.Add(e.resource, e.amount);
        }
    }
}

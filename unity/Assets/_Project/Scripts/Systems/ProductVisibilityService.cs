// 제품·도메인 노출 상태 머신 — 숨김→???티저→실명→해금→출시의 발견 사다리 (feat-012, derive-only, 세이브 필드 없음).
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    // 우선순위 비교(>=)에 쓰므로 순서를 바꾸지 않는다 — Hidden < Teaser < Revealed < Unlocked < Launched.
    public enum VisibilityState
    {
        Hidden = 0,
        Teaser = 1,
        Revealed = 2,
        Unlocked = 3,
        Launched = 4
    }

    public class ProductVisibilityService
    {
        // 티저 근접 임계 — 해금 요구 레벨에서 이만큼 모자라도 ???로 보인다. 밸런스 패스(#4) 조정 대상.
        public const int TeaserProximityLevels = 2;
        // teaser 필드가 비어 있는 기존 제품의 기본 떡밥.
        public const string DefaultTeaser = "베일에 싸인 프로젝트입니다.";

        readonly GameModel _m;
        readonly DataCatalog _c;

        public ProductVisibilityService(GameModel m, DataCatalog c) { _m = m; _c = c; }

        int CapLevel(string id) => _m.Capabilities.TryGetValue(id, out var lv) ? lv : 0;

        // 도메인 상태 — Unlocked / Teaser(근접) / Hidden. 빈 도메인은 게이트 없음으로 취급한다.
        public VisibilityState GetDomainState(string domainId)
        {
            if (string.IsNullOrEmpty(domainId)) return VisibilityState.Unlocked;
            if (_m.UnlockedDomains.Contains(domainId)) return VisibilityState.Unlocked;
            var d = _c.GetDomain(domainId);
            if (d == null) return VisibilityState.Hidden;
            return IsNearUnlock(d) ? VisibilityState.Teaser : VisibilityState.Hidden;
        }

        // 근접 판정 — 요구 능력 중 하나라도 (이미 보유 lv>=1) && (요구 레벨 - 임계 이내).
        // 보유 가드가 없으면 요구 레벨 1~2짜리 도메인이 게임 시작부터 전부 ???로 떠 "입구는 좁게"가 깨진다.
        bool IsNearUnlock(DomainDef d)
        {
            if (d.unlockRequirements == null) return false;
            foreach (var req in d.unlockRequirements)
            {
                int have = CapLevel(req.capabilityId);
                if (have >= 1 && have >= req.level - TeaserProximityLevels) return true;
            }
            return false;
        }

        public VisibilityState GetState(ProductDef p)
        {
            if (p == null) return VisibilityState.Hidden;
            if (_m.ActiveProducts.Contains(p.id)) return VisibilityState.Launched;

            var domainState = GetDomainState(p.domain);
            if (domainState != VisibilityState.Unlocked)
                return domainState == VisibilityState.Teaser ? VisibilityState.Teaser : VisibilityState.Hidden;

            return RequirementsMet(p) ? VisibilityState.Unlocked : VisibilityState.Revealed;
        }

        // 해금 요건 — 요구 능력 충족 && 선행 제품 전부 출시 (신뢰/비용은 출시 버튼 단계에서 본다).
        bool RequirementsMet(ProductDef p)
        {
            if (p.requiredCapabilities != null)
                foreach (var rc in p.requiredCapabilities)
                    if (CapLevel(rc.capabilityId) < rc.level) return false;
            if (p.prerequisiteProducts != null)
                foreach (var pre in p.prerequisiteProducts)
                    if (!string.IsNullOrEmpty(pre) && !_m.ActiveProducts.Contains(pre)) return false;
            return true;
        }

        public string GetTeaserText(ProductDef p)
            => p != null && !string.IsNullOrEmpty(p.teaser) ? p.teaser : DefaultTeaser;

        // 티저 힌트 — 근접 판정을 통과시킨 능력 중 해금까지 가장 가까운 것의 id (없으면 null).
        public string GetTeaserHintCapability(string domainId)
        {
            var d = _c.GetDomain(domainId);
            if (d == null || d.unlockRequirements == null) return null;
            string best = null;
            int bestGap = int.MaxValue;
            foreach (var req in d.unlockRequirements)
            {
                int have = CapLevel(req.capabilityId);
                if (have < 1 || have < req.level - TeaserProximityLevels) continue;
                int gap = req.level - have;
                if (gap < bestGap) { bestGap = gap; best = req.capabilityId; }
            }
            return best;
        }

        // 도메인 섹션 헤더용 — 실명 공개(Revealed 이상) 제품 수.
        public int CountDiscovered(string domainId)
        {
            int n = 0;
            foreach (var p in _c.products)
                if (p != null && p.domain == domainId && GetState(p) >= VisibilityState.Revealed) n++;
            return n;
        }

        // 도메인 섹션 헤더용 — 숨김 포함 전체 제품 수. "아직 못 본 게 있다"를 수치로 보여준다.
        public int CountTotal(string domainId)
        {
            int n = 0;
            foreach (var p in _c.products)
                if (p != null && p.domain == domainId) n++;
            return n;
        }

        // 팝업 푸터용 — 리스트에 아예 안 보이는(Hidden) 제품 총수.
        public int CountHiddenProducts()
        {
            int n = 0;
            foreach (var p in _c.products)
                if (p != null && GetState(p) == VisibilityState.Hidden) n++;
            return n;
        }

        // 팝업 푸터용 — 숨김 상태 도메인 수 (미지의 분야).
        public int CountHiddenDomains()
        {
            int n = 0;
            foreach (var d in _c.domains)
                if (d != null && GetDomainState(d.id) == VisibilityState.Hidden) n++;
            return n;
        }
    }
}

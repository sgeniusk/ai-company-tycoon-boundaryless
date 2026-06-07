// 시스템 간 약결합 신호 허브 (Godot EventBus.gd 대응). 코어는 이 정적 허브로 통신하고 UI는 여기 구독한다.
// 주의 — 정적 이벤트라 구독 해제를 직접 관리해야 한다. UI 경계는 추후 ScriptableObject 이벤트 채널로 옮길 수 있다.
using System;

namespace AICompanyTycoon.Core
{
    public static class GameEvents
    {
        public static event Action<ResourceId, double, double> ResourceChanged;
        public static event Action ResourcesUpdated;
        public static event Action<int> MonthAdvanced;
        public static event Action<string> CompanyStageChanged;
        public static event Action<string> ProductLaunched;
        public static event Action<string> DomainUnlocked;
        public static event Action<string, int> CapabilityUpgraded;
        public static event Action<string> LogMessage;

        public static void RaiseResourceChanged(ResourceId id, double oldValue, double newValue) => ResourceChanged?.Invoke(id, oldValue, newValue);
        public static void RaiseResourcesUpdated() => ResourcesUpdated?.Invoke();
        public static void RaiseMonthAdvanced(int month) => MonthAdvanced?.Invoke(month);
        public static void RaiseCompanyStageChanged(string stageId) => CompanyStageChanged?.Invoke(stageId);
        public static void RaiseProductLaunched(string productId) => ProductLaunched?.Invoke(productId);
        public static void RaiseDomainUnlocked(string domainId) => DomainUnlocked?.Invoke(domainId);
        public static void RaiseCapabilityUpgraded(string capabilityId, int level) => CapabilityUpgraded?.Invoke(capabilityId, level);
        public static void RaiseLog(string message) => LogMessage?.Invoke(message);
    }
}

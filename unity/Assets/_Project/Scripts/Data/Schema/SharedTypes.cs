// 데이터 SO들이 공유하는 직렬화 가능 타입. Godot JSON의 중첩 딕셔너리/배열을 Unity 직렬화 형태로 옮긴다.
using System;
using System.Collections.Generic;
using AICompanyTycoon.Core;

namespace AICompanyTycoon.Data
{
    // 자원 키-값 (launch_cost / effects / effects_per_level 항목 대응).
    [Serializable]
    public struct ResourceAmount
    {
        public ResourceId resource;
        public double amount;
    }

    // 비용 묶음 한 단계 (capabilities.upgrade_costs 배열의 한 항목). Unity가 List<List<>>를 직렬화 못 해 래핑한다.
    [Serializable]
    public class CostTier
    {
        public List<ResourceAmount> amounts = new List<ResourceAmount>();
    }

    // 능력 레벨 요구 (required_capabilities / unlock_requirements 항목 대응).
    [Serializable]
    public struct CapabilityLevel
    {
        public string capabilityId;
        public int level;
    }

    // 능력 레벨 도달 시 도메인 해금 (capabilities.unlocks_domains 항목 대응).
    [Serializable]
    public struct DomainUnlock
    {
        public int level;
        public string domainId;
    }

    // 임계값 조건 (conditions / requirements의 min_* 키 대응). 키는 동적 어휘라 문자열로 둔다.
    [Serializable]
    public struct Threshold
    {
        public string key;   // "min_month", "min_users", "min_trust", ...
        public double value;
    }
}

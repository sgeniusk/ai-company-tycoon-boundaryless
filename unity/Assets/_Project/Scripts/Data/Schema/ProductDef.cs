// 제품 정의 (Godot products.json + ProductSystem.gd 사용 필드 대응).
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "ProductDef", menuName = "AICT/Product Definition")]
    public class ProductDef : ScriptableObject
    {
        public string id;
        public string displayName;
        [TextArea] public string description;
        public string domain;
        public List<CapabilityLevel> requiredCapabilities = new List<CapabilityLevel>();
        public double trustRequirement;
        public List<ResourceAmount> launchCost = new List<ResourceAmount>();
        public double baseRevenue;
        public double baseUsersPerMonth;
        public double dataGeneratedPerMonth;
        public double computePer1000Users;
        public double hypeOnLaunch;
        public int level = 1;
        public List<string> tags = new List<string>();
        // feat-012 테크트리 — ??? 상태에서 보여줄 떡밥 한 줄 (없으면 기본 문구).
        [TextArea] public string teaser;
        // feat-012 테크트리 — 출시 선행 제품 id 목록 (전부 출시돼야 해금).
        public List<string> prerequisiteProducts = new List<string>();
        // feat-012 테크트리 — 트리 깊이 (1 차고 ~ 4 미래). 정렬·검증용.
        public int tier = 1;
        // 제품 레벨업 (React 동치, feat-012 #4) — 최대 레벨과 강화 비용 배수 (launch_cost * 배수 * 현재레벨).
        public int maxLevel = 1;
        public double upgradeCostMultiplier = 1.5;
    }
}

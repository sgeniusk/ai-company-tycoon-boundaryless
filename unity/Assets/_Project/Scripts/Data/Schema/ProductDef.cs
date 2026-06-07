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
    }
}

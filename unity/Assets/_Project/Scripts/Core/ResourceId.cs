// 자원 식별자 enum + 데이터 JSON 문자열 키 매핑 (Godot resources.json 호환).
namespace AICompanyTycoon.Core
{
    public enum ResourceId
    {
        Cash,
        Users,
        Compute,
        Data,
        Talent,
        Trust,
        Hype,
        Automation
    }

    public static class ResourceIds
    {
        public static readonly ResourceId[] All =
        {
            ResourceId.Cash, ResourceId.Users, ResourceId.Compute, ResourceId.Data,
            ResourceId.Talent, ResourceId.Trust, ResourceId.Hype, ResourceId.Automation
        };

        // enum -> 데이터 키 ("cash", "users", ...)
        public static string ToKey(ResourceId id)
        {
            switch (id)
            {
                case ResourceId.Cash: return "cash";
                case ResourceId.Users: return "users";
                case ResourceId.Compute: return "compute";
                case ResourceId.Data: return "data";
                case ResourceId.Talent: return "talent";
                case ResourceId.Trust: return "trust";
                case ResourceId.Hype: return "hype";
                case ResourceId.Automation: return "automation";
                default: return id.ToString().ToLowerInvariant();
            }
        }

        // 데이터 키 -> enum. 미지의 키는 false.
        public static bool TryParse(string key, out ResourceId id)
        {
            switch (key)
            {
                case "cash": id = ResourceId.Cash; return true;
                case "users": id = ResourceId.Users; return true;
                case "compute": id = ResourceId.Compute; return true;
                case "data": id = ResourceId.Data; return true;
                case "talent": id = ResourceId.Talent; return true;
                case "trust": id = ResourceId.Trust; return true;
                case "hype": id = ResourceId.Hype; return true;
                case "automation": id = ResourceId.Automation; return true;
                default: id = default; return false;
            }
        }
    }
}

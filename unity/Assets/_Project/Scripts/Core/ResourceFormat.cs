// 자원 값 표시 포맷 (Godot ResourcePanel._format_value 대응). UI 비의존 순수 문자열.
using System.Globalization;

namespace AICompanyTycoon.Core
{
    public static class ResourceFormat
    {
        static readonly CultureInfo Inv = CultureInfo.InvariantCulture;

        public static string Format(ResourceId id, double value)
        {
            switch (id)
            {
                case ResourceId.Cash:
                    if (value >= 1_000_000) return "$" + (value / 1_000_000.0).ToString("0.0", Inv) + "M";
                    if (value >= 1000) return "$" + (value / 1000.0).ToString("0.0", Inv) + "K";
                    return "$" + ((long)value).ToString(Inv);
                case ResourceId.Users:
                    if (value >= 1_000_000) return (value / 1_000_000.0).ToString("0.0", Inv) + "M";
                    if (value >= 1000) return (value / 1000.0).ToString("0.0", Inv) + "K";
                    return ((long)value).ToString(Inv);
                case ResourceId.Trust:
                case ResourceId.Hype:
                case ResourceId.Automation:
                    return ((long)value) + " / 100";
                default:
                    return ((long)value).ToString(Inv);
            }
        }
    }
}

// 카이로소프트식 밝은 2D 테마 색을 한 곳에 모은 팔레트입니다. UI 곳곳의 하드코딩 색을 이 상수로 대체한다.
using UnityEngine;

namespace AICompanyTycoon.UI
{
    public static class UiTheme
    {
        // 배경/면 — 따뜻한 크림 사무실 톤
        public static readonly Color ScreenBg = Hex("e7dcc1");
        public static readonly Color HeaderBg = Hex("3f8a7c");
        public static readonly Color HeaderText = Hex("fdf6e3");
        public static readonly Color PanelBg = Hex("f6eeda");
        public static readonly Color HudBg = Hex("f1e7cd");
        public static readonly Color CardBg = Hex("fffdf6");

        // 버튼 — 채도 있는 그린
        public static readonly Color Button = Hex("57a468");
        public static readonly Color ButtonHover = Hex("69b87a");
        public static readonly Color ButtonPressed = Hex("478a56");
        public static readonly Color ButtonDisabled = Hex("c4bca9");
        public static readonly Color ButtonText = Hex("fdfaf0");

        // 텍스트 — 밝은 배경 위 진한 브라운
        public static readonly Color TextPrimary = Hex("3b3225");
        public static readonly Color TextSecondary = Hex("6f6249");

        // 강조 — 탭 활성/골드
        public static readonly Color TabActive = Hex("e08a3c");
        public static readonly Color TabInactive = Hex("cdbf9e");

        // 모달 뒤 어둡게 까는 막
        public static readonly Color ModalScrim = new Color(0.16f, 0.12f, 0.07f, 0.68f);

        static Color Hex(string hex)
        {
            return new Color(
                int.Parse(hex.Substring(0, 2), System.Globalization.NumberStyles.HexNumber) / 255f,
                int.Parse(hex.Substring(2, 2), System.Globalization.NumberStyles.HexNumber) / 255f,
                int.Parse(hex.Substring(4, 2), System.Globalization.NumberStyles.HexNumber) / 255f,
                1f);
        }
    }
}

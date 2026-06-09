// 카이로소프트식 밝은 2D 테마 색을 한 곳에 모은 팔레트입니다. UI 곳곳의 하드코딩 색을 이 상수로 대체한다.
using UnityEngine;

namespace AICompanyTycoon.UI
{
    public static class UiTheme
    {
        // 배경/면 — 따뜻한 크림 사무실 톤. 패널은 반투명이라 office 배경이 비친다.
        public static readonly Color ScreenBg = Hex("e7dcc1");
        public static readonly Color HeaderBg = Hex("3f8a7c", 0.94f);
        public static readonly Color HeaderText = Hex("fdf6e3");
        public static readonly Color PanelBg = Hex("f6eeda", 0.80f);
        public static readonly Color HudBg = Hex("f1e7cd", 0.82f);
        public static readonly Color CardBg = Hex("fffdf6", 0.88f);

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

        // 전광판 (CD-1 LED) — 다크 그린 패널 + 네온 토큰
        public static readonly Color ScoreboardBg = Hex("101f1d", 0.95f);
        public static readonly Color ScoreboardTag = Hex("5fd2b4");
        public static readonly Color ScoreboardRank = Hex("f2a93b");
        public static readonly Color ScoreboardMarquee = Hex("f2cd5e");
        public static readonly Color ScoreboardLive = Hex("dc3f52");
        public static readonly Color ScoreboardLiveText = Hex("fdf6e3");
        public static readonly Color DeltaUp = Hex("56d07a");
        public static readonly Color DeltaDown = Hex("f07183");
        public static readonly Color DeltaFlat = Hex("9bb0a6");

        static Color Hex(string hex, float a = 1f)
        {
            return new Color(
                int.Parse(hex.Substring(0, 2), System.Globalization.NumberStyles.HexNumber) / 255f,
                int.Parse(hex.Substring(2, 2), System.Globalization.NumberStyles.HexNumber) / 255f,
                int.Parse(hex.Substring(4, 2), System.Globalization.NumberStyles.HexNumber) / 255f,
                a);
        }
    }
}

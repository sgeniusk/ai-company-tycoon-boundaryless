// 카이로소프트식 밝은 2D 테마 색을 한 곳에 모은 팔레트입니다. UI 곳곳의 하드코딩 색을 이 상수로 대체한다.
using UnityEngine;

namespace AICompanyTycoon.UI
{
    public static class UiTheme
    {
        // 배경/면 — 따뜻한 크림 사무실 톤. 패널은 반투명이라 office 배경이 비친다.
        // 가독성 패스(feat-009) — 알파를 올려 바쁜 office 위 텍스트 대비 확보. office-first는 씬 영역이 담당.
        public static readonly Color ScreenBg = Hex("e7dcc1");
        public static readonly Color HeaderBg = Hex("3f8a7c", 0.96f);
        public static readonly Color HeaderText = Hex("fdf6e3");
        public static readonly Color PanelBg = Hex("f6eeda", 0.93f);
        public static readonly Color HudBg = Hex("f1e7cd", 0.92f);
        public static readonly Color CardBg = Hex("fffdf6", 0.96f);

        // 모바일 가독 폰트 위계 (1080폭 기준, 실폰 ≈ px/3 pt). 최소 26 미만 금지.
        public const int FontCaption = 26;
        public const int FontBody = 30;
        public const int FontEmphasis = 34;
        public const int FontTitle = 40;
        public const int FontDisplay = 52;

        // 버튼 — 채도 있는 그린
        public static readonly Color Button = Hex("57a468");
        public static readonly Color ButtonHover = Hex("69b87a");
        public static readonly Color ButtonPressed = Hex("478a56");
        public static readonly Color ButtonDisabled = Hex("c4bca9");
        public static readonly Color ButtonText = Hex("fdfaf0");

        // 텍스트 — 밝은 배경 위 진한 브라운. Secondary도 가독 대비를 위해 충분히 어둡게.
        public static readonly Color TextPrimary = Hex("32291c");
        public static readonly Color TextSecondary = Hex("5b4f38");

        // 강조 — 탭 활성/골드
        public static readonly Color TabActive = Hex("e08a3c");
        public static readonly Color TabInactive = Hex("cdbf9e");

        // 모달 뒤 어둡게 까는 막
        public static readonly Color ModalScrim = new Color(0.16f, 0.12f, 0.07f, 0.68f);

        // feat-012 테크트리 — 제품 팝업 도메인 섹션 헤더와 ??? 티저 카드
        public static readonly Color SectionBg = Hex("8a6f4d", 0.95f);
        public static readonly Color SectionTeaserBg = Hex("4a4138", 0.95f);
        public static readonly Color TeaserCardBg = Hex("d9cfba", 0.96f);
        public static readonly Color TeaserText = Hex("6b5d45");

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

        // 코어3 자원 칩 HUD (CD-2) — 어두운 칩 + 청록 보더, 값 색(cash 초록/나머지 골드/임계 빨강)
        public static readonly Color HudChipBg = Hex("111e1a", 0.86f);
        public static readonly Color HudChipBorder = Hex("5fd2b4", 0.85f);
        public static readonly Color ChipCashText = Hex("7fe0a0");
        public static readonly Color ChipGoldText = Hex("f2cd5e");
        public static readonly Color ChipCritical = Hex("e85a4a");
        public static readonly Color CrestGold = Hex("f2a93b");
        public static readonly Color GoalAccent = Hex("f2a93b");

        // 하단 도크 (CD-3 office-first 내비)
        public static readonly Color DockBg = Hex("24332f", 0.96f);

        // 가이던스 FAB 톤 (feat-009) — 제안 성격별 색. primary는 Button 그린 재사용.
        public static readonly Color FabWarning = Hex("d65745");
        public static readonly Color FabSteady = Hex("3e7ba6");

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

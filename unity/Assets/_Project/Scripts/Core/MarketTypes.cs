// 경쟁사·시장 점유율·랭킹 런타임 타입 (simulation.ts CompetitorState/MarketRanking 대응). 순수 C#, 헤드리스.
using System;

namespace AICompanyTycoon.Core
{
    [Serializable]
    public class CompetitorState
    {
        public string id;
        public double score;
        public int marketShare; // 0–100 (반올림)
        public double momentum;
    }

    [Serializable]
    public class MarketShareEntry
    {
        public int month;
        public int player;        // 플레이어 점유율 %
        public int topRivalShare; // 최상위 라이벌 점유율 %
        public string topRivalId;
    }

    // 전광판/랭킹 계산용 정렬 항목 (player + 경쟁사).
    public struct MarketRanking
    {
        public string id;
        public int score;
        public int marketShare;
        public bool isPlayer;
    }
}

// 경쟁사 정의 (competitors.json + 시장 시뮬 대응). 표시명·태그라인은 임포트 시 locales/ko.json에서 해석.
using System.Collections.Generic;
using UnityEngine;

namespace AICompanyTycoon.Data
{
    [CreateAssetMenu(fileName = "CompetitorDef", menuName = "AICT/Competitor Definition")]
    public class CompetitorDef : ScriptableObject
    {
        public string id;
        public string displayName;
        [TextArea] public string tagline;
        public List<string> focusDomains = new List<string>();
        public string color; // 브랜드 색 hex
        public double startingScore;
        public int startingMarketShare;
        public double monthlyGrowth;
        public double aggression;
        public int entryMonth = 1;  // 등장 월 (없으면 1=시작부터)
        public string rivalTier;    // initial / annual_challenger / late_boss
    }
}

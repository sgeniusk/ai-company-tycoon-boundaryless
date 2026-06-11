// 런타임 게임 상태의 단일 진실 소스 (Godot GameState.gd 대응). MonoBehaviour가 아니라 순수 C#이라 헤드리스 테스트가 된다.
using System;
using System.Collections.Generic;

namespace AICompanyTycoon.Core
{
    [Serializable]
    public class GameModel
    {
        // 자원 8종
        public double Cash;
        public double Users;
        public double Compute;
        public double Data;
        public double Talent;
        public double Trust;
        public double Hype;
        public double Automation;

        // 진행
        public int CurrentMonth = 1;
        public string CompanyStageId = "garage_prototype";

        // 해금/보유
        public List<string> UnlockedDomains = new List<string>();
        public Dictionary<string, int> Capabilities = new Dictionary<string, int>();
        public List<string> ActiveProducts = new List<string>();
        // 제품 레벨 (React productLevels 동치, feat-012 #4). 출시 제품의 기본 레벨은 1 (사전에 없으면 1로 취급).
        public Dictionary<string, int> ProductLevels = new Dictionary<string, int>();
        public List<string> PurchasedUpgrades = new List<string>();
        public List<string> PurchasedAutomation = new List<string>();
        public List<string> TriggeredEvents = new List<string>();

        // 시장 — 경쟁사 상태 + 점유율 히스토리 (전국 랭킹 전광판 파생용, feat-006 Block A)
        public List<CompetitorState> CompetitorStates = new List<CompetitorState>();
        public List<MarketShareEntry> MarketShareHistory = new List<MarketShareEntry>();

        // 런 모디파이어 — 이번 런의 굴린 세계 (feat-007 블록 #1). 기본 런은 효과 0.
        public RunModifiersState RunModifiers = new RunModifiersState();

        // 발동된 연중 세계 이벤트 id (최신이 앞, feat-007 블록 #3 중복 방지)
        public List<string> WorldEventHistory = new List<string>();

        public double Get(ResourceId id)
        {
            switch (id)
            {
                case ResourceId.Cash: return Cash;
                case ResourceId.Users: return Users;
                case ResourceId.Compute: return Compute;
                case ResourceId.Data: return Data;
                case ResourceId.Talent: return Talent;
                case ResourceId.Trust: return Trust;
                case ResourceId.Hype: return Hype;
                case ResourceId.Automation: return Automation;
                default: return 0.0;
            }
        }

        public void Set(ResourceId id, double value)
        {
            switch (id)
            {
                case ResourceId.Cash: Cash = value; break;
                case ResourceId.Users: Users = value; break;
                case ResourceId.Compute: Compute = value; break;
                case ResourceId.Data: Data = value; break;
                case ResourceId.Talent: Talent = value; break;
                case ResourceId.Trust: Trust = value; break;
                case ResourceId.Hype: Hype = value; break;
                case ResourceId.Automation: Automation = value; break;
            }
        }
    }
}

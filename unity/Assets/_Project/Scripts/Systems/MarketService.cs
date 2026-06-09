// 경쟁사·시장 점유율·랭킹 헤드리스 서비스 (simulation.ts 시장 함수 이식). UnityEngine.UI 비의존.
using System;
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class MarketService
    {
        readonly GameModel _m;
        readonly DataCatalog _c;
        const int HistoryWindow = 24;

        public MarketService(GameModel m, DataCatalog c)
        {
            _m = m;
            _c = c;
        }

        // 진입월이 도래한 경쟁사로 상태를 초기화한다 (새 게임/구버전 세이브 복구).
        public void InitStates()
        {
            _m.CompetitorStates.Clear();
            if (_c != null && _c.competitors != null)
            {
                foreach (var def in _c.competitors)
                {
                    if (def != null && def.entryMonth <= _m.CurrentMonth)
                    {
                        _m.CompetitorStates.Add(NewState(def));
                    }
                }
            }

            _m.MarketShareHistory.Clear();
            RecalculateMarketShares();
        }

        static CompetitorState NewState(CompetitorDef def)
        {
            return new CompetitorState
            {
                id = def.id,
                score = def.startingScore,
                marketShare = def.startingMarketShare,
                momentum = 0,
            };
        }

        // 플레이어 경쟁 점수 (getPlayerCompetitiveScore 이식 — Unity 미보유 productProjects 항만 제외).
        public int PlayerCompetitiveScore()
        {
            int capabilitySum = 0;
            foreach (var kv in _m.Capabilities)
            {
                capabilitySum += kv.Value;
            }

            double raw = 18.0
                + _m.ActiveProducts.Count * 16.0
                + _m.Users / 700.0
                + _m.Hype * 0.45
                + _m.Trust * 0.35
                + _m.Automation * 0.5
                + capabilitySum * 4.0;
            return (int)Math.Round(raw);
        }

        public int PlayerMarketShare()
        {
            int playerScore = PlayerCompetitiveScore();
            double rivalScore = 0;
            foreach (var c in _m.CompetitorStates)
            {
                rivalScore += c.score;
            }

            double total = Math.Max(1.0, playerScore + rivalScore);
            return (int)Math.Round(playerScore / total * 100.0);
        }

        // 플레이어 + 경쟁사를 점유율 내림차순으로 정렬해 돌려준다.
        public List<MarketRanking> GetMarketRankings()
        {
            var list = new List<MarketRanking>
            {
                new MarketRanking
                {
                    id = "player",
                    score = PlayerCompetitiveScore(),
                    marketShare = PlayerMarketShare(),
                    isPlayer = true,
                },
            };

            foreach (var c in _m.CompetitorStates)
            {
                list.Add(new MarketRanking
                {
                    id = c.id,
                    score = (int)Math.Round(c.score),
                    marketShare = c.marketShare,
                    isPlayer = false,
                });
            }

            list.Sort((a, b) => b.marketShare.CompareTo(a.marketShare));
            return list;
        }

        // 월 진행 시 호출 — 진입 경쟁사 추가, 점수 성장, 점유율 재계산, 히스토리 적재. additive.
        public void AdvanceCompetitors()
        {
            // 진입월이 도래한 신규 경쟁사 합류
            if (_c != null && _c.competitors != null)
            {
                foreach (var def in _c.competitors)
                {
                    if (def != null && def.entryMonth <= _m.CurrentMonth && !_m.CompetitorStates.Exists(s => s.id == def.id))
                    {
                        _m.CompetitorStates.Add(NewState(def));
                    }
                }
            }

            // 플레이어 활성 제품 도메인 — 겹치면 경쟁사가 공격성만큼 더 성장
            var playerDomains = new HashSet<string>();
            foreach (var pid in _m.ActiveProducts)
            {
                var p = _c.GetProduct(pid);
                if (p != null && !string.IsNullOrEmpty(p.domain))
                {
                    playerDomains.Add(p.domain);
                }
            }

            foreach (var cs in _m.CompetitorStates)
            {
                var def = _c.GetCompetitor(cs.id);
                if (def == null)
                {
                    continue;
                }

                bool contested = def.focusDomains != null && def.focusDomains.Exists(d => playerDomains.Contains(d));
                double scoreGain = def.monthlyGrowth + cs.momentum + (contested ? def.aggression : 0.0);
                cs.score = Clamp(cs.score + scoreGain, 1, 999);
                cs.momentum = Clamp(cs.momentum * 0.65, -12, 12);
            }

            RecalculateMarketShares();
            PushHistory();
        }

        void RecalculateMarketShares()
        {
            int playerScore = PlayerCompetitiveScore();
            double total = playerScore;
            foreach (var c in _m.CompetitorStates)
            {
                total += c.score;
            }

            total = Math.Max(1.0, total);
            foreach (var c in _m.CompetitorStates)
            {
                c.marketShare = (int)Math.Round(c.score / total * 100.0);
            }
        }

        void PushHistory()
        {
            int playerShare = PlayerMarketShare();
            int topShare = 0;
            string topId = null;
            foreach (var c in _m.CompetitorStates)
            {
                if (c.marketShare > topShare)
                {
                    topShare = c.marketShare;
                    topId = c.id;
                }
            }

            _m.MarketShareHistory.Add(new MarketShareEntry
            {
                month = _m.CurrentMonth,
                player = playerShare,
                topRivalShare = topShare,
                topRivalId = topId,
            });

            int overflow = _m.MarketShareHistory.Count - HistoryWindow;
            if (overflow > 0)
            {
                _m.MarketShareHistory.RemoveRange(0, overflow);
            }
        }

        static double Clamp(double v, double lo, double hi)
        {
            return Math.Min(Math.Max(v, lo), hi);
        }
    }
}

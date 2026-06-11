// 운영 조달 — 채용 3택1(후보 중 선택 영입) + GPU 증설(연산력 팩) (feat-013 #1 → feat-014 #1 개편).
// 채용은 agent_types 후보 3명을 시드 결정론으로 제시하고, 고른 인재가 로스터에 들어가며 talent +1.
// 정원은 사무실 단계(hire_capacity)가 제한한다 — #1은 회사 성급에서 사무실 단계를 파생(interim), 구매는 #2.
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class RecruitService
    {
        public const int CandidateCount = 3;

        readonly GameModel _m;
        readonly DataCatalog _c;
        readonly ResourceService _r;

        public RecruitService(GameModel m, DataCatalog c, ResourceService r) { _m = m; _c = c; _r = r; }

        double GetExtra(string key, double fallback)
        {
            var balance = _c != null ? _c.balance : null;
            if (balance == null || balance.extra == null) return fallback;
            foreach (var t in balance.extra)
                if (t.key == key) return t.value;
            return fallback;
        }

        // ---- 사무실 정원 ----

        // interim (#1) — 사무실 단계 = 회사 성급 순번. #2에서 구매형으로 바뀐다.
        public OfficeExpansionDef GetOffice()
        {
            if (_c == null || _c.officeExpansions == null || _c.officeExpansions.Count == 0) return null;
            int stageIndex = 0;
            for (int i = 0; i < _c.stages.Count; i++)
                if (_c.stages[i] != null && _c.stages[i].id == _m.CompanyStageId) { stageIndex = i; break; }
            int level = System.Math.Min(stageIndex + 1, _c.officeExpansions.Count);
            foreach (var o in _c.officeExpansions)
                if (o != null && o.level == level) return o;
            return _c.officeExpansions[0];
        }

        public int GetHireCapacity()
        {
            var office = GetOffice();
            return office != null ? office.hireCapacity : 3;
        }

        public bool IsRosterFull() => _m.HiredAgentIds.Count >= GetHireCapacity();

        // ---- 채용 3택1 ----

        // 후보 — 시드+영입 회차 결정론. 요건 미충족·이미 영입한 인재는 제외, 희귀도 가중 추첨.
        public List<AgentTypeDef> GetCandidates()
        {
            var result = new List<AgentTypeDef>();
            if (_c == null || _c.agentTypes == null) return result;

            var pool = new List<AgentTypeDef>();
            foreach (var a in _c.agentTypes)
            {
                if (a == null || _m.HiredAgentIds.Contains(a.id)) continue;
                if (!ThresholdEval.Meets(_m, a.unlockRequirements)) continue;
                pool.Add(a);
            }

            string seed = _m.RunModifiers != null ? _m.RunModifiers.Seed : "standard";
            int round = _m.HiredAgentIds.Count;
            for (int slot = 0; slot < CandidateCount && pool.Count > 0; slot++)
            {
                var picked = PickWeighted(pool, seed + ":hire:" + round + ":" + slot);
                result.Add(picked);
                pool.Remove(picked); // 같은 후보판에 중복 금지
            }

            return result;
        }

        // 희귀도 가중 — common 60 / uncommon 25 / rare 12 / epic 3 (React 채널 가중의 단순화).
        static int RarityWeight(string rarity)
        {
            switch (rarity)
            {
                case "uncommon": return 25;
                case "rare": return 12;
                case "epic": return 3;
                default: return 60;
            }
        }

        static AgentTypeDef PickWeighted(List<AgentTypeDef> pool, string salt)
        {
            int total = 0;
            foreach (var a in pool) total += RarityWeight(a.rarity);
            int roll = (int)(RunModifierService.HashSeed(salt) % (uint)total);
            foreach (var a in pool)
            {
                roll -= RarityWeight(a.rarity);
                if (roll < 0) return a;
            }
            return pool[pool.Count - 1];
        }

        public string GetHireLockReason(AgentTypeDef agent)
        {
            if (agent == null) return "후보가 없습니다.";
            if (IsRosterFull()) return "사무실이 좁습니다 — 정원 " + GetHireCapacity() + "명";
            if (!_r.CanAfford(agent.hireCost)) return "자금 부족";
            return null;
        }

        public bool CanHire(AgentTypeDef agent) => GetHireLockReason(agent) == null;

        public bool Hire(AgentTypeDef agent)
        {
            if (!CanHire(agent)) return false;
            if (!_r.SpendMultiple(agent.hireCost)) return false;
            _m.HiredAgentIds.Add(agent.id);
            _r.Add(ResourceId.Talent, 1);
            GameEvents.RaiseResourcesUpdated();
            return true;
        }

        // ---- 프리랜서 계약 — 정원에 안 묶이는 반복 talent 공급원 ----
        // 로스터(22종 유한)만으로는 깊은 트리의 talent 수요를 못 채운다. 비용은 보유 talent 기하 증가로 자체 균형.

        public const int FreelanceBaselineTalent = 3;

        public double GetFreelanceCost()
        {
            double baseCost = GetExtra("recruit_base_cost", 2500);
            double growth = GetExtra("recruit_cost_growth", 1.25);
            int extra = (int)_m.Get(ResourceId.Talent) - FreelanceBaselineTalent;
            if (extra < 0) extra = 0;
            return System.Math.Round(baseCost * System.Math.Pow(growth, extra));
        }

        public bool CanHireFreelance() => _m.Get(ResourceId.Cash) >= GetFreelanceCost();

        public bool HireFreelance()
        {
            if (!CanHireFreelance()) return false;
            _r.Add(ResourceId.Cash, -GetFreelanceCost());
            _r.Add(ResourceId.Talent, 1);
            GameEvents.RaiseResourcesUpdated();
            return true;
        }

        // ---- GPU 증설 (feat-013 #1) — 연산력의 유일한 반복 공급원 ----

        public double GetComputePackCost() => GetExtra("compute_pack_cost", 2500);
        public double GetComputePackAmount() => GetExtra("compute_pack_amount", 40);

        public bool CanBuyCompute() => _m.Get(ResourceId.Cash) >= GetComputePackCost();

        public bool BuyCompute()
        {
            if (!CanBuyCompute()) return false;
            _r.Add(ResourceId.Cash, -GetComputePackCost());
            _r.Add(ResourceId.Compute, GetComputePackAmount());
            GameEvents.RaiseResourcesUpdated();
            return true;
        }
    }
}

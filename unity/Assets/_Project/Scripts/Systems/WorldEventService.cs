// 연중 세계 이벤트 — 시드 파생 결정론 스케줄 + 발동 (React world-events.ts 동일 포팅, feat-007 블록 #3).
using System.Collections.Generic;
using AICompanyTycoon.Core;
using AICompanyTycoon.Data;

namespace AICompanyTycoon.Systems
{
    public class ScheduledWorldEvent
    {
        public WorldEventDef Def;
        public int Year;
        public int Month; // Year * 12 에 발동
    }

    public static class WorldEventService
    {
        const int FirstWorldEventYear = 2;
        const int CampaignYears = 10;
        const long LoreMatchBias = -500000000L;

        // 런 모디파이어(시드+세계관)에서 순수 파생되는 연 1건 스케줄. 호출마다 같은 결과 (RNG 없음).
        public static List<ScheduledWorldEvent> GetSchedule(RunModifiersState run, DataCatalog catalog)
        {
            var schedule = new List<ScheduledWorldEvent>();
            if (run == null || catalog == null || catalog.worldEvents == null) return schedule;

            var worldTags = GetWorldLoreTags(run, catalog);
            var selectedIds = new HashSet<string>();

            for (int year = FirstWorldEventYear; year <= CampaignYears; year++)
            {
                WorldEventDef best = null;
                long bestScore = long.MaxValue;
                foreach (var ev in catalog.worldEvents)
                {
                    if (ev == null || year < ev.yearMin || year > ev.yearMax || selectedIds.Contains(ev.id)) continue;
                    long score = Score(ev, year, run, worldTags);
                    if (score < bestScore || (score == bestScore && best != null
                        && string.CompareOrdinal(ev.id, best.id) < 0))
                    {
                        best = ev;
                        bestScore = score;
                    }
                }
                if (best == null) continue;
                selectedIds.Add(best.id);
                schedule.Add(new ScheduledWorldEvent { Def = best, Year = year, Month = year * 12 });
            }

            return schedule;
        }

        // 이번 달에 도래한 미발동 이벤트를 적용한다. 발동 제목 목록을 돌려준다 (UI 표시용).
        public static List<string> ApplyDue(GameModel model, DataCatalog catalog, ResourceService resources)
        {
            var titles = new List<string>();
            if (model == null) return titles;

            foreach (var scheduled in GetSchedule(model.RunModifiers, catalog))
            {
                if (scheduled.Month != model.CurrentMonth || model.WorldEventHistory.Contains(scheduled.Def.id)) continue;
                foreach (var e in scheduled.Def.resourceEffects)
                    resources.Add(e.resource, e.amount);
                model.WorldEventHistory.Insert(0, scheduled.Def.id);
                titles.Add(scheduled.Def.title);
            }

            return titles;
        }

        static long Score(WorldEventDef ev, int year, RunModifiersState run, HashSet<string> worldTags)
        {
            bool loreMatch = false;
            foreach (var tag in ev.worldLoreTags)
                if (worldTags.Contains(tag)) { loreMatch = true; break; }
            long bias = loreMatch ? LoreMatchBias : 0;
            return RunModifierService.HashSeed(run.Seed + ":" + run.WorldLoreId + ":world-event:" + year + ":" + ev.id) + bias;
        }

        static HashSet<string> GetWorldLoreTags(RunModifiersState run, DataCatalog catalog)
        {
            var tags = new HashSet<string> { run.WorldLoreId };
            var lore = catalog.GetRunOption("world_lore", run.WorldLoreId);
            if (lore != null)
                foreach (var tag in lore.tags) tags.Add(tag);
            return tags;
        }
    }
}

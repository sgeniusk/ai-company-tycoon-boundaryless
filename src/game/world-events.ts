import { resources, runModifiers, worldEvents } from "./data";
import type { GameState, ResourceMap, RunModifiersState, WorldEventDefinition } from "./types";

export interface ScheduledWorldEvent extends WorldEventDefinition {
  year: number;
  month: number;
}

const FIRST_WORLD_EVENT_YEAR = 2;
const CAMPAIGN_YEARS = 10;

export function getRunWorldEventSchedule(state: Pick<GameState, "runModifiers">): ScheduledWorldEvent[] {
  const runModifiers = state.runModifiers;
  const selectedIds = new Set<string>();
  const worldTags = getWorldLoreTags(runModifiers.worldLoreId);
  const schedule: ScheduledWorldEvent[] = [];

  for (let year = FIRST_WORLD_EVENT_YEAR; year <= CAMPAIGN_YEARS; year += 1) {
    const candidates = worldEvents
      .filter((event) => isEventEligibleForYear(event, year) && !selectedIds.has(event.id))
      .map((event) => ({
        event,
        score: getWorldEventScore(event, year, runModifiers, worldTags),
      }))
      .sort((left, right) => left.score - right.score || left.event.id.localeCompare(right.event.id));

    const selected = candidates[0]?.event;
    if (!selected) continue;

    selectedIds.add(selected.id);
    schedule.push({
      ...selected,
      year,
      month: year * 12,
    });
  }

  return schedule;
}

export function applyDueWorldEvents(state: GameState): GameState {
  const appliedIds = new Set(state.worldEventHistory ?? []);
  const dueEvents = getRunWorldEventSchedule(state).filter((event) => event.month === state.month && !appliedIds.has(event.id));
  if (dueEvents.length === 0) return state;

  let resourcesAfterEvent = state.resources;
  const history = [...(state.worldEventHistory ?? [])];
  const timelineEntries: string[] = [];

  for (const event of dueEvents) {
    resourcesAfterEvent = applyResourceDelta(resourcesAfterEvent, event.resource_effects);
    history.unshift(event.id);
    timelineEntries.push(`세계 이벤트: ${event.title}`);
    timelineEntries.push(`발동 조건: ${event.trigger}`);
  }

  return {
    ...state,
    resources: resourcesAfterEvent,
    worldEventHistory: [...new Set(history)],
    timeline: [...timelineEntries, ...state.timeline].slice(0, 8),
  };
}

function isEventEligibleForYear(event: WorldEventDefinition, year: number): boolean {
  const [minYear, maxYear] = event.year_range;
  return year >= minYear && year <= maxYear;
}

function getWorldEventScore(
  event: WorldEventDefinition,
  year: number,
  runModifiers: RunModifiersState,
  worldTags: Set<string>,
): number {
  const hasLoreMatch = (event.world_lore_tags ?? []).some((tag) => worldTags.has(tag));
  const loreBias = hasLoreMatch ? -500_000_000 : 0;
  return hashSeed(`${runModifiers.seed}:${runModifiers.worldLoreId}:world-event:${year}:${event.id}`) + loreBias;
}

function getWorldLoreTags(worldLoreId: string): Set<string> {
  const selectedWorldLore = runModifiers.world_lore.find((option) => option.id === worldLoreId);
  return new Set([worldLoreId, ...(selectedWorldLore?.tags ?? [])]);
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function applyResourceDelta(current: ResourceMap, delta: ResourceMap): ResourceMap {
  const next = { ...current };

  for (const [resourceId, amount] of Object.entries(delta)) {
    const definition = resources[resourceId];
    const currentValue = next[resourceId] ?? 0;
    next[resourceId] = definition ? clamp(currentValue + amount, definition.min_value, definition.max_value) : currentValue + amount;
  }

  return next;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

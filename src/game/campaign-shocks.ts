import { campaignShocks, capabilities, competitors, domains, products, resources } from "./data";
import type { CampaignShockDefinition, CompetitorState, GameState, ResourceMap } from "./types";

export interface CampaignShockStatus extends CampaignShockDefinition {
  applied: boolean;
  current: boolean;
  monthsUntil: number;
  recommendedProductNames: string[];
  recommendedCapabilityNames: string[];
  affectedRivalIds: string[];
  affectedDomainNames: string[];
}

export interface CampaignShockForecast {
  totalCount: number;
  completedCount: number;
  current?: CampaignShockStatus;
  next?: CampaignShockStatus;
  statuses: CampaignShockStatus[];
}

export function getCampaignShockById(shockId: string): CampaignShockDefinition | undefined {
  return campaignShocks.find((shock) => shock.id === shockId);
}

export function getCampaignShockForecast(state: GameState): CampaignShockForecast {
  const appliedIds = new Set(state.campaignShockHistory ?? []);
  const statuses = campaignShocks.map((shock) => createShockStatus(shock, state, appliedIds));
  const current = statuses.find((status) => status.current);
  const next = statuses.find((status) => !status.applied && status.month >= state.month) ?? statuses.find((status) => !status.applied);

  return {
    totalCount: statuses.length,
    completedCount: statuses.filter((status) => status.applied).length,
    current,
    next,
    statuses,
  };
}

export function applyDueCampaignShocks(state: GameState): GameState {
  const appliedIds = new Set(state.campaignShockHistory ?? []);
  const dueShocks = campaignShocks.filter((shock) => shock.month === state.month && !appliedIds.has(shock.id));
  if (dueShocks.length === 0) return state;

  let resourcesAfterShock = state.resources;
  let competitorsAfterShock = state.competitorStates;
  const history = [...(state.campaignShockHistory ?? [])];
  const timelineEntries: string[] = [];

  for (const shock of dueShocks) {
    resourcesAfterShock = applyResourceDelta(resourcesAfterShock, shock.resource_effects);
    competitorsAfterShock = applyShockToCompetitors(shock, competitorsAfterShock);
    history.unshift(shock.id);
    timelineEntries.push(`시장 충격: ${shock.title}`);
    timelineEntries.push(`대응 추천: ${shock.pressure_summary}`);
  }

  return {
    ...state,
    resources: resourcesAfterShock,
    competitorStates: competitorsAfterShock,
    campaignShockHistory: [...new Set(history)],
    timeline: [...timelineEntries, ...state.timeline].slice(0, 8),
  };
}

function createShockStatus(
  shock: CampaignShockDefinition,
  state: GameState,
  appliedIds: Set<string>,
): CampaignShockStatus {
  const applied = appliedIds.has(shock.id);

  return {
    ...shock,
    applied,
    current: state.month === shock.month,
    monthsUntil: Math.max(0, shock.month - state.month),
    recommendedProductNames: shock.recommended_product_ids
      .map((productId) => products.find((product) => product.id === productId)?.name)
      .filter((name): name is string => Boolean(name)),
    recommendedCapabilityNames: shock.recommended_capability_ids
      .map((capabilityId) => capabilities.find((capability) => capability.id === capabilityId)?.name)
      .filter((name): name is string => Boolean(name)),
    affectedRivalIds: getAffectedRivalIds(shock),
    affectedDomainNames: shock.rival_focus_domains
      .map((domainId) => domains.find((domain) => domain.id === domainId)?.name)
      .filter((name): name is string => Boolean(name)),
  };
}

function applyShockToCompetitors(shock: CampaignShockDefinition, competitorStates: CompetitorState[]): CompetitorState[] {
  const affectedRivalIds = new Set(getAffectedRivalIds(shock));

  return competitorStates.map((competitor) => {
    if (!affectedRivalIds.has(competitor.id)) {
      return {
        ...competitor,
        lastMove: `${shock.title} 관망 · ${competitor.lastMove}`,
      };
    }

    return {
      ...competitor,
      momentum: clamp(competitor.momentum + shock.rival_momentum_delta, -12, 12),
      lastMove: `${shock.title} 대응 · ${competitor.lastMove}`,
    };
  });
}

function getAffectedRivalIds(shock: CampaignShockDefinition): string[] {
  const focusDomains = new Set(shock.rival_focus_domains);
  return competitors
    .filter((competitor) => competitor.focus_domains.some((domainId) => focusDomains.has(domainId)))
    .map((competitor) => competitor.id);
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

import { getIndustryComboSummary } from "./industry-combos";
import { getIndustrySynergySummary } from "./industry-synergies";
import { industryCombos, industrySynergies } from "./data";
import type { GameState, ResourceMap } from "./types";

export type PayoffCelebrationKind = "combo" | "synergy";

export interface PayoffCelebrationMoment {
  id: string;
  kind: PayoffCelebrationKind;
  title: string;
  description: string;
  riskLabel?: string;
  monthlyEffects: ResourceMap;
}

export interface PayoffCollectionEntry {
  id: string;
  kind: PayoffCelebrationKind;
  title: string;
  description: string;
  riskLabel?: string;
  monthlyEffects: ResourceMap;
  requiredDomains: string[];
  discovered: boolean;
}

export function getPayoffCelebrationMoments(state: GameState): PayoffCelebrationMoment[] {
  const comboMoments = getIndustryComboSummary(state).active.map((combo): PayoffCelebrationMoment => ({
    id: `combo:${combo.id}`,
    kind: "combo",
    title: combo.title,
    description: combo.description,
    riskLabel: combo.risk_label,
    monthlyEffects: combo.monthly_effects,
  }));
  const synergyMoments = getIndustrySynergySummary(state).active.map((synergy): PayoffCelebrationMoment => ({
    id: `synergy:${synergy.id}`,
    kind: "synergy",
    title: synergy.title,
    description: synergy.description,
    monthlyEffects: synergy.monthly_effects,
  }));

  return [...comboMoments, ...synergyMoments];
}

export function getNewPayoffActivationIds(previousActiveIds: Iterable<string>, currentActiveIds: Iterable<string>): string[] {
  const previous = new Set(previousActiveIds);
  return [...currentActiveIds].filter((id) => !previous.has(id));
}

export function getNewPayoffDiscoveryIds(discoveredPayoffIds: Iterable<string>, activeMoments: Iterable<PayoffCelebrationMoment>): string[] {
  const discovered = new Set(discoveredPayoffIds);
  return [...activeMoments].map((moment) => moment.id).filter((id) => !discovered.has(id));
}

export function discoverActivePayoffs(state: GameState): GameState {
  const newDiscoveryIds = getNewPayoffDiscoveryIds(state.discoveredPayoffIds ?? [], getPayoffCelebrationMoments(state));
  if (newDiscoveryIds.length === 0) return state;

  return {
    ...state,
    discoveredPayoffIds: [...(state.discoveredPayoffIds ?? []), ...newDiscoveryIds],
  };
}

export function getPayoffCollectionEntries(state: GameState): PayoffCollectionEntry[] {
  const discovered = new Set(state.discoveredPayoffIds ?? []);
  const comboEntries = industryCombos.map((combo): PayoffCollectionEntry => ({
    id: `combo:${combo.id}`,
    kind: "combo",
    title: combo.title,
    description: combo.description,
    riskLabel: combo.risk_label,
    monthlyEffects: combo.monthly_effects,
    requiredDomains: combo.required_domains,
    discovered: discovered.has(`combo:${combo.id}`),
  }));
  const synergyEntries = industrySynergies.map((synergy): PayoffCollectionEntry => ({
    id: `synergy:${synergy.id}`,
    kind: "synergy",
    title: synergy.title,
    description: synergy.description,
    monthlyEffects: synergy.monthly_effects,
    requiredDomains: synergy.required_domains,
    discovered: discovered.has(`synergy:${synergy.id}`),
  }));

  return [...comboEntries, ...synergyEntries];
}

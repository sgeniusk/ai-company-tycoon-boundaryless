import { getIndustryComboSummary } from "./industry-combos";
import { getIndustrySynergySummary } from "./industry-synergies";
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

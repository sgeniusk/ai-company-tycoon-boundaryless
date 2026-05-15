import { competitors, growthPaths, products } from "./data";
import type { GameState } from "./types";

export type CompetitionSignalSeverity = "contested" | "strategic" | "watch" | "low";

export interface GrowthPathCompetitionSignal {
  competitorId: string;
  severity: CompetitionSignalSeverity;
  label: string;
  reason: string;
  overlappingDomains: string[];
  claimedOverlapCount: number;
}

export function getGrowthPathCompetitionSignals(state: GameState): GrowthPathCompetitionSignal[] {
  const path = growthPaths.find((entry) => entry.id === state.chosenGrowthPath?.id);
  const targetDomains = new Set(
    (path?.recommended_product_ids ?? [])
      .map((productId) => products.find((product) => product.id === productId)?.domain)
      .filter((domain): domain is string => Boolean(domain)),
  );

  return state.competitorStates.map((competitorState) => {
    const competitor = competitors.find((entry) => entry.id === competitorState.id);
    const overlappingDomains = competitor?.focus_domains.filter((domainId) => targetDomains.has(domainId)) ?? [];
    const claimedOverlapCount = competitorState.claimedProducts.filter((productId) => {
      const product = products.find((entry) => entry.id === productId);
      return product ? targetDomains.has(product.domain) : false;
    }).length;

    if (claimedOverlapCount > 0) {
      return {
        competitorId: competitorState.id,
        severity: "contested",
        label: "선점 충돌",
        reason: "선택한 성장 경로의 제품 공간을 이미 선점했습니다.",
        overlappingDomains,
        claimedOverlapCount,
      };
    }

    if (overlappingDomains.length > 0) {
      return {
        competitorId: competitorState.id,
        severity: "strategic",
        label: "전략 충돌",
        reason: "선택한 성장 경로와 같은 시장을 주시하고 있습니다.",
        overlappingDomains,
        claimedOverlapCount,
      };
    }

    if (competitorState.lastMove.includes("준비") || competitorState.lastMove.includes("관찰")) {
      return {
        competitorId: competitorState.id,
        severity: "watch",
        label: "관찰 필요",
        reason: "직접 충돌은 아니지만 다음 움직임을 준비 중입니다.",
        overlappingDomains,
        claimedOverlapCount,
      };
    }

    return {
      competitorId: competitorState.id,
      severity: "low",
      label: "간접 경쟁",
      reason: "현재 선택한 성장 경로와 직접 겹치는 시장은 적습니다.",
      overlappingDomains,
      claimedOverlapCount,
    };
  });
}

import { competitors } from "./data";
import { getCampaignFinale } from "./campaign";
import type { GameState } from "./types";
import { t } from "../i18n";

export type ShareableMomentType = "launch" | "rival" | "ending" | "deck" | "staff";
export type ShareableMomentTone = "positive" | "warning" | "neutral";

export interface ShareableMoment {
  type: ShareableMomentType;
  title: string;
  detail: string;
  badge: string;
  tone: ShareableMomentTone;
}

export function getShareableMoments(state: GameState): ShareableMoment[] {
  const moments: ShareableMoment[] = [];
  const finale = getCampaignFinale(state);

  if (finale.isFinal) {
    moments.push({
      type: "ending",
      title: finale.endingName,
      detail: finale.verdict,
      badge: `${finale.rank}랭크`,
      tone: finale.rank === "S" || finale.rank === "A" ? "positive" : "neutral",
    });
  }

  if (state.lastRelease) {
    moments.push({
      type: "launch",
      title: `${state.lastRelease.productName} 출시`,
      detail: state.lastRelease.headline,
      badge: `${state.lastRelease.review.grade} · ${state.lastRelease.review.score}점`,
      tone: state.lastRelease.review.score >= 75 ? "positive" : "neutral",
    });
  }

  const latestStaffResolution = state.recentStaffIncidentResolutions[0];
  if (latestStaffResolution) {
    moments.push({
      type: "staff",
      title: `${latestStaffResolution.agentName} · ${latestStaffResolution.resolutionLabel}`,
      detail: latestStaffResolution.summary,
      badge: "인사 사건",
      tone: latestStaffResolution.severity === "critical" ? "warning" : "neutral",
    });
  }

  const topRival = getTopRivalMoment(state);
  if (topRival) moments.push(topRival);

  if (state.roguelite.pendingCardReward) {
    moments.push({
      type: "deck",
      title: "카드 보상 대기",
      detail: `${state.roguelite.pendingCardReward.productName} 출시 보상으로 새 빌드 선택지가 열렸습니다.`,
      badge: `${state.roguelite.pendingCardReward.offeredCardIds.length}장`,
      tone: "positive",
    });
  }

  return moments.slice(0, 4);
}

function getTopRivalMoment(state: GameState): ShareableMoment | undefined {
  const topRival = [...state.competitorStates].sort((a, b) => b.marketShare - a.marketShare || b.score - a.score)[0];
  if (!topRival || topRival.marketShare < 20) return undefined;

  const competitor = competitors.find((entry) => entry.id === topRival.id);
  return {
    type: "rival",
    title: `${competitor ? t(competitor.name_key) : topRival.id} 압박`,
    detail: topRival.lastMove,
    badge: `점유 ${topRival.marketShare}%`,
    tone: topRival.marketShare >= 35 ? "warning" : "neutral",
  };
}

import type { Dispatch, SetStateAction } from "react";
import { getCampaignShockForecast, type CampaignShockStatus } from "../game/campaign-shocks";
import type { GameState } from "../game/types";
import { formatEffects } from "../ui/formatters";
import type { MenuId } from "../ui/menu";

interface CampaignShockPanelProps {
  gameState: GameState;
  setActiveMenu?: Dispatch<SetStateAction<MenuId>>;
}

export function CampaignShockPanel({ gameState, setActiveMenu }: CampaignShockPanelProps) {
  const forecast = getCampaignShockForecast(gameState);
  const shock = forecast.current ?? forecast.next;

  if (!shock) return null;

  return (
    <div className={shock.applied ? "campaign-shock-panel applied" : "campaign-shock-panel"}>
      <div className="campaign-shock-header">
        <div>
          <p className="eyebrow">시장 충격 예보</p>
          <h3>{shock.title}</h3>
          <span>{getShockTimingLabel(shock)}</span>
        </div>
        <strong>{forecast.completedCount}/{forecast.totalCount}</strong>
      </div>
      <p>{shock.description}</p>
      <div className="campaign-shock-effect-row">
        <span>{formatEffects(shock.resource_effects)}</span>
        <span>경쟁 모멘텀 +{shock.rival_momentum_delta}</span>
      </div>
      <div className="campaign-shock-action-grid">
        <button onClick={() => setActiveMenu?.("products")} type="button">
          <strong>제품 대응</strong>
          <span>{formatNameList(shock.recommendedProductNames, 2)}</span>
        </button>
        <button onClick={() => setActiveMenu?.("research")} type="button">
          <strong>연구 대응</strong>
          <span>{formatNameList(shock.recommendedCapabilityNames, 2)}</span>
        </button>
        <button onClick={() => setActiveMenu?.("competition")} type="button">
          <strong>경쟁 대응</strong>
          <span>{formatNameList(shock.affectedDomainNames, 2)}</span>
        </button>
      </div>
    </div>
  );
}

function getShockTimingLabel(shock: CampaignShockStatus): string {
  if (shock.applied) return "적용 완료";
  if (shock.monthsUntil === 0) return "이번 달 발생";
  return `${shock.monthsUntil}개월 후 발생`;
}

function formatNameList(names: string[], max = 3): string {
  const visibleNames = names.slice(0, max);
  return visibleNames.length ? visibleNames.join(", ") : "없음";
}

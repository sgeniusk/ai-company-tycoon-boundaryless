// v0.62 #1 — derive-only combo/synergy activation celebration. No GameState queue is persisted.
import { useEffect, useMemo, useRef, useState } from "react";
import { getNewPayoffActivationIds, getPayoffCelebrationMoments, type PayoffCelebrationMoment } from "../game/payoff-activation";
import { formatResource } from "../game/simulation";
import type { GameState } from "../game/types";

function getEffectEntries(moment: PayoffCelebrationMoment): [string, number][] {
  return Object.entries(moment.monthlyEffects).filter(([, amount]) => amount !== 0);
}

function isPayoffJuiceScenario(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("scenario") === "payoff-juice";
}

export function PayoffCelebrationModal({ gameState }: { gameState: GameState }) {
  const moments = useMemo(() => getPayoffCelebrationMoments(gameState), [gameState]);
  const momentById = useMemo(() => new Map(moments.map((moment) => [moment.id, moment])), [moments]);
  const activeIds = useMemo(() => moments.map((moment) => moment.id), [moments]);
  const scenarioSeedId = isPayoffJuiceScenario() ? activeIds[0] : undefined;
  const previousActiveIdsRef = useRef<Set<string> | undefined>(undefined);
  const [queue, setQueue] = useState<string[]>(() => (scenarioSeedId ? [scenarioSeedId] : []));

  useEffect(() => {
    const previousActiveIds = previousActiveIdsRef.current;
    if (!previousActiveIds) {
      previousActiveIdsRef.current = new Set(activeIds);
      return;
    }

    const newlyActiveIds = getNewPayoffActivationIds(previousActiveIds, activeIds);
    if (newlyActiveIds.length > 0) {
      setQueue((current) => [...current, ...newlyActiveIds.filter((id) => !current.includes(id))]);
    }
    previousActiveIdsRef.current = new Set(activeIds);
  }, [activeIds]);

  const currentId = queue[0];
  const moment = currentId ? momentById.get(currentId) : undefined;
  if (!moment) return null;

  const remaining = queue.length;
  const effectEntries = getEffectEntries(moment);
  const tone = moment.kind === "combo" ? "combo" : "synergy";

  return (
    <div className="payoff-celebration-overlay" role="dialog" aria-modal="true" aria-labelledby="payoff-celebration-title">
      <div className={`payoff-celebration-card payoff-celebration-${tone}`}>
        <header className="payoff-celebration-header">
          <span className="payoff-celebration-pill">{moment.kind === "combo" ? "고위험 조합 발동" : "산업 시너지 발동"}</span>
          {remaining > 1 && (
            <span className="payoff-celebration-queue" aria-label={`대기 셀러브레이션 ${remaining - 1}건 더`}>
              +{remaining - 1}
            </span>
          )}
          <i className="payoff-celebration-flare" aria-hidden="true" />
        </header>
        <p className="payoff-celebration-kicker">Boundaryless payoff</p>
        <h2 id="payoff-celebration-title" className="payoff-celebration-title">
          『{moment.title}』 발동!
        </h2>
        <p className="payoff-celebration-copy">{moment.riskLabel ?? moment.description}</p>
        <div className="payoff-celebration-effects" aria-label="월간 효과 요약">
          {effectEntries.map(([resourceId, amount]) => (
            <span className={amount >= 0 ? "positive" : "negative"} key={resourceId}>
              {amount >= 0 ? "+" : ""}
              {formatResource(resourceId, amount)} {resourceId}
            </span>
          ))}
        </div>
        <button type="button" className="payoff-celebration-dismiss" onClick={() => setQueue((current) => current.slice(1))}>
          확인
        </button>
      </div>
    </div>
  );
}

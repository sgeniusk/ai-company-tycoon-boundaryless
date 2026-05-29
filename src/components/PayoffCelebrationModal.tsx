// v0.62 — combo/synergy celebration queue stays local; first-ever discovery ids persist in GameState.
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  discoverActivePayoffs,
  getNewPayoffActivationIds,
  getNewPayoffDiscoveryIds,
  getPayoffCelebrationMoments,
  type PayoffCelebrationMoment,
} from "../game/payoff-activation";
import { formatResource } from "../game/simulation";
import type { GameState } from "../game/types";

function getEffectEntries(moment: PayoffCelebrationMoment): [string, number][] {
  return Object.entries(moment.monthlyEffects).filter(([, amount]) => amount !== 0);
}

function isPayoffJuiceScenario(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("scenario") === "payoff-juice";
}

type PayoffCelebrationQueueEntry = {
  id: string;
  variant: "activation" | "discovery";
};

function appendQueueEntries(current: PayoffCelebrationQueueEntry[], next: PayoffCelebrationQueueEntry[]): PayoffCelebrationQueueEntry[] {
  const seen = new Set(current.map((entry) => `${entry.variant}:${entry.id}`));
  const additions = next.filter((entry) => {
    const key = `${entry.variant}:${entry.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return additions.length ? [...current, ...additions] : current;
}

export function PayoffCelebrationModal({
  gameState,
  setGameState,
}: {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
}) {
  const moments = useMemo(() => getPayoffCelebrationMoments(gameState), [gameState]);
  const momentById = useMemo(() => new Map(moments.map((moment) => [moment.id, moment])), [moments]);
  const activeIds = useMemo(() => moments.map((moment) => moment.id), [moments]);
  const discoveryIds = useMemo(
    () => getNewPayoffDiscoveryIds(gameState.discoveredPayoffIds ?? [], moments),
    [gameState.discoveredPayoffIds, moments],
  );
  const discoveryIdSet = useMemo(() => new Set(discoveryIds), [discoveryIds]);
  const scenarioSeedId = isPayoffJuiceScenario() ? activeIds[0] : undefined;
  const previousActiveIdsRef = useRef<Set<string> | undefined>(undefined);
  const [queue, setQueue] = useState<PayoffCelebrationQueueEntry[]>(() =>
    scenarioSeedId ? [{ id: scenarioSeedId, variant: "discovery" }] : [],
  );

  useEffect(() => {
    if (discoveryIds.length === 0) return;

    setQueue((current) =>
      appendQueueEntries(
        current,
        discoveryIds.map((id) => ({ id, variant: "discovery" })),
      ),
    );
    setGameState((current) => discoverActivePayoffs(current));
  }, [discoveryIds, setGameState]);

  useEffect(() => {
    const previousActiveIds = previousActiveIdsRef.current;
    if (!previousActiveIds) {
      previousActiveIdsRef.current = new Set(activeIds);
      return;
    }

    const newlyActiveIds = getNewPayoffActivationIds(previousActiveIds, activeIds);
    const activationIds = newlyActiveIds.filter((id) => !discoveryIdSet.has(id));
    if (activationIds.length > 0) {
      setQueue((current) =>
        appendQueueEntries(
          current,
          activationIds.map((id) => ({ id, variant: "activation" })),
        ),
      );
    }
    previousActiveIdsRef.current = new Set(activeIds);
  }, [activeIds, discoveryIdSet]);

  const currentEntry = queue[0];
  const moment = currentEntry ? momentById.get(currentEntry.id) : undefined;
  if (!moment) return null;

  const remaining = queue.length;
  const effectEntries = getEffectEntries(moment);
  const tone = moment.kind === "combo" ? "combo" : "synergy";
  const isDiscovery = currentEntry.variant === "discovery";

  return (
    <div className="payoff-celebration-overlay" role="dialog" aria-modal="true" aria-labelledby="payoff-celebration-title">
      <div className={`payoff-celebration-card payoff-celebration-${tone}${isDiscovery ? " payoff-celebration-discovery" : ""}`}>
        <header className="payoff-celebration-header">
          <span className="payoff-celebration-pill">
            {isDiscovery ? "신규 발견!" : moment.kind === "combo" ? "고위험 조합 발동" : "산업 시너지 발동"}
          </span>
          {remaining > 1 && (
            <span className="payoff-celebration-queue" aria-label={`대기 셀러브레이션 ${remaining - 1}건 더`}>
              +{remaining - 1}
            </span>
          )}
          <i className="payoff-celebration-flare" aria-hidden="true" />
        </header>
        <p className="payoff-celebration-kicker">{isDiscovery ? "Discovery unlocked" : "Boundaryless payoff"}</p>
        <h2 id="payoff-celebration-title" className="payoff-celebration-title">
          『{moment.title}』 {isDiscovery ? "발견!" : "발동!"}
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

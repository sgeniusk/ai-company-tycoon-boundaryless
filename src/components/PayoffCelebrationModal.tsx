// v0.62 — combo/synergy celebration queue stays local; first-ever discovery ids persist in GameState.
import { useEffect, useMemo, useRef, useState, type CSSProperties, type Dispatch, type SetStateAction } from "react";
import {
  getAchievementCelebrationMoments,
  getNewAchievementUnlockIds,
  type AchievementCelebrationMoment,
} from "../game/achievements";
import { assetManifest } from "../game/data";
import {
  discoverActivePayoffs,
  getNewPayoffActivationIds,
  getNewPayoffDiscoveryIds,
  getPayoffCelebrationMoments,
  type PayoffCelebrationMoment,
} from "../game/payoff-activation";
import { formatResource } from "../game/simulation";
import type { GameState } from "../game/types";

type CelebrationMoment = PayoffCelebrationMoment | AchievementCelebrationMoment;
type CelebrationTone = "synergy" | "combo" | "achievement";

const celebrationEmblemAtlasId = "celebration_emblems_v077_atlas";
const celebrationEmblemDisplaySize = 64;
const celebrationEmblemFrameIndexes: Record<CelebrationTone, number> = {
  synergy: 0,
  combo: 1,
  achievement: 2,
};

function getCelebrationEmblemStyle(tone: CelebrationTone): CSSProperties {
  const sheet = assetManifest.sprite_sheets[celebrationEmblemAtlasId];
  const frameIndex = celebrationEmblemFrameIndexes[tone];
  const columns = sheet?.columns ?? 3;
  const rows = sheet?.rows ?? 1;
  const column = frameIndex % columns;
  const row = Math.floor(frameIndex / columns);

  return {
    "--celebration-emblem-atlas": `url(${sheet?.path ?? "/assets/ui/v077-celebration-emblem-atlas.png"})`,
    "--celebration-emblem-x": `${-column * celebrationEmblemDisplaySize}px`,
    "--celebration-emblem-y": `${-row * celebrationEmblemDisplaySize}px`,
    "--celebration-emblem-size": `${columns * celebrationEmblemDisplaySize}px ${rows * celebrationEmblemDisplaySize}px`,
  } as CSSProperties;
}

function getEffectEntries(moment: CelebrationMoment): [string, number][] {
  const effects = moment.kind === "achievement" ? moment.reward : moment.monthlyEffects;
  return Object.entries(effects).filter(([, amount]) => amount !== 0);
}

function getScenario(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("scenario") ?? undefined;
}

function isPayoffJuiceScenario(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("scenario") === "payoff-juice";
}

function isMilestonesScenario(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("scenario") === "milestones";
}

type PayoffCelebrationQueueEntry = {
  id: string;
  variant: "activation" | "discovery" | "achievement";
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
  const achievementMoments = useMemo(() => getAchievementCelebrationMoments(gameState), [gameState]);
  const allMoments = useMemo(() => [...moments, ...achievementMoments], [moments, achievementMoments]);
  const momentById = useMemo(() => new Map(allMoments.map((moment) => [moment.id, moment])), [allMoments]);
  const activeIds = useMemo(() => moments.map((moment) => moment.id), [moments]);
  const unlockedAchievementIds = useMemo(() => gameState.unlockedAchievements ?? [], [gameState.unlockedAchievements]);
  const discoveryIds = useMemo(
    () => getNewPayoffDiscoveryIds(gameState.discoveredPayoffIds ?? [], moments),
    [gameState.discoveredPayoffIds, moments],
  );
  const discoveryIdSet = useMemo(() => new Set(discoveryIds), [discoveryIds]);
  const scenario = getScenario();
  const scenarioSeedId = isPayoffJuiceScenario() ? activeIds[0] : isMilestonesScenario() ? achievementMoments[0]?.id : undefined;
  const previousActiveIdsRef = useRef<Set<string> | undefined>(undefined);
  const previousAchievementIdsRef = useRef<Set<string> | undefined>(undefined);
  const [queue, setQueue] = useState<PayoffCelebrationQueueEntry[]>(() =>
    scenarioSeedId ? [{ id: scenarioSeedId, variant: scenario === "milestones" ? "achievement" : "discovery" }] : [],
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

  useEffect(() => {
    const previousAchievementIds = previousAchievementIdsRef.current;
    if (!previousAchievementIds) {
      previousAchievementIdsRef.current = new Set(unlockedAchievementIds);
      return;
    }

    const newlyUnlockedIds = getNewAchievementUnlockIds(previousAchievementIds, unlockedAchievementIds);
    if (newlyUnlockedIds.length > 0) {
      setQueue((current) =>
        appendQueueEntries(
          current,
          newlyUnlockedIds.map((id) => ({ id: `achievement:${id}`, variant: "achievement" })),
        ),
      );
    }
    previousAchievementIdsRef.current = new Set(unlockedAchievementIds);
  }, [unlockedAchievementIds]);

  const currentEntry = queue[0];
  const moment = currentEntry ? momentById.get(currentEntry.id) : undefined;
  if (!moment) return null;

  const remaining = queue.length;
  const effectEntries = getEffectEntries(moment);
  const tone = moment.kind === "achievement" ? "achievement" : moment.kind === "combo" ? "combo" : "synergy";
  const isDiscovery = currentEntry.variant === "discovery";
  const isAchievement = currentEntry.variant === "achievement";

  return (
    <div className="payoff-celebration-overlay" role="dialog" aria-modal="true" aria-labelledby="payoff-celebration-title">
      <div className={`payoff-celebration-card payoff-celebration-${tone}${isDiscovery ? " payoff-celebration-discovery" : ""}`}>
        <header className="payoff-celebration-header">
          <span
            aria-hidden="true"
            className={`payoff-celebration-emblem payoff-celebration-emblem-${tone}`}
            style={getCelebrationEmblemStyle(tone)}
          />
          <span className="payoff-celebration-pill">
            {isAchievement ? "마일스톤 달성" : isDiscovery ? "신규 발견!" : moment.kind === "combo" ? "고위험 조합 발동" : "산업 시너지 발동"}
          </span>
          {remaining > 1 && (
            <span className="payoff-celebration-queue" aria-label={`대기 셀러브레이션 ${remaining - 1}건 더`}>
              +{remaining - 1}
            </span>
          )}
          <i className="payoff-celebration-flare" aria-hidden="true" />
        </header>
        <p className="payoff-celebration-kicker">{isAchievement ? "Milestone fanfare" : isDiscovery ? "Discovery unlocked" : "Boundaryless payoff"}</p>
        <h2 id="payoff-celebration-title" className="payoff-celebration-title">
          『{moment.title}』 {isAchievement ? "달성!" : isDiscovery ? "발견!" : "발동!"}
        </h2>
        <p className="payoff-celebration-copy">{moment.kind === "achievement" ? moment.description : moment.riskLabel ?? moment.description}</p>
        <div className="payoff-celebration-effects" aria-label={isAchievement ? "업적 보상 요약" : "월간 효과 요약"}>
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

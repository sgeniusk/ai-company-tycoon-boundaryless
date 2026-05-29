import { useEffect, useMemo, useRef, useState } from "react";
import { difficultyTiers, runModifiers } from "../game/data";
import { DEFAULT_RUN_MODIFIER_SELECTION } from "../game/run-modifiers";
import { formatResource } from "../game/simulation";
import { getDerivedArchetypes, getNewlyDiscoveredArchetypes } from "../game/tag-derivation";
import type { GameState, RunModifierOptionDefinition, RunModifiersState } from "../game/types";

type RevealAxis = {
  id: string;
  label: string;
  defaultId: string;
  option?: RunModifierOptionDefinition;
};

function getRevealAxes(selection: RunModifiersState): RevealAxis[] {
  return [
    {
      id: "city",
      label: "시작 도시",
      defaultId: DEFAULT_RUN_MODIFIER_SELECTION.startCityId,
      option: runModifiers.start_cities.find((option) => option.id === selection.startCityId),
    },
    {
      id: "world",
      label: "세계관",
      defaultId: DEFAULT_RUN_MODIFIER_SELECTION.worldLoreId,
      option: runModifiers.world_lore.find((option) => option.id === selection.worldLoreId),
    },
    {
      id: "market",
      label: "시장",
      defaultId: DEFAULT_RUN_MODIFIER_SELECTION.marketConditionId,
      option: runModifiers.market_conditions.find((option) => option.id === selection.marketConditionId),
    },
    {
      id: "founder",
      label: "창업자",
      defaultId: DEFAULT_RUN_MODIFIER_SELECTION.founderTraitId,
      option: runModifiers.founder_traits.find((option) => option.id === selection.founderTraitId),
    },
  ];
}

function isStandardRun(selection: RunModifiersState): boolean {
  return (
    selection.startCityId === DEFAULT_RUN_MODIFIER_SELECTION.startCityId &&
    selection.worldLoreId === DEFAULT_RUN_MODIFIER_SELECTION.worldLoreId &&
    selection.marketConditionId === DEFAULT_RUN_MODIFIER_SELECTION.marketConditionId &&
    selection.founderTraitId === DEFAULT_RUN_MODIFIER_SELECTION.founderTraitId &&
    selection.challengeTier === "standard"
  );
}

function getDeltaEntries(option?: RunModifierOptionDefinition): string[] {
  if (!option) return [];

  const resourceEntries = Object.entries(option.starting_deltas.resources ?? {})
    .filter(([, amount]) => amount !== 0)
    .map(([resourceId, amount]) => `${amount >= 0 ? "+" : ""}${formatResource(resourceId, amount)} ${resourceId}`);
  const capabilityEntries = Object.entries(option.starting_deltas.capabilities ?? {})
    .filter(([, amount]) => amount !== 0)
    .map(([capabilityId, amount]) => `${amount >= 0 ? "+" : ""}${amount} ${capabilityId}`);

  return [...resourceEntries, ...capabilityEntries];
}

function getScenario(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("scenario") ?? undefined;
}

function getScenarioPreviousArchetypeIds(): string[] | undefined {
  return getScenario() === "archetype-collection" ? ["frontier_garage"] : undefined;
}

export function WorldRevealModal({ gameState }: { gameState: GameState }) {
  const [dismissedSeeds, setDismissedSeeds] = useState<Set<string>>(() => new Set());
  const [revealedCount, setRevealedCount] = useState(1);
  const previousDiscoveredArchetypeIdsRef = useRef<string[] | undefined>(getScenarioPreviousArchetypeIds());
  const selection = gameState.runModifiers;
  const axes = useMemo(() => getRevealAxes(selection), [selection]);
  const derivedArchetypes = useMemo(() => getDerivedArchetypes(gameState), [gameState]);
  const newlyDiscoveredArchetypeIds = useMemo(
    () => getNewlyDiscoveredArchetypes(previousDiscoveredArchetypeIdsRef.current ?? gameState.roguelite.discoveredArchetypeIds ?? [], derivedArchetypes),
    [derivedArchetypes, gameState.roguelite.discoveredArchetypeIds],
  );
  const newlyDiscoveredArchetypeSet = useMemo(() => new Set(newlyDiscoveredArchetypeIds), [newlyDiscoveredArchetypeIds]);
  const newlyDiscoveredArchetypes = useMemo(
    () => derivedArchetypes.filter((rule) => newlyDiscoveredArchetypeSet.has(rule.id)),
    [derivedArchetypes, newlyDiscoveredArchetypeSet],
  );
  const challengeTier = difficultyTiers.find((tier) => tier.id === selection.challengeTier) ?? difficultyTiers.find((tier) => tier.id === "standard");
  const shouldShow = !isStandardRun(selection) && !dismissedSeeds.has(selection.seed);

  useEffect(() => {
    if (!shouldShow) return;

    setRevealedCount(1);
    const revealTimer = window.setInterval(() => {
      setRevealedCount((current) => {
        if (current >= axes.length) {
          window.clearInterval(revealTimer);
          return current;
        }
        return current + 1;
      });
    }, 420);

    return () => window.clearInterval(revealTimer);
  }, [axes.length, selection.seed, shouldShow]);

  useEffect(() => {
    previousDiscoveredArchetypeIdsRef.current = gameState.roguelite.discoveredArchetypeIds ?? [];
  }, [gameState.roguelite.discoveredArchetypeIds]);

  if (!shouldShow) return null;

  return (
    <div className="world-reveal-overlay" role="dialog" aria-modal="true" aria-labelledby="world-reveal-title">
      <section className="world-reveal-card">
        <header className="world-reveal-header">
          <span className="world-reveal-pill">세계 뽑기</span>
          <span className="world-reveal-seed">seed: {selection.seed}</span>
          <i className="world-reveal-flare" aria-hidden="true" />
        </header>
        <p className="world-reveal-kicker">Run world rolled</p>
        <h2 id="world-reveal-title" className="world-reveal-title">
          이번 세계가 열렸습니다
        </h2>
        {challengeTier && (
          <div className={`world-reveal-tier${challengeTier.id === "standard" ? " standard" : " non-standard"}`}>
            <span>도전 티어</span>
            <strong>{challengeTier.name}</strong>
            <em>보상 x{challengeTier.reward_multiplier}</em>
          </div>
        )}
        <div className="world-reveal-grid" aria-label="이번 런 모디파이어">
          {axes.map((axis, index) => {
            const revealed = index < revealedCount;
            const nonStandard = axis.option?.id !== axis.defaultId;
            const deltaEntries = getDeltaEntries(axis.option);

            return (
              <article
                className={`world-reveal-axis${revealed ? " revealed" : " locked"}${nonStandard ? " non-standard" : " standard"}`}
                key={axis.id}
              >
                <span>{axis.label}</span>
                <strong>{revealed ? axis.option?.name ?? "알 수 없음" : "???"}</strong>
                <p>{revealed ? axis.option?.description ?? "선택 정보를 찾을 수 없습니다." : "결과 분석 중"}</p>
                {revealed && (
                  <div className="world-reveal-deltas">
                    {deltaEntries.length ? deltaEntries.map((entry) => <em key={entry}>{entry}</em>) : <em>기준선</em>}
                  </div>
                )}
              </article>
            );
          })}
        </div>
        {newlyDiscoveredArchetypes.length > 0 && (
          <div className="archetype-discovery-panel" aria-label="신규 아키타입 발견">
            <div>
              <p className="world-reveal-kicker">New archetype</p>
              <strong>신규 아키타입 발견</strong>
              <span>
                이번 런 조합에서 {newlyDiscoveredArchetypes.length}개가 도감에 추가되었습니다.
              </span>
            </div>
            <div className="archetype-discovery-grid">
              {newlyDiscoveredArchetypes.map((archetype) => (
                <article key={archetype.id}>
                  <p className="item-meta">{archetype.yields.kind === "product" ? "제품 후보" : archetype.yields.kind === "event" ? "이벤트 씨앗" : "보너스 씨앗"}</p>
                  <strong>{archetype.title}</strong>
                  <span>{archetype.yields.summary}</span>
                  <small>{archetype.description}</small>
                </article>
              ))}
            </div>
          </div>
        )}
        <button
          className="world-reveal-dismiss"
          onClick={() =>
            setDismissedSeeds((current) => {
              const next = new Set(current);
              next.add(selection.seed);
              return next;
            })
          }
          type="button"
        >
          이 세계로 시작
        </button>
      </section>
    </div>
  );
}

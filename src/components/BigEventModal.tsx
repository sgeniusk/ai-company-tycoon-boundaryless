// v0.58 #5 — annual_challenger / late_boss 진입 시 발동되는 대형 사건 팝업. pendingChallengerEntryIds 큐 head를 읽어 1개만 표시, dismiss 시 shift.
import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { competitors } from "../game/data";
import { dismissChallengerEntry } from "../game/simulation";
import type { GameState } from "../game/types";
import { t, type LocaleCode } from "../i18n";

const TIER_LABEL: Record<string, string> = {
  annual_challenger: "연간 도전자 등장",
  late_boss: "초대형 위협 등장",
};

export function BigEventModal({
  gameState,
  setGameState,
  locale,
}: {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  locale: LocaleCode;
}) {
  const pendingId = gameState.pendingChallengerEntryIds[0];
  if (!pendingId) return null;

  const definition = competitors.find((competitor) => competitor.id === pendingId);
  if (!definition) return null;

  const tier = definition.rival_tier ?? "annual_challenger";
  const tierLabel = TIER_LABEL[tier] ?? "신규 경쟁사 등장";
  const name = t(definition.name_key, locale);
  const announcement = definition.entry_announcement ?? `${name} 시장 진입`;
  const archetype = t(definition.archetype_key, locale);
  const weakness = t(definition.weakness_key, locale);
  const remaining = gameState.pendingChallengerEntryIds.length;

  return (
    <div
      className="big-event-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="big-event-title"
    >
      <div className={`big-event-card big-event-tier-${tier}`}>
        <header className="big-event-header">
          <span className="big-event-tier-pill">{tierLabel}</span>
          {remaining > 1 && (
            <span className="big-event-queue-pill" aria-label={`대기 사건 ${remaining - 1}건 더`}>
              +{remaining - 1}
            </span>
          )}
          <i
            className="big-event-swatch"
            style={{ background: definition.color } as CSSProperties}
            aria-hidden="true"
          />
        </header>
        <h2 id="big-event-title" className="big-event-name">{name}</h2>
        <p className="big-event-announcement">{announcement}</p>
        <dl className="big-event-meta">
          <div className="big-event-meta-row">
            <dt className="big-event-meta-label">성향</dt>
            <dd className="big-event-meta-value">{archetype}</dd>
          </div>
          <div className="big-event-meta-row big-event-meta-weakness">
            <dt className="big-event-meta-label">약점</dt>
            <dd className="big-event-meta-value">{weakness}</dd>
          </div>
        </dl>
        <button
          type="button"
          className="big-event-dismiss"
          onClick={() => setGameState((current) => dismissChallengerEntry(current))}
        >
          알겠습니다
        </button>
      </div>
    </div>
  );
}

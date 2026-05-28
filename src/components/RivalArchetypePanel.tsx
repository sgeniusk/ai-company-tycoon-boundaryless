// v0.58 #3 — 상위 압박 경쟁사 3곳의 archetype과 약점을 표시해 "어떤 경쟁사이고 어디가 약한지"를 한눈에 보여주는 derive-only 패널. getRivalCounterPlans의 pressureScore 순위를 그대로 따른다.
import type { CSSProperties } from "react";
import { competitors } from "../game/data";
import { getRivalCounterPlans } from "../game/rival-counters";
import type { GameState } from "../game/types";
import { t, type LocaleCode } from "../i18n";

const SEVERITY_LABEL: Record<string, string> = {
  contested: "선점 충돌",
  strategic: "전략 충돌",
  watch: "관찰 필요",
  low: "간접 경쟁",
};

export function RivalArchetypePanel({ gameState, locale }: { gameState: GameState; locale: LocaleCode }) {
  const plans = getRivalCounterPlans(gameState, 3);
  if (plans.length === 0) return null;

  const rivals = plans.map((plan) => {
    const definition = competitors.find((c) => c.id === plan.competitorId);
    return {
      id: plan.competitorId,
      name: plan.competitorName,
      color: definition?.color ?? "#547ad8",
      archetype: definition ? t(definition.archetype_key, locale) : "",
      weakness: definition ? t(definition.weakness_key, locale) : "",
      severity: plan.severity,
      severityLabel: SEVERITY_LABEL[plan.severity] ?? plan.label,
      pressureScore: plan.pressureScore,
    };
  });

  return (
    <section className="rival-archetype-panel" aria-label="라이벌 성향과 약점">
      <header className="rival-archetype-header">
        <strong>라이벌 성향</strong>
        <span className="rival-archetype-subtitle">상위 {rivals.length}곳의 성향과 약점</span>
      </header>
      <ul className="rival-archetype-list">
        {rivals.map((rival) => (
          <li
            key={rival.id}
            className={`rival-archetype-card rival-archetype-${rival.severity}`}
            aria-label={`${rival.name} 성향 ${rival.archetype || "정보 없음"} 약점 ${rival.weakness || "정보 없음"}`}
          >
            <header className="rival-archetype-card-header">
              <i
                className="rival-archetype-swatch"
                style={{ background: rival.color } as CSSProperties}
                aria-hidden="true"
              />
              <strong className="rival-archetype-name">{rival.name}</strong>
              <em className="rival-archetype-severity">{rival.severityLabel}</em>
            </header>
            <dl className="rival-archetype-body">
              <div className="rival-archetype-row">
                <dt className="rival-archetype-label">성향</dt>
                <dd className="rival-archetype-value">{rival.archetype || "—"}</dd>
              </div>
              <div className="rival-archetype-row rival-archetype-weakness-row">
                <dt className="rival-archetype-label">약점</dt>
                <dd className="rival-archetype-value">{rival.weakness || "—"}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}

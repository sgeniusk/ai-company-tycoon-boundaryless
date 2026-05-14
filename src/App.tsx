import { useMemo, useState } from "react";
import { capabilities, domains, products, resources } from "./game/data";
import {
  advanceMonth,
  createInitialState,
  formatResource,
  getCapabilityCheck,
  getProductCheck,
  launchProduct,
  upgradeCapability,
} from "./game/simulation";
import type { GameState } from "./game/types";

const orderedResourceIds = ["cash", "users", "compute", "data", "talent", "trust", "hype", "automation"];

function App() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());

  const launchableCount = useMemo(
    () => products.filter((product) => getProductCheck(product, gameState).ok).length,
    [gameState],
  );

  const activeProductNames = products
    .filter((product) => gameState.activeProducts.includes(product.id))
    .map((product) => product.name);

  return (
    <main className="app-shell">
      <section className="top-bar" aria-label="회사 상태">
        <div>
          <p className="eyebrow">AI 컴퍼니 타이쿤</p>
          <h1>경계 없는 회사</h1>
        </div>
        <div className="status-cluster">
          <span className="status-pill">{gameState.month}개월차</span>
          <span className={`status-pill ${gameState.status}`}>{statusLabel(gameState.status)}</span>
        </div>
      </section>

      <section className="resource-strip" aria-label="자원">
        {orderedResourceIds.map((resourceId) => (
          <article className="resource-tile" key={resourceId}>
            <span>{resources[resourceId].name}</span>
            <strong>{formatResource(resourceId, gameState.resources[resourceId] ?? 0)}</strong>
          </article>
        ))}
      </section>

      <section className="command-row" aria-label="주요 명령">
        <button className="primary-action" onClick={() => setGameState((current) => advanceMonth(current))}>
          다음 달
        </button>
        <button className="secondary-action" onClick={() => setGameState(createInitialState())}>
          새 게임
        </button>
        <p>
          출시 가능 제품 {launchableCount}개. 활성 제품: {activeProductNames.length ? activeProductNames.join(", ") : "없음"}.
        </p>
      </section>

      <section className="dashboard-grid">
        <div className="panel products-panel">
          <div className="panel-heading">
            <h2>제품</h2>
            <p>능력과 도메인을 제품으로 전환합니다.</p>
          </div>
          <div className="item-list">
            {products.map((product) => {
              const check = getProductCheck(product, gameState);
              const domain = domains.find((entry) => entry.id === product.domain);

              return (
                <article className="item-card" key={product.id}>
                  <div>
                    <p className="item-meta">{domain?.name ?? product.domain}</p>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                  </div>
                  <div className="item-footer">
                    <span>월 매출 {formatResource("cash", product.base_revenue)}</span>
                    <button
                      disabled={!check.ok || gameState.status !== "playing"}
                      onClick={() => setGameState((current) => launchProduct(product, current))}
                    >
                      출시
                    </button>
                  </div>
                  {!check.ok && <p className="locked-reason">{check.reasons.join(" / ")}</p>}
                </article>
              );
            })}
          </div>
        </div>

        <div className="panel capabilities-panel">
          <div className="panel-heading">
            <h2>AI 능력</h2>
            <p>재사용 가능한 AI 능력이 새 시장을 엽니다.</p>
          </div>
          <div className="item-list compact">
            {capabilities.map((capability) => {
              const currentLevel = gameState.capabilities[capability.id] ?? 0;
              const check = getCapabilityCheck(capability, gameState);

              return (
                <article className="capability-row" key={capability.id}>
                  <div>
                    <h3>{capability.name}</h3>
                    <p>Lv.{currentLevel} / {capability.max_level}</p>
                  </div>
                  <button
                    disabled={!check.ok || gameState.status !== "playing"}
                    onClick={() => setGameState((current) => upgradeCapability(capability, current))}
                  >
                    연구
                  </button>
                  {!check.ok && <span>{check.reasons[0]}</span>}
                </article>
              );
            })}
          </div>
        </div>

        <div className="panel timeline-panel">
          <div className="panel-heading">
            <h2>회사 기록</h2>
            <p>결정의 결과가 즉시 기록됩니다.</p>
          </div>
          <ol className="timeline">
            {gameState.timeline.map((entry, index) => (
              <li key={`${entry}-${index}`}>{entry}</li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}

function statusLabel(status: GameState["status"]): string {
  if (status === "success") return "성공 궤도";
  if (status === "failure") return "위기";
  return "운영 중";
}

export default App;

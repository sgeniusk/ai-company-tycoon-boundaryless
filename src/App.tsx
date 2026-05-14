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
      <section className="top-bar" aria-label="Company status">
        <div>
          <p className="eyebrow">AI Company Tycoon</p>
          <h1>Boundaryless Prototype</h1>
        </div>
        <div className="status-cluster">
          <span className="status-pill">Month {gameState.month}</span>
          <span className={`status-pill ${gameState.status}`}>{statusLabel(gameState.status)}</span>
        </div>
      </section>

      <section className="resource-strip" aria-label="Resources">
        {orderedResourceIds.map((resourceId) => (
          <article className="resource-tile" key={resourceId}>
            <span>{resources[resourceId].name}</span>
            <strong>{formatResource(resourceId, gameState.resources[resourceId] ?? 0)}</strong>
          </article>
        ))}
      </section>

      <section className="command-row" aria-label="Primary commands">
        <button className="primary-action" onClick={() => setGameState((current) => advanceMonth(current))}>
          Next Month
        </button>
        <button className="secondary-action" onClick={() => setGameState(createInitialState())}>
          Reset Run
        </button>
        <p>
          출시 가능 제품 {launchableCount}개. 활성 제품: {activeProductNames.length ? activeProductNames.join(", ") : "없음"}.
        </p>
      </section>

      <section className="dashboard-grid">
        <div className="panel products-panel">
          <div className="panel-heading">
            <h2>Products</h2>
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
                    <span>Revenue {formatResource("cash", product.base_revenue)} / month</span>
                    <button
                      disabled={!check.ok || gameState.status !== "playing"}
                      onClick={() => setGameState((current) => launchProduct(product, current))}
                    >
                      Launch
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
            <h2>Capabilities</h2>
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
                    Upgrade
                  </button>
                  {!check.ok && <span>{check.reasons[0]}</span>}
                </article>
              );
            })}
          </div>
        </div>

        <div className="panel timeline-panel">
          <div className="panel-heading">
            <h2>Timeline</h2>
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
  if (status === "success") return "Success trajectory";
  if (status === "failure") return "Critical failure";
  return "Operating";
}

export default App;

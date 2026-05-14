import { useMemo, useState } from "react";
import { automationUpgrades, capabilities, domains, products, resources, upgrades } from "./game/data";
import {
  advanceMonth,
  buyAutomationUpgrade,
  buyUpgrade,
  createInitialState,
  formatResource,
  getAutomationUpgradeCheck,
  getCapabilityCheck,
  getCompanyStage,
  getProductCheck,
  getUpgradeCheck,
  hydrateGameState,
  launchProduct,
  resolveEventChoice,
  serializeGameState,
  upgradeCapability,
} from "./game/simulation";
import type { GameState } from "./game/types";

const orderedResourceIds = ["cash", "users", "compute", "data", "talent", "trust", "hype", "automation"];
const saveKey = "ai-company-tycoon-alpha-save";

function App() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());

  const companyStage = getCompanyStage(gameState);
  const activeProducts = products.filter((product) => gameState.activeProducts.includes(product.id));
  const launchableCount = useMemo(
    () => products.filter((product) => getProductCheck(product, gameState).ok).length,
    [gameState],
  );
  const unlockedDomainNames = domains
    .filter((domain) => gameState.unlockedDomains.includes(domain.id))
    .map((domain) => domain.name);

  const handleSave = () => {
    window.localStorage.setItem(saveKey, serializeGameState(gameState));
    setGameState((current) => ({
      ...current,
      timeline: ["저장 완료: 창업 기록을 로컬에 보관했습니다.", ...current.timeline].slice(0, 8),
    }));
  };

  const handleLoad = () => {
    const saved = window.localStorage.getItem(saveKey);
    if (!saved) {
      setGameState((current) => ({
        ...current,
        timeline: ["불러올 저장 데이터가 없습니다.", ...current.timeline].slice(0, 8),
      }));
      return;
    }
    setGameState(hydrateGameState(saved));
  };

  return (
    <main className="app-shell">
      <section className="top-bar" aria-label="회사 상태">
        <div>
          <p className="eyebrow">AI 컴퍼니 타이쿤 알파</p>
          <h1>경계 없는 회사</h1>
        </div>
        <div className="status-cluster">
          <span className="status-pill">{gameState.month}개월차</span>
          <span className={`status-pill ${gameState.status}`}>{statusLabel(gameState.status)}</span>
          <span className="status-pill">출시 가능 {launchableCount}</span>
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

      <section className="game-stage" aria-label="AI 회사 사무실">
        <div className="office-scene">
          <div className="office-wall">
            <span>BOUNDARYLESS LAB</span>
            <span>GPU ROOM</span>
            <span>RELEASE BOARD</span>
          </div>
          <div className="office-floor">
            {Array.from({ length: Math.min(8, Math.max(1, gameState.resources.talent ?? 1)) }).map((_, index) => (
              <span className={`staff-sprite staff-${index % 4}`} key={index} />
            ))}
            <div className="server-rack">
              <i />
              <i />
              <i />
            </div>
            <div className="launch-screen">
              <strong>{activeProducts.length ? activeProducts[activeProducts.length - 1].name : "첫 제품 준비 중"}</strong>
              <span>{gameState.currentEvent ? "이슈 대응 필요" : "운영 정상"}</span>
            </div>
          </div>
        </div>

        <div className="stage-side">
          <article className="company-stage">
            <p className="eyebrow">회사 단계</p>
            <h2>{companyStage.name}</h2>
            <p>{companyStage.description}</p>
            <span>해금 분야: {unlockedDomainNames.join(", ")}</span>
          </article>
          <article className="monthly-report">
            <p className="eyebrow">월간 보고</p>
            {gameState.lastMonthReport ? (
              <dl>
                <div>
                  <dt>매출</dt>
                  <dd>{formatResource("cash", gameState.lastMonthReport.revenue)}</dd>
                </div>
                <div>
                  <dt>비용</dt>
                  <dd>{formatResource("cash", gameState.lastMonthReport.totalCost)}</dd>
                </div>
                <div>
                  <dt>신규 이용자</dt>
                  <dd>{formatResource("users", gameState.lastMonthReport.newUsers)}</dd>
                </div>
                <div>
                  <dt>연산 압박</dt>
                  <dd>-{formatResource("compute", gameState.lastMonthReport.computePressure)}</dd>
                </div>
              </dl>
            ) : (
              <p>제품을 출시하고 다음 달로 넘기면 첫 성과 보고가 올라옵니다.</p>
            )}
          </article>
        </div>
      </section>

      {gameState.currentEvent && (
        <section className="event-panel" aria-label="월간 이벤트">
          <div>
            <p className="eyebrow">긴급 이슈</p>
            <h2>{gameState.currentEvent.name}</h2>
            <p>{gameState.currentEvent.description}</p>
          </div>
          <div className="event-choices">
            {gameState.currentEvent.choices.map((choice) => (
              <button key={choice.id} onClick={() => setGameState((current) => resolveEventChoice(choice, current))}>
                <strong>{choice.text}</strong>
                <span>{choice.description}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="command-row" aria-label="주요 명령">
        <button className="primary-action" onClick={() => setGameState((current) => advanceMonth(current))}>
          다음 달
        </button>
        <button className="secondary-action" onClick={() => setGameState(createInitialState())}>
          새 게임
        </button>
        <button className="secondary-action" onClick={handleSave}>
          저장
        </button>
        <button className="secondary-action" onClick={handleLoad}>
          불러오기
        </button>
        <p>활성 제품: {activeProducts.length ? activeProducts.map((product) => product.name).join(", ") : "없음"}.</p>
      </section>

      <section className="dashboard-grid alpha-grid">
        <div className="panel products-panel">
          <div className="panel-heading">
            <h2>제품 출시</h2>
            <p>능력과 분야를 조합해 회사를 키울 제품을 냅니다.</p>
          </div>
          <div className="item-list">
            {products.map((product) => {
              const check = getProductCheck(product, gameState);
              const domain = domains.find((entry) => entry.id === product.domain);
              const review = gameState.productReviews[product.id];

              return (
                <article className="item-card product-card" key={product.id}>
                  <div>
                    <p className="item-meta">{domain?.name ?? product.domain}</p>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                  </div>
                  {review && (
                    <div className="review-badge">
                      <strong>{review.grade}</strong>
                      <span>{review.score}점</span>
                      <small>{review.quote}</small>
                    </div>
                  )}
                  <div className="item-footer">
                    <span>월 매출 {formatResource("cash", product.base_revenue)} / 이용자 +{product.base_users_per_month}</span>
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
            <h2>AI 연구</h2>
            <p>재사용 가능한 능력이 새 시장을 엽니다.</p>
          </div>
          <div className="item-list compact">
            {capabilities.slice(0, 6).map((capability) => {
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

        <div className="panel upgrades-panel">
          <div className="panel-heading">
            <h2>투자와 자동화</h2>
            <p>비용 압박을 줄이고 성장 엔진을 만듭니다.</p>
          </div>
          <div className="item-list compact">
            {upgrades.slice(0, 6).map((upgrade) => {
              const check = getUpgradeCheck(upgrade, gameState);

              return (
                <article className="upgrade-row" key={upgrade.id}>
                  <div>
                    <h3>{upgrade.name}</h3>
                    <p>{upgrade.description}</p>
                  </div>
                  <button
                    disabled={!check.ok || gameState.status !== "playing"}
                    onClick={() => setGameState((current) => buyUpgrade(upgrade, current))}
                  >
                    투자
                  </button>
                  {!check.ok && <span>{check.reasons[0]}</span>}
                </article>
              );
            })}
            {automationUpgrades.slice(0, 3).map((upgrade) => {
              const check = getAutomationUpgradeCheck(upgrade, gameState);

              return (
                <article className="upgrade-row automation-row" key={upgrade.id}>
                  <div>
                    <h3>{upgrade.name}</h3>
                    <p>{upgrade.monthly_benefit}</p>
                  </div>
                  <button
                    disabled={!check.ok || gameState.status !== "playing"}
                    onClick={() => setGameState((current) => buyAutomationUpgrade(upgrade, current))}
                  >
                    자동화
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

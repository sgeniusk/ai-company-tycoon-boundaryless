import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { agentTypes, automationUpgrades, capabilities, competitors, domains, items, products, resources, upgrades } from "./game/data";
import {
  advanceMonth,
  buyAutomationUpgrade,
  buyItem,
  buyUpgrade,
  createInitialState,
  equipItem,
  formatResource,
  getAgentEffectiveStats,
  getAgentHireCheck,
  getAutomationUpgradeCheck,
  getCapabilityCheck,
  getCompanyStage,
  getEquipItemCheck,
  getItemCheck,
  getMarketRankings,
  getPlayerMarketShare,
  getProductProjectCheck,
  getUpgradeCheck,
  hydrateGameState,
  hireAgent,
  resolveRivalEventChoice,
  resolveEventChoice,
  serializeGameState,
  startProductProject,
  upgradeCapability,
} from "./game/simulation";
import { t, type LocaleCode } from "./i18n";
import type { AgentTypeDefinition, GameState, HiredAgent, ItemDefinition, ResourceMap } from "./game/types";

type MenuId = "company" | "products" | "agents" | "research" | "shop" | "competition" | "log";

const orderedResourceIds = ["cash", "users", "compute", "data", "talent", "trust", "hype", "automation"];
const saveKey = "ai-company-tycoon-alpha-save";
const menus: Array<{ id: MenuId; label: string; hint: string }> = [
  { id: "company", label: "회사", hint: "현황" },
  { id: "products", label: "제품", hint: "출시" },
  { id: "agents", label: "에이전트", hint: "능력치" },
  { id: "research", label: "연구", hint: "AI 능력" },
  { id: "shop", label: "상점", hint: "아이템" },
  { id: "competition", label: "경쟁", hint: "시장" },
  { id: "log", label: "기록", hint: "히스토리" },
];

function App() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());
  const [activeMenu, setActiveMenu] = useState<MenuId>("company");
  const [locale, setLocale] = useState<LocaleCode>("ko");

  const companyStage = getCompanyStage(gameState);
  const activeProducts = products.filter((product) => gameState.activeProducts.includes(product.id));
  const playerMarketShare = getPlayerMarketShare(gameState);
  const launchableCount = useMemo(
    () => products.filter((product) => getProductProjectCheck(product, gameState).ok).length,
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
          <span className="status-pill">개발 중 {gameState.productProjects.length}</span>
          <span className="status-pill">점유 {playerMarketShare}%</span>
          <button className="locale-toggle" onClick={() => setLocale((current) => (current === "ko" ? "en" : "ko"))}>
            {locale.toUpperCase()}
          </button>
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
            {Array.from({ length: Math.min(8, Math.max(1, gameState.hiredAgents.length || gameState.resources.talent || 1)) }).map((_, index) => (
              <span className={`staff-sprite staff-${index % 4}`} key={index} />
            ))}
            <div className="server-rack">
              <i />
              <i />
              <i />
            </div>
            <div className="launch-screen">
              <strong>{activeProducts.length ? activeProducts[activeProducts.length - 1].name : "첫 제품 준비 중"}</strong>
              <span>{gameState.productProjects.length ? `${gameState.productProjects[0].progress}% 개발 중` : gameState.currentEvent ? "이슈 대응 필요" : "운영 정상"}</span>
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

      {gameState.currentRivalEvent && (
        <section className="event-panel rival-event-panel" aria-label="경쟁사 이벤트">
          <div>
            <p className="eyebrow">경쟁사 이슈</p>
            <h2>{t(gameState.currentRivalEvent.name_key, locale)}</h2>
            <p>{t(gameState.currentRivalEvent.description_key, locale)}</p>
          </div>
          <div className="event-choices">
            {gameState.currentRivalEvent.choices.map((choice) => (
              <button key={choice.id} onClick={() => setGameState((current) => resolveRivalEventChoice(choice, current))}>
                <strong>{t(choice.text_key, locale)}</strong>
                <span>{t(choice.description_key, locale)}</span>
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

      <section className="menu-layout" aria-label="경영 메뉴">
        <nav className="main-menu">
          {menus.map((menu) => (
            <button className={activeMenu === menu.id ? "active" : ""} key={menu.id} onClick={() => setActiveMenu(menu.id)}>
              <strong>{menu.label}</strong>
              <span>{menu.hint}</span>
            </button>
          ))}
        </nav>
        <div className="menu-panel">{renderMenuContent(activeMenu, gameState, setGameState, locale)}</div>
      </section>
    </main>
  );
}

function renderMenuContent(
  activeMenu: MenuId,
  gameState: GameState,
  setGameState: Dispatch<SetStateAction<GameState>>,
  locale: LocaleCode,
) {
  if (activeMenu === "company") {
    return (
      <div className="panel-grid two-col">
        <section className="panel">
          <div className="panel-heading">
            <h2>회사 개요</h2>
            <p>성장 단계, 해금 분야, 활성 제품을 한눈에 봅니다.</p>
          </div>
          <div className="company-summary">
            <strong>{getCompanyStage(gameState).name}</strong>
            <span>활성 제품 {gameState.activeProducts.length}개</span>
            <span>개발 프로젝트 {gameState.productProjects.length}개</span>
            <span>고용 에이전트 {gameState.hiredAgents.length}명</span>
            <span>보유 아이템 {gameState.ownedItems.length}개</span>
            <span>해금 분야 {gameState.unlockedDomains.length}개</span>
            <span>자동화 {formatResource("automation", gameState.resources.automation ?? 0)}</span>
          </div>
        </section>
        <TimelinePanel gameState={gameState} />
      </div>
    );
  }

  if (activeMenu === "products") {
    return <ProductsPanel gameState={gameState} setGameState={setGameState} locale={locale} />;
  }

  if (activeMenu === "agents") {
    return <AgentsPanel gameState={gameState} setGameState={setGameState} />;
  }

  if (activeMenu === "research") {
    return <ResearchPanel gameState={gameState} setGameState={setGameState} />;
  }

  if (activeMenu === "shop") {
    return <ShopPanel gameState={gameState} setGameState={setGameState} />;
  }

  if (activeMenu === "competition") {
    return <CompetitionPanel gameState={gameState} locale={locale} />;
  }

  return <TimelinePanel gameState={gameState} />;
}

function ProductsPanel({
  gameState,
  setGameState,
  locale,
}: {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  locale: LocaleCode;
}) {
  return (
    <section className="panel products-panel">
      <div className="panel-heading">
        <h2>제품 개발</h2>
        <p>에이전트를 투입해 제품을 만들고, 완성되면 시장에 출시합니다.</p>
      </div>
      {!gameState.hiredAgents.length && <p className="empty-note">먼저 에이전트 메뉴에서 첫 에이전트를 고용하면 제품 개발을 시작할 수 있습니다.</p>}
      <div className="item-list products-list">
        {products.map((product) => {
          const check = getProductProjectCheck(product, gameState);
          const domain = domains.find((entry) => entry.id === product.domain);
          const review = gameState.productReviews[product.id];
          const project = gameState.productProjects.find((entry) => entry.productId === product.id);
          const isActive = gameState.activeProducts.includes(product.id);
          const claimers = gameState.competitorStates.filter((competitor) => competitor.claimedProducts.includes(product.id));

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
              {project && (
                <div className="project-meter">
                  <div>
                    <strong>개발 {Math.round(project.progress)}%</strong>
                    <span>완성도 {Math.round(project.quality)}</span>
                  </div>
                  <i style={{ width: `${project.progress}%` }} />
                </div>
              )}
              {claimers.length > 0 && (
                <div className="claim-list">
                  {claimers.map((claimer) => {
                    const competitor = competitors.find((entry) => entry.id === claimer.id);
                    return <span key={claimer.id}>경쟁 선점: {competitor ? t(competitor.name_key, locale) : claimer.id}</span>;
                  })}
                </div>
              )}
              <div className="item-footer">
                <span>월 매출 {formatResource("cash", product.base_revenue)} / 이용자 +{product.base_users_per_month}</span>
                <button
                  disabled={!check.ok || gameState.status !== "playing" || Boolean(project) || isActive}
                  onClick={() => setGameState((current) => startProductProject(product, current))}
                >
                  {isActive ? "운영 중" : project ? "개발 중" : "개발 시작"}
                </button>
              </div>
              {!check.ok && <p className="locked-reason">{check.reasons.join(" / ")}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AgentsPanel({ gameState, setGameState }: { gameState: GameState; setGameState: Dispatch<SetStateAction<GameState>> }) {
  const ownedAgentItems = items.filter(
    (item) =>
      item.target === "agent" &&
      gameState.ownedItems.includes(item.id) &&
      !gameState.hiredAgents.some((agent) => agent.equippedItemIds.includes(item.id)),
  );

  return (
    <div className="panel-grid two-col">
      <section className="panel">
        <div className="panel-heading">
          <h2>고용 에이전트</h2>
          <p>현재 팀, 장착 아이템, 개발 배치를 관리합니다.</p>
        </div>
        {gameState.hiredAgents.length ? (
          <div className="hired-list">
            {gameState.hiredAgents.map((agent) => (
              <HiredAgentCard agent={agent} gameState={gameState} ownedAgentItems={ownedAgentItems} setGameState={setGameState} key={agent.id} />
            ))}
          </div>
        ) : (
          <p className="empty-note">아직 고용한 에이전트가 없습니다. 오른쪽 도감에서 첫 에이전트를 영입하세요.</p>
        )}
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>에이전트 도감</h2>
          <p>능력치, 역할, 픽셀아트 외형 키워드를 기준으로 영입합니다.</p>
        </div>
        <div className="agent-grid">
          {agentTypes.map((agent) => {
            const check = getAgentHireCheck(agent, gameState);
            const isHired = gameState.hiredAgents.some((hiredAgent) => hiredAgent.typeId === agent.id);

            return (
              <AgentCard
                agent={agent}
                check={check}
                isHired={isHired}
                key={agent.id}
                onHire={() => setGameState((current) => hireAgent(agent, current))}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function HiredAgentCard({
  agent,
  gameState,
  ownedAgentItems,
  setGameState,
}: {
  agent: HiredAgent;
  gameState: GameState;
  ownedAgentItems: ItemDefinition[];
  setGameState: Dispatch<SetStateAction<GameState>>;
}) {
  const agentType = agentTypes.find((type) => type.id === agent.typeId);
  const stats = getAgentEffectiveStats(agent, gameState);
  const equippedItems = items.filter((item) => agent.equippedItemIds.includes(item.id));
  const assignedProject = gameState.productProjects.find((project) => project.id === agent.assignment);
  const assignedProduct = assignedProject ? products.find((product) => product.id === assignedProject.productId) : undefined;

  return (
    <article className="hired-card">
      <div className="agent-top">
        <div className="agent-portrait compact" aria-hidden="true">
          <span className="agent-head" />
          <span className="agent-body" />
          <span className="agent-prop" />
        </div>
        <div>
          <p className="item-meta">{agentType?.role ?? "에이전트"}</p>
          <h3>{agent.name}</h3>
          <p>{assignedProduct ? `${assignedProduct.name} 개발 중` : "대기 중"}</p>
        </div>
      </div>
      <div className="stat-grid">
        {Object.entries(stats).map(([stat, value]) => (
          <span key={stat}>
            {statLabel(stat)} <strong>{value}</strong>
          </span>
        ))}
      </div>
      <div className="mini-row">
        <span>Lv.{agent.level}</span>
        <span>체력 {agent.energy}</span>
        <span>장착 {equippedItems.length}/2</span>
      </div>
      <div className="equip-row">
        {equippedItems.length ? (
          equippedItems.map((item) => <span key={item.id}>{item.name}</span>)
        ) : (
          <span>장착 아이템 없음</span>
        )}
      </div>
      <div className="equip-actions">
        {ownedAgentItems.length ? (
          ownedAgentItems.slice(0, 3).map((item) => {
            const check = getEquipItemCheck(agent.id, item, gameState);
            return (
              <button
                disabled={!check.ok || gameState.status !== "playing"}
                key={item.id}
                onClick={() => setGameState((current) => equipItem(agent.id, item, current))}
              >
                {item.name} 장착
              </button>
            );
          })
        ) : (
          <small>상점에서 장비를 구매하면 장착할 수 있습니다.</small>
        )}
      </div>
    </article>
  );
}

function AgentCard({
  agent,
  check,
  isHired,
  onHire,
}: {
  agent: AgentTypeDefinition;
  check: { ok: boolean; reasons: string[] };
  isHired: boolean;
  onHire: () => void;
}) {
  return (
    <article className={`agent-card rarity-${agent.rarity}`}>
      <div className="agent-top">
        <div className="agent-portrait" aria-hidden="true">
          <span className="agent-head" />
          <span className="agent-body" />
          <span className="agent-prop" />
        </div>
        <div>
          <p className="item-meta">{agent.role}</p>
          <h3>{agent.name}</h3>
          <p>{agent.description}</p>
        </div>
      </div>
      <div className="stat-grid">
        {Object.entries(agent.stats).map(([stat, value]) => (
          <span key={stat}>
            {statLabel(stat)} <strong>{value}</strong>
          </span>
        ))}
      </div>
      <div className="appearance-box">
        <strong>외형</strong>
        <span>{agent.appearance.silhouette}</span>
        <span>{agent.appearance.hair}</span>
        <span>{agent.appearance.outfit}</span>
        <span>소품: {agent.appearance.signatureProp}</span>
      </div>
      <p className="agent-quirk">{agent.quirk}</p>
      <div className="item-footer">
        <span>영입 비용 {formatCost(agent.hire_cost)} / 유지 {formatCost(agent.upkeep)}</span>
        <button disabled={!check.ok || isHired} onClick={onHire}>
          {isHired ? "고용됨" : "고용"}
        </button>
      </div>
      {!check.ok && <p className="locked-reason">{check.reasons.join(" / ")}</p>}
    </article>
  );
}

function ResearchPanel({ gameState, setGameState }: { gameState: GameState; setGameState: Dispatch<SetStateAction<GameState>> }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>AI 연구</h2>
        <p>재사용 가능한 능력이 새 시장을 엽니다.</p>
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
    </section>
  );
}

function ShopPanel({ gameState, setGameState }: { gameState: GameState; setGameState: Dispatch<SetStateAction<GameState>> }) {
  return (
    <div className="panel-grid two-col">
      <section className="panel">
        <div className="panel-heading">
          <h2>아이템 상점</h2>
          <p>장비와 사무실 물건은 에이전트 특색과 회사 분위기를 만듭니다.</p>
        </div>
        <div className="item-grid">
          {items.map((item) => (
            <ItemCard item={item} gameState={gameState} setGameState={setGameState} key={item.id} />
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>투자와 자동화</h2>
          <p>비용 압박을 줄이고 성장 엔진을 만듭니다.</p>
        </div>
        <div className="item-list compact">
          {upgrades.slice(0, 8).map((upgrade) => {
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
          {automationUpgrades.slice(0, 4).map((upgrade) => {
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
      </section>
    </div>
  );
}

function ItemCard({
  item,
  gameState,
  setGameState,
}: {
  item: ItemDefinition;
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
}) {
  const check = getItemCheck(item, gameState);
  const isOwned = gameState.ownedItems.includes(item.id);

  return (
    <article className={`item-shop-card rarity-${item.rarity}`}>
      <p className="item-meta">{itemCategoryLabel(item.category)} / {item.rarity}</p>
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <div className="mini-row">
        <span>비용 {formatCost(item.cost)}</span>
        <span>대상 {itemTargetLabel(item.target)}</span>
        <span>효과 {formatEffects(item.effects)}</span>
      </div>
      <button disabled={!check.ok || isOwned || gameState.status !== "playing"} onClick={() => setGameState((current) => buyItem(item, current))}>
        {isOwned ? "보유 중" : "구매"}
      </button>
      {!check.ok && <p className="locked-reason">{check.reasons.join(" / ")}</p>}
      <small>{item.flavor}</small>
    </article>
  );
}

function CompetitionPanel({ gameState, locale }: { gameState: GameState; locale: LocaleCode }) {
  const rankings = getMarketRankings(gameState);

  return (
    <div className="panel-grid two-col">
      <section className="panel">
        <div className="panel-heading">
          <h2>경쟁사 랭킹</h2>
          <p>AI 시장 점유율과 경쟁사의 최근 움직임을 봅니다.</p>
        </div>
        <div className="ranking-list">
          {rankings.map((ranking, index) => {
            const competitor = competitors.find((entry) => entry.id === ranking.id);
            const label = ranking.isPlayer ? t("ui.playerCompany", locale) : competitor ? t(competitor.name_key, locale) : ranking.id;

            return (
              <article className={`ranking-card ${ranking.isPlayer ? "player-rank" : ""}`} key={ranking.id}>
                <div className="rank-badge">{index + 1}</div>
                <div>
                  <h3>{label}</h3>
                  <p>{ranking.isPlayer ? "제품 출시와 신뢰를 바탕으로 시장을 넓히는 중" : competitor ? t(competitor.tagline_key, locale) : ranking.lastMove}</p>
                </div>
                <strong>{ranking.marketShare}%</strong>
                <span>{ranking.lastMove}</span>
              </article>
            );
          })}
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>경쟁사 프로필</h2>
          <p>각 회사의 성향과 선점한 제품 공간입니다.</p>
        </div>
        <div className="competitor-grid">
          {gameState.competitorStates.map((state) => {
            const competitor = competitors.find((entry) => entry.id === state.id);
            const claimedProducts = products.filter((product) => state.claimedProducts.includes(product.id));
            if (!competitor) return null;

            return (
              <article className="competitor-card" style={{ borderColor: competitor.color }} key={state.id}>
                <p className="item-meta">{t(competitor.archetype_key, locale)}</p>
                <h3>{t(competitor.name_key, locale)}</h3>
                <p>{t(competitor.weakness_key, locale)}</p>
                <div className="market-meter">
                  <i style={{ width: `${state.marketShare}%`, background: competitor.color }} />
                </div>
                <div className="mini-row">
                  <span>점유 {state.marketShare}%</span>
                  <span>위협 {Math.round(state.score)}</span>
                  <span>연구 Lv.{state.researchLevel}</span>
                </div>
                <div className="claim-list">
                  {claimedProducts.length ? claimedProducts.map((product) => <span key={product.id}>{product.name}</span>) : <span>선점 제품 없음</span>}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function TimelinePanel({ gameState }: { gameState: GameState }) {
  return (
    <section className="panel timeline-panel">
      <div className="panel-heading">
        <h2>회사 기록</h2>
        <p>결정의 결과가 즉시 기록됩니다.</p>
      </div>
      <ol className="timeline">
        {gameState.timeline.map((entry, index) => (
          <li key={`${entry}-${index}`}>{entry}</li>
        ))}
      </ol>
    </section>
  );
}

function statusLabel(status: GameState["status"]): string {
  if (status === "success") return "성공 궤도";
  if (status === "failure") return "위기";
  return "운영 중";
}

function statLabel(stat: string): string {
  const labels: Record<string, string> = {
    research: "연구",
    engineering: "개발",
    product: "제품",
    growth: "성장",
    safety: "안전",
    operations: "운영",
    creativity: "창의",
    autonomy: "자율",
  };
  return labels[stat] ?? stat;
}

function itemCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    office: "사무실",
    equipment: "장비",
    research: "연구",
    safety: "안전",
    marketing: "마케팅",
  };
  return labels[category] ?? category;
}

function itemTargetLabel(target: string): string {
  const labels: Record<string, string> = {
    agent: "에이전트",
    office: "사무실",
    company: "회사",
  };
  return labels[target] ?? target;
}

function formatCost(cost: ResourceMap): string {
  return Object.entries(cost)
    .map(([resourceId, value]) => `${resources[resourceId]?.name ?? resourceId} ${formatResource(resourceId, value)}`)
    .join(", ");
}

function formatEffects(effects: Record<string, number>): string {
  return Object.entries(effects)
    .map(([key, value]) => `${resources[key]?.name ?? statLabel(key)} +${value}`)
    .join(", ");
}

export default App;

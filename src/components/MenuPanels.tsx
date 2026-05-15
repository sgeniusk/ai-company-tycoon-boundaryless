import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { agentTypes, assetManifest, automationUpgrades, capabilities, competitors, domains, items, products, upgrades } from "../game/data";
import { getGrowthPathCompetitionSignals } from "../game/competition-signals";
import {
  buyAutomationUpgrade,
  buyItem,
  buyUpgrade,
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
  getProductProjectCheck,
  getUpgradeCheck,
  hireAgent,
  startProductProject,
  upgradeCapability,
} from "../game/simulation";
import type { AgentSpriteDefinition, CompetitorIdentityDefinition, GameState, HiredAgent, ItemDefinition, ItemIconDefinition, AgentTypeDefinition } from "../game/types";
import { t, type LocaleCode } from "../i18n";
import { formatCost, formatEffects, itemCategoryLabel, itemTargetLabel, statLabel } from "../ui/formatters";
import type { MenuId } from "../ui/menu";

function assetPaletteVars(palette?: string[]): CSSProperties {
  if (!palette?.length) return {};

  return {
    "--sprite-primary": palette[0],
    "--sprite-secondary": palette[1] ?? palette[0],
    "--sprite-accent": palette[2] ?? palette[0],
  } as CSSProperties;
}

function getAgentSprite(agentTypeId?: string): AgentSpriteDefinition | undefined {
  if (!agentTypeId) return undefined;
  return assetManifest.agent_sprites.find((sprite) => sprite.agent_type_id === agentTypeId);
}

function getCompetitorIdentity(competitorId: string): CompetitorIdentityDefinition | undefined {
  return assetManifest.competitor_identities.find((identity) => identity.competitor_id === competitorId);
}

function getItemIcon(itemId: string): ItemIconDefinition | undefined {
  return assetManifest.item_icons.find((icon) => icon.item_id === itemId);
}

export function renderMenuContent(
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
  const agentSprite = getAgentSprite(agentType?.id);

  return (
    <article className="hired-card">
      <div className="agent-top">
        <div
          className={`agent-portrait compact ${agentSprite?.body_class ?? ""}`}
          style={assetPaletteVars(agentSprite?.palette)}
          aria-hidden="true"
        >
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
  const agentSprite = getAgentSprite(agent.id);

  return (
    <article className={`agent-card rarity-${agent.rarity}`}>
      <div className="agent-top">
        <div
          className={`agent-portrait ${agentSprite?.body_class ?? ""}`}
          style={assetPaletteVars(agentSprite?.palette)}
          aria-hidden="true"
        >
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
  const itemIcon = getItemIcon(item.id);

  return (
    <article className={`item-shop-card rarity-${item.rarity}`}>
      <p className="item-meta">{itemCategoryLabel(item.category)} / {item.rarity}</p>
      <div className="item-title-row">
        {itemIcon && (
          <span
            className={`item-icon ${itemIcon.icon_class}`}
            style={assetPaletteVars(itemIcon.palette)}
            aria-hidden="true"
          />
        )}
        <h3>{item.name}</h3>
      </div>
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
  const strategySignals = getGrowthPathCompetitionSignals(gameState);

  return (
    <div className="panel-grid two-col">
      <section className="panel">
        <div className="panel-heading">
          <h2>경쟁사 랭킹</h2>
          <p>{gameState.chosenGrowthPath ? `${gameState.chosenGrowthPath.title} 전략과 부딪히는 경쟁사를 확인합니다.` : "AI 시장 점유율과 경쟁사의 최근 움직임을 봅니다."}</p>
        </div>
        <div className="ranking-list">
          {rankings.map((ranking, index) => {
            const competitor = competitors.find((entry) => entry.id === ranking.id);
            const label = ranking.isPlayer ? t("ui.playerCompany", locale) : competitor ? t(competitor.name_key, locale) : ranking.id;
            const signal = strategySignals.find((entry) => entry.competitorId === ranking.id);

            return (
              <article className={`ranking-card ${ranking.isPlayer ? "player-rank" : ""}`} key={ranking.id}>
                <div className="rank-badge">{index + 1}</div>
                <div>
                  <h3>{label}</h3>
                  <p>{ranking.isPlayer ? "제품 출시와 신뢰를 바탕으로 시장을 넓히는 중" : competitor ? t(competitor.tagline_key, locale) : ranking.lastMove}</p>
                </div>
                <strong>{ranking.marketShare}%</strong>
                {signal && <em className={`signal-badge signal-${signal.severity}`}>{signal.label}</em>}
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
            const identity = getCompetitorIdentity(state.id);
            const claimedProducts = products.filter((product) => state.claimedProducts.includes(product.id));
            const signal = strategySignals.find((entry) => entry.competitorId === state.id);
            if (!competitor) return null;

            return (
              <article className={`competitor-card ${signal ? `signal-${signal.severity}` : ""}`} style={{ borderColor: competitor.color }} key={state.id}>
                <div className="competitor-top">
                  <div
                    className={`competitor-logo ${identity?.logo_class ?? ""}`}
                    style={assetPaletteVars(identity?.palette)}
                    aria-hidden="true"
                  >
                    <span />
                  </div>
                  <div>
                    <p className="item-meta">{t(competitor.archetype_key, locale)}</p>
                    <h3>{t(competitor.name_key, locale)}</h3>
                    <p>{t(competitor.weakness_key, locale)}</p>
                  </div>
                </div>
                <div className="market-meter">
                  <i style={{ width: `${state.marketShare}%`, background: competitor.color }} />
                </div>
                <div className="mini-row">
                  <span>점유 {state.marketShare}%</span>
                  <span>위협 {Math.round(state.score)}</span>
                  <span>연구 Lv.{state.researchLevel}</span>
                </div>
                {signal && (
                  <div className="strategy-signal">
                    <strong>{signal.label}</strong>
                    <span>{signal.reason}</span>
                  </div>
                )}
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

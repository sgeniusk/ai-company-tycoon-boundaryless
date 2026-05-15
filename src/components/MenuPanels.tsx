import { useEffect, useState, type CSSProperties, type Dispatch, type SetStateAction } from "react";
import { agentTypes, assetManifest, automationUpgrades, capabilities, competitors, domains, items, metaUnlocks, products, strategyCards, upgrades } from "../game/data";
import { getAchievementStatuses } from "../game/achievements";
import { getGrowthPathCompetitionSignals } from "../game/competition-signals";
import { getGrowthPathObjectives } from "../game/growth-objectives";
import { getTenMonthArc } from "../game/ten-month-arc";
import {
  createDevelopmentPuzzle,
  getDevelopmentPuzzleResolveCheck,
  getDevelopmentPuzzleSelectionLimit,
  resolveDevelopmentPuzzle,
} from "../game/development-puzzle";
import {
  chooseCardReward,
  getCardRewardChoiceCheck,
  getDeckCardCounts,
  getDeckEditCheck,
  getStrategyCardById,
  getStrategyCardEffects,
  getStrategyCardPlayCheck,
  playStrategyCard,
  removeStrategyCardFromDeck,
  upgradeStrategyCard,
} from "../game/deckbuilding";
import { getMetaUnlockCheck, getRunInsightReward, resetRunWithMetaUnlocks } from "../game/meta-progression";
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
  getProductLevel,
  getProductProjectForecast,
  getProductProjectCheck,
  getProductUpgradeCheck,
  getProductUpgradeCost,
  getUpgradeCheck,
  hireAgent,
  startProductProject,
  upgradeCapability,
  upgradeProduct,
} from "../game/simulation";
import type {
  AgentSpriteDefinition,
  AgentTypeDefinition,
  CompetitorIdentityDefinition,
  GameState,
  HiredAgent,
  ItemDefinition,
  ItemIconDefinition,
  StrategyCardDefinition,
} from "../game/types";
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
    const growthObjectives = getGrowthPathObjectives(gameState);
    const tenMonthArc = getTenMonthArc(gameState);
    const achievementStatuses = getAchievementStatuses(gameState);
    const unlockedAchievementCount = achievementStatuses.filter((achievement) => achievement.unlocked).length;

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
            {gameState.chosenGrowthPath && (
              <span className="strategy-summary">
                전략 {gameState.chosenGrowthPath.title} · 월간 {formatEffects(gameState.chosenGrowthPath.monthlyEffects)}
              </span>
            )}
          </div>
          <div className="ten-month-arc">
            <div>
              <h3>{tenMonthArc.summary}</h3>
              <strong>{tenMonthArc.progressPercent}%</strong>
            </div>
            <div className="arc-meter">
              <i style={{ width: `${tenMonthArc.progressPercent}%` }} />
            </div>
            <ol>
              {tenMonthArc.milestones.map((milestone) => (
                <li className={milestone.complete ? "complete" : ""} key={milestone.id}>
                  <strong>{milestone.title}</strong>
                  <span>{milestone.detail}</span>
                </li>
              ))}
            </ol>
          </div>
          {growthObjectives.length > 0 && (
            <div className="strategy-objectives">
              <h3>전략 후속 목표</h3>
              {growthObjectives.map((objective) => (
                <article className={objective.complete ? "complete" : ""} key={objective.id}>
                  <strong>{objective.label}</strong>
                  <span>{objective.description}</span>
                </article>
              ))}
            </div>
          )}
          <div className="achievement-block">
            <div>
              <h3>상용 런 목표</h3>
              <strong>{unlockedAchievementCount}/{achievementStatuses.length}</strong>
            </div>
            <div className="achievement-list">
              {achievementStatuses.map((achievement) => (
                <article className={achievement.unlocked ? "complete" : ""} key={achievement.id}>
                  <strong>{achievement.title}</strong>
                  <span>{achievement.progressLabel}</span>
                  <small>{achievement.unlocked ? "완료" : achievement.description}</small>
                </article>
              ))}
            </div>
          </div>
        </section>
        <TimelinePanel gameState={gameState} />
      </div>
    );
  }

  if (activeMenu === "products") {
    return <ProductsPanel gameState={gameState} setGameState={setGameState} locale={locale} />;
  }

  if (activeMenu === "deck") {
    return <DeckPanel gameState={gameState} setGameState={setGameState} />;
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

function DeckPanel({ gameState, setGameState }: { gameState: GameState; setGameState: Dispatch<SetStateAction<GameState>> }) {
  const [selectedPuzzleTileIds, setSelectedPuzzleTileIds] = useState<string[]>([]);
  const deck = gameState.roguelite.deck;
  const handCards = deck.hand.map((cardId) => getStrategyCardById(cardId)).filter((card): card is StrategyCardDefinition => Boolean(card));
  const deckCards = getDeckCardCounts(deck)
    .map(({ cardId, count }) => ({ card: getStrategyCardById(cardId), count }))
    .filter((entry): entry is { card: StrategyCardDefinition; count: number } => Boolean(entry.card));
  const pendingReward = gameState.roguelite.pendingCardReward;
  const upgradedCardIds = new Set(gameState.roguelite.upgradedCardIds);
  const activeProject = gameState.productProjects[0];
  const activeProduct = activeProject ? products.find((product) => product.id === activeProject.productId) : undefined;
  const puzzle = activeProject ? createDevelopmentPuzzle(activeProject.id, gameState) : undefined;
  const projectedInsight = gameState.roguelite.founderInsight + getRunInsightReward(gameState);
  const selectionLimit = getDevelopmentPuzzleSelectionLimit(gameState, activeProject?.id);
  const resolveCheck = activeProject ? getDevelopmentPuzzleResolveCheck(activeProject.id, selectedPuzzleTileIds, gameState) : undefined;

  useEffect(() => {
    if (!puzzle) {
      setSelectedPuzzleTileIds([]);
      return;
    }

    const tileIds = new Set(puzzle.tiles.map((tile) => tile.id));
    setSelectedPuzzleTileIds((current) => {
      const filtered = current.filter((tileId) => tileIds.has(tileId)).slice(0, selectionLimit);
      if (filtered.length) return filtered;
      return puzzle.tiles.slice(0, Math.min(4, selectionLimit)).map((tile) => tile.id);
    });
  }, [activeProject?.id, puzzle?.tiles.length, selectionLimit, gameState.activeDevelopmentPuzzleModifiers.length]);

  const togglePuzzleTile = (tileId: string) => {
    setSelectedPuzzleTileIds((current) => {
      if (current.includes(tileId)) return current.filter((entry) => entry !== tileId);
      if (current.length >= selectionLimit) return current;
      return [...current, tileId];
    });
  };

  const resolveSelectedPuzzleTiles = () => {
    if (!activeProject) return;
    setGameState((current) => resolveDevelopmentPuzzle(activeProject.id, selectedPuzzleTileIds, current));
    setSelectedPuzzleTileIds([]);
  };

  return (
    <div className="panel-grid two-col deck-layout">
      <section className="panel">
        <div className="panel-heading">
          <h2>전략 덱</h2>
          <p>카드는 제품 개발에 직접 개입하는 짧은 선택지입니다. 비용과 효과가 즉시 반영됩니다.</p>
        </div>
        <div className="run-summary-strip">
          <span>런 {gameState.roguelite.runNumber}</span>
          <span>창업 통찰 {gameState.roguelite.founderInsight}</span>
          <span>이번 런 보상 예상 +{getRunInsightReward(gameState)}</span>
          <span>드로우 {deck.drawPile.length}</span>
          <span>버림 {deck.discardPile.length}</span>
          <span>편집 토큰 {gameState.roguelite.deckEditTokens}</span>
          <span>{pendingReward ? "보상 선택 대기" : "보상 없음"}</span>
        </div>
        <div className="card-hand">
          {handCards.map((card) => {
            const check = getStrategyCardPlayCheck(card, gameState);
            const effects = getStrategyCardEffects(card, gameState);
            return (
              <article className={`strategy-card rarity-${card.rarity}${upgradedCardIds.has(card.id) ? " upgraded" : ""}`} key={card.id}>
                <p className="item-meta">{card.category} / {card.rarity}</p>
                <h3>{card.name}</h3>
                <p>{card.description}</p>
                <div className="mini-row">
                  <span>비용 {formatCost(card.cost)}</span>
                  <span>효과 {formatEffects(effects)}</span>
                </div>
                <button disabled={!check.ok} onClick={() => setGameState((current) => playStrategyCard(card, current))}>
                  사용
                </button>
                {!check.ok && <small>{check.reasons.join(" / ")}</small>}
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>카드 보상과 덱 편집</h2>
          <p>출시 성과는 다음 제품에 영향을 주는 카드 선택과 덱 정리 기회로 이어집니다.</p>
        </div>
        <div className="deck-token-strip">
          <span>편집 토큰 {gameState.roguelite.deckEditTokens}</span>
          <span>강화 {gameState.roguelite.upgradedCardIds.length}장</span>
          <span>보상 선택 {gameState.roguelite.rewardHistory.length}회</span>
        </div>
        {pendingReward ? (
          <div className="reward-choice-block">
            <div className="reward-choice-heading">
              <strong>{pendingReward.productName} 출시 보상</strong>
              <span>리뷰 {pendingReward.reviewGrade} · 3택1</span>
            </div>
            <div className="reward-choice-list">
              {pendingReward.offeredCardIds.map((cardId) => {
                const card = getStrategyCardById(cardId);
                if (!card) return null;
                const check = getCardRewardChoiceCheck(card.id, gameState);
                const effects = getStrategyCardEffects(card, gameState);
                return (
                  <article className={`strategy-card reward-choice rarity-${card.rarity}`} key={card.id}>
                    <p className="item-meta">{card.category} / {card.rarity}</p>
                    <h3>{card.name}</h3>
                    <p>{card.description}</p>
                    <div className="mini-row">
                      <span>비용 {formatCost(card.cost)}</span>
                      <span>효과 {formatEffects(effects)}</span>
                    </div>
                    <button disabled={!check.ok} onClick={() => setGameState((current) => chooseCardReward(card.id, current))}>
                      덱에 추가
                    </button>
                    {!check.ok && <small>{check.reasons.join(" / ")}</small>}
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="empty-note">제품을 완성하면 출시 리뷰에 맞춘 카드 보상 3장이 표시됩니다.</p>
        )}
        <div className="deck-edit-list">
          {deckCards.map(({ card, count }) => {
            const removeCheck = getDeckEditCheck("remove", card.id, gameState);
            const upgradeCheck = getDeckEditCheck("upgrade", card.id, gameState);
            const effects = getStrategyCardEffects(card, gameState);
            const upgraded = upgradedCardIds.has(card.id);

            return (
              <article className={upgraded ? "deck-edit-card upgraded" : "deck-edit-card"} key={card.id}>
                <div>
                  <p className="item-meta">{card.category} / {card.rarity}</p>
                  <h3>{card.name}</h3>
                  <span>{count}장 · {formatEffects(effects)}</span>
                  {!removeCheck.ok && !upgradeCheck.ok && <small>{removeCheck.reasons[0] ?? upgradeCheck.reasons[0]}</small>}
                </div>
                <div className="deck-edit-actions">
                  <button
                    disabled={!upgradeCheck.ok}
                    onClick={() => setGameState((current) => upgradeStrategyCard(card.id, current))}
                    type="button"
                  >
                    {upgraded ? "강화됨" : "강화"}
                  </button>
                  <button
                    disabled={!removeCheck.ok}
                    onClick={() => setGameState((current) => removeStrategyCardFromDeck(card.id, current))}
                    type="button"
                  >
                    제거
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>개발 이슈 대응</h2>
          <p>{activeProduct ? `${activeProduct.name}의 막힌 지점을 골라 추가 완성도를 얻습니다.` : "직원과 에이전트가 월마다 기본 개발을 진행하고, 이슈 대응은 선택형 보너스로 둡니다."}</p>
        </div>
        {puzzle && activeProject ? (
          <>
            <div className="puzzle-status-row">
              <span>
                선택 {selectedPuzzleTileIds.length}/{selectionLimit}
              </span>
              <span>{gameState.activeDevelopmentPuzzleModifiers.length ? "카드 보정 적용 중" : "카드 보정 없음"}</span>
            </div>
            {gameState.activeDevelopmentPuzzleModifiers.length > 0 && (
              <div className="puzzle-modifier-list">
                {gameState.activeDevelopmentPuzzleModifiers.map((modifier) => (
                  <span key={modifier.id}>
                    {modifier.label}: 점수 +{modifier.scoreBonus}, 난이도 {modifier.difficultyDelta}, 선택 +{modifier.tileLimitBonus}
                  </span>
                ))}
              </div>
            )}
            <div className="puzzle-board">
              {puzzle.tiles.map((tile) => (
                <button
                  aria-pressed={selectedPuzzleTileIds.includes(tile.id)}
                  className={selectedPuzzleTileIds.includes(tile.id) ? "selected" : ""}
                  key={tile.id}
                  onClick={() => togglePuzzleTile(tile.id)}
                >
                  <strong>{tile.label}</strong>
                  <small>{statLabel(tile.stat)} {tile.difficulty}</small>
                  {tile.modifierLabel && <em>{tile.modifierLabel}</em>}
                </button>
              ))}
            </div>
            <button
              className="wide-action"
              disabled={!resolveCheck?.ok}
              onClick={resolveSelectedPuzzleTiles}
            >
              선택 이슈 해결
            </button>
            {resolveCheck && !resolveCheck.ok && <p className="locked-reason">{resolveCheck.reasons.join(" / ")}</p>}
            {gameState.lastDevelopmentPuzzle && (
              <div className="puzzle-result">
                <strong>최근 결과 {gameState.lastDevelopmentPuzzle.verdict} · {gameState.lastDevelopmentPuzzle.score}점</strong>
                <span>진행 +{gameState.lastDevelopmentPuzzle.progressGain} / 완성도 +{gameState.lastDevelopmentPuzzle.qualityGain}</span>
                {gameState.lastDevelopmentPuzzle.appliedModifierLabels.length > 0 && (
                  <small>카드 보정: {gameState.lastDevelopmentPuzzle.appliedModifierLabels.join(", ")}</small>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="empty-note">제품 메뉴에서 프로젝트를 시작하면 퍼즐 점수가 출시 평가에 영향을 줍니다.</p>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>로그라이트 해금</h2>
          <p>망한 런도 창업 통찰로 바뀌고, 다음 회사의 카드와 초반 보너스를 엽니다.</p>
        </div>
        <div className="meta-unlock-list">
          {metaUnlocks.map((unlock) => {
            const check = getMetaUnlockCheck(unlock.id, gameState, projectedInsight);
            const unlocked = gameState.roguelite.unlockedMetaIds.includes(unlock.id);
            const unlockedCards = strategyCards.filter((card) => unlock.unlock_card_ids.includes(card.id));
            return (
              <article className={unlocked ? "complete" : ""} key={unlock.id}>
                <div>
                  <p className="item-meta">비용 {unlock.cost} 통찰</p>
                  <h3>{unlock.title}</h3>
                  <p>{unlock.description}</p>
                  <small>해금 카드: {unlockedCards.map((card) => card.name).join(", ")}</small>
                </div>
                <button disabled={unlocked || !check.ok} onClick={() => setGameState((current) => resetRunWithMetaUnlocks(current, [unlock.id]))}>
                  {unlocked ? "해금됨" : "새 런"}
                </button>
                {!check.ok && !unlocked && <span>{check.reasons[0]}</span>}
              </article>
            );
          })}
        </div>
      </section>

      <TimelinePanel gameState={gameState} />
    </div>
  );
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
  const [selectedAgentIdsByProduct, setSelectedAgentIdsByProduct] = useState<Record<string, string[]>>({});
  const availableAgents = gameState.hiredAgents.filter((agent) => !agent.assignment);
  const defaultSelectedAgentIds = availableAgents.slice(0, 3).map((agent) => agent.id);
  const expansionDomainIds = ["foundation_models", "semiconductors", "mobility", "robotics", "odd_industries", "toys"];
  const unlockedDomainIds = new Set(gameState.unlockedDomains);
  const getSelectedAgentIds = (productId: string) => {
    const availableAgentIds = new Set(availableAgents.map((agent) => agent.id));
    const selectedIds = selectedAgentIdsByProduct[productId] ?? defaultSelectedAgentIds;
    return selectedIds.filter((agentId) => availableAgentIds.has(agentId)).slice(0, 3);
  };
  const toggleSelectedAgent = (productId: string, agentId: string) => {
    setSelectedAgentIdsByProduct((current) => {
      const selectedIds = (current[productId] ?? defaultSelectedAgentIds).filter((id) =>
        availableAgents.some((agent) => agent.id === id),
      );
      const nextSelectedIds = selectedIds.includes(agentId)
        ? selectedIds.filter((id) => id !== agentId)
        : selectedIds.length >= 3
          ? selectedIds
          : [...selectedIds, agentId];

      return { ...current, [productId]: nextSelectedIds };
    });
  };

  return (
    <section className="panel products-panel">
      <div className="panel-heading">
        <h2>제품 개발</h2>
        <p>AI 모델에서 시작해 앱, 칩, 로봇, 차량, 엉뚱한 소비 산업으로 확장합니다. 핵심 개발력은 투입 팀과 에이전트 조합이 만듭니다.</p>
      </div>
      <div className="expansion-map">
        {expansionDomainIds.map((domainId) => {
          const domain = domains.find((entry) => entry.id === domainId);
          if (!domain) return null;
          const domainProducts = products.filter((product) => product.domain === domain.id);
          const unlocked = unlockedDomainIds.has(domain.id);

          return (
            <article className={unlocked ? "unlocked" : ""} key={domain.id}>
              <strong>{domain.name}</strong>
              <span>{unlocked ? "진출 가능" : "잠김"} · 제품 {domainProducts.length}개</span>
            </article>
          );
        })}
      </div>
      {!gameState.hiredAgents.length && <p className="empty-note">먼저 에이전트 메뉴에서 첫 에이전트를 고용하면 제품 개발을 시작할 수 있습니다.</p>}
      <div className="item-list products-list">
        {products.map((product) => {
          const domain = domains.find((entry) => entry.id === product.domain);
          const review = gameState.productReviews[product.id];
          const project = gameState.productProjects.find((entry) => entry.productId === product.id);
          const isActive = gameState.activeProducts.includes(product.id);
          const selectedAgentIds = getSelectedAgentIds(product.id);
          const selectedAgents = gameState.hiredAgents.filter((agent) => selectedAgentIds.includes(agent.id));
          const assignedAgents = project
            ? gameState.hiredAgents.filter((agent) => project.assignedAgentIds.includes(agent.id))
            : [];
          const check = getProductProjectCheck(product, gameState, selectedAgentIds);
          const forecast = getProductProjectForecast(product, gameState, selectedAgentIds);
          const productLevel = getProductLevel(product.id, gameState);
          const upgradeCheck = getProductUpgradeCheck(product, gameState);
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
                  <small>투입 팀: {assignedAgents.map((agent) => agent.name).join(", ")}</small>
                </div>
              )}
              {!isActive && !project && gameState.hiredAgents.length > 0 && (
                <div className="assignment-picker">
                  <div className="assignment-forecast">
                    <span>예상 {forecast.estimatedMonths}개월</span>
                    <span>완성도 {forecast.expectedQuality}</span>
                    <span>리뷰 {forecast.expectedReviewGrade} / {forecast.expectedReviewScore}점</span>
                    <span>월 완성도 +{forecast.monthlyQualityGain}</span>
                  </div>
                  <div className="assignment-agent-grid" aria-label={`${product.name} 투입 에이전트 선택`}>
                    {gameState.hiredAgents.map((agent) => {
                      const agentType = agentTypes.find((type) => type.id === agent.typeId);
                      const stats = getAgentEffectiveStats(agent, gameState);
                      const selected = selectedAgentIds.includes(agent.id);
                      const unavailable = Boolean(agent.assignment) && !selected;
                      const statHighlights = Object.entries(stats)
                        .sort(([, first], [, second]) => second - first)
                        .slice(0, 2)
                        .map(([stat, value]) => `${statLabel(stat)} ${value}`)
                        .join(" · ");

                      return (
                        <button
                          aria-pressed={selected}
                          className={selected ? "selected" : ""}
                          disabled={unavailable}
                          key={agent.id}
                          onClick={() => toggleSelectedAgent(product.id, agent.id)}
                          type="button"
                        >
                          <strong>{agent.name}</strong>
                          <span>{agentType?.role ?? "에이전트"}</span>
                          <small>{unavailable ? "다른 프로젝트 투입 중" : statHighlights}</small>
                        </button>
                      );
                    })}
                  </div>
                  <small className="team-hint">
                    선택 팀: {selectedAgents.length ? selectedAgents.map((agent) => agent.name).join(", ") : "없음"}
                  </small>
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
                <span>Lv.{productLevel || 1} · 월 매출 {formatResource("cash", product.base_revenue)} / 이용자 +{product.base_users_per_month}</span>
                <button
                  disabled={!check.ok || gameState.status !== "playing" || Boolean(project) || isActive}
                  onClick={() => setGameState((current) => startProductProject(product, current, selectedAgentIds))}
                >
                  {isActive ? "운영 중" : project ? "개발 중" : "개발 시작"}
                </button>
                {isActive && (
                  <button
                    disabled={!upgradeCheck.ok || gameState.status !== "playing"}
                    onClick={() => setGameState((current) => upgradeProduct(product, current))}
                  >
                    업그레이드 {formatCost(getProductUpgradeCost(product, gameState))}
                  </button>
                )}
              </div>
              {!check.ok && !isActive && <p className="locked-reason">{check.reasons.join(" / ")}</p>}
              {isActive && !upgradeCheck.ok && <p className="locked-reason">{upgradeCheck.reasons.join(" / ")}</p>}
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
  const ownedItems = items.filter((item) => gameState.ownedItems.includes(item.id));
  const equippedItemIds = new Set(gameState.hiredAgents.flatMap((agent) => agent.equippedItemIds));
  const unequippedAgentItems = ownedItems.filter((item) => item.target === "agent" && !equippedItemIds.has(item.id));
  const officeItems = ownedItems.filter((item) => item.target !== "agent");

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
          <h2>인벤토리와 투자</h2>
          <p>보유 아이템, 장착 대기 장비, 자동화 투자를 함께 봅니다.</p>
        </div>
        <div className="inventory-panel">
          <div className="inventory-strip">
            <span>보유 {ownedItems.length}</span>
            <span>장착 대기 {unequippedAgentItems.length}</span>
            <span>사무실 효과 {officeItems.length}</span>
          </div>
          <div className="inventory-list">
            {ownedItems.length ? (
              ownedItems.map((item) => (
                <article key={item.id}>
                  <strong>{item.name}</strong>
                  <span>{itemTargetLabel(item.target)} · {formatEffects(item.effects)}</span>
                </article>
              ))
            ) : (
              <p>아직 보유한 아이템이 없습니다. 왼쪽 상점에서 구매하면 여기에 쌓입니다.</p>
            )}
          </div>
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
  const activeCompetitorIds = new Set(gameState.competitorStates.map((competitor) => competitor.id));
  const upcomingCompetitors = competitors
    .filter((competitor) => (competitor.entry_month ?? 1) > gameState.month && !activeCompetitorIds.has(competitor.id))
    .sort((a, b) => (a.entry_month ?? 1) - (b.entry_month ?? 1))
    .slice(0, 4);

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
          <p>각 회사의 성향과 선점한 제품 공간입니다. 시간이 지나면 강력한 신규 경쟁사가 시장에 들어옵니다.</p>
        </div>
        {upcomingCompetitors.length > 0 && (
          <div className="rival-wave-list">
            {upcomingCompetitors.map((competitor) => (
              <article key={competitor.id}>
                <strong>{t(competitor.name_key, locale)}</strong>
                <span>{competitor.entry_month}개월차 등장 · {t(competitor.archetype_key, locale)}</span>
              </article>
            ))}
          </div>
        )}
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

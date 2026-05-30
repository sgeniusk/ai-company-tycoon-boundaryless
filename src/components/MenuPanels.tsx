import { useEffect, useState, type CSSProperties, type Dispatch, type SetStateAction } from "react";
import { agentTypes, assetManifest, automationUpgrades, capabilities, companyLocations, competitors, difficultyTiers, domains, items, metaUnlocks, products, strategyCards, upgrades } from "../game/data";
import { getAchievementStatuses } from "../game/achievements";
import {
  chooseAnnualDirective,
  getActiveAnnualDirective,
  getAnnualDirectiveChoiceRows,
  getAnnualReviewNearMissSignal,
  getAnnualReviewCountdown,
  getAnnualReviewProgress,
  getCurrentAnnualReview,
} from "../game/annual-review";
import { getAnnualStrategyAdvice, getAnnualStrategyMenuFocus, prioritizeAnnualStrategyFocus } from "../game/annual-strategy-advisor";
import { getBoundarylessExpansionGoals } from "../game/boundaryless-expansion";
import { getCampaignCalendar, getCampaignFinale, getCompanyStageProgress, getCompanyStarRating, getCurrentLocation } from "../game/campaign";
import {
  getActiveEndingReplayBrief,
  getEndingCollectionEntries,
  getEndingCollectionProgressEntries,
  getEndingCollectionSummary,
  getEndingReplayPlans,
  getEndingTargetPlans,
} from "../game/campaign-ending";
import { getCompetitionSeasonBrief, getCompetitionSeasonChallenges, getGrowthPathCompetitionSignals } from "../game/competition-signals";
import { getIndustryComboSummary } from "../game/industry-combos";
import { getIndustrySynergySummary } from "../game/industry-synergies";
import { getPayoffCollectionEntries } from "../game/payoff-activation";
import {
  getAgentContentRows,
  getCampaignContentPhase,
  getFoundationRecommendations,
  getFoundationSnapshot,
  getItemContentRows,
  type AgentContentRow,
  type AgentKind,
  type ItemContentRow,
} from "../game/content-foundation";
import { getGrowthPathObjectives } from "../game/growth-objectives";
import {
  createProductConcept,
  getProductIdeaCoverage,
  getRenewalReleaseOptions,
  productIdeaBoldOptions,
  productIdeaSubjects,
  productIdeaTypes,
} from "../game/product-ideas";
import { ALL_PRODUCT_DOMAIN_FILTER_ID, getProductDomainFilters, getProductsByDomainFilter } from "../game/product-filters";
import { getAiResourceVisibilityMetrics } from "../game/resource-visibility";
import { getRivalCounterPlans, isCounterCard, getRivalCounterSignal } from "../game/rival-counters";
import { getShareableMoments } from "../game/shareable-moments";
import { getTenMonthArc } from "../game/ten-month-arc";
import { getArchetypeCollectionEntries } from "../game/tag-derivation";
import {
  createDevelopmentPuzzle,
  getDevelopmentPuzzleResolveCheck,
  getDevelopmentPuzzleSelectionLimit,
  resolveDevelopmentPuzzle,
} from "../game/development-puzzle";
import {
  chooseCardReward,
  getAnnualDirectiveRewardBiasSummary,
  getAnnualDirectiveRewardBiasMatch,
  getAvailableStarterDecks,
  getCardRewardChoiceCheck,
  getDeckArchetypeSummary,
  getDeckCardCounts,
  getDeckEditCheck,
  getDeckSynergySummary,
  getStrategyCardById,
  getStrategyCardEffects,
  getStrategyCardPlayCheck,
  playStrategyCard,
  removeStrategyCardFromDeck,
  upgradeStrategyCard,
} from "../game/deckbuilding";
import { getMetaUnlockCheck, getNextRunSetupPlan, getRunInsightReward, resetRunWithMetaUnlocks } from "../game/meta-progression";
import { rollRunModifierSelection } from "../game/run-modifiers";
import {
  advanceMonth,
  buyAutomationUpgrade,
  buyItem,
  buyUpgrade,
  chooseAgentSpecialization,
  equipItem,
  getAgentCareerStatus,
  getAgentDevelopmentProfile,
  formatResource,
  getAgentEffectiveStats,
  getAgentHireCheckForChannel,
  getAgentRestCheck,
  getAgentRestCost,
  getAgentSpecializationOptions,
  getAiAgentCount,
  getAiOperationCapacity,
  getAutomationUpgradeCheck,
  getAvailableProductDefinitions,
  getCapabilityCheck,
  getCompanyStage,
  getEquipItemCheck,
  getItemCheck,
  getMarketRankings,
  getNextOfficeExpansion,
  getOfficeDecorationSlots,
  getOfficeExpansion,
  getOfficeExpansionCheck,
  getOfficeGrowthPlan,
  getOfficeHireCapacity,
  getOfficeMonthlyEffects,
  getOfficeSynergySummary,
  getOfficeZonePlan,
  getPlacedOfficeItems,
  getPlaceOfficeItemCheck,
  getProductLevel,
  getProductConceptProjectCheck,
  getProductProjectForecast,
  getProductProjectCheck,
  getProductRenewalCost,
  getProductRenewalProjectCheck,
  getProductUpgradeCheck,
  getProductUpgradeCost,
  getRecruitmentBrandProfile,
  getRecruitmentCandidatePool,
  getRecruitmentOffer,
  getRecentStaffIncidentAftermathLog,
  getRecentStaffIncidentResolutionLog,
  getAgentRetentionAlerts,
  getAgentSalaryNegotiationCheck,
  getAgentSalaryNegotiationCost,
  getStaffIncidentBriefs,
  getStaffIncidentResolutionOptions,
  getUpgradeCheck,
  getWorkforceSynergySummary,
  getRelocationCheck,
  hireAgentViaChannel,
  negotiateAgentSalary,
  buyOfficeExpansion,
  placeOfficeItem,
  recruitmentChannels,
  restAgent,
  resolveStaffIncident,
  relocateCompany,
  startProductConceptProject,
  startProductProject,
  startProductRenewalProject,
  unplaceOfficeItem,
  upgradeCapability,
  upgradeProduct,
  type RecruitmentOffer,
  type RecruitmentChannelId,
} from "../game/simulation";
import type {
  AgentSpriteDefinition,
  AgentTypeDefinition,
  CompetitorIdentityDefinition,
  GameState,
  HiredAgent,
  ItemDefinition,
  ItemIconDefinition,
  ProductDefinition,
  StrategyCardDefinition,
} from "../game/types";
import { t, type LocaleCode } from "../i18n";
import { formatCost, formatEffects, itemCategoryLabel, itemTargetLabel, statLabel } from "../ui/formatters";
import { menus, type MenuId } from "../ui/menu";
import { CampaignShockPanel } from "./CampaignShockPanel";

let menuRunSeedCounter = 0;

function createEphemeralRunModifierSelection(source: string, challengeTierId = "standard") {
  menuRunSeedCounter += 1;
  const randomPart =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    ...rollRunModifierSelection(`${source}-${menuRunSeedCounter}-${randomPart}`),
    challengeTierId,
  };
}

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

function getMenuLabel(menuId: string): string {
  return menus.find((menu) => menu.id === menuId)?.label ?? menuId;
}

export function renderMenuContent(
  activeMenu: MenuId,
  gameState: GameState,
  setGameState: Dispatch<SetStateAction<GameState>>,
  locale: LocaleCode,
  setActiveMenu?: Dispatch<SetStateAction<MenuId>>,
) {
  if (activeMenu === "company") {
    const growthObjectives = getGrowthPathObjectives(gameState);
    const tenMonthArc = getTenMonthArc(gameState);
    const achievementStatuses = getAchievementStatuses(gameState);
    const unlockedAchievementCount = achievementStatuses.filter((achievement) => achievement.unlocked).length;
    const officeExpansion = getOfficeExpansion(gameState);
    const placedOfficeItems = getPlacedOfficeItems(gameState);
    const officeZonePlan = getOfficeZonePlan(gameState);
    const calendar = getCampaignCalendar(gameState);
    const finale = getCampaignFinale(gameState);
    const endingTargetPlans = getEndingTargetPlans(gameState, 3);
    const activeEndingReplayBrief = getActiveEndingReplayBrief(gameState);
    const stageProgress = getCompanyStageProgress(gameState);
    const currentLocation = getCurrentLocation(gameState);
    const foundationSnapshot = getFoundationSnapshot(gameState);
    const annualReview = getCurrentAnnualReview(gameState);
    const annualReviewProgress = getAnnualReviewProgress(annualReview, gameState);
    const annualReviewCountdown = getAnnualReviewCountdown(gameState);
    const recentAnnualReview = gameState.annualReviewHistory[0];
    const annualReviewNearMiss = getAnnualReviewNearMissSignal(recentAnnualReview, gameState);
    const annualDirective = getActiveAnnualDirective(gameState);
    const annualDirectiveChoices = getAnnualDirectiveChoiceRows(gameState);
    const annualStrategyAdvice = getAnnualStrategyAdvice(gameState);
    const competitionSeason = getCompetitionSeasonBrief(gameState);
    const competitionChallenges = getCompetitionSeasonChallenges(gameState);
    const shouldShowAnnualDirectiveConfirmation = Boolean(
      recentAnnualReview && annualDirective && annualDirectiveChoices.length === 0 && gameState.month === recentAnnualReview.month,
    );
    const shouldShowYearTwoKickoff = Boolean(
      recentAnnualReview && annualDirective && annualDirectiveChoices.length === 0 && gameState.month === recentAnnualReview.month + 1,
    );
    const yearTwoBonus = gameState.lastMonthReport?.strategyEffects ?? annualDirective?.monthlyEffects;

    return (
      <div className="panel-grid two-col">
        <section className="panel">
          <div className="panel-heading">
            <h2>회사 개요</h2>
            <p>성장 단계, 해금 분야, 활성 제품을 한눈에 봅니다.</p>
          </div>
          <CampaignShockPanel gameState={gameState} setActiveMenu={setActiveMenu} />
          {shouldShowAnnualDirectiveConfirmation && annualDirective && (
            <div className="annual-directive-confirmation" aria-label="다음 해 지시 선택 완료">
              <div>
                <p className="eyebrow">다음 해 지시 선택 완료</p>
                <strong>{annualDirective.title}</strong>
                <span>월간 보너스가 다음 해 운영에 적용됩니다. 추천 메뉴로 이동해 첫해 심사 이후의 방향을 바로 실행하세요.</span>
              </div>
              <ol>
                <li>
                  <strong>월간 보너스</strong>
                  <span>{formatEffects(annualDirective.monthlyEffects)}</span>
                </li>
                <li>
                  <strong>추천 메뉴</strong>
                  <span>{getMenuLabel(annualDirective.recommendedMenu)}</span>
                </li>
                <li>
                  <strong>적용 기간</strong>
                  <span>{annualDirective.expiresMonth}개월차까지</span>
                </li>
              </ol>
              <div className="annual-directive-actions">
                <button onClick={() => setActiveMenu?.(annualDirective.recommendedMenu as MenuId)} type="button">
                  추천 메뉴 열기
                </button>
                <button
                  disabled={gameState.status !== "playing"}
                  onClick={() => setGameState((current) => advanceMonth(current))}
                  type="button"
                >
                  2년차 시작
                </button>
              </div>
            </div>
          )}
          {shouldShowYearTwoKickoff && annualDirective && (
            <div className="year-two-kickoff" aria-label="2년차 운영 시작">
              <div>
                <p className="eyebrow">2년차 운영 시작</p>
                <strong>{annualDirective.title}</strong>
                <span>연간 지시 효과가 이번 달 운영에 반영됐습니다. 추천 메뉴에서 다음 실험을 바로 고르세요.</span>
              </div>
              <div className="year-two-kickoff-grid">
                <article>
                  <strong>이번 달 보너스</strong>
                  <span>{yearTwoBonus ? formatEffects(yearTwoBonus) : formatEffects(annualDirective.monthlyEffects)}</span>
                </article>
                <article>
                  <strong>연간 지시 효과</strong>
                  <span>{annualDirective.description}</span>
                </article>
                <article>
                  <strong>추천 메뉴</strong>
                  <span>{getMenuLabel(annualDirective.recommendedMenu)}</span>
                </article>
              </div>
              <ol className="year-two-next-flow" aria-label="2년차 다음 30분 흐름">
                <li>이번 달 보너스</li>
                <li className="year-two-flow-arrow" aria-hidden="true">→</li>
                <li>추천 연구</li>
                <li className="year-two-flow-arrow" aria-hidden="true">→</li>
                <li>신제품 후보</li>
                <li className="year-two-flow-arrow" aria-hidden="true">→</li>
                <li>두 번째 출시 보상</li>
              </ol>
              <div className="annual-directive-actions">
                <button onClick={() => setActiveMenu?.(annualDirective.recommendedMenu as MenuId)} type="button">
                  추천 메뉴 열기
                </button>
                <button
                  disabled={gameState.status !== "playing"}
                  onClick={() => setGameState((current) => advanceMonth(current))}
                  type="button"
                >
                  한 달 더 운영
                </button>
              </div>
            </div>
          )}
          <div className="annual-review-panel">
            <div className="annual-review-header">
              <div>
                <p className="eyebrow">연간 심사</p>
                <h3>{annualReview.title}</h3>
                <span>{annualReview.description}</span>
              </div>
              <strong>{annualReviewProgress.progressPercent}%</strong>
            </div>
            <div className="arc-meter">
              <i style={{ width: `${annualReviewProgress.progressPercent}%` }} />
            </div>
            <div className="annual-review-meta">
              <span>{annualReviewCountdown}</span>
              <span>목표 {annualReviewProgress.completed}/{annualReviewProgress.total}</span>
              <span>통과 보상 {formatEffects(annualReview.reward)}</span>
            </div>
            {recentAnnualReview && (
              <div className={recentAnnualReview.passed ? "annual-history passed" : "annual-history"}>
                <strong>최근 결과: {recentAnnualReview.passed ? "통과" : "미달"} · {recentAnnualReview.score}점</strong>
                <span>{recentAnnualReview.summary}</span>
              </div>
            )}
            {annualReviewNearMiss && (
              <div className={`annual-nearmiss-relief annual-nearmiss-${annualReviewNearMiss.tone}`} aria-label="연간 심사 near-miss">
                <strong>{annualReviewNearMiss.title}</strong>
                <span>{annualReviewNearMiss.copy}</span>
                <small>
                  최박빙 조건 {annualReviewNearMiss.requirementLabel} · {annualReviewNearMiss.currentLabel} / {annualReviewNearMiss.targetLabel} · 여유 {annualReviewNearMiss.marginPercent}%
                </small>
              </div>
            )}
            {annualDirective && (
              <div className="annual-directive">
                <strong>다음 해 지시: {annualDirective.title}</strong>
                <span>{annualDirective.description}</span>
                <small>
                  월간 {formatEffects(annualDirective.monthlyEffects)} · 추천 메뉴 {getMenuLabel(annualDirective.recommendedMenu)} · {annualDirective.expiresMonth}개월차까지
                </small>
              </div>
            )}
            {annualStrategyAdvice && (
              <div className="annual-strategy-room">
                <div>
                  <p className="eyebrow">연간 전략실</p>
                  <strong>{annualStrategyAdvice.directiveTitle}</strong>
                  <span>{annualStrategyAdvice.summary}</span>
                  <small>편향 태그 {annualStrategyAdvice.tagLabels.join(", ")} · 추천 메뉴 {getMenuLabel(annualStrategyAdvice.recommendedMenu)}</small>
                </div>
                <div className="annual-strategy-actions">
                  {annualStrategyAdvice.actionRecommendations.map((action) => (
                    <button key={`${action.menu}-${action.targetId ?? action.label}`} onClick={() => setActiveMenu?.(action.menu)} type="button">
                      <strong>{action.label}</strong>
                      <span>{action.description}</span>
                    </button>
                  ))}
                </div>
                <div className="annual-strategy-grid">
                  <article>
                    <strong>제품 후보</strong>
                    {annualStrategyAdvice.productRecommendations.slice(0, 2).map((row) => (
                      <span key={row.id}>{row.name} · {row.reason}</span>
                    ))}
                  </article>
                  <article>
                    <strong>연구 후보</strong>
                    {annualStrategyAdvice.capabilityRecommendations.slice(0, 2).map((row) => (
                      <span key={row.id}>{row.name} · {row.reason}</span>
                    ))}
                  </article>
                  <article>
                    <strong>경쟁 대응</strong>
                    {annualStrategyAdvice.rivalRecommendations.slice(0, 2).map((row) => (
                      <span key={row.competitorId}>{row.competitorName} · {row.label} · 압박 {row.pressureScore}</span>
                    ))}
                    {annualStrategyAdvice.rivalRecommendations.length === 0 && <span>현재 지시와 직접 맞물리는 압박 경쟁사는 약합니다.</span>}
                  </article>
                </div>
              </div>
            )}
            {annualDirectiveChoices.length > 0 && (
              <div className="annual-choice-panel">
                <div>
                  <strong>다음 해 운영 지시 3택1</strong>
                  <span>심사 결과를 바탕으로 내년 회사 운영의 월간 보너스와 추천 메뉴를 직접 고릅니다.</span>
                </div>
                <div className="annual-choice-list">
                  {annualDirectiveChoices.map((choice) => (
                    <article className={choice.selected ? "selected" : ""} key={choice.id}>
                      <div>
                        <h4>{choice.title}</h4>
                        <span>{choice.description}</span>
                        <small>
                          월간 {formatEffects(choice.monthly_effects)} · 추천 {getMenuLabel(choice.recommended_menu)}
                        </small>
                      </div>
                      <button
                        disabled={gameState.status !== "playing"}
                        onClick={() => setGameState((currentState) => chooseAnnualDirective(choice.id, currentState))}
                      >
                        {choice.selected ? "적용 중" : "선택"}
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            )}
            <div className="annual-goal-list">
              {annualReviewProgress.items.map((item) => (
                <article className={item.complete ? "complete" : ""} key={item.requirement}>
                  <strong>{item.label}</strong>
                  <span>{item.currentLabel} / {item.targetLabel}</span>
                </article>
              ))}
            </div>
          </div>
          <div className="company-summary">
            <strong>{"★".repeat(getCompanyStarRating(gameState))} {getCompanyStage(gameState).name}</strong>
            <span>활성 제품 {gameState.activeProducts.length}개</span>
            <span>개발 프로젝트 {gameState.productProjects.length}개</span>
            <span>고용 에이전트 {gameState.hiredAgents.length}명</span>
            <span>보유 아이템 {gameState.ownedItems.length}개</span>
            <span>지역 {currentLocation.region}</span>
            <span>사무실 {officeExpansion.name}</span>
            <span>가동 구획 {officeZonePlan.active.length}개</span>
            <span>고용 한도 {gameState.hiredAgents.length}/{getOfficeHireCapacity(gameState)}</span>
            <span>AI 운용 {getAiAgentCount(gameState)}/{getAiOperationCapacity(gameState)}</span>
            <span>장식 효과 {placedOfficeItems.length}/{getOfficeDecorationSlots(gameState)}</span>
            <span>해금 분야 {gameState.unlockedDomains.length}개</span>
            <span>자동화 {formatResource("automation", gameState.resources.automation ?? 0)}</span>
            <span>콘텐츠 기반 {foundationSnapshot.phase.label}</span>
            <span>추천 후보 {foundationSnapshot.recommendedAgentIds.length + foundationSnapshot.recommendedItemIds.length}개</span>
            {gameState.chosenGrowthPath && (
              <span className="strategy-summary">
                전략 {gameState.chosenGrowthPath.title} · 월간 {formatEffects(gameState.chosenGrowthPath.monthlyEffects)}
              </span>
            )}
          </div>
          <div className="office-zone-panel">
            <div>
              <p className="eyebrow">사무실 구획</p>
              <strong>{officeZonePlan.operationLabel}</strong>
              <span>확장 단계와 회사 상태에 따라 실제 월간 운영 효과가 달라집니다.</span>
            </div>
            <div className="office-zone-grid">
              {officeZonePlan.active.slice(0, 4).map((zone) => (
                <article className="active" key={zone.id}>
                  <strong>{zone.title}</strong>
                  <span>{formatEffects(zone.monthly_effects)}</span>
                  <small>{zone.description}</small>
                </article>
              ))}
              {officeZonePlan.nextZone && (
                <article className="locked">
                  <strong>다음 구획: {officeZonePlan.nextZone.title}</strong>
                  <span>{officeZonePlan.nextZone.progressLabel}</span>
                  <small>{officeZonePlan.nextZone.description}</small>
                </article>
              )}
            </div>
          </div>
          <div className="promotion-panel">
            <div className="promotion-header">
              <div>
                <p className="eyebrow">회사 승급 트랙</p>
                <h3>{stageProgress.next ? `${stageProgress.next.name}까지` : "최종 단계 도달"}</h3>
                <span>
                  {stageProgress.next
                    ? `${stageProgress.current.name}에서 ${stageProgress.next.name}으로 올라가면 더 좋은 지역과 후반 산업 확장이 열립니다.`
                    : "남은 목표는 10년 엔딩 점수, 시장 점유율, 런 기록 갱신입니다."}
                </span>
              </div>
              <strong>{stageProgress.progressPercent}%</strong>
            </div>
            <div className="arc-meter">
              <i style={{ width: `${stageProgress.progressPercent}%` }} />
            </div>
            <div className="annual-review-meta">
              <span>현재 {"★".repeat(getCompanyStarRating(gameState))} {stageProgress.current.name}</span>
              <span>조건 {stageProgress.completed}/{stageProgress.total || 1}</span>
              <span>{stageProgress.next ? "다음 지역 해금 준비" : "엔딩 점수 집중"}</span>
            </div>
            <div className="annual-goal-list">
              {stageProgress.items.map((item) => (
                <article className={item.complete ? "complete" : ""} key={item.requirement}>
                  <strong>{item.label}</strong>
                  <span>{item.currentLabel} / {item.targetLabel}</span>
                </article>
              ))}
              {stageProgress.items.length === 0 && (
                <article className="complete">
                  <strong>모든 승급 완료</strong>
                  <span>최종 평가를 준비하세요.</span>
                </article>
              )}
            </div>
          </div>
          <div className="season-brief-panel">
            <div>
              <p className="eyebrow">시장 시즌</p>
              <h3>{competitionSeason.title}</h3>
              <span>{competitionSeason.summary}</span>
            </div>
            <div className="season-brief-grid">
              <span>신규 진입 {competitionSeason.recentEntrants.length}곳</span>
              <span>예고 {competitionSeason.nextEntrants.length}곳</span>
              <span>{competitionSeason.topPressure ? `압박 ${competitionSeason.topPressure.competitorName}` : "압박 없음"}</span>
            </div>
            {competitionChallenges[0] && (
              <button className="season-action-button" onClick={() => setActiveMenu?.(competitionChallenges[0].targetMenu)}>
                <strong>{competitionChallenges[0].title}</strong>
                <span>{competitionChallenges[0].complete ? "대응 완료" : competitionChallenges[0].rewardPreview}</span>
              </button>
            )}
          </div>
          <div className="foundation-panel">
            <div>
              <p className="eyebrow">기반 다지기</p>
              <h3>{foundationSnapshot.phase.label}</h3>
              <span>{foundationSnapshot.phase.description}</span>
            </div>
            <div className="foundation-strip">
              <span>고용 후보 {foundationSnapshot.availableAgents}/{foundationSnapshot.agentTotal}</span>
              <span>구매 가능 {foundationSnapshot.availableItems}/{foundationSnapshot.itemTotal}</span>
              <span>추천 {foundationSnapshot.recommendedAgentIds.length + foundationSnapshot.recommendedItemIds.length}</span>
            </div>
          </div>
          <div className="campaign-panel">
            <div>
              <p className="eyebrow">10년 캠페인</p>
              <h3>{calendar.year}년차 {calendar.monthOfYear}월 · 남은 {calendar.remainingMonths}개월</h3>
              <span>{finale.isFinal ? `${finale.endingName} / ${finale.score}점` : "최종 평가는 10년차 120개월에 진행됩니다."}</span>
            </div>
            <div className="arc-meter">
              <i style={{ width: `${calendar.progressPercent}%` }} />
            </div>
          </div>
          {activeEndingReplayBrief && (
            <div className="ending-replay-brief-panel" aria-label="목표 엔딩 런">
              <div>
                <p className="eyebrow">목표 엔딩 런</p>
                <h3>{activeEndingReplayBrief.title}</h3>
                <span>
                  {activeEndingReplayBrief.targetLabels.slice(0, 5).join(" / ")} · {activeEndingReplayBrief.rewardLabel} ·{" "}
                  {activeEndingReplayBrief.rewardProgressLabel}
                </span>
                {activeEndingReplayBrief.alreadyDiscovered && <small>발견 완료 목표 · 반복 완주 보상</small>}
              </div>
              <div className="ending-replay-brief-steps">
                {activeEndingReplayBrief.openingMoves.map((move) => (
                  <span key={move}>{move}</span>
                ))}
              </div>
              {activeEndingReplayBrief.nextRequirements.length > 0 && (
                <div className="ending-replay-checklist" aria-label="목표 엔딩 체크리스트">
                  {activeEndingReplayBrief.nextRequirements.map((requirement) => (
                    <span className={requirement.blocking ? "blocking" : ""} key={requirement.id}>
                      <strong>{requirement.label}</strong>
                      <small>{requirement.currentLabel} / {requirement.targetLabel}</small>
                      <button onClick={() => setActiveMenu?.(requirement.targetMenu)} type="button">
                        {requirement.actionLabel}
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="ending-target-panel" aria-label="엔딩 목표">
            <div>
              <p className="eyebrow">엔딩 목표</p>
              <h3>{endingTargetPlans[0]?.title ?? "목표 없음"}</h3>
              <span>{endingTargetPlans[0] ? `현재 런 조건 기준 ${endingTargetPlans[0].progressPercent}%` : "이번 런에서 추적할 엔딩 후보가 없습니다."}</span>
            </div>
            <div className="ending-target-grid">
              {endingTargetPlans.map((plan) => {
                const missingRequirements = plan.requirements.filter((requirement) => !requirement.complete).slice(0, 2);
                return (
                  <article className={plan.complete ? "complete" : ""} key={plan.id}>
                    <div className="ending-target-card-heading">
                      <strong>{plan.title}</strong>
                      <span>{plan.progressPercent}%</span>
                    </div>
                    <div className="arc-meter">
                      <i style={{ width: `${plan.progressPercent}%` }} />
                    </div>
                    <small>
                      {missingRequirements.length
                        ? missingRequirements.map((requirement) => `${requirement.label} ${requirement.currentLabel}/${requirement.targetLabel}`).join(" · ")
                        : `완성 조건 충족 · 통찰 보너스 +${plan.meta_reward_bonus}`}
                    </small>
                  </article>
                );
              })}
            </div>
          </div>
          <div className="location-panel">
            <div className="panel-heading compact-heading">
              <h3>지역 이전</h3>
              <p>싼 시골 차고에서 시작해 판교, 서울, 글로벌 캠퍼스로 옮길 수 있습니다.</p>
            </div>
            <div className="location-list">
              {companyLocations.map((location) => {
                const check = getRelocationCheck(location.id, gameState);
                const current = location.id === currentLocation.id;
                return (
                  <article className={current ? "location-card current" : "location-card"} key={location.id}>
                    <div>
                      <p className="item-meta">{location.region}</p>
                      <h3>{location.name}</h3>
                      <p>{location.description}</p>
                      <span>
                        인재풀: {location.talent_pool} · 유지비 x{location.monthly_cost_modifier}
                      </span>
                    </div>
                    <button
                      disabled={current || !check.ok || gameState.status !== "playing"}
                      onClick={() => setGameState((currentState) => relocateCompany(location.id, currentState))}
                    >
                      {current ? "현재" : "이전"}
                    </button>
                    {!check.ok && !current && <small>{check.reasons.join(" / ")}</small>}
                  </article>
                );
              })}
            </div>
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
    return <ProductsPanel gameState={gameState} setGameState={setGameState} locale={locale} setActiveMenu={setActiveMenu} />;
  }

  if (activeMenu === "deck") {
    return <DeckPanel gameState={gameState} setGameState={setGameState} setActiveMenu={setActiveMenu} />;
  }

  if (activeMenu === "agents") {
    return <AgentsPanel gameState={gameState} setGameState={setGameState} />;
  }

  if (activeMenu === "research") {
    return <ResearchPanel gameState={gameState} setGameState={setGameState} locale={locale} setActiveMenu={setActiveMenu} />;
  }

  if (activeMenu === "shop") {
    return <ShopPanel gameState={gameState} setGameState={setGameState} />;
  }

  if (activeMenu === "competition") {
    return <CompetitionPanel gameState={gameState} locale={locale} />;
  }

  return <TimelinePanel gameState={gameState} />;
}

function DeckPanel({
  gameState,
  setGameState,
  setActiveMenu,
}: {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setActiveMenu?: Dispatch<SetStateAction<MenuId>>;
}) {
  // v0.58 #4 — 라이벌 압박 수준 derive (high/low/none). isCounterCard와 함께 strategy-card에 압박 대응 배지를 띄울지 결정.
  const rivalCounterSignal = getRivalCounterSignal(gameState);
  const [selectedPuzzleTileIds, setSelectedPuzzleTileIds] = useState<string[]>([]);
  const [selectedChallengeTierId, setSelectedChallengeTierId] = useState("standard");
  const [endingCollectionFilter, setEndingCollectionFilter] = useState<"all" | "locked" | "discovered">("all");
  const [endingCollectionSort, setEndingCollectionSort] = useState<"priority" | "progress" | "reward">("priority");
  const deck = gameState.roguelite.deck;
  const handCards = deck.hand.map((cardId) => getStrategyCardById(cardId)).filter((card): card is StrategyCardDefinition => Boolean(card));
  const deckCards = getDeckCardCounts(deck)
    .map(({ cardId, count }) => ({ card: getStrategyCardById(cardId), count }))
    .filter((entry): entry is { card: StrategyCardDefinition; count: number } => Boolean(entry.card));
  const pendingReward = gameState.roguelite.pendingCardReward;
  const rewardBiasSummary = getAnnualDirectiveRewardBiasSummary(gameState);
  const upgradedCardIds = new Set(gameState.roguelite.upgradedCardIds);
  const activeProject = gameState.productProjects[0];
  const availableProducts = getAvailableProductDefinitions(gameState);
  const activeProduct = activeProject ? availableProducts.find((product) => product.id === activeProject.productId) : undefined;
  const puzzle = activeProject ? createDevelopmentPuzzle(activeProject.id, gameState) : undefined;
  const projectedInsight = gameState.roguelite.founderInsight + getRunInsightReward(gameState);
  const latestRunRecord = gameState.roguelite.runHistory[0];
  const affordableMetaUnlocks = metaUnlocks
    .filter((unlock) => !gameState.roguelite.unlockedMetaIds.includes(unlock.id))
    .filter((unlock) => getMetaUnlockCheck(unlock.id, gameState).ok)
    .slice(0, 3);
  const selectionLimit = getDevelopmentPuzzleSelectionLimit(gameState, activeProject?.id);
  const resolveCheck = activeProject ? getDevelopmentPuzzleResolveCheck(activeProject.id, selectedPuzzleTileIds, gameState) : undefined;
  const recommendedPuzzleTileIds = puzzle ? puzzle.tiles.slice(0, Math.min(4, selectionLimit)).map((tile) => tile.id) : [];
  const recommendedPuzzleTiles = puzzle ? puzzle.tiles.filter((tile) => recommendedPuzzleTileIds.includes(tile.id)) : [];
  const activeIssueResult = activeProject && gameState.lastDevelopmentPuzzle?.projectId === activeProject.id
    ? gameState.lastDevelopmentPuzzle
    : undefined;
  const activeIssueResultTiles = activeIssueResult
    ? activeIssueResult.tiles.filter((tile) => activeIssueResult.selectedTileIds.includes(tile.id))
    : [];
  const topRivalCounter = getRivalCounterPlans(gameState, 1)[0];
  const archetypeSummary = getDeckArchetypeSummary(gameState);
  const deckSynergySummary = getDeckSynergySummary(gameState);
  const starterDeckOptions = getAvailableStarterDecks(gameState);
  const nextRunSetupPlan = getNextRunSetupPlan(gameState);
  const baseEndingCollectionEntries = getEndingCollectionEntries(gameState);
  const endingCollectionEntries = getEndingCollectionProgressEntries(gameState);
  const endingCollectionSummary = getEndingCollectionSummary(gameState);
  const endingReplayPlans = getEndingReplayPlans(gameState, 3);
  const activeEndingReplayBrief = getActiveEndingReplayBrief(gameState);
  const discoveredEndingCount = baseEndingCollectionEntries.filter((entry) => gameState.roguelite.discoveredEndingIds.includes(entry.id)).length;
  const endingCollectionFilterOptions = [
    { id: "all", label: "전체", count: endingCollectionEntries.length },
    { id: "locked", label: "미발견", count: endingCollectionSummary.lockedCount },
    { id: "discovered", label: "발견 완료", count: discoveredEndingCount },
  ] as const;
  const endingCollectionSortOptions = [
    { id: "priority", label: "추천 순" },
    { id: "progress", label: "가까운 순" },
    { id: "reward", label: "보상 순" },
  ] as const;
  const filteredEndingCollectionEntries = endingCollectionEntries.filter((entry) => {
    if (endingCollectionFilter === "locked") return !entry.discovered;
    if (endingCollectionFilter === "discovered") return entry.discovered;
    return true;
  });
  const sortedEndingCollectionEntries =
    endingCollectionSort === "priority"
      ? filteredEndingCollectionEntries
      : [...filteredEndingCollectionEntries].sort((first, second) => {
          if (endingCollectionSort === "progress") {
            return second.progressPercent - first.progressPercent || second.priority - first.priority || first.id.localeCompare(second.id);
          }

          return second.meta_reward_bonus - first.meta_reward_bonus || second.priority - first.priority || first.id.localeCompare(second.id);
        });
  const shouldShowNextRunSetup =
    gameState.month >= 10 || gameState.status !== "playing" || gameState.roguelite.runHistory.length > 0;
  const shouldShowDevelopmentIssueLaunchpad = Boolean(activeProject && activeProduct && puzzle && !gameState.lastDevelopmentPuzzle);
  const shouldShowFirstRewardSpotlight = Boolean(pendingReward && gameState.roguelite.rewardHistory.length === 0);
  const latestRewardChoice = gameState.roguelite.rewardHistory[0];
  const latestRewardCard = latestRewardChoice ? getStrategyCardById(latestRewardChoice.chosenCardId) : undefined;
  const developmentIssueTitle = activeProject && activeProject.startedMonth > 1 ? "신제품 개발 이슈" : "첫 개발 이슈";
  const developmentIssueDescription =
    activeProject && activeProject.startedMonth > 1
      ? "새 제품 개발의 첫 이슈입니다. 추천 이슈를 해결하면 진행도와 완성도가 바로 오릅니다."
      : "카드가 결과를 바꾸는 첫 순간입니다. 추천 이슈를 해결하면 진행도와 완성도가 바로 오릅니다.";
  const shouldShowRewardConfirmation = Boolean(
    !pendingReward && latestRewardChoice && latestRewardCard && gameState.roguelite.rewardHistory.length === 1,
  );

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
        {shouldShowFirstRewardSpotlight && pendingReward && (
          <div className="first-reward-spotlight" aria-label="첫 출시 보상 선택">
            <div>
              <p className="eyebrow">첫 출시 보상 도착</p>
              <h3>{pendingReward.productName}</h3>
              <span>3장 중 1장으로 이번 런의 색을 정합니다. 보상 선택 후 성장 분기까지 이어가세요.</span>
            </div>
            <ol>
              <li>
                <strong>보상 카드 선택</strong>
                <span>{pendingReward.offeredCardIds.length}장 후보</span>
              </li>
              <li>
                <strong>덱에 추가</strong>
                <span>버림 더미로 들어감</span>
              </li>
              <li>
                <strong>성장 분기</strong>
                <span>보상 선택 후 성장 분기 확인</span>
              </li>
            </ol>
          </div>
        )}
        {shouldShowRewardConfirmation && latestRewardChoice && latestRewardCard && (
          <div className="reward-choice-confirmation" aria-label="보상 선택 완료">
            <div>
              <p className="eyebrow">보상 선택 완료</p>
              <h3>{latestRewardCard.name}</h3>
              <span>{latestRewardCard.name} 카드가 덱에 들어갔습니다. 다음은 성장 분기 선택입니다.</span>
            </div>
            <ol>
              <li>
                <strong>덱 반영</strong>
                <span>버림 더미에 추가</span>
              </li>
              <li>
                <strong>다음은 성장 분기</strong>
                <span>결과 탭의 성장 카드 선택</span>
              </li>
              <li>
                <strong>다음 달 진행</strong>
                <span>새 방향을 운영에 반영</span>
              </li>
            </ol>
          </div>
        )}
        {shouldShowDevelopmentIssueLaunchpad && activeProject && activeProduct && (
          <div className="development-issue-launchpad" aria-label={developmentIssueTitle}>
            <div>
              <p className="eyebrow">{developmentIssueTitle}</p>
              <h3>{activeProduct.name}</h3>
              <span>{developmentIssueDescription}</span>
            </div>
            <div className="development-issue-meta">
              <span>현재 진행 {Math.round(activeProject.progress)}%</span>
              <span>완성도 {Math.round(activeProject.quality)}</span>
              <span>선택 {recommendedPuzzleTileIds.length}/{selectionLimit}</span>
            </div>
            <div className="development-issue-recommendations">
              <strong>추천 이슈</strong>
              <span>{recommendedPuzzleTiles.map((tile) => tile.label).join(", ")}</span>
            </div>
            <button
              disabled={!recommendedPuzzleTileIds.length || gameState.status !== "playing"}
              onClick={() => setGameState((current) => resolveDevelopmentPuzzle(activeProject.id, recommendedPuzzleTileIds, current))}
              type="button"
            >
              자동 선택 이슈 해결
            </button>
          </div>
        )}
        {activeIssueResult && activeProject && activeProduct && (
          <div className="development-issue-result-ribbon" aria-label="이슈 해결 결과">
            <div>
              <p className="eyebrow">이슈 해결 결과</p>
              <h3>
                {activeIssueResult.verdict} · {activeIssueResult.score}점
              </h3>
              <span>
                {activeProduct.name} 진행 +{activeIssueResult.progressGain}, 완성도 +{activeIssueResult.qualityGain}
              </span>
            </div>
            <div className="impact-chip-grid">
              <span className="impact-chip">현재 진행 {Math.round(activeProject.progress)}%</span>
              <span className="impact-chip">완성도 {Math.round(activeProject.quality)}</span>
              <span className="impact-chip">
                카드 영향 {activeIssueResult.appliedModifierLabels.length ? activeIssueResult.appliedModifierLabels.join(", ") : "없음"}
              </span>
              <span className="impact-chip">
                해결 이슈 {activeIssueResultTiles.map((tile) => tile.label).join(", ")}
              </span>
            </div>
            <div
              className="release-progress-meter"
              role="progressbar"
              aria-valuenow={Math.round(activeProject.progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="출시까지 진행도"
            >
              <strong>출시까지</strong>
              <div className="release-progress-bar">
                <i style={{ width: `${Math.min(100, Math.max(0, Math.round(activeProject.progress)))}%` }} />
              </div>
              <span>{Math.round(activeProject.progress)}% · 완성도 {Math.round(activeProject.quality)}</span>
            </div>
            <div className="development-issue-next">
              <strong>다음 목표</strong>
              <span>출시까지 진행해서 리뷰와 경쟁사 반응을 확인하세요.</span>
            </div>
          </div>
        )}
        {shouldShowNextRunSetup && (
          <div className="next-run-command-panel">
            <div className="next-run-command-header">
              <div>
                <p className="eyebrow">다음 런 설계실</p>
                <h3>{nextRunSetupPlan.focusTitle}</h3>
                <span>{nextRunSetupPlan.focusSummary}</span>
              </div>
              <strong>
                런 {nextRunSetupPlan.currentRunNumber} → {nextRunSetupPlan.projectedRunNumber}
              </strong>
            </div>
            <div className="next-run-command-stats">
              <span>현재 통찰 {nextRunSetupPlan.currentFounderInsight}</span>
              <span>예상 보상 +{nextRunSetupPlan.insightReward}</span>
              <span>시작 가능 {nextRunSetupPlan.projectedFounderInsight}</span>
            </div>
            {nextRunSetupPlan.recoveryWarnings.length > 0 && (
              <div className="restart-warning-row">
                {nextRunSetupPlan.recoveryWarnings.map((warning) => (
                  <span key={warning}>{warning}</span>
                ))}
              </div>
            )}
            <div className="challenge-tier-picker" aria-label="다음 런 도전 티어 선택">
              <div>
                <strong>도전 티어</strong>
                <span>높은 티어는 월간 역풍이 붙고, 완주 보상 통찰 배수가 올라갑니다.</span>
              </div>
              <div className="challenge-tier-choice-grid">
                {difficultyTiers.map((tier) => {
                  const selected = selectedChallengeTierId === tier.id;
                  const headwind = formatEffects(tier.monthly_headwind);

                  return (
                    <button
                      aria-pressed={selected}
                      className={selected ? "selected" : ""}
                      key={tier.id}
                      onClick={() => setSelectedChallengeTierId(tier.id)}
                      type="button"
                    >
                      <strong>{tier.name}</strong>
                      <span>보상 x{tier.reward_multiplier}</span>
                      <small>{headwind === "변화 없음" ? "월간 역풍 없음" : `월간 ${headwind}`}</small>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="next-run-quick-start-grid">
              {nextRunSetupPlan.quickStarts.map((quickStart) => {
                const starterDeckTitle = starterDeckOptions.find((deckOption) => deckOption.id === quickStart.starterDeckId)?.title ?? quickStart.starterDeckId;

                return (
                  <button
                    disabled={!quickStart.affordable}
                    key={quickStart.id}
                    onClick={() =>
                      setGameState((current) =>
                        resetRunWithMetaUnlocks(
                          current,
                          quickStart.unlockIds,
                          quickStart.starterDeckId,
                          createEphemeralRunModifierSelection(`menu-quick-${quickStart.id}`, selectedChallengeTierId),
                        ),
                      )
                    }
                    type="button"
                  >
                    <strong>{quickStart.label}</strong>
                    <span>{quickStart.description}</span>
                    <small>
                      {starterDeckTitle} · 남은 통찰 {quickStart.projectedInsightAfterStart}
                    </small>
                  </button>
                );
              })}
            </div>
            <div className="next-run-recommendation-grid">
              {nextRunSetupPlan.recommendedUnlocks.slice(0, 3).map((unlock) => (
                <article key={unlock.id}>
                  <span className="meta-category-badge">{unlock.categoryLabel}</span>
                  <strong>{unlock.title}</strong>
                  <small>
                    비용 {unlock.cost} · {unlock.affordable ? "이번 보상으로 가능" : unlock.reasons[0] ?? "통찰 부족"}
                  </small>
                  <p>{unlock.reason}</p>
                </article>
              ))}
            </div>
          </div>
        )}
        {latestRunRecord && (
          <div className="next-run-onboarding">
            <div>
              <p className="eyebrow">새 런 브리핑</p>
              <strong>
                런 {gameState.roguelite.runNumber} 시작 · 통찰 {gameState.roguelite.founderInsight}
              </strong>
              <span>
                이전 런 {latestRunRecord.score}점 · {latestRunRecord.bestProductName ?? "출시 제품 없음"}
                {latestRunRecord.representativeCardName ? ` / ${latestRunRecord.representativeCardName}` : ""}
              </span>
            </div>
            <ol>
              <li>최근 런 기록에서 강했던 제품과 카드를 확인</li>
              <li>{affordableMetaUnlocks.length ? `${affordableMetaUnlocks[0].title} 같은 메타 해금 후보 검토` : "창업 통찰을 아껴 다음 해금 후보 준비"}</li>
              <li>제품 메뉴에서 첫 프로젝트를 시작해 새 런의 기준점 만들기</li>
            </ol>
          </div>
        )}
        {topRivalCounter && (
          <div className="counter-advice-strip">
            <strong>{topRivalCounter.competitorName} 대응</strong>
            <span>{topRivalCounter.label} · 압박 {topRivalCounter.pressureScore}</span>
            <small>추천 카드 {formatCardNames(topRivalCounter.counterCardIds)}</small>
            <small>추천 제품 {formatProductNames(topRivalCounter.recommendedProductIds)}</small>
          </div>
        )}
        <div className="deck-archetype-panel">
          <div>
            <p className="eyebrow">현재 빌드</p>
            <strong>{archetypeSummary.primary.title}</strong>
            <span>{archetypeSummary.primary.description}</span>
          </div>
          <div className="deck-archetype-score-grid">
            {[archetypeSummary.primary, ...archetypeSummary.secondary].slice(0, 4).map((archetype) => (
              <span key={archetype.id}>
                {archetype.title} <b>{archetype.matchScore}</b>
              </span>
            ))}
          </div>
          <small>
            다음 보상 추천: {archetypeSummary.recommendedNextTags.join(", ")} · {archetypeSummary.warning}
          </small>
        </div>
        <div className="deck-synergy-panel">
          <div>
            <p className="eyebrow">덱 시너지</p>
            <strong>{deckSynergySummary.active.length ? `${deckSynergySummary.active.length}개 활성` : "다음 시너지 준비 중"}</strong>
            <span>
              {deckSynergySummary.active.length
                ? `월간 ${formatEffects(deckSynergySummary.totalMonthlyEffects)} · 카드 보너스 x${deckSynergySummary.bestPlayEffectMultiplier.toFixed(2)}`
                : deckSynergySummary.warning ?? "태그를 모으면 빌드 보너스가 열립니다."}
            </span>
          </div>
          <div className="deck-synergy-grid">
            {[...deckSynergySummary.active, ...deckSynergySummary.nextCandidates].slice(0, 4).map((synergy) => (
              <article className={synergy.active ? "active" : ""} key={synergy.id}>
                <strong>{synergy.title}</strong>
                <span>{synergy.active ? formatEffects(synergy.monthlyEffects) : `${Math.round(synergy.progress * 100)}%`}</span>
                <small>{synergy.active ? synergy.risk_label : synergy.missingTags.slice(0, 2).join(" / ")}</small>
              </article>
            ))}
          </div>
        </div>
        {pendingReward && rewardBiasSummary && (
          <div className="reward-bias-strip">
            <strong>{rewardBiasSummary.title}</strong>
            <span>{rewardBiasSummary.description}</span>
          </div>
        )}
        <div className="card-hand">
          {handCards.map((card) => {
            const check = getStrategyCardPlayCheck(card, gameState);
            const effects = getStrategyCardEffects(card, gameState);
            return (
              <article className={`strategy-card rarity-${card.rarity}${upgradedCardIds.has(card.id) ? " upgraded" : ""}${isCounterCard(card) && rivalCounterSignal !== "none" ? ` strategy-card-counter strategy-card-counter-${rivalCounterSignal}` : ""}`} key={card.id}>
                <p className="item-meta">
                  {card.category} / {card.rarity}
                  {isCounterCard(card) && rivalCounterSignal !== "none" && (
                    <em
                      className={`strategy-card-counter-badge strategy-card-counter-badge-${rivalCounterSignal}`}
                      title="라이벌 압박 대응 카드"
                    >
                      압박 대응
                    </em>
                  )}
                </p>
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
                const biasMatch = getAnnualDirectiveRewardBiasMatch(card, gameState);
                return (
                  <article className={`strategy-card reward-choice rarity-${card.rarity}${isCounterCard(card) && rivalCounterSignal !== "none" ? ` strategy-card-counter strategy-card-counter-${rivalCounterSignal}` : ""}`} key={card.id}>
                    <p className="item-meta">
                      {card.category} / {card.rarity}
                      {isCounterCard(card) && rivalCounterSignal !== "none" && (
                        <em
                          className={`strategy-card-counter-badge strategy-card-counter-badge-${rivalCounterSignal}`}
                          title="라이벌 압박 대응 카드"
                        >
                          압박 대응
                        </em>
                      )}
                    </p>
                    <h3>{card.name}</h3>
                    <p>{card.description}</p>
                    {biasMatch && <small className="reward-bias-match">{biasMatch.label}</small>}
                    <div className="reward-effects-preview" aria-label={`${card.name} 효과 미리보기`}>
                      <strong>이 카드</strong>
                      <em className="reward-effects-arrow" aria-hidden="true">→</em>
                      <span className="reward-effects-list">{formatEffects(effects)}</span>
                    </div>
                    <div className="mini-row">
                      <span>비용 {formatCost(card.cost)}</span>
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
        {gameState.roguelite.runHistory.length > 0 && (
          <div className="run-record-list">
            <h3>최근 런 기록</h3>
            {gameState.roguelite.runHistory.slice(0, 4).map((record) => (
              <article key={record.id}>
                <strong>런 {record.runNumber} · {record.endedMonth}개월차 · {record.score}점</strong>
                {record.endingName && (
                  <span>
                    10년 엔딩 {record.campaignRank} · {record.endingName} · {record.survivedYears}년 생존
                  </span>
                )}
                <span>
                  {record.bestProductName ?? "출시 제품 없음"}
                  {record.representativeCardName ? ` / ${record.representativeCardName}` : ""}
                  {record.rivalName ? ` / 압박 ${record.rivalName}` : ""}
                </span>
                <small>{record.note} · 통찰 +{record.insightReward}</small>
              </article>
            ))}
          </div>
        )}
        <div className="ending-collection-panel" aria-label="엔딩 도감">
          <div className="payoff-collection-heading">
            <strong>엔딩 도감</strong>
            <span>{discoveredEndingCount}/{endingCollectionEntries.length} 발견</span>
          </div>
          <div className="ending-collection-summary" aria-label="엔딩 도감 진행">
            <span>
              <strong>{endingCollectionSummary.completionPercent}%</strong>
              <small>완성률</small>
            </span>
            <span>
              <strong>{endingCollectionSummary.lockedReplayableCount}</strong>
              <small>남은 목표 · 결과 전용 잠김 {endingCollectionSummary.finalOnlyLockedCount}</small>
            </span>
            <span>
              <strong>
                {endingCollectionSummary.discoveredRewardBonus}/{endingCollectionSummary.totalRewardBonus}
              </strong>
              <small>통찰 보상 · 남은 보상 {endingCollectionSummary.lockedRewardBonus}</small>
            </span>
            {endingCollectionSummary.nextReplayPlan ? (
              <button
                disabled={activeEndingReplayBrief?.id === endingCollectionSummary.nextReplayPlan.id}
                onClick={() =>
                  setGameState((current) =>
                    resetRunWithMetaUnlocks(
                      current,
                      [],
                      current.roguelite.starterDeckId ?? "balanced_founder",
                      endingCollectionSummary.nextReplayPlan!.selection,
                    ),
                  )
                }
                type="button"
              >
                <strong>다음 추천 목표</strong>
                <span>{endingCollectionSummary.nextReplayPlan.title}</span>
              </button>
            ) : (
              <span>
                <strong>목표 엔딩 완료</strong>
                <small>모든 목표 엔딩 발견</small>
              </span>
            )}
          </div>
          <div className="ending-collection-filter" aria-label="엔딩 도감 필터">
            {endingCollectionFilterOptions.map((option) => (
              <button
                className={endingCollectionFilter === option.id ? "active" : undefined}
                key={option.id}
                onClick={() => setEndingCollectionFilter(option.id)}
                type="button"
              >
                <strong>{option.label}</strong>
                <span>{option.count}</span>
              </button>
            ))}
          </div>
          <div className="ending-collection-sort" aria-label="엔딩 도감 정렬">
            {endingCollectionSortOptions.map((option) => (
              <button
                className={endingCollectionSort === option.id ? "active" : undefined}
                key={option.id}
                onClick={() => setEndingCollectionSort(option.id)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="ending-collection-grid">
            {sortedEndingCollectionEntries.length === 0 && (
              <p className="ending-collection-empty">아직 이 필터에 해당하는 엔딩이 없습니다.</p>
            )}
            {sortedEndingCollectionEntries.map((entry) => {
              const replaySelection = entry.selection;
              const isActiveTargetRun = activeEndingReplayBrief?.id === entry.id;

              return (
                <article className={entry.discovered ? "discovered" : "locked"} key={entry.id}>
                  <p className="item-meta">통찰 보너스 +{entry.meta_reward_bonus}</p>
                  <strong>{entry.discovered ? entry.title : "미발견 엔딩"}</strong>
                  <span>{entry.discovered ? entry.flavor : "10년 캠페인 결과에서 조건을 만족하면 공개됩니다."}</span>
                  <div className="ending-collection-progress" aria-label="엔딩 현재 런 진행">
                    <strong>현재 런 {entry.progressPercent}%</strong>
                    <span>조건 {entry.matchedRequirements}/{entry.totalRequirements}</span>
                    <small>다음 조건: {entry.nextRequirementLabel}</small>
                  </div>
                  {entry.targetLabels.length > 0 && <small>목표 힌트: {entry.targetLabels.slice(0, 4).join(" / ")}</small>}
                  {replaySelection && (
                    <button
                      className="ending-collection-run-button"
                      disabled={isActiveTargetRun && !setActiveMenu}
                      onClick={() => {
                        if (isActiveTargetRun) {
                          setActiveMenu?.("company");
                          return;
                        }

                        setGameState((current) =>
                          resetRunWithMetaUnlocks(current, [], current.roguelite.starterDeckId ?? "balanced_founder", replaySelection),
                        );
                      }}
                      type="button"
                    >
                      {isActiveTargetRun ? "현재 목표 확인" : "도감 목표 런"}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </div>
        <div className="ending-replay-panel" aria-label="엔딩 목표 런">
          <div className="payoff-collection-heading">
            <strong>엔딩 목표 런</strong>
            <span>조건 기반 추천 {endingReplayPlans.length}개</span>
          </div>
          {activeEndingReplayBrief && (
            <div className="ending-replay-active-summary" aria-label="현재 목표 엔딩 진행">
              <div>
                <p className="item-meta">현재 목표 진행</p>
                <strong>{activeEndingReplayBrief.title}</strong>
                <span>
                  조건 {activeEndingReplayBrief.matchedRequirements}/{activeEndingReplayBrief.totalRequirements} · {activeEndingReplayBrief.progressPercent}%
                </span>
                <small aria-label="완주 시 도감 통찰 예고">{activeEndingReplayBrief.rewardProgressLabel}</small>
              </div>
              {activeEndingReplayBrief.nextRequirements.length > 0 ? (
                <div className="ending-replay-active-actions">
                  {activeEndingReplayBrief.nextRequirements.slice(0, 3).map((requirement) => (
                    <button disabled={!setActiveMenu} key={requirement.id} onClick={() => setActiveMenu?.(requirement.targetMenu)} type="button">
                      <strong>{requirement.actionLabel}</strong>
                      <span>{requirement.currentLabel} / {requirement.targetLabel}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <small>현재 표시된 추적 조건은 충족됐습니다. 10년 캠페인 완주까지 운영을 이어가세요.</small>
              )}
            </div>
          )}
          <div className="ending-replay-grid">
            {endingReplayPlans.map((plan) => {
              const isActiveTargetRun = activeEndingReplayBrief?.id === plan.id;
              const className = [plan.discovered ? "discovered" : "locked", isActiveTargetRun ? "ending-replay-active-card" : ""]
                .filter(Boolean)
                .join(" ");

              return (
                <article className={className} key={plan.id}>
                  <div>
                    <p className="item-meta">{plan.discovered ? "발견 완료" : "미발견 목표"} · 통찰 보너스 +{plan.meta_reward_bonus}</p>
                    <strong>{plan.title}</strong>
                    <span>{plan.targetLabels.slice(0, 5).join(" / ")}</span>
                    <small>{plan.openingMoves.slice(0, 2).join(" / ")}</small>
                    {isActiveTargetRun && <small className="ending-replay-active-note">현재 목표 런 · 회사 체크리스트에서 다음 행동 확인</small>}
                  </div>
                  <button
                    disabled={isActiveTargetRun && !setActiveMenu}
                    onClick={() => {
                      if (isActiveTargetRun) {
                        setActiveMenu?.("company");
                        return;
                      }

                      setGameState((current) =>
                        resetRunWithMetaUnlocks(current, [], current.roguelite.starterDeckId ?? "balanced_founder", plan.selection),
                      );
                    }}
                    type="button"
                  >
                    {isActiveTargetRun ? "현재 목표 확인" : "목표 런"}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
        <div className="meta-unlock-list">
          <div className="starter-deck-choice-list">
            <h3>다음 런 시작 덱</h3>
            {starterDeckOptions.map((option) => (
              <article className={option.id === gameState.roguelite.starterDeckId ? "complete" : ""} key={option.id}>
                <div>
                  <p className="item-meta">{option.tags.join(" / ")}</p>
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                  {!option.available && <small>{option.lockedReason}</small>}
                </div>
                <button
                  disabled={!option.available}
                  onClick={() =>
                    setGameState((current) =>
                      resetRunWithMetaUnlocks(current, [], option.id, createEphemeralRunModifierSelection(`menu-deck-${option.id}`, selectedChallengeTierId)),
                    )
                  }
                  type="button"
                >
                  이 덱으로 새 런
                </button>
              </article>
            ))}
          </div>
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
                <button
                  disabled={unlocked || !check.ok}
                  onClick={() =>
                    setGameState((current) =>
                      resetRunWithMetaUnlocks(current, [unlock.id], "balanced_founder", createEphemeralRunModifierSelection(`menu-unlock-${unlock.id}`, selectedChallengeTierId)),
                    )
                  }
                >
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
  setActiveMenu,
}: {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  locale: LocaleCode;
  setActiveMenu?: Dispatch<SetStateAction<MenuId>>;
}) {
  const [selectedAgentIdsByProduct, setSelectedAgentIdsByProduct] = useState<Record<string, string[]>>({});
  const [selectedDomainFilterId, setSelectedDomainFilterId] = useState(ALL_PRODUCT_DOMAIN_FILTER_ID);
  const [selectedIdeaSubjectId, setSelectedIdeaSubjectId] = useState(productIdeaSubjects[0]?.id ?? "");
  const [selectedIdeaTypeId, setSelectedIdeaTypeId] = useState(productIdeaTypes[0]?.id ?? "");
  const [selectedIdeaOptionId, setSelectedIdeaOptionId] = useState(productIdeaBoldOptions[0]?.id ?? "");
  const availableAgents = gameState.hiredAgents.filter((agent) => !agent.assignment);
  const defaultSelectedAgentIds = availableAgents.slice(0, 3).map((agent) => agent.id);
  const availableProducts = getAvailableProductDefinitions(gameState);
  const expansionDomainIds = [
    "foundation_models",
    "semiconductors",
    "mobility",
    "robotics",
    "odd_industries",
    "toys",
    "manufacturing",
    "logistics",
    "energy",
  ];
  const unlockedDomainIds = new Set(gameState.unlockedDomains);
  const boundarylessGoals = getBoundarylessExpansionGoals(gameState);
  const industrySynergySummary = getIndustrySynergySummary(gameState);
  const industryComboSummary = getIndustryComboSummary(gameState);
  const payoffCollectionEntries = getPayoffCollectionEntries(gameState);
  const discoveredPayoffCount = payoffCollectionEntries.filter((entry) => entry.discovered).length;
  const archetypeCollectionEntries = getArchetypeCollectionEntries(gameState);
  const discoveredArchetypeCount = archetypeCollectionEntries.filter((entry) =>
    (gameState.roguelite.discoveredArchetypeIds ?? []).includes(entry.id),
  ).length;
  const domainFilters = getProductDomainFilters(availableProducts, domains, gameState);
  const strategyFocus = getAnnualStrategyMenuFocus(gameState, "products");
  const lastCapabilityUpgrade = gameState.lastCapabilityUpgrade;
  const ideaCoverage = getProductIdeaCoverage();
  const selectedConcept = createProductConcept(selectedIdeaSubjectId, selectedIdeaTypeId, selectedIdeaOptionId);
  const conceptCheck = getProductConceptProjectCheck(selectedConcept, gameState, defaultSelectedAgentIds);
  const renewalProducts = availableProducts.filter((product) => gameState.activeProducts.includes(product.id)).slice(0, 3);
  const filteredProducts = prioritizeAnnualStrategyFocus(
    getProductsByDomainFilter(availableProducts, selectedDomainFilterId).map((product) => product.id),
    strategyFocus,
  )
    .map((productId) => availableProducts.find((product) => product.id === productId))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
  const selectedFilter = domainFilters.find((filter) => filter.id === selectedDomainFilterId) ?? domainFilters[0];
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
  const starterProduct =
    availableProducts.find((product) => product.id === "ai_writing_assistant") ??
    filteredProducts.find((product) => getProductProjectCheck(product, gameState, defaultSelectedAgentIds).ok);
  const starterAgentIds = starterProduct ? getSelectedAgentIds(starterProduct.id) : [];
  const starterAgents = gameState.hiredAgents.filter((agent) => starterAgentIds.includes(agent.id));
  const starterCheck = starterProduct ? getProductProjectCheck(starterProduct, gameState, starterAgentIds) : undefined;
  const starterForecast = starterProduct ? getProductProjectForecast(starterProduct, gameState, starterAgentIds) : undefined;
  const shouldShowStarterLaunchpad =
    Boolean(starterProduct) &&
    gameState.hiredAgents.length > 0 &&
    gameState.productProjects.length === 0 &&
    gameState.activeProducts.length === 0;
  const researchProductCandidates = lastCapabilityUpgrade
    ? getResearchProductCandidates(lastCapabilityUpgrade, availableProducts, gameState)
    : [];
  const researchProduct = researchProductCandidates[0];
  const researchProductStarted = lastCapabilityUpgrade
    ? getResearchProductStartedCandidate(lastCapabilityUpgrade, availableProducts, gameState)
    : undefined;
  const researchProductStartedProject = researchProductStarted
    ? gameState.productProjects.find((project) => project.productId === researchProductStarted.id)
    : undefined;
  const researchProductStartedAgents = researchProductStartedProject
    ? gameState.hiredAgents.filter((agent) => researchProductStartedProject.assignedAgentIds.includes(agent.id))
    : [];
  const researchProductAgentIds = researchProduct ? getSelectedAgentIds(researchProduct.id) : [];
  const researchProductCheck = researchProduct ? getProductProjectCheck(researchProduct, gameState, researchProductAgentIds) : undefined;
  const researchProductForecast = researchProduct ? getProductProjectForecast(researchProduct, gameState, researchProductAgentIds) : undefined;
  const researchProductDomain = researchProduct ? domains.find((domain) => domain.id === researchProduct.domain) : undefined;
  const shouldShowResearchProductLaunchpad = Boolean(
    lastCapabilityUpgrade && lastCapabilityUpgrade.month === gameState.month && researchProduct,
  );
  const shouldShowResearchProductStarted = Boolean(
    lastCapabilityUpgrade && lastCapabilityUpgrade.month === gameState.month && researchProductStarted && researchProductStartedProject,
  );

  return (
    <section className="panel products-panel">
      <div className="panel-heading">
        <h2>제품 개발</h2>
        <p>AI 모델에서 시작해 앱, 칩, 로봇, 차량, 엉뚱한 소비 산업으로 확장합니다. 핵심 개발력은 투입 팀과 에이전트 조합이 만듭니다.</p>
      </div>
      {strategyFocus && (
        <div className="strategy-focus-strip">
          <strong>{strategyFocus.title}: {strategyFocus.label}</strong>
          <span>{strategyFocus.reason}</span>
        </div>
      )}
      {shouldShowResearchProductStarted && lastCapabilityUpgrade && researchProductStarted && researchProductStartedProject && (
        <div className="research-product-started-ribbon" aria-label="신제품 개발 시작">
          <div>
            <p className="eyebrow">신제품 개발 시작</p>
            <h3>{researchProductStarted.name}</h3>
            <span>{lastCapabilityUpgrade.capabilityName} Lv.{lastCapabilityUpgrade.nextLevel} 연구 성과가 실제 개발 프로젝트로 전환됐습니다.</span>
          </div>
          <div className="research-product-started-grid">
            <article>
              <strong>개발 진행</strong>
              <span>{researchProductStartedProject.progress}% · {researchProductStartedProject.startedMonth}개월차 착수</span>
            </article>
            <article>
              <strong>완성도</strong>
              <span>{researchProductStartedProject.quality} / 신뢰 기준 {researchProductStarted.trust_requirement}</span>
            </article>
            <article>
              <strong>투입 팀</strong>
              <span>{researchProductStartedAgents.length ? researchProductStartedAgents.map((agent) => agent.name).join(", ") : "투입 팀 확인 필요"}</span>
            </article>
          </div>
          <div className="research-product-started-actions">
            <span>다음 개발 이슈: 덱에서 카드 이슈를 해결해 진행률과 완성도를 끌어올리세요.</span>
            <button onClick={() => setActiveMenu?.("deck")} type="button">
              덱 열기
            </button>
          </div>
        </div>
      )}
      {shouldShowResearchProductLaunchpad && lastCapabilityUpgrade && researchProduct && researchProductCheck && researchProductForecast && (
        <div className="research-product-launchpad" aria-label="연구가 연 제품 후보">
          <div>
            <p className="eyebrow">연구가 연 제품 후보</p>
            <h3>{researchProduct.name}</h3>
            <span>{lastCapabilityUpgrade.capabilityName} Lv.{lastCapabilityUpgrade.nextLevel} 연구가 {researchProductDomain?.name ?? researchProduct.domain} 시장 진입로를 열었습니다.</span>
          </div>
          <div className="research-product-grid">
            <article>
              <strong>해금 시장</strong>
              <span>{lastCapabilityUpgrade.unlockedDomainName ?? researchProductDomain?.name ?? "기존 시장 강화"}</span>
            </article>
            <article>
              <strong>다음 제품 후보</strong>
              <span>{researchProduct.name}</span>
            </article>
            <article>
              <strong>예상 결과</strong>
              <span>{researchProductForecast.expectedReviewGrade} / {researchProductForecast.expectedReviewScore}점 · {researchProductForecast.estimatedMonths}개월</span>
            </article>
          </div>
          <div className="research-product-actions">
            <span>{researchProductCheck.ok ? "지금 개발을 시작할 수 있습니다." : `필요 조건: ${researchProductCheck.reasons.join(" / ")}`}</span>
            {researchProductCheck.ok ? (
              <button
                disabled={gameState.status !== "playing"}
                onClick={() => setGameState((current) => startProductProject(researchProduct, current, researchProductAgentIds))}
                type="button"
              >
                신제품 개발 시작
              </button>
            ) : (
              <button onClick={() => setActiveMenu?.("research")} type="button">
                필요 연구 보기
              </button>
            )}
          </div>
        </div>
      )}
      {shouldShowStarterLaunchpad && starterProduct && starterCheck && starterForecast && (
        <div className="first-project-launchpad" aria-label="추천 첫 제품">
          <div>
            <p className="eyebrow">추천 첫 제품</p>
            <h3>{starterProduct.name}</h3>
            <span>{starterProduct.description}</span>
          </div>
          <div className="first-project-launchpad-meta">
            <span>예상 {starterForecast.estimatedMonths}개월</span>
            <span>리뷰 {starterForecast.expectedReviewGrade} / {starterForecast.expectedReviewScore}점</span>
            <span>완성도 {starterForecast.expectedQuality}</span>
          </div>
          <div className="first-project-launchpad-team">
            <strong>자동 팀</strong>
            <span>{starterAgents.length ? starterAgents.map((agent) => agent.name).join(", ") : "투입 가능한 에이전트 없음"}</span>
          </div>
          <button
            disabled={!starterCheck.ok || gameState.status !== "playing"}
            onClick={() => setGameState((current) => startProductProject(starterProduct, current, starterAgentIds))}
            type="button"
          >
            첫 제품 개발 시작
          </button>
          {!starterCheck.ok && <small>{starterCheck.reasons.join(" / ")}</small>}
        </div>
      )}
      <div className="idea-composer-panel">
        <div className="panel-heading compact-heading">
          <h3>아이디어 조합실</h3>
          <p>
            소재 {ideaCoverage.subjects}개 × 타입 {ideaCoverage.productTypes}개 × 파격 옵션 {ideaCoverage.boldOptions}개,
            총 {ideaCoverage.totalCombinations.toLocaleString("ko-KR")}개 조합을 검토합니다.
          </p>
        </div>
        <div className="idea-picker-grid">
          <label>
            <span>소재/산업</span>
            <select value={selectedIdeaSubjectId} onChange={(event) => setSelectedIdeaSubjectId(event.target.value)}>
              {productIdeaSubjects.map((subject) => (
                <option value={subject.id} key={subject.id}>{subject.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>제품 타입</span>
            <select value={selectedIdeaTypeId} onChange={(event) => setSelectedIdeaTypeId(event.target.value)}>
              {productIdeaTypes.map((ideaType) => (
                <option value={ideaType.id} key={ideaType.id}>{ideaType.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>파격 옵션</span>
            <select value={selectedIdeaOptionId} onChange={(event) => setSelectedIdeaOptionId(event.target.value)}>
              {productIdeaBoldOptions.map((option) => (
                <option value={option.id} key={option.id}>{option.name}</option>
              ))}
            </select>
          </label>
        </div>
        <article className={`idea-result-card tier-${selectedConcept.noveltyTier}`}>
          <div>
            <p className="item-meta">{selectedConcept.suggestedDomain} / {selectedConcept.noveltyTier}</p>
            <h3>{selectedConcept.title}</h3>
            <p>{selectedConcept.pitch}</p>
          </div>
          <div className="idea-score-grid">
            <span>궁합 {selectedConcept.score}점</span>
            <span>비용 {formatCost(selectedConcept.prototypeCost)}</span>
            <span>필요 {selectedConcept.capabilityRequirements.slice(0, 2).join(", ")}</span>
          </div>
          <div className="idea-tag-list">
            {selectedConcept.strengths.slice(0, 4).map((strength) => <span key={strength}>강점 {strength}</span>)}
            {selectedConcept.risks.slice(0, 3).map((risk) => <span className="risk" key={risk}>위험 {risk}</span>)}
          </div>
          <div className="idea-action-row">
            <button
              disabled={!conceptCheck.ok || gameState.status !== "playing"}
              onClick={() => setGameState((current) => startProductConceptProject(selectedConcept, current, defaultSelectedAgentIds))}
              type="button"
            >
              조합 개발 시작
            </button>
            <small>
              {conceptCheck.ok
                ? `투입 예정 ${defaultSelectedAgentIds.length}명 · 출시 후 제품 목록에 등록`
                : conceptCheck.reasons.join(" / ")}
            </small>
          </div>
        </article>
      </div>
      <div className="renewal-option-panel">
        <div className="panel-heading compact-heading">
          <h3>기존 제품 리뉴얼 후보</h3>
          <p>새 제품만 찍어내는 대신 대표 제품을 메이저 업데이트, 리뉴얼, 파생 라인으로 다시 출시합니다.</p>
        </div>
        {renewalProducts.length ? (
          <div className="renewal-option-grid">
            {renewalProducts.flatMap((product) =>
              getRenewalReleaseOptions(product, getProductLevel(product.id, gameState) + 1).map((option) => {
                const renewalCheck = getProductRenewalProjectCheck(product, option.id, gameState, defaultSelectedAgentIds);

                return (
                  <article key={`${product.id}-${option.id}`}>
                    <p className="item-meta">{product.name}</p>
                    <strong>{option.releaseName}</strong>
                    <span>{option.description}</span>
                    <small>{option.effects.join(" / ")}</small>
                    <div className="idea-action-row">
                      <button
                        disabled={!renewalCheck.ok || gameState.status !== "playing"}
                        onClick={() => setGameState((current) => startProductRenewalProject(product, option.id, current, defaultSelectedAgentIds))}
                        type="button"
                      >
                        리뉴얼 개발
                      </button>
                      <small>
                        {renewalCheck.ok
                          ? `비용 ${formatCost(getProductRenewalCost(product, gameState))}`
                          : renewalCheck.reasons.join(" / ")}
                      </small>
                    </div>
                  </article>
                );
              }),
            )}
          </div>
        ) : (
          <p className="empty-note">첫 제품을 출시하면 여기에서 v2, 리뉴얼, 파생 라인 후보가 뜹니다.</p>
        )}
      </div>
      <div className="expansion-map">
        {expansionDomainIds.map((domainId) => {
          const domain = domains.find((entry) => entry.id === domainId);
          if (!domain) return null;
          const domainProducts = availableProducts.filter((product) => product.domain === domain.id);
          const unlocked = unlockedDomainIds.has(domain.id);

          return (
            <article className={unlocked ? "unlocked" : ""} key={domain.id}>
              <strong>{domain.name}</strong>
              <span>{unlocked ? "진출 가능" : "잠김"} · 제품 {domainProducts.length}개</span>
            </article>
          );
        })}
      </div>
      <div className="boundaryless-goal-panel">
        <div className="panel-heading compact-heading">
          <h3>경계 확장 목표</h3>
          <p>AI 모델 회사가 물리 산업과 엉뚱한 소비 산업까지 넘어가는 장기 목표입니다.</p>
        </div>
        <div className="boundaryless-goal-grid">
          {boundarylessGoals.map((goal) => (
            <article className={`goal-${goal.status}`} key={goal.domainId}>
              <strong>{goal.domainName} · {boundarylessStatusLabel(goal.status)}</strong>
              <span>{goal.nextProductName ? `다음: ${goal.nextProductName}` : "제품 출시 완료"}</span>
              <small>{goal.payoff}</small>
              <i style={{ width: `${goal.progressPercent}%` }} />
            </article>
          ))}
        </div>
      </div>
      <div className="industry-synergy-panel">
        <div>
          <p className="eyebrow">산업 간 시너지</p>
          <strong>{industrySynergySummary.active.length ? `${industrySynergySummary.active.length}개 가동` : "시너지 준비 중"}</strong>
          <span>
            월간 효과 {Object.keys(industrySynergySummary.totalMonthlyEffects).length ? formatEffects(industrySynergySummary.totalMonthlyEffects) : "없음"}
          </span>
        </div>
        <div className="industry-synergy-grid">
          {industrySynergySummary.active.slice(0, 3).map((synergy) => (
            <article className="active" key={synergy.id}>
              <strong>{synergy.title}</strong>
              <span>{formatEffects(synergy.monthly_effects)}</span>
            </article>
          ))}
          {industrySynergySummary.active.length === 0 && industrySynergySummary.nextCandidate && (
            <article>
              <strong>다음 후보: {industrySynergySummary.nextCandidate.title}</strong>
              <span>{industrySynergySummary.nextCandidate.progressLabel}</span>
            </article>
          )}
        </div>
      </div>
      <div className="industry-combo-panel">
        <div>
          <p className="eyebrow">고위험 산업 조합</p>
          <strong>{industryComboSummary.active.length ? `${industryComboSummary.active.length}개 가동` : "조합 준비 중"}</strong>
          <span>
            월간 효과 {Object.keys(industryComboSummary.totalMonthlyEffects).length ? formatEffects(industryComboSummary.totalMonthlyEffects) : "없음"}
          </span>
        </div>
        <div className="industry-combo-grid">
          {industryComboSummary.active.slice(0, 3).map((combo) => (
            <article className="active" key={combo.id}>
              <strong>{combo.title}</strong>
              <span>{formatEffects(combo.monthly_effects)}</span>
              <small>{combo.risk_label}</small>
            </article>
          ))}
          {industryComboSummary.active.length === 0 && industryComboSummary.nextCandidate && (
            <article>
              <strong>다음 후보: {industryComboSummary.nextCandidate.title}</strong>
              <span>{industryComboSummary.nextCandidate.progressLabel}</span>
              <small>{industryComboSummary.nextCandidate.risk_label}</small>
            </article>
          )}
        </div>
      </div>
      <div className="payoff-collection-panel" aria-label="발견 도감">
        <div className="payoff-collection-heading">
          <div>
            <p className="eyebrow">페이오프 도감</p>
            <strong>
              {discoveredPayoffCount} / {payoffCollectionEntries.length} 발견
            </strong>
          </div>
          <span>처음 발동한 조합과 시너지가 공개됩니다.</span>
        </div>
        <div className="payoff-collection-grid">
          {payoffCollectionEntries.map((entry) => (
            <article className={entry.discovered ? "discovered" : "locked"} key={entry.id}>
              <p className="item-meta">{entry.kind === "combo" ? "고위험 조합" : "산업 시너지"}</p>
              <strong>{entry.discovered ? entry.title : "???"}</strong>
              <span>{entry.discovered ? formatEffects(entry.monthlyEffects) : `${entry.requiredDomains.length}개 산업 조건`}</span>
              <small>{entry.discovered ? entry.riskLabel ?? entry.description : "발동하면 공개"}</small>
            </article>
          ))}
        </div>
      </div>
      <div className="archetype-collection-panel" aria-label="아키타입 도감">
        <div className="payoff-collection-heading">
          <div>
            <p className="eyebrow">아키타입 도감</p>
            <strong>
              {discoveredArchetypeCount} / {archetypeCollectionEntries.length} 발견
            </strong>
          </div>
          <span>런 태그 조합에서 한 번이라도 파생된 아키타입이 공개됩니다.</span>
        </div>
        <div className="archetype-collection-grid">
          {archetypeCollectionEntries.map((entry) => (
            <article className={entry.discovered ? "discovered" : "locked"} key={entry.id}>
              <p className="item-meta">{entry.yields.kind === "product" ? "제품 후보" : entry.yields.kind === "event" ? "이벤트 씨앗" : "보너스 씨앗"}</p>
              <strong>{entry.discovered ? entry.title : "???"}</strong>
              <span>{entry.discovered ? entry.yields.summary : `${entry.requires.length}개 태그 조건`}</span>
              <small>{entry.discovered ? entry.description : "새 런 조합에서 파생되면 공개"}</small>
            </article>
          ))}
        </div>
      </div>
      {!gameState.hiredAgents.length && <p className="empty-note">먼저 에이전트 메뉴에서 첫 에이전트를 고용하면 제품 개발을 시작할 수 있습니다.</p>}
      <div className="domain-filter" aria-label="제품 산업 필터">
        {domainFilters.map((filter) => (
          <button
            aria-pressed={selectedFilter.id === filter.id}
            className={`${selectedFilter.id === filter.id ? "selected" : ""}${filter.unlocked ? "" : " locked"}`}
            key={filter.id}
            onClick={() => setSelectedDomainFilterId(filter.id)}
            type="button"
          >
            <strong>{filter.label}</strong>
            <span>
              제품 {filter.productCount}개{filter.unlocked ? "" : " · 잠김"}
            </span>
            {!filter.unlocked && filter.lockedReason && <small>{filter.lockedReason}</small>}
          </button>
        ))}
      </div>
      <div className="filter-summary">
        <strong>{selectedFilter.label}</strong>
        <span>{selectedFilter.id === ALL_PRODUCT_DOMAIN_FILTER_ID ? "모든 제품 후보" : `${filteredProducts.length}개 후보`} 표시</span>
      </div>
      <div className="item-list products-list">
        {filteredProducts.map((product) => {
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
            <article className={`item-card product-card${strategyFocus?.targetId === product.id ? " strategy-focus" : ""}`} key={product.id}>
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

function getResearchProductCandidatePool(
  moment: NonNullable<GameState["lastCapabilityUpgrade"]>,
  availableProducts: ProductDefinition[],
): ProductDefinition[] {
  const domainProducts = moment.unlockedDomainId
    ? availableProducts.filter((product) => product.domain === moment.unlockedDomainId)
    : [];
  const capabilityProducts = availableProducts.filter((product) => {
    const requiredLevel = product.required_capabilities[moment.capabilityId];
    return typeof requiredLevel === "number" && requiredLevel <= moment.nextLevel;
  });

  return [...new Map([...domainProducts, ...capabilityProducts].map((product) => [product.id, product])).values()].slice(0, 3);
}

function getResearchProductCandidates(
  moment: NonNullable<GameState["lastCapabilityUpgrade"]>,
  availableProducts: ProductDefinition[],
  gameState: GameState,
) {
  return getResearchProductCandidatePool(moment, availableProducts).filter(
    (product) =>
      !gameState.activeProducts.includes(product.id) &&
      !gameState.productProjects.some((project) => project.productId === product.id),
  );
}

function getResearchProductStartedCandidate(
  moment: NonNullable<GameState["lastCapabilityUpgrade"]>,
  availableProducts: ProductDefinition[],
  gameState: GameState,
) {
  return getResearchProductCandidatePool(moment, availableProducts).find((product) =>
    gameState.productProjects.some((project) => project.productId === product.id),
  );
}

function AgentsPanel({ gameState, setGameState }: { gameState: GameState; setGameState: Dispatch<SetStateAction<GameState>> }) {
  const [kindFilter, setKindFilter] = useState<"all" | AgentKind>("all");
  const [recruitmentChannelId, setRecruitmentChannelId] = useState<RecruitmentChannelId>("open_recruiting");
  const agentRows = getAgentContentRows(gameState);
  const recommendations = getFoundationRecommendations(gameState, 4);
  const phase = getCampaignContentPhase(gameState);
  const workforceSynergySummary = getWorkforceSynergySummary(gameState);
  const retentionAlerts = getAgentRetentionAlerts(gameState);
  const staffIncidents = getStaffIncidentBriefs(gameState);
  const recentStaffAftermaths = getRecentStaffIncidentAftermathLog(gameState);
  const recentStaffResolutions = getRecentStaffIncidentResolutionLog(gameState);
  const selectedRecruitmentChannel = recruitmentChannels.find((channel) => channel.id === recruitmentChannelId) ?? recruitmentChannels[0];
  const candidatePool = getRecruitmentCandidatePool(gameState, recruitmentChannelId);
  const recruitmentBrand = getRecruitmentBrandProfile(gameState);
  const candidateAgentIds = new Set(candidatePool.candidateIds);
  const filteredAgentRows = agentRows.filter((row) => candidateAgentIds.has(row.agent.id) && (kindFilter === "all" || row.kind === kindFilter));
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
        <div className="team-ops-summary">
          <span>AI 운용 {getAiAgentCount(gameState)}/{getAiOperationCapacity(gameState)}</span>
          <span>사람 직원이 늘면 AI 에이전트를 더 안정적으로 굴릴 수 있습니다.</span>
        </div>
        {recentStaffAftermaths.length > 0 && (
          <div className="staff-aftermath-panel" aria-live="polite">
            <div>
              <p className="eyebrow">최근 인사 후폭풍</p>
              <strong>{recentStaffAftermaths[0].agentName} · {recentStaffAftermaths[0].resolutionLabel}</strong>
              <span>{recentStaffAftermaths[0].summary}</span>
            </div>
            {recentStaffAftermaths.slice(0, 2).map((record) => (
              <article className={`staff-aftermath-card severity-${record.severity}`} key={record.id}>
                <strong>{record.incidentTitle}</strong>
                <span>{record.sourceCompetitorName ? `${record.sourceCompetitorName} · ${record.effectLabel}` : record.effectLabel}</span>
                {record.projectImpactLabel && <small>{record.projectImpactLabel}</small>}
                <small>{record.month}개월차 · {record.stakesLabel ?? "월간 방치 압박"}</small>
              </article>
            ))}
          </div>
        )}
        {staffIncidents.length > 0 && (
          <div className="staff-incident-panel">
            <div>
              <p className="eyebrow">인사 사건</p>
              <strong>{staffIncidents.length}건 감지</strong>
              <span>번아웃, 스카우트, 계약 불만을 먼저 잡아 핵심 인재 이탈을 막습니다.</span>
            </div>
            {staffIncidents.map((incident) => {
              const resolutionOptions = getStaffIncidentResolutionOptions(incident.id, gameState);
              return (
                <article className={`staff-incident-card incident-${incident.type} severity-${incident.severity}`} key={incident.id}>
                  <div>
                    <strong>{incident.title}</strong>
                    <span>{incident.description}</span>
                    <small>{incident.triggerLabel}</small>
                  </div>
                  {incident.sourceCompetitorName && (
                    <div className="staff-incident-source">
                      <strong>{incident.sourceCompetitorName}</strong>
                      <span>{incident.offerLabel}</span>
                      <small>{incident.stakesLabel}</small>
                    </div>
                  )}
                  {incident.aftermathLabel && <small className="staff-incident-aftermath-warning">{incident.aftermathLabel}</small>}
                  <div className="staff-incident-actions">
                    {resolutionOptions.map((option) => (
                      <button
                        className={option.recommended ? "recommended" : ""}
                        disabled={!option.available || gameState.status !== "playing"}
                        key={option.id}
                        onClick={() => setGameState((current) => resolveStaffIncident(incident.id, option.id, current))}
                        title={option.available ? `${option.description} · ${option.effectLabel}` : option.reasons.join(" / ")}
                        type="button"
                      >
                        <strong>{option.label}</strong>
                        <span>{option.effectLabel}</span>
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {recentStaffResolutions.length > 0 && (
          <div className="staff-resolution-result-panel" aria-live="polite">
            <div>
              <p className="eyebrow">최근 인사 대응</p>
              <strong>{recentStaffResolutions[0].agentName} · {recentStaffResolutions[0].resolutionLabel}</strong>
              <span>{recentStaffResolutions[0].summary}</span>
            </div>
            {recentStaffResolutions.slice(0, 3).map((record) => (
              <article className={`staff-resolution-result-card severity-${record.severity}`} key={record.id}>
                <div>
                  <strong>{record.incidentTitle}</strong>
                  <span>{record.sourceCompetitorName ? `${record.sourceCompetitorName} · ${record.effectLabel}` : record.effectLabel}</span>
                </div>
                <small>{record.month}개월차 · {record.resolutionLabel}{record.stakesLabel ? ` · ${record.stakesLabel}` : ""}</small>
              </article>
            ))}
          </div>
        )}
        {retentionAlerts.length > 0 && (
          <div className="retention-alert-list">
            {retentionAlerts.slice(0, 2).map((alert) => (
              <article className={`retention-${alert.severity}`} key={alert.agentId}>
                <strong>{alert.agentName} · 충성 {alert.loyalty}</strong>
                <span>{alert.message}</span>
              </article>
            ))}
          </div>
        )}
        <div className="workforce-synergy-panel">
          <div>
            <p className="eyebrow">팀 조합</p>
            <strong>{workforceSynergySummary.active.length ? `${workforceSynergySummary.active.length}개 조합 가동` : "조합 준비 중"}</strong>
            <span>
              프로젝트 보너스 진행 +{workforceSynergySummary.projectProgressBonus} · 완성도 +{workforceSynergySummary.projectQualityBonus}
            </span>
          </div>
          {workforceSynergySummary.active.slice(0, 2).map((synergy) => (
            <article className="active" key={synergy.id}>
              <strong>{synergy.title}</strong>
              <span>{synergy.description}</span>
            </article>
          ))}
          {workforceSynergySummary.active.length === 0 && workforceSynergySummary.nextCandidate && (
            <article>
              <strong>다음 후보: {workforceSynergySummary.nextCandidate.title}</strong>
              <span>{workforceSynergySummary.nextCandidate.progressLabel}</span>
            </article>
          )}
        </div>
        <div className="foundation-panel compact">
          <div>
            <p className="eyebrow">현재 기반</p>
            <h3>{phase.label}</h3>
            <span>{phase.description}</span>
          </div>
          <div className="recommendation-list">
            {recommendations.agents.map((row) => (
              <span key={row.agent.id}>{row.agent.name} · {row.recommendationReason}</span>
            ))}
          </div>
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
        <div className="recruitment-channel-panel">
          <div>
            <p className="eyebrow">채용 방식</p>
            <h3>{selectedRecruitmentChannel.label}</h3>
            <span>{selectedRecruitmentChannel.description}</span>
          </div>
          <div className="recruitment-channel-buttons" role="tablist" aria-label="채용 방식 선택">
            {recruitmentChannels.map((channel) => (
              <button
                aria-selected={recruitmentChannelId === channel.id}
                className={`recruitment-channel-button${recruitmentChannelId === channel.id ? " selected" : ""}`}
                key={channel.id}
                onClick={() => setRecruitmentChannelId(channel.id)}
                type="button"
              >
                <strong>{channel.label}</strong>
                <span>계약 {channel.qualityLabel}</span>
              </button>
            ))}
          </div>
          <div className="contract-summary">
            <span className="contract-badge">채용비 x{selectedRecruitmentChannel.costMultiplier}</span>
            <span className="contract-badge">연봉 x{selectedRecruitmentChannel.upkeepMultiplier}</span>
            <span className="contract-badge">능력 +{selectedRecruitmentChannel.statBonus}</span>
            <span className="contract-badge risk">{selectedRecruitmentChannel.riskLabel}</span>
          </div>
          <div className="candidate-pool-strip">
            <span>{candidatePool.summary}</span>
            <span>{candidatePool.locationLabel}</span>
            <span>{candidatePool.refreshLabel}</span>
          </div>
          <div className="recruitment-brand-panel">
            <div>
              <strong>{recruitmentBrand.gradeLabel}</strong>
              <span>{recruitmentBrand.capacityLabel} · 후보 풀 +{recruitmentBrand.candidatePoolBonus}</span>
            </div>
            <div className="brand-meter" aria-label={`채용 브랜드 ${recruitmentBrand.score}점`}>
              <i style={{ width: `${recruitmentBrand.score}%` }} />
            </div>
            <div className="brand-driver-list">
              {recruitmentBrand.drivers.slice(0, 4).map((driver) => (
                <span key={driver}>{driver}</span>
              ))}
              {recruitmentBrand.warnings.slice(0, 2).map((warning) => (
                <span className="warning" key={warning}>{warning}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="content-filter" role="tablist" aria-label="고용 후보 필터">
          {[
            ["all", "전체"],
            ["human", "사람"],
            ["ai_agent", "AI"],
            ["robot", "로봇"],
          ].map(([id, label]) => (
            <button
              aria-selected={kindFilter === id}
              className={kindFilter === id ? "selected" : ""}
              key={id}
              onClick={() => setKindFilter(id as "all" | AgentKind)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        {filteredAgentRows.length ? (
          <div className="agent-grid">
            {filteredAgentRows.map((row) => {
              const check = getAgentHireCheckForChannel(row.agent, gameState, recruitmentChannelId);
              const offer = getRecruitmentOffer(row.agent, gameState, recruitmentChannelId);
              const isHired = gameState.hiredAgents.some((hiredAgent) => hiredAgent.typeId === row.agent.id);

              return (
                <AgentCard
                  agent={row.agent}
                  check={check}
                  contentRow={row}
                  offer={offer}
                  isHired={isHired}
                  key={row.agent.id}
                  onHire={() => setGameState((current) => hireAgentViaChannel(row.agent, current, recruitmentChannelId))}
                />
              );
            })}
          </div>
        ) : (
          <p className="candidate-pool-empty">이번 달 조건에 맞는 후보가 없습니다. 필터를 바꾸거나 다음 달 후보 갱신을 기다리세요.</p>
        )}
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
  const assignedProduct = assignedProject
    ? getAvailableProductDefinitions(gameState).find((product) => product.id === assignedProject.productId)
    : undefined;
  const agentSprite = getAgentSprite(agentType?.id);
  const recruitmentChannel = recruitmentChannels.find((channel) => channel.id === agent.recruitmentChannelId);
  const contractUpkeep = agent.upkeep ?? agentType?.upkeep ?? {};
  const careerStatus = getAgentCareerStatus(agent, gameState);
  const developmentProfile = getAgentDevelopmentProfile(agent, gameState);
  const restCost = getAgentRestCost(agent);
  const salaryNegotiationCost = getAgentSalaryNegotiationCost(agent);
  const restCheck = getAgentRestCheck(agent.id, gameState);
  const salaryNegotiationCheck = getAgentSalaryNegotiationCheck(agent.id, gameState);
  const specializationOptions = getAgentSpecializationOptions(agent, gameState);
  const selectedSpecialization = specializationOptions.find((option) => option.selected);
  const careHint =
    !restCheck.ok && !salaryNegotiationCheck.ok
      ? [...new Set([...restCheck.reasons, ...salaryNegotiationCheck.reasons])][0]
      : careerStatus.retentionSeverity === "critical"
        ? "퇴사 위험: 휴식 또는 연봉 협상 권장"
        : undefined;

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
      <div className="personality-strip">
        <span>{developmentProfile.traitLabel}</span>
        <span>{developmentProfile.growthFocusLabel}</span>
        <small>{developmentProfile.traitDescription}</small>
      </div>
      <div className="preference-row">
        <strong>선호 장비</strong>
        {developmentProfile.preferredItemNames.slice(0, 3).map((itemName) => (
          <span className={developmentProfile.matchedPreferredItemNames.includes(itemName) ? "matched" : ""} key={itemName}>
            {itemName}
          </span>
        ))}
        {developmentProfile.preferredItemNames.length === 0 && <span>없음</span>}
      </div>
      <div className="specialization-panel">
        <div>
          <strong>{selectedSpecialization ? selectedSpecialization.label : "전문화 분기"}</strong>
          <span>{selectedSpecialization ? selectedSpecialization.description : "Lv.3부터 성장 방향을 하나 고릅니다."}</span>
        </div>
        {!selectedSpecialization && (
          <div className="specialization-actions">
            {specializationOptions.map((option) => (
              <button
                disabled={!option.unlocked || gameState.status !== "playing"}
                key={option.id}
                onClick={() => setGameState((current) => chooseAgentSpecialization(agent.id, option.stat, current))}
                title={option.unlocked ? option.description : option.reasons.join(" / ")}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
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
        <span>{recruitmentChannel?.label ?? "기본 계약"}</span>
      </div>
      <div className="career-panel">
        <div className="career-meter" aria-label={`${agent.name} 성장 경험치 ${careerStatus.progressPercent}%`}>
          <i style={{ width: `${careerStatus.progressPercent}%` }} />
        </div>
        <div className="contract-row">
          <span className="contract-badge">경험 {careerStatus.experience}/{careerStatus.nextLevelExperience}</span>
          <span className={`contract-badge retention-${careerStatus.retentionSeverity}`}>충성 {careerStatus.loyalty} · {careerStatus.retentionRiskLabel}</span>
          <span className="contract-badge">능력 보너스 +{careerStatus.levelBonus}</span>
        </div>
      </div>
      <div className="care-actions">
        <button
          disabled={!restCheck.ok || gameState.status !== "playing"}
          onClick={() => setGameState((current) => restAgent(agent.id, current))}
          title={restCheck.ok ? `비용 ${formatCost(restCost)}` : restCheck.reasons.join(" / ")}
          type="button"
        >
          <strong>휴식</strong>
          <span>{formatCost(restCost)}</span>
        </button>
        <button
          disabled={!salaryNegotiationCheck.ok || gameState.status !== "playing"}
          onClick={() => setGameState((current) => negotiateAgentSalary(agent.id, current))}
          title={salaryNegotiationCheck.ok ? `비용 ${formatCost(salaryNegotiationCost)}` : salaryNegotiationCheck.reasons.join(" / ")}
          type="button"
        >
          <strong>연봉 협상</strong>
          <span>{formatCost(salaryNegotiationCost)}</span>
        </button>
        {careHint && <small>{careHint}</small>}
      </div>
      <div className="contract-row">
        <span className="contract-badge">월 유지 {formatCost(contractUpkeep)}</span>
        {agent.qualityLabel && <span className="contract-badge">{agent.qualityLabel}</span>}
        {agent.riskLabel && <span className="contract-badge risk">{agent.riskLabel}</span>}
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
  contentRow,
  offer,
  isHired,
  onHire,
}: {
  agent: AgentTypeDefinition;
  check: { ok: boolean; reasons: string[] };
  contentRow: AgentContentRow;
  offer: RecruitmentOffer;
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
          <p className="item-meta">{contentRow.kindLabel} / {contentRow.phaseLabel}</p>
          <h3>{agent.name}</h3>
          <p>{agent.description}</p>
        </div>
      </div>
      {contentRow.recommended && <div className="recommendation-badge">{contentRow.recommendationReason}</div>}
      <div className="contract-row">
        <span className="contract-badge">{offer.channel.label}</span>
        <span className="contract-badge">{offer.qualityLabel}</span>
        <span className="contract-badge risk">{offer.riskLabel}</span>
      </div>
      <div className="stat-grid">
        {Object.entries(offer.adjustedStats).map(([stat, value]) => (
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
        <span>영입 비용 {formatCost(offer.hireCost)} / 월 유지 {formatCost(offer.upkeep)}</span>
        <button disabled={!check.ok || isHired} onClick={onHire}>
          {isHired ? "고용됨" : "고용"}
        </button>
      </div>
      {!check.ok && <p className="locked-reason">{check.reasons.join(" / ")}</p>}
    </article>
  );
}

function ResearchPanel({
  gameState,
  locale,
  setGameState,
  setActiveMenu,
}: {
  gameState: GameState;
  locale: LocaleCode;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setActiveMenu?: Dispatch<SetStateAction<MenuId>>;
}) {
  const strategyFocus = getAnnualStrategyMenuFocus(gameState, "research");
  const focusedCapability = strategyFocus ? capabilities.find((capability) => capability.id === strategyFocus.targetId) : undefined;
  const focusedCapabilityCheck = focusedCapability ? getCapabilityCheck(focusedCapability, gameState) : undefined;
  const lastCapabilityUpgrade = gameState.lastCapabilityUpgrade;
  const shouldShowResearchCompletion = Boolean(lastCapabilityUpgrade && lastCapabilityUpgrade.month === gameState.month);
  const completionProducts = lastCapabilityUpgrade ? getResearchCompletionProducts(lastCapabilityUpgrade, gameState) : [];
  const productCandidateRequirement = getProductCandidateRequirement(gameState);
  const resourceVisibility = getAiResourceVisibilityMetrics(gameState, getAvailableProductDefinitions(gameState));
  const orderedCapabilities = prioritizeAnnualStrategyFocus(capabilities.map((capability) => capability.id), strategyFocus)
    .map((capabilityId) => capabilities.find((capability) => capability.id === capabilityId))
    .filter((capability): capability is NonNullable<typeof capability> => Boolean(capability));
  const formatMetric = (value: number) => new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>AI 연구</h2>
        <p>재사용 가능한 능력이 새 시장을 엽니다.</p>
      </div>
      <section className="ai-resource-visibility-panel" aria-label={t("ui.resourceVisibility.aria", locale)}>
        <header>
          <div>
            <p className="eyebrow">{t("ui.resourceVisibility.eyebrow", locale)}</p>
            <strong>{t("ui.resourceVisibility.title", locale)}</strong>
          </div>
          <span>{t("ui.resourceVisibility.activeProducts", locale)} {resourceVisibility.activeProductCount}</span>
        </header>
        <div className="ai-resource-visibility-grid">
          <article>
            <span>{t("ui.resourceVisibility.monthlyComputeLoad", locale)}</span>
            <strong>{formatMetric(resourceVisibility.monthlyComputeLoad)}</strong>
            <small>{t("ui.resourceVisibility.computeUnit", locale)}</small>
          </article>
          <article>
            <span>{t("ui.resourceVisibility.monthlyDataGenerated", locale)}</span>
            <strong>{formatMetric(resourceVisibility.monthlyDataGenerated)}</strong>
            <small>{t("ui.resourceVisibility.dataUnit", locale)}</small>
          </article>
          <article>
            <span>{t("ui.resourceVisibility.nextLaunchComputeNeeded", locale)}</span>
            <strong>{formatMetric(resourceVisibility.nextLaunchComputeNeeded)}</strong>
            <small>{resourceVisibility.nextLaunchProductName ?? t("ui.resourceVisibility.noLaunchQueued", locale)}</small>
          </article>
        </div>
        <p>
          {t("ui.resourceVisibility.sourceProducts", locale)}{" "}
          {resourceVisibility.activeProductNames.length
            ? resourceVisibility.activeProductNames.slice(0, 3).join(" / ")
            : t("ui.resourceVisibility.noActiveProducts", locale)}
        </p>
      </section>
      {shouldShowResearchCompletion && lastCapabilityUpgrade && (
        <div className="research-completion-ribbon" aria-label="연구 완료">
          <div>
            <p className="eyebrow">연구 완료</p>
            <strong>{lastCapabilityUpgrade.capabilityName} Lv.{lastCapabilityUpgrade.nextLevel}</strong>
            <span>연간 지시 추천 연구가 실제 능력 상승과 제품 후보로 이어졌습니다.</span>
          </div>
          <div className="research-completion-grid">
            <article>
              <strong>레벨 상승</strong>
              <span>Lv.{lastCapabilityUpgrade.previousLevel} -&gt; Lv.{lastCapabilityUpgrade.nextLevel}</span>
            </article>
            <article>
              <strong>사용 자원</strong>
              <span>{formatCost(lastCapabilityUpgrade.resourceCost)}</span>
            </article>
            <article>
              <strong>해금 시장</strong>
              <span>{lastCapabilityUpgrade.unlockedDomainName ?? "기존 시장 강화"}</span>
            </article>
          </div>
          <div className="research-completion-products">
            <strong>제품 후보</strong>
            <span>{completionProducts.length ? completionProducts.map((product) => product.name).join(" / ") : "추천 제품 후보를 다시 계산 중"}</span>
            <button onClick={() => setActiveMenu?.("products")} type="button">
              제품 후보 보기
            </button>
          </div>
        </div>
      )}
      {productCandidateRequirement && (
        <div className="product-candidate-requirement-launchpad" aria-label="제품 후보 필요 연구">
          <div>
            <p className="eyebrow">제품 후보 필요 연구</p>
            <strong>{productCandidateRequirement.requiredCapability.name}</strong>
            <span>
              {productCandidateRequirement.candidateProduct.name} 개발에는 {productCandidateRequirement.requiredCapability.name}{" "}
              필요 Lv.{productCandidateRequirement.requiredLevel}이 필요합니다.
            </span>
          </div>
          <div className="product-candidate-requirement-meta">
            <span>현재 Lv.{productCandidateRequirement.currentLevel}</span>
            <span>필요 Lv.{productCandidateRequirement.requiredLevel}</span>
            <span>{productCandidateRequirement.candidateProduct.name}</span>
          </div>
          <button
            disabled={!productCandidateRequirement.check.ok || gameState.status !== "playing"}
            onClick={() => setGameState((current) => upgradeCapability(productCandidateRequirement.requiredCapability, current))}
            title={productCandidateRequirement.check.ok ? "필요 연구를 바로 진행" : productCandidateRequirement.check.reasons.join(" / ")}
            type="button"
          >
            바로 연구
          </button>
          {!productCandidateRequirement.check.ok && <small>{productCandidateRequirement.check.reasons.join(" / ")}</small>}
        </div>
      )}
      {strategyFocus && (
        <div className="strategy-focus-strip">
          <strong>{strategyFocus.title}: {strategyFocus.label}</strong>
          <span>{strategyFocus.reason}</span>
        </div>
      )}
      {strategyFocus && focusedCapability && (
        <div className="annual-research-launchpad" aria-label="연간 지시 추천 연구">
          <div>
            <p className="eyebrow">연간 지시 추천 연구</p>
            <strong>{focusedCapability.name}</strong>
            <span>{strategyFocus.reason}</span>
          </div>
          <button
            disabled={!focusedCapabilityCheck?.ok || gameState.status !== "playing"}
            onClick={() => setGameState((current) => upgradeCapability(focusedCapability, current))}
            type="button"
          >
            바로 연구
          </button>
          {focusedCapabilityCheck && !focusedCapabilityCheck.ok && <small>{focusedCapabilityCheck.reasons[0]}</small>}
        </div>
      )}
      <div className="item-list compact">
        {orderedCapabilities.map((capability) => {
          const currentLevel = gameState.capabilities[capability.id] ?? 0;
          const check = getCapabilityCheck(capability, gameState);

          return (
            <article className={`capability-row${strategyFocus?.targetId === capability.id ? " strategy-focus" : ""}`} key={capability.id}>
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

function getResearchCompletionProducts(
  moment: NonNullable<GameState["lastCapabilityUpgrade"]>,
  gameState: GameState,
) {
  const inactiveProducts = products.filter((product) => !gameState.activeProducts.includes(product.id));
  const domainProducts = moment.unlockedDomainId
    ? inactiveProducts.filter((product) => product.domain === moment.unlockedDomainId)
    : [];
  const capabilityProducts = inactiveProducts.filter(
    (product) => {
      const requiredLevel = product.required_capabilities[moment.capabilityId];
      return typeof requiredLevel === "number" && requiredLevel <= moment.nextLevel;
    },
  );

  return [...new Map([...domainProducts, ...capabilityProducts].map((product) => [product.id, product])).values()].slice(0, 3);
}

function getProductCandidateRequirement(gameState: GameState) {
  const moment = gameState.lastCapabilityUpgrade;
  if (!moment || moment.month !== gameState.month) return undefined;

  const candidateProduct = getResearchCompletionProducts(moment, gameState)[0];
  if (!candidateProduct) return undefined;

  for (const [capabilityId, requiredLevel] of Object.entries(candidateProduct.required_capabilities)) {
    const requiredCapability = capabilities.find((capability) => capability.id === capabilityId);
    const currentLevel = gameState.capabilities[capabilityId] ?? 0;
    if (requiredCapability && currentLevel < requiredLevel) {
      return {
        candidateProduct,
        check: getCapabilityCheck(requiredCapability, gameState),
        currentLevel,
        requiredCapability,
        requiredLevel,
      };
    }
  }

  return undefined;
}

function ShopPanel({ gameState, setGameState }: { gameState: GameState; setGameState: Dispatch<SetStateAction<GameState>> }) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const itemRows = getItemContentRows(gameState);
  const recommendations = getFoundationRecommendations(gameState, 5);
  const itemCategories = ["all", ...Array.from(new Set(itemRows.map((row) => row.item.category)))];
  const filteredItemRows = itemRows.filter((row) => categoryFilter === "all" || row.item.category === categoryFilter);
  const ownedItems = items.filter((item) => gameState.ownedItems.includes(item.id));
  const equippedItemIds = new Set(gameState.hiredAgents.flatMap((agent) => agent.equippedItemIds));
  const unequippedAgentItems = ownedItems.filter((item) => item.target === "agent" && !equippedItemIds.has(item.id));
  const officeExpansion = getOfficeExpansion(gameState);
  const nextOfficeExpansion = getNextOfficeExpansion(gameState);
  const nextOfficeCheck = nextOfficeExpansion ? getOfficeExpansionCheck(nextOfficeExpansion, gameState) : undefined;
  const officeMonthlyEffects = getOfficeMonthlyEffects(gameState);
  const placedOfficeItems = getPlacedOfficeItems(gameState);
  const placedOfficeItemIds = new Set(placedOfficeItems.map((item) => item.id));
  const officeItems = ownedItems.filter((item) => item.target !== "agent");
  const storedOfficeItems = officeItems.filter((item) => !placedOfficeItemIds.has(item.id));
  const officeSynergySummary = getOfficeSynergySummary(gameState);
  const officeGrowthPlan = getOfficeGrowthPlan(gameState);
  const officeZonePlan = officeGrowthPlan.zonePlan;

  return (
    <div className="panel-grid two-col">
      <section className="panel">
        <div className="panel-heading">
          <h2>아이템 상점</h2>
          <p>장비와 사무실 물건은 에이전트 특색과 회사 분위기를 만듭니다.</p>
        </div>
        <div className="shop-office-brief">
          <strong>{officeExpansion.name}</strong>
          <span>고용 {gameState.hiredAgents.length}/{getOfficeHireCapacity(gameState)}</span>
          <span>장식 {placedOfficeItems.length}/{getOfficeDecorationSlots(gameState)}</span>
          <span>구획 {officeZonePlan.active.length}개</span>
          <span>{officeSynergySummary.active.length ? `시너지 ${officeSynergySummary.active.length}개` : "시너지 준비 중"}</span>
        </div>
        <div className="office-growth-planner compact-planner">
          <div className="office-growth-header">
            <p className="eyebrow">사무실 성장</p>
            <strong>{officeGrowthPlan.primaryAction.label}</strong>
            <span>{officeGrowthPlan.primaryAction.reason}</span>
          </div>
          <div className="office-choice-grid">
            {officeGrowthPlan.nextExpansion && (
              <article className={officeGrowthPlan.nextExpansion.available ? "" : "locked"}>
                <p className="item-meta">확장</p>
                <strong>{officeGrowthPlan.nextExpansion.name}</strong>
                <span>고용 +{officeGrowthPlan.nextExpansion.hireCapacityGain} · 장식 +{officeGrowthPlan.nextExpansion.decorationSlotGain}</span>
              </article>
            )}
            {officeGrowthPlan.nextSynergy && (
              <article>
                <p className="item-meta">다음 조합</p>
                <strong>{officeGrowthPlan.nextSynergy.title}</strong>
                <span>{officeGrowthPlan.nextSynergy.recommendedItems[0]?.name ?? officeGrowthPlan.nextSynergy.progressLabel}</span>
              </article>
            )}
          </div>
        </div>
        <div className="foundation-panel compact">
          <div>
            <p className="eyebrow">상점 추천</p>
            <h3>{recommendations.phase.label}</h3>
            <span>{recommendations.phase.description}</span>
          </div>
          <div className="recommendation-list">
            {recommendations.items.map((row) => (
              <span key={row.item.id}>{row.item.name} · {row.recommendationReason}</span>
            ))}
          </div>
        </div>
        <div className="content-filter" role="tablist" aria-label="아이템 카테고리 필터">
          {itemCategories.map((category) => (
            <button
              aria-selected={categoryFilter === category}
              className={categoryFilter === category ? "selected" : ""}
              key={category}
              onClick={() => setCategoryFilter(category)}
              type="button"
            >
              {category === "all" ? "전체" : itemCategoryLabel(category)}
            </button>
          ))}
        </div>
        <div className="item-grid">
          {filteredItemRows.map((row) => (
            <ItemCard contentRow={row} item={row.item} gameState={gameState} setGameState={setGameState} key={row.item.id} />
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>인벤토리와 투자</h2>
          <p>보유 아이템, 사무실 확장, 장식 배치, 자동화 투자를 함께 봅니다.</p>
        </div>
        <div className="office-upgrade-panel">
          <div className="office-growth-planner">
            <div className="office-growth-header">
              <p className="eyebrow">사무실 성장 플래너</p>
              <strong>{officeGrowthPlan.primaryAction.label}</strong>
              <span>{officeGrowthPlan.primaryAction.reason}</span>
            </div>
            <div className="office-choice-grid">
              {officeGrowthPlan.nextExpansion && (
                <article className={officeGrowthPlan.nextExpansion.available ? "" : "locked"}>
                  <p className="item-meta">다음 사무실</p>
                  <strong>{officeGrowthPlan.nextExpansion.name}</strong>
                  <span>
                    고용 +{officeGrowthPlan.nextExpansion.hireCapacityGain} · 장식 +{officeGrowthPlan.nextExpansion.decorationSlotGain}
                  </span>
                  <small>
                    월간 {Object.keys(officeGrowthPlan.nextExpansion.monthlyEffects).length ? formatEffects(officeGrowthPlan.nextExpansion.monthlyEffects) : "없음"} · 비용 {formatCost(officeGrowthPlan.nextExpansion.cost)}
                  </small>
                </article>
              )}
              {officeGrowthPlan.nextRelocation && (
                <article className={officeGrowthPlan.nextRelocation.available ? "" : "locked"}>
                  <p className="item-meta">다음 지역</p>
                  <strong>{officeGrowthPlan.nextRelocation.name}</strong>
                  <span>
                    AI 운용 {officeGrowthPlan.nextRelocation.aiOperationGain >= 0 ? "+" : ""}{officeGrowthPlan.nextRelocation.aiOperationGain} · 월비 {Math.round(officeGrowthPlan.nextRelocation.monthlyCostModifierDelta * 100)}%
                  </span>
                  <small>
                    {officeGrowthPlan.nextRelocation.region} · 비용 {formatCost(officeGrowthPlan.nextRelocation.cost)}
                  </small>
                </article>
              )}
            </div>
            {officeGrowthPlan.nextSynergy && (
              <div className="office-recommendation-list">
                <div>
                  <strong>다음 조합: {officeGrowthPlan.nextSynergy.title}</strong>
                  <span>{officeGrowthPlan.nextSynergy.progressLabel}</span>
                </div>
                {officeGrowthPlan.nextSynergy.recommendedItems.map((recommendation) => {
                  const item = items.find((entry) => entry.id === recommendation.id);

                  return (
                    <article key={recommendation.id}>
                      <div>
                        <strong>{recommendation.name}</strong>
                        <span>{recommendation.recommendationReason}</span>
                        <small>{formatEffects(recommendation.effects)} · {recommendation.owned ? "보유" : formatCost(recommendation.cost)}</small>
                      </div>
                      {item && (
                        <button
                          disabled={!recommendation.available || gameState.status !== "playing"}
                          onClick={() => setGameState((current) => recommendation.owned ? placeOfficeItem(item, current) : buyItem(item, current))}
                          type="button"
                        >
                          {recommendation.owned ? "배치" : "구매"}
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
          <div className="office-summary-card">
            <strong>{officeExpansion.name}</strong>
            <span>고용 {gameState.hiredAgents.length}/{getOfficeHireCapacity(gameState)}</span>
            <span>장식 {placedOfficeItems.length}/{getOfficeDecorationSlots(gameState)}</span>
            <span>구획 {officeZonePlan.active.length}</span>
            <span>월간 {Object.keys(officeMonthlyEffects).length ? formatEffects(officeMonthlyEffects) : "없음"}</span>
          </div>
          <div className="office-zone-panel compact">
            <div>
              <p className="eyebrow">운영 구획</p>
              <strong>{officeZonePlan.operationLabel}</strong>
              <span>다음 확장과 채용이 열어주는 실제 사무실 기능입니다.</span>
            </div>
            <div className="office-zone-grid">
              {officeZonePlan.active.slice(0, 3).map((zone) => (
                <article className="active" key={zone.id}>
                  <strong>{zone.title}</strong>
                  <span>{formatEffects(zone.monthly_effects)}</span>
                </article>
              ))}
              {officeZonePlan.nextZone && (
                <article className="locked">
                  <strong>{officeZonePlan.nextZone.title}</strong>
                  <span>{officeZonePlan.nextZone.progressLabel}</span>
                </article>
              )}
            </div>
          </div>
          <div className="office-synergy-panel">
            <div>
              <p className="eyebrow">장식 조합</p>
              <strong>{officeSynergySummary.active.length ? `${officeSynergySummary.active.length}개 시너지 가동` : "시너지 준비 중"}</strong>
              <span>
                월간 효과 {Object.keys(officeSynergySummary.totalMonthlyEffects).length ? formatEffects(officeSynergySummary.totalMonthlyEffects) : "없음"}
              </span>
            </div>
            {officeSynergySummary.active.slice(0, 2).map((synergy) => (
              <article className="active" key={synergy.id}>
                <strong>{synergy.title}</strong>
                <span>{formatEffects(synergy.monthly_effects)}</span>
              </article>
            ))}
            {officeSynergySummary.active.length === 0 && officeSynergySummary.nextCandidate && (
              <article>
                <strong>다음 후보: {officeSynergySummary.nextCandidate.title}</strong>
                <span>{officeSynergySummary.nextCandidate.progressLabel}</span>
              </article>
            )}
          </div>
          {nextOfficeExpansion ? (
            <article className="office-expansion-card">
              <div>
                <p className="item-meta">다음 확장</p>
                <h3>{nextOfficeExpansion.name}</h3>
                <p>{nextOfficeExpansion.description}</p>
                <span>
                  고용 {nextOfficeExpansion.hire_capacity}명 · 장식 {nextOfficeExpansion.decoration_slots}칸 · 월간 {formatEffects(nextOfficeExpansion.monthly_effects)} · 비용 {formatCost(nextOfficeExpansion.cost)}
                </span>
              </div>
              <button
                disabled={!nextOfficeCheck?.ok || gameState.status !== "playing"}
                onClick={() => setGameState((current) => buyOfficeExpansion(nextOfficeExpansion, current))}
                type="button"
              >
                확장
              </button>
              {nextOfficeCheck && !nextOfficeCheck.ok && <small>{nextOfficeCheck.reasons.join(" / ")}</small>}
            </article>
          ) : (
            <p className="empty-note">현재 가능한 최대 사무실입니다. 이제 콘텐츠와 장식을 더 늘릴 차례입니다.</p>
          )}
        </div>
        <div className="decor-management">
          <div className="decor-section">
            <h3>배치된 장식</h3>
            {placedOfficeItems.length ? (
              placedOfficeItems.map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{formatEffects(item.effects)}</span>
                  </div>
                  <button onClick={() => setGameState((current) => unplaceOfficeItem(item.id, current))} type="button">
                    보관
                  </button>
                </article>
              ))
            ) : (
              <p>사무실 아이템을 구매하면 빈 슬롯에 자동 배치됩니다.</p>
            )}
          </div>
          <div className="decor-section">
            <h3>보관 중 장식</h3>
            {storedOfficeItems.length ? (
              storedOfficeItems.map((item) => {
                const placeCheck = getPlaceOfficeItemCheck(item, gameState);
                return (
                  <article key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{formatEffects(item.effects)}</span>
                      {!placeCheck.ok && <small>{placeCheck.reasons[0]}</small>}
                    </div>
                    <button
                      disabled={!placeCheck.ok || gameState.status !== "playing"}
                      onClick={() => setGameState((current) => placeOfficeItem(item, current))}
                      type="button"
                    >
                      배치
                    </button>
                  </article>
                );
              })
            ) : (
              <p>보관 중인 사무실 장식이 없습니다.</p>
            )}
          </div>
        </div>
        <div className="inventory-panel">
          <div className="inventory-strip">
            <span>보유 {ownedItems.length}</span>
            <span>장착 대기 {unequippedAgentItems.length}</span>
            <span>배치 장식 {placedOfficeItems.length}</span>
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
  contentRow,
  item,
  gameState,
  setGameState,
}: {
  contentRow: ItemContentRow;
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
      {contentRow.recommended && <div className="recommendation-badge">{contentRow.recommendationReason}</div>}
      <p>{item.description}</p>
      <div className="mini-row">
        <span>비용 {formatCost(item.cost)}</span>
        <span>대상 {itemTargetLabel(item.target)}</span>
        <span>단계 {contentRow.phaseLabel}</span>
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
  const seasonBrief = getCompetitionSeasonBrief(gameState);
  const seasonChallenges = getCompetitionSeasonChallenges(gameState);
  const rivalCounterPlans = getRivalCounterPlans(gameState);
  const strategyFocus = getAnnualStrategyMenuFocus(gameState, "competition");
  const orderedCompetitorStates = prioritizeAnnualStrategyFocus(gameState.competitorStates.map((competitor) => competitor.id), strategyFocus)
    .map((competitorId) => gameState.competitorStates.find((competitor) => competitor.id === competitorId))
    .filter((competitor): competitor is NonNullable<typeof competitor> => Boolean(competitor));
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
        <div className="season-brief-panel compact">
          <div>
            <p className="eyebrow">{seasonBrief.title}</p>
            <strong>{seasonBrief.summary}</strong>
          </div>
          {seasonBrief.topPressure && (
            <span>
              최대 압박: {seasonBrief.topPressure.competitorName} · 점유 {seasonBrief.topPressure.marketShare}% · {seasonBrief.topPressure.lastMove}
            </span>
          )}
        </div>
        {seasonChallenges.length > 0 && (
          <div className="season-challenge-list">
            {seasonChallenges.map((challenge) => (
              <article className={challenge.complete ? "complete" : ""} key={challenge.id}>
                <div>
                  <strong>{challenge.title}</strong>
                  <span>{challenge.description}</span>
                </div>
                <small>보상: {challenge.rewardPreview}</small>
                <small>위험: {challenge.riskPreview}</small>
                <small>추천 제품 {formatProductNames(challenge.recommendedProductIds, 2)} · 추천 카드 {formatCardNames(challenge.recommendedCardIds, 2)}</small>
              </article>
            ))}
          </div>
        )}
        <div className="ranking-list">
          {rankings.map((ranking, index) => {
            const competitor = competitors.find((entry) => entry.id === ranking.id);
            const label = ranking.isPlayer ? t("ui.playerCompany", locale) : competitor ? t(competitor.name_key, locale) : ranking.id;
            const signal = strategySignals.find((entry) => entry.competitorId === ranking.id);
            const counterPlan = rivalCounterPlans.find((entry) => entry.competitorId === ranking.id);

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
                {counterPlan && <small className="counter-hint">대응 {formatCardNames(counterPlan.counterCardIds, 2)}</small>}
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
        {strategyFocus && (
          <div className="strategy-focus-strip">
            <strong>{strategyFocus.title}: {strategyFocus.label}</strong>
            <span>{strategyFocus.reason}</span>
          </div>
        )}
        {rivalCounterPlans.length > 0 && (
          <div className="counter-plan-list">
            {rivalCounterPlans.map((plan) => (
              <article key={plan.competitorId}>
                <strong>{plan.competitorName} 대응 플랜</strong>
                <span>{plan.label} · 압박 {plan.pressureScore}</span>
                <small>카드 {formatCardNames(plan.counterCardIds, 2)} / 연구 {formatCapabilityNames(plan.recommendedCapabilityIds, 2)}</small>
              </article>
            ))}
          </div>
        )}
        {upcomingCompetitors.length > 0 && (
          <div className="rival-wave-list">
            {seasonBrief.recentEntrants.length > 0 && (
              <article className="recent-wave">
                <strong>올해 등장</strong>
                <span>{seasonBrief.recentEntrants.map((entrant) => `${entrant.name} (${entrant.entryMonth}개월차)`).join(" / ")}</span>
              </article>
            )}
            {upcomingCompetitors.map((competitor) => (
              <article key={competitor.id}>
                <strong>{t(competitor.name_key, locale)}</strong>
                <span>{competitor.entry_month}개월차 등장 · {t(competitor.archetype_key, locale)}</span>
              </article>
            ))}
          </div>
        )}
        <div className="competitor-grid">
          {orderedCompetitorStates.map((state) => {
            const competitor = competitors.find((entry) => entry.id === state.id);
            const identity = getCompetitorIdentity(state.id);
            const claimedProducts = products.filter((product) => state.claimedProducts.includes(product.id));
            const signal = strategySignals.find((entry) => entry.competitorId === state.id);
            const counterPlan = rivalCounterPlans.find((entry) => entry.competitorId === state.id);
            if (!competitor) return null;

            return (
              <article
                className={`competitor-card ${signal ? `signal-${signal.severity}` : ""}${strategyFocus?.targetId === state.id ? " strategy-focus" : ""}`}
                style={{ borderColor: competitor.color }}
                key={state.id}
              >
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
                {counterPlan && (
                  <div className="counter-plan-card">
                    <strong>추천 대응</strong>
                    <span>카드 {formatCardNames(counterPlan.counterCardIds, 2)}</span>
                    <span>제품 {formatProductNames(counterPlan.recommendedProductIds, 2)}</span>
                    <small>연구 {formatCapabilityNames(counterPlan.recommendedCapabilityIds, 2)}</small>
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

function formatCardNames(cardIds: string[], max = 3): string {
  const names = cardIds
    .slice(0, max)
    .map((cardId) => strategyCards.find((card) => card.id === cardId)?.name)
    .filter((name): name is string => Boolean(name));
  return names.length ? names.join(", ") : "없음";
}

function formatProductNames(productIds: string[], max = 3): string {
  const names = productIds
    .slice(0, max)
    .map((productId) => products.find((product) => product.id === productId)?.name)
    .filter((name): name is string => Boolean(name));
  return names.length ? names.join(", ") : "없음";
}

function formatCapabilityNames(capabilityIds: string[], max = 3): string {
  const names = capabilityIds
    .slice(0, max)
    .map((capabilityId) => capabilities.find((capability) => capability.id === capabilityId)?.name)
    .filter((name): name is string => Boolean(name));
  return names.length ? names.join(", ") : "없음";
}

function boundarylessStatusLabel(status: "locked" | "unlocked" | "launched"): string {
  if (status === "launched") return "출시 완료";
  if (status === "unlocked") return "진출 가능";
  return "잠김";
}

function TimelinePanel({ gameState }: { gameState: GameState }) {
  const moments = getShareableMoments(gameState);

  return (
    <section className="panel timeline-panel">
      <div className="panel-heading">
        <h2>회사 기록</h2>
        <p>결정의 결과가 즉시 기록됩니다.</p>
      </div>
      {moments.length > 0 && (
        <div className="highlight-moment-grid">
          {moments.map((moment) => (
            <article className={`highlight-moment-card tone-${moment.tone}`} key={`${moment.type}-${moment.title}`}>
              <div>
                <strong>{moment.title}</strong>
                <span>{moment.badge}</span>
              </div>
              <p>{moment.detail}</p>
            </article>
          ))}
        </div>
      )}
      <ol className="timeline">
        {gameState.timeline.map((entry, index) => (
          <li key={`${entry}-${index}`}>{entry}</li>
        ))}
      </ol>
    </section>
  );
}

import { useEffect, useRef, useState, type CSSProperties, type Dispatch, type SetStateAction } from "react";
import { agentTypes, assetManifest, competitors, domains, resources } from "../game/data";
import { chooseCardReward, getCardRewardChoiceCheck, getStrategyCardById, playStrategyCard } from "../game/deckbuilding";
import { resolveDevelopmentPuzzle } from "../game/development-puzzle";
import {
  getActiveAlphaRunRoadmapStep,
  getAlphaRunActionFeedback,
  getAlphaRunCompletionSummary,
  getAlphaRunDebriefSummary,
  getAlphaRunRoadmap,
  getAlphaRunRoadmapProgress,
  getFirstTenMinutePlan,
  getFirstTenMinuteProgress,
  getGuidanceStep,
  getOpeningObjectives,
  type AlphaRunRoadmapStep,
  type AlphaRunDebriefSummary,
  type AlphaRunCompletionSummary,
  type FirstTenMinuteStep,
  type GuidanceStep,
  type OpeningObjective,
} from "../game/guidance";
import { getNextRunSetupPlan, getRunInsightReward, resetRunWithMetaUnlocks } from "../game/meta-progression";
import { rollRunModifierSelection, type RunModifierSelectionInput } from "../game/run-modifiers";
import { getReleaseImpactSummary, type ReleaseImpactSummary } from "../game/release-impact";
import { getRunSummary } from "../game/run-summary";
import { getBetaReadinessSummary, type BetaReadinessSummary } from "../game/beta-readiness";
import {
  getActiveEndingReplayBrief,
  getCampaignEndingDiscovery,
  getCampaignEndingReport,
  getEndingNearMisses,
  getEndingRouteUnlockRecommendations,
  type ActiveEndingReplayBrief,
  type CampaignEndingDiscovery,
  type EndingNearMissPlan,
} from "../game/campaign-ending";
import {
  getCampaignCalendar,
  getCampaignFinale,
  getCompanyStageProgress,
  getCompanyStarRating,
  getCurrentLocation,
  getDayPhase,
  type CampaignFinale,
} from "../game/campaign";
import {
  advanceToFirstAnnualReview,
  advanceToFirstLaunch,
  advanceYearTwoProductRoadmap,
  advanceMonth,
  chooseGrowthPath,
  createInitialState,
  formatResource,
  getFirstHireRecommendation,
  getFirstDevelopmentIssueRecommendation,
  getFirstGrowthRecommendation,
  getFirstProjectRecommendation,
  getFirstRewardRecommendation,
  getYearTwoProductRecommendation,
  getYearTwoProductIssueRecommendation,
  getCompanyStage,
  getAiOperationCapacity,
  getAgentRestCheck,
  getAgentRestCost,
  getAgentSalaryNegotiationCheck,
  getAgentSalaryNegotiationCost,
  getAvailableProductDefinitions,
  getOfficeDecorationSlots,
  getOfficeExpansion,
  getOfficeHireCapacity,
  getOfficeScenePlan,
  getOfficeZonePlan,
  getOperationsCommandPlan,
  getPlacedOfficeItems,
  getPlayerMarketShare,
  getStaffIncidentBriefs,
  getStaffIncidentResolutionOptions,
  getWorkforceMixSummary,
  hireAgentViaChannel,
  negotiateAgentSalary,
  resolveStaffIncident,
  resolveEventChoice,
  resolveRivalEventChoice,
  restAgent,
  startProductProject,
  type WorkforceMixSummary,
  type FirstHireRecommendation,
  type FirstDevelopmentIssueRecommendation,
  type FirstGrowthRecommendation,
  type FirstProjectRecommendation,
  type FirstRewardRecommendation,
} from "../game/simulation";
import type {
  AgentSpriteDefinition,
  CompetitorIdentityDefinition,
  GameState,
  ItemDefinition,
  OfficeObjectAssetDefinition,
  OfficeEventReactionStatus,
  OfficeSceneActorStatus,
  OfficeSceneObjectStatus,
  ReleaseGrowthPath,
  SpriteAnimationDefinition,
  SpriteSheetDefinition,
} from "../game/types";
import { t, type LocaleCode } from "../i18n";
import { formatCost, formatEffects, statusLabel } from "../ui/formatters";
import { menuGroupLabels, menus, orderedResourceIds, type MenuGroup, type MenuId } from "../ui/menu";
import { MarketSharePanel } from "./MarketSharePanel";
import { RivalArchetypePanel } from "./RivalArchetypePanel";
import { BigEventModal } from "./BigEventModal";
import { PayoffCelebrationModal } from "./PayoffCelebrationModal";
import { WorldRevealModal } from "./WorldRevealModal";

let nextRunSeedCounter = 0;

function createEphemeralRunModifierSelection(source: string) {
  nextRunSeedCounter += 1;

  return {
    ...rollRunModifierSelection(`${source}-${nextRunSeedCounter}`),
    challengeTierId: "standard",
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

const agentSheetId = "agents_v053_final_art_import";
const officeObjectSheetId = "office_objects_v054_final_art_import";
const officeBackdropId = "office_isometric_v054_final_art_import";
const competitorLogoAtlasId = "competitor_logos_v072_atlas";
const brandCrestAtlasId = "brand_crest_v075_atlas";
const workforceActorAtlasId = "workforce_actor_v076_atlas";
const officeReactionAtlasId = "office_reactions_v081_atlas";
const officeReactionIconSize = 28;
const fallbackActorFrameIndexes: Record<OfficeSceneActorStatus["kind"], number> = {
  human: 0,
  ai_agent: 1,
  robot: 2,
};
const officeActorReactionFrameByKey = {
  code: 0,
  idea: 1,
  coffee: 2,
  alert: 3,
  cheer: 4,
  gear: 5,
} as const;

function getAssetSheet(sheetId?: string): SpriteSheetDefinition | undefined {
  if (!sheetId) return undefined;
  return assetManifest.sprite_sheets[sheetId];
}

const commercialUiAtlasId = "commercial_ui_v071_atlas";
const commercialUiIconSize = 24;
const commercialUiIconFrames = {
  cash: [0, 0],
  users: [1, 0],
  compute: [2, 0],
  data: [3, 0],
  talent: [4, 0],
  trust: [5, 0],
  hype: [6, 0],
  automation: [7, 0],
  company: [0, 1],
  products: [1, 1],
  deck: [2, 1],
  agents: [3, 1],
  research: [4, 1],
  shop: [5, 1],
  competition: [6, 1],
  log: [7, 1],
  next: [0, 2],
  newGame: [1, 2],
  save: [2, 2],
  load: [3, 2],
  locale: [4, 2],
  market: [5, 2],
  warning: [6, 2],
  result: [7, 2],
} as const;
type CommercialUiIconId = keyof typeof commercialUiIconFrames;

const resourceIconIds: Record<string, CommercialUiIconId> = {
  cash: "cash",
  users: "users",
  compute: "compute",
  data: "data",
  talent: "talent",
  trust: "trust",
  hype: "hype",
  automation: "automation",
};

const menuIconIds: Record<MenuId, CommercialUiIconId> = {
  company: "company",
  products: "products",
  deck: "deck",
  agents: "agents",
  research: "research",
  shop: "shop",
  competition: "competition",
  log: "log",
};

function getCommercialUiIconStyle(iconId: CommercialUiIconId): CSSProperties {
  const sheet = getAssetSheet(commercialUiAtlasId);
  const [column, row] = commercialUiIconFrames[iconId];

  return {
    "--ui-icon-atlas": `url(${sheet?.path ?? "/assets/ui/v071-commercial-ui-atlas.png"})`,
    "--ui-icon-x": `${-column * commercialUiIconSize}px`,
    "--ui-icon-y": `${-row * commercialUiIconSize}px`,
  } as CSSProperties;
}

function CommercialUiIcon({ className = "", iconId }: { className?: string; iconId: CommercialUiIconId }) {
  return (
    <i
      aria-hidden="true"
      className={["ui-atlas-icon", className].filter(Boolean).join(" ")}
      style={getCommercialUiIconStyle(iconId)}
    />
  );
}

function getBrandCrestStyle(): CSSProperties {
  const sheet = getAssetSheet(brandCrestAtlasId);

  return {
    "--brand-crest-image": `url(${sheet?.path ?? "/assets/ui/v075-brand-crest-atlas.png"})`,
  } as CSSProperties;
}

function getSpriteSheetFrameStyle(
  sheet: SpriteSheetDefinition,
  frameIndex: number,
  displayWidth: number,
  displayHeight: number,
): CSSProperties {
  const column = frameIndex % sheet.columns;
  const row = Math.floor(frameIndex / sheet.columns);

  return {
    backgroundImage: `url(${sheet.path})`,
    backgroundPosition: `-${column * displayWidth}px -${row * displayHeight}px`,
    backgroundSize: `${sheet.columns * displayWidth}px ${sheet.rows * displayHeight}px`,
    height: `${displayHeight}px`,
    width: `${displayWidth}px`,
  };
}

function getSpriteSheetPreviewFrames(sheet: SpriteSheetDefinition | undefined) {
  if (!sheet) return [];
  return (sheet.preview_frames?.length ? sheet.preview_frames : [0, 1, 2, 3]).filter((frameIndex) => frameIndex >= 0 && frameIndex < sheet.frame_count);
}

function getAnimatedSpriteSheetFrameStyle(
  sheet: SpriteSheetDefinition,
  animation: SpriteAnimationDefinition,
  displayWidth: number,
  displayHeight: number,
): CSSProperties {
  const frameIndex = animation.row * sheet.columns;
  const column = frameIndex % sheet.columns;
  const row = Math.floor(frameIndex / sheet.columns);
  const frameCount = Math.max(1, Math.min(animation.frames, sheet.columns - column));

  return {
    ...getSpriteSheetFrameStyle(sheet, frameIndex, displayWidth, displayHeight),
    "--sprite-cycle-duration": `${animation.duration_ms ?? 1000}ms`,
    "--sprite-end-x": `-${(column + frameCount) * displayWidth}px`,
    "--sprite-frame-steps": frameCount,
    "--sprite-row-y": `-${row * displayHeight}px`,
    "--sprite-start-x": `-${column * displayWidth}px`,
    backgroundPosition: `-${column * displayWidth}px -${row * displayHeight}px`,
  } as CSSProperties;
}

function getDepthStyle(depthPercent: number, base = 1): CSSProperties {
  return { zIndex: base + Math.round(depthPercent) };
}

function getAgentSprite(agentTypeId?: string) {
  if (!agentTypeId) return undefined;
  return assetManifest.agent_sprites.find((sprite) => sprite.agent_type_id === agentTypeId);
}

function getAgentSpriteFrameStyle(
  sprite: AgentSpriteDefinition | undefined,
  actor: OfficeSceneActorStatus,
): CSSProperties | undefined {
  const sheet = getAssetSheet(sprite?.sheet_id ?? agentSheetId);
  if (!sprite?.sheet_id || !sheet) return undefined;
  const animation = actor.reactionPose
    ? sprite.animations[actor.reactionPose]
    : actor.state === "working"
      ? sprite.animations.work
      : sprite.animations.idle;

  return getAnimatedSpriteSheetFrameStyle(sheet, animation, 76, 76);
}

function getFallbackActorSpriteFrameStyle(actor: OfficeSceneActorStatus): CSSProperties | undefined {
  const sheet = getAssetSheet(workforceActorAtlasId);
  if (!sheet) return undefined;

  return getSpriteSheetFrameStyle(sheet, fallbackActorFrameIndexes[actor.kind] ?? 0, 76, 76);
}

function getOfficeActorReactionFrame(actor: OfficeSceneActorStatus, index: number) {
  if (actor.state === "warning" || actor.reactionPose === "alert") return officeActorReactionFrameByKey.alert;
  if (actor.state === "resting") return officeActorReactionFrameByKey.coffee;
  if (actor.reactionPose === "cheer") return officeActorReactionFrameByKey.cheer;
  if (actor.reactionPose === "card_use") return officeActorReactionFrameByKey.idea;
  if (actor.kind === "robot") return officeActorReactionFrameByKey.gear;
  if (actor.kind === "ai_agent") return index % 2 === 0 ? officeActorReactionFrameByKey.code : officeActorReactionFrameByKey.idea;
  return index % 3 === 0 ? officeActorReactionFrameByKey.coffee : index % 2 === 0 ? officeActorReactionFrameByKey.code : officeActorReactionFrameByKey.idea;
}

function getOfficeActorReactionIconStyle(actor: OfficeSceneActorStatus, index: number): CSSProperties {
  const sheet = getAssetSheet(officeReactionAtlasId);
  if (!sheet) return {};
  const frameIndex = getOfficeActorReactionFrame(actor, index);
  const column = frameIndex % sheet.columns;
  const row = Math.floor(frameIndex / sheet.columns);

  return {
    "--office-reaction-atlas": `url(${sheet.path})`,
    "--office-reaction-delay": `${(index % 4) * 180}ms`,
    "--office-reaction-size": `${sheet.columns * officeReactionIconSize}px ${sheet.rows * officeReactionIconSize}px`,
    "--office-reaction-x": `${-column * officeReactionIconSize}px`,
    "--office-reaction-y": `${-row * officeReactionIconSize}px`,
  } as CSSProperties;
}

function getCompetitorIdentity(competitorId?: string) {
  if (!competitorId) return undefined;
  return assetManifest.competitor_identities.find((identity) => identity.competitor_id === competitorId);
}

function getCompetitorLogoStyle(identity: CompetitorIdentityDefinition | undefined, displaySize = 32): CSSProperties {
  if (!identity?.sheet_id || typeof identity.sheet_index !== "number") return {};
  const sheet = getAssetSheet(identity.sheet_id ?? competitorLogoAtlasId);
  if (!sheet) return {};
  const column = identity.sheet_index % sheet.columns;
  const row = Math.floor(identity.sheet_index / sheet.columns);

  return {
    "--competitor-logo-atlas": `url(${sheet.path})`,
    "--competitor-logo-x": `${-column * displaySize}px`,
    "--competitor-logo-y": `${-row * displaySize}px`,
    "--competitor-logo-size": `${sheet.columns * displaySize}px ${sheet.rows * displaySize}px`,
  } as CSSProperties;
}

function getItemIcon(itemId: string) {
  return assetManifest.item_icons.find((icon) => icon.item_id === itemId);
}

function getOfficeObjectAsset(itemId: string) {
  return assetManifest.office_objects.find((object) => object.linked_item_id === itemId);
}

function getOfficeObjectSpriteFrameStyle(asset: OfficeObjectAssetDefinition): CSSProperties | undefined {
  const sheet = getAssetSheet(asset.sheet_id ?? officeObjectSheetId);
  if (!asset.sheet_id || typeof asset.sheet_index !== "number" || !sheet) return undefined;
  const displayWidth = Math.max(72, Math.min(116, asset.footprint[0] * 42 + 28));
  const displayHeight = Math.max(60, Math.min(92, asset.footprint[1] * 30 + 36));

  return getSpriteSheetFrameStyle(sheet, asset.sheet_index, displayWidth, displayHeight);
}

type StageSideTabId = "guide" | "company" | "reports" | "results";

const stageSideTabs: { id: StageSideTabId; label: string }[] = [
  { id: "guide", label: "목표" },
  { id: "company", label: "회사" },
  { id: "reports", label: "월간" },
  { id: "results", label: "결과" },
];

const priorityResourceIds = new Set(["cash", "users", "trust", "compute"]);
const primaryMenuIds: MenuId[] = ["company", "products", "deck", "agents"];
const secondaryMenuIds: MenuId[] = ["research", "shop", "competition", "log"];
const mobileTabMenuIds: MenuId[] = ["company", "products", "deck", "agents"];
const menuLauncherGroupOrder: MenuGroup[] = ["core", "operations", "meta"];

function getMenuById(menuId: MenuId) {
  return menus.find((menu) => menu.id === menuId);
}

function getMonthlyResourceDelta(gameState: GameState, resourceId: string) {
  const report = gameState.lastMonthReport;
  if (!report) return 0;

  const baseDelta: Record<string, number> = {
    cash: report.revenue - report.totalCost,
    users: report.newUsers,
    data: report.generatedData,
    compute: -report.computePressure,
  };

  return (baseDelta[resourceId] ?? 0) + (report.strategyEffects?.[resourceId] ?? 0) + (report.staffAftermathResourceDelta?.[resourceId] ?? 0);
}

function isResourceCritical(gameState: GameState, resourceId: string) {
  const value = gameState.resources[resourceId] ?? 0;
  if (resourceId === "cash") return value <= 0;
  if (resourceId === "trust") return value < 30;
  if (resourceId === "compute") return value < 10;
  return false;
}

export function TopBar({
  gameState,
  launchableCount,
  locale,
  qaScenarioLabel,
  onToggleLocale,
}: {
  gameState: GameState;
  launchableCount: number;
  locale: LocaleCode;
  qaScenarioLabel?: string;
  onToggleLocale: () => void;
}) {
  const calendar = getCampaignCalendar(gameState);
  const phase = getDayPhase(gameState);
  const location = getCurrentLocation(gameState);
  const activeEndingReplayBrief = getActiveEndingReplayBrief(gameState);
  const statusClassName = ["status-pill", gameState.status].filter(Boolean).join(" ");

  return (
    <section className="top-bar" aria-label="회사 상태">
      <div className="top-brand-panel">
        <span className="top-brand-crest" style={getBrandCrestStyle()} aria-hidden="true" />
        <div className="top-brand-copy">
          <p className="eyebrow">AI 컴퍼니 타이쿤 알파</p>
          <h1>경계 없는 회사</h1>
          <span className="top-brand-deck">Boundaryless command deck</span>
        </div>
      </div>
      <div className="top-command-center">
        <div className="top-run-metrics" aria-label="핵심 런 상태">
          <span>
            <small>시간</small>
            <strong>{calendar.year}년 {calendar.monthOfYear}월</strong>
          </span>
          <span>
            <small>회사</small>
            <strong>{getCompanyStarRating(gameState)}성 · {location.region}</strong>
          </span>
          <span>
            <small>제품</small>
            <strong>출시 {launchableCount} · 개발 {gameState.productProjects.length}</strong>
          </span>
          <span>
            <small>메타</small>
            <strong>런 {gameState.roguelite.runNumber} · 통찰 {gameState.roguelite.founderInsight}</strong>
          </span>
        </div>
        <div className="top-progress-rail" aria-label={`캠페인 진행 ${calendar.progressPercent}%`}>
          <span>캠페인 진행 {calendar.progressPercent}%</span>
          <b>
            <i className="top-progress-fill" style={{ width: `${calendar.progressPercent}%` }} />
          </b>
          <em>{phase.label}</em>
        </div>
        <div className="status-cluster top-secondary-status">
          <span className={statusClassName}>{statusLabel(gameState.status)}</span>
          <span className="status-pill">점유 {getPlayerMarketShare(gameState)}%</span>
          {activeEndingReplayBrief && (
            <span className="status-pill ending-target-pill">
              목표 엔딩 {activeEndingReplayBrief.progressPercent}%{activeEndingReplayBrief.alreadyDiscovered ? " · 수집 완료" : ""}
            </span>
          )}
          {qaScenarioLabel && <span className="status-pill qa-pill">{qaScenarioLabel}</span>}
          <button className="locale-toggle" onClick={onToggleLocale}>
            {locale.toUpperCase()}
          </button>
        </div>
        <CompetitorHudStrip gameState={gameState} locale={locale} />
      </div>
      <aside className="top-market-suite" aria-label="시장 정보">
        <MarketSharePanel gameState={gameState} locale={locale} />
        <RivalArchetypePanel gameState={gameState} locale={locale} />
      </aside>
    </section>
  );
}

export function ResourceStrip({ gameState }: { gameState: GameState }) {
  return (
    <section className="resource-strip" aria-label="자원">
      {orderedResourceIds.map((resourceId) => {
        const delta = getMonthlyResourceDelta(gameState, resourceId);
        const deltaTone = delta > 0 ? "positive" : delta < 0 ? "negative" : "neutral";
        const tileClass = [
          "resource-tile",
          priorityResourceIds.has(resourceId) ? "priority" : "",
          isResourceCritical(gameState, resourceId) ? "critical" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <article className={tileClass} key={resourceId}>
            <CommercialUiIcon className="resource-icon" iconId={resourceIconIds[resourceId] ?? "market"} />
            <span>{resources[resourceId].name}</span>
            <strong>{formatResource(resourceId, gameState.resources[resourceId] ?? 0)}</strong>
            <small className={`resource-delta ${deltaTone}`}>
              {delta === 0 ? "변동 없음" : `${delta > 0 ? "+" : ""}${formatResource(resourceId, delta)}`}
            </small>
          </article>
        );
      })}
    </section>
  );
}

function CompetitorHudStrip({ gameState, locale }: { gameState: GameState; locale: LocaleCode }) {
  const topCompetitors = [...gameState.competitorStates]
    .sort((a, b) => b.marketShare - a.marketShare || b.momentum - a.momentum)
    .slice(0, 3)
    .map((state) => ({
      state,
      definition: competitors.find((competitor) => competitor.id === state.id),
    }))
    .filter((entry) => entry.definition);

  if (topCompetitors.length === 0) return null;

  return (
    <div className="competitor-hud-strip" aria-label="경쟁사 TOP3">
      <strong>라이벌</strong>
      {topCompetitors.map(({ state, definition }) => {
        const identity = getCompetitorIdentity(state.id);

        return (
          <span
            className="competitor-hud-entry"
            key={state.id}
            style={{ ...assetPaletteVars(identity?.palette), "--rival-color": definition?.color } as CSSProperties}
          >
            <i
              className={`competitor-hud-logo ${identity?.logo_class ?? ""} ${identity?.sheet_id ? "competitor-hud-logo-atlas" : ""}`}
              aria-hidden="true"
              style={getCompetitorLogoStyle(identity, 16)}
            >
              <b />
            </i>
            <small>{t(definition?.name_key ?? state.id, locale)} {state.marketShare}%</small>
          </span>
        );
      })}
    </div>
  );
}

export function GameStage({
  gameState,
  qaScenarioLabel,
  setGameState,
  setActiveMenu,
}: {
  gameState: GameState;
  qaScenarioLabel?: string;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setActiveMenu: Dispatch<SetStateAction<MenuId>>;
}) {
  const companyStage = getCompanyStage(gameState);
  const guidance = getGuidanceStep(gameState);
  const workforceMix = getWorkforceMixSummary(gameState);
  const firstHireRecommendation = getFirstHireRecommendation(gameState);
  const firstProjectRecommendation = getFirstProjectRecommendation(gameState);
  const firstIssueRecommendation = getFirstDevelopmentIssueRecommendation(gameState);
  const firstRewardRecommendation = getFirstRewardRecommendation(gameState);
  const firstGrowthRecommendation = getFirstGrowthRecommendation(gameState);
  const yearTwoProductRecommendation = getYearTwoProductRecommendation(gameState);
  const aiWorkforceCount = workforceMix.rows.find((row) => row.kind === "ai_agent")?.count ?? 0;
  const robotWorkforceCount = workforceMix.rows.find((row) => row.kind === "robot")?.count ?? 0;
  const openingObjectives = getOpeningObjectives(gameState);
  const alphaRunRoadmap = getAlphaRunRoadmap(gameState);
  const alphaRunRoadmapProgress = getAlphaRunRoadmapProgress(gameState);
  const alphaRunCompletion = getAlphaRunCompletionSummary(gameState);
  const alphaRunDebrief = getAlphaRunDebriefSummary(gameState);
  const activeAlphaRunStep = getActiveAlphaRunRoadmapStep(gameState);
  const firstTenMinutePlan = getFirstTenMinutePlan(gameState);
  const firstTenMinuteProgress = getFirstTenMinuteProgress(gameState);
  const betaReadinessSummary = getBetaReadinessSummary(gameState);
  const availableProducts = getAvailableProductDefinitions(gameState);
  const activeProducts = availableProducts.filter((product) => gameState.activeProducts.includes(product.id));
  const activeProject = gameState.productProjects[0];
  const activeProjectProduct = activeProject ? availableProducts.find((product) => product.id === activeProject.productId) : undefined;
  const officeExpansion = getOfficeExpansion(gameState);
  const placedOfficeItems = getPlacedOfficeItems(gameState);
  const officeHireCapacity = getOfficeHireCapacity(gameState);
  const officeDecorationSlots = getOfficeDecorationSlots(gameState);
  const officeZonePlan = getOfficeZonePlan(gameState);
  const officeScenePlan = getOfficeScenePlan(gameState);
  const visibleOfficeActors = officeScenePlan.actors.slice(0, Math.min(12, officeHireCapacity));
  const visibleOfficeActorIds = visibleOfficeActors.map((actor) => actor.id).join("|");
  const defaultFocusedOfficeActor =
    visibleOfficeActors.find((actor) => actor.state === "warning" || actor.state === "resting")
    ?? visibleOfficeActors.find((actor) => actor.state === "working")
    ?? visibleOfficeActors[0];
  const operationsPlan = getOperationsCommandPlan(gameState);
  const unlockedDomainNames = domains
    .filter((domain) => gameState.unlockedDomains.includes(domain.id))
    .map((domain) => domain.name);
  const selectedGrowthPath = gameState.chosenGrowthPath;
  const chosenGrowthPathId = selectedGrowthPath?.id;
  const runSummary = getRunSummary(gameState);
  const nextRunSetupPlan = getNextRunSetupPlan(gameState);
  const endingRouteQuickStart = nextRunSetupPlan.quickStarts.find(
    (quickStart) => quickStart.id === "ending_route" && quickStart.runModifierSelection,
  );
  const endingNearMisses = getEndingNearMisses(gameState, 3);
  const releaseImpact = getReleaseImpactSummary(gameState);
  const calendar = getCampaignCalendar(gameState);
  const finale = getCampaignFinale(gameState);
  const endingReport = finale.isFinal ? getCampaignEndingReport(gameState) : undefined;
  const endingDiscovery = finale.isFinal ? getCampaignEndingDiscovery(gameState) : undefined;
  const endingDiscoveryUnlocks = endingDiscovery
    ? getEndingRouteUnlockRecommendations(endingDiscovery.condition, gameState, gameState.roguelite.founderInsight + getRunInsightReward(gameState))
    : [];
  const activeEndingReplayBrief = getActiveEndingReplayBrief(gameState);
  const missingActiveEndingRequirements = activeEndingReplayBrief?.requirements.filter((requirement) => !requirement.complete).slice(0, 3) ?? [];
  const activeEndingResultRequirements = missingActiveEndingRequirements.length
    ? missingActiveEndingRequirements
    : activeEndingReplayBrief?.requirements.slice(0, 2) ?? [];
  const stageProgress = getCompanyStageProgress(gameState);
  const phase = getDayPhase(gameState);
  const location = getCurrentLocation(gameState);
  const staffAftermathSummary = gameState.lastMonthReport?.staffAftermathSummary;
  const openingFantasy =
    gameState.month === 1 && gameState.hiredAgents.length === 0 && gameState.productProjects.length === 0 && gameState.activeProducts.length === 0
      ? {
          locationName: location.name,
          officeName: officeExpansion.name,
        }
      : undefined;
  const officeHudProjectLabel = activeProject && activeProjectProduct ? activeProjectProduct.name : "개발 대기";
  const officeHudProjectMeta = activeProject
    ? `진행 ${Math.round(activeProject.progress)}% · 완성도 ${Math.round(activeProject.quality)}`
    : gameState.currentEvent
      ? "긴급 이슈 우선 처리"
      : "제품/인력 선택 필요";
  const officeAlertTitle = staffAftermathSummary ? "운영 경보" : gameState.currentEvent ? "긴급 이슈" : activeProject ? "개발 중" : "운영 대기";
  const officeAlertText = staffAftermathSummary
    ? staffAftermathSummary
    : gameState.currentEvent
      ? gameState.currentEvent.name
      : activeProject && activeProjectProduct
        ? `${activeProjectProduct.name} 출시까지 ${Math.max(0, 100 - Math.round(activeProject.progress))}%`
        : guidance.actionLabel;
  const growthPathCardClass = (pathId: string) =>
    ["growth-path-card", chosenGrowthPathId === pathId ? "selected" : "", chosenGrowthPathId && chosenGrowthPathId !== pathId ? "locked" : ""]
      .filter(Boolean)
      .join(" ");
  const [activeStageTab, setActiveStageTab] = useState<StageSideTabId>("guide");
  const [alphaRunFeedback, setAlphaRunFeedback] = useState<string>();
  const [selectedOfficeActorId, setSelectedOfficeActorId] = useState<string>();
  const [statusPopupOpen, setStatusPopupOpen] = useState(false);
  const statusPopupDismissRef = useRef<HTMLButtonElement>(null);
  const focusedOfficeActor = visibleOfficeActors.find((actor) => actor.id === selectedOfficeActorId) ?? defaultFocusedOfficeActor;
  const hasResultPanel = finale.isFinal || Boolean(gameState.lastRelease) || runSummary.isFinal;
  const showEndingReplayReadinessStrip =
    hasResultPanel &&
    (finale.isFinal ||
      runSummary.isFinal ||
      Boolean(activeEndingReplayBrief) ||
      endingNearMisses.length > 0 ||
      Boolean(endingRouteQuickStart?.runModifierSelection));

  useEffect(() => {
    if (hasResultPanel) setActiveStageTab("results");
  }, [hasResultPanel, gameState.lastRelease?.month, gameState.lastRelease?.productId, runSummary.isFinal, finale.isFinal]);

  useEffect(() => {
    if (selectedOfficeActorId && !visibleOfficeActors.some((actor) => actor.id === selectedOfficeActorId)) {
      setSelectedOfficeActorId(undefined);
    }
  }, [selectedOfficeActorId, visibleOfficeActorIds, visibleOfficeActors]);

  useEffect(() => {
    if (!statusPopupOpen) return undefined;

    statusPopupDismissRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setStatusPopupOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [statusPopupOpen]);

  const getStageTabHint = (tabId: StageSideTabId) => {
    if (tabId === "guide") return `${alphaRunRoadmapProgress}%`;
    if (tabId === "company") return `${getCompanyStarRating(gameState)}성`;
    if (tabId === "reports") return gameState.lastMonthReport?.staffAftermathCount ? "후폭풍" : gameState.lastMonthReport ? "보고 있음" : "대기";
    return hasResultPanel ? "새 소식" : "대기";
  };

  const handleGuidanceAction = () => {
    if (guidance.id === "advance_project") {
      setGameState((current) => advanceToFirstLaunch(current));
      return;
    }
    if (guidance.id === "advance_annual_review") {
      setGameState((current) => advanceToFirstAnnualReview(current));
      setActiveMenu("company");
      return;
    }
    if (guidance.id === "recover_failure") {
      setGameState(createInitialState());
      return;
    }
    if (guidance.menu) setActiveMenu(guidance.menu);
  };

  const handleFastFirstHire = () => {
    setGameState((current) => {
      const recommendation = getFirstHireRecommendation(current);
      if (!recommendation?.check.ok) return current;

      return hireAgentViaChannel(recommendation.agent, current, recommendation.channelId);
    });
    setActiveMenu("products");
  };

  const handleFastFirstProject = () => {
    setGameState((current) => {
      const recommendation = getFirstProjectRecommendation(current);
      if (!recommendation?.check.ok) return current;

      return startProductProject(recommendation.product, current, recommendation.assignedAgentIds);
    });
    setActiveMenu("deck");
  };

  const handleFastFirstIssue = () => {
    setGameState((current) => {
      const recommendation = getFirstDevelopmentIssueRecommendation(current);
      if (!recommendation?.check.ok) return current;

      const prepared = recommendation.card ? playStrategyCard(recommendation.card, current) : current;
      return resolveDevelopmentPuzzle(recommendation.projectId, recommendation.selectedTileIds, prepared);
    });
    setActiveMenu("deck");
  };

  const handleAlphaRunCompletionAction = (completion: AlphaRunCompletionSummary) => {
    if (completion.nextActionId === "resolve_issue") {
      setGameState((current) => {
        const recommendation = getYearTwoProductIssueRecommendation(current);
        if (!recommendation?.check.ok) return current;

        const prepared = recommendation.card ? playStrategyCard(recommendation.card, current) : current;
        return resolveDevelopmentPuzzle(recommendation.projectId, recommendation.selectedTileIds, prepared);
      });
      setActiveMenu("deck");
      setActiveStageTab("results");
      return;
    }

    if (completion.nextActionId === "launch_product") {
      setGameState((current) => advanceToFirstLaunch(current, 8));
      setActiveMenu("deck");
      setActiveStageTab("results");
      return;
    }

    if (completion.nextActionId === "choose_reward") {
      setGameState((current) => {
        const reward = current.roguelite.pendingCardReward;
        const cardId = reward?.offeredCardIds.find((offeredCardId) => getCardRewardChoiceCheck(offeredCardId, current).ok);

        return cardId ? chooseCardReward(cardId, current) : current;
      });
      setActiveMenu("deck");
      setActiveStageTab("results");
      return;
    }

    setActiveMenu(completion.nextMenu);
    setActiveStageTab("results");
  };

  const handleFastFirstReward = () => {
    setGameState((current) => {
      const recommendation = getFirstRewardRecommendation(current);
      if (!recommendation?.check.ok) return current;

      return chooseCardReward(recommendation.card.id, current);
    });
    setActiveMenu("deck");
    setActiveStageTab("results");
  };

  const handleFastFirstGrowth = () => {
    const recommendedTargetMenu = firstGrowthRecommendation?.path.targetMenu;

    setGameState((current) => {
      const recommendation = getFirstGrowthRecommendation(current);
      if (!recommendation?.check.ok) return current;

      return chooseGrowthPath(recommendation.path.id, current);
    });
    setActiveStageTab("results");
    if (recommendedTargetMenu) setActiveMenu(recommendedTargetMenu);
  };

  const handleStartNextRun = () => {
    setGameState((current) => resetRunWithMetaUnlocks(current, [], "balanced_founder", createEphemeralRunModifierSelection("chrome-next-run")));
    setActiveMenu("deck");
  };

  const handleStartEndingRouteRun = () => {
    setGameState((current) => {
      const routeQuickStart = getNextRunSetupPlan(current).quickStarts.find(
        (quickStart) => quickStart.id === "ending_route" && quickStart.runModifierSelection,
      );
      if (!routeQuickStart?.runModifierSelection) return current;

      return resetRunWithMetaUnlocks(
        current,
        routeQuickStart.unlockIds,
        routeQuickStart.starterDeckId,
        routeQuickStart.runModifierSelection,
      );
    });
    setActiveMenu("deck");
    setActiveStageTab("guide");
  };

  const handleRetryActiveEndingReplay = () => {
    if (!activeEndingReplayBrief) return;

    setGameState((current) =>
      resetRunWithMetaUnlocks(
        current,
        [],
        current.roguelite.starterDeckId ?? "balanced_founder",
        activeEndingReplayBrief.selection,
      ),
    );
    setActiveMenu("deck");
    setActiveStageTab("guide");
  };

  const handleStartNearMissRun = (replaySelection: RunModifierSelectionInput) => {
    setGameState((current) =>
      resetRunWithMetaUnlocks(
        current,
        [],
        current.roguelite.starterDeckId ?? "balanced_founder",
        replaySelection,
      ),
    );
    setActiveMenu("deck");
    setActiveStageTab("guide");
  };

  const handleGrowthPathClick = (path: ReleaseGrowthPath) => {
    if (!chosenGrowthPathId) {
      setGameState((current) => chooseGrowthPath(path.id, current));
    }
    setActiveMenu(path.targetMenu);
  };

  const handleLaunchNextAction = (menu: ReleaseImpactSummary["nextActionSteps"][number]["menu"]) => {
    if (menu === "results") {
      setActiveStageTab("results");
      return;
    }
    setActiveMenu(menu);
  };

  const runAlphaRunRoadmapAction = (step: AlphaRunRoadmapStep) => {
    if (!step.active || step.complete) return false;
    if (step.id === "first_launch") {
      if (firstHireRecommendation) {
        handleFastFirstHire();
        return true;
      }
      if (firstProjectRecommendation) {
        handleFastFirstProject();
        return true;
      }
      if (firstIssueRecommendation) {
        handleFastFirstIssue();
        return true;
      }
      if (guidance.id === "advance_project") {
        handleGuidanceAction();
        return true;
      }
    }
    if (step.id === "reward_growth") {
      if (firstRewardRecommendation) {
        handleFastFirstReward();
        return true;
      }
      if (firstGrowthRecommendation) {
        handleFastFirstGrowth();
        return true;
      }
    }
    if (step.id === "annual_directive" && guidance.id === "advance_annual_review") {
      handleGuidanceAction();
      return true;
    }
    if (step.id === "year_two_product" && yearTwoProductRecommendation) {
      const advancedState = advanceYearTwoProductRoadmap(gameState);
      const nextRecommendation = getYearTwoProductRecommendation(advancedState);
      const hasStartedYearTwoProduct =
        advancedState.activeProducts.includes("enterprise_workflow_agent") ||
        advancedState.productProjects.some((project) => project.productId === "enterprise_workflow_agent");
      const nextMenu = hasStartedYearTwoProduct ? "products" : nextRecommendation?.menu ?? yearTwoProductRecommendation.menu;

      if (advancedState !== gameState) setGameState(advancedState);
      setActiveMenu(nextMenu);
      setActiveStageTab(nextMenu === "company" ? "company" : "guide");
      return true;
    }
    return false;
  };

  const handleAlphaRunRoadmapStep = (step: AlphaRunRoadmapStep) => {
    setAlphaRunFeedback(getAlphaRunActionFeedback(step));
    if (runAlphaRunRoadmapAction(step)) return;
    setActiveMenu(step.menu);
    if ((step.id === "first_launch" && step.complete) || step.id === "reward_growth") {
      setActiveStageTab("results");
      return;
    }
    if (step.id === "annual_directive") {
      setActiveStageTab("company");
      return;
    }
    setActiveStageTab("guide");
  };

  const nextOperationCard = operationsPlan.focusCards[0];
  const nextActionTargetMenu = guidance.menu ?? nextOperationCard?.targetMenu;
  const nextActionTitle = guidance.priorityLabel ?? nextOperationCard?.title ?? operationsPlan.headline;
  const nextActionLabel = guidance.actionLabel ?? nextOperationCard?.actionLabel ?? "현황 보기";
  const nextActionDetail = guidance.helperText ?? nextOperationCard?.actionLabel ?? operationsPlan.summary;
  const handleNextActionChip = () => {
    if (nextActionTargetMenu) {
      setActiveMenu(nextActionTargetMenu);
      return;
    }

    setActiveStageTab("guide");
    setStatusPopupOpen(true);
  };

  return (
    <section className="game-stage" aria-label="AI 회사 사무실">
      <div className={`office-scene pixel-office-theater office-level-${officeExpansion.level} office-phase-${phase.id}`}>
        <div className="office-wall">
          <span>{location.name}</span>
          <span>TEAM {gameState.hiredAgents.length}/{officeHireCapacity}</span>
          <span>AI OPS {aiWorkforceCount}/{getAiOperationCapacity(gameState)}</span>
          <span>ROBOT {robotWorkforceCount}</span>
        </div>
        <div className="office-floor">
          <OfficeIsometricBackdrop />
          <div className="pixel-office-grid" aria-hidden="true" />
          <div className="office-object-layer pixel-office-object-layer" aria-label="사무실 구획 시각화">
            {officeScenePlan.objects.map((object, index) => (
              <span
                aria-label={`${object.label} · ${object.active ? object.activity : object.blockedReason}`}
                className={`office-object pixel-office-object office-object-${index} object-kind-${object.kind} ${object.active ? "active" : "locked"}`}
                key={object.id}
                role="img"
                style={
                  {
                    ...assetPaletteVars(object.palette),
                    "--object-x": `${object.x}%`,
                    "--object-y": `${object.y}%`,
                    "--object-w": `${object.w}%`,
                    "--object-h": `${object.h}%`,
                    ...getDepthStyle(object.y, 10),
                  } as CSSProperties
                }
                title={`${object.label} · ${object.active ? object.activity : object.blockedReason}`}
              >
                <i aria-hidden="true" className="office-object-activity-light" />
                <b aria-hidden="true" className="office-object-status-dot" />
                <i aria-hidden="true" className="office-object-production-meter" />
                <i aria-hidden="true" className="office-object-packet-spark" />
                <small>{object.label}</small>
              </span>
            ))}
          </div>
          <OfficeDecorAssetLayer placedOfficeItems={placedOfficeItems} />
          <OfficeGraphicAssetWall />
          {qaScenarioLabel && <OfficeSpriteSheetInspector />}
          <div className="office-hud" aria-label="사무실 빠른 상태">
            <span>
              <strong>{calendar.year}년 {calendar.monthOfYear}월</strong>
              <small>{phase.label}</small>
            </span>
            <span>
              <strong>{officeExpansion.name}</strong>
              <small>
                고용 {gameState.hiredAgents.length}/{officeHireCapacity} · 장식 {placedOfficeItems.length}/{officeDecorationSlots} · 구획 {officeScenePlan.activeObjectCount}
              </small>
            </span>
            <span>
              <strong>{officeHudProjectLabel}</strong>
              <small>{officeHudProjectMeta}</small>
            </span>
          </div>
          <button className="office-decor-button" onClick={() => setActiveMenu("shop")} type="button">
            <span aria-hidden="true">🎨</span>
            <strong>꾸미기</strong>
          </button>
          <button className="next-action-chip" onClick={handleNextActionChip} title={nextActionDetail} type="button">
            <span>다음 행동</span>
            <strong>{nextActionLabel}</strong>
            <small>{nextActionTitle}</small>
          </button>
          <RivalIncidentBanner gameState={gameState} />
          <OfficeEventReactionLayer reactions={officeScenePlan.eventReactions} />
          <OfficeWorkBeatLayer activeObjectCount={officeScenePlan.activeObjectCount} />
          <OfficeTaskLinkLayer actors={visibleOfficeActors} objects={officeScenePlan.objects} />
          <div className="office-actor-layer" aria-label="사무실 액터">
            {visibleOfficeActors.map((actor, index) => {
              const agentType = actor.agentTypeId ? agentTypes.find((type) => type.id === actor.agentTypeId) : undefined;
              const agentSprite = getAgentSprite(actor.agentTypeId);
              const agentSpriteFrameStyle = getAgentSpriteFrameStyle(agentSprite, actor);
              const fallbackActorFrameStyle = agentSpriteFrameStyle ? undefined : getFallbackActorSpriteFrameStyle(actor);
              const actorSpriteFrameStyle = agentSpriteFrameStyle ?? fallbackActorFrameStyle;
              const isSelected = focusedOfficeActor?.id === actor.id;
              const actorPoseClass = actor.reactionPose ? `actor-pose-${actor.reactionPose}` : "actor-pose-base";

              return (
                <button
                  aria-label={`${actor.name} · ${agentType?.role ?? "창업자"} · ${actor.assignmentLabel}`}
                  aria-pressed={isSelected}
                  className={`staff-sprite pixel-actor staff-${index} actor-kind-${actor.kind} actor-state-${actor.state} ${actorPoseClass} ${isSelected ? "selected" : ""} ${actor.state === "working" ? "working" : "idle"} ${actorSpriteFrameStyle ? "sprite-sheet-frame" : ""} ${agentSpriteFrameStyle ? "sprite-sheet-animated" : ""} ${fallbackActorFrameStyle ? "actor-fallback-sheet" : ""} ${agentSprite?.body_class ?? ""}`}
                  key={actor.id}
                  onClick={() => setSelectedOfficeActorId(actor.id)}
                  style={
                    {
                      ...assetPaletteVars(agentSprite?.palette),
                      ...actorSpriteFrameStyle,
                      "--actor-x": `${actor.x}%`,
                      "--actor-y": `${actor.y}%`,
                      "--office-workloop-delay": `${(index % 5) * 120}ms`,
                      ...getDepthStyle(actor.y, 80),
                    } as CSSProperties
                  }
                  title={`${actor.name} · ${agentType?.role ?? "창업자"} · ${actor.activity}`}
                  type="button"
                >
                  <i aria-hidden="true" className="office-actor-bustle-shadow" />
                  <b>{actor.name.slice(0, 3)}</b>
                  <small className="actor-thought">{actor.assignmentLabel}</small>
                  <span aria-hidden="true" className="office-actor-workloop-kit">
                    <i className="office-actor-key-clack" />
                    <i className="office-actor-comic-pop" />
                    <i className="office-actor-focus-beam" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="office-actor-reaction-sprite"
                    style={getOfficeActorReactionIconStyle(actor, index)}
                  />
                  <i aria-hidden="true" className="office-actor-work-puff" />
                  <i aria-hidden="true" className="office-actor-motion-tick" />
                </button>
              );
            })}
          </div>
          {focusedOfficeActor && (
            <OfficeActorFocusPanel
              actor={focusedOfficeActor}
              gameState={gameState}
              onCareAction={setGameState}
              onOpenMenu={setActiveMenu}
            />
          )}
          <div className="server-rack">
            <i />
            <i />
            <i />
          </div>
          <div className="launch-screen">
            <strong>{activeProducts.length ? activeProducts[activeProducts.length - 1].name : "첫 제품 준비 중"}</strong>
            <span>{activeProject ? `${Math.round(activeProject.progress)}% 개발 · 완성도 ${Math.round(activeProject.quality)}` : gameState.currentEvent ? "이슈 대응 필요" : "운영 정상"}</span>
          </div>
          {activeProject && activeProjectProduct && (
            <div className="project-stack">
              <strong>{activeProjectProduct.name}</strong>
              <span>개발 {Math.round(activeProject.progress)}%</span>
              <span>완성도 {Math.round(activeProject.quality)}</span>
              <small>
                팀 {gameState.hiredAgents.filter((agent) => activeProject.assignedAgentIds.includes(agent.id)).map((agent) => agent.name).join(", ")}
              </small>
            </div>
          )}
          <AlphaRunFocusStrip
            feedback={alphaRunFeedback}
            onStepOpen={handleAlphaRunRoadmapStep}
            progress={alphaRunRoadmapProgress}
            step={activeAlphaRunStep}
          />
          <TurnGoalStrip guidance={guidance} onAction={handleGuidanceAction} />
          <div className="office-alert-strip" aria-live="polite">
            <strong>{officeAlertTitle}</strong>
            <span>{officeAlertText} · {officeScenePlan.activityTicker[0]}</span>
          </div>
        </div>
      </div>

      {statusPopupOpen && (
        <div className="stage-status-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="stage-status-popup-title">
          <section className="stage-status-popup-card" aria-label="사무실 현황 팝업">
            <header className="stage-status-popup-header">
              <div>
                <p className="stage-status-popup-kicker">Office status</p>
                <h2 id="stage-status-popup-title">사무실 현황</h2>
              </div>
              <button ref={statusPopupDismissRef} className="stage-status-popup-dismiss" onClick={() => setStatusPopupOpen(false)} type="button">
                닫기
              </button>
            </header>
            <div className="stage-side">
        <div className="stage-side-tabs" role="tablist" aria-label="보조 정보">
          {stageSideTabs.map((tab) => (
            <button
              aria-controls={`stage-side-panel-${tab.id}`}
              aria-selected={activeStageTab === tab.id}
              className={activeStageTab === tab.id ? "active" : ""}
              key={tab.id}
              onClick={() => setActiveStageTab(tab.id)}
              role="tab"
              type="button"
            >
              <strong>{tab.label}</strong>
              <span>{getStageTabHint(tab.id)}</span>
            </button>
          ))}
        </div>
        <div className={`stage-side-panel tab-${activeStageTab}`} id={`stage-side-panel-${activeStageTab}`} role="tabpanel">
          {activeStageTab === "guide" && (
            <GuidancePanel
              alphaRunRoadmap={alphaRunRoadmap}
              alphaRunRoadmapProgress={alphaRunRoadmapProgress}
              alphaRunCompletion={alphaRunCompletion}
              alphaRunDebrief={alphaRunDebrief}
              betaReadinessSummary={betaReadinessSummary}
              firstTenMinutePlan={firstTenMinutePlan}
              firstTenMinuteProgress={firstTenMinuteProgress}
              firstHireRecommendation={firstHireRecommendation}
              firstGrowthRecommendation={firstGrowthRecommendation}
              firstIssueRecommendation={firstIssueRecommendation}
              firstProjectRecommendation={firstProjectRecommendation}
              firstRewardRecommendation={firstRewardRecommendation}
              guidance={guidance}
              objectives={openingObjectives}
              openingFantasy={openingFantasy}
              onAction={handleGuidanceAction}
              onFastHire={handleFastFirstHire}
              onFastGrowth={handleFastFirstGrowth}
              onFastIssue={handleFastFirstIssue}
              onFastProject={handleFastFirstProject}
              onFastReward={handleFastFirstReward}
              onOpenAlphaRunCompletion={handleAlphaRunCompletionAction}
              onRoadmapStepOpen={handleAlphaRunRoadmapStep}
              workforceMix={workforceMix}
            />
          )}
          {activeStageTab === "company" && (
            <article className="company-stage">
              <p className="eyebrow">회사 단계</p>
              <h2>{companyStage.name}</h2>
              <p>{companyStage.description}</p>
              {stageProgress.next ? (
                <div className="stage-promotion-mini">
                  <strong>다음 승급: {stageProgress.next.name} · {stageProgress.progressPercent}%</strong>
                  {stageProgress.items.map((item) => (
                    <span className={item.complete ? "complete" : ""} key={item.requirement}>
                      {item.label} {item.currentLabel}/{item.targetLabel}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="stage-promotion-mini complete">
                  <strong>최종 회사 단계 도달</strong>
                  <span>이제 10년 엔딩 점수와 시장 지배력을 끌어올리면 됩니다.</span>
                </div>
              )}
              {gameState.chosenGrowthPath && <span className="growth-identity">전략: {gameState.chosenGrowthPath.title}</span>}
              <span className="growth-identity">
                10년 캠페인 {calendar.progressPercent}% · 남은 {calendar.remainingMonths}개월
              </span>
              <span className="growth-identity">{phase.description}</span>
              <span className="growth-identity">
                로그라이트 런 {gameState.roguelite.runNumber} · 손패 {gameState.roguelite.deck.hand.length} · 통찰 {gameState.roguelite.founderInsight}
              </span>
              <span className="growth-identity">
                사무실 {officeExpansion.name} · 구획 {officeZonePlan.active.length} · 장식 {placedOfficeItems.length}/{officeDecorationSlots}
              </span>
              <span className="growth-identity">{officeZonePlan.operationLabel}</span>
              {gameState.lastDevelopmentPuzzle && (
                <span>최근 퍼즐: {gameState.lastDevelopmentPuzzle.verdict} {gameState.lastDevelopmentPuzzle.score}점</span>
              )}
              <span>해금 분야: {unlockedDomainNames.join(", ")}</span>
            </article>
          )}
          {activeStageTab === "reports" && (
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
                  {gameState.lastMonthReport.strategyEffects && (
                    <div className="wide-report-row">
                      <dt>전략 효과</dt>
                      <dd>{formatEffects(gameState.lastMonthReport.strategyEffects)}</dd>
                    </div>
                  )}
                  {gameState.lastMonthReport.staffAftermathSummary && (
                    <div className="wide-report-row monthly-staff-aftermath-row">
                      <dt>인사 후폭풍</dt>
                      <dd>{gameState.lastMonthReport.staffAftermathSummary}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p>제품을 출시하고 다음 달로 넘기면 첫 성과 보고가 올라옵니다.</p>
              )}
            </article>
          )}
          {activeStageTab === "results" && (
            <>
              {finale.isFinal && <BetaCompletionCrest finale={finale} summary={betaReadinessSummary} endingDiscovery={endingDiscovery} />}
              {showEndingReplayReadinessStrip && (
                <EndingReplayReadinessStrip
                  activeEndingReplayBrief={activeEndingReplayBrief}
                  codexStatusLabel={betaReadinessSummary.codexStatusLabel}
                  endingNearMisses={endingNearMisses}
                  endingRouteQuickStartDescription={endingRouteQuickStart?.description}
                  endingRouteQuickStartLabel={endingRouteQuickStart?.label}
                  hasEndingRouteQuickStart={Boolean(endingRouteQuickStart?.runModifierSelection)}
                  nextTargetLabel={betaReadinessSummary.nextTargetLabel}
                  nextTargetRouteLabel={betaReadinessSummary.nextTargetRouteLabel}
                  onRetryActiveEndingReplay={handleRetryActiveEndingReplay}
                  onStartEndingRouteRun={handleStartEndingRouteRun}
                  onStartNearMissRun={handleStartNearMissRun}
                  readinessPercent={betaReadinessSummary.readinessPercent}
                />
              )}
              {finale.isFinal && (
                <article className={`run-summary rank-${finale.rank}`}>
                  <p className="eyebrow">10년 엔딩</p>
                  <div className="run-rank">
                    <strong>{finale.rank}</strong>
                    <span>{finale.endingName} · {finale.score}점</span>
                  </div>
                  <h2>{finale.title}</h2>
                  <p>{finale.verdict}</p>
                  <div className="campaign-aftermath-panel" aria-label="11년차 후일담">
                    <div className="campaign-aftermath-copy">
                      <span>{finale.aftermath.yearLabel}</span>
                      <strong>{finale.aftermath.headline}</strong>
                      <small>{finale.aftermath.summary}</small>
                    </div>
                    <div className="campaign-aftermath-grid">
                      {finale.aftermath.signals.map((signal) => (
                        <span className={`tone-${signal.tone}`} key={signal.id}>
                          <strong>{signal.label}</strong>
                          <small>{signal.detail}</small>
                        </span>
                      ))}
                    </div>
                  </div>
                  {endingDiscovery && (
                    <div
                      className={`ending-discovery-panel ${endingDiscovery.alreadyDiscovered ? "known" : "new"}`}
                      aria-label="엔딩 도감 반영"
                    >
                      <span>
                        <strong>{endingDiscovery.alreadyDiscovered ? "기록 갱신" : "새 엔딩 발견"}</strong>
                        <small>
                          도감 반영 {endingDiscovery.discoveredCountAfterRun}/{endingDiscovery.totalCount} · 완성률{" "}
                          {endingDiscovery.completionPercentAfterRun}%
                        </small>
                      </span>
                      <span>
                        <strong>{endingDiscovery.rewardStatusLabel}</strong>
                        <small>
                          {endingDiscovery.rewardDeltaLabel} · {endingDiscovery.rewardDeltaDescription} · 도감 통찰 {endingDiscovery.discoveredRewardBonusAfterRun}/{endingDiscovery.totalRewardBonus} · 보상 완성률{" "}
                          {endingDiscovery.rewardCompletionPercentAfterRun}%
                        </small>
                      </span>
                      <span>
                        <strong>도감 반영</strong>
                        <small>{endingDiscovery.codexApplyLabel}</small>
                      </span>
                      {endingDiscoveryUnlocks.length > 0 && (
                        <span className="ending-discovery-unlocks">
                          <strong>다음 런 추천 해금</strong>
                          <small>
                            {endingDiscoveryUnlocks
                              .map((endingDiscoveryUnlock) =>
                                `${endingDiscoveryUnlock.title} · 비용 ${endingDiscoveryUnlock.cost} · ${endingDiscoveryUnlock.statusLabel}`,
                              )
                              .join(" / ")}
                          </small>
                        </span>
                      )}
                    </div>
                  )}
                  {activeEndingReplayBrief && (
                    <div
                      className={`ending-target-result-panel ${activeEndingReplayBrief.complete ? "complete" : "missed"}`}
                      aria-label="목표 엔딩 결과"
                    >
                      <div>
                        <strong>목표 엔딩 결과</strong>
                        <span>
                          {activeEndingReplayBrief.complete ? "목표 달성" : "목표 미달"} · 조건{" "}
                          {activeEndingReplayBrief.matchedRequirements}/{activeEndingReplayBrief.totalRequirements} ·{" "}
                          {activeEndingReplayBrief.progressPercent}%
                        </span>
                      </div>
                      <div className="ending-target-result-grid">
                        <span>
                          <strong>{activeEndingReplayBrief.title}</strong>
                          <small>{activeEndingReplayBrief.targetLabels.slice(0, 4).join(" / ")}</small>
                        </span>
                        {activeEndingResultRequirements.map((requirement) => (
                          <span className={requirement.complete ? "complete" : "missing"} key={requirement.id}>
                            <strong>{requirement.label}</strong>
                            <small>{requirement.currentLabel} / {requirement.targetLabel}</small>
                          </span>
                        ))}
                      </div>
                      {!activeEndingReplayBrief.complete ? (
                        <button onClick={handleRetryActiveEndingReplay} type="button">
                          목표 다시 도전
                        </button>
                      ) : (
                        <small>{activeEndingReplayBrief.completionRewardNotice}</small>
                      )}
                    </div>
                  )}
                  {endingReport && (
                    <div className="ending-report-panel" aria-label="엔딩 조건 리포트">
                      <div>
                        <strong>엔딩 조건 리포트</strong>
                        <span>{endingReport.matchedRequirements}/{endingReport.totalRequirements} 조건 충족</span>
                      </div>
                      <div className="ending-report-grid">
                        {endingReport.requirements.length ? (
                          endingReport.requirements.map((requirement) => (
                            <span className={requirement.complete ? "complete" : "missing"} key={requirement.id}>
                              <strong>{requirement.label}</strong>
                              <small>{requirement.currentLabel} / {requirement.targetLabel}</small>
                            </span>
                          ))
                        ) : (
                          <span className="complete">
                            <strong>기본 결말</strong>
                            <small>{endingReport.flavor}</small>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              )}
              {endingNearMisses.length > 0 && (
                <article className="ending-nearmiss-panel" aria-label="아쉬운 엔딩">
                  <div>
                    <p className="eyebrow">아쉬운 엔딩</p>
                    <h2>거의 닿았던 다른 결말</h2>
                    <p>부족했던 조건을 보고 바로 목표 런으로 다시 시작할 수 있습니다.</p>
                  </div>
                  <div className="ending-nearmiss-grid">
                    {endingNearMisses.map((nearMiss) => (
                      <button
                        key={nearMiss.id}
                        onClick={() => handleStartNearMissRun(nearMiss.replaySelection)}
                        type="button"
                      >
                        <strong>{nearMiss.title}</strong>
                        <span>{nearMiss.progressPercent}% · {nearMiss.targetLabels.slice(0, 3).join(" / ")}</span>
                        <em>{nearMiss.discovered ? "발견 완료" : "새 도감 후보"} · {nearMiss.rewardStatusLabel}</em>
                        <small>{nearMiss.missingLabels.slice(0, 3).join(" / ") || "조건 확인 필요"}</small>
                      </button>
                    ))}
                  </div>
                </article>
              )}
              {gameState.lastRelease && (
                <article className="release-spotlight">
                  <p className="eyebrow">출시 결과</p>
                  <div className="release-score">
                    <strong>{gameState.lastRelease.review.grade}</strong>
                    <span>{gameState.lastRelease.review.score}점</span>
                  </div>
                  <h2>{gameState.lastRelease.productName}</h2>
                  <p className="release-headline">{gameState.lastRelease.headline}</p>
                  {firstRewardRecommendation && <FirstRewardFastStart recommendation={firstRewardRecommendation} onChoose={handleFastFirstReward} />}
                  {firstGrowthRecommendation && <FirstGrowthFastStart recommendation={firstGrowthRecommendation} onChoose={handleFastFirstGrowth} />}
                  {selectedGrowthPath && (
                    <div className="growth-choice-confirmation" aria-label="성장 분기 선택 완료">
                      <div>
                        <p className="eyebrow">성장 분기 선택 완료</p>
                        <strong>{selectedGrowthPath.title}</strong>
                        <span>다음 달부터 월간 보너스가 적용됩니다. 연간 심사까지 이 방향으로 첫해 성과를 밀어붙이세요.</span>
                      </div>
                      <ol>
                        <li>
                          <strong>월간 보너스</strong>
                          <span>{formatEffects(selectedGrowthPath.monthlyEffects)}</span>
                        </li>
                        <li>
                          <strong>즉시 반영</strong>
                          <span>{formatEffects(selectedGrowthPath.effects)}</span>
                        </li>
                        <li>
                          <strong>연간 심사까지</strong>
                          <span>다음 달을 넘겨 첫해 결과 확인</span>
                        </li>
                      </ol>
                    </div>
                  )}
                  {releaseImpact && <LaunchImpactPanel summary={releaseImpact} onOpenNextAction={handleLaunchNextAction} />}
                  <p>{gameState.lastRelease.review.quote}</p>
                  <p className="market-reaction">{gameState.lastRelease.marketReaction}</p>
                  <p className="expansion-hint">{gameState.lastRelease.expansionHint}</p>
                  {gameState.lastRelease.growthPaths?.length > 0 && (
                    <div className="growth-fork-list">
                      <p className="eyebrow">다음 성장 분기</p>
                      {gameState.lastRelease.growthPaths.map((path) => (
                        <button
                          aria-pressed={chosenGrowthPathId === path.id}
                          className={growthPathCardClass(path.id)}
                          key={path.id}
                          onClick={() => handleGrowthPathClick(path)}
                        >
                          <strong>{path.title}</strong>
                          <span>{path.description}</span>
                          <small>{chosenGrowthPathId === path.id ? `선택됨: ${path.bonusDescription}` : path.bonusDescription}</small>
                        </button>
                      ))}
                    </div>
                  )}
                  <small>{gameState.lastRelease.month}개월차 출시 완료</small>
                </article>
              )}
              {alphaRunDebrief && <AlphaRunDebriefPanel summary={alphaRunDebrief} />}
              {runSummary.isFinal && (
                <article className={`run-summary rank-${runSummary.rank}`}>
                  <p className="eyebrow">런 결과</p>
                  <div className="run-rank">
                    <strong>{runSummary.rank}</strong>
                    <span>{runSummary.score}점</span>
                  </div>
                  <h2>{runSummary.title}</h2>
                  <p>{runSummary.verdict}</p>
                  <ul>
                    {runSummary.strengths.slice(0, 4).map((strength) => (
                      <li key={strength}>{strength}</li>
                    ))}
                  </ul>
                  <div className="run-spotlight-grid">
                    <div>
                      <span>대표 제품</span>
                      <strong>{runSummary.spotlight.bestProduct?.name ?? "출시 제품 없음"}</strong>
                      <small>
                        {runSummary.spotlight.bestProduct
                          ? `${runSummary.spotlight.bestProduct.domainName} · ${runSummary.spotlight.bestProduct.grade} / ${runSummary.spotlight.bestProduct.score}점`
                          : "첫 제품 출시가 다음 런의 최우선 목표"}
                      </small>
                    </div>
                    <div>
                      <span>대표 카드</span>
                      <strong>{runSummary.spotlight.representativeCard?.name ?? "대표 카드 없음"}</strong>
                      <small>{runSummary.spotlight.representativeCard?.reason ?? "출시 보상이나 강화 카드가 아직 없습니다."}</small>
                    </div>
                    <div>
                      <span>경쟁 압박</span>
                      <strong>{runSummary.spotlight.rivalPressure?.name ?? "관측 없음"}</strong>
                      <small>{runSummary.spotlight.rivalPressure?.pressure ?? "경쟁사 시장 압박이 아직 낮습니다."}</small>
                    </div>
                    {runSummary.spotlight.ending && (
                      <div className="ending-spotlight-card">
                        <span>{runSummary.spotlight.ending.newlyDiscovered ? "신규 엔딩 발견" : "발견 완료 엔딩"}</span>
                        <strong>{runSummary.spotlight.ending.title}</strong>
                        <small>{runSummary.spotlight.ending.rewardStatusLabel}</small>
                      </div>
                    )}
                  </div>
                  <div className="run-insight-card">
                    <strong>창업 통찰 +{runSummary.spotlight.insightReward}</strong>
                    <span>{runSummary.spotlight.insightBreakdown.join(" · ")}</span>
                  </div>
                  {runSummary.spotlight.failureReasons.length > 0 && (
                    <div className="run-risk-list">
                      <strong>다음 런에서 조심할 것</strong>
                      <span>{runSummary.spotlight.failureReasons.slice(0, 3).join(" / ")}</span>
                    </div>
                  )}
                  <div className="next-run-preview">
                    <div>
                      <p className="eyebrow">다음 런 브리핑</p>
                      <strong>
                        런 {runSummary.spotlight.nextRunPreview.projectedRunNumber} · 통찰 {runSummary.spotlight.nextRunPreview.projectedFounderInsight}
                      </strong>
                    </div>
                    <div className="next-run-preview-grid">
                      <section>
                        <span>이어지는 것</span>
                        {runSummary.spotlight.nextRunPreview.carryovers.slice(0, 3).map((carryover) => (
                          <small key={carryover}>{carryover}</small>
                        ))}
                      </section>
                      <section>
                        <span>해금 후보</span>
                        {runSummary.spotlight.nextRunPreview.unlockOptions.slice(0, 3).map((option) => (
                          <small key={option}>{option}</small>
                        ))}
                      </section>
                    </div>
                    <ol>
                      {runSummary.spotlight.nextRunPreview.openingMoves.map((move) => (
                        <li key={move}>{move}</li>
                      ))}
                    </ol>
                  </div>
                  <p className="next-run-hook">{runSummary.spotlight.nextRunHook}</p>
                  <small>{runSummary.recommendation}</small>
                  {endingRouteQuickStart?.runModifierSelection && (
                    <button className="ending-route-result-action" onClick={handleStartEndingRouteRun} type="button">
                      <span>다음 도감 목표</span>
                      <strong>엔딩 목표 런으로 새 런</strong>
                      <small>{endingRouteQuickStart.label.replace("엔딩 목표: ", "")}</small>
                      <em>{endingRouteQuickStart.description}</em>
                    </button>
                  )}
                  <button className="primary-action" onClick={handleStartNextRun} type="button">
                    통찰 받고 새 런
                  </button>
                </article>
              )}
              {!hasResultPanel && (
                <article className="monthly-report">
                  <p className="eyebrow">결과 대기</p>
                  <h2>첫 출시를 기다리는 중</h2>
                  <p>제품을 완성하면 출시 결과, 성장 분기, 런 결과가 이 탭에 모입니다.</p>
                </article>
              )}
            </>
          )}
        </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

const decorAssetSlots = [
  { x: 17, y: 84 },
  { x: 30, y: 84 },
  { x: 43, y: 86 },
  { x: 58, y: 84 },
  { x: 72, y: 84 },
  { x: 84, y: 83 },
  { x: 24, y: 36 },
  { x: 45, y: 33 },
  { x: 64, y: 34 },
  { x: 82, y: 35 },
];

function OfficeIsometricBackdrop() {
  const backdrop = assetManifest.scene_backdrops[officeBackdropId];
  if (!backdrop) return null;

  return (
    <img
      alt=""
      aria-hidden="true"
      className="office-isometric-backdrop"
      height={backdrop.height}
      src={backdrop.path}
      width={backdrop.width}
    />
  );
}

function OfficeDecorAssetLayer({ placedOfficeItems }: { placedOfficeItems: ItemDefinition[] }) {
  const decorAssets = placedOfficeItems
    .map((item, index) => {
      const asset = getOfficeObjectAsset(item.id);
      if (!asset) return undefined;
      const slot = decorAssetSlots[index % decorAssetSlots.length];

      return {
        asset,
        icon: getItemIcon(item.id),
        item,
        slot,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .slice(0, decorAssetSlots.length);

  if (decorAssets.length === 0) return null;

  return (
    <div className="office-decor-asset-layer" aria-label="배치된 그래픽 장식">
      {decorAssets.map(({ asset, icon, item, slot }) => {
        const objectSpriteFrameStyle = getOfficeObjectSpriteFrameStyle(asset);

        return (
          <span
            aria-label={`${item.name} · ${asset.readable_shape}`}
            className={`decor-asset-prop decor-object-${asset.object_id} ${objectSpriteFrameStyle ? "sprite-sheet-frame" : ""} ${icon?.icon_class ?? ""}`}
            key={item.id}
            role="img"
            style={
              {
                ...assetPaletteVars(asset.palette),
                "--decor-x": `${slot.x}%`,
                "--decor-y": `${slot.y}%`,
                "--decor-w": `${Math.max(20, asset.footprint[0] * 18)}px`,
                "--decor-h": `${Math.max(18, asset.footprint[1] * 14)}px`,
                ...getDepthStyle(slot.y, 40),
                ...objectSpriteFrameStyle,
              } as CSSProperties
            }
            title={`${item.name} · ${asset.readable_shape}`}
          />
        );
      })}
    </div>
  );
}

function OfficeSpriteSheetInspector() {
  const agentSheet = getAssetSheet(agentSheetId);
  const objectSheet = getAssetSheet(officeObjectSheetId);
  const previewGroups = [
    { id: "agents", label: "캐릭터", sheet: agentSheet, frameWidth: 38, frameHeight: 38 },
    { id: "objects", label: "오브젝트", sheet: objectSheet, frameWidth: 44, frameHeight: 34 },
  ];

  return (
    <div className="sprite-sheet-inspector" aria-label="시트 프리뷰">
      {previewGroups.map((group) => {
        if (!group.sheet) return null;
        const sheet = group.sheet;
        const frames = getSpriteSheetPreviewFrames(sheet).slice(0, 6);

        return (
          <div className={`sprite-sheet-preview-group preview-${group.id}`} key={group.id}>
            <span>
              <strong>{group.label}</strong>
              <small>
                {sheet.source_frame_width && sheet.source_frame_height
                  ? `원본 ${sheet.source_frame_width}×${sheet.source_frame_height} / 게임 ${sheet.frame_width}×${sheet.frame_height}`
                  : `${sheet.frame_width}×${sheet.frame_height}`}
                {sheet.source_origin ? ` · ${sheet.source_origin}` : ""}
              </small>
            </span>
            <div>
              {frames.map((frameIndex) => (
                <i
                  aria-label={`${group.label} ${frameIndex}`}
                  className="sprite-sheet-preview-frame"
                  key={`${group.id}-${frameIndex}`}
                  role="img"
                  style={getSpriteSheetFrameStyle(sheet, frameIndex, group.frameWidth, group.frameHeight)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type OfficeGraphicAssetTile = {
  className: string;
  key: string;
  label: string;
  palette?: string[];
  style?: CSSProperties;
  title: string;
};

function OfficeGraphicAssetWall() {
  const rows: Array<{ id: string; tiles: OfficeGraphicAssetTile[] }> = [
    {
      id: "agents",
      tiles: assetManifest.agent_sprites.map((sprite) => ({
        className: `asset-agent ${sprite.body_class}`,
        key: sprite.agent_type_id,
        label: sprite.agent_type_id,
        palette: sprite.palette,
        title: sprite.portrait_hint,
      })),
    },
    {
      id: "competitors",
      tiles: assetManifest.competitor_identities.map((identity) => ({
        className: `asset-competitor ${identity.logo_class} ${identity.sheet_id ? "asset-competitor-atlas" : ""}`,
        key: identity.competitor_id,
        label: identity.competitor_id,
        palette: identity.palette,
        style: getCompetitorLogoStyle(identity, 13),
        title: identity.mascot_hint,
      })),
    },
    {
      id: "items",
      tiles: assetManifest.item_icons.map((icon) => ({
        className: `asset-item ${icon.icon_class}`,
        key: icon.item_id,
        label: icon.item_id,
        palette: icon.palette,
        title: icon.readable_shape,
      })),
    },
    {
      id: "office",
      tiles: assetManifest.office_objects.map((object) => ({
        className: `asset-office-object asset-office-${object.object_id}`,
        key: object.object_id,
        label: object.object_id,
        palette: object.palette,
        title: object.readable_shape,
      })),
    },
  ];

  return (
    <div className="office-graphic-asset-wall" aria-label="그래픽 자산 벽">
      {rows.map((row) => (
        <div className={`office-asset-row asset-row-${row.id}`} key={row.id}>
          {row.tiles.map((tile) => (
            <span
              aria-label={tile.title}
              className={`office-asset-mini ${tile.className}`}
              key={tile.key}
              role="img"
              style={{ ...assetPaletteVars(tile.palette), ...tile.style }}
              title={`${tile.label} · ${tile.title}`}
            >
              <i />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function OfficeEventReactionLayer({ reactions }: { reactions: OfficeEventReactionStatus[] }) {
  if (reactions.length === 0) return null;

  return (
    <div className="office-event-reaction-layer" aria-label="사무실 이벤트 반응" aria-live="polite">
      {reactions.map((reaction) => (
        <span
          className={`office-event-reaction tone-${reaction.tone} reaction-${reaction.trigger}`}
          key={reaction.id}
          style={
            {
              "--reaction-duration": `${reaction.duration_ms}ms`,
              "--reaction-x": `${reaction.x}%`,
              "--reaction-y": `${reaction.y}%`,
              ...getDepthStyle(reaction.y, 120),
            } as CSSProperties
          }
          title={`${reaction.label} · ${reaction.detail}`}
        >
          <strong>{reaction.bubble}</strong>
          <small>{reaction.headline}</small>
        </span>
      ))}
    </div>
  );
}

const officeWorkBeatNodes = [
  { id: "build", label: "빌드", tone: "code", x: 34, y: 54 },
  { id: "gpu", label: "GPU", tone: "compute", x: 58, y: 42 },
  { id: "meet", label: "회의", tone: "team", x: 24, y: 66 },
  { id: "idea", label: "아이디어", tone: "idea", x: 70, y: 58 },
  { id: "data", label: "데이터", tone: "data", x: 44, y: 74 },
  { id: "ship", label: "런칭", tone: "ship", x: 78, y: 36 },
  { id: "debug", label: "수정", tone: "code", x: 16, y: 48 },
  { id: "ops", label: "OPS", tone: "compute", x: 86, y: 70 },
] as const;

function OfficeWorkBeatLayer({ activeObjectCount }: { activeObjectCount: number }) {
  const visibleCount = Math.max(4, Math.min(officeWorkBeatNodes.length, activeObjectCount + 3));

  return (
    <div className="office-workbeat-layer" aria-hidden="true">
      {officeWorkBeatNodes.slice(0, visibleCount).map((node, index) => (
        <span
          className={`office-workbeat-node workbeat-${node.tone}`}
          key={node.id}
          style={
            {
              "--workbeat-delay": `${(index % 4) * 220}ms`,
              "--workbeat-x": `${node.x}%`,
              "--workbeat-y": `${node.y}%`,
              ...getDepthStyle(node.y, 56),
            } as CSSProperties
          }
        >
          {node.label}
        </span>
      ))}
    </div>
  );
}

type OfficeTaskLinkTone = "compute" | "team" | "launch" | "care" | "alert" | "default";

interface OfficeTaskLink {
  id: string;
  label: string;
  tone: OfficeTaskLinkTone;
  x: number;
  y: number;
  length: number;
  angle: number;
  delayMs: number;
}

function getOfficeTaskLinkTone(actor: OfficeSceneActorStatus, object: OfficeSceneObjectStatus): OfficeTaskLinkTone {
  if (object.kind === "server" || object.kind === "chip" || object.kind === "screen") return "compute";
  if (actor.state === "warning") return "alert";
  if (object.kind === "hiring" || object.kind === "desk") return "team";
  if (object.kind === "launch" || object.kind === "showroom") return "launch";
  if (object.kind === "lounge") return "care";
  return "default";
}

function createOfficeTaskLinks(actors: OfficeSceneActorStatus[], objects: OfficeSceneObjectStatus[]): OfficeTaskLink[] {
  const workObjects = objects.filter((object) => object.active && object.kind !== "route");
  if (workObjects.length === 0) return [];

  return actors
    .filter((actor) => actor.state !== "resting")
    .slice(0, 6)
    .map((actor, index) => {
      const object = workObjects[(index + (actor.kind === "robot" ? 1 : 0)) % workObjects.length];
      const dx = object.x - actor.x;
      const dy = object.y - actor.y;
      const length = Math.max(8, Math.min(42, Math.hypot(dx, dy)));

      return {
        id: `${actor.id}-${object.id}`,
        label: `${actor.assignmentLabel} -> ${object.activity}`,
        tone: getOfficeTaskLinkTone(actor, object),
        x: actor.x,
        y: actor.y,
        length,
        angle: Math.atan2(dy, dx) * (180 / Math.PI),
        delayMs: (index % 4) * 180,
      };
    });
}

function OfficeTaskLinkLayer({
  actors,
  objects,
}: {
  actors: OfficeSceneActorStatus[];
  objects: OfficeSceneObjectStatus[];
}) {
  const links = createOfficeTaskLinks(actors, objects);
  if (links.length === 0) return null;

  return (
    <div className="office-task-link-layer" aria-hidden="true">
      {links.map((link) => (
        <span
          className={`office-task-link task-link-${link.tone}`}
          key={link.id}
          style={
            {
              "--task-link-angle": `${link.angle}deg`,
              "--task-link-delay": `${link.delayMs}ms`,
              "--task-link-length": `${link.length}%`,
              "--task-link-x": `${link.x}%`,
              "--task-link-y": `${link.y}%`,
            } as CSSProperties
          }
          title={link.label}
        />
      ))}
    </div>
  );
}

function OfficeActorFocusPanel({
  actor,
  gameState,
  onCareAction,
  onOpenMenu,
}: {
  actor: OfficeSceneActorStatus;
  gameState: GameState;
  onCareAction: Dispatch<SetStateAction<GameState>>;
  onOpenMenu: Dispatch<SetStateAction<MenuId>>;
}) {
  const kindLabel = actor.kind === "human" ? "사람" : actor.kind === "robot" ? "로봇" : "AI";
  const energyTone = actor.energy <= 30 ? "danger" : actor.energy <= 55 ? "watch" : "safe";
  const loyaltyTone = actor.loyalty <= 45 ? "danger" : actor.loyalty <= 65 ? "watch" : "safe";
  const agent = gameState.hiredAgents.find((entry) => entry.id === actor.id);
  const restCheck = getAgentRestCheck(actor.id, gameState);
  const salaryNegotiationCheck = getAgentSalaryNegotiationCheck(actor.id, gameState);
  const restCost = agent ? getAgentRestCost(agent) : {};
  const salaryNegotiationCost = agent ? getAgentSalaryNegotiationCost(agent) : {};
  const hasDirectCareAction = Boolean(agent && (restCheck.ok || salaryNegotiationCheck.ok));

  return (
    <div className={`office-actor-focus-panel actor-focus-${actor.state}`} aria-live="polite">
      <div>
        <span>{actor.focusLabel} · {kindLabel}</span>
        <strong>{actor.name}</strong>
        <small>{actor.assignmentLabel}</small>
      </div>
      <div className="actor-focus-meters">
        <span className={`meter-${energyTone}`}>
          체력 <i style={{ "--meter-value": `${actor.energy}%` } as CSSProperties} />
        </span>
        <span className={`meter-${loyaltyTone}`}>
          충성 <i style={{ "--meter-value": `${actor.loyalty}%` } as CSSProperties} />
        </span>
      </div>
      <button onClick={() => onOpenMenu(actor.targetMenu)} type="button">
        {actor.actionLabel}
      </button>
      {hasDirectCareAction && (
        <div className="actor-focus-care-actions" aria-label={`${actor.name} 직접 케어`}>
          {restCheck.ok && (
            <button
              onClick={() => onCareAction((current) => restAgent(actor.id, current))}
              title={`비용 ${formatCost(restCost)}`}
              type="button"
            >
              <strong>즉시 휴식</strong>
              <span>{formatCost(restCost)}</span>
            </button>
          )}
          {salaryNegotiationCheck.ok && (
            <button
              onClick={() => onCareAction((current) => negotiateAgentSalary(actor.id, current))}
              title={`비용 ${formatCost(salaryNegotiationCost)}`}
              type="button"
            >
              <strong>연봉 협상</strong>
              <span>{formatCost(salaryNegotiationCost)}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function RivalIncidentBanner({ gameState }: { gameState: GameState }) {
  const eventCompetitorId = gameState.currentRivalEvent?.competitor_id;
  const topCompetitorState = [...gameState.competitorStates].sort((a, b) => b.momentum - a.momentum || b.marketShare - a.marketShare)[0];
  const targetState = gameState.competitorStates.find((competitor) => competitor.id === eventCompetitorId) ?? topCompetitorState;
  const definition = competitors.find((competitor) => competitor.id === targetState?.id);

  if (!targetState || !definition) return null;

  const headline = gameState.currentRivalEvent
    ? t(gameState.currentRivalEvent.name_key)
    : `${t(definition.name_key)} ${targetState.marketShare}%`;
  const detail = gameState.currentRivalEvent
    ? t(gameState.currentRivalEvent.description_key)
    : `모멘텀 ${targetState.momentum} · 최근 움직임 ${targetState.lastMove}`;

  return (
    <div className="rival-incident-banner" style={{ "--rival-color": definition.color } as CSSProperties} aria-live="polite">
      <span>경쟁 속보</span>
      <strong>{headline}</strong>
      <small>{detail}</small>
    </div>
  );
}

function TurnGoalStrip({ guidance, onAction }: { guidance: GuidanceStep; onAction: () => void }) {
  return (
    <div className={`turn-goal-strip goal-${guidance.tone}`} aria-live="polite">
      <span>이번 달 목표</span>
      <strong>{guidance.title}</strong>
      <button onClick={onAction} type="button">
        {guidance.actionLabel}
      </button>
    </div>
  );
}

function AlphaRunFocusStrip({
  feedback,
  onStepOpen,
  progress,
  step,
}: {
  feedback?: string;
  onStepOpen: (step: AlphaRunRoadmapStep) => void;
  progress: number;
  step?: AlphaRunRoadmapStep;
}) {
  if (!step) return null;

  return (
    <div className={`alpha-run-focus-strip ${step.complete ? "complete" : ""}`} aria-label="현재 알파런 목표">
      <span>알파런 {progress}%</span>
      <div>
        <strong>{step.timeLabel} · {step.title}</strong>
        <small>다음 보상: {step.rewardPreview}</small>
      </div>
      <button
        aria-label={`${step.title} 목표 열기: ${step.actionLabel}`}
        className="alpha-run-focus-action"
        onClick={() => onStepOpen(step)}
        title={step.detail}
        type="button"
      >
        {step.actionLabel}
      </button>
      {feedback && <em className="alpha-run-feedback">{feedback}</em>}
    </div>
  );
}

function LaunchImpactPanel({
  summary,
  onOpenNextAction,
}: {
  summary: ReleaseImpactSummary;
  onOpenNextAction: (menu: ReleaseImpactSummary["nextActionSteps"][number]["menu"]) => void;
}) {
  const [extrasOpen, setExtrasOpen] = useState(true);
  const hasExtras =
    summary.momentHighlights.length > 0 ||
    summary.reviewSnippets.length > 0 ||
    summary.cardInfluences.length > 0;

  return (
    <div className="launch-impact-panel">
      <div>
        <strong>{summary.headline}</strong>
        <span>{summary.description}</span>
      </div>
      <div className="launch-impact-badges">
        {summary.badges.map((badge) => (
          <span key={badge}>{badge}</span>
        ))}
      </div>
      <div className="launch-next-action-ribbon" aria-label="출시 후 다음 행동: 보상 카드 선택, 성장 분기 선택, 다음 달 진행">
        {summary.nextActionSteps.map((step, index) => (
          <button className={`next-action-step target-${step.menu}`} key={step.id} onClick={() => onOpenNextAction(step.menu)} type="button">
            <strong>{index + 1}. {step.label}</strong>
            <small>{step.detail}</small>
          </button>
        ))}
      </div>
      <div className="launch-resource-list">
        {summary.resourceHighlights.map((highlight) => (
          <span className={highlight.amount > 0 ? "positive" : ""} key={highlight.resourceId}>
            {highlight.label} {highlight.amount > 0 ? "+" : ""}
            {highlight.amount.toLocaleString("ko-KR")}
          </span>
        ))}
      </div>
      {hasExtras && (
        <button
          aria-controls="launch-impact-extras"
          aria-expanded={extrasOpen}
          className="launch-impact-extras-toggle"
          onClick={() => setExtrasOpen((prev) => !prev)}
          type="button"
        >
          <span>카드 영향 / 출시 반응</span>
          <em>{extrasOpen ? "접기" : "보기"}</em>
        </button>
      )}
      {hasExtras && (
        <div
          aria-hidden={!extrasOpen}
          className={`launch-impact-extras${extrasOpen ? " open" : ""}`}
          id="launch-impact-extras"
        >
          {summary.momentHighlights.length > 0 && (
            <div className="launch-reaction-grid">
              {summary.momentHighlights.map((moment) => (
                <span className={`launch-reaction-card tone-${moment.tone}`} key={moment.id}>
                  <small>{moment.label}</small>
                  <strong>{moment.title}</strong>
                </span>
              ))}
            </div>
          )}
          <div className="launch-review-stack" aria-label="출시 반응">
            {summary.reviewSnippets.map((snippet) => (
              <span className={`launch-review-line tone-${snippet.tone}`} key={snippet.id}>
                <strong>{snippet.speaker}</strong>
                <em>{snippet.text}</em>
              </span>
            ))}
          </div>
          {summary.cardInfluences.length > 0 && (
            <div className="card-impact-list">
              {summary.cardInfluences.map((influence) => (
                <span key={influence.cardId}>
                  <strong>{influence.cardName}</strong>
                  <em className="card-impact-arrow" aria-hidden="true">→</em>
                  <span className="card-impact-effects">{influence.effects}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <small>{summary.nextAction}</small>
    </div>
  );
}

function OpeningFantasySignal({ locationName, officeName }: { locationName: string; officeName: string }) {
  return (
    <div className="opening-fantasy-signal" aria-label="첫 화면 게임 판타지">
      <div>
        <strong>{locationName} · {officeName}</strong>
        <span>사람과 AI 에이전트로 첫 제품을 만드는 창업 첫날</span>
      </div>
      <ul>
        <li>AI 회사 경영</li>
        <li>첫 제품 출시</li>
        <li>경쟁사 압박</li>
        <li>10년 성장</li>
      </ul>
    </div>
  );
}

function FirstHireFastStart({
  recommendation,
  onHire,
}: {
  recommendation: FirstHireRecommendation;
  onHire: () => void;
}) {
  const disabledReason = recommendation.check.reasons.join(" / ");

  return (
    <div className="first-hire-fast-start" aria-label="추천 첫 팀원">
      <div>
        <p className="eyebrow">알파 빠른 시작</p>
        <strong>{recommendation.title}: {recommendation.agent.name}</strong>
        <span>{recommendation.description}</span>
      </div>
      <div className="first-hire-fast-start-meta">
        <span>{recommendation.offer.qualityLabel}</span>
        <span>{recommendation.offer.riskLabel}</span>
        <span>영입 {formatCost(recommendation.offer.hireCost)}</span>
      </div>
      <button
        aria-label="첫 팀원 바로 고용"
        disabled={!recommendation.check.ok}
        onClick={onHire}
        title={disabledReason || "고용 후 제품 개발로 이동"}
        type="button"
      >
        {recommendation.actionLabel}
      </button>
    </div>
  );
}

function FirstProjectFastStart({
  recommendation,
  onStart,
}: {
  recommendation: FirstProjectRecommendation;
  onStart: () => void;
}) {
  const disabledReason = recommendation.check.reasons.join(" / ");

  return (
    <div className="first-project-fast-start" aria-label="추천 첫 제품">
      <div>
        <p className="eyebrow">첫 제품 러시</p>
        <strong>{recommendation.title}: {recommendation.product.name}</strong>
        <span>{recommendation.description}</span>
      </div>
      <div className="first-project-fast-start-meta">
        <span>예상 {recommendation.forecast.estimatedMonths}개월</span>
        <span>리뷰 {recommendation.forecast.expectedReviewGrade} / {recommendation.forecast.expectedReviewScore}점</span>
        <span>팀 {recommendation.assignedAgentIds.length}명</span>
      </div>
      <button
        aria-label="첫 제품 바로 개발"
        disabled={!recommendation.check.ok}
        onClick={onStart}
        title={disabledReason || "프로젝트 생성 후 덱으로 이동"}
        type="button"
      >
        {recommendation.actionLabel}
      </button>
    </div>
  );
}

function FirstIssueFastStart({
  recommendation,
  onResolve,
}: {
  recommendation: FirstDevelopmentIssueRecommendation;
  onResolve: () => void;
}) {
  const disabledReason = recommendation.check.reasons.join(" / ");
  const issueLabels = recommendation.tiles.map((tile) => tile.label).join(", ");

  return (
    <div className="first-issue-fast-start" aria-label="추천 첫 개발 이슈">
      <div>
        <p className="eyebrow">카드/이슈 러시</p>
        <strong>{recommendation.title}: {recommendation.product.name}</strong>
        <span>{recommendation.description}</span>
      </div>
      <div className="first-issue-fast-start-meta">
        <span>카드 {recommendation.card?.name ?? "준비됨"}</span>
        <span>이슈 {recommendation.selectedTileIds.length}/{recommendation.selectionLimit}</span>
        <span>{issueLabels}</span>
      </div>
      <button
        aria-label="첫 이슈 바로 해결"
        disabled={!recommendation.check.ok}
        onClick={onResolve}
        title={disabledReason || "추천 카드 적용 후 이슈 결과를 확인"}
        type="button"
      >
        {recommendation.actionLabel}
      </button>
    </div>
  );
}

function FirstRewardFastStart({
  recommendation,
  onChoose,
}: {
  recommendation: FirstRewardRecommendation;
  onChoose: () => void;
}) {
  const disabledReason = recommendation.check.reasons.join(" / ");

  return (
    <div className="first-reward-fast-start" aria-label="추천 첫 보상">
      <div>
        <p className="eyebrow">출시 보상 러시</p>
        <strong>{recommendation.title}: {recommendation.card.name}</strong>
        <span>{recommendation.description}</span>
      </div>
      <div className="first-reward-fast-start-meta">
        <span>{recommendation.productName}</span>
        <span>{recommendation.card.rarity}</span>
        <span>{recommendation.card.tags.slice(0, 3).join(" / ")}</span>
      </div>
      <button
        aria-label="첫 보상 바로 선택"
        disabled={!recommendation.check.ok}
        onClick={onChoose}
        title={disabledReason || "보상 카드를 덱에 넣고 성장 분기로 이동"}
        type="button"
      >
        {recommendation.actionLabel}
      </button>
    </div>
  );
}

function FirstGrowthFastStart({
  recommendation,
  onChoose,
}: {
  recommendation: FirstGrowthRecommendation;
  onChoose: () => void;
}) {
  const disabledReason = recommendation.check.reasons.join(" / ");

  return (
    <div className="first-growth-fast-start" aria-label="추천 성장 분기">
      <div>
        <p className="eyebrow">성장 분기 러시</p>
        <strong>{recommendation.title}: {recommendation.path.title}</strong>
        <span>{recommendation.description}</span>
      </div>
      <div className="first-growth-fast-start-meta">
        <span>{recommendation.path.actionLabel}</span>
        <span>{recommendation.path.bonusDescription}</span>
        <span>{recommendation.path.payoff}</span>
      </div>
      <button
        aria-label="성장 분기 바로 선택"
        disabled={!recommendation.check.ok}
        onClick={onChoose}
        title={disabledReason || "성장 분기를 고르고 다음 행동 메뉴로 이동"}
        type="button"
      >
        {recommendation.actionLabel}
      </button>
    </div>
  );
}

function WorkforceMixPanel({ summary }: { summary: WorkforceMixSummary }) {
  return (
    <div className="workforce-mix-panel" aria-label="인력 조합">
      <div>
        <strong>인력 조합</strong>
        <span>{summary.headline}</span>
      </div>
      <div className="workforce-mix-grid">
        {summary.rows.map((row) => (
          <span
            aria-label={row.kind === "human" ? "사람 직원" : row.kind === "robot" ? "로봇 인력" : "AI 에이전트"}
            className={`workforce-mix-row kind-${row.kind} emphasis-${row.emphasis}`}
            key={row.kind}
          >
            <span className="workforce-mix-row-heading">
              <strong>{row.label}</strong>
              <span className="workforce-mix-badge">{row.roleBadge}</span>
            </span>
            <small className="workforce-mix-status">{row.count}명 · {row.statusLabel}</small>
            <span className="workforce-mix-metric">{row.metricLabel}</span>
            <em className="workforce-mix-impact">{row.impactLabel}</em>
          </span>
        ))}
      </div>
      <small>
        {summary.activeSynergyLabels.length
          ? `활성 시너지: ${summary.activeSynergyLabels.slice(0, 2).join(" / ")}`
          : summary.nextSynergyLabel
            ? `다음 시너지: ${summary.nextSynergyLabel}`
            : "사람, AI, 로봇을 섞으면 제품 개발 보너스가 열립니다."}
      </small>
    </div>
  );
}

function BetaCompletionCrest({
  endingDiscovery,
  finale,
  summary,
}: {
  endingDiscovery?: CampaignEndingDiscovery;
  finale: CampaignFinale;
  summary: BetaReadinessSummary;
}) {
  const codexProgressLabel = endingDiscovery
    ? `${endingDiscovery.discoveredCountAfterRun}/${endingDiscovery.totalCount}`
    : summary.codexProgressLabel;
  const rewardProgressLabel = endingDiscovery
    ? `${endingDiscovery.discoveredRewardBonusAfterRun}/${endingDiscovery.totalRewardBonus}`
    : summary.rewardProgressLabel;
  const codexCompletionLabel = `${endingDiscovery?.completionPercentAfterRun ?? summary.readinessPercent}%`;
  const discoveryLabel = endingDiscovery
    ? endingDiscovery.alreadyDiscovered
      ? "기록 갱신"
      : "새 엔딩 발견"
    : summary.statusLabel;

  return (
    <article className={`beta-completion-crest rank-${finale.rank}`} aria-label="베타 완주 클로징">
      <div className="beta-completion-crest-main">
        <span className="beta-completion-medal">{finale.rank}</span>
        <div>
          <p className="eyebrow">베타 클로징</p>
          <h2>{finale.endingName}</h2>
          <span>{finale.survivedYears}년 완주 · {finale.score}점 · {discoveryLabel}</span>
        </div>
      </div>
      <small className="beta-completion-aftermath">
        {finale.aftermath.yearLabel} · {finale.aftermath.headline}
      </small>
      <div className="beta-completion-crest-grid">
        <span>
          <small>베타 준비</small>
          <strong>{summary.readinessPercent}%</strong>
          <em>{summary.statusLabel}</em>
        </span>
        <span>
          <small>엔딩 도감</small>
          <strong>{codexProgressLabel}</strong>
          <em>{codexCompletionLabel} 완성</em>
        </span>
        <span>
          <small>도감 보상</small>
          <strong>{rewardProgressLabel}</strong>
          <em>{endingDiscovery?.rewardDeltaLabel ?? summary.codexStatusLabel}</em>
        </span>
        <span>
          <small>다음 목표</small>
          <strong>{summary.nextTargetLabel}</strong>
          <em>{summary.nextTargetRouteLabel}</em>
        </span>
      </div>
    </article>
  );
}

function EndingReplayReadinessStrip({
  activeEndingReplayBrief,
  codexStatusLabel,
  endingNearMisses,
  endingRouteQuickStartDescription,
  endingRouteQuickStartLabel,
  hasEndingRouteQuickStart,
  nextTargetLabel,
  nextTargetRouteLabel,
  onRetryActiveEndingReplay,
  onStartEndingRouteRun,
  onStartNearMissRun,
  readinessPercent,
}: {
  activeEndingReplayBrief?: ActiveEndingReplayBrief;
  codexStatusLabel: string;
  endingNearMisses: EndingNearMissPlan[];
  endingRouteQuickStartDescription?: string;
  endingRouteQuickStartLabel?: string;
  hasEndingRouteQuickStart: boolean;
  nextTargetLabel: string;
  nextTargetRouteLabel: string;
  onRetryActiveEndingReplay: () => void;
  onStartEndingRouteRun: () => void;
  onStartNearMissRun: (replaySelection: RunModifierSelectionInput) => void;
  readinessPercent: number;
}) {
  const topNearMiss = endingNearMisses[0];
  const routeTargetLabel = endingRouteQuickStartLabel?.replace("엔딩 목표: ", "") ?? nextTargetRouteLabel ?? nextTargetLabel;
  const targetTitle = activeEndingReplayBrief?.title ?? topNearMiss?.title ?? routeTargetLabel;
  const targetDetail = activeEndingReplayBrief
    ? `${activeEndingReplayBrief.progressPercent}% · ${activeEndingReplayBrief.rewardStatusLabel}`
    : topNearMiss
      ? `${topNearMiss.progressPercent}% · ${topNearMiss.rewardStatusLabel}`
      : endingRouteQuickStartDescription ?? `다음 목표 루트: ${nextTargetRouteLabel}`;
  const actionLabel =
    activeEndingReplayBrief && !activeEndingReplayBrief.complete
      ? "목표 다시 도전"
      : hasEndingRouteQuickStart
        ? "목표 런 시작"
        : topNearMiss
          ? "근접 엔딩 재도전"
          : "다음 목표 대기";
  const actionDetail =
    activeEndingReplayBrief && !activeEndingReplayBrief.complete
      ? activeEndingReplayBrief.targetLabels.slice(0, 3).join(" / ")
      : hasEndingRouteQuickStart
        ? routeTargetLabel
        : topNearMiss
          ? topNearMiss.missingLabels.slice(0, 2).join(" / ") || topNearMiss.rewardStatusLabel
          : nextTargetLabel;
  const actionDisabled = !((activeEndingReplayBrief && !activeEndingReplayBrief.complete) || hasEndingRouteQuickStart || topNearMiss);

  const handleActionClick = () => {
    if (activeEndingReplayBrief && !activeEndingReplayBrief.complete) {
      onRetryActiveEndingReplay();
      return;
    }

    if (hasEndingRouteQuickStart) {
      onStartEndingRouteRun();
      return;
    }

    if (topNearMiss) {
      onStartNearMissRun(topNearMiss.replaySelection);
    }
  };

  return (
    <article className="ending-replay-readiness-strip" aria-label="엔딩 리플레이 다음 행동">
      <div className="ending-replay-readiness-copy">
        <p className="eyebrow">다음 도전 판단</p>
        <h2>엔딩/리플레이 준비 상황</h2>
        <p>결과에서 바로 이어갈 수 있는 목표를 한 줄로 고릅니다.</p>
      </div>
      <span className="ending-replay-readiness-metric">
        <small>베타 준비</small>
        <strong>{readinessPercent}%</strong>
        <em>{codexStatusLabel}</em>
      </span>
      <span className="ending-replay-readiness-metric">
        <small>우선 목표</small>
        <strong>{targetTitle}</strong>
        <em>{targetDetail}</em>
      </span>
      <button className="ending-replay-readiness-action" disabled={actionDisabled} onClick={handleActionClick} type="button">
        <small>근접 후보 {endingNearMisses.length}개</small>
        <strong>{actionLabel}</strong>
        <span>{actionDetail}</span>
      </button>
    </article>
  );
}

function BetaReadinessPanel({
  summary,
}: {
  summary: BetaReadinessSummary;
}) {
  return (
    <div className="beta-readiness-panel" aria-label="베타 준비 체크">
      <div className="beta-readiness-heading">
        <strong>베타 준비 체크</strong>
        <span>{summary.title}</span>
        <b>준비도 {summary.readinessPercent}% · {summary.statusLabel}</b>
      </div>
      <div className="beta-readiness-grid">
        <span>
          <strong>{summary.endingTotal}</strong>
          <small>결말 루트 · 결과 전용 {summary.resultOnlyTotal}</small>
        </span>
        <span>
          <strong>{summary.replayableTotal}</strong>
          <small>목표 엔딩</small>
        </span>
        <span>
          <strong>{summary.unlockHintLabel}</strong>
          <small>해금 안내 {summary.unlockHintCoveragePercent}%</small>
        </span>
        <span>
          <strong>{summary.routeAxisLabel}</strong>
          <small>루트 축 · {summary.routeOptionLabel}</small>
        </span>
      </div>
      <div className="beta-readiness-axis" aria-label="베타 엔딩 루트 커버리지">
        {summary.axes.map((axis) => (
          <span className={axis.complete ? "complete" : "partial"} key={axis.id}>
            <strong>{axis.label}</strong>
            <small>{axis.detail}</small>
          </span>
        ))}
      </div>
      <div className="beta-readiness-check-list" aria-label="베타 준비 항목">
        {summary.checks.map((check) => (
          <span className={check.complete ? "complete" : "partial"} key={check.id}>
            <strong>{check.label}</strong>
            <small>{check.detail}</small>
          </span>
        ))}
      </div>
      <small className="beta-readiness-next">
        준비 체크 {summary.completeCheckCount}/{summary.totalCheckCount} · {summary.codexStatusLabel} · 다음 도감 목표: {summary.nextTargetLabel}
      </small>
    </div>
  );
}

function AlphaRunRoadmap({
  onStepOpen,
  progress,
  roadmap,
}: {
  onStepOpen: (step: AlphaRunRoadmapStep) => void;
  progress: number;
  roadmap: AlphaRunRoadmapStep[];
}) {
  return (
    <div className="alpha-run-roadmap" aria-label="30분 알파런 로드맵">
      <div className="alpha-run-roadmap-heading">
        <div>
          <strong>30분 알파런</strong>
          <span>첫 출시에서 2년차 신제품까지</span>
        </div>
        <b>{progress}%</b>
      </div>
      <ol>
        {roadmap.map((step) => (
          <li className={[step.complete ? "complete" : "", step.active ? "active" : ""].filter(Boolean).join(" ")} key={step.id}>
            <button
              aria-label={`${step.timeLabel} ${step.title}: ${step.actionLabel}`}
              className="roadmap-step-button"
              onClick={() => onStepOpen(step)}
              title={`${step.detail} · ${step.actionLabel}`}
              type="button"
            >
              <span className="alpha-run-time">{step.timeLabel}</span>
              <strong>{step.title}</strong>
              <small>{step.detail}</small>
              <span className="alpha-run-action">{step.actionLabel}</span>
              <em>다음 보상: {step.rewardPreview}</em>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AlphaRunCompletionPanel({
  completion,
  onOpen,
}: {
  completion: AlphaRunCompletionSummary;
  onOpen: (completion: AlphaRunCompletionSummary) => void;
}) {
  return (
    <div className="alpha-run-completion-panel" aria-label="30분 알파런 완료">
      <div>
        <p className="eyebrow">알파런 완료</p>
        <strong>{completion.title}</strong>
        <span>{completion.description}</span>
      </div>
      <small>{completion.statusLabel}</small>
      <button onClick={() => onOpen(completion)} type="button">
        {completion.nextActionLabel}
      </button>
    </div>
  );
}

function AlphaRunDebriefPanel({ summary }: { summary: AlphaRunDebriefSummary }) {
  return (
    <div className="alpha-run-debrief-panel" aria-label="30분 알파런 디브리프">
      <div className="alpha-run-debrief-heading">
        <div>
          <p className="eyebrow">{summary.statusLabel}</p>
          <strong>{summary.title}</strong>
          <span>{summary.subtitle}</span>
        </div>
      </div>
      <ol className="alpha-run-debrief-grid">
        {summary.highlights.map((highlight) => (
          <li className={`debrief-${highlight.id}`} key={highlight.id}>
            <span>{highlight.label}</span>
            <strong>{highlight.value}</strong>
            <small>{highlight.detail}</small>
          </li>
        ))}
      </ol>
      <ol className="alpha-run-debrief-timeline" aria-label="알파런 핵심 장면">
        {summary.moments.map((moment) => (
          <li className={`moment-${moment.id}`} key={moment.id}>
            <span>{moment.label}</span>
            <strong>{moment.title}</strong>
            <small>{moment.detail}</small>
          </li>
        ))}
      </ol>
      <div className="alpha-run-debrief-checklist" aria-label="완주 확인 체크리스트">
        {summary.checklist.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function GuidancePanel({
  alphaRunRoadmap,
  alphaRunRoadmapProgress,
  alphaRunCompletion,
  alphaRunDebrief,
  betaReadinessSummary,
  firstTenMinutePlan,
  firstTenMinuteProgress,
  firstHireRecommendation,
  firstGrowthRecommendation,
  firstIssueRecommendation,
  firstProjectRecommendation,
  firstRewardRecommendation,
  guidance,
  objectives,
  openingFantasy,
  onAction,
  onFastHire,
  onFastGrowth,
  onFastIssue,
  onFastProject,
  onFastReward,
  onOpenAlphaRunCompletion,
  onRoadmapStepOpen,
  workforceMix,
}: {
  alphaRunRoadmap: AlphaRunRoadmapStep[];
  alphaRunRoadmapProgress: number;
  alphaRunCompletion?: AlphaRunCompletionSummary;
  alphaRunDebrief?: AlphaRunDebriefSummary;
  betaReadinessSummary: BetaReadinessSummary;
  firstTenMinutePlan: FirstTenMinuteStep[];
  firstTenMinuteProgress: number;
  firstHireRecommendation?: FirstHireRecommendation;
  firstGrowthRecommendation?: FirstGrowthRecommendation;
  firstIssueRecommendation?: FirstDevelopmentIssueRecommendation;
  firstProjectRecommendation?: FirstProjectRecommendation;
  firstRewardRecommendation?: FirstRewardRecommendation;
  guidance: GuidanceStep;
  objectives: OpeningObjective[];
  openingFantasy?: { locationName: string; officeName: string };
  onAction: () => void;
  onFastHire: () => void;
  onFastGrowth: () => void;
  onFastIssue: () => void;
  onFastProject: () => void;
  onFastReward: () => void;
  onOpenAlphaRunCompletion: (completion: AlphaRunCompletionSummary) => void;
  onRoadmapStepOpen: (step: AlphaRunRoadmapStep) => void;
  workforceMix: WorkforceMixSummary;
}) {
  const primaryAction = firstHireRecommendation
    ? onFastHire
    : firstProjectRecommendation
      ? onFastProject
      : firstIssueRecommendation
        ? onFastIssue
        : firstRewardRecommendation
          ? onFastReward
          : firstGrowthRecommendation
            ? onFastGrowth
            : onAction;
  const primaryActionLabel =
    firstHireRecommendation?.actionLabel
    ?? firstProjectRecommendation?.actionLabel
    ?? firstIssueRecommendation?.actionLabel
    ?? firstRewardRecommendation?.actionLabel
    ?? firstGrowthRecommendation?.actionLabel
    ?? guidance.actionLabel;

  return (
    <article className={`guidance-card guidance-${guidance.tone}`}>
      <BetaReadinessPanel summary={betaReadinessSummary} />
      <div>
        <p className="eyebrow">{guidance.priorityLabel ?? "다음 목표"}</p>
        <h2>{guidance.title}</h2>
        <p>{guidance.description}</p>
        {guidance.helperText && <small>{guidance.helperText}</small>}
      </div>
      <button onClick={primaryAction}>{primaryActionLabel}</button>
      <AlphaRunRoadmap onStepOpen={onRoadmapStepOpen} roadmap={alphaRunRoadmap} progress={alphaRunRoadmapProgress} />
      {alphaRunCompletion && <AlphaRunCompletionPanel completion={alphaRunCompletion} onOpen={onOpenAlphaRunCompletion} />}
      {alphaRunDebrief && <AlphaRunDebriefPanel summary={alphaRunDebrief} />}
      {firstHireRecommendation && <FirstHireFastStart recommendation={firstHireRecommendation} onHire={onFastHire} />}
      {firstProjectRecommendation && <FirstProjectFastStart recommendation={firstProjectRecommendation} onStart={onFastProject} />}
      {firstIssueRecommendation && <FirstIssueFastStart recommendation={firstIssueRecommendation} onResolve={onFastIssue} />}
      {firstRewardRecommendation && <FirstRewardFastStart recommendation={firstRewardRecommendation} onChoose={onFastReward} />}
      {firstGrowthRecommendation && <FirstGrowthFastStart recommendation={firstGrowthRecommendation} onChoose={onFastGrowth} />}
      {openingFantasy && <OpeningFantasySignal locationName={openingFantasy.locationName} officeName={openingFantasy.officeName} />}
      <WorkforceMixPanel summary={workforceMix} />
      <div className="first-ten-minute-roadmap">
        <div>
          <strong>첫 10분 루프</strong>
          <span>{firstTenMinuteProgress}%</span>
        </div>
        <ol>
          {firstTenMinutePlan.map((step) => (
            <li className={[step.complete ? "complete" : "", step.active ? "active" : ""].filter(Boolean).join(" ")} key={step.id}>
              <span>{step.label}</span>
              <small>{step.detail}</small>
            </li>
          ))}
        </ol>
      </div>
      <ol className="objective-strip">
        {objectives.map((objective) => (
          <li className={objective.complete ? "complete" : ""} key={objective.id}>
            {objective.label}
          </li>
        ))}
      </ol>
    </article>
  );
}

type EventPanelSignalTone = "staff" | "rival" | "world";

const eventPanelSignalClasses: Record<EventPanelSignalTone, string> = {
  rival: "event-signal-rival",
  staff: "event-signal-staff",
  world: "event-signal-world",
};

function EventPanelSignal({ tone }: { tone: EventPanelSignalTone }) {
  return (
    <span aria-hidden="true" className={`event-panel-signal ${eventPanelSignalClasses[tone]}`}>
      <i />
      <b />
      <em />
    </span>
  );
}

export function EventPanels({
  gameState,
  setGameState,
  locale,
  onWorldRevealVisibilityChange,
}: {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  locale: LocaleCode;
  onWorldRevealVisibilityChange?: (visible: boolean) => void;
}) {
  const staffIncidents = getStaffIncidentBriefs(gameState);
  const primaryStaffIncident = staffIncidents[0];
  const primaryStaffIncidentOptions = primaryStaffIncident ? getStaffIncidentResolutionOptions(primaryStaffIncident.id, gameState) : [];
  const currentRivalDefinition = competitors.find((competitor) => competitor.id === gameState.currentRivalEvent?.competitor_id);

  return (
    <>
      <BigEventModal gameState={gameState} setGameState={setGameState} locale={locale} />
      <WorldRevealModal gameState={gameState} onVisibilityChange={onWorldRevealVisibilityChange} />
      <PayoffCelebrationModal gameState={gameState} setGameState={setGameState} />
      {primaryStaffIncident && (
        <section
          className={`event-panel staff-event-panel incident-screen-moment severity-${primaryStaffIncident.severity}`}
          aria-label="직원 사건"
        >
          <EventPanelSignal tone="staff" />
          <div className="event-panel-copy">
            <p className="eyebrow">직원 화면 사건</p>
            <h2>{primaryStaffIncident.title}</h2>
            <p>{primaryStaffIncident.description}</p>
            <small className="event-moment-meta">{primaryStaffIncident.triggerLabel}</small>
            {primaryStaffIncident.aftermathLabel && <small className="event-moment-meta warning">{primaryStaffIncident.aftermathLabel}</small>}
          </div>
          <div className="event-choices staff-event-actions">
            {primaryStaffIncidentOptions.map((option) => (
              <button
                className={option.recommended ? "recommended" : undefined}
                disabled={!option.available || gameState.status !== "playing"}
                key={option.id}
                onClick={() => setGameState((current) => resolveStaffIncident(primaryStaffIncident.id, option.id, current))}
                title={option.available ? `${option.description} · ${option.effectLabel}` : option.reasons.join(" / ")}
                type="button"
              >
                <strong>{option.label}</strong>
                <span className="event-choice-summary">{option.effectLabel}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {gameState.currentRivalEvent && (
        <section className="event-panel rival-event-panel incident-screen-moment" aria-label="경쟁사 이벤트">
          <EventPanelSignal tone="rival" />
          <div className="event-panel-copy">
            <p className="eyebrow">경쟁사 화면 사건</p>
            <h2>{t(gameState.currentRivalEvent.name_key, locale)}</h2>
            <p>{t(gameState.currentRivalEvent.description_key, locale)}</p>
            <small className="event-moment-meta">
              {currentRivalDefinition
                ? `${t(currentRivalDefinition.name_key, locale)} · ${t(currentRivalDefinition.archetype_key, locale)}`
                : "경쟁사 압박"}
            </small>
          </div>
          <div className="event-choices">
            {gameState.currentRivalEvent.choices.map((choice) => (
              <button key={choice.id} onClick={() => setGameState((current) => resolveRivalEventChoice(choice, current))}>
                <strong>{t(choice.text_key, locale)}</strong>
                <span className="event-choice-summary">{t(choice.description_key, locale)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {gameState.currentEvent && (
        <section className="event-panel" aria-label="월간 이벤트">
          <EventPanelSignal tone="world" />
          <div className="event-panel-copy">
            <p className="eyebrow">긴급 이슈</p>
            <h2>{gameState.currentEvent.name}</h2>
            <p>{gameState.currentEvent.description}</p>
          </div>
          <div className="event-choices">
            {gameState.currentEvent.choices.map((choice) => (
              <button key={choice.id} onClick={() => setGameState((current) => resolveEventChoice(choice, current))}>
                <strong>{choice.text}</strong>
                <span className="event-choice-summary">{choice.description}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export function CommandRow({
  gameState,
  setGameState,
  onSave,
  onLoad,
}: {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  onSave: () => void;
  onLoad: () => void;
}) {
  const activeProducts = getAvailableProductDefinitions(gameState).filter((product) => gameState.activeProducts.includes(product.id));

  return (
    <section className="command-row pixel-command-console" aria-label="주요 명령">
      <span aria-hidden="true" className="command-console-lights">
        <i />
        <b />
        <em />
      </span>
      <span aria-hidden="true" className="command-turn-meter">
        <i />
      </span>
      <button
        aria-label="다음 달 진행"
        className="primary-action command-action"
        onClick={() => setGameState((current) => advanceMonth(current))}
      >
        <CommercialUiIcon className="command-icon" iconId="next" />
        <span>다음 달</span>
      </button>
      <StrategyHand gameState={gameState} />
      <button aria-label="새 게임" className="secondary-action command-action" onClick={() => setGameState(createInitialState())}>
        <CommercialUiIcon className="command-icon" iconId="newGame" />
        <span>새 게임</span>
      </button>
      <button aria-label="저장" className="secondary-action command-action" onClick={onSave}>
        <CommercialUiIcon className="command-icon" iconId="save" />
        <span>저장</span>
      </button>
      <button aria-label="불러오기" className="secondary-action command-action" onClick={onLoad}>
        <CommercialUiIcon className="command-icon" iconId="load" />
        <span>불러오기</span>
      </button>
      <p>활성 제품: {activeProducts.length ? activeProducts.map((product) => product.name).join(", ") : "없음"}.</p>
    </section>
  );
}

function StrategyHand({ gameState }: { gameState: GameState }) {
  const hand = gameState.roguelite.deck.hand.slice(0, 5);

  return (
    <div className="strategy-hand" aria-label="전략 손패">
      <span className="hand-count">
        손패 {gameState.roguelite.deck.hand.length} · 덱 {gameState.roguelite.deck.drawPile.length} · 버림{" "}
        {gameState.roguelite.deck.discardPile.length}
      </span>
      {hand.length ? (
        hand.map((cardId) => {
          const card = getStrategyCardById(cardId);
          const primaryCost = Object.entries(card?.cost ?? {})[0];

          return (
            <span className={`strategy-hand-card rarity-${card?.rarity ?? "starter"}`} key={cardId} title={card?.description ?? cardId}>
              <i aria-hidden="true" className="strategy-card-contact" />
              <strong>{card?.name ?? cardId}</strong>
              <small>{primaryCost ? `${resources[primaryCost[0]]?.name ?? primaryCost[0]} ${primaryCost[1]}` : "비용 없음"}</small>
            </span>
          );
        })
      ) : (
        <span className="strategy-hand-card empty">
          <i aria-hidden="true" className="strategy-card-contact" />
          <strong>전략 대기</strong>
          <small>다음 달에 손패 갱신</small>
        </span>
      )}
    </div>
  );
}

export function MainMenu({
  activeMenu,
  setActiveMenu,
}: {
  activeMenu: MenuId;
  setActiveMenu: Dispatch<SetStateAction<MenuId>>;
}) {
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const isMoreActive = secondaryMenuIds.includes(activeMenu);
  const handleMenuClick = (menuId: MenuId) => {
    setActiveMenu(menuId);
    setMobileMoreOpen(false);
  };
  const renderMenuButton = (menuId: MenuId, className = "") => {
    const menu = getMenuById(menuId);
    if (!menu) return null;

    return (
      <button
        className={[activeMenu === menu.id ? "active" : "", `menu-group-${menu.group}`, className].filter(Boolean).join(" ")}
        key={menu.id}
        onClick={() => handleMenuClick(menu.id)}
        type="button"
      >
        <CommercialUiIcon className="menu-icon" iconId={menuIconIds[menu.id]} />
        <strong>{menu.label}</strong>
        <span>{menu.hint}</span>
      </button>
    );
  };

  return (
    <nav className="main-menu">
      <div className="mobile-tab-bar" aria-label="핵심 메뉴">
        {mobileTabMenuIds.map((menuId) => renderMenuButton(menuId, "mobile-tab-button"))}
        <button
          aria-expanded={mobileMoreOpen}
          className={[isMoreActive ? "active" : "", "mobile-tab-button", "more-tab"].filter(Boolean).join(" ")}
          onClick={() => setMobileMoreOpen((current) => !current)}
          type="button"
        >
          <CommercialUiIcon className="menu-icon" iconId="result" />
          <strong>더보기</strong>
          <span>보조</span>
        </button>
      </div>
      <div className={`mobile-more-menu ${mobileMoreOpen ? "open" : ""}`} aria-label="보조 메뉴">
        {secondaryMenuIds.map((menuId) => renderMenuButton(menuId, "mobile-more-button"))}
      </div>
      <div className="menu-priority-cluster primary-menu-cluster" aria-label="핵심 메뉴">
        <span className="menu-group-label">핵심</span>
        {primaryMenuIds.map((menuId) => renderMenuButton(menuId))}
      </div>
      <div className="menu-priority-cluster secondary-menu-cluster" aria-label="보조 메뉴">
        <span className="menu-group-label">보조</span>
        {secondaryMenuIds.map((menuId) => renderMenuButton(menuId))}
      </div>
    </nav>
  );
}

export function MenuLauncherBar({
  activeMenu,
  onOpen,
}: {
  activeMenu: MenuId | null;
  onOpen: Dispatch<SetStateAction<MenuId>>;
}) {
  return (
    <nav className="menu-launcher-bar" aria-label="하단 경영 메뉴 런처">
      {menuLauncherGroupOrder.map((group) => {
        const groupMenus = menus.filter((menu) => menu.group === group);

        return (
          <div className={`menu-launcher-group menu-launcher-group-${group}`} key={group}>
            <span className="menu-launcher-group-label">{menuGroupLabels[group]}</span>
            <div className="menu-launcher-buttons">
              {groupMenus.map((menu) => (
                <button
                  aria-label={`메뉴 열기: ${menu.label}`}
                  aria-pressed={activeMenu === menu.id}
                  className={["menu-launcher-button", activeMenu === menu.id ? "active" : "", `menu-group-${menu.group}`].filter(Boolean).join(" ")}
                  data-menu-id={menu.id}
                  key={menu.id}
                  onClick={() => onOpen(menu.id)}
                  type="button"
                >
                  <CommercialUiIcon className="menu-icon" iconId={menuIconIds[menu.id]} />
                  <strong>{menu.label}</strong>
                  <span>{menu.hint}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

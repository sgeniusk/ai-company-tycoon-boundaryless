import { Fragment, useEffect, useState, type CSSProperties, type Dispatch, type SetStateAction } from "react";
import { agentTypes, assetManifest, competitors, domains, resources } from "../game/data";
import { getStrategyCardById } from "../game/deckbuilding";
import {
  getFirstTenMinutePlan,
  getFirstTenMinuteProgress,
  getGuidanceStep,
  getOpeningObjectives,
  type FirstTenMinuteStep,
  type GuidanceStep,
  type OpeningObjective,
} from "../game/guidance";
import { resetRunWithMetaUnlocks } from "../game/meta-progression";
import { getReleaseImpactSummary, type ReleaseImpactSummary } from "../game/release-impact";
import { getRunSummary } from "../game/run-summary";
import { getCampaignCalendar, getCampaignFinale, getCompanyStageProgress, getCompanyStarRating, getCurrentLocation, getDayPhase } from "../game/campaign";
import {
  advanceMonth,
  chooseGrowthPath,
  createInitialState,
  formatResource,
  getCompanyStage,
  getAiOperationCapacity,
  getAvailableProductDefinitions,
  getOfficeDecorationSlots,
  getOfficeExpansion,
  getOfficeHireCapacity,
  getPlacedOfficeItems,
  getPlayerMarketShare,
  resolveEventChoice,
  resolveRivalEventChoice,
} from "../game/simulation";
import type { GameState, ReleaseGrowthPath } from "../game/types";
import { t, type LocaleCode } from "../i18n";
import { formatEffects, statusLabel } from "../ui/formatters";
import { menuGroupLabels, menus, orderedResourceIds, type MenuId } from "../ui/menu";

function assetPaletteVars(palette?: string[]): CSSProperties {
  if (!palette?.length) return {};

  return {
    "--sprite-primary": palette[0],
    "--sprite-secondary": palette[1] ?? palette[0],
    "--sprite-accent": palette[2] ?? palette[0],
  } as CSSProperties;
}

function getAgentSprite(agentTypeId?: string) {
  if (!agentTypeId) return undefined;
  return assetManifest.agent_sprites.find((sprite) => sprite.agent_type_id === agentTypeId);
}

type StageSideTabId = "guide" | "company" | "reports" | "results";

const stageSideTabs: { id: StageSideTabId; label: string }[] = [
  { id: "guide", label: "목표" },
  { id: "company", label: "회사" },
  { id: "reports", label: "월간" },
  { id: "results", label: "결과" },
];

const priorityResourceIds = new Set(["cash", "users", "trust", "compute"]);

function getMonthlyResourceDelta(gameState: GameState, resourceId: string) {
  const report = gameState.lastMonthReport;
  if (!report) return 0;

  const baseDelta: Record<string, number> = {
    cash: report.revenue - report.totalCost,
    users: report.newUsers,
    data: report.generatedData,
    compute: -report.computePressure,
  };

  return (baseDelta[resourceId] ?? 0) + (report.strategyEffects?.[resourceId] ?? 0);
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

  return (
    <section className="top-bar" aria-label="회사 상태">
      <div>
        <p className="eyebrow">AI 컴퍼니 타이쿤 알파</p>
        <h1>경계 없는 회사</h1>
      </div>
      <div className="top-status-area">
        <div className="status-cluster">
          <span className="status-pill">{calendar.year}년 {calendar.monthOfYear}월</span>
          <span className="status-pill">{getCompanyStarRating(gameState)}성</span>
          <span className="status-pill">{phase.label}</span>
          <span className="status-pill">{location.region}</span>
          <span className={`status-pill ${gameState.status}`}>{statusLabel(gameState.status)}</span>
          <span className="status-pill">출시 가능 {launchableCount}</span>
          <span className="status-pill">개발 중 {gameState.productProjects.length}</span>
          <span className="status-pill">런 {gameState.roguelite.runNumber}</span>
          <span className="status-pill">통찰 {gameState.roguelite.founderInsight}</span>
          <span className="status-pill">점유 {getPlayerMarketShare(gameState)}%</span>
          {qaScenarioLabel && <span className="status-pill qa-pill">{qaScenarioLabel}</span>}
          <button className="locale-toggle" onClick={onToggleLocale}>
            {locale.toUpperCase()}
          </button>
        </div>
        <CompetitorHudStrip gameState={gameState} locale={locale} />
      </div>
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
      {topCompetitors.map(({ state, definition }) => (
        <span key={state.id} style={{ "--rival-color": definition?.color } as CSSProperties}>
          {t(definition?.name_key ?? state.id, locale)} {state.marketShare}%
        </span>
      ))}
    </div>
  );
}

export function GameStage({
  gameState,
  setGameState,
  setActiveMenu,
}: {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  setActiveMenu: Dispatch<SetStateAction<MenuId>>;
}) {
  const companyStage = getCompanyStage(gameState);
  const guidance = getGuidanceStep(gameState);
  const openingObjectives = getOpeningObjectives(gameState);
  const firstTenMinutePlan = getFirstTenMinutePlan(gameState);
  const firstTenMinuteProgress = getFirstTenMinuteProgress(gameState);
  const availableProducts = getAvailableProductDefinitions(gameState);
  const activeProducts = availableProducts.filter((product) => gameState.activeProducts.includes(product.id));
  const activeProject = gameState.productProjects[0];
  const activeProjectProduct = activeProject ? availableProducts.find((product) => product.id === activeProject.productId) : undefined;
  const officeExpansion = getOfficeExpansion(gameState);
  const placedOfficeItems = getPlacedOfficeItems(gameState);
  const placedOfficeItemIds = new Set(placedOfficeItems.map((item) => item.id));
  const officeHireCapacity = getOfficeHireCapacity(gameState);
  const officeDecorationSlots = getOfficeDecorationSlots(gameState);
  const unlockedDomainNames = domains
    .filter((domain) => gameState.unlockedDomains.includes(domain.id))
    .map((domain) => domain.name);
  const officeObjects = assetManifest.office_objects
    .filter((object) => !object.linked_item_id || placedOfficeItemIds.has(object.linked_item_id))
    .slice(0, Math.min(7, officeDecorationSlots + 3));
  const chosenGrowthPathId = gameState.chosenGrowthPath?.id;
  const runSummary = getRunSummary(gameState);
  const releaseImpact = getReleaseImpactSummary(gameState);
  const calendar = getCampaignCalendar(gameState);
  const finale = getCampaignFinale(gameState);
  const stageProgress = getCompanyStageProgress(gameState);
  const phase = getDayPhase(gameState);
  const location = getCurrentLocation(gameState);
  const officeHudProjectLabel = activeProject && activeProjectProduct ? activeProjectProduct.name : "개발 대기";
  const officeHudProjectMeta = activeProject
    ? `진행 ${Math.round(activeProject.progress)}% · 완성도 ${Math.round(activeProject.quality)}`
    : gameState.currentEvent
      ? "긴급 이슈 우선 처리"
      : "제품/인력 선택 필요";
  const officeAlertTitle = gameState.currentEvent ? "긴급 이슈" : activeProject ? "개발 중" : "운영 대기";
  const officeAlertText = gameState.currentEvent
    ? gameState.currentEvent.name
    : activeProject && activeProjectProduct
      ? `${activeProjectProduct.name} 출시까지 ${Math.max(0, 100 - Math.round(activeProject.progress))}%`
      : guidance.actionLabel;
  const growthPathCardClass = (pathId: string) =>
    ["growth-path-card", chosenGrowthPathId === pathId ? "selected" : "", chosenGrowthPathId && chosenGrowthPathId !== pathId ? "locked" : ""]
      .filter(Boolean)
      .join(" ");
  const [activeStageTab, setActiveStageTab] = useState<StageSideTabId>("guide");
  const hasResultPanel = finale.isFinal || Boolean(gameState.lastRelease) || runSummary.isFinal;

  useEffect(() => {
    if (hasResultPanel) setActiveStageTab("results");
  }, [hasResultPanel, gameState.lastRelease?.month, gameState.lastRelease?.productId, runSummary.isFinal, finale.isFinal]);

  const getStageTabHint = (tabId: StageSideTabId) => {
    if (tabId === "guide") return `${firstTenMinuteProgress}%`;
    if (tabId === "company") return `${getCompanyStarRating(gameState)}성`;
    if (tabId === "reports") return gameState.lastMonthReport ? "보고 있음" : "대기";
    return hasResultPanel ? "새 소식" : "대기";
  };

  const handleGuidanceAction = () => {
    if (guidance.id === "advance_project") {
      setGameState((current) => advanceMonth(current));
      return;
    }
    if (guidance.id === "recover_failure") {
      setGameState(createInitialState());
      return;
    }
    if (guidance.menu) setActiveMenu(guidance.menu);
  };

  const handleStartNextRun = () => {
    setGameState((current) => resetRunWithMetaUnlocks(current));
    setActiveMenu("deck");
  };

  const handleGrowthPathClick = (path: ReleaseGrowthPath) => {
    if (!chosenGrowthPathId) {
      setGameState((current) => chooseGrowthPath(path.id, current));
    }
    setActiveMenu(path.targetMenu);
  };

  return (
    <section className="game-stage" aria-label="AI 회사 사무실">
      <div className={`office-scene office-level-${officeExpansion.level} office-phase-${phase.id}`}>
        <div className="office-wall">
          <span>{location.name}</span>
          <span>TEAM {gameState.hiredAgents.length}/{officeHireCapacity}</span>
          <span>AI OPS {getAiOperationCapacity(gameState)}</span>
        </div>
        <div className="office-floor">
          <div className="office-object-layer" aria-hidden="true">
            {officeObjects.map((object, index) => (
              <span
                className={`office-object office-object-${index} object-${object.object_id}`}
                style={assetPaletteVars(object.palette)}
                key={object.object_id}
              />
            ))}
          </div>
          <div className="office-hud" aria-label="사무실 빠른 상태">
            <span>
              <strong>{calendar.year}년 {calendar.monthOfYear}월</strong>
              <small>{phase.label}</small>
            </span>
            <span>
              <strong>{officeExpansion.name}</strong>
              <small>
                고용 {gameState.hiredAgents.length}/{officeHireCapacity} · 장식 {placedOfficeItems.length}/{officeDecorationSlots}
              </small>
            </span>
            <span>
              <strong>{officeHudProjectLabel}</strong>
              <small>{officeHudProjectMeta}</small>
            </span>
          </div>
          {gameState.hiredAgents.length
            ? gameState.hiredAgents.slice(0, Math.min(12, officeHireCapacity)).map((agent, index) => {
                const agentType = agentTypes.find((type) => type.id === agent.typeId);
                const agentSprite = getAgentSprite(agent.typeId);

                return (
                  <span
                    className={`staff-sprite staff-${index} ${agent.assignment ? "working" : "idle"} ${agentSprite?.body_class ?? ""}`}
                    key={agent.id}
                    style={assetPaletteVars(agentSprite?.palette)}
                    title={`${agent.name} · ${agentType?.role ?? "에이전트"} · ${agent.assignment ? "제품 개발 중" : "대기 중"}`}
                  >
                    <b>{agent.name.slice(0, 3)}</b>
                  </span>
                );
              })
            : Array.from({ length: Math.min(3, Math.max(1, gameState.resources.talent || 1)) }).map((_, index) => (
                <span className={`staff-sprite staff-${index} idle`} key={index}>
                  <b>대기</b>
                </span>
              ))}
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
          <TurnGoalStrip guidance={guidance} onAction={handleGuidanceAction} />
          <div className="office-alert-strip" aria-live="polite">
            <strong>{officeAlertTitle}</strong>
            <span>{officeAlertText}</span>
          </div>
        </div>
      </div>

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
              firstTenMinutePlan={firstTenMinutePlan}
              firstTenMinuteProgress={firstTenMinuteProgress}
              guidance={guidance}
              objectives={openingObjectives}
              onAction={handleGuidanceAction}
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
                사무실 {officeExpansion.name} · 고용 {gameState.hiredAgents.length}/{officeHireCapacity} · 장식 {placedOfficeItems.length}/{officeDecorationSlots}
              </span>
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
                </dl>
              ) : (
                <p>제품을 출시하고 다음 달로 넘기면 첫 성과 보고가 올라옵니다.</p>
              )}
            </article>
          )}
          {activeStageTab === "results" && (
            <>
              {finale.isFinal && (
                <article className={`run-summary rank-${finale.rank}`}>
                  <p className="eyebrow">10년 엔딩</p>
                  <div className="run-rank">
                    <strong>{finale.rank}</strong>
                    <span>{finale.endingName} · {finale.score}점</span>
                  </div>
                  <h2>{finale.title}</h2>
                  <p>{finale.verdict}</p>
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
                  {releaseImpact && <LaunchImpactPanel summary={releaseImpact} />}
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

function LaunchImpactPanel({ summary }: { summary: ReleaseImpactSummary }) {
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
      <div className="launch-resource-list">
        {summary.resourceHighlights.map((highlight) => (
          <span className={highlight.amount > 0 ? "positive" : ""} key={highlight.resourceId}>
            {highlight.label} {highlight.amount > 0 ? "+" : ""}
            {highlight.amount.toLocaleString("ko-KR")}
          </span>
        ))}
      </div>
      {summary.cardInfluences.length > 0 && (
        <div className="card-impact-list">
          {summary.cardInfluences.map((influence) => (
            <span key={influence.cardId}>
              <strong>{influence.cardName}</strong>
              {influence.effects}
            </span>
          ))}
        </div>
      )}
      <small>{summary.nextAction}</small>
    </div>
  );
}

function GuidancePanel({
  firstTenMinutePlan,
  firstTenMinuteProgress,
  guidance,
  objectives,
  onAction,
}: {
  firstTenMinutePlan: FirstTenMinuteStep[];
  firstTenMinuteProgress: number;
  guidance: GuidanceStep;
  objectives: OpeningObjective[];
  onAction: () => void;
}) {
  return (
    <article className={`guidance-card guidance-${guidance.tone}`}>
      <div>
        <p className="eyebrow">{guidance.priorityLabel ?? "다음 목표"}</p>
        <h2>{guidance.title}</h2>
        <p>{guidance.description}</p>
        {guidance.helperText && <small>{guidance.helperText}</small>}
      </div>
      <button onClick={onAction}>{guidance.actionLabel}</button>
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

export function EventPanels({
  gameState,
  setGameState,
  locale,
}: {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  locale: LocaleCode;
}) {
  return (
    <>
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
    <section className="command-row" aria-label="주요 명령">
      <button className="primary-action" onClick={() => setGameState((current) => advanceMonth(current))}>
        다음 달
      </button>
      <StrategyHand gameState={gameState} />
      <button className="secondary-action" onClick={() => setGameState(createInitialState())}>
        새 게임
      </button>
      <button className="secondary-action" onClick={onSave}>
        저장
      </button>
      <button className="secondary-action" onClick={onLoad}>
        불러오기
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
              <strong>{card?.name ?? cardId}</strong>
              <small>{primaryCost ? `${resources[primaryCost[0]]?.name ?? primaryCost[0]} ${primaryCost[1]}` : "비용 없음"}</small>
            </span>
          );
        })
      ) : (
        <span className="strategy-hand-card empty">
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
  return (
    <nav className="main-menu">
      {menus.map((menu, index) => (
        <Fragment key={menu.id}>
          {(index === 0 || menus[index - 1].group !== menu.group) && (
            <span className="menu-group-label">{menuGroupLabels[menu.group]}</span>
          )}
          <button
            className={[activeMenu === menu.id ? "active" : "", `menu-group-${menu.group}`].filter(Boolean).join(" ")}
            onClick={() => setActiveMenu(menu.id)}
          >
            <strong>{menu.label}</strong>
            <span>{menu.hint}</span>
          </button>
        </Fragment>
      ))}
    </nav>
  );
}

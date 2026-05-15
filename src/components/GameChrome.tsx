import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { agentTypes, assetManifest, domains, products, resources } from "../game/data";
import { getGuidanceStep, getOpeningObjectives, type GuidanceStep, type OpeningObjective } from "../game/guidance";
import { getRunSummary } from "../game/run-summary";
import {
  advanceMonth,
  chooseGrowthPath,
  createInitialState,
  formatResource,
  getCompanyStage,
  getPlayerMarketShare,
  resolveEventChoice,
  resolveRivalEventChoice,
} from "../game/simulation";
import type { GameState, ReleaseGrowthPath } from "../game/types";
import { t, type LocaleCode } from "../i18n";
import { formatEffects, statusLabel } from "../ui/formatters";
import { menus, orderedResourceIds, type MenuId } from "../ui/menu";

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
  return (
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
        <span className="status-pill">런 {gameState.roguelite.runNumber}</span>
        <span className="status-pill">통찰 {gameState.roguelite.founderInsight}</span>
        <span className="status-pill">점유 {getPlayerMarketShare(gameState)}%</span>
        {qaScenarioLabel && <span className="status-pill qa-pill">{qaScenarioLabel}</span>}
        <button className="locale-toggle" onClick={onToggleLocale}>
          {locale.toUpperCase()}
        </button>
      </div>
    </section>
  );
}

export function ResourceStrip({ gameState }: { gameState: GameState }) {
  return (
    <section className="resource-strip" aria-label="자원">
      {orderedResourceIds.map((resourceId) => (
        <article className="resource-tile" key={resourceId}>
          <span>{resources[resourceId].name}</span>
          <strong>{formatResource(resourceId, gameState.resources[resourceId] ?? 0)}</strong>
        </article>
      ))}
    </section>
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
  const activeProducts = products.filter((product) => gameState.activeProducts.includes(product.id));
  const activeProject = gameState.productProjects[0];
  const activeProjectProduct = activeProject ? products.find((product) => product.id === activeProject.productId) : undefined;
  const unlockedDomainNames = domains
    .filter((domain) => gameState.unlockedDomains.includes(domain.id))
    .map((domain) => domain.name);
  const officeObjects = assetManifest.office_objects.slice(0, 7);
  const chosenGrowthPathId = gameState.chosenGrowthPath?.id;
  const runSummary = getRunSummary(gameState);
  const growthPathCardClass = (pathId: string) =>
    ["growth-path-card", chosenGrowthPathId === pathId ? "selected" : "", chosenGrowthPathId && chosenGrowthPathId !== pathId ? "locked" : ""]
      .filter(Boolean)
      .join(" ");

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

  const handleGrowthPathClick = (path: ReleaseGrowthPath) => {
    if (!chosenGrowthPathId) {
      setGameState((current) => chooseGrowthPath(path.id, current));
    }
    setActiveMenu(path.targetMenu);
  };

  return (
    <section className="game-stage" aria-label="AI 회사 사무실">
      <div className="office-scene">
        <div className="office-wall">
          <span>BOUNDARYLESS LAB</span>
          <span>GPU ROOM</span>
          <span>RELEASE BOARD</span>
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
          {gameState.hiredAgents.length
            ? gameState.hiredAgents.slice(0, 8).map((agent, index) => {
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
        </div>
      </div>

      <div className="stage-side">
        <GuidancePanel guidance={guidance} objectives={openingObjectives} onAction={handleGuidanceAction} />
        {gameState.lastRelease && (
          <article className="release-spotlight">
            <p className="eyebrow">출시 결과</p>
            <div className="release-score">
              <strong>{gameState.lastRelease.review.grade}</strong>
              <span>{gameState.lastRelease.review.score}점</span>
            </div>
            <h2>{gameState.lastRelease.productName}</h2>
            <p className="release-headline">{gameState.lastRelease.headline}</p>
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
        <article className="company-stage">
          <p className="eyebrow">회사 단계</p>
          <h2>{companyStage.name}</h2>
          <p>{companyStage.description}</p>
          {gameState.chosenGrowthPath && <span className="growth-identity">전략: {gameState.chosenGrowthPath.title}</span>}
          <span className="growth-identity">
            로그라이트 런 {gameState.roguelite.runNumber} · 손패 {gameState.roguelite.deck.hand.length} · 통찰 {gameState.roguelite.founderInsight}
          </span>
          {gameState.lastDevelopmentPuzzle && (
            <span>최근 퍼즐: {gameState.lastDevelopmentPuzzle.verdict} {gameState.lastDevelopmentPuzzle.score}점</span>
          )}
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
            <small>{runSummary.recommendation}</small>
          </article>
        )}
      </div>
    </section>
  );
}

function GuidancePanel({
  guidance,
  objectives,
  onAction,
}: {
  guidance: GuidanceStep;
  objectives: OpeningObjective[];
  onAction: () => void;
}) {
  return (
    <article className={`guidance-card guidance-${guidance.tone}`}>
      <div>
        <p className="eyebrow">다음 목표</p>
        <h2>{guidance.title}</h2>
        <p>{guidance.description}</p>
      </div>
      <button onClick={onAction}>{guidance.actionLabel}</button>
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
  const activeProducts = products.filter((product) => gameState.activeProducts.includes(product.id));

  return (
    <section className="command-row" aria-label="주요 명령">
      <button className="primary-action" onClick={() => setGameState((current) => advanceMonth(current))}>
        다음 달
      </button>
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

export function MainMenu({
  activeMenu,
  setActiveMenu,
}: {
  activeMenu: MenuId;
  setActiveMenu: Dispatch<SetStateAction<MenuId>>;
}) {
  return (
    <nav className="main-menu">
      {menus.map((menu) => (
        <button className={activeMenu === menu.id ? "active" : ""} key={menu.id} onClick={() => setActiveMenu(menu.id)}>
          <strong>{menu.label}</strong>
          <span>{menu.hint}</span>
        </button>
      ))}
    </nav>
  );
}

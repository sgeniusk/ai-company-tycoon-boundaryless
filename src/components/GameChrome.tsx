import type { Dispatch, SetStateAction } from "react";
import { domains, products, resources } from "../game/data";
import { advanceMonth, createInitialState, formatResource, getCompanyStage, getPlayerMarketShare, resolveEventChoice, resolveRivalEventChoice } from "../game/simulation";
import type { GameState } from "../game/types";
import { t, type LocaleCode } from "../i18n";
import { statusLabel } from "../ui/formatters";
import { menus, orderedResourceIds, type MenuId } from "../ui/menu";

export function TopBar({
  gameState,
  launchableCount,
  locale,
  onToggleLocale,
}: {
  gameState: GameState;
  launchableCount: number;
  locale: LocaleCode;
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
        <span className="status-pill">점유 {getPlayerMarketShare(gameState)}%</span>
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

export function GameStage({ gameState }: { gameState: GameState }) {
  const companyStage = getCompanyStage(gameState);
  const activeProducts = products.filter((product) => gameState.activeProducts.includes(product.id));
  const unlockedDomainNames = domains
    .filter((domain) => gameState.unlockedDomains.includes(domain.id))
    .map((domain) => domain.name);

  return (
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

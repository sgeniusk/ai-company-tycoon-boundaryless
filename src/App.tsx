import { useEffect, useMemo, useState } from "react";
import { CommandRow, EventPanels, GameStage, MainMenu, ResourceStrip, TopBar } from "./components/GameChrome";
import { renderMenuContent } from "./components/MenuPanels";
import { products } from "./game/data";
import { applyOfflineSettlement, calculateOfflineSettlement, type OfflineSettlement } from "./game/offline";
import { createQaScenarioFromSearch } from "./game/qa-scenarios";
import { createInitialState, formatResource, getProductProjectCheck, hydrateSavedGame, serializeGameState } from "./game/simulation";
import type { GameState } from "./game/types";
import type { LocaleCode } from "./i18n";
import type { MenuId } from "./ui/menu";

const saveKey = "ai-company-tycoon-alpha-save";

interface InitialSession {
  state: GameState;
  activeMenu: MenuId;
  qaScenarioLabel?: string;
  offlineSettlement?: OfflineSettlement;
  shouldAutoSave: boolean;
}

function createInitialSession(): InitialSession {
  const initialScenario = typeof window !== "undefined" ? createQaScenarioFromSearch(window.location.search) : undefined;
  if (initialScenario) {
    return {
      state: initialScenario.state,
      activeMenu: initialScenario.activeMenu,
      qaScenarioLabel: initialScenario.label,
      shouldAutoSave: false,
    };
  }

  if (typeof window === "undefined") {
    return { state: createInitialState(), activeMenu: "company", shouldAutoSave: false };
  }

  const saved = window.localStorage.getItem(saveKey);
  if (!saved) return { state: createInitialState(), activeMenu: "company", shouldAutoSave: true };

  const hydrated = hydrateSavedGame(saved);
  const offlineSettlement = calculateOfflineSettlement(hydrated.state, hydrated.savedAt, new Date());
  return {
    state: applyOfflineSettlement(hydrated.state, offlineSettlement),
    activeMenu: "company",
    offlineSettlement: offlineSettlement.gameDays > 0 ? offlineSettlement : undefined,
    shouldAutoSave: true,
  };
}

function App() {
  const [initialSession] = useState(createInitialSession);
  const [gameState, setGameState] = useState<GameState>(initialSession.state);
  const [activeMenu, setActiveMenu] = useState<MenuId>(initialSession.activeMenu);
  const [qaScenarioLabel] = useState(initialSession.qaScenarioLabel);
  const [shouldAutoSave] = useState(initialSession.shouldAutoSave);
  const [offlineSettlement, setOfflineSettlement] = useState<OfflineSettlement | undefined>(initialSession.offlineSettlement);
  const [locale, setLocale] = useState<LocaleCode>("ko");

  const launchableCount = useMemo(
    () => products.filter((product) => getProductProjectCheck(product, gameState).ok).length,
    [gameState],
  );

  const handleSave = () => {
    window.localStorage.setItem(saveKey, serializeGameState(gameState, new Date()));
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
    const hydrated = hydrateSavedGame(saved);
    const settlement = calculateOfflineSettlement(hydrated.state, hydrated.savedAt, new Date());
    setOfflineSettlement(settlement.gameDays > 0 ? settlement : undefined);
    setGameState(applyOfflineSettlement(hydrated.state, settlement));
  };

  useEffect(() => {
    if (!shouldAutoSave || typeof window === "undefined") return;
    window.localStorage.setItem(saveKey, serializeGameState(gameState, new Date()));
  }, [gameState, shouldAutoSave]);

  return (
    <main className="app-shell">
      {offlineSettlement && (
        <section className="offline-modal" role="dialog" aria-label="오프라인 정산">
          <div>
            <p className="eyebrow">방치 운영 보고</p>
            <h2>{offlineSettlement.gameDays}일치 오프라인 정산</h2>
            <p>{offlineSettlement.summary} 게임 시간은 멈춰 있었고, 월 턴은 진행되지 않았습니다.</p>
            <div className="offline-delta-list">
              {Object.entries(offlineSettlement.delta)
                .filter(([, amount]) => amount !== 0)
                .map(([resourceId, amount]) => (
                  <span className={amount >= 0 ? "positive" : "negative"} key={resourceId}>
                    {resourceId} {amount >= 0 ? "+" : ""}
                    {formatResource(resourceId, amount)}
                  </span>
                ))}
            </div>
            <button className="primary-action" onClick={() => setOfflineSettlement(undefined)}>
              확인
            </button>
          </div>
        </section>
      )}
      <TopBar
        gameState={gameState}
        launchableCount={launchableCount}
        locale={locale}
        qaScenarioLabel={qaScenarioLabel}
        onToggleLocale={() => setLocale((current) => (current === "ko" ? "en" : "ko"))}
      />
      <ResourceStrip gameState={gameState} />
      <GameStage gameState={gameState} setGameState={setGameState} setActiveMenu={setActiveMenu} />
      <div className="event-stack">
        <EventPanels gameState={gameState} setGameState={setGameState} locale={locale} />
      </div>
      <CommandRow gameState={gameState} setGameState={setGameState} onSave={handleSave} onLoad={handleLoad} />
      <section className="menu-layout" aria-label="경영 메뉴">
        <MainMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <div className="menu-panel">{renderMenuContent(activeMenu, gameState, setGameState, locale)}</div>
      </section>
    </main>
  );
}

export default App;

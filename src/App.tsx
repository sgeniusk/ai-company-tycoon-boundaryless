import { useMemo, useState } from "react";
import { CommandRow, EventPanels, GameStage, MainMenu, ResourceStrip, TopBar } from "./components/GameChrome";
import { renderMenuContent } from "./components/MenuPanels";
import { products } from "./game/data";
import { createQaScenarioFromSearch } from "./game/qa-scenarios";
import { createInitialState, getProductProjectCheck, hydrateGameState, serializeGameState } from "./game/simulation";
import type { GameState } from "./game/types";
import type { LocaleCode } from "./i18n";
import type { MenuId } from "./ui/menu";

const saveKey = "ai-company-tycoon-alpha-save";

function App() {
  const initialScenario = typeof window !== "undefined" ? createQaScenarioFromSearch(window.location.search) : undefined;
  const [gameState, setGameState] = useState<GameState>(() => initialScenario?.state ?? createInitialState());
  const [activeMenu, setActiveMenu] = useState<MenuId>(initialScenario?.activeMenu ?? "company");
  const [qaScenarioLabel] = useState(initialScenario?.label);
  const [locale, setLocale] = useState<LocaleCode>("ko");

  const launchableCount = useMemo(
    () => products.filter((product) => getProductProjectCheck(product, gameState).ok).length,
    [gameState],
  );

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
      <TopBar
        gameState={gameState}
        launchableCount={launchableCount}
        locale={locale}
        qaScenarioLabel={qaScenarioLabel}
        onToggleLocale={() => setLocale((current) => (current === "ko" ? "en" : "ko"))}
      />
      <ResourceStrip gameState={gameState} />
      <GameStage gameState={gameState} setGameState={setGameState} setActiveMenu={setActiveMenu} />
      <EventPanels gameState={gameState} setGameState={setGameState} locale={locale} />
      <CommandRow gameState={gameState} setGameState={setGameState} onSave={handleSave} onLoad={handleLoad} />
      <section className="menu-layout" aria-label="경영 메뉴">
        <MainMenu activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <div className="menu-panel">{renderMenuContent(activeMenu, gameState, setGameState, locale)}</div>
      </section>
    </main>
  );
}

export default App;

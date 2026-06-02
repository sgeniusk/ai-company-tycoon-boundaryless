import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { GameState } from "../game/types";
import type { LocaleCode } from "../i18n";
import { menus, type MenuId } from "../ui/menu";
import { renderMenuContent } from "./MenuPanels";

export function MenuPopupModal({
  activeMenu,
  gameState,
  locale,
  setActiveMenu,
  setGameState,
  onDismiss,
}: {
  activeMenu: MenuId;
  gameState: GameState;
  locale: LocaleCode;
  setActiveMenu: Dispatch<SetStateAction<MenuId>>;
  setGameState: Dispatch<SetStateAction<GameState>>;
  onDismiss: () => void;
}) {
  const dismissRef = useRef<HTMLButtonElement>(null);
  const menu = menus.find((entry) => entry.id === activeMenu);
  const menuLabel = menu?.label ?? activeMenu;

  useEffect(() => {
    dismissRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <div className="menu-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="menu-popup-title">
      <section className="menu-popup-card" aria-label={`${menuLabel} 메뉴 팝업`}>
        <header className="menu-popup-header">
          <div>
            <p className="menu-popup-kicker">Command popup</p>
            <h2 id="menu-popup-title">{menuLabel}</h2>
          </div>
          <button ref={dismissRef} type="button" className="menu-popup-dismiss" onClick={onDismiss}>
            닫기
          </button>
        </header>
        <div className="menu-popup-body menu-panel pixel-menu-screen">
          {renderMenuContent(activeMenu, gameState, setGameState, locale, setActiveMenu)}
        </div>
      </section>
    </div>
  );
}

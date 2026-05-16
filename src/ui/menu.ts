export type MenuId = "company" | "products" | "deck" | "agents" | "research" | "shop" | "competition" | "log";
export type MenuGroup = "core" | "operations" | "meta";

export const orderedResourceIds = ["cash", "users", "compute", "data", "talent", "trust", "hype", "automation"];

export const menuGroupLabels: Record<MenuGroup, string> = {
  core: "운영",
  operations: "성장",
  meta: "시장",
};

export const menus: Array<{ id: MenuId; label: string; hint: string; group: MenuGroup }> = [
  { id: "company", label: "회사", hint: "현황", group: "core" },
  { id: "products", label: "제품", hint: "출시", group: "core" },
  { id: "deck", label: "덱", hint: "런/퍼즐", group: "core" },
  { id: "agents", label: "에이전트", hint: "능력치", group: "operations" },
  { id: "research", label: "연구", hint: "AI 능력", group: "operations" },
  { id: "shop", label: "상점", hint: "아이템", group: "operations" },
  { id: "competition", label: "경쟁", hint: "시장", group: "meta" },
  { id: "log", label: "기록", hint: "히스토리", group: "meta" },
];

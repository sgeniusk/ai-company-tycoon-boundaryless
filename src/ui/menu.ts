export type MenuId = "company" | "products" | "deck" | "agents" | "research" | "shop" | "competition" | "log";

export const orderedResourceIds = ["cash", "users", "compute", "data", "talent", "trust", "hype", "automation"];

export const menus: Array<{ id: MenuId; label: string; hint: string }> = [
  { id: "company", label: "회사", hint: "현황" },
  { id: "products", label: "제품", hint: "출시" },
  { id: "deck", label: "덱", hint: "런/퍼즐" },
  { id: "agents", label: "에이전트", hint: "능력치" },
  { id: "research", label: "연구", hint: "AI 능력" },
  { id: "shop", label: "상점", hint: "아이템" },
  { id: "competition", label: "경쟁", hint: "시장" },
  { id: "log", label: "기록", hint: "히스토리" },
];

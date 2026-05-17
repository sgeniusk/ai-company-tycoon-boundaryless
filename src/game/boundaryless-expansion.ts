import { domains, products } from "./data";
import type { GameState } from "./types";

export type BoundarylessExpansionStatus = "locked" | "unlocked" | "launched";

export interface BoundarylessExpansionGoal {
  domainId: string;
  domainName: string;
  status: BoundarylessExpansionStatus;
  progressPercent: number;
  nextProductId?: string;
  nextProductName?: string;
  payoff: string;
}

const expansionDomainIds = ["semiconductors", "robotics", "mobility", "odd_industries", "toys"];

const payoffByDomain: Record<string, string> = {
  semiconductors: "연산 비용을 줄이고 모델 회사의 인프라 독립을 노립니다.",
  robotics: "로봇 인력을 고용하고 물리 세계 자동화로 확장합니다.",
  mobility: "자율주행과 차량 소프트웨어 시장의 대형 계약을 노립니다.",
  odd_industries: "AI 카페 같은 엉뚱한 소비 산업에서 화제성과 매출을 얻습니다.",
  toys: "AI 캐릭터와 교육 완구로 팬덤형 반복 수익을 만듭니다.",
};

export function getBoundarylessExpansionGoals(state: GameState): BoundarylessExpansionGoal[] {
  return expansionDomainIds.map((domainId) => {
    const domain = domains.find((entry) => entry.id === domainId);
    const domainProducts = products.filter((product) => product.domain === domainId);
    const launched = domainProducts.find((product) => state.activeProducts.includes(product.id));
    const unlocked = state.unlockedDomains.includes(domainId);
    const nextProduct = domainProducts.find((product) => !state.activeProducts.includes(product.id)) ?? domainProducts[0];
    const status: BoundarylessExpansionStatus = launched ? "launched" : unlocked ? "unlocked" : "locked";

    return {
      domainId,
      domainName: domain?.name ?? domainId,
      status,
      progressPercent: status === "launched" ? 100 : status === "unlocked" ? 50 : 0,
      nextProductId: status === "launched" ? undefined : nextProduct?.id,
      nextProductName: status === "launched" ? launched?.name : nextProduct?.name,
      payoff: payoffByDomain[domainId] ?? "AI 능력을 새 산업으로 확장합니다.",
    };
  });
}

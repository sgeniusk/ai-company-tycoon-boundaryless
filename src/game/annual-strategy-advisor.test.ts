import { describe, expect, it } from "vitest";
import { chooseAnnualDirective } from "./annual-review";
import { getAnnualStrategyAdvice, getAnnualStrategyMenuFocus, prioritizeAnnualStrategyFocus } from "./annual-strategy-advisor";
import { advanceMonth, createInitialState } from "./simulation";
import type { GameState } from "./types";

describe("v0.15 annual strategy advisor", () => {
  it("turns an active annual directive into product, research, and rival counter recommendations", () => {
    const state = createTrustedEnterpriseDirectiveState();
    const advice = getAnnualStrategyAdvice(state);

    expect(advice).toMatchObject({
      directiveTitle: "신뢰 복리 프로그램",
      tagLabels: ["신뢰", "안전", "기업"],
      recommendedMenu: "research",
    });
    expect(advice?.productRecommendations.map((row) => row.id)).toContain("customer_support_chatbot");
    expect(advice?.capabilityRecommendations.map((row) => row.id)).toEqual(expect.arrayContaining(["safety", "enterprise"]));
    expect(advice?.rivalRecommendations[0]).toMatchObject({
      competitorId: "competitor_chatgody",
    });
    expect(advice?.actionRecommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "제품 후보 보기", menu: "products", targetId: "customer_support_chatbot" }),
        expect.objectContaining({ label: "연구 후보 보기", menu: "research", targetId: "enterprise" }),
        expect.objectContaining({ label: "경쟁 대응 보기", menu: "competition", targetId: "competitor_chatgody" }),
      ]),
    );
    expect(advice?.summary).toContain("신뢰 복리 프로그램");
  });

  it("returns undefined when there is no active annual directive with reward bias tags", () => {
    expect(getAnnualStrategyAdvice(createInitialState())).toBeUndefined();
  });

  it("creates menu-specific focus rows from annual strategy advice", () => {
    const state = createTrustedEnterpriseDirectiveState();

    expect(getAnnualStrategyMenuFocus(state, "products")).toMatchObject({
      menu: "products",
      title: "전략실 추천 제품",
      targetId: "customer_support_chatbot",
    });
    expect(getAnnualStrategyMenuFocus(state, "research")).toMatchObject({
      menu: "research",
      title: "전략실 추천 연구",
      targetId: "enterprise",
    });
    expect(getAnnualStrategyMenuFocus(state, "competition")).toMatchObject({
      menu: "competition",
      title: "전략실 추천 대응",
      targetId: "competitor_chatgody",
    });
  });

  it("moves the focused recommendation to the top of menu lists", () => {
    const state = createTrustedEnterpriseDirectiveState();
    const focus = getAnnualStrategyMenuFocus(state, "products");

    expect(prioritizeAnnualStrategyFocus(["foundation_model_v0", "ai_writing_assistant", "customer_support_chatbot"], focus)).toEqual([
      "customer_support_chatbot",
      "foundation_model_v0",
      "ai_writing_assistant",
    ]);
    expect(prioritizeAnnualStrategyFocus(["foundation_model_v0", "ai_writing_assistant"], focus)).toEqual([
      "foundation_model_v0",
      "ai_writing_assistant",
    ]);
  });
});

function createTrustedEnterpriseDirectiveState(): GameState {
  const reviewed = advanceMonth({
    ...createInitialState(),
    month: 11,
    activeProducts: ["foundation_model_v0", "ai_writing_assistant"],
    productLevels: {
      foundation_model_v0: 1,
      ai_writing_assistant: 1,
    },
    capabilities: {
      ...createInitialState().capabilities,
      language: 2,
    },
    unlockedDomains: ["foundation_models", "personal_productivity", "customer_support"],
    resources: {
      ...createInitialState().resources,
      cash: 22000,
      users: 2400,
      trust: 48,
      hype: 30,
      automation: 8,
      data: 90,
      compute: 90,
      talent: 4,
    },
  });
  const directed = chooseAnnualDirective("trust_compound_program", reviewed);

  return {
    ...directed,
    competitorStates: directed.competitorStates.map((competitor) =>
      competitor.id === "competitor_chatgody"
        ? {
            ...competitor,
            score: 145,
            marketShare: 34,
            momentum: 7,
            claimedProducts: ["customer_support_chatbot"],
            lastMove: "고객지원 시장 신뢰 인증 선점",
          }
        : competitor,
    ),
  };
}

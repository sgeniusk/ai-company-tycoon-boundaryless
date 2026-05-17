import { describe, expect, it } from "vitest";
import { agentTypes, products, strategyCards } from "./data";
import { playStrategyCard } from "./deckbuilding";
import { getReleaseImpactSummary } from "./release-impact";
import { advanceMonth, createInitialState, hireAgent, launchProduct, startProductProject } from "./simulation";

describe("v0.22 release impact feedback", () => {
  it("summarizes the first launch as a visible five-minute payoff", () => {
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!writingProduct) throw new Error("Missing writing product");

    const launched = launchProduct(writingProduct, createInitialState());
    const summary = getReleaseImpactSummary(launched);

    expect(summary?.headline).toContain("첫 출시");
    expect(summary?.badges).toEqual(expect.arrayContaining(["첫 5분 보상", "카드 보상 3장"]));
    expect(summary?.resourceHighlights.map((highlight) => highlight.resourceId)).toContain("hype");
    expect(summary?.nextAction).toContain("성장 분기");
  });

  it("names strategy cards that changed the released product result", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    const sprintCard = strategyCards.find((card) => card.id === "prompt_sprint");
    const interviewCard = strategyCards.find((card) => card.id === "customer_interviews");
    if (!architect || !writingProduct || !sprintCard || !interviewCard) throw new Error("Missing card impact fixture");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const sprinted = playStrategyCard(sprintCard, started);
    const interviewed = playStrategyCard(interviewCard, sprinted);
    const released = advanceMonth(advanceMonth(interviewed));
    const summary = getReleaseImpactSummary(released);

    expect(summary?.cardInfluences.map((influence) => influence.cardName)).toEqual(
      expect.arrayContaining(["프롬프트 스프린트", "고객 인터뷰"]),
    );
    expect(summary?.badges).toContain("카드 영향");
    expect(summary?.cardInfluences.some((influence) => influence.effects.includes("완성도"))).toBe(true);
  });
});

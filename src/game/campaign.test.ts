import { describe, expect, it } from "vitest";
import { products } from "./data";
import {
  getCampaignCalendar,
  getCampaignFinale,
  getCompanyStageProgress,
  getCompanyStarRating,
  getCurrentLocation,
  getDayPhase,
} from "./campaign";
import { advanceMonth, createInitialState, getRelocationCheck, relocateCompany } from "./simulation";

describe("v0.14 ten-year campaign structure", () => {
  it("starts in a rural Korean garage with a one-star company and a 120-month campaign clock", () => {
    const state = createInitialState();

    expect(getCurrentLocation(state).id).toBe("rural_garage");
    expect(getCompanyStarRating(state)).toBe(1);
    expect(getDayPhase(state).id).toBe("day");
    expect(getCampaignCalendar(state)).toMatchObject({
      currentMonth: 1,
      totalMonths: 120,
      year: 1,
      monthOfYear: 1,
      remainingMonths: 119,
      progressPercent: 0,
    });
  });

  it("alternates the office mood between day and night as monthly turns pass", () => {
    const secondMonth = advanceMonth(createInitialState());

    expect(secondMonth.month).toBe(2);
    expect(getDayPhase(secondMonth)).toMatchObject({
      id: "night",
      label: "밤 작업",
    });
  });

  it("reaches a final campaign ending on the 120th monthly turn", () => {
    const state = {
      ...createInitialState(),
      month: 119,
      activeProducts: products.slice(0, 6).map((product) => product.id),
      resources: {
        ...createInitialState().resources,
        cash: 250000,
        users: 180000,
        trust: 82,
        automation: 65,
      },
    };

    const finaleState = advanceMonth(state);
    const finale = getCampaignFinale(finaleState);

    expect(finaleState.month).toBe(120);
    expect(finaleState.status).toBe("success");
    expect(finale).toMatchObject({
      isFinal: true,
      title: "10년차 최종 평가",
      endingId: "standard_platform_compounder",
      endingName: "표준 세계의 복리 플랫폼",
      survivedYears: 10,
    });
    expect(finale.verdict).toContain("기준선");
  });

  it("projects a post-campaign aftermath without adding persisted state", () => {
    const state = {
      ...createInitialState(),
      month: 120,
      status: "success" as const,
      activeProducts: products.slice(0, 5).map((product) => product.id),
      worldEventHistory: ["border_drone_contracts"],
      resources: {
        ...createInitialState().resources,
        cash: 180000,
        users: 125000,
        trust: 58,
        automation: 54,
      },
    };

    const finale = getCampaignFinale(state);

    expect(finale.aftermath).toMatchObject({
      yearLabel: "11년차 후일담",
      signals: expect.arrayContaining([
        expect.objectContaining({ id: "legacy" }),
        expect.objectContaining({ id: "geopolitics", tone: "warning" }),
      ]),
    });
    expect(finale.aftermath.headline).toContain(finale.endingName);
    expect(finale.aftermath.signals).toHaveLength(3);
    expect(finale.aftermath.signals.map((signal) => signal.detail).join(" ")).toContain("국방 조달");
  });

  it("unlocks better locations after company growth and charges relocation cost", () => {
    const grownState = {
      ...createInitialState(),
      activeProducts: products.slice(0, 2).map((product) => product.id),
      resources: {
        ...createInitialState().resources,
        cash: 50000,
        users: 12000,
        trust: 55,
      },
    };

    expect(getRelocationCheck("pangyo_shared_office", grownState).ok).toBe(true);

    const relocated = relocateCompany("pangyo_shared_office", grownState);

    expect(getCurrentLocation(relocated).id).toBe("pangyo_shared_office");
    expect(relocated.resources.cash).toBeLessThan(grownState.resources.cash);
    expect(relocated.timeline[0]).toContain("판교");
  });

  it("summarizes the next company promotion requirements with readable progress", () => {
    const state = {
      ...createInitialState(),
      activeProducts: [products[0].id],
      resources: {
        ...createInitialState().resources,
        users: 60,
      },
    };

    const progress = getCompanyStageProgress(state);

    expect(progress.current.id).toBe("garage_prototype");
    expect(progress.next?.id).toBe("seed_startup");
    expect(progress.progressPercent).toBe(50);
    expect(progress.items).toEqual([
      expect.objectContaining({
        requirement: "min_products",
        complete: true,
        currentLabel: "1개",
        targetLabel: "1개",
      }),
      expect.objectContaining({
        requirement: "min_users",
        complete: false,
        currentLabel: "60명",
        targetLabel: "100명",
      }),
    ]);
  });
});

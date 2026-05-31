import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { campaignEndings } from "./data";
import { getBetaReadinessSummary } from "./beta-readiness";
import { createInitialState } from "./simulation";

const betaReadinessSource = readFileSync(new URL("./beta-readiness.ts", import.meta.url), "utf8");

describe("beta readiness summary", () => {
  it("summarizes multi-ending content coverage for beta prep", () => {
    const summary = getBetaReadinessSummary(createInitialState());
    const replayableEndingCount = campaignEndings.filter((ending) => ending.condition.fallback !== true).length;
    const totalRewardBonus = campaignEndings.reduce((total, ending) => total + ending.meta_reward_bonus, 0);

    expect(summary.title).toBe("v0.67 멀티 엔딩 준비도");
    expect(summary.endingTotal).toBe(campaignEndings.length);
    expect(summary.replayableTotal).toBe(replayableEndingCount);
    expect(summary.resultOnlyTotal).toBe(1);
    expect(summary.codexProgressLabel).toBe(`0/${campaignEndings.length}`);
    expect(summary.rewardProgressLabel).toBe(`0/${totalRewardBonus}`);
    expect(summary.codexStatusLabel).toBe(`도감 0/${campaignEndings.length} · 보상 0/${totalRewardBonus}`);
    expect(summary.unlockHintLabel).toBe("23/23");
    expect(summary.unlockHintCoveragePercent).toBe(100);
    expect(summary.routeAxisLabel).toBe("4/4");
    expect(summary.routeOptionLabel).toBe("40/40");
    expect(summary.nextTargetLabel).toBe("프런티어 데모 제국");
    expect(summary.checks.map((check) => check.id)).toEqual([
      "ending_routes",
      "reward_pool",
      "unlock_guidance",
      "route_coverage",
      "target_replay",
      "route_quick_start",
      "result_route_start",
    ]);
    expect(summary.checks.find((check) => check.id === "ending_routes")).toMatchObject({
      detail: "24 결말 · 23 목표 · 1 결과 전용",
      complete: true,
    });
    expect(summary.checks.find((check) => check.id === "reward_pool")).toMatchObject({
      label: "도감 보상",
      detail: `0/${totalRewardBonus} 통찰 · 목표 엔딩 23개 남음`,
      complete: true,
    });
    expect(summary.checks.find((check) => check.id === "route_quick_start")).toMatchObject({
      label: "원클릭 목표 런",
      complete: true,
    });
    expect(summary.checks.find((check) => check.id === "result_route_start")).toMatchObject({
      label: "결과 목표 런",
      detail: "샌프란시스코 / 오픈소스 천국 / 엔지니어 창업자",
      complete: true,
    });
    expect(summary.completeCheckCount).toBe(summary.totalCheckCount);
    expect(summary.readinessPercent).toBe(100);
    expect(summary.statusLabel).toBe("준비 완료");
  });

  it("keeps the target replay check complete when every replayable ending is discovered", () => {
    const replayableEndingIds = campaignEndings.filter((ending) => ending.condition.fallback !== true).map((ending) => ending.id);
    const state = {
      ...createInitialState(),
      roguelite: {
        ...createInitialState().roguelite,
        discoveredEndingIds: replayableEndingIds,
      },
    };
    const summary = getBetaReadinessSummary(state);

    expect(summary.nextTargetLabel).toBe("모든 목표 엔딩 발견");
    expect(summary.codexProgressLabel).toBe(`${replayableEndingIds.length}/${campaignEndings.length}`);
    expect(summary.lockedReplayableLabel).toBe("목표 엔딩 0개 남음");
    expect(summary.checks.find((check) => check.id === "target_replay")).toMatchObject({
      complete: true,
      detail: "모든 목표 엔딩 발견",
    });
    expect(summary.checks.find((check) => check.id === "route_quick_start")).toMatchObject({
      complete: true,
      detail: "모든 목표 엔딩 발견",
    });
    expect(summary.checks.find((check) => check.id === "result_route_start")).toMatchObject({
      complete: true,
      detail: "모든 목표 엔딩 발견",
    });
    expect(summary.readinessPercent).toBe(100);
  });

  it("keeps route-start checks aligned through named readiness helpers", () => {
    const summary = getBetaReadinessSummary(createInitialState());
    const quickStartCheck = summary.checks.find((check) => check.id === "route_quick_start");
    const resultStartCheck = summary.checks.find((check) => check.id === "result_route_start");

    expect(betaReadinessSource).toContain("function getRouteStartReadiness");
    expect(betaReadinessSource).toContain("function createBetaReadinessChecks");
    expect(quickStartCheck?.detail).toBe(resultStartCheck?.detail);
    expect(quickStartCheck?.complete).toBe(resultStartCheck?.complete);
    expect(summary.totalCheckCount).toBe(summary.checks.length);
    expect(summary.readinessPercent).toBe(Math.round((summary.completeCheckCount / summary.totalCheckCount) * 100));
  });
});

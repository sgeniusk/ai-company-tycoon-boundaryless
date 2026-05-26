import { describe, expect, it } from "vitest";
import { runV056BlindPlaytestRehearsal } from "./blind-playtest-rehearsal";

describe("v0.56 blind playtest rehearsal", () => {
  it("maps the first 30-minute checkpoints to stable QA evidence without claiming real sessions", () => {
    const report = runV056BlindPlaytestRehearsal();

    expect(report.versionTarget).toBe("v0.56-alpha");
    expect(report.realHumanSessionsCaptured).toBe(0);
    expect(report.verdict).toBe("ready_for_human_blind_test");
    expect(report.checkpoints.map((checkpoint) => checkpoint.id)).toEqual([
      "first_10_seconds",
      "first_3_minutes",
      "first_10_minutes",
      "first_15_minutes",
      "first_20_minutes",
      "first_30_minutes",
    ]);
    expect(report.checkpoints.every((checkpoint) => checkpoint.status === "ready_for_human_validation")).toBe(true);
    expect(report.checkpoints.flatMap((checkpoint) => checkpoint.qaRoutes)).toEqual(
      expect.arrayContaining([
        "?scenario=fresh",
        "?scenario=staffing",
        "?scenario=deck",
        "?scenario=deck-result",
        "?scenario=launch-impact",
        "?scenario=reward-picked",
        "?scenario=growth-picked",
        "?scenario=annual-directed",
        "?scenario=year-two-plan",
        "?scenario=year-two-research",
        "?scenario=year-two-research-complete",
        "?scenario=year-two-product-candidate",
        "?scenario=year-two-product-ready",
        "?scenario=year-two-product-started",
        "?scenario=year-two-product-issue-result",
        "?scenario=year-two-product-launch-impact",
        "?scenario=office-visuals",
      ]),
    );
    const workforceCheckpoint = report.checkpoints.find((checkpoint) => checkpoint.id === "first_20_minutes");
    expect(workforceCheckpoint?.goal).toContain("인력 조합");
    expect(workforceCheckpoint?.humanQuestion).toContain("사람/AI/로봇");
  });

  it("keeps the real-user boundary explicit for all five session files", () => {
    const report = runV056BlindPlaytestRehearsal();

    expect(report.disclaimer).toContain("실제 사람 5명 블라인드 테스트가 아님");
    expect(report.sessionFiles).toHaveLength(5);
    expect(report.sessionFiles.every((session) => session.status === "예정")).toBe(true);
    expect(report.remainingHumanRisks).toEqual(
      expect.arrayContaining([
        "첫 개발 이슈/결과 리본이 설명 없이 카드 영향으로 읽히는지",
        "연구 완료 후 제품 후보와 필요 연구 보기 흐름이 다음 목표로 읽히는지",
      ]),
    );
  });

  it("places final graphic asset intake after the v0.56 playtest slice is locked", () => {
    const report = runV056BlindPlaytestRehearsal();

    expect(report.artIntakeTiming.status).toBe("after_v056_blind_test_p0_pass");
    expect(report.artIntakeTiming.decision).toContain("블라인드 테스트 P0");
    expect(report.artIntakeTiming.requiredSources).toEqual([
      "1152x9600 RGBA character event-pose sheet",
      "2560x1920 RGBA office object sheet",
      "5120x2880 RGBA isometric office backdrop",
    ]);
    expect(report.artIntakeTiming.antigravityBriefPath).toBe("docs/ANTIGRAVITY_ART_BRIEF.md");
  });
});

import { describe, expect, it } from "vitest";
import { playtestPersonas } from "./data";
import { runPersonaPlaytestReview } from "./persona-playtest";

describe("v0.50 persona playtest harness", () => {
  it("turns 20 persona lenses into an alpha candidate review with no unresolved P0/P1 findings", () => {
    const report = runPersonaPlaytestReview();

    expect(report.versionTarget).toBe("v0.50-alpha");
    expect(report.personaCount).toBe(20);
    expect(report.genderMix).toEqual({ male: 10, female: 10 });
    expect(report.personaNotes).toHaveLength(playtestPersonas.length);
    expect(report.score).toBeGreaterThanOrEqual(70);
    expect(report.unresolvedP0P1Findings).toEqual([]);
    expect(report.firstScreenSignals).toEqual(expect.arrayContaining(["사무실 판타지", "이번 달 목표", "다음 행동"]));
    expect(report.consensus).toContain("v0.49");
    expect(report.consensus).toContain("v0.50");
    expect(report.topPriorities).toEqual(
      expect.arrayContaining([
        "이벤트 포즈 시트 확장",
        "20인 페르소나 최신 화면 재검증 기록 유지",
      ]),
    );
    expect(report.topPriorities.some((priority) => priority.includes("우측 보조 패널"))).toBe(false);
    expect(report.personaNotes.some((note) => note.personaId === "accessibility_tester" && note.request.includes("글자"))).toBe(true);
  });
});

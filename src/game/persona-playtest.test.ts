import { describe, expect, it } from "vitest";
import { playtestPersonas } from "./data";
import { runPersonaPlaytestReview } from "./persona-playtest";

describe("v0.21 persona playtest harness", () => {
  it("turns 20 persona lenses into an actionable alpha review", () => {
    const report = runPersonaPlaytestReview();

    expect(report.versionTarget).toBe("v0.21-alpha");
    expect(report.personaCount).toBe(20);
    expect(report.genderMix).toEqual({ male: 10, female: 10 });
    expect(report.personaNotes).toHaveLength(playtestPersonas.length);
    expect(report.score).toBeGreaterThanOrEqual(70);
    expect(report.topPriorities).toEqual(
      expect.arrayContaining([
        "우측 보조 패널을 탭/접기 구조로 압축",
        "첫 5분 보상 연출을 더 크게 표시",
      ]),
    );
    expect(report.personaNotes.some((note) => note.personaId === "accessibility_tester" && note.request.includes("글자"))).toBe(true);
  });
});

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = fileURLToPath(new URL("../..", import.meta.url));

interface BetaReadinessQaResult {
  status: "pass" | "fail";
  endingTotal: number;
  replayableTotal: number;
  rewardTotal: number;
  unlockHintLabel: string;
  routeAxisLabel: string;
  routeOptionLabel: string;
  scenarios: string[];
  completeCheckCount: number;
  totalCheckCount: number;
  readinessPercent: number;
}

function runBetaReadinessQa(): BetaReadinessQaResult {
  const output = execFileSync("npm", ["run", "--silent", "qa:beta-readiness", "--", "--json", "--no-write"], {
    cwd: rootDir,
  }).toString("utf8");

  return JSON.parse(output) as BetaReadinessQaResult;
}

describe("beta readiness QA script", () => {
  it("reports the ending codex, reward, route, and scenario readiness gates", () => {
    const result = runBetaReadinessQa();

    expect(result.status).toBe("pass");
    expect(result.endingTotal).toBe(24);
    expect(result.replayableTotal).toBe(23);
    expect(result.rewardTotal).toBe(81);
    expect(result.unlockHintLabel).toBe("23/23");
    expect(result.routeAxisLabel).toBe("4/4");
    expect(result.routeOptionLabel).toBe("40/40");
    expect(result.scenarios).toEqual(expect.arrayContaining(["beta-readiness", "beta-readiness-complete"]));
    expect(result.completeCheckCount).toBe(result.totalCheckCount);
    expect(result.totalCheckCount).toBe(6);
    expect(result.readinessPercent).toBe(100);
  });
});

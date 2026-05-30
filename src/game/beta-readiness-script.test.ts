import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
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
  checks: { id: string; label: string; complete: boolean }[];
}

function runBetaReadinessQa(): BetaReadinessQaResult {
  const output = execFileSync("npm", ["run", "--silent", "qa:beta-readiness", "--", "--json", "--no-write"], {
    cwd: rootDir,
  }).toString("utf8");

  return JSON.parse(output) as BetaReadinessQaResult;
}

function runBetaReadinessQaCheck(): BetaReadinessQaResult {
  const output = execFileSync("npm", ["run", "--silent", "qa:beta-readiness:check", "--", "--json"], {
    cwd: rootDir,
  }).toString("utf8");

  return JSON.parse(output) as BetaReadinessQaResult;
}

function runBetaReadinessQaCheckText(): string {
  return execFileSync("npm", ["run", "--silent", "qa:beta-readiness:check"], {
    cwd: rootDir,
  }).toString("utf8");
}

describe("beta readiness QA script", () => {
  it("includes the no-write beta readiness check in the main harness gate", () => {
    const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts["harness:gate"]).toContain("npm run qa:beta-readiness:check");
  });

  it("reports the ending codex, reward, route, and scenario readiness gates", () => {
    const result = runBetaReadinessQa();

    expect(result.status).toBe("pass");
    expect(result.endingTotal).toBe(24);
    expect(result.replayableTotal).toBe(23);
    expect(result.rewardTotal).toBe(81);
    expect(result.unlockHintLabel).toBe("23/23");
    expect(result.routeAxisLabel).toBe("4/4");
    expect(result.routeOptionLabel).toBe("40/40");
    expect(result.scenarios).toEqual(expect.arrayContaining(["beta-readiness", "beta-readiness-complete", "ten-year-next-run"]));
    expect(result.completeCheckCount).toBe(result.totalCheckCount);
    expect(result.totalCheckCount).toBe(13);
    expect(result.readinessPercent).toBe(100);
    expect(result.checks.find((check) => check.id === "alpha_readiness_ending_carryover")).toMatchObject({
      label: "전체 준비도 엔딩 Carryover",
      complete: true,
    });
    expect(result.checks.find((check) => check.id === "end_to_end_ending_report")).toMatchObject({
      label: "E2E 엔딩 리포트",
      complete: true,
    });
    expect(result.checks.find((check) => check.id === "long_run_carryover_preview")).toMatchObject({
      label: "장기 하네스 다음 런 미리보기",
      complete: true,
    });
    expect(result.checks.find((check) => check.id === "long_run_ending_telemetry")).toMatchObject({
      label: "장기 하네스 엔딩 텔레메트리",
      complete: true,
    });
    expect(result.checks.find((check) => check.id === "meta_state_integrity")).toMatchObject({
      label: "메타 상태 무결성",
      complete: true,
    });
    expect(result.checks.find((check) => check.id === "in_game_guide")).toMatchObject({
      label: "게임 내 가이드",
      complete: true,
    });
    expect(result.checks.find((check) => check.id === "report_fresh")).toMatchObject({
      label: "리포트 최신성",
      complete: true,
    });
  });

  it("keeps a no-write beta readiness check command for CI-style gates", () => {
    const result = runBetaReadinessQaCheck();

    expect(result.status).toBe("pass");
    expect(result.totalCheckCount).toBe(13);
    expect(result.readinessPercent).toBe(100);
  });

  it("prints readiness and guide status in the no-write beta readiness check", () => {
    const output = runBetaReadinessQaCheckText();

    expect(output).toContain("Readiness: 13/13 checks (100%)");
    expect(output).toContain("Guide: PASS");
    expect(output).toContain("Report: PASS");
  });

  it("fails the no-write beta readiness check when the committed report is stale", () => {
    const reportPath = fileURLToPath(new URL("../../reports/qa/v0_67_beta_readiness.md", import.meta.url));
    const originalReport = readFileSync(reportPath, "utf8");
    let failedOutput = "";

    try {
      writeFileSync(reportPath, `${originalReport}\nSTALE\n`);
      execFileSync("npm", ["run", "--silent", "qa:beta-readiness:check"], {
        cwd: rootDir,
      });
    } catch (error) {
      const output = error as { stdout?: { toString: () => string }; stderr?: { toString: () => string } };
      failedOutput = `${output.stdout?.toString() ?? ""}${output.stderr?.toString() ?? ""}`;
    } finally {
      writeFileSync(reportPath, originalReport);
    }

    expect(failedOutput).toContain("Report: FAIL");
  });
});

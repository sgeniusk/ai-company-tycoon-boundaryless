import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = fileURLToPath(new URL("../..", import.meta.url));

interface BetaCandidateCheck {
  id: string;
  command: string;
}

interface BetaCandidateArtifact {
  id: string;
  path: string;
  format: string;
}

interface BetaCandidateListResult {
  version: string;
  reportPath: string;
  summaryPath: string;
  artifacts: BetaCandidateArtifact[];
  checks: BetaCandidateCheck[];
}

function listBetaCandidateChecks(): BetaCandidateListResult {
  const output = execFileSync("npm", ["run", "--silent", "qa:v068-beta-candidate", "--", "--list-json"], {
    cwd: rootDir,
  }).toString("utf8");

  return JSON.parse(output) as BetaCandidateListResult;
}

function runCandidateWithFakeNpm(fakeNpmBody: string): unknown {
  const fakeBin = mkdtempSync(join(tmpdir(), "act-v068-candidate-"));
  const fakeNpmPath = join(fakeBin, "npm");
  writeFileSync(fakeNpmPath, fakeNpmBody);
  execFileSync("chmod", ["755", fakeNpmPath]);
  const nodePath = execFileSync("which", ["node"]).toString("utf8").trim();

  try {
    const output = execFileSync(nodePath, ["scripts/qa/check-v068-beta-candidate.mjs", "--json", "--no-write"], {
      cwd: rootDir,
      env: {
        PATH: `${fakeBin}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin`,
      },
    }).toString("utf8");

    return JSON.parse(output);
  } catch (error) {
    const failure = error as { stdout?: { toString(encoding?: string): string }; stderr?: { toString(encoding?: string): string } };
    const output = `${failure.stdout?.toString("utf8") ?? ""}${failure.stderr?.toString("utf8") ?? ""}`;
    return JSON.parse(output);
  }
}

describe("v0.68 beta candidate local QA script", () => {
  it("registers a standalone beta candidate command outside the harness gate", () => {
    const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts["qa:v068-beta-candidate"]).toBe("node scripts/qa/check-v068-beta-candidate.mjs");
    expect(packageJson.scripts["qa:v068-beta-candidate:check"]).toBe("node scripts/qa/check-v068-beta-candidate.mjs --check");
    expect(packageJson.scripts["harness:gate"]).not.toContain("qa:v068-beta-candidate");
  });

  it("lists the local beta candidate checks without running the slow gates", () => {
    const result = listBetaCandidateChecks();

    expect(result).toEqual({
      version: "0.68-beta-stabilization",
      reportPath: "reports/qa/v0_68_beta_candidate.md",
      summaryPath: "reports/qa/v0_68_beta_candidate.json",
      artifacts: [
        {
          id: "markdown_report",
          path: "reports/qa/v0_68_beta_candidate.md",
          format: "markdown",
        },
        {
          id: "json_summary",
          path: "reports/qa/v0_68_beta_candidate.json",
          format: "json",
        },
      ],
      checks: [
        {
          id: "harness_gate",
          command: "npm run harness:gate < /dev/null",
        },
        {
          id: "flow_smoke",
          command: "npm run qa:v068-flow-smoke:check < /dev/null",
        },
      ],
    });
  });

  it("keeps the candidate implementation tied to harness and browser smoke freshness", () => {
    const source = readFileSync(new URL("../../scripts/qa/check-v068-beta-candidate.mjs", import.meta.url), "utf8");

    expect(source).toContain("npm run harness:gate < /dev/null");
    expect(source).toContain("npm run qa:v068-flow-smoke:check < /dev/null");
    expect(source).toContain("reports/qa/v0_68_beta_candidate.md");
    expect(source).toContain("reports/qa/v0_68_beta_candidate.json");
    expect(source).toContain("Report: FAIL");
  });

  it("keeps failure diagnostics machine-readable when child gates fail", () => {
    const result = runCandidateWithFakeNpm(`#!/bin/sh
if [ "$1 $2" = "run harness:gate" ]; then
  echo "Test Files  1 failed | 52 passed (53)"
  echo "Tests  1 failed | 594 passed (595)"
  echo "Status: FAIL"
  exit 7
fi
if [ "$1 $2" = "run qa:v068-flow-smoke:check" ]; then
  echo "Status: FAIL"
  echo "Routes: 7/8"
  echo "Report: FAIL"
  exit 8
fi
echo "unexpected npm $*" >&2
exit 9
`) as {
      status: string;
      checks: Array<{
        id: string;
        status: string;
        exitStatus: number | null;
        diagnostic: string;
      }>;
    };

    expect(result.status).toBe("fail");
    expect(result.checks).toEqual([
      expect.objectContaining({
        id: "harness_gate",
        status: "fail",
        exitStatus: 7,
        diagnostic: "exit 7; Test Files  1 failed | 52 passed (53)",
      }),
      expect.objectContaining({
        id: "flow_smoke",
        status: "fail",
        exitStatus: 8,
        diagnostic: "exit 8; Report: FAIL",
      }),
    ]);
  });

  it("prioritizes build errors over upstream PASS report lines in diagnostics", () => {
    const result = runCandidateWithFakeNpm(`#!/bin/sh
if [ "$1 $2" = "run harness:gate" ]; then
  echo "Test Files  53 passed (53)"
  echo "Tests  596 passed (596)"
  echo "Readiness: 15/15 checks (100%)"
  echo "Report: PASS"
  echo "src/game/example.test.ts(1,1): error TS2305: boom"
  exit 2
fi
if [ "$1 $2" = "run qa:v068-flow-smoke:check" ]; then
  echo "Status: PASS"
  echo "Routes: 8/8"
  echo "Report: PASS"
  exit 0
fi
echo "unexpected npm $*" >&2
exit 9
`) as {
      checks: Array<{
        id: string;
        diagnostic: string;
      }>;
    };

    expect(result.checks.find((check) => check.id === "harness_gate")?.diagnostic).toBe(
      "exit 2; src/game/example.test.ts(1,1): error TS2305: boom",
    );
  });
});

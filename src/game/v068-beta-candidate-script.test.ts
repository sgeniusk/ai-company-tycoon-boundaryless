import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = fileURLToPath(new URL("../..", import.meta.url));

interface BetaCandidateCheck {
  id: string;
  command: string;
}

interface BetaCandidateListResult {
  version: string;
  reportPath: string;
  summaryPath: string;
  checks: BetaCandidateCheck[];
}

function listBetaCandidateChecks(): BetaCandidateListResult {
  const output = execFileSync("npm", ["run", "--silent", "qa:v068-beta-candidate", "--", "--list-json"], {
    cwd: rootDir,
  }).toString("utf8");

  return JSON.parse(output) as BetaCandidateListResult;
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
});

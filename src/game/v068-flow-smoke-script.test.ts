import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = fileURLToPath(new URL("../..", import.meta.url));

interface FlowSmokeRoute {
  id: string;
  path: string;
  expectedText: string;
}

interface FlowSmokeListResult {
  version: string;
  reportPath: string;
  routes: FlowSmokeRoute[];
}

function listFlowSmokeRoutes(): FlowSmokeListResult {
  const output = execFileSync("npm", ["run", "--silent", "qa:v068-flow-smoke", "--", "--list-json"], {
    cwd: rootDir,
  }).toString("utf8");

  return JSON.parse(output) as FlowSmokeListResult;
}

describe("v0.68 browser flow smoke QA script", () => {
  it("registers a standalone local browser smoke command outside the harness gate", () => {
    const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts["qa:v068-flow-smoke"]).toBe("node scripts/qa/check-v068-flow-smoke.mjs");
    expect(packageJson.scripts["qa:v068-flow-smoke:check"]).toBe("node scripts/qa/check-v068-flow-smoke.mjs --check");
    expect(packageJson.scripts["harness:gate"]).not.toContain("qa:v068-flow-smoke");
  });

  it("lists the core reloadable beta flow URLs without launching Chrome", () => {
    const result = listFlowSmokeRoutes();

    expect(result.version).toBe("0.68-beta-stabilization");
    expect(result.reportPath).toBe("reports/qa/v0_68_flow_smoke.md");
    expect(result.routes).toEqual([
      {
        id: "fresh",
        path: "/?scenario=fresh",
        expectedText: "첫 화면",
      },
      {
        id: "beta-readiness",
        path: "/?scenario=beta-readiness",
        expectedText: "베타 준비 체크 QA",
      },
      {
        id: "ten-year-ending-route-start",
        path: "/?scenario=ten-year-ending-route-start",
        expectedText: "10년 엔딩 목표 런 QA",
      },
      {
        id: "ending-nearmiss-retry-start",
        path: "/?scenario=ending-nearmiss-retry-start",
        expectedText: "아쉬운 엔딩 목표 런 QA",
      },
    ]);
  });

  it("keeps the smoke implementation tied to Chrome DOM checks and a QA report artifact", () => {
    const source = readFileSync(new URL("../../scripts/qa/check-v068-flow-smoke.mjs", import.meta.url), "utf8");

    expect(source).toContain("--dump-dom");
    expect(source).toContain("--virtual-time-budget=8000");
    expect(source).toContain("--check");
    expect(source).toContain("reports/qa/v0_68_flow_smoke.md");
    expect(source).toContain("Report: FAIL");
    expect(source).toContain("npm run qa:v068-flow-smoke");
  });
});

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = fileURLToPath(new URL("../..", import.meta.url));

interface FlowSmokeRoute {
  id: string;
  path: string;
  expectedText: string;
  requiredTexts: string[];
  forbiddenTexts?: string[];
}

interface FlowSmokeArtifact {
  id: string;
  path: string;
  format: string;
}

interface FlowSmokeListResult {
  version: string;
  reportPath: string;
  summaryPath: string;
  artifacts: FlowSmokeArtifact[];
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
    expect(result.summaryPath).toBe("reports/qa/v0_68_flow_smoke.json");
    expect(result.artifacts).toEqual([
      {
        id: "markdown_report",
        path: "reports/qa/v0_68_flow_smoke.md",
        format: "markdown",
      },
      {
        id: "json_summary",
        path: "reports/qa/v0_68_flow_smoke.json",
        format: "json",
      },
    ]);
    expect(result.routes).toEqual([
      {
        id: "fresh",
        path: "/?scenario=fresh",
        expectedText: "첫 화면",
        requiredTexts: ["차고 AI 회사를 시작했어요"],
      },
      {
        id: "beta-readiness",
        path: "/?scenario=beta-readiness",
        expectedText: "베타 준비 체크 QA",
        requiredTexts: ["베타 준비 체크", "결말 루트"],
      },
      {
        id: "beta-readiness-complete",
        path: "/?scenario=beta-readiness-complete",
        expectedText: "베타 준비 완료 도감 QA",
        requiredTexts: ["목표 엔딩 0개 남음", "모든 목표 엔딩 발견"],
      },
      {
        id: "ending-fallback-final",
        path: "/?scenario=ending-fallback-final",
        expectedText: "결과 전용 엔딩 QA",
        requiredTexts: ["다시 차고로", "결과 전용 기록"],
        forbiddenTexts: ["이번 세계가 열렸습니다", "이 세계로 시작"],
      },
      {
        id: "ending-nearmiss-final",
        path: "/?scenario=ending-nearmiss-final",
        expectedText: "아쉬운 엔딩 재도전 QA",
        requiredTexts: ["아쉬운 엔딩", "AGI 안전 협정"],
        forbiddenTexts: ["이번 세계가 열렸습니다", "이 세계로 시작"],
      },
      {
        id: "ten-year-ending-route-start",
        path: "/?scenario=ten-year-ending-route-start",
        expectedText: "10년 엔딩 목표 런 QA",
        requiredTexts: ["엔딩 목표 런", "목표 엔딩", "이번 세계가 열렸습니다"],
      },
      {
        id: "ten-year-next-run",
        path: "/?scenario=ten-year-next-run",
        expectedText: "10년 엔딩 다음 런 QA",
        requiredTexts: ["다음 런", "도감"],
      },
      {
        id: "ending-nearmiss-retry-start",
        path: "/?scenario=ending-nearmiss-retry-start",
        expectedText: "아쉬운 엔딩 목표 런 QA",
        requiredTexts: ["목표 엔딩", "AGI 안전 협정", "이번 세계가 열렸습니다"],
      },
    ]);
  });

  it("guards final-result routes against a blocking world reveal modal", () => {
    const result = listFlowSmokeRoutes();
    const finalResultRoutes = result.routes.filter((route) => route.path.includes("-final"));

    expect(finalResultRoutes.map((route) => route.id)).toEqual(["ending-fallback-final", "ending-nearmiss-final"]);
    for (const route of finalResultRoutes) {
      expect(route.forbiddenTexts).toEqual(["이번 세계가 열렸습니다", "이 세계로 시작"]);
    }
  });

  it("requires run-start and retry-start routes to prove the world reveal or run briefing is present", () => {
    const result = listFlowSmokeRoutes();
    const routeStartGuards = ["이번 세계가 열렸습니다", "이 세계로 시작", "새 런 브리핑", "다음 런 브리핑"];
    const startRoutes = result.routes.filter((route) => route.path.includes("-route-start") || route.path.includes("-retry-start"));

    expect(startRoutes.map((route) => route.id)).toEqual(["ten-year-ending-route-start", "ending-nearmiss-retry-start"]);
    for (const route of startRoutes) {
      expect(route.requiredTexts.some((text) => routeStartGuards.includes(text))).toBe(true);
    }
  });

  it("keeps the smoke implementation tied to Chrome DOM checks and a QA report artifact", () => {
    const source = readFileSync(new URL("../../scripts/qa/check-v068-flow-smoke.mjs", import.meta.url), "utf8");

    expect(source).toContain("./report-artifacts.mjs");
    expect(source).toContain("createArtifactManifest");
    expect(source).toContain("applyArtifactFreshness");
    expect(source).toContain("writeArtifactPair");
    expect(source).toContain("--dump-dom");
    expect(source).toContain("--virtual-time-budget=8000");
    expect(source).toContain("const chromeDomAttempts = 2");
    expect(source).toContain("const chromeDomTimeoutMs = 45000");
    expect(source).toContain("}, chromeDomTimeoutMs)");
    expect(source).toContain("runChromeDomAttempt");
    expect(source).toContain("attempt ${attempt}/${chromeDomAttempts}");
    expect(source).toContain("--check");
    expect(source).toContain("reports/qa/v0_68_flow_smoke.md");
    expect(source).toContain("reports/qa/v0_68_flow_smoke.json");
    expect(source).toContain("Report: FAIL");
    expect(source).toContain("npm run qa:v068-flow-smoke");
  });
});

import process from "node:process";
import { spawnSync } from "node:child_process";
import { applyArtifactFreshness, createArtifactManifest, writeArtifactPair } from "./report-artifacts.mjs";

const root = process.cwd();
const version = "0.68-beta-stabilization";
const reportPath = "reports/qa/v0_68_beta_candidate.md";
const summaryPath = "reports/qa/v0_68_beta_candidate.json";
const artifacts = createArtifactManifest(reportPath, summaryPath);
const checks = [
  {
    id: "harness_gate",
    label: "Main harness gate",
    command: "npm run harness:gate < /dev/null",
    args: ["run", "harness:gate"],
  },
  {
    id: "flow_smoke",
    label: "Browser flow smoke freshness",
    command: "npm run qa:v068-flow-smoke:check < /dev/null",
    args: ["run", "qa:v068-flow-smoke:check"],
  },
];

function hasArg(name) {
  return process.argv.includes(name);
}

function runCheck(check) {
  const result = spawnSync("npm", check.args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  const exitStatus = result.status ?? null;

  return {
    id: check.id,
    label: check.label,
    command: check.command,
    status: exitStatus === 0 ? "pass" : "fail",
    exitStatus,
    evidence: summarizeOutput(check.id, output),
    diagnostic: summarizeDiagnostic(output, exitStatus),
  };
}

function summarizeOutput(id, output) {
  if (id === "harness_gate") {
    const testFiles = output.match(/Test Files\s+([^\n]+)/)?.[1]?.trim() ?? "unknown";
    const tests = output.match(/Tests\s+([^\n]+)/)?.[1]?.trim() ?? "unknown";
    const betaReadiness = output.match(/Readiness:\s+([^\n]+)/)?.[1]?.trim() ?? "unknown";
    const buildPassed = output.includes("✓ built") ? "build passed" : "build missing";
    return `${testFiles}; ${tests}; ${betaReadiness}; ${buildPassed}`;
  }

  if (id === "flow_smoke") {
    const routes = output.match(/Routes:\s+([^\n]+)/)?.[1]?.trim() ?? "unknown";
    const report = output.includes("Report: PASS") ? "Report: PASS" : "Report: FAIL";
    const summary = output.includes("Summary: PASS") ? "Summary: PASS" : output.includes("Summary: FAIL") ? "Summary: FAIL" : "Summary: unknown";
    return `${routes}; ${report}; ${summary}`;
  }

  return output.split("\n").find((line) => line.trim())?.trim() ?? "no output";
}

function summarizeDiagnostic(output, exitStatus) {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.trim());
  const priorityPatterns = [
    /^Error:/,
    /error TS\d+:/,
    /^FAIL\b/,
    /Test Files\s+.*failed/,
    /^Summary:\s+FAIL/,
    /^Report:\s+FAIL/,
    /^Status:\s+FAIL/,
    /Test Files\s+.*passed/,
    /^Report:\s+PASS/,
    /^Summary:\s+PASS/,
  ];
  const diagnosticLine =
    priorityPatterns.map((pattern) => lines.find((line) => pattern.test(line))).find(Boolean) ?? lines[0] ?? "no output";
  const compactLine = diagnosticLine.length > 180 ? `${diagnosticLine.slice(0, 177)}...` : diagnosticLine;

  return `exit ${exitStatus ?? "unknown"}; ${compactLine}`;
}

function formatTableCell(value) {
  return String(value).replace(/\|/g, "\\|");
}

function createReport(result) {
  const rows = result.checks
    .map(
      (check) =>
        `| ${check.id} | ${check.command} | ${check.status.toUpperCase()} | ${check.exitStatus ?? "unknown"} | ${formatTableCell(check.evidence)} | ${formatTableCell(check.diagnostic)} |`,
    )
    .join("\n");

  return `# v0.68 Beta Candidate Local Gate

Status: ${result.status.toUpperCase()}

## Scope
- Version lane: ${result.version}
- Aggregates the local default harness gate and standalone browser flow smoke freshness check.
- Writes a deterministic JSON summary for automation-friendly release-candidate review.
- External/user validation remains out of scope until the final release-candidate stage.

## Checks
| ID | Command | Status | Exit | Evidence | Diagnostic |
| --- | --- | --- | ---: | --- | --- |
${rows}
`;
}

function createSummary(result) {
  const summary = {
    version: result.version,
    status: result.status,
    reportPath: result.reportPath,
    summaryPath: result.summaryPath,
    artifacts,
    totalChecks: result.totalChecks,
    passedChecks: result.passedChecks,
    checks: result.checks.map((check) => ({
      id: check.id,
      command: check.command,
      status: check.status,
      exitStatus: check.exitStatus,
      evidence: check.evidence,
      diagnostic: check.diagnostic,
    })),
  };

  return `${JSON.stringify(summary, null, 2)}\n`;
}

function printSummary(result) {
  console.log(`Status: ${result.status.toUpperCase()}`);
  console.log(`Version: ${result.version}`);
  console.log(`Checks: ${result.passedChecks}/${result.totalChecks}`);
  const reportStatusLabel =
    result.reportFresh === false ? "Report: FAIL" : result.reportFresh === true ? "Report: PASS" : `Report: ${result.reportPath}`;
  console.log(reportStatusLabel);
  if (result.summaryFresh !== undefined) console.log(result.summaryFresh ? "Summary: PASS" : "Summary: FAIL");
  else console.log(`Summary: ${result.summaryPath}`);
  for (const check of result.checks) {
    console.log(`- ${check.id}: ${check.status.toUpperCase()} (${check.evidence})`);
  }
}

if (hasArg("--list-json")) {
  console.log(JSON.stringify({
    version,
    reportPath,
    summaryPath,
    artifacts,
    checks: checks.map((check) => ({ id: check.id, command: check.command })),
  }, null, 2));
  process.exit(0);
}

const checkResults = checks.map(runCheck);
const passedChecks = checkResults.filter((check) => check.status === "pass").length;
const result = {
  version,
  status: passedChecks === checkResults.length ? "pass" : "fail",
  reportPath,
  summaryPath,
  totalChecks: checkResults.length,
  passedChecks,
  checks: checkResults,
};
const generatedReport = createReport(result);
const generatedSummary = createSummary(result);

if (hasArg("--check")) {
  applyArtifactFreshness(result, { root, reportPath, summaryPath, report: generatedReport, summary: generatedSummary });
} else if (!hasArg("--no-write")) {
  writeArtifactPair({ root, reportPath, summaryPath, report: generatedReport, summary: generatedSummary });
}

if (hasArg("--json")) {
  console.log(JSON.stringify(result, null, 2));
} else {
  printSummary(result);
}

if (result.status !== "pass") process.exitCode = 1;

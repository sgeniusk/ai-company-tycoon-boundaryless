import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const version = "0.68-beta-stabilization";
const reportPath = "reports/qa/v0_68_beta_candidate.md";
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

function resolveProjectPath(value) {
  return path.isAbsolute(value) ? value : path.join(root, value);
}

function runCheck(check) {
  const result = spawnSync("npm", check.args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

  return {
    id: check.id,
    label: check.label,
    command: check.command,
    status: result.status === 0 ? "pass" : "fail",
    evidence: summarizeOutput(check.id, output),
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
    return `${routes}; ${report}`;
  }

  return output.split("\n").find((line) => line.trim())?.trim() ?? "no output";
}

function createReport(result) {
  const rows = result.checks
    .map((check) => `| ${check.id} | ${check.command} | ${check.status.toUpperCase()} | ${check.evidence} |`)
    .join("\n");

  return `# v0.68 Beta Candidate Local Gate

Status: ${result.status.toUpperCase()}

## Scope
- Version lane: ${result.version}
- Aggregates the local default harness gate and standalone browser flow smoke freshness check.
- External/user validation remains out of scope until the final release-candidate stage.

## Checks
| ID | Command | Status | Evidence |
| --- | --- | --- | --- |
${rows}
`;
}

function printSummary(result) {
  console.log(`Status: ${result.status.toUpperCase()}`);
  console.log(`Version: ${result.version}`);
  console.log(`Checks: ${result.passedChecks}/${result.totalChecks}`);
  const reportStatusLabel =
    result.reportFresh === false ? "Report: FAIL" : result.reportFresh === true ? "Report: PASS" : `Report: ${result.reportPath}`;
  console.log(reportStatusLabel);
  for (const check of result.checks) {
    console.log(`- ${check.id}: ${check.status.toUpperCase()} (${check.evidence})`);
  }
}

if (hasArg("--list-json")) {
  console.log(JSON.stringify({
    version,
    reportPath,
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
  totalChecks: checkResults.length,
  passedChecks,
  checks: checkResults,
};
const generatedReport = createReport(result);
const outputPath = resolveProjectPath(reportPath);

if (hasArg("--check")) {
  result.reportFresh = fs.existsSync(outputPath) && fs.readFileSync(outputPath, "utf8") === generatedReport;
  if (!result.reportFresh) result.status = "fail";
} else if (!hasArg("--no-write")) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, generatedReport);
}

if (hasArg("--json")) {
  console.log(JSON.stringify(result, null, 2));
} else {
  printSummary(result);
}

if (result.status !== "pass") process.exitCode = 1;

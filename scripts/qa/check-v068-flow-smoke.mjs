import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const root = process.cwd();
const version = "0.68-beta-stabilization";
const reportPath = "reports/qa/v0_68_flow_smoke.md";
const defaultHost = "127.0.0.1";
const defaultPort = 5220;
const defaultChromeCandidates = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];
const routes = [
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
];

function hasArg(name) {
  return process.argv.includes(name);
}

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function resolveProjectPath(value) {
  if (!value) return undefined;
  return path.isAbsolute(value) ? value : path.join(root, value);
}

function findChrome(explicitPath) {
  if (explicitPath && fs.existsSync(explicitPath)) return explicitPath;
  const envPath = process.env.CHROME_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;
  return defaultChromeCandidates.find((candidate) => fs.existsSync(candidate));
}

function normalizeBaseUrl(value) {
  const url = new URL(value);
  return `${url.origin}/`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(baseUrl, timeoutMs = 20000) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await sleep(250);
  }

  throw new Error(`Timed out waiting for Vite at ${baseUrl}: ${lastError?.message ?? "no response"}`);
}

function startViteServer(port) {
  const viteBin = resolveProjectPath("node_modules/.bin/vite");
  const processPath = process.platform === "win32" ? `${viteBin}.cmd` : viteBin;
  const child = spawn(processPath, ["--host", defaultHost, "--port", String(port), "--strictPort"], {
    cwd: root,
    env: { ...process.env, BROWSER: "none" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const logs = [];
  const collect = (chunk) => {
    const text = chunk.toString("utf8").trim();
    if (text) logs.push(text);
  };

  child.stdout.on("data", collect);
  child.stderr.on("data", collect);

  return { child, logs };
}

async function stopViteServer(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    sleep(3000).then(() => {
      if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
    }),
  ]);
}

function runChromeDom(chromePath, url) {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "act-v068-flow-smoke-"));

  return new Promise((resolve, reject) => {
    const child = spawn(chromePath, [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-background-networking",
      "--disable-component-update",
      "--disable-default-apps",
      "--disable-extensions",
      "--disable-sync",
      "--hide-scrollbars",
      "--no-first-run",
      "--force-device-scale-factor=1",
      `--user-data-dir=${userDataDir}`,
      "--virtual-time-budget=8000",
      "--dump-dom",
      url,
    ], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let settled = false;

    const cleanup = () => {
      try {
        fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
      } catch {
        // Chrome may still be releasing the temporary profile after DOM capture; this should not fail the smoke verdict.
      }
    };
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (child.exitCode === null && child.signalCode === null) child.kill("SIGTERM");
      cleanup();
      callback(value);
    };
    const timeout = setTimeout(() => {
      finish(
        reject,
        new Error([
          `Chrome DOM dump timed out for ${url}`,
          stderr.trim(),
          stdout.slice(0, 500).trim(),
        ].filter(Boolean).join("\n")),
      );
    }, 25000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
      if (stdout.includes("</html>")) finish(resolve, stdout);
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.once("error", (error) => finish(reject, error));
    child.once("exit", (code, signal) => {
      if (settled) return;
      if (code === 0 && stdout) finish(resolve, stdout);
      finish(
        reject,
        new Error([
          `Chrome DOM dump failed for ${url}`,
          `status=${code ?? signal}`,
          stderr.trim(),
          stdout.slice(0, 500).trim(),
        ].filter(Boolean).join("\n")),
      );
    });
  });
}

function getRouteUrl(baseUrl, routePath) {
  return new URL(routePath, baseUrl).toString();
}

async function inspectRoute(chromePath, baseUrl, route) {
  const url = getRouteUrl(baseUrl, route.path);
  const dom = await runChromeDom(chromePath, url);
  const checks = [
    { id: "app_shell", label: "App shell rendered", pass: dom.includes("app-shell") },
    { id: "title", label: "Game title rendered", pass: dom.includes("경계 없는 회사") },
    { id: "scenario_label", label: "Scenario label rendered", pass: dom.includes(route.expectedText) },
    {
      id: "no_vite_error",
      label: "No Vite/runtime error overlay",
      pass: !dom.includes("plugin:vite") && !dom.includes("vite-error-overlay") && !dom.includes("Internal server error"),
    },
  ];

  return {
    ...route,
    url,
    status: checks.every((check) => check.pass) ? "pass" : "fail",
    domBytes: Buffer.byteLength(dom, "utf8"),
    checks,
  };
}

function createReport(result) {
  const routeRows = result.routes
    .map((route) => {
      const failedChecks = route.checks.filter((check) => !check.pass).map((check) => check.label);
      return `| ${route.id} | \`${route.path}\` | ${route.status.toUpperCase()} | ${route.domBytes} | ${failedChecks.length ? failedChecks.join(", ") : "-"} |`;
    })
    .join("\n");

  return `# v0.68 Flow Smoke QA

Status: ${result.status.toUpperCase()}

## Scope
- Command: \`npm run qa:v068-flow-smoke\`
- Version lane: ${result.version}
- Browser load smoke for the core reloadable beta flow URLs.
- Standalone local QA only; not part of \`harness:gate\` because it requires Chrome/Chromium.

## Environment
- Base URL: ${result.baseUrl}
- Chrome: ${result.chromePath}
- Routes: ${result.passedRoutes}/${result.totalRoutes}

## Routes
| ID | Path | Status | DOM bytes | Failed checks |
| --- | --- | --- | ---: | --- |
${routeRows}
`;
}

function printSummary(result) {
  console.log(`Status: ${result.status.toUpperCase()}`);
  console.log(`Version: ${result.version}`);
  console.log(`Routes: ${result.passedRoutes}/${result.totalRoutes}`);
  const reportStatusLabel =
    result.reportFresh === false ? "Report: FAIL" : result.reportFresh === true ? "Report: PASS" : `Report: ${result.reportPath}`;
  console.log(reportStatusLabel);
  for (const route of result.routes) {
    console.log(`- ${route.id}: ${route.status.toUpperCase()} (${route.domBytes} bytes)`);
  }
}

async function main() {
  if (hasArg("--list-json")) {
    console.log(JSON.stringify({ version, reportPath, routes }, null, 2));
    return;
  }

  const chromePath = findChrome(resolveProjectPath(getArg("--chrome")));
  if (!chromePath) {
    throw new Error("Chrome or Chromium was not found. Set CHROME_PATH or pass --chrome <path>.");
  }

  const baseArg = getArg("--base");
  const port = Number(getArg("--port") ?? defaultPort);
  const checkReport = hasArg("--check");
  let server;
  const baseUrl = baseArg ? normalizeBaseUrl(baseArg) : `http://${defaultHost}:${port}/`;

  try {
    if (!baseArg) {
      server = startViteServer(port);
      await waitForServer(baseUrl);
    }

    const inspectedRoutes = [];
    for (const route of routes) {
      inspectedRoutes.push(await inspectRoute(chromePath, baseUrl, route));
    }
    const passedRoutes = inspectedRoutes.filter((route) => route.status === "pass").length;
    const routeStatus = passedRoutes === inspectedRoutes.length ? "pass" : "fail";
    const result = {
      version,
      status: routeStatus,
      baseUrl,
      chromePath,
      reportPath,
      totalRoutes: inspectedRoutes.length,
      passedRoutes,
      routes: inspectedRoutes,
    };
    const generatedReport = createReport(result);
    const outputPath = resolveProjectPath(reportPath);

    if (checkReport) {
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
  } catch (error) {
    const logs = server?.logs?.length ? `\nVite logs:\n${server.logs.join("\n")}` : "";
    throw new Error(`${error.message}${logs}`);
  } finally {
    if (server) await stopViteServer(server.child);
  }
}

await main();

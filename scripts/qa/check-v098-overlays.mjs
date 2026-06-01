import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const runtimeModules =
  process.env.PW_NODE_MODULES ??
  "/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/";
const require = createRequire(runtimeModules);
const { chromium } = require("playwright");

const screenshotDir = fileURLToPath(new URL("../../reports/qa/screenshots/", import.meta.url));
const distIndexPath = fileURLToPath(new URL("../../dist/index.html", import.meta.url));
const distAssetsDir = fileURLToPath(new URL("../../dist/assets/", import.meta.url));
mkdirSync(screenshotDir, { recursive: true });

const baseOrigin = process.argv[2] ?? "http://127.0.0.1:5222";
const checks = [
  {
    scenario: "payoff-juice",
    overlay: ".payoff-celebration-overlay",
    dismiss: ".payoff-celebration-dismiss",
  },
  {
    scenario: "milestones",
    overlay: ".payoff-celebration-overlay",
    dismiss: ".payoff-celebration-dismiss",
  },
  {
    scenario: "big-event",
    overlay: ".big-event-overlay",
    dismiss: ".big-event-dismiss",
  },
];
const blockingOverlaySelectors = [".payoff-celebration-overlay", ".world-reveal-overlay", ".big-event-overlay", ".offline-modal"];
const errors = [];

function scenarioUrl(scenario) {
  const url = new URL(baseOrigin);
  url.searchParams.set("scenario", scenario);
  return url.href;
}

async function gotoScenario(page, url) {
  try {
    await page.goto(url, { waitUntil: "networkidle" });
  } catch (error) {
    if (!String(error?.message ?? "").includes("ERR_ACCESS_DENIED") || !existsSync(distIndexPath)) throw error;
    await page.route("file:///assets/**", async (route) => {
      const assetRelativePath = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\/assets\//, "");
      const assetPath = `${distAssetsDir}${assetRelativePath}`;
      if (!existsSync(assetPath)) return route.abort();
      const contentType = assetPath.endsWith(".css")
        ? "text/css"
        : assetPath.endsWith(".js")
          ? "application/javascript"
          : "application/octet-stream";
      return route.fulfill({ body: readFileSync(assetPath), contentType });
    });
    await page.goto(`${pathToFileURL(distIndexPath).href}${new URL(url).search}`, { waitUntil: "networkidle" });
  }
}

async function isVisible(page, selector) {
  return page.locator(selector).first().isVisible().catch(() => false);
}

async function visibleBlockingOverlays(page) {
  const visible = [];
  for (const selector of blockingOverlaySelectors) {
    if (await isVisible(page, selector)) visible.push(selector);
  }
  return visible;
}

async function runOverlayCheck(check) {
  // Fresh browser per check: a reused --single-process browser crashes on the 2nd newPage.
  const browser = await chromium.launch({ args: ["--single-process"], headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`[${check.scenario}] ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`[${check.scenario}] ${error.message}`));

  const url = scenarioUrl(check.scenario);
  try {
    await gotoScenario(page, url);
    await page.waitForTimeout(500);

    if (!(await isVisible(page, check.overlay))) {
      throw new Error(`${check.scenario}: missing overlay ${check.overlay}`);
    }
    if (!(await isVisible(page, check.dismiss))) {
      throw new Error(`${check.scenario}: missing dismiss ${check.dismiss}`);
    }

    // Drain the dismiss queue: some scenarios (e.g. payoff-juice) stack multiple
    // celebrations, so one dismiss advances to the next instead of fully closing.
    // The "no input trap" guarantee is that repeated dismiss eventually clears it.
    let dismissClicks = 0;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      if (!(await isVisible(page, check.overlay))) break;
      const dismiss = page.locator(check.dismiss).first();
      if (!(await dismiss.isVisible().catch(() => false))) break;
      await dismiss.click({ timeout: 3000 }).catch(() => {});
      dismissClicks += 1;
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(300);

    if (await isVisible(page, check.overlay)) {
      throw new Error(`${check.scenario}: lingering overlay ${check.overlay} after ${dismissClicks} dismiss clicks`);
    }

    const lingering = await visibleBlockingOverlays(page);
    if (lingering.length) {
      throw new Error(`${check.scenario}: blocking overlay remains ${lingering.join(", ")}`);
    }

    await page.screenshot({
      path: `${screenshotDir}/v0_98_overlay_${check.scenario}.png`,
      fullPage: false,
    });

    return { ok: true, scenario: check.scenario, url };
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

const results = [];
for (const check of checks) {
  try {
    results.push(await runOverlayCheck(check));
  } catch (error) {
    errors.push(error?.message ?? String(error));
  }
}

const result = { baseOrigin, checks: results, errors };
console.log(JSON.stringify(result, null, 2));

if (errors.length) process.exit(1);
if (results.length !== checks.length) process.exit(2);

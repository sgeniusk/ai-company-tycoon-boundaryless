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
  { id: "company", label: "회사", closeWith: "button", screenshot: true },
  { id: "products", label: "제품", closeWith: "escape", screenshot: false },
  { id: "deck", label: "덱", closeWith: "button", screenshot: true },
  { id: "agents", label: "에이전트", closeWith: "escape", screenshot: false },
  { id: "research", label: "연구", closeWith: "button", screenshot: false },
  { id: "shop", label: "상점", closeWith: "escape", screenshot: false },
  { id: "competition", label: "경쟁", closeWith: "button", screenshot: true },
  { id: "log", label: "기록", closeWith: "escape", screenshot: true },
];
const blockingOverlaySelectors = [
  ".menu-popup-overlay",
  ".payoff-celebration-overlay",
  ".world-reveal-overlay",
  ".big-event-overlay",
  ".offline-modal",
];
const dismissSelectors = [
  ".menu-popup-dismiss",
  ".payoff-celebration-dismiss",
  ".world-reveal-dismiss",
  ".big-event-dismiss",
  ".offline-modal .primary-action",
];
const errors = [];

function scenarioUrl() {
  const url = new URL(baseOrigin);
  url.searchParams.set("scenario", "office-visuals");
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

async function drainBlockingOverlays(page) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const visible = await visibleBlockingOverlays(page);
    if (visible.length === 0) return;

    let dismissed = false;
    for (const selector of dismissSelectors) {
      const dismiss = page.locator(selector).first();
      if (await dismiss.isVisible().catch(() => false)) {
        await dismiss.click({ timeout: 3000 }).catch(() => {});
        dismissed = true;
        break;
      }
    }
    if (!dismissed) {
      await page.keyboard.press("Escape").catch(() => {});
    }
    await page.waitForTimeout(250);
  }
}

async function runMenuCheck(check) {
  // Fresh browser per check: mirrors v0.98 overlay smoke and avoids reused-page state.
  const browser = await chromium.launch({ args: ["--single-process"], headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`[${check.id}] ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`[${check.id}] ${error.message}`));

  const url = scenarioUrl();
  try {
    await gotoScenario(page, url);
    await page.waitForTimeout(500);
    await drainBlockingOverlays(page);

    const launcher = page.locator(`.menu-launcher-button[data-menu-id="${check.id}"]`).first();
    if (!(await launcher.isVisible().catch(() => false))) {
      throw new Error(`${check.id}: missing launcher button`);
    }
    await launcher.click({ timeout: 3000 });
    await page.waitForTimeout(250);

    if (!(await isVisible(page, ".menu-popup-overlay"))) {
      throw new Error(`${check.id}: missing .menu-popup-overlay`);
    }
    if (!(await isVisible(page, ".menu-popup-dismiss"))) {
      throw new Error(`${check.id}: missing .menu-popup-dismiss`);
    }
    if (!(await page.locator(".menu-popup-card").first().getByText(check.label).first().isVisible().catch(() => false))) {
      throw new Error(`${check.id}: popup content missing label ${check.label}`);
    }

    if (check.screenshot) {
      await page.screenshot({
        path: `${screenshotDir}/v1_0_menu_popup_${check.id}.png`,
        fullPage: false,
      });
    }

    if (check.closeWith === "escape") {
      await page.keyboard.press("Escape");
    } else {
      await page.locator(".menu-popup-dismiss").first().click({ timeout: 3000 });
    }
    await page.waitForTimeout(300);

    if (await isVisible(page, ".menu-popup-overlay")) {
      throw new Error(`${check.id}: lingering .menu-popup-overlay after ${check.closeWith}`);
    }

    const lingering = await visibleBlockingOverlays(page);
    if (lingering.length) {
      throw new Error(`${check.id}: blocking overlay remains ${lingering.join(", ")}`);
    }

    return { ok: true, menu: check.id, closeWith: check.closeWith, url };
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

const results = [];
for (const check of checks) {
  try {
    results.push(await runMenuCheck(check));
  } catch (error) {
    errors.push(error?.message ?? String(error));
  }
}

const result = { baseOrigin, scenario: "office-visuals", checks: results, errors };
console.log(JSON.stringify(result, null, 2));

if (errors.length) process.exit(1);
if (results.length !== checks.length) process.exit(2);

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const runtimeModules =
  process.env.PW_NODE_MODULES ??
  "/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/";
const require = createRequire(runtimeModules);
const { chromium } = require("playwright");

const baseUrl = process.argv[2] ?? "http://127.0.0.1:5222/?scenario=office-visuals";
const screenshotPrefix = process.argv[3] ?? "v0_96_first_screen";
const screenshotDir = fileURLToPath(new URL("../../reports/qa/screenshots/", import.meta.url));
const distIndexPath = fileURLToPath(new URL("../../dist/index.html", import.meta.url));
const distAssetsDir = fileURLToPath(new URL("../../dist/assets/", import.meta.url));
mkdirSync(screenshotDir, { recursive: true });

const errors = [];

async function dismissBlockingSurfaces(page) {
  const selectors = [
    ".payoff-celebration-dismiss",
    ".world-reveal-dismiss",
    ".big-event-dismiss",
    ".offline-modal button",
  ];
  for (let attempt = 0; attempt < 5; attempt += 1) {
    let clicked = false;
    for (const selector of selectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible().catch(() => false)) {
        await button.click({ timeout: 3000 });
        await page.waitForTimeout(250);
        clicked = true;
      }
    }
    if (!clicked) break;
  }
}

async function smoke(viewport, screenshotName) {
  const browser = await chromium.launch({ args: ["--single-process"], headless: true });
  const page = await browser.newPage({ viewport });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
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
    const scenarioSearch = new URL(baseUrl).search;
    await page.goto(`${pathToFileURL(distIndexPath).href}${scenarioSearch}`, { waitUntil: "networkidle" });
  }
  await dismissBlockingSurfaces(page);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${screenshotDir}/${screenshotName}`, fullPage: false });

  const metrics = await page.evaluate(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const viewportArea = vw * vh;

    const isRenderable = (node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
    };
    const clip = (rect) => {
      if (!rect) return { area: 0, height: 0, visible: false };
      const left = Math.max(0, rect.left);
      const top = Math.max(0, rect.top);
      const right = Math.min(vw, rect.right);
      const bottom = Math.min(vh, rect.bottom);
      const w = Math.max(0, right - left);
      const h = Math.max(0, bottom - top);
      return { area: w * h, height: Math.round(h), visible: w > 0 && h > 0 };
    };
    const inRect = (rect, x, y) =>
      !!rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    const office = document.querySelector(".office-scene.pixel-office-theater");
    const officeRect = office?.getBoundingClientRect();
    const officeClip = clip(officeRect);

    const actors = [...document.querySelectorAll(".staff-sprite.pixel-actor")].filter(isRenderable);

    const surfaceSelectors = [
      ".resource-strip",
      ".command-row",
      ".event-stack.office-sightline-event-rail",
      ".menu-layout .menu-panel",
      ".menu-layout .main-menu",
    ];
    let surfaceTextOverflowCount = 0;
    for (const sel of surfaceSelectors) {
      for (const container of document.querySelectorAll(sel)) {
        const nodes = container.querySelectorAll("button, span, strong, small, p, h1, h2, h3, li, em, code");
        for (const node of nodes) {
          if (node.scrollWidth > node.clientWidth + 1) surfaceTextOverflowCount += 1;
        }
      }
    }

    const occluders = [
      document.querySelector(".resource-strip"),
      document.querySelector(".command-row"),
      document.querySelector(".menu-layout"),
    ].map((node) => node?.getBoundingClientRect());
    const cx = officeRect ? (Math.max(0, officeRect.left) + Math.min(vw, officeRect.right)) / 2 : 0;
    const cy = officeRect ? (Math.max(0, officeRect.top) + Math.min(vh, officeRect.bottom)) / 2 : 0;
    const officeCenterOccluded = officeRect ? occluders.some((rect) => inRect(rect, cx, cy)) : true;

    return {
      actorCount: actors.length,
      documentWidthOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      officeCenterOccluded,
      officeVisibleFraction: viewportArea ? Number((officeClip.area / viewportArea).toFixed(3)) : 0,
      officeVisibleHeight: officeClip.height,
      officeVisible: officeClip.visible,
      surfaceTextOverflowCount,
      viewport: { vw, vh },
    };
  });

  await page.close();
  await browser.close();
  return metrics;
}

const desktop = await smoke({ width: 1366, height: 768 }, `${screenshotPrefix}_desktop.png`);
const mobile = await smoke({ width: 390, height: 844, isMobile: true }, `${screenshotPrefix}_mobile.png`);

const result = { baseUrl, desktop, errors, mobile };
console.log(JSON.stringify(result, null, 2));

if (errors.length) process.exit(1);
if (!desktop.officeVisible || !mobile.officeVisible) process.exit(2);
if (desktop.actorCount < 6 || mobile.actorCount < 6) process.exit(3);
if (desktop.officeVisibleFraction < 0.23) process.exit(4);
if (mobile.officeVisibleFraction < 0.21) process.exit(5);
if (desktop.surfaceTextOverflowCount > 0 || mobile.surfaceTextOverflowCount > 0) process.exit(6);
if (desktop.officeCenterOccluded || mobile.officeCenterOccluded) process.exit(7);
if (desktop.documentWidthOverflow !== 0 || mobile.documentWidthOverflow !== 0) process.exit(8);

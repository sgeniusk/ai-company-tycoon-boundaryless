import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire("/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/");
const { chromium } = require("playwright");

const baseUrl = process.argv[2] ?? "http://127.0.0.1:5222/?scenario=office-visuals";
const screenshotPrefix = process.argv[3] ?? "v0_95_event_sightline";
const screenshotDir = "/Users/taewookkim/Downloads/ai-company-tycoon/worktree-main/reports/qa/screenshots";
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

async function smoke(browser, viewport, screenshotName) {
  const page = await browser.newPage({ viewport });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await dismissBlockingSurfaces(page);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${screenshotDir}/${screenshotName}`, fullPage: true });

  const metrics = await page.evaluate(() => {
    const isRenderable = (node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
    };
    const office = document.querySelector(".office-scene.pixel-office-theater");
    const eventStack = document.querySelector(".event-stack.playfield-event-rail.office-sightline-event-rail");
    const eventPanels = [...document.querySelectorAll(".event-stack.office-sightline-event-rail .event-panel")];
    const eventButtons = [...document.querySelectorAll(".event-stack.office-sightline-event-rail .event-choices button")];
    const actors = [...document.querySelectorAll(".staff-sprite.pixel-actor")].filter(isRenderable);
    const officeRect = office?.getBoundingClientRect();
    const eventRect = eventStack?.getBoundingClientRect();
    const overlap =
      officeRect && eventRect
        ? Math.max(0, Math.min(officeRect.right, eventRect.right) - Math.max(officeRect.left, eventRect.left))
          * Math.max(0, Math.min(officeRect.bottom, eventRect.bottom) - Math.max(officeRect.top, eventRect.top))
        : 0;
    const officeArea = officeRect ? officeRect.width * officeRect.height : 0;

    return {
      actorCount: actors.length,
      buttonOverflowCount: eventButtons.filter((node) => node.scrollWidth > node.clientWidth + 1).length,
      documentWidthOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      eventOfficeOverlapRatio: officeArea ? Number((overlap / officeArea).toFixed(3)) : 1,
      eventPanelCount: eventPanels.length,
      eventStackHeight: eventRect ? Math.round(eventRect.height) : 0,
      eventStackMaxHeight: eventStack ? getComputedStyle(eventStack).maxHeight : "",
      officeHeight: officeRect ? Math.round(officeRect.height) : 0,
      tailDisplay: eventPanels[0] ? getComputedStyle(eventPanels[0].querySelector(".event-panel-copy"), "::after").display : "",
      tailContent: eventPanels[0] ? getComputedStyle(eventPanels[0].querySelector(".event-panel-copy"), "::after").content : "",
    };
  });

  await page.close();
  return metrics;
}

const browser = await chromium.launch({ headless: true });
const desktop = await smoke(browser, { width: 1366, height: 768 }, `${screenshotPrefix}_desktop.png`);
const mobile = await smoke(browser, { width: 390, height: 844, isMobile: true }, `${screenshotPrefix}_mobile.png`);
await browser.close();

const result = { baseUrl, desktop, errors, mobile };
console.log(JSON.stringify(result, null, 2));

if (errors.length) process.exit(1);
if (desktop.eventPanelCount < 1 || mobile.eventPanelCount < 1) process.exit(2);
if (desktop.actorCount < 6 || mobile.actorCount < 6) process.exit(3);
if (desktop.eventStackHeight > 128 || mobile.eventStackHeight > 102) process.exit(4);
if (desktop.eventOfficeOverlapRatio > 0.34 || mobile.eventOfficeOverlapRatio > 0.43) process.exit(5);
if (desktop.buttonOverflowCount > 0 || mobile.buttonOverflowCount > 0) process.exit(6);
if (desktop.documentWidthOverflow !== 0 || mobile.documentWidthOverflow !== 0) process.exit(7);
if (!desktop.tailContent.includes("\"\"") || desktop.tailDisplay === "none") process.exit(8);
if (mobile.tailDisplay !== "none") process.exit(9);

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const defaultUrl = "http://127.0.0.1:5201/?scenario=office-visuals";
const defaultOutDir = path.join(root, "reports/qa/screenshots");
const defaultChromeCandidates = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];
const viewports = [
  {
    id: "desktop",
    width: 1366,
    height: 768,
    windowSizeArg: "--window-size=1366,768",
    output: "reports/qa/screenshots/v0_55_office_visuals_desktop.png",
  },
  {
    id: "mobile",
    width: 390,
    height: 844,
    windowSizeArg: "--window-size=390,844",
    output: "reports/qa/screenshots/v0_55_office_visuals_mobile.png",
  },
];

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

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!buffer.subarray(0, 8).equals(signature)) {
    throw new Error(`${filePath} is not a PNG file`);
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

const url = getArg("--url") ?? defaultUrl;
const outDir = resolveProjectPath(getArg("--out-dir")) ?? defaultOutDir;
const chromePath = findChrome(resolveProjectPath(getArg("--chrome")));

if (!chromePath) {
  throw new Error("Chrome or Chromium was not found. Set CHROME_PATH or pass --chrome <path>.");
}

fs.mkdirSync(outDir, { recursive: true });

const screenshots = viewports.map((viewport) => {
  const outputPath = resolveProjectPath(viewport.output) ?? path.join(outDir, path.basename(viewport.output));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const result = spawnSync(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    viewport.windowSizeArg,
    `--screenshot=${outputPath}`,
    url,
  ], { encoding: "utf8" });

  if (result.status !== 0) {
    throw new Error([
      `Chrome screenshot failed for ${viewport.id}`,
      `status=${result.status}`,
      result.stderr.trim(),
      result.stdout.trim(),
    ].filter(Boolean).join("\n"));
  }

  const png = readPngSize(outputPath);
  if (png.width !== viewport.width || png.height !== viewport.height) {
    throw new Error(`${viewport.id} screenshot must be ${viewport.width}x${viewport.height}; received ${png.width}x${png.height}`);
  }

  return {
    id: viewport.id,
    width: viewport.width,
    height: viewport.height,
    path: path.relative(root, outputPath),
    bytes: fs.statSync(outputPath).size,
  };
});

const manifestPath = path.join(outDir, "v0_55_office_visuals_screenshots.json");
fs.writeFileSync(
  manifestPath,
  `${JSON.stringify({
    version: "0.55-alpha",
    captured_at: new Date().toISOString(),
    url,
    chrome_path: chromePath,
    screenshots,
  }, null, 2)}\n`,
);

console.log(`Captured v0.55 office-visuals screenshots: ${path.relative(root, manifestPath)}`);
for (const screenshot of screenshots) {
  console.log(`- ${screenshot.id}: ${screenshot.path} (${screenshot.width}x${screenshot.height}, ${screenshot.bytes} bytes)`);
}

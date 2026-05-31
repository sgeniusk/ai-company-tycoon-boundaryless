import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outPath = path.join(root, "public/assets/ui/v072-competitor-logo-atlas.png");
const frameSize = 32;
const columns = 6;
const rows = 2;
const width = frameSize * columns;
const height = frameSize * rows;

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data = Buffer.alloc(0)) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function writePng(filePath, pixels) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    pixels.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    pngChunk("IEND"),
  ]);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, png);
}

function color(hex, alpha = 255) {
  const normalized = hex.replace("#", "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
    alpha,
  ];
}

const canvas = Buffer.alloc(width * height * 4);

function blendPixel(x, y, rgba) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const offset = (y * width + x) * 4;
  const a = rgba[3] / 255;
  const inv = 1 - a;
  canvas[offset] = Math.round(rgba[0] * a + canvas[offset] * inv);
  canvas[offset + 1] = Math.round(rgba[1] * a + canvas[offset + 1] * inv);
  canvas[offset + 2] = Math.round(rgba[2] * a + canvas[offset + 2] * inv);
  canvas[offset + 3] = Math.min(255, Math.round(rgba[3] + canvas[offset + 3] * inv));
}

function fillRect(x, y, w, h, rgba) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) blendPixel(xx, yy, rgba);
  }
}

function strokeRect(x, y, w, h, rgba, thickness = 2) {
  fillRect(x, y, w, thickness, rgba);
  fillRect(x, y + h - thickness, w, thickness, rgba);
  fillRect(x, y, thickness, h, rgba);
  fillRect(x + w - thickness, y, thickness, h, rgba);
}

function fillCircle(cx, cy, radius, rgba) {
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) blendPixel(x, y, rgba);
    }
  }
}

function line(x1, y1, x2, y2, rgba, thickness = 2) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  for (let i = 0; i <= steps; i += 1) {
    const x = Math.round(x1 + ((x2 - x1) * i) / steps);
    const y = Math.round(y1 + ((y2 - y1) * i) / steps);
    fillRect(x - Math.floor(thickness / 2), y - Math.floor(thickness / 2), thickness, thickness, rgba);
  }
}

function fillDiamond(cx, cy, radius, rgba) {
  for (let y = -radius; y <= radius; y += 1) {
    const span = radius - Math.abs(y);
    fillRect(cx - span, cy + y, span * 2 + 1, 1, rgba);
  }
}

function frameOrigin(index) {
  return [(index % columns) * frameSize, Math.floor(index / columns) * frameSize];
}

function drawBadge(x, y, primary, secondary, accent) {
  fillRect(x + 4, y + 5, 24, 24, color("#0f1715", 170));
  fillRect(x + 3, y + 3, 24, 24, color(secondary, 248));
  strokeRect(x + 3, y + 3, 24, 24, color("#20231f"), 2);
  fillRect(x + 7, y + 7, 16, 16, color(primary, 242));
  fillRect(x + 9, y + 8, 7, 3, color(accent, 225));
}

function drawChatgody(x, y) {
  drawBadge(x, y, "#3f7f52", "#dff1df", "#fff2bf");
  fillRect(x + 9, y + 12, 14, 9, color("#dff1df"));
  fillRect(x + 12, y + 20, 5, 4, color("#dff1df"));
  fillRect(x + 11, y + 8, 3, 4, color("#f2c14e"));
  fillRect(x + 16, y + 7, 4, 5, color("#f2c14e"));
  fillRect(x + 21, y + 8, 3, 4, color("#f2c14e"));
}

function drawCloyi(x, y) {
  drawBadge(x, y, "#d87aa3", "#ffe5f0", "#4b2536");
  fillCircle(x + 16, y + 16, 8, color("#ffe5f0"));
  fillRect(x + 11, y + 15, 3, 3, color("#4b2536"));
  fillRect(x + 19, y + 15, 3, 3, color("#4b2536"));
  fillRect(x + 13, y + 21, 7, 2, color("#d87aa3"));
  line(x + 22, y + 9, x + 26, y + 6, color("#d87aa3"), 3);
  line(x + 26, y + 6, x + 26, y + 12, color("#d87aa3"), 3);
}

function drawJemiinni(x, y) {
  drawBadge(x, y, "#547ad8", "#dce7ff", "#1d2f68");
  fillDiamond(x + 13, y + 15, 6, color("#dce7ff"));
  fillDiamond(x + 20, y + 18, 6, color("#f2cf7f"));
  strokeRect(x + 9, y + 11, 9, 9, color("#1d2f68"), 1);
  strokeRect(x + 16, y + 14, 9, 9, color("#1d2f68"), 1);
}

function drawNovarun(x, y) {
  drawBadge(x, y, "#f09a38", "#fff0cb", "#6b3711");
  fillRect(x + 9, y + 18, 15, 5, color("#fff0cb"));
  fillRect(x + 16, y + 11, 8, 11, color("#547ad8"));
  fillRect(x + 22, y + 13, 5, 7, color("#fff0cb"));
  line(x + 9, y + 15, x + 4, y + 12, color("#f2c14e"), 3);
  line(x + 9, y + 21, x + 4, y + 25, color("#dd6f48"), 3);
}

function drawAutomaru(x, y) {
  drawBadge(x, y, "#68717d", "#e4e8ed", "#283039");
  fillCircle(x + 16, y + 16, 9, color("#e4e8ed"));
  fillCircle(x + 16, y + 16, 4, color("#283039"));
  fillRect(x + 15, y + 5, 3, 5, color("#e4e8ed"));
  fillRect(x + 15, y + 23, 3, 5, color("#e4e8ed"));
  fillRect(x + 5, y + 15, 5, 3, color("#e4e8ed"));
  fillRect(x + 22, y + 15, 5, 3, color("#e4e8ed"));
}

function drawModelforge(x, y) {
  drawBadge(x, y, "#7b5ed7", "#eee7ff", "#2b214d");
  fillRect(x + 10, y + 18, 14, 5, color("#2b214d"));
  fillRect(x + 13, y + 13, 9, 6, color("#eee7ff"));
  fillDiamond(x + 17, y + 12, 5, color("#7b5ed7"));
  line(x + 8, y + 24, x + 25, y + 24, color("#eee7ff"), 2);
}

function drawChipspark(x, y) {
  drawBadge(x, y, "#b58b2a", "#fff2bf", "#48340f");
  fillRect(x + 10, y + 10, 13, 13, color("#48340f"));
  strokeRect(x + 10, y + 10, 13, 13, color("#fff2bf"), 2);
  fillRect(x + 14, y + 14, 5, 5, color("#f2c14e"));
  line(x + 23, y + 8, x + 27, y + 4, color("#fff2bf"), 2);
  line(x + 25, y + 12, x + 29, y + 12, color("#fff2bf"), 2);
}

function drawVizionlab(x, y) {
  drawBadge(x, y, "#2f9a94", "#d8fffb", "#123f3c");
  fillCircle(x + 14, y + 15, 7, color("#d8fffb"));
  fillCircle(x + 14, y + 15, 3, color("#123f3c"));
  line(x + 20, y + 20, x + 25, y + 25, color("#d8fffb"), 3);
  fillRect(x + 22, y + 9, 3, 8, color("#56d6e9"));
}

function drawAutonova(x, y) {
  drawBadge(x, y, "#355f9f", "#dfeaff", "#13294f");
  fillRect(x + 10, y + 9, 14, 14, color("#dfeaff"));
  fillRect(x + 13, y + 23, 8, 4, color("#dfeaff"));
  strokeRect(x + 10, y + 9, 14, 17, color("#13294f"), 2);
  line(x + 14, y + 13, x + 11, y + 23, color("#355f9f"), 2);
  line(x + 19, y + 13, x + 23, y + 23, color("#355f9f"), 2);
}

function drawBrewchain(x, y) {
  drawBadge(x, y, "#8a5a32", "#f8e4c8", "#3b2414");
  fillRect(x + 10, y + 14, 12, 9, color("#f8e4c8"));
  strokeRect(x + 10, y + 14, 12, 9, color("#3b2414"), 2);
  fillRect(x + 22, y + 16, 4, 5, color("#f8e4c8"));
  line(x + 9, y + 11, x + 7, y + 8, color("#f8e4c8"), 2);
  line(x + 16, y + 11, x + 14, y + 8, color("#f8e4c8"), 2);
}

function drawToycloud(x, y) {
  drawBadge(x, y, "#dd6f48", "#ffe1d4", "#5b2515");
  fillCircle(x + 12, y + 16, 5, color("#ffe1d4"));
  fillCircle(x + 18, y + 14, 6, color("#ffe1d4"));
  fillCircle(x + 23, y + 17, 5, color("#ffe1d4"));
  fillRect(x + 10, y + 18, 16, 5, color("#ffe1d4"));
  fillRect(x + 12, y + 22, 5, 5, color("#dd6f48"));
  fillRect(x + 19, y + 22, 5, 5, color("#f2c14e"));
}

function drawIronoracle(x, y) {
  drawBadge(x, y, "#4b5563", "#e5e7eb", "#111827");
  fillRect(x + 9, y + 14, 15, 7, color("#e5e7eb"));
  fillCircle(x + 16, y + 17, 4, color("#111827"));
  fillRect(x + 11, y + 9, 3, 4, color("#f2c14e"));
  fillRect(x + 16, y + 7, 3, 6, color("#f2c14e"));
  fillRect(x + 21, y + 9, 3, 4, color("#f2c14e"));
}

const drawFns = [
  drawChatgody,
  drawCloyi,
  drawJemiinni,
  drawNovarun,
  drawAutomaru,
  drawModelforge,
  drawChipspark,
  drawVizionlab,
  drawAutonova,
  drawBrewchain,
  drawToycloud,
  drawIronoracle,
];

drawFns.forEach((draw, index) => {
  const [x, y] = frameOrigin(index);
  draw(x, y);
});

writePng(outPath, canvas);
console.log(`Wrote ${path.relative(root, outPath)} (${width}x${height})`);

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outPath = path.join(root, "public/assets/ui/v071-commercial-ui-atlas.png");
const iconSize = 48;
const columns = 8;
const rows = 3;
const width = iconSize * columns;
const height = iconSize * rows;

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
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

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

function drawPlaque(x, y, primary, accent = "#fff3c7") {
  fillRect(x + 6, y + 7, 36, 34, color("#101615", 150));
  fillRect(x + 5, y + 5, 36, 34, color("#fff7df", 245));
  strokeRect(x + 5, y + 5, 36, 34, color("#3d3323"), 3);
  fillRect(x + 9, y + 9, 28, 26, color(primary, 235));
  fillRect(x + 12, y + 11, 12, 4, color(accent, 220));
}

function drawCash(x, y) {
  drawPlaque(x, y, "#2d6b4f", "#c9f0aa");
  fillRect(x + 14, y + 19, 20, 11, color("#c9f0aa"));
  strokeRect(x + 14, y + 19, 20, 11, color("#184534"), 2);
  fillCircle(x + 24, y + 24, 4, color("#2d6b4f"));
}

function drawUsers(x, y) {
  drawPlaque(x, y, "#2c5d85", "#dfeaff");
  fillCircle(x + 20, y + 20, 5, color("#fff1ba"));
  fillCircle(x + 30, y + 21, 5, color("#f0c286"));
  fillRect(x + 14, y + 27, 23, 7, color("#dfeaff"));
}

function drawChip(x, y) {
  drawPlaque(x, y, "#334b5e", "#7ed6f1");
  fillRect(x + 15, y + 15, 18, 18, color("#17252f"));
  strokeRect(x + 15, y + 15, 18, 18, color("#7ed6f1"), 3);
  fillRect(x + 21, y + 21, 6, 6, color("#a9e45c"));
  for (let i = 0; i < 4; i += 1) {
    fillRect(x + 11 + i * 7, y + 12, 3, 4, color("#d8dde4"));
    fillRect(x + 11 + i * 7, y + 34, 3, 4, color("#d8dde4"));
  }
}

function drawData(x, y) {
  drawPlaque(x, y, "#7d60c7", "#fff0c8");
  fillRect(x + 16, y + 15, 18, 6, color("#fff0c8"));
  fillRect(x + 15, y + 20, 20, 14, color("#d6a640"));
  strokeRect(x + 15, y + 15, 20, 19, color("#2b214d"), 2);
  fillRect(x + 18, y + 24, 14, 2, color("#fff0c8"));
  fillRect(x + 18, y + 29, 14, 2, color("#fff0c8"));
}

function drawTalent(x, y) {
  drawPlaque(x, y, "#f28a32", "#fff4dc");
  fillCircle(x + 24, y + 19, 6, color("#fff1ba"));
  fillRect(x + 18, y + 27, 12, 7, color("#39a6a3"));
  line(x + 34, y + 13, x + 38, y + 17, color("#fff4dc"), 3);
  line(x + 38, y + 17, x + 33, y + 22, color("#fff4dc"), 3);
}

function drawShield(x, y) {
  drawPlaque(x, y, "#355f9f", "#dfeaff");
  fillRect(x + 17, y + 14, 15, 16, color("#dfeaff"));
  fillRect(x + 20, y + 30, 9, 5, color("#dfeaff"));
  strokeRect(x + 17, y + 14, 15, 19, color("#13294f"), 2);
  line(x + 20, y + 23, x + 24, y + 28, color("#2d6b4f"), 3);
  line(x + 24, y + 28, x + 32, y + 18, color("#2d6b4f"), 3);
}

function drawHype(x, y) {
  drawPlaque(x, y, "#dd6f48", "#ffe1d4");
  fillRect(x + 15, y + 20, 15, 10, color("#ffe1d4"));
  line(x + 30, y + 20, x + 38, y + 16, color("#fff1ba"), 4);
  line(x + 30, y + 30, x + 38, y + 34, color("#fff1ba"), 4);
  fillRect(x + 17, y + 30, 5, 6, color("#5b2515"));
}

function drawGear(x, y) {
  drawPlaque(x, y, "#68717d", "#e4e8ed");
  fillCircle(x + 24, y + 24, 11, color("#e4e8ed"));
  fillCircle(x + 24, y + 24, 5, color("#283039"));
  for (const [tx, ty] of [[23, 10], [23, 35], [10, 23], [35, 23]]) fillRect(x + tx, y + ty, 4, 4, color("#e4e8ed"));
}

function drawBuilding(x, y) {
  drawPlaque(x, y, "#2d6b4f", "#fff7df");
  fillRect(x + 15, y + 15, 19, 20, color("#fff7df"));
  strokeRect(x + 15, y + 15, 19, 20, color("#184534"), 2);
  for (let yy = 18; yy <= 28; yy += 6) for (let xx = 18; xx <= 28; xx += 6) fillRect(x + xx, y + yy, 3, 3, color("#2c5d85"));
}

function drawRocket(x, y) {
  drawPlaque(x, y, "#f09a38", "#fff0cb");
  fillRect(x + 21, y + 13, 8, 20, color("#fff0cb"));
  fillRect(x + 19, y + 18, 12, 10, color("#547ad8"));
  fillRect(x + 17, y + 29, 16, 5, color("#b84c38"));
  fillRect(x + 22, y + 34, 6, 5, color("#f2c14e"));
}

function drawCards(x, y) {
  drawPlaque(x, y, "#7b5ed7", "#eee7ff");
  fillRect(x + 14, y + 16, 14, 19, color("#eee7ff"));
  strokeRect(x + 14, y + 16, 14, 19, color("#2b214d"), 2);
  fillRect(x + 22, y + 13, 14, 19, color("#f2cf7f"));
  strokeRect(x + 22, y + 13, 14, 19, color("#2b214d"), 2);
}

function drawAgent(x, y) {
  drawPlaque(x, y, "#5fc6a6", "#fff1ba");
  fillCircle(x + 24, y + 17, 6, color("#fff1ba"));
  fillRect(x + 17, y + 25, 14, 11, color("#26342d"));
  fillRect(x + 15, y + 20, 4, 4, color("#7ed6f1"));
  fillRect(x + 30, y + 20, 4, 4, color("#7ed6f1"));
}

function drawFlask(x, y) {
  drawPlaque(x, y, "#2f9a94", "#d8fffb");
  fillRect(x + 21, y + 13, 6, 9, color("#d8fffb"));
  fillRect(x + 17, y + 22, 14, 13, color("#56d6e9"));
  strokeRect(x + 17, y + 22, 14, 13, color("#123f3c"), 2);
  fillRect(x + 19, y + 29, 10, 3, color("#a9e45c"));
}

function drawCart(x, y) {
  drawPlaque(x, y, "#b58b2a", "#fff2bf");
  fillRect(x + 14, y + 19, 20, 11, color("#fff2bf"));
  strokeRect(x + 14, y + 19, 20, 11, color("#48340f"), 2);
  fillCircle(x + 18, y + 34, 3, color("#48340f"));
  fillCircle(x + 31, y + 34, 3, color("#48340f"));
}

function drawTrophy(x, y) {
  drawPlaque(x, y, "#d8922b", "#fff3c7");
  fillRect(x + 19, y + 15, 11, 12, color("#fff3c7"));
  strokeRect(x + 19, y + 15, 11, 12, color("#6b3711"), 2);
  fillRect(x + 23, y + 27, 3, 6, color("#fff3c7"));
  fillRect(x + 17, y + 33, 15, 4, color("#fff3c7"));
}

function drawLog(x, y) {
  drawPlaque(x, y, "#8a5a32", "#f8e4c8");
  fillRect(x + 15, y + 14, 19, 22, color("#f8e4c8"));
  strokeRect(x + 15, y + 14, 19, 22, color("#3b2414"), 2);
  fillRect(x + 19, y + 20, 11, 2, color("#8a5a32"));
  fillRect(x + 19, y + 26, 11, 2, color("#8a5a32"));
}

function drawCalendarArrow(x, y) {
  drawPlaque(x, y, "#2d6b4f", "#fff7df");
  fillRect(x + 14, y + 14, 16, 18, color("#fff7df"));
  strokeRect(x + 14, y + 14, 16, 18, color("#184534"), 2);
  fillRect(x + 17, y + 20, 10, 3, color("#d8922b"));
  line(x + 29, y + 24, x + 37, y + 24, color("#f2cf7f"), 4);
  line(x + 34, y + 19, x + 38, y + 24, color("#f2cf7f"), 4);
  line(x + 34, y + 29, x + 38, y + 24, color("#f2cf7f"), 4);
}

function drawSpark(x, y) {
  drawPlaque(x, y, "#f2c14e", "#fffaf0");
  line(x + 24, y + 12, x + 24, y + 36, color("#fffaf0"), 4);
  line(x + 12, y + 24, x + 36, y + 24, color("#fffaf0"), 4);
  line(x + 17, y + 17, x + 31, y + 31, color("#fffaf0"), 3);
  line(x + 31, y + 17, x + 17, y + 31, color("#fffaf0"), 3);
}

function drawDisk(x, y) {
  drawPlaque(x, y, "#314453", "#d8dde4");
  fillRect(x + 15, y + 14, 18, 22, color("#d8dde4"));
  strokeRect(x + 15, y + 14, 18, 22, color("#20292d"), 2);
  fillRect(x + 19, y + 15, 10, 7, color("#56d6e9"));
  fillRect(x + 19, y + 29, 10, 5, color("#fffaf0"));
}

function drawFolder(x, y) {
  drawPlaque(x, y, "#547ad8", "#dce7ff");
  fillRect(x + 14, y + 18, 21, 15, color("#dce7ff"));
  fillRect(x + 16, y + 14, 10, 5, color("#dce7ff"));
  strokeRect(x + 14, y + 18, 21, 15, color("#1d2f68"), 2);
}

function drawGlobe(x, y) {
  drawPlaque(x, y, "#2f9a94", "#d8fffb");
  fillCircle(x + 24, y + 24, 12, color("#d8fffb"));
  strokeRect(x + 17, y + 17, 14, 14, color("#123f3c"), 2);
  line(x + 12, y + 24, x + 36, y + 24, color("#123f3c"), 2);
  line(x + 24, y + 12, x + 24, y + 36, color("#123f3c"), 2);
}

function drawPie(x, y) {
  drawPlaque(x, y, "#39a6a3", "#fff4dc");
  fillCircle(x + 24, y + 24, 12, color("#fff4dc"));
  fillRect(x + 24, y + 12, 12, 12, color("#f28a32"));
  line(x + 24, y + 24, x + 36, y + 15, color("#26342d"), 2);
}

function drawWarning(x, y) {
  drawPlaque(x, y, "#b84c38", "#ffe1d8");
  line(x + 24, y + 12, x + 13, y + 34, color("#ffe1d8"), 5);
  line(x + 24, y + 12, x + 35, y + 34, color("#ffe1d8"), 5);
  line(x + 13, y + 34, x + 35, y + 34, color("#ffe1d8"), 5);
  fillRect(x + 23, y + 21, 3, 8, color("#842d1f"));
  fillRect(x + 23, y + 31, 3, 3, color("#842d1f"));
}

function drawCrest(x, y) {
  drawPlaque(x, y, "#355f9f", "#f2cf7f");
  fillRect(x + 17, y + 14, 14, 15, color("#f2cf7f"));
  fillRect(x + 20, y + 29, 8, 6, color("#f2cf7f"));
  strokeRect(x + 17, y + 14, 14, 20, color("#13294f"), 2);
  fillCircle(x + 24, y + 22, 4, color("#fffaf0"));
}

const drawers = [
  drawCash,
  drawUsers,
  drawChip,
  drawData,
  drawTalent,
  drawShield,
  drawHype,
  drawGear,
  drawBuilding,
  drawRocket,
  drawCards,
  drawAgent,
  drawFlask,
  drawCart,
  drawTrophy,
  drawLog,
  drawCalendarArrow,
  drawSpark,
  drawDisk,
  drawFolder,
  drawGlobe,
  drawPie,
  drawWarning,
  drawCrest,
];

drawers.forEach((draw, index) => {
  const x = (index % columns) * iconSize;
  const y = Math.floor(index / columns) * iconSize;
  draw(x, y);
});

writePng(outPath, canvas);
console.log(`Wrote ${path.relative(root, outPath)} (${width}x${height})`);

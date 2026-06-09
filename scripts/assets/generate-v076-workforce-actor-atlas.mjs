import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { deflateSync } from "node:zlib";

const outputPath = resolve("public/assets/sprites/v076-workforce-actor-atlas.png");
const frameSize = 76;
const columns = 3;
const width = frameSize * columns;
const height = frameSize;
const pixels = new Uint8Array(width * height * 4);

const palette = {
  line: [31, 25, 18, 255],
  shadow: [42, 36, 27, 92],
  shadowDeep: [42, 36, 27, 132],
  cream: [255, 247, 223, 255],
  white: [246, 250, 239, 255],
  gold: [244, 204, 112, 255],
  mint: [95, 198, 166, 255],
  mintDark: [43, 107, 79, 255],
  blue: [51, 95, 122, 255],
  blueDark: [28, 48, 63, 255],
  slate: [72, 86, 98, 255],
  slateDark: [36, 45, 53, 255],
  steel: [138, 154, 160, 255],
  steelLight: [205, 218, 219, 255],
  orange: [232, 144, 67, 255],
  red: [214, 72, 56, 255],
  skin: [245, 184, 132, 255],
  skinShade: [198, 118, 84, 255],
  hair: [40, 38, 34, 255],
  violet: [111, 91, 178, 255],
  violetDark: [63, 55, 113, 255],
};

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const offset = (y * width + x) * 4;
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
  pixels[offset + 3] = color[3];
}

function fillRect(x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) setPixel(xx, yy, color);
  }
}

function strokeRect(x, y, w, h, color) {
  fillRect(x, y, w, 2, color);
  fillRect(x, y + h - 2, w, 2, color);
  fillRect(x, y, 2, h, color);
  fillRect(x + w - 2, y, 2, h, color);
}

function fillCircle(cx, cy, radius, color) {
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) setPixel(x, y, color);
    }
  }
}

function fillEllipse(cx, cy, rx, ry, color) {
  for (let y = cy - ry; y <= cy + ry; y += 1) {
    for (let x = cx - rx; x <= cx + rx; x += 1) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) setPixel(x, y, color);
    }
  }
}

function drawLine(x0, y0, x1, y1, color) {
  let dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  let x = x0;
  let y = y0;

  while (true) {
    fillRect(x, y, 2, 2, color);
    if (x === x1 && y === y1) break;
    const e2 = 2 * error;
    if (e2 >= dy) {
      error += dy;
      x += sx;
    }
    if (e2 <= dx) {
      error += dx;
      y += sy;
    }
  }
}

// 4px 굵기 팔다리용 선 — drawLine의 두꺼운 버전.
function drawThickLine(x0, y0, x1, y1, color) {
  let dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  let x = x0;
  let y = y0;

  while (true) {
    fillRect(x, y, 4, 4, color);
    if (x === x1 && y === y1) break;
    const e2 = 2 * error;
    if (e2 >= dy) {
      error += dy;
      x += sx;
    }
    if (e2 <= dx) {
      error += dx;
      y += sy;
    }
  }
}

function frameX(frameIndex) {
  return frameIndex * frameSize;
}

function drawShadow(originX) {
  fillEllipse(originX + 38, 68, 24, 5, palette.shadow);
  fillEllipse(originX + 38, 69, 14, 3, palette.shadowDeep);
}

function drawHumanOperator(originX) {
  drawShadow(originX);

  fillRect(originX + 25, 56, 11, 10, palette.blueDark);
  fillRect(originX + 42, 56, 11, 10, palette.blueDark);
  fillRect(originX + 22, 65, 15, 4, palette.line);
  fillRect(originX + 40, 65, 15, 4, palette.line);

  fillRect(originX + 24, 32, 30, 27, palette.mintDark);
  fillRect(originX + 28, 33, 22, 26, palette.mint);
  strokeRect(originX + 23, 31, 32, 29, palette.line);
  fillRect(originX + 35, 34, 8, 23, palette.cream);
  fillRect(originX + 36, 38, 6, 3, palette.gold);

  drawThickLine(originX + 24, 38, originX + 15, 50, palette.line);
  drawThickLine(originX + 53, 38, originX + 62, 51, palette.line);
  fillRect(originX + 11, 47, 11, 8, palette.skin);
  fillRect(originX + 57, 48, 11, 8, palette.skin);

  fillRect(originX + 27, 15, 24, 20, palette.skin);
  strokeRect(originX + 26, 14, 26, 22, palette.line);
  fillRect(originX + 25, 12, 29, 10, palette.hair);
  fillRect(originX + 28, 10, 18, 7, palette.hair);
  fillRect(originX + 31, 23, 4, 3, palette.line);
  fillRect(originX + 44, 23, 4, 3, palette.line);
  fillRect(originX + 36, 29, 10, 2, palette.skinShade);

  fillRect(originX + 49, 49, 20, 13, palette.blueDark);
  strokeRect(originX + 48, 48, 22, 15, palette.line);
  fillRect(originX + 53, 52, 12, 2, palette.mint);
  fillRect(originX + 53, 56, 7, 2, palette.gold);
}

function drawAiAgent(originX) {
  drawShadow(originX);

  fillRect(originX + 31, 54, 16, 7, palette.violetDark);
  fillRect(originX + 28, 61, 23, 5, palette.line);
  fillRect(originX + 31, 61, 17, 3, palette.violet);

  fillRect(originX + 25, 36, 28, 22, palette.blueDark);
  fillRect(originX + 28, 37, 22, 19, palette.violet);
  strokeRect(originX + 24, 35, 30, 24, palette.line);
  fillRect(originX + 35, 31, 8, 9, palette.mint);
  fillRect(originX + 34, 30, 10, 2, palette.line);

  fillRect(originX + 21, 13, 36, 26, palette.slateDark);
  strokeRect(originX + 20, 12, 38, 28, palette.line);
  fillRect(originX + 24, 16, 30, 18, palette.blue);
  fillRect(originX + 28, 20, 5, 5, palette.mint);
  fillRect(originX + 45, 20, 5, 5, palette.mint);
  fillRect(originX + 33, 29, 14, 2, palette.gold);
  fillRect(originX + 37, 8, 4, 6, palette.line);
  fillCircle(originX + 39, 7, 3, palette.gold);

  drawThickLine(originX + 24, 43, originX + 13, 35, palette.line);
  drawThickLine(originX + 53, 43, originX + 64, 35, palette.line);
  fillRect(originX + 9, 30, 11, 11, palette.mint);
  fillRect(originX + 58, 30, 11, 11, palette.mint);
  fillRect(originX + 11, 32, 5, 5, palette.white);
  fillRect(originX + 60, 32, 5, 5, palette.white);

  fillRect(originX + 15, 51, 9, 3, palette.mint);
  fillRect(originX + 57, 51, 9, 3, palette.gold);
}

function drawRobotUnit(originX) {
  drawShadow(originX);

  fillRect(originX + 22, 59, 35, 7, palette.slateDark);
  strokeRect(originX + 21, 58, 37, 9, palette.line);
  fillRect(originX + 25, 61, 6, 3, palette.steelLight);
  fillRect(originX + 36, 61, 6, 3, palette.steelLight);
  fillRect(originX + 47, 61, 6, 3, palette.steelLight);

  fillRect(originX + 24, 33, 31, 27, palette.steel);
  fillRect(originX + 28, 36, 23, 20, palette.steelLight);
  strokeRect(originX + 23, 32, 33, 29, palette.line);
  fillRect(originX + 29, 41, 18, 4, palette.blue);
  fillRect(originX + 29, 49, 7, 3, palette.mint);
  fillRect(originX + 40, 49, 7, 3, palette.gold);

  fillRect(originX + 25, 15, 28, 20, palette.steelLight);
  strokeRect(originX + 24, 14, 30, 22, palette.line);
  fillRect(originX + 29, 20, 6, 6, palette.mint);
  fillRect(originX + 42, 20, 6, 6, palette.orange);
  fillRect(originX + 35, 29, 8, 2, palette.slateDark);
  fillRect(originX + 36, 9, 4, 6, palette.line);
  fillRect(originX + 34, 6, 8, 5, palette.red);

  drawThickLine(originX + 24, 40, originX + 12, 49, palette.line);
  drawThickLine(originX + 55, 40, originX + 66, 49, palette.line);
  fillRect(originX + 7, 47, 12, 10, palette.steel);
  fillRect(originX + 61, 47, 12, 10, palette.steel);
  strokeRect(originX + 6, 46, 14, 12, palette.line);
  strokeRect(originX + 60, 46, 14, 12, palette.line);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([length, typeBytes, data, crc]);
}

function encodePng() {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * (width * 4 + 1);
    raw[rowOffset] = 0;
    for (let x = 0; x < width * 4; x += 1) raw[rowOffset + 1 + x] = pixels[y * width * 4 + x];
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

drawHumanOperator(frameX(0));
drawAiAgent(frameX(1));
drawRobotUnit(frameX(2));
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, encodePng());
console.log(`Wrote ${outputPath} (${width}x${height})`);

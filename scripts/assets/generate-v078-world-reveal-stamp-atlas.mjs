import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { deflateSync } from "node:zlib";

const outputPath = resolve("public/assets/ui/v078-world-reveal-stamp-atlas.png");
const frameSize = 64;
const columns = 4;
const width = frameSize * columns;
const height = frameSize;
const pixels = new Uint8Array(width * height * 4);

const palette = {
  line: [25, 22, 17, 255],
  shadow: [10, 12, 16, 100],
  deep: [20, 35, 43, 255],
  panel: [39, 70, 74, 255],
  mint: [96, 218, 183, 255],
  mintDark: [45, 120, 92, 255],
  blue: [63, 114, 163, 255],
  blueDark: [30, 54, 85, 255],
  gold: [244, 203, 91, 255],
  goldLight: [255, 236, 154, 255],
  orange: [232, 137, 62, 255],
  red: [214, 72, 56, 255],
  violet: [114, 91, 184, 255],
  cream: [255, 247, 224, 255],
  skin: [240, 183, 133, 255],
  hair: [42, 38, 33, 255],
  white: [246, 250, 238, 255],
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

function drawBase(originX, accent) {
  fillEllipse(originX + 32, 56, 22, 4, palette.shadow);
  fillRect(originX + 8, 9, 48, 46, palette.line);
  fillRect(originX + 10, 11, 44, 42, palette.deep);
  fillRect(originX + 12, 13, 40, 5, accent);
  fillRect(originX + 12, 48, 40, 3, accent);
}

function drawCity(originX) {
  drawBase(originX, palette.mint);
  fillRect(originX + 15, 35, 8, 12, palette.blueDark);
  fillRect(originX + 26, 27, 10, 20, palette.blue);
  fillRect(originX + 39, 31, 8, 16, palette.mintDark);
  strokeRect(originX + 14, 34, 10, 14, palette.line);
  strokeRect(originX + 25, 26, 12, 22, palette.line);
  strokeRect(originX + 38, 30, 10, 18, palette.line);
  for (let x = 17; x <= 43; x += 8) {
    fillRect(originX + x, 36, 3, 3, palette.goldLight);
    fillRect(originX + x, 43, 3, 3, palette.gold);
  }
  fillRect(originX + 24, 22, 16, 3, palette.goldLight);
}

function drawWorld(originX) {
  drawBase(originX, palette.blue);
  fillCircle(originX + 32, 32, 17, palette.line);
  fillCircle(originX + 32, 32, 14, palette.blue);
  fillRect(originX + 18, 31, 28, 3, palette.mint);
  fillRect(originX + 30, 18, 4, 28, palette.mint);
  fillRect(originX + 22, 24, 8, 6, palette.mintDark);
  fillRect(originX + 35, 35, 9, 7, palette.mintDark);
  fillRect(originX + 25, 40, 6, 4, palette.gold);
  drawLine(originX + 16, 21, originX + 48, 43, palette.goldLight);
}

function drawMarket(originX) {
  drawBase(originX, palette.gold);
  fillRect(originX + 17, 42, 31, 4, palette.line);
  fillRect(originX + 19, 34, 5, 8, palette.red);
  fillRect(originX + 27, 29, 5, 13, palette.orange);
  fillRect(originX + 35, 23, 5, 19, palette.goldLight);
  fillRect(originX + 43, 18, 5, 24, palette.mint);
  drawLine(originX + 20, 30, originX + 29, 25, palette.white);
  drawLine(originX + 29, 25, originX + 38, 20, palette.white);
  drawLine(originX + 38, 20, originX + 49, 16, palette.white);
  fillRect(originX + 47, 13, 6, 6, palette.goldLight);
}

function drawFounder(originX) {
  drawBase(originX, palette.violet);
  fillRect(originX + 22, 34, 20, 14, palette.mintDark);
  strokeRect(originX + 21, 33, 22, 16, palette.line);
  fillRect(originX + 26, 35, 12, 12, palette.cream);
  fillRect(originX + 20, 20, 24, 18, palette.hair);
  fillRect(originX + 23, 22, 18, 17, palette.skin);
  strokeRect(originX + 22, 21, 20, 19, palette.line);
  fillRect(originX + 25, 28, 3, 3, palette.line);
  fillRect(originX + 36, 28, 3, 3, palette.line);
  fillRect(originX + 29, 34, 8, 2, palette.orange);
  fillRect(originX + 43, 36, 8, 10, palette.blueDark);
  strokeRect(originX + 42, 35, 10, 12, palette.line);
  fillRect(originX + 45, 38, 4, 2, palette.mint);
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

drawCity(0);
drawWorld(frameSize);
drawMarket(frameSize * 2);
drawFounder(frameSize * 3);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, encodePng());
console.log(`Wrote ${outputPath} (${width}x${height})`);

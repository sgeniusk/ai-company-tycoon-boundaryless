import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { deflateSync } from "node:zlib";

const outputPath = resolve("public/assets/ui/v077-celebration-emblem-atlas.png");
const frameSize = 80;
const columns = 3;
const width = frameSize * columns;
const height = frameSize;
const pixels = new Uint8Array(width * height * 4);

const palette = {
  line: [27, 22, 18, 255],
  shadow: [18, 16, 18, 122],
  deep: [28, 34, 42, 255],
  deepGreen: [28, 62, 49, 255],
  green: [70, 154, 105, 255],
  mint: [107, 221, 177, 255],
  blue: [65, 112, 154, 255],
  violet: [112, 83, 180, 255],
  orange: [235, 136, 58, 255],
  red: [215, 72, 56, 255],
  gold: [245, 203, 92, 255],
  goldLight: [255, 236, 154, 255],
  cream: [255, 247, 221, 255],
  steel: [141, 158, 165, 255],
  white: [248, 250, 240, 255],
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

function drawFrameBase(originX, accent) {
  fillEllipse(originX + 40, 70, 24, 5, palette.shadow);
  fillCircle(originX + 40, 40, 31, palette.line);
  fillCircle(originX + 40, 40, 28, palette.deep);
  fillCircle(originX + 40, 40, 24, accent);
  fillCircle(originX + 40, 40, 20, palette.deep);
  fillRect(originX + 18, 16, 44, 4, palette.goldLight);
  fillRect(originX + 20, 60, 40, 4, palette.line);
}

function drawSynergy(originX) {
  drawFrameBase(originX, palette.green);

  const nodes = [
    [originX + 28, 30],
    [originX + 52, 30],
    [originX + 40, 50],
  ];
  drawLine(nodes[0][0], nodes[0][1], nodes[1][0], nodes[1][1], palette.mint);
  drawLine(nodes[1][0], nodes[1][1], nodes[2][0], nodes[2][1], palette.mint);
  drawLine(nodes[2][0], nodes[2][1], nodes[0][0], nodes[0][1], palette.mint);
  for (const [x, y] of nodes) {
    fillCircle(x, y, 8, palette.line);
    fillCircle(x, y, 5, palette.goldLight);
  }
  fillRect(originX + 33, 38, 14, 5, palette.cream);
  fillRect(originX + 36, 35, 8, 11, palette.mint);
}

function drawCombo(originX) {
  drawFrameBase(originX, palette.orange);

  fillRect(originX + 32, 17, 15, 22, palette.goldLight);
  fillRect(originX + 25, 34, 19, 10, palette.goldLight);
  fillRect(originX + 38, 39, 12, 20, palette.goldLight);
  fillRect(originX + 31, 55, 17, 6, palette.goldLight);
  strokeRect(originX + 30, 17, 18, 44, palette.line);
  fillRect(originX + 42, 22, 8, 7, palette.red);
  fillRect(originX + 24, 42, 8, 6, palette.violet);
  fillRect(originX + 47, 49, 8, 6, palette.mint);
  drawLine(originX + 22, 25, originX + 58, 57, palette.cream);
  drawLine(originX + 58, 25, originX + 22, 57, palette.cream);
}

function drawAchievement(originX) {
  drawFrameBase(originX, palette.gold);

  fillRect(originX + 27, 23, 26, 26, palette.goldLight);
  strokeRect(originX + 25, 21, 30, 30, palette.line);
  fillRect(originX + 21, 27, 8, 14, palette.goldLight);
  fillRect(originX + 51, 27, 8, 14, palette.goldLight);
  strokeRect(originX + 19, 25, 10, 18, palette.line);
  strokeRect(originX + 51, 25, 10, 18, palette.line);
  fillRect(originX + 35, 51, 10, 8, palette.goldLight);
  fillRect(originX + 29, 58, 22, 6, palette.line);
  fillRect(originX + 31, 58, 18, 4, palette.goldLight);
  fillRect(originX + 37, 29, 6, 14, palette.white);
  fillRect(originX + 33, 33, 14, 6, palette.white);
  fillCircle(originX + 40, 35, 4, palette.mint);
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

drawSynergy(0);
drawCombo(frameSize);
drawAchievement(frameSize * 2);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, encodePng());
console.log(`Wrote ${outputPath} (${width}x${height})`);

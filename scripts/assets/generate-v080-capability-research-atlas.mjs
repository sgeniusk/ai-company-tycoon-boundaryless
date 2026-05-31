import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { deflateSync } from "node:zlib";

const outputPath = resolve("public/assets/ui/v080-capability-research-atlas.png");
const frameSize = 48;
const columns = 6;
const rows = 2;
const width = frameSize * columns;
const height = frameSize * rows;
const pixels = new Uint8Array(width * height * 4);

const palette = {
  line: [25, 22, 17, 255],
  shadow: [10, 12, 16, 92],
  panel: [31, 39, 48, 255],
  panelLight: [64, 78, 91, 255],
  cream: [255, 247, 224, 255],
  white: [247, 250, 240, 255],
  blue: [65, 129, 194, 255],
  blueDark: [31, 58, 103, 255],
  cyan: [91, 210, 217, 255],
  green: [92, 190, 112, 255],
  greenDark: [44, 105, 69, 255],
  mint: [112, 224, 181, 255],
  gold: [242, 193, 70, 255],
  goldLight: [255, 230, 133, 255],
  orange: [230, 132, 58, 255],
  red: [207, 76, 66, 255],
  violet: [125, 96, 202, 255],
  pink: [229, 104, 156, 255],
  steel: [132, 147, 158, 255],
  dark: [17, 23, 31, 255],
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

function origin(frameIndex) {
  return {
    x: (frameIndex % columns) * frameSize,
    y: Math.floor(frameIndex / columns) * frameSize,
  };
}

function drawBase(frameIndex, accent, secondary = palette.panelLight) {
  const { x, y } = origin(frameIndex);
  fillEllipse(x + 24, y + 43, 17, 4, palette.shadow);
  fillRect(x + 5, y + 5, 38, 38, palette.line);
  fillRect(x + 7, y + 7, 34, 34, palette.panel);
  fillRect(x + 9, y + 9, 30, 4, accent);
  fillRect(x + 9, y + 36, 30, 3, secondary);
  return { x, y };
}

function drawLanguage(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.blue, palette.mint);
  fillRect(x + 12, y + 16, 24, 15, palette.cream);
  strokeRect(x + 11, y + 15, 26, 17, palette.line);
  fillRect(x + 16, y + 21, 16, 2, palette.blueDark);
  fillRect(x + 16, y + 26, 11, 2, palette.blueDark);
  fillRect(x + 17, y + 31, 8, 6, palette.cream);
  strokeRect(x + 16, y + 30, 10, 8, palette.line);
}

function drawCode(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.cyan, palette.blue);
  fillRect(x + 12, y + 16, 24, 20, palette.dark);
  strokeRect(x + 11, y + 15, 26, 22, palette.line);
  drawLine(x + 19, y + 21, x + 15, y + 25, palette.cyan);
  drawLine(x + 15, y + 25, x + 19, y + 29, palette.cyan);
  drawLine(x + 29, y + 21, x + 33, y + 25, palette.goldLight);
  drawLine(x + 33, y + 25, x + 29, y + 29, palette.goldLight);
  drawLine(x + 26, y + 20, x + 22, y + 32, palette.white);
}

function drawVision(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.pink, palette.violet);
  fillEllipse(x + 24, y + 25, 16, 10, palette.cream);
  strokeRect(x + 10, y + 20, 28, 11, palette.line);
  fillCircle(x + 24, y + 25, 7, palette.blue);
  fillCircle(x + 24, y + 25, 3, palette.line);
  fillRect(x + 17, y + 15, 5, 4, palette.gold);
  fillRect(x + 29, y + 32, 5, 4, palette.mint);
}

function drawAudio(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.gold, palette.orange);
  fillRect(x + 14, y + 24, 7, 10, palette.goldLight);
  fillRect(x + 21, y + 20, 5, 18, palette.goldLight);
  strokeRect(x + 13, y + 23, 9, 12, palette.line);
  drawLine(x + 26, y + 21, x + 35, y + 15, palette.cyan);
  drawLine(x + 26, y + 28, x + 37, y + 28, palette.cyan);
  drawLine(x + 26, y + 35, x + 35, y + 41, palette.cyan);
  fillCircle(x + 36, y + 15, 2, palette.cyan);
  fillCircle(x + 38, y + 28, 2, palette.cyan);
  fillCircle(x + 36, y + 41, 2, palette.cyan);
}

function drawVideo(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.red, palette.gold);
  fillRect(x + 12, y + 17, 24, 19, palette.blueDark);
  strokeRect(x + 11, y + 16, 26, 21, palette.line);
  fillRect(x + 15, y + 20, 5, 5, palette.cyan);
  fillRect(x + 23, y + 20, 5, 5, palette.pink);
  fillRect(x + 31, y + 20, 4, 5, palette.gold);
  fillRect(x + 15, y + 29, 18, 3, palette.white);
  fillRect(x + 37, y + 22, 5, 9, palette.red);
}

function drawAgent(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.mint, palette.violet);
  fillRect(x + 16, y + 17, 17, 17, palette.steel);
  strokeRect(x + 15, y + 16, 19, 19, palette.line);
  fillRect(x + 21, y + 11, 8, 6, palette.steel);
  strokeRect(x + 20, y + 10, 10, 8, palette.line);
  fillRect(x + 20, y + 23, 3, 3, palette.cyan);
  fillRect(x + 28, y + 23, 3, 3, palette.cyan);
  fillRect(x + 22, y + 30, 8, 2, palette.line);
  drawLine(x + 15, y + 26, x + 9, y + 34, palette.gold);
  drawLine(x + 34, y + 26, x + 41, y + 34, palette.gold);
}

function drawEnterprise(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.blue, palette.steel);
  fillRect(x + 14, y + 19, 20, 19, palette.steel);
  strokeRect(x + 13, y + 18, 22, 21, palette.line);
  fillRect(x + 18, y + 14, 12, 5, palette.blue);
  strokeRect(x + 17, y + 13, 14, 7, palette.line);
  for (let yy = 23; yy <= 33; yy += 5) {
    fillRect(x + 18, y + yy, 4, 3, palette.goldLight);
    fillRect(x + 27, y + yy, 4, 3, palette.goldLight);
  }
}

function drawSafety(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.green, palette.blue);
  fillRect(x + 16, y + 15, 17, 8, palette.green);
  fillRect(x + 14, y + 21, 21, 12, palette.green);
  fillRect(x + 18, y + 33, 13, 6, palette.green);
  strokeRect(x + 13, y + 20, 23, 14, palette.line);
  drawLine(x + 18, y + 26, x + 23, y + 31, palette.white);
  drawLine(x + 23, y + 31, x + 32, y + 22, palette.white);
}

function drawOptimization(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.gold, palette.cyan);
  fillRect(x + 22, y + 13, 9, 12, palette.goldLight);
  fillRect(x + 17, y + 24, 10, 3, palette.goldLight);
  fillRect(x + 20, y + 27, 6, 9, palette.goldLight);
  fillRect(x + 15, y + 29, 7, 3, palette.goldLight);
  strokeRect(x + 16, y + 12, 16, 25, palette.line);
  drawLine(x + 32, y + 29, x + 39, y + 24, palette.cyan);
  fillCircle(x + 40, y + 23, 3, palette.cyan);
}

function drawRobotics(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.cyan, palette.orange);
  fillRect(x + 15, y + 18, 18, 17, palette.steel);
  strokeRect(x + 14, y + 17, 20, 19, palette.line);
  fillCircle(x + 20, y + 24, 2, palette.cyan);
  fillCircle(x + 29, y + 24, 2, palette.cyan);
  fillRect(x + 21, y + 30, 8, 2, palette.line);
  fillRect(x + 18, y + 11, 12, 7, palette.steel);
  strokeRect(x + 17, y + 10, 14, 9, palette.line);
  fillRect(x + 9, y + 28, 6, 4, palette.gold);
  fillRect(x + 34, y + 28, 6, 4, palette.gold);
}

function drawManufacturing(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.orange, palette.steel);
  fillRect(x + 11, y + 28, 26, 10, palette.steel);
  strokeRect(x + 10, y + 27, 28, 12, palette.line);
  fillRect(x + 15, y + 22, 6, 6, palette.orange);
  fillRect(x + 26, y + 18, 6, 10, palette.gold);
  drawLine(x + 12, y + 17, x + 36, y + 17, palette.goldLight);
  drawLine(x + 15, y + 17, x + 21, y + 27, palette.goldLight);
  drawLine(x + 34, y + 17, x + 28, y + 27, palette.goldLight);
}

function drawLogistics(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.green, palette.blue);
  fillRect(x + 10, y + 24, 18, 11, palette.green);
  fillRect(x + 28, y + 27, 10, 8, palette.blue);
  strokeRect(x + 9, y + 23, 20, 13, palette.line);
  strokeRect(x + 27, y + 26, 12, 10, palette.line);
  fillRect(x + 31, y + 28, 5, 4, palette.cyan);
  fillCircle(x + 16, y + 37, 4, palette.line);
  fillCircle(x + 34, y + 37, 4, palette.line);
  fillCircle(x + 16, y + 37, 2, palette.steel);
  fillCircle(x + 34, y + 37, 2, palette.steel);
  fillRect(x + 14, y + 18, 9, 5, palette.gold);
}

const drawings = [
  drawLanguage,
  drawCode,
  drawVision,
  drawAudio,
  drawVideo,
  drawAgent,
  drawEnterprise,
  drawSafety,
  drawOptimization,
  drawRobotics,
  drawManufacturing,
  drawLogistics,
];

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

drawings.forEach((draw, index) => draw(index));
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, encodePng());
console.log(`Wrote ${outputPath} (${width}x${height})`);

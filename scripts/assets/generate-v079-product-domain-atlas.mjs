import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { deflateSync } from "node:zlib";

const outputPath = resolve("public/assets/ui/v079-product-domain-atlas.png");
const frameSize = 48;
const columns = 5;
const rows = 3;
const width = frameSize * columns;
const height = frameSize * rows;
const pixels = new Uint8Array(width * height * 4);

const palette = {
  line: [25, 22, 17, 255],
  shadow: [9, 12, 18, 92],
  panel: [32, 39, 49, 255],
  panelLight: [62, 74, 88, 255],
  cream: [255, 247, 224, 255],
  white: [247, 250, 240, 255],
  blue: [62, 128, 190, 255],
  blueDark: [33, 65, 112, 255],
  cyan: [89, 207, 214, 255],
  green: [92, 190, 112, 255],
  greenDark: [49, 112, 72, 255],
  mint: [116, 224, 183, 255],
  gold: [241, 194, 72, 255],
  goldLight: [255, 229, 128, 255],
  orange: [232, 132, 58, 255],
  red: [207, 76, 66, 255],
  violet: [122, 94, 196, 255],
  violetDark: [72, 58, 128, 255],
  pink: [229, 104, 156, 255],
  steel: [130, 144, 154, 255],
  dark: [18, 24, 31, 255],
  brown: [112, 80, 48, 255],
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

function frameOrigin(frameIndex) {
  return {
    x: (frameIndex % columns) * frameSize,
    y: Math.floor(frameIndex / columns) * frameSize,
  };
}

function drawBase(frameIndex, accent, secondary = palette.panelLight) {
  const { x, y } = frameOrigin(frameIndex);
  fillEllipse(x + 24, y + 43, 17, 4, palette.shadow);
  fillRect(x + 5, y + 5, 38, 38, palette.line);
  fillRect(x + 7, y + 7, 34, 34, palette.panel);
  fillRect(x + 9, y + 9, 30, 4, accent);
  fillRect(x + 9, y + 36, 30, 3, secondary);
  return { x, y };
}

function drawFoundationModels(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.violet, palette.cyan);
  fillCircle(x + 18, y + 24, 8, palette.violet);
  fillCircle(x + 29, y + 24, 8, palette.violet);
  fillCircle(x + 24, y + 18, 7, palette.pink);
  fillRect(x + 16, y + 24, 17, 11, palette.violet);
  strokeRect(x + 14, y + 17, 21, 20, palette.line);
  drawLine(x + 14, y + 24, x + 8, y + 18, palette.cyan);
  drawLine(x + 34, y + 25, x + 40, y + 18, palette.cyan);
  fillRect(x + 7, y + 17, 5, 5, palette.goldLight);
  fillRect(x + 37, y + 17, 5, 5, palette.goldLight);
}

function drawPersonalProductivity(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.green, palette.gold);
  fillRect(x + 15, y + 15, 20, 25, palette.cream);
  strokeRect(x + 14, y + 14, 22, 27, palette.line);
  fillRect(x + 19, y + 12, 12, 5, palette.gold);
  strokeRect(x + 18, y + 11, 14, 7, palette.line);
  for (let yy = 22; yy <= 33; yy += 6) {
    fillRect(x + 19, y + yy, 3, 3, palette.green);
    fillRect(x + 24, y + yy, 8, 2, palette.blueDark);
  }
}

function drawCreatorTools(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.pink, palette.violet);
  fillCircle(x + 24, y + 25, 14, palette.cream);
  fillCircle(x + 17, y + 24, 4, palette.red);
  fillCircle(x + 24, y + 18, 4, palette.gold);
  fillCircle(x + 31, y + 24, 4, palette.blue);
  fillCircle(x + 25, y + 32, 4, palette.green);
  fillCircle(x + 35, y + 32, 4, palette.panel);
  fillRect(x + 28, y + 33, 10, 5, palette.panel);
  strokeRect(x + 11, y + 12, 27, 27, palette.line);
}

function drawDeveloperTools(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.cyan, palette.blue);
  fillRect(x + 13, y + 17, 22, 18, palette.dark);
  strokeRect(x + 12, y + 16, 24, 20, palette.line);
  drawLine(x + 19, y + 22, x + 15, y + 26, palette.cyan);
  drawLine(x + 15, y + 26, x + 19, y + 30, palette.cyan);
  drawLine(x + 29, y + 22, x + 33, y + 26, palette.goldLight);
  drawLine(x + 33, y + 26, x + 29, y + 30, palette.goldLight);
  drawLine(x + 26, y + 21, x + 22, y + 32, palette.white);
}

function drawCustomerSupport(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.blue, palette.mint);
  fillRect(x + 12, y + 17, 24, 16, palette.cream);
  strokeRect(x + 11, y + 16, 26, 18, palette.line);
  fillRect(x + 17, y + 33, 7, 6, palette.cream);
  strokeRect(x + 16, y + 32, 9, 8, palette.line);
  fillRect(x + 17, y + 23, 4, 3, palette.blue);
  fillRect(x + 24, y + 23, 4, 3, palette.blue);
  fillRect(x + 31, y + 23, 4, 3, palette.blue);
}

function drawEducation(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.gold, palette.green);
  fillRect(x + 13, y + 17, 22, 19, palette.blueDark);
  strokeRect(x + 12, y + 16, 24, 21, palette.line);
  fillRect(x + 24, y + 17, 2, 19, palette.gold);
  fillRect(x + 16, y + 21, 6, 2, palette.cream);
  fillRect(x + 28, y + 21, 5, 2, palette.cream);
  fillRect(x + 15, y + 31, 18, 3, palette.goldLight);
  fillRect(x + 29, y + 12, 8, 6, palette.red);
}

function drawEnterpriseAutomation(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.orange, palette.steel);
  fillRect(x + 11, y + 26, 26, 12, palette.steel);
  strokeRect(x + 10, y + 25, 28, 14, palette.line);
  fillRect(x + 14, y + 20, 6, 6, palette.red);
  fillRect(x + 22, y + 16, 8, 10, palette.orange);
  fillRect(x + 31, y + 21, 5, 5, palette.gold);
  for (let xx = 15; xx <= 31; xx += 8) fillRect(x + xx, y + 30, 4, 4, palette.cyan);
}

function drawSemiconductors(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.green, palette.violet);
  fillRect(x + 16, y + 16, 17, 17, palette.green);
  strokeRect(x + 15, y + 15, 19, 19, palette.line);
  fillRect(x + 20, y + 20, 9, 9, palette.dark);
  for (let yy = 15; yy <= 31; yy += 5) {
    fillRect(x + 10, y + yy, 5, 2, palette.goldLight);
    fillRect(x + 34, y + yy, 5, 2, palette.goldLight);
  }
  for (let xx = 17; xx <= 30; xx += 5) {
    fillRect(x + xx, y + 10, 2, 5, palette.goldLight);
    fillRect(x + xx, y + 34, 2, 5, palette.goldLight);
  }
}

function drawMobility(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.blue, palette.red);
  fillRect(x + 11, y + 27, 27, 8, palette.red);
  fillRect(x + 17, y + 21, 14, 8, palette.red);
  strokeRect(x + 10, y + 26, 29, 10, palette.line);
  strokeRect(x + 16, y + 20, 16, 10, palette.line);
  fillRect(x + 20, y + 23, 4, 4, palette.cyan);
  fillRect(x + 26, y + 23, 4, 4, palette.cyan);
  fillCircle(x + 17, y + 36, 4, palette.line);
  fillCircle(x + 33, y + 36, 4, palette.line);
  fillCircle(x + 17, y + 36, 2, palette.steel);
  fillCircle(x + 33, y + 36, 2, palette.steel);
}

function drawRobotics(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.cyan, palette.orange);
  fillRect(x + 16, y + 17, 18, 17, palette.steel);
  strokeRect(x + 15, y + 16, 20, 19, palette.line);
  fillRect(x + 20, y + 11, 9, 6, palette.steel);
  strokeRect(x + 19, y + 10, 11, 8, palette.line);
  fillRect(x + 20, y + 23, 4, 4, palette.cyan);
  fillRect(x + 28, y + 23, 4, 4, palette.cyan);
  fillRect(x + 22, y + 30, 8, 2, palette.line);
  drawLine(x + 15, y + 26, x + 9, y + 33, palette.gold);
  drawLine(x + 35, y + 26, x + 41, y + 33, palette.gold);
}

function drawOddIndustries(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.brown, palette.pink);
  fillRect(x + 16, y + 22, 18, 13, palette.cream);
  strokeRect(x + 15, y + 21, 20, 15, palette.line);
  fillRect(x + 34, y + 25, 6, 7, palette.cream);
  strokeRect(x + 33, y + 24, 8, 9, palette.line);
  fillRect(x + 18, y + 35, 14, 3, palette.brown);
  drawLine(x + 19, y + 17, x + 19, y + 12, palette.white);
  drawLine(x + 25, y + 17, x + 25, y + 11, palette.white);
  fillCircle(x + 29, y + 18, 3, palette.pink);
}

function drawToys(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.pink, palette.gold);
  fillCircle(x + 17, y + 18, 5, palette.brown);
  fillCircle(x + 31, y + 18, 5, palette.brown);
  fillCircle(x + 24, y + 25, 13, palette.brown);
  fillCircle(x + 20, y + 23, 2, palette.line);
  fillCircle(x + 28, y + 23, 2, palette.line);
  fillRect(x + 22, y + 29, 5, 2, palette.line);
  fillRect(x + 17, y + 35, 14, 5, palette.gold);
  strokeRect(x + 16, y + 34, 16, 7, palette.line);
}

function drawManufacturing(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.orange, palette.steel);
  fillRect(x + 12, y + 29, 25, 9, palette.steel);
  strokeRect(x + 11, y + 28, 27, 11, palette.line);
  fillRect(x + 17, y + 22, 6, 7, palette.orange);
  fillRect(x + 27, y + 18, 6, 11, palette.gold);
  drawLine(x + 12, y + 17, x + 36, y + 17, palette.goldLight);
  drawLine(x + 14, y + 17, x + 20, y + 27, palette.goldLight);
  drawLine(x + 34, y + 17, x + 28, y + 27, palette.goldLight);
  fillRect(x + 34, y + 19, 4, 7, palette.red);
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

function drawEnergy(frameIndex) {
  const { x, y } = drawBase(frameIndex, palette.gold, palette.green);
  fillRect(x + 17, y + 14, 17, 25, palette.greenDark);
  strokeRect(x + 16, y + 13, 19, 27, palette.line);
  fillRect(x + 21, y + 10, 9, 4, palette.line);
  fillRect(x + 20, y + 18, 11, 5, palette.green);
  fillRect(x + 20, y + 25, 11, 5, palette.goldLight);
  fillRect(x + 20, y + 32, 11, 4, palette.red);
  drawLine(x + 33, y + 18, x + 40, y + 13, palette.cyan);
  drawLine(x + 40, y + 13, x + 39, y + 24, palette.cyan);
}

const drawings = [
  drawFoundationModels,
  drawPersonalProductivity,
  drawCreatorTools,
  drawDeveloperTools,
  drawCustomerSupport,
  drawEducation,
  drawEnterpriseAutomation,
  drawSemiconductors,
  drawMobility,
  drawRobotics,
  drawOddIndustries,
  drawToys,
  drawManufacturing,
  drawLogistics,
  drawEnergy,
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

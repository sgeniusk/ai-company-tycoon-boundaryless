import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { deflateSync } from "node:zlib";

const outputPath = resolve("public/assets/ui/v081-office-reaction-atlas.png");
const frameSize = 40;
const columns = 6;
const rows = 1;
const width = frameSize * columns;
const height = frameSize * rows;
const pixels = new Uint8Array(width * height * 4);

const palette = {
  line: [35, 28, 20, 255],
  shadow: [24, 20, 16, 90],
  cream: [255, 249, 230, 255],
  paper: [255, 253, 241, 255],
  gold: [244, 198, 78, 255],
  goldLight: [255, 226, 129, 255],
  blue: [68, 124, 184, 255],
  blueDark: [37, 60, 96, 255],
  cyan: [92, 214, 222, 255],
  green: [86, 184, 113, 255],
  mint: [133, 226, 188, 255],
  orange: [231, 134, 58, 255],
  red: [208, 73, 58, 255],
  pink: [232, 112, 158, 255],
  violet: [126, 96, 203, 255],
  steel: [125, 143, 154, 255],
  dark: [20, 24, 30, 255],
  white: [250, 255, 247, 255],
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

function drawBubble(frameIndex, accent = palette.gold) {
  const { x, y } = origin(frameIndex);
  fillEllipse(x + 20, y + 35, 13, 3, palette.shadow);
  fillRect(x + 5, y + 6, 30, 25, palette.line);
  fillRect(x + 7, y + 8, 26, 21, palette.paper);
  fillRect(x + 9, y + 10, 22, 3, accent);
  fillRect(x + 11, y + 29, 7, 5, palette.line);
  fillRect(x + 13, y + 29, 4, 3, palette.paper);
  return { x, y };
}

function drawCodeSpark(frameIndex) {
  const { x, y } = drawBubble(frameIndex, palette.cyan);
  fillRect(x + 11, y + 16, 18, 10, palette.dark);
  strokeRect(x + 10, y + 15, 20, 12, palette.line);
  drawLine(x + 16, y + 18, x + 12, y + 21, palette.cyan);
  drawLine(x + 12, y + 21, x + 16, y + 24, palette.cyan);
  drawLine(x + 25, y + 18, x + 29, y + 21, palette.goldLight);
  drawLine(x + 29, y + 21, x + 25, y + 24, palette.goldLight);
  fillRect(x + 20, y + 18, 2, 8, palette.white);
  fillRect(x + 30, y + 9, 3, 3, palette.gold);
}

function drawIdea(frameIndex) {
  const { x, y } = drawBubble(frameIndex, palette.gold);
  fillCircle(x + 20, y + 19, 8, palette.goldLight);
  strokeRect(x + 15, y + 15, 11, 10, palette.line);
  fillRect(x + 17, y + 26, 7, 4, palette.orange);
  fillRect(x + 18, y + 30, 5, 2, palette.line);
  drawLine(x + 10, y + 15, x + 7, y + 12, palette.gold);
  drawLine(x + 30, y + 15, x + 33, y + 12, palette.gold);
  fillRect(x + 20, y + 11, 2, 3, palette.gold);
}

function drawCoffee(frameIndex) {
  const { x, y } = drawBubble(frameIndex, palette.green);
  fillRect(x + 13, y + 19, 14, 9, palette.mint);
  strokeRect(x + 12, y + 18, 16, 11, palette.line);
  fillRect(x + 27, y + 21, 5, 5, palette.paper);
  strokeRect(x + 26, y + 20, 7, 7, palette.line);
  drawLine(x + 15, y + 16, x + 13, y + 12, palette.steel);
  drawLine(x + 20, y + 16, x + 21, y + 12, palette.steel);
  drawLine(x + 25, y + 16, x + 27, y + 12, palette.steel);
}

function drawAlert(frameIndex) {
  const { x, y } = drawBubble(frameIndex, palette.red);
  fillRect(x + 17, y + 13, 7, 16, palette.red);
  strokeRect(x + 16, y + 12, 9, 18, palette.line);
  fillRect(x + 18, y + 31, 5, 4, palette.red);
  fillRect(x + 28, y + 12, 3, 3, palette.gold);
  fillRect(x + 10, y + 15, 3, 3, palette.red);
}

function drawCheer(frameIndex) {
  const { x, y } = drawBubble(frameIndex, palette.pink);
  fillRect(x + 14, y + 17, 12, 10, palette.gold);
  strokeRect(x + 13, y + 16, 14, 12, palette.line);
  fillRect(x + 17, y + 13, 6, 3, palette.goldLight);
  fillRect(x + 11, y + 20, 5, 4, palette.orange);
  fillRect(x + 24, y + 20, 5, 4, palette.orange);
  fillRect(x + 30, y + 12, 3, 3, palette.cyan);
  fillRect(x + 9, y + 13, 3, 3, palette.violet);
  fillRect(x + 29, y + 29, 3, 3, palette.green);
}

function drawGear(frameIndex) {
  const { x, y } = drawBubble(frameIndex, palette.violet);
  fillCircle(x + 20, y + 22, 9, palette.steel);
  fillCircle(x + 20, y + 22, 4, palette.paper);
  fillRect(x + 18, y + 11, 5, 5, palette.steel);
  fillRect(x + 18, y + 28, 5, 5, palette.steel);
  fillRect(x + 9, y + 20, 5, 5, palette.steel);
  fillRect(x + 27, y + 20, 5, 5, palette.steel);
  strokeRect(x + 13, y + 15, 15, 15, palette.line);
  fillRect(x + 28, y + 11, 4, 3, palette.cyan);
}

const drawings = [drawCodeSpark, drawIdea, drawCoffee, drawAlert, drawCheer, drawGear];

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

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { deflateSync } from "node:zlib";

const outputPath = resolve("public/assets/ui/v075-brand-crest-atlas.png");
const width = 128;
const height = 96;
const pixels = new Uint8Array(width * height * 4);

const palette = {
  transparent: [0, 0, 0, 0],
  line: [29, 23, 15, 255],
  shadow: [15, 31, 29, 255],
  deep: [20, 53, 45, 255],
  green: [43, 107, 79, 255],
  mint: [95, 198, 166, 255],
  gold: [244, 204, 112, 255],
  cream: [255, 247, 223, 255],
  blue: [51, 95, 122, 255],
  slate: [38, 63, 82, 255],
  orange: [232, 144, 67, 255],
};

pixels.fill(0);

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

function drawCrest() {
  fillRect(9, 13, 75, 69, palette.shadow);
  strokeRect(7, 9, 75, 69, palette.line);
  fillRect(9, 11, 71, 65, palette.deep);
  fillRect(13, 15, 63, 11, palette.green);
  fillRect(13, 66, 63, 6, palette.gold);

  fillCircle(44, 43, 24, palette.slate);
  fillCircle(44, 43, 20, palette.deep);
  fillRect(25, 41, 38, 4, palette.mint);
  fillRect(42, 24, 4, 39, palette.mint);
  fillRect(30, 31, 28, 3, palette.green);
  fillRect(30, 53, 28, 3, palette.green);
  fillRect(23, 38, 5, 10, palette.gold);
  fillRect(61, 38, 5, 10, palette.gold);

  const nodes = [
    [44, 22],
    [26, 35],
    [62, 35],
    [30, 57],
    [58, 57],
    [44, 66],
  ];
  for (let index = 1; index < nodes.length; index += 1) drawLine(nodes[0][0], nodes[0][1], nodes[index][0], nodes[index][1], palette.blue);
  for (const [x, y] of nodes) {
    strokeRect(x - 4, y - 4, 8, 8, palette.line);
    fillRect(x - 2, y - 2, 4, 4, palette.gold);
  }

  fillRect(35, 34, 19, 19, palette.cream);
  strokeRect(34, 33, 21, 21, palette.line);
  fillRect(39, 38, 4, 4, palette.deep);
  fillRect(47, 38, 4, 4, palette.deep);
  fillRect(39, 47, 12, 2, palette.green);
  fillRect(42, 53, 6, 9, palette.orange);

  fillRect(88, 21, 26, 8, palette.gold);
  fillRect(88, 33, 32, 6, palette.mint);
  fillRect(88, 43, 24, 6, palette.cream);
  fillRect(88, 57, 31, 4, palette.blue);
  fillRect(88, 65, 19, 4, palette.orange);
  strokeRect(85, 17, 37, 58, palette.line);
  fillRect(87, 19, 33, 2, palette.cream);
  fillRect(87, 73, 33, 2, palette.gold);
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

drawCrest();
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, encodePng());
console.log(`Wrote ${outputPath} (${width}x${height})`);

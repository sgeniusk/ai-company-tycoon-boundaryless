import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { deflateSync } from "node:zlib";

const outputPath = resolve("public/assets/ui/v074-helper-portrait-atlas.png");
const width = 96;
const height = 96;
const pixels = new Uint8Array(width * height * 4);

const palette = {
  bg: [28, 57, 52, 255],
  bgDark: [18, 35, 32, 255],
  bgLight: [56, 98, 84, 255],
  line: [34, 27, 18, 255],
  cream: [255, 247, 223, 255],
  gold: [244, 204, 112, 255],
  skin: [255, 208, 157, 255],
  skinShadow: [214, 143, 102, 255],
  hair: [38, 46, 43, 255],
  hairLight: [72, 93, 78, 255],
  jacket: [45, 107, 79, 255],
  jacketDark: [31, 70, 56, 255],
  mint: [95, 198, 166, 255],
  blue: [51, 95, 122, 255],
  white: [247, 250, 238, 255],
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

function drawBackground() {
  fillRect(0, 0, width, height, palette.bg);
  fillCircle(48, 45, 43, palette.bgLight);
  fillCircle(48, 45, 38, palette.bg);
  for (let y = 8; y < 88; y += 8) {
    for (let x = (y / 8) % 2 === 0 ? 8 : 12; x < 88; x += 16) {
      fillRect(x, y, 4, 2, palette.bgDark);
    }
  }
  fillRect(10, 12, 22, 26, [41, 74, 74, 255]);
  fillRect(64, 14, 20, 22, [41, 74, 74, 255]);
  fillRect(14, 16, 4, 5, palette.gold);
  fillRect(22, 16, 4, 5, palette.mint);
  fillRect(68, 18, 4, 5, palette.gold);
  fillRect(76, 25, 4, 5, palette.mint);
}

function drawMina() {
  fillRect(26, 58, 44, 27, palette.jacketDark);
  fillRect(30, 55, 36, 31, palette.jacket);
  fillRect(42, 54, 12, 18, palette.cream);
  fillRect(38, 57, 8, 11, palette.gold);
  fillRect(52, 57, 8, 11, palette.gold);
  fillRect(24, 68, 8, 16, palette.jacket);
  fillRect(64, 68, 8, 16, palette.jacket);
  strokeRect(28, 55, 40, 32, palette.line);

  fillRect(31, 20, 34, 35, palette.hair);
  fillRect(28, 26, 40, 26, palette.hair);
  fillRect(36, 24, 24, 32, palette.skin);
  fillRect(34, 37, 4, 11, palette.skinShadow);
  fillRect(58, 37, 4, 11, palette.skinShadow);
  fillRect(40, 52, 16, 8, palette.skinShadow);
  fillRect(38, 24, 8, 8, palette.hairLight);
  fillRect(46, 22, 10, 7, palette.hairLight);
  fillRect(56, 27, 7, 12, palette.hair);
  fillRect(32, 29, 8, 16, palette.hair);
  strokeRect(35, 25, 28, 31, palette.line);

  fillRect(41, 39, 4, 3, palette.line);
  fillRect(54, 39, 4, 3, palette.line);
  fillRect(47, 47, 8, 2, palette.skinShadow);
  fillRect(49, 51, 7, 2, palette.line);
  fillRect(50, 52, 4, 2, palette.skinShadow);

  fillRect(27, 34, 7, 16, palette.line);
  fillRect(29, 36, 4, 12, palette.blue);
  fillRect(63, 34, 7, 16, palette.line);
  fillRect(64, 36, 4, 12, palette.blue);
  fillRect(66, 48, 11, 3, palette.line);
  fillRect(76, 49, 3, 7, palette.mint);

  fillRect(60, 70, 22, 15, palette.blue);
  strokeRect(59, 69, 24, 17, palette.line);
  fillRect(64, 74, 14, 2, palette.mint);
  fillRect(64, 79, 10, 2, palette.gold);
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

drawBackground();
drawMina();
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, encodePng());
console.log(`Wrote ${outputPath} (${width}x${height})`);

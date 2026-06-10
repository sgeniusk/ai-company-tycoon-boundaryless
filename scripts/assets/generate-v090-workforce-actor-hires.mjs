import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { deflateSync } from "node:zlib";

const outputPath = resolve("public/assets/sprites/v090-workforce-actor-hires.png");
const frameSize = 256;
const columns = 3;
const width = frameSize * columns;
const height = frameSize;
const pixels = new Uint8Array(width * height * 4);

const palette = {
  line: [31, 25, 18, 255],
  shadow: [42, 36, 27, 88],
  shadowDeep: [42, 36, 27, 128],
  gold: [244, 204, 112, 255],
  mint: [95, 198, 166, 255],
  mintDark: [43, 107, 79, 255],
  cream: [255, 247, 223, 255],
  white: [246, 250, 239, 255],
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

function strokeRect(x, y, w, h, color, thickness = 3) {
  fillRect(x, y, w, thickness, color);
  fillRect(x, y + h - thickness, w, thickness, color);
  fillRect(x, y, thickness, h, color);
  fillRect(x + w - thickness, y, thickness, h, color);
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

function fillPolygon(points, color) {
  const ys = points.map((point) => point[1]);
  const minY = Math.max(0, Math.floor(Math.min(...ys)));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(...ys)));

  for (let y = minY; y <= maxY; y += 1) {
    const intersections = [];
    for (let index = 0; index < points.length; index += 1) {
      const [x1, y1] = points[index];
      const [x2, y2] = points[(index + 1) % points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        intersections.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
      }
    }
    intersections.sort((a, b) => a - b);
    for (let index = 0; index < intersections.length; index += 2) {
      const start = Math.ceil(intersections[index]);
      const end = Math.floor(intersections[index + 1]);
      for (let x = start; x <= end; x += 1) setPixel(x, y, color);
    }
  }
}

function drawThickLine(x0, y0, x1, y1, color, thickness = 5) {
  let dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  let x = x0;
  let y = y0;
  const half = Math.floor(thickness / 2);

  while (true) {
    fillRect(x - half, y - half, thickness, thickness, color);
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

function strokePolygon(points, color, thickness = 5) {
  for (let index = 0; index < points.length; index += 1) {
    const [x1, y1] = points[index];
    const [x2, y2] = points[(index + 1) % points.length];
    drawThickLine(x1, y1, x2, y2, color, thickness);
  }
}

function frameX(frameIndex) {
  return frameIndex * frameSize;
}

function drawShadow(originX) {
  fillEllipse(originX + 128, 230, 67, 13, palette.shadow);
  fillEllipse(originX + 128, 231, 38, 6, palette.shadowDeep);
}

function drawHumanOperator(originX) {
  drawShadow(originX);

  fillRect(originX + 90, 178, 28, 43, palette.blueDark);
  fillRect(originX + 137, 178, 28, 43, palette.blueDark);
  fillRect(originX + 96, 184, 11, 29, palette.blue);
  fillRect(originX + 144, 184, 11, 29, palette.blue);
  fillRect(originX + 83, 218, 43, 9, palette.line);
  fillRect(originX + 131, 218, 43, 9, palette.line);
  fillRect(originX + 95, 214, 24, 5, palette.blue);
  fillRect(originX + 143, 214, 24, 5, palette.blue);

  drawThickLine(originX + 93, 110, originX + 59, 156, palette.line, 9);
  drawThickLine(originX + 95, 112, originX + 63, 154, palette.skin, 5);
  drawThickLine(originX + 163, 109, originX + 187, 155, palette.line, 9);
  drawThickLine(originX + 161, 112, originX + 183, 151, palette.skin, 5);
  fillRect(originX + 49, 150, 25, 19, palette.skin);
  strokeRect(originX + 47, 148, 29, 23, palette.line, 3);
  fillRect(originX + 177, 148, 23, 18, palette.skin);
  strokeRect(originX + 175, 146, 27, 22, palette.line, 3);

  fillRect(originX + 166, 151, 48, 34, palette.blueDark);
  strokeRect(originX + 163, 148, 54, 40, palette.line, 4);
  fillRect(originX + 172, 156, 34, 7, palette.blue);
  fillRect(originX + 172, 169, 22, 5, palette.mint);
  fillRect(originX + 199, 169, 7, 5, palette.gold);
  fillRect(originX + 208, 181, 5, 5, palette.mintDark);

  const torsoOutline = [
    [originX + 86, 93],
    [originX + 170, 93],
    [originX + 183, 176],
    [originX + 74, 176],
  ];
  fillPolygon(torsoOutline, palette.line);
  fillPolygon(
    [
      [originX + 93, 99],
      [originX + 163, 99],
      [originX + 174, 170],
      [originX + 82, 170],
    ],
    palette.mintDark,
  );
  fillPolygon(
    [
      [originX + 101, 101],
      [originX + 124, 104],
      [originX + 118, 168],
      [originX + 88, 168],
    ],
    palette.mint,
  );
  fillPolygon(
    [
      [originX + 132, 104],
      [originX + 155, 101],
      [originX + 168, 168],
      [originX + 138, 168],
    ],
    palette.mint,
  );
  fillPolygon(
    [
      [originX + 119, 99],
      [originX + 138, 99],
      [originX + 144, 170],
      [originX + 113, 170],
    ],
    palette.cream,
  );
  fillRect(originX + 121, 104, 15, 49, palette.white);
  fillRect(originX + 121, 116, 16, 5, palette.gold);
  fillRect(originX + 124, 127, 9, 28, palette.gold);
  fillRect(originX + 111, 139, 10, 4, palette.mintDark);
  fillRect(originX + 138, 139, 11, 4, palette.mintDark);
  fillRect(originX + 96, 158, 18, 4, palette.mintDark);
  fillRect(originX + 145, 158, 18, 4, palette.mintDark);
  strokePolygon(torsoOutline, palette.line, 3);

  fillRect(originX + 112, 81, 32, 21, palette.skin);
  strokeRect(originX + 109, 78, 38, 27, palette.line, 3);
  fillRect(originX + 94, 44, 69, 51, palette.skin);
  strokeRect(originX + 91, 41, 75, 57, palette.line, 4);
  fillRect(originX + 96, 84, 62, 9, palette.skinShade);
  fillRect(originX + 91, 37, 75, 25, palette.hair);
  fillRect(originX + 98, 26, 52, 21, palette.hair);
  fillRect(originX + 86, 48, 19, 47, palette.hair);
  fillRect(originX + 151, 48, 19, 47, palette.hair);
  fillRect(originX + 103, 34, 13, 8, palette.line);
  fillRect(originX + 119, 34, 14, 8, palette.hair);
  fillRect(originX + 137, 34, 13, 8, palette.line);
  fillRect(originX + 109, 65, 9, 9, palette.line);
  fillRect(originX + 140, 65, 9, 9, palette.line);
  fillRect(originX + 122, 80, 26, 4, palette.skinShade);
  fillRect(originX + 111, 55, 13, 4, palette.skinShade);
  fillRect(originX + 135, 55, 12, 4, palette.skinShade);
}

function drawAiAgent(originX) {
  drawShadow(originX);

  drawThickLine(originX + 128, 36, originX + 128, 21, palette.line, 5);
  fillCircle(originX + 128, 17, 9, palette.gold);
  fillCircle(originX + 126, 15, 3, palette.cream);

  fillRect(originX + 73, 40, 110, 70, palette.line);
  fillRect(originX + 80, 47, 96, 56, palette.slateDark);
  fillRect(originX + 87, 54, 82, 41, palette.blueDark);
  fillRect(originX + 96, 59, 18, 18, palette.mint);
  fillRect(originX + 142, 59, 18, 18, palette.mint);
  fillRect(originX + 101, 64, 8, 8, palette.white);
  fillRect(originX + 147, 64, 8, 8, palette.white);
  fillRect(originX + 111, 86, 34, 5, palette.gold);
  fillRect(originX + 87, 54, 82, 5, palette.blue);
  fillRect(originX + 164, 58, 5, 32, palette.slate);
  fillRect(originX + 77, 106, 102, 7, palette.line);

  fillRect(originX + 112, 112, 32, 20, palette.line);
  fillRect(originX + 118, 113, 20, 21, palette.gold);
  const bodyOutline = [
    [originX + 91, 126],
    [originX + 165, 126],
    [originX + 180, 200],
    [originX + 76, 200],
  ];
  fillPolygon(bodyOutline, palette.line);
  fillPolygon(
    [
      [originX + 98, 133],
      [originX + 158, 133],
      [originX + 171, 193],
      [originX + 85, 193],
    ],
    palette.violetDark,
  );
  fillPolygon(
    [
      [originX + 107, 136],
      [originX + 148, 136],
      [originX + 157, 188],
      [originX + 98, 188],
    ],
    palette.violet,
  );
  fillRect(originX + 120, 143, 17, 42, palette.mint);
  fillRect(originX + 113, 151, 31, 5, palette.white);
  fillRect(originX + 112, 171, 32, 5, palette.gold);
  fillRect(originX + 93, 183, 17, 4, palette.violet);
  fillRect(originX + 147, 183, 17, 4, palette.violet);
  strokePolygon(bodyOutline, palette.line, 3);

  fillRect(originX + 86, 203, 84, 10, palette.line);
  fillRect(originX + 98, 203, 61, 6, palette.violet);
  fillRect(originX + 110, 216, 36, 5, palette.mint);
  fillRect(originX + 117, 222, 22, 3, palette.gold);

  fillRect(originX + 36, 157, 41, 35, palette.line);
  fillRect(originX + 43, 163, 27, 23, palette.mint);
  fillRect(originX + 49, 168, 12, 12, palette.white);
  fillRect(originX + 52, 190, 12, 5, palette.gold);
  fillRect(originX + 181, 157, 41, 35, palette.line);
  fillRect(originX + 188, 163, 27, 23, palette.mint);
  fillRect(originX + 194, 168, 12, 12, palette.white);
  fillRect(originX + 191, 190, 17, 5, palette.gold);
  fillRect(originX + 73, 151, 13, 5, palette.mint);
  fillRect(originX + 172, 151, 13, 5, palette.mint);
  fillRect(originX + 65, 132, 9, 5, palette.gold);
  fillRect(originX + 182, 132, 9, 5, palette.gold);
}

function drawRobotUnit(originX) {
  drawShadow(originX);

  fillRect(originX + 74, 209, 108, 15, palette.line);
  fillRect(originX + 82, 211, 92, 8, palette.slateDark);
  fillRect(originX + 92, 213, 15, 5, palette.steelLight);
  fillRect(originX + 121, 213, 15, 5, palette.steelLight);
  fillRect(originX + 150, 213, 15, 5, palette.steelLight);
  fillRect(originX + 92, 184, 22, 29, palette.steel);
  fillRect(originX + 142, 184, 22, 29, palette.steel);
  strokeRect(originX + 88, 181, 30, 36, palette.line, 3);
  strokeRect(originX + 138, 181, 30, 36, palette.line, 3);

  drawThickLine(originX + 88, 130, originX + 52, 171, palette.line, 9);
  drawThickLine(originX + 91, 132, originX + 56, 169, palette.steel, 5);
  drawThickLine(originX + 169, 130, originX + 205, 171, palette.line, 9);
  drawThickLine(originX + 166, 132, originX + 201, 169, palette.steel, 5);
  fillRect(originX + 34, 166, 42, 31, palette.line);
  fillRect(originX + 41, 172, 28, 18, palette.steel);
  fillRect(originX + 35, 192, 13, 13, palette.steelLight);
  fillRect(originX + 53, 192, 13, 13, palette.steelLight);
  fillRect(originX + 181, 166, 42, 31, palette.line);
  fillRect(originX + 188, 172, 28, 18, palette.steel);
  fillRect(originX + 190, 192, 13, 13, palette.steelLight);
  fillRect(originX + 208, 192, 13, 13, palette.steelLight);

  fillRect(originX + 86, 112, 84, 78, palette.line);
  fillRect(originX + 93, 119, 70, 64, palette.steel);
  fillRect(originX + 100, 126, 56, 24, palette.steelLight);
  fillRect(originX + 107, 132, 42, 13, palette.blue);
  fillRect(originX + 102, 158, 20, 8, palette.mint);
  fillRect(originX + 134, 158, 20, 8, palette.gold);
  fillRect(originX + 97, 173, 62, 4, palette.slateDark);
  fillRect(originX + 114, 119, 4, 64, palette.line);
  fillRect(originX + 139, 119, 4, 64, palette.line);
  fillRect(originX + 152, 124, 5, 52, palette.slate);
  strokeRect(originX + 86, 112, 84, 78, palette.line, 4);

  drawThickLine(originX + 128, 40, originX + 128, 27, palette.line, 5);
  fillRect(originX + 116, 20, 25, 13, palette.line);
  fillRect(originX + 120, 18, 17, 13, palette.red);
  fillRect(originX + 123, 19, 6, 4, palette.orange);

  fillRect(originX + 78, 43, 100, 64, palette.line);
  fillRect(originX + 85, 50, 86, 50, palette.steelLight);
  fillRect(originX + 91, 56, 74, 8, palette.white);
  fillRect(originX + 96, 72, 20, 18, palette.mint);
  fillRect(originX + 140, 72, 20, 18, palette.orange);
  fillRect(originX + 101, 77, 9, 8, palette.white);
  fillRect(originX + 145, 77, 9, 8, palette.gold);
  fillRect(originX + 118, 94, 21, 5, palette.slateDark);
  fillRect(originX + 86, 97, 84, 6, palette.steel);
  fillRect(originX + 171, 60, 5, 35, palette.slate);
  fillRect(originX + 81, 60, 5, 35, palette.slate);
  strokeRect(originX + 78, 43, 100, 64, palette.line, 4);
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

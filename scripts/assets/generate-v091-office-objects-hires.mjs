import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import zlib from "node:zlib";

const root = process.cwd();
const sourcePath = path.join(root, "public/assets/sprites/source/v054-office-objects-final-source.png");
const outputPath = path.join(root, "public/assets/sprites/v091-office-objects-hires.png");

const sourceCellWidth = 512;
const sourceCellHeight = 384;
const targetCellWidth = 384;
const targetCellHeight = 288;
const columns = 5;
const rows = 5;
const filledCells = 21;
const width = targetCellWidth * columns;
const height = targetCellHeight * rows;

const objectNames = [
  "obj_desk_monitor",
  "obj_server_dark",
  "obj_cabinet_wood",
  "obj_server_blue",
  "obj_crate_brown",
  "obj_desk_monitor_b",
  "obj_server_slate",
  "obj_cabinet_mint",
  "obj_crate_low",
  "obj_crate_red",
  "obj_desk_green",
  "obj_whiteboard_a",
  "obj_whiteboard_b",
  "obj_printer_blue",
  "obj_server_amber",
  "obj_glassboard_a",
  "obj_printer_cyan",
  "obj_desk_papers",
  "obj_meeting_table",
  "obj_equipment_blue",
  "obj_glassboard_b",
  "obj_empty21",
  "obj_empty22",
  "obj_empty23",
  "obj_empty24",
];

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

function blendColor(a, b, t, alpha = 255) {
  return [
    Math.round(a[0] * (1 - t) + b[0] * t),
    Math.round(a[1] * (1 - t) + b[1] * t),
    Math.round(a[2] * (1 - t) + b[2] * t),
    alpha,
  ];
}

function withAlpha(color, alpha) {
  return [color[0], color[1], color[2], alpha];
}

const shade = {
  shadowSolid: [42, 36, 27, 255],
  shadowSoft: [42, 36, 27, 72],
  woodDeep: blendColor(palette.line, palette.skinShade, 0.42),
  woodMid: blendColor(palette.skinShade, palette.gold, 0.36),
  woodTop: blendColor(palette.gold, palette.cream, 0.28),
  paperShade: blendColor(palette.cream, palette.steelLight, 0.28),
  screenGlow: blendColor(palette.mint, palette.white, 0.52),
  screenBlueLight: blendColor(palette.blue, palette.white, 0.62),
  screenBlueMid: blendColor(palette.blueDark, palette.blue, 0.42),
  metalShade: blendColor(palette.slateDark, palette.steel, 0.32),
  metalLight: blendColor(palette.steelLight, palette.white, 0.42),
  glass: blendColor(palette.blue, palette.white, 0.74),
  glassMint: blendColor(palette.mint, palette.white, 0.44),
  amberDark: blendColor(palette.gold, palette.line, 0.24),
  orangeDark: blendColor(palette.orange, palette.line, 0.22),
  redDark: blendColor(palette.red, palette.line, 0.22),
  violetLight: blendColor(palette.violet, palette.white, 0.34),
};

const quantizeColors = [
  ...Object.values(palette).filter((color) => color[3] === 255),
  shade.shadowSolid,
  shade.woodDeep,
  shade.woodMid,
  shade.woodTop,
  shade.paperShade,
  shade.screenGlow,
  shade.screenBlueLight,
  shade.screenBlueMid,
  shade.metalShade,
  shade.metalLight,
  shade.glass,
  shade.glassMint,
  shade.amberDark,
  shade.orangeDark,
  shade.redDark,
  shade.violetLight,
];

const output = {
  width,
  height,
  data: Buffer.alloc(width * height * 4),
};

function paethPredictor(left, up, upperLeft) {
  const p = left + up - upperLeft;
  const pa = Math.abs(p - left);
  const pb = Math.abs(p - up);
  const pc = Math.abs(p - upperLeft);
  if (pa <= pb && pa <= pc) return left;
  if (pb <= pc) return up;
  return upperLeft;
}

function decodePngRgba(buffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!buffer.subarray(0, 8).equals(signature)) throw new Error("Input is not a PNG file");

  let sourceWidth = 0;
  let sourceHeight = 0;
  let bitDepth = 0;
  let colorType = 0;
  let compression = 0;
  let filter = 0;
  let interlace = 0;
  const idatChunks = [];
  let offset = 8;

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += length + 12;

    if (type === "IHDR") {
      sourceWidth = data.readUInt32BE(0);
      sourceHeight = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      compression = data[10];
      filter = data[11];
      interlace = data[12];
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  if (bitDepth !== 8 || colorType !== 6 || compression !== 0 || filter !== 0 || interlace !== 0) {
    throw new Error("Only 8-bit non-interlaced RGBA PNG sources are supported");
  }

  const inflated = zlib.inflateSync(Buffer.concat(idatChunks));
  const bytesPerPixel = 4;
  const stride = sourceWidth * bytesPerPixel;
  const pixels = Buffer.alloc(sourceWidth * sourceHeight * bytesPerPixel);
  let inputOffset = 0;

  for (let y = 0; y < sourceHeight; y += 1) {
    const filterType = inflated[inputOffset];
    inputOffset += 1;
    const rawRow = inflated.subarray(inputOffset, inputOffset + stride);
    inputOffset += stride;
    const row = Buffer.alloc(stride);

    for (let x = 0; x < stride; x += 1) {
      const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const upperLeft = y > 0 && x >= bytesPerPixel ? pixels[(y - 1) * stride + x - bytesPerPixel] : 0;
      let predictor = 0;

      if (filterType === 1) predictor = left;
      else if (filterType === 2) predictor = up;
      else if (filterType === 3) predictor = Math.floor((left + up) / 2);
      else if (filterType === 4) predictor = paethPredictor(left, up, upperLeft);
      else if (filterType !== 0) throw new Error(`Unsupported PNG row filter ${filterType}`);

      row[x] = (rawRow[x] + predictor) & 0xff;
    }

    row.copy(pixels, y * stride);
  }

  return { width: sourceWidth, height: sourceHeight, data: pixels };
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data = Buffer.alloc(0)) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function writePng(filePath, canvas) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const raw = Buffer.alloc((canvas.width * 4 + 1) * canvas.height);
  for (let y = 0; y < canvas.height; y += 1) {
    const rowStart = y * (canvas.width * 4 + 1);
    raw[rowStart] = 0;
    canvas.data.copy(raw, rowStart + 1, y * canvas.width * 4, (y + 1) * canvas.width * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(canvas.width, 0);
  ihdr.writeUInt32BE(canvas.height, 4);
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

  fs.writeFileSync(filePath, png);
}

function colorDistanceSquared(a, r, g, b) {
  const dr = a[0] - r;
  const dg = a[1] - g;
  const db = a[2] - b;
  return dr * dr + dg * dg + db * db;
}

function quantizePixel(r, g, b, a) {
  if (a < 8) return [0, 0, 0, 0];
  let best = quantizeColors[0];
  let bestDistance = colorDistanceSquared(best, r, g, b);
  for (let index = 1; index < quantizeColors.length; index += 1) {
    const candidate = quantizeColors[index];
    const distance = colorDistanceSquared(candidate, r, g, b);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return [best[0], best[1], best[2], a >= 220 ? 255 : a];
}

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const offset = (Math.floor(y) * width + Math.floor(x)) * 4;
  output.data[offset] = color[0];
  output.data[offset + 1] = color[1];
  output.data[offset + 2] = color[2];
  output.data[offset + 3] = color[3];
}

function blendPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const offset = (Math.floor(y) * width + Math.floor(x)) * 4;
  const sourceAlpha = color[3] / 255;
  const targetAlpha = output.data[offset + 3] / 255;
  const outAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);

  if (outAlpha <= 0) {
    output.data[offset] = 0;
    output.data[offset + 1] = 0;
    output.data[offset + 2] = 0;
    output.data[offset + 3] = 0;
    return;
  }

  output.data[offset] = Math.round((color[0] * sourceAlpha + output.data[offset] * targetAlpha * (1 - sourceAlpha)) / outAlpha);
  output.data[offset + 1] = Math.round((color[1] * sourceAlpha + output.data[offset + 1] * targetAlpha * (1 - sourceAlpha)) / outAlpha);
  output.data[offset + 2] = Math.round((color[2] * sourceAlpha + output.data[offset + 2] * targetAlpha * (1 - sourceAlpha)) / outAlpha);
  output.data[offset + 3] = Math.round(outAlpha * 255);
}

function cellOrigin(cellIndex) {
  return {
    x: (cellIndex % columns) * targetCellWidth,
    y: Math.floor(cellIndex / columns) * targetCellHeight,
  };
}

function scale(value) {
  return Math.round(value * 3);
}

function fillRect(cellIndex, lx, ly, lw, lh, color, mode = "set") {
  const origin = cellOrigin(cellIndex);
  const x0 = origin.x + scale(lx);
  const y0 = origin.y + scale(ly);
  const x1 = origin.x + scale(lx + lw);
  const y1 = origin.y + scale(ly + lh);
  const painter = mode === "blend" ? blendPixel : setPixel;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) painter(x, y, color);
  }
}

function strokeRect(cellIndex, lx, ly, lw, lh, color, thickness = 1) {
  fillRect(cellIndex, lx, ly, lw, thickness, color);
  fillRect(cellIndex, lx, ly + lh - thickness, lw, thickness, color);
  fillRect(cellIndex, lx, ly, thickness, lh, color);
  fillRect(cellIndex, lx + lw - thickness, ly, thickness, lh, color);
}

function drawLine(cellIndex, lx0, ly0, lx1, ly1, color, thickness = 1, mode = "set") {
  const origin = cellOrigin(cellIndex);
  let x0 = origin.x + scale(lx0);
  let y0 = origin.y + scale(ly0);
  const x1 = origin.x + scale(lx1);
  const y1 = origin.y + scale(ly1);
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  const radius = Math.max(0, Math.floor(scale(thickness) / 2));
  const painter = mode === "blend" ? blendPixel : setPixel;

  while (true) {
    for (let yy = y0 - radius; yy <= y0 + radius; yy += 1) {
      for (let xx = x0 - radius; xx <= x0 + radius; xx += 1) painter(xx, yy, color);
    }
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * error;
    if (e2 >= dy) {
      error += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      error += dx;
      y0 += sy;
    }
  }
}

function fillPolygon(cellIndex, points, color, mode = "set") {
  const origin = cellOrigin(cellIndex);
  const scaledPoints = points.map(([x, y]) => [origin.x + scale(x), origin.y + scale(y)]);
  const ys = scaledPoints.map((point) => point[1]);
  const minY = Math.max(origin.y, Math.floor(Math.min(...ys)));
  const maxY = Math.min(origin.y + targetCellHeight - 1, Math.ceil(Math.max(...ys)));
  const painter = mode === "blend" ? blendPixel : setPixel;

  for (let y = minY; y <= maxY; y += 1) {
    const intersections = [];
    for (let index = 0; index < scaledPoints.length; index += 1) {
      const [x1, y1] = scaledPoints[index];
      const [x2, y2] = scaledPoints[(index + 1) % scaledPoints.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        intersections.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
      }
    }
    intersections.sort((a, b) => a - b);
    for (let index = 0; index < intersections.length; index += 2) {
      const start = Math.ceil(intersections[index]);
      const end = Math.floor(intersections[index + 1]);
      for (let x = start; x <= end; x += 1) painter(x, y, color);
    }
  }
}

function fillIsoDiamond(cellIndex, cx, cy, rx, ry, color, mode = "set") {
  fillPolygon(
    cellIndex,
    [
      [cx, cy - ry / 2],
      [cx + rx / 2, cy],
      [cx, cy + ry / 2],
      [cx - rx / 2, cy],
    ],
    color,
    mode,
  );
}

function fillCircle(cellIndex, cx, cy, radius, color) {
  const origin = cellOrigin(cellIndex);
  const centerX = origin.x + scale(cx);
  const centerY = origin.y + scale(cy);
  const scaledRadius = scale(radius);
  for (let y = centerY - scaledRadius; y <= centerY + scaledRadius; y += 1) {
    for (let x = centerX - scaledRadius; x <= centerX + scaledRadius; x += 1) {
      const dx = x - centerX;
      const dy = y - centerY;
      if (dx * dx + dy * dy <= scaledRadius * scaledRadius) setPixel(x, y, color);
    }
  }
}

function clearCell(cellIndex) {
  const origin = cellOrigin(cellIndex);
  for (let y = origin.y; y < origin.y + targetCellHeight; y += 1) {
    output.data.fill(0, (y * width + origin.x) * 4, (y * width + origin.x + targetCellWidth) * 4);
  }
}

function copySourceCells(source) {
  if (source.width !== sourceCellWidth * columns || source.height !== sourceCellHeight * rows) {
    throw new Error(
      `Source sheet must be ${sourceCellWidth * columns}x${sourceCellHeight * rows}; received ${source.width}x${source.height}`,
    );
  }

  for (let cellIndex = 0; cellIndex < filledCells; cellIndex += 1) {
    const sourceCellX = (cellIndex % columns) * sourceCellWidth;
    const sourceCellY = Math.floor(cellIndex / columns) * sourceCellHeight;
    const target = cellOrigin(cellIndex);

    for (let y = 0; y < targetCellHeight; y += 1) {
      const sy = sourceCellY + Math.min(sourceCellHeight - 1, Math.floor(((y + 0.5) * sourceCellHeight) / targetCellHeight));
      for (let x = 0; x < targetCellWidth; x += 1) {
        const sx = sourceCellX + Math.min(sourceCellWidth - 1, Math.floor(((x + 0.5) * sourceCellWidth) / targetCellWidth));
        const sourceOffset = (sy * source.width + sx) * 4;
        const targetOffset = ((target.y + y) * width + target.x + x) * 4;
        const color = quantizePixel(
          source.data[sourceOffset],
          source.data[sourceOffset + 1],
          source.data[sourceOffset + 2],
          source.data[sourceOffset + 3],
        );
        output.data[targetOffset] = color[0];
        output.data[targetOffset + 1] = color[1];
        output.data[targetOffset + 2] = color[2];
        output.data[targetOffset + 3] = color[3];
      }
    }
  }

  for (let cellIndex = filledCells; cellIndex < columns * rows; cellIndex += 1) clearCell(cellIndex);
}

function drawUniversalPolish(cellIndex, markerColor) {
  fillIsoDiamond(cellIndex, 64, 72, 70, 14, shade.shadowSoft, "blend");
  drawLine(cellIndex, 27, 72, 64, 84, shade.shadowSolid, 0.6, "blend");
  drawLine(cellIndex, 64, 84, 101, 72, shade.shadowSolid, 0.6, "blend");
  strokeRect(cellIndex, 91, 18, 10, 10, palette.line, 0.7);
  fillRect(cellIndex, 93, 20, 5, 2, shade.metalLight);
  fillRect(cellIndex, 96, 24, 3, 3, markerColor);
}

function drawDeskDetails(cellIndex, options = {}) {
  const top = options.green ? palette.mintDark : shade.woodMid;
  drawLine(cellIndex, 29, 48, 64, 64, shade.woodDeep, 0.7);
  drawLine(cellIndex, 64, 64, 99, 48, shade.woodDeep, 0.7);
  drawLine(cellIndex, 39, 43, 70, 30, shade.woodTop, 0.7, "blend");
  drawLine(cellIndex, 48, 55, 87, 38, top, 0.6, "blend");
  fillRect(cellIndex, 55, 27, 26, 20, palette.line);
  fillRect(cellIndex, 58, 30, 20, 13, options.green ? palette.mint : shade.woodTop);
  fillRect(cellIndex, 61, 32, 14, 7, options.green ? shade.screenGlow : shade.screenBlueLight);
  fillRect(cellIndex, 62, 34, 10, 1.2, palette.white, "blend");
  fillRect(cellIndex, 56, 47, 22, 3, palette.line);
  fillRect(cellIndex, 60, 47.5, 15, 1.2, palette.slate);
  fillRect(cellIndex, 42, 39, 14, 8, options.paper ? palette.cream : palette.blueDark);
  fillRect(cellIndex, 44, 41, 10, 1.2, options.paper ? shade.paperShade : palette.mint);
  fillRect(cellIndex, 44, 44, 8, 1.2, options.paper ? palette.gold : palette.steelLight);
  fillRect(cellIndex, 39, 53, 5, 16, palette.line);
  fillRect(cellIndex, 83, 53, 5, 16, palette.line);
  fillRect(cellIndex, 40, 53, 3, 10, shade.woodDeep);
  fillRect(cellIndex, 84, 53, 3, 10, shade.woodDeep);
}

function drawRackDetails(cellIndex, options = {}) {
  fillRect(cellIndex, 45, 23, 38, 3, palette.line);
  fillRect(cellIndex, 49, 28, 30, 1.4, shade.metalLight, "blend");
  fillRect(cellIndex, 50, 32, 28, 4, options.warm ? shade.woodTop : shade.screenBlueLight);
  for (const y of [39, 52, 64]) {
    fillRect(cellIndex, 50, y, 28, 1.2, palette.line);
    fillRect(cellIndex, 53, y + 2, 7, 1.2, palette.slate);
    fillRect(cellIndex, 63, y + 2, 7, 1.2, palette.slate);
  }
  for (const [x, y, color] of [
    [51, 43, palette.mint],
    [58, 43, palette.gold],
    [68, 43, options.warm ? palette.orange : palette.mint],
    [75, 43, palette.white],
    [52, 59, options.warm ? palette.red : palette.mint],
    [73, 59, palette.gold],
  ]) {
    fillRect(cellIndex, x, y, 2, 2, color);
  }
  fillRect(cellIndex, 79, 29, 2, 38, withAlpha(shade.metalLight, 188), "blend");
  fillRect(cellIndex, 47, 29, 2, 38, withAlpha(palette.line, 84), "blend");
}

function drawBoardDetails(cellIndex, options = {}) {
  const accent = options.violet ? palette.violet : options.mint ? palette.mint : options.orange ? palette.orange : palette.blue;
  fillRect(cellIndex, 28, 18, 72, 4, palette.line);
  fillRect(cellIndex, 30, 22, 3, 36, withAlpha(palette.line, 64), "blend");
  fillRect(cellIndex, 34, 28, 18, 4, accent);
  fillRect(cellIndex, 56, 37, 26, 4, options.orange ? palette.mintDark : palette.gold);
  fillRect(cellIndex, 39, 47, 39, 1.2, options.violet ? palette.violet : palette.mint);
  fillRect(cellIndex, 36, 52, 18, 1.2, shade.paperShade);
  fillRect(cellIndex, 59, 52, 20, 1.2, shade.paperShade);
  fillRect(cellIndex, 87, 25, 8, 8, withAlpha(shade.woodTop, 216));
  fillRect(cellIndex, 89, 27, 4, 1.2, palette.white, "blend");
  fillRect(cellIndex, 38, 58, 6, 16, palette.line);
  fillRect(cellIndex, 84, 58, 6, 16, palette.line);
  fillRect(cellIndex, 40, 59, 3, 11, shade.woodDeep);
  fillRect(cellIndex, 85, 59, 3, 11, shade.woodDeep);
}

function drawCrateDetails(cellIndex, options = {}) {
  const body = options.red ? palette.red : options.mint ? palette.mintDark : shade.woodDeep;
  fillRect(cellIndex, 41, 37, 46, 2.2, withAlpha(shade.woodTop, 170), "blend");
  fillRect(cellIndex, 42, 45, 44, 1.2, body, "blend");
  fillRect(cellIndex, 42, 57, 44, 1.2, palette.line, "blend");
  fillRect(cellIndex, 48, 27, 10, 8, options.red ? palette.gold : palette.red);
  fillRect(cellIndex, 65, 28, 10, 7, options.red ? palette.line : palette.red);
  fillRect(cellIndex, 51, 29, 4, 2, shade.metalLight, "blend");
  fillRect(cellIndex, 68, 30, 4, 1.2, shade.metalLight, "blend");
  fillRect(cellIndex, 38, 68, 52, 4, palette.line);
}

function drawPodDetails(cellIndex, options = {}) {
  fillRect(cellIndex, 32, 44, 64, 20, palette.line);
  fillRect(cellIndex, 35, 46, 58, 15, options.dark ? palette.blueDark : palette.steelLight);
  fillRect(cellIndex, 38, 34, 52, 17, options.dark ? palette.mint : palette.blue);
  fillRect(cellIndex, 48, 38, 28, 8, options.dark ? shade.screenGlow : shade.screenBlueLight);
  fillRect(cellIndex, 51, 39.5, 18, 1.4, palette.white, "blend");
  fillRect(cellIndex, 34, 61, 58, 4, options.dark ? palette.red : palette.slateDark);
  fillRect(cellIndex, 41, 57, 6, 2, palette.mint);
  fillRect(cellIndex, 51, 57, 6, 2, palette.gold);
  fillRect(cellIndex, 78, 57, 8, 2, palette.line);
}

function drawGlassRoomDetails(cellIndex, options = {}) {
  fillRect(cellIndex, 30, 23, 68, 5, palette.line);
  fillRect(cellIndex, 30, 66, 68, 5, palette.line);
  fillRect(cellIndex, 35, 28, 58, 36, options.safety ? shade.glassMint : shade.glass, "blend");
  drawLine(cellIndex, 40, 30, 52, 62, palette.white, 0.7, "blend");
  drawLine(cellIndex, 78, 30, 90, 62, options.safety ? palette.mint : palette.steelLight, 0.7, "blend");
  fillRect(cellIndex, 48, 34, 8, 26, options.safety ? palette.cream : shade.paperShade);
  fillRect(cellIndex, 70, 34, 8, 26, options.safety ? palette.blueDark : palette.mint);
  if (options.safety) {
    for (const x of [33, 43, 82, 92]) fillRect(cellIndex, x, 68, 5, 2, palette.gold);
  }
}

function drawChargingMatDetails(cellIndex) {
  fillIsoDiamond(cellIndex, 64, 58, 80, 30, withAlpha(palette.slate, 210), "blend");
  drawLine(cellIndex, 32, 58, 64, 70, palette.line, 0.8);
  drawLine(cellIndex, 64, 70, 96, 58, palette.line, 0.8);
  for (const [x, y] of [
    [39, 54],
    [58, 50],
    [77, 54],
  ]) {
    fillRect(cellIndex, x, y, 13, 4, palette.orange);
    fillRect(cellIndex, x + 2, y + 1, 6, 1.2, shade.woodTop, "blend");
  }
  drawLine(cellIndex, 47, 58, 52, 54, palette.gold, 0.7);
  drawLine(cellIndex, 68, 54, 73, 51, palette.mint, 0.7);
  drawLine(cellIndex, 87, 58, 92, 54, palette.gold, 0.7);
}

function drawInventoryDetails(cellIndex) {
  fillRect(cellIndex, 41, 36, 46, 30, palette.blueDark, "blend");
  fillRect(cellIndex, 48, 25, 36, 16, palette.mint);
  fillRect(cellIndex, 50, 29, 10, 8, shade.woodTop);
  fillRect(cellIndex, 66, 30, 10, 6, shade.woodTop);
  fillRect(cellIndex, 50, 31, 8, 1.2, palette.white, "blend");
  fillRect(cellIndex, 66, 32, 7, 1.2, palette.white, "blend");
  fillRect(cellIndex, 46, 48, 36, 1.2, shade.metalLight, "blend");
  fillRect(cellIndex, 46, 58, 36, 1.2, palette.line, "blend");
  fillRect(cellIndex, 38, 68, 52, 5, shade.shadowSolid);
}

function drawMeetingTableDetails(cellIndex) {
  drawLine(cellIndex, 28, 48, 64, 32, shade.woodTop, 0.8, "blend");
  drawLine(cellIndex, 64, 32, 100, 48, shade.woodDeep, 0.8, "blend");
  drawLine(cellIndex, 38, 55, 64, 66, palette.line, 0.7, "blend");
  drawLine(cellIndex, 64, 66, 90, 55, palette.line, 0.7, "blend");
  fillRect(cellIndex, 54, 37, 11, 7, palette.cream);
  fillRect(cellIndex, 68, 39, 9, 6, palette.gold);
  fillRect(cellIndex, 58, 39, 4, 1.2, shade.paperShade);
  fillRect(cellIndex, 70, 41, 4, 1.2, palette.white, "blend");
}

function drawPrototypePrinterDetails(cellIndex) {
  drawDeskDetails(cellIndex, { paper: true });
  fillRect(cellIndex, 55, 27, 26, 20, palette.line);
  fillRect(cellIndex, 59, 30, 18, 12, palette.blueDark);
  fillRect(cellIndex, 61, 32, 12, 5, shade.screenBlueLight);
  fillRect(cellIndex, 43, 36, 16, 8, palette.cream);
  fillRect(cellIndex, 45, 38, 12, 1.2, palette.gold);
  fillRect(cellIndex, 70, 51, 13, 4, palette.gold);
  fillRect(cellIndex, 72, 53, 9, 2, palette.orange);
}

function applyEnhancementPasses() {
  for (let cellIndex = 0; cellIndex < filledCells; cellIndex += 1) {
    drawUniversalPolish(cellIndex, cellIndex % 2 === 0 ? palette.mint : palette.gold);
  }

  drawDeskDetails(0);
  drawRackDetails(1);
  drawBoardDetails(2, { orange: true });
  drawBoardDetails(3);
  drawCrateDetails(4);
  drawMeetingTableDetails(5);
  drawDeskDetails(5, { paper: true });
  drawRackDetails(6);
  drawBoardDetails(7, { mint: true });
  drawCrateDetails(8);
  drawCrateDetails(9, { red: true });
  drawDeskDetails(10, { green: true, paper: true });
  drawBoardDetails(11, { mint: true });
  drawBoardDetails(12, { violet: true });
  drawPodDetails(13);
  drawRackDetails(14, { warm: true });
  drawGlassRoomDetails(15);
  drawPodDetails(16, { dark: true });
  drawPrototypePrinterDetails(17);
  drawChargingMatDetails(18);
  drawInventoryDetails(19);
  drawGlassRoomDetails(20, { safety: true });

  for (let cellIndex = filledCells; cellIndex < columns * rows; cellIndex += 1) clearCell(cellIndex);
}

const source = decodePngRgba(fs.readFileSync(sourcePath));
copySourceCells(source);
applyEnhancementPasses();
writePng(outputPath, output);

console.log(
  `Wrote ${path.relative(root, outputPath)} (${width}x${height}, ${columns}x${rows}, filled ${filledCells}/${objectNames.length} cells)`,
);

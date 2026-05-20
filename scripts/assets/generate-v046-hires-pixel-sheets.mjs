import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import zlib from "node:zlib";

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, "data/asset_manifest.json"), "utf8"));

const outSprites = path.join(root, "public/assets/sprites");
const outBackgrounds = path.join(root, "public/assets/backgrounds");
fs.mkdirSync(outSprites, { recursive: true });
fs.mkdirSync(outBackgrounds, { recursive: true });

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
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

function hexToRgba(hex, alpha = 255) {
  const normalized = hex.replace("#", "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
    alpha,
  ];
}

const pixelDensity = 2;
const agentBaseModes = ["idle", "work"];
const agentEventPoseModes = ["idle", "work", "card_use", "cheer", "alert"];

function canvas(width, height, background = [0, 0, 0, 0], density = 1) {
  const actualWidth = Math.round(width * density);
  const actualHeight = Math.round(height * density);
  const data = Buffer.alloc(actualWidth * actualHeight * 4);
  const result = { width: actualWidth, height: actualHeight, data, density };
  fillRect(result, 0, 0, width, height, background);
  return result;
}

function setPixel(target, x, y, color) {
  x *= target.density ?? 1;
  y *= target.density ?? 1;
  if (x < 0 || y < 0 || x >= target.width || y >= target.height) return;
  const offset = (Math.floor(y) * target.width + Math.floor(x)) * 4;
  target.data[offset] = color[0];
  target.data[offset + 1] = color[1];
  target.data[offset + 2] = color[2];
  target.data[offset + 3] = color[3];
}

function fillRectRaw(target, x, y, width, height, color) {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(target.width, Math.ceil(x + width));
  const y1 = Math.min(target.height, Math.ceil(y + height));
  for (let yy = y0; yy < y1; yy += 1) {
    let offset = (yy * target.width + x0) * 4;
    for (let xx = x0; xx < x1; xx += 1) {
      target.data[offset] = color[0];
      target.data[offset + 1] = color[1];
      target.data[offset + 2] = color[2];
      target.data[offset + 3] = color[3];
      offset += 4;
    }
  }
}

function fillRect(target, x, y, width, height, color) {
  const density = target.density ?? 1;
  fillRectRaw(target, x * density, y * density, width * density, height * density, color);
}

function fillPolygon(target, points, color) {
  const density = target.density ?? 1;
  const scaledPoints = points.map((point) => [point[0] * density, point[1] * density]);
  const minY = Math.max(0, Math.floor(Math.min(...scaledPoints.map((point) => point[1]))));
  const maxY = Math.min(target.height - 1, Math.ceil(Math.max(...scaledPoints.map((point) => point[1]))));

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
      fillRectRaw(target, intersections[index], y, intersections[index + 1] - intersections[index] + 1, 1, color);
    }
  }
}

function line(target, x0, y0, x1, y1, color, thickness = 1) {
  const density = target.density ?? 1;
  x0 *= density;
  y0 *= density;
  x1 *= density;
  y1 *= density;
  thickness *= density;
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  let dx = Math.abs(x1 - x0);
  let sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0);
  let sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  let x = x0;
  let y = y0;

  while (true) {
    fillRectRaw(target, x - Math.floor(thickness / 2), y - Math.floor(thickness / 2), thickness, thickness, color);
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
    dx = Math.abs(x1 - x0);
    dy = -Math.abs(y1 - y0);
  }
}

function drawIsoDiamond(target, cx, cy, width, height, color, outline) {
  const points = [
    [cx, cy - height / 2],
    [cx + width / 2, cy],
    [cx, cy + height / 2],
    [cx - width / 2, cy],
  ];
  fillPolygon(target, points, color);
  if (outline) {
    line(target, points[0][0], points[0][1], points[1][0], points[1][1], outline, 2);
    line(target, points[1][0], points[1][1], points[2][0], points[2][1], outline, 2);
    line(target, points[2][0], points[2][1], points[3][0], points[3][1], outline, 2);
    line(target, points[3][0], points[3][1], points[0][0], points[0][1], outline, 2);
  }
}

function drawAgentFrame(target, ox, oy, sprite, agentIndex, mode, frame) {
  const [primary, secondary, accent] = sprite.palette.map((color) => hexToRgba(color));
  const skin = hexToRgba(["#f1bd88", "#d99a69", "#f0c9a0", "#c68e63", "#e6b377"][agentIndex] ?? "#f1bd88");
  const hair = hexToRgba(["#29363f", "#553728", "#4d3369", "#667580", "#b84c38"][agentIndex] ?? "#29363f");
  const shadow = [35, 33, 28, 90];
  const white = hexToRgba("#fffaf0");
  const dark = hexToRgba("#1f2224");
  const bob = mode === "cheer" ? (frame === 1 ? -6 : -3) : mode === "alert" ? (frame === 1 ? -2 : 1) : frame === 1 ? -3 : 0;
  const workShift = mode === "work" ? (frame - 1) * 3 : 0;
  const pulseShift = frame === 1 ? 2 : 0;

  drawIsoDiamond(target, ox + 48, oy + 76, 48, 18, shadow);
  fillRect(target, ox + 39, oy + 47 + bob, 21, 26, primary);
  fillRect(target, ox + 36, oy + 52 + bob, 6, 18, dark);
  fillRect(target, ox + 58, oy + 53 + bob, 6, 17, dark);
  fillRect(target, ox + 42, oy + 71, 6, 10, dark);
  fillRect(target, ox + 52, oy + 71, 6, 10, dark);
  fillRect(target, ox + 39, oy + 29 + bob, 22, 20, skin);
  fillRect(target, ox + 36, oy + 25 + bob, 28, 9, hair);
  fillRect(target, ox + 35, oy + 32 + bob, 7, 12, hair);
  fillRect(target, ox + 55, oy + 32 + bob, 8, 10, hair);
  fillRect(target, ox + 44, oy + 38 + bob, 4, 4, dark);
  fillRect(target, ox + 55, oy + 38 + bob, 4, 4, dark);
  fillRect(target, ox + 46.5, oy + 42.5 + bob, 8, 1, hexToRgba("#7d3b32"));
  fillRect(target, ox + 48.5, oy + 33.5 + bob, 2, 2, hexToRgba("#ffe4bd"));
  fillRect(target, ox + 38.5, oy + 28.5 + bob, 8, 1.5, hexToRgba("#f5d174"));
  fillRect(target, ox + 46, oy + 46 + bob, 10, 3, accent);
  fillRect(target, ox + 42.5, oy + 52 + bob, 15, 2, secondary);
  fillRect(target, ox + 45, oy + 56 + bob, 10, 1.5, hexToRgba("#fff2b8"));

  if (mode === "work") {
    fillRect(target, ox + 61 + workShift, oy + 47 + bob, 20, 13, secondary);
    fillRect(target, ox + 65 + workShift, oy + 50 + bob, 12, 5, white);
    fillRect(target, ox + 68 + workShift, oy + 52 + bob, 8, 1.5, accent);
    fillRect(target, ox + 29 + workShift, oy + 54 + bob, 13, 7, accent);
  } else if (mode === "card_use") {
    line(target, ox + 40, oy + 55 + bob, ox + 27 - pulseShift, oy + 45 + bob, secondary, 4);
    line(target, ox + 59, oy + 55 + bob, ox + 77 + pulseShift, oy + 42 + bob, secondary, 4);
    fillRect(target, ox + 72 + pulseShift, oy + 34 + bob, 18, 14, white);
    fillRect(target, ox + 75 + pulseShift, oy + 37 + bob, 12, 2, accent);
    fillRect(target, ox + 78 + pulseShift, oy + 42 + bob, 8, 2, secondary);
    fillRect(target, ox + 25 - pulseShift, oy + 39 + bob, 12, 9, accent);
    fillRect(target, ox + 79 + pulseShift, oy + 25 + bob, 4, 4, hexToRgba("#f2cf7f"));
    fillRect(target, ox + 86 + pulseShift, oy + 30 + bob, 3, 3, hexToRgba("#f2cf7f"));
  } else if (mode === "cheer") {
    line(target, ox + 40, oy + 52 + bob, ox + 30 - pulseShift, oy + 29 + bob, secondary, 4);
    line(target, ox + 59, oy + 52 + bob, ox + 70 + pulseShift, oy + 29 + bob, secondary, 4);
    fillRect(target, ox + 28 - pulseShift, oy + 24 + bob, 7, 7, accent);
    fillRect(target, ox + 67 + pulseShift, oy + 24 + bob, 7, 7, accent);
    fillRect(target, ox + 78, oy + 18 + bob, 6, 6, hexToRgba("#f2cf7f"));
    fillRect(target, ox + 20, oy + 20 + bob, 5, 5, hexToRgba("#73e08c"));
  } else if (mode === "alert") {
    line(target, ox + 40, oy + 55 + bob, ox + 29, oy + 47 + bob, dark, 4);
    line(target, ox + 59, oy + 55 + bob, ox + 72, oy + 47 + bob, dark, 4);
    fillRect(target, ox + 67, oy + 17 + bob, 14, 23, hexToRgba("#d64838"));
    fillRect(target, ox + 72, oy + 20 + bob, 4, 12, white);
    fillRect(target, ox + 72, oy + 35 + bob, 4, 4, white);
    fillRect(target, ox + 26, oy + 43 + bob, 11, 9, hexToRgba("#d64838"));
  } else {
    fillRect(target, ox + 29, oy + 55 + bob, 12, 6, secondary);
    fillRect(target, ox + 60, oy + 55 + bob, 10, 6, secondary);
  }

  if (agentIndex === 0) {
    fillRect(target, ox + 41, oy + 36 + bob, 18, 4, hexToRgba("#5fc6a6"));
  } else if (agentIndex === 1) {
    fillRect(target, ox + 66, oy + 30 + bob, 8, 22, secondary);
  } else if (agentIndex === 2) {
    fillRect(target, ox + 31, oy + 43 + bob, 9, 21, hexToRgba("#d6a640"));
  } else if (agentIndex === 3) {
    fillRect(target, ox + 33, oy + 68, 29, 6, hexToRgba("#a9e45c"));
  } else {
    fillRect(target, ox + 30, oy + 24 + bob, 14, 9, hexToRgba("#f28a32"));
  }
}

function buildAgentSheet(modes = agentBaseModes) {
  const frameWidth = 96;
  const frameHeight = 96;
  const columns = 3;
  const sheet = canvas(frameWidth * columns, frameHeight * manifest.agent_sprites.length * modes.length, [0, 0, 0, 0], pixelDensity);

  manifest.agent_sprites.forEach((sprite, index) => {
    for (let frame = 0; frame < columns; frame += 1) {
      modes.forEach((mode, modeIndex) => {
        drawAgentFrame(sheet, frame * frameWidth, (index * modes.length + modeIndex) * frameHeight, sprite, index, mode, frame);
      });
    }
  });

  return sheet;
}

function drawOfficeObject(target, ox, oy, object, index) {
  const [primary, secondary, accent] = object.palette.map((color) => hexToRgba(color));
  const lineColor = hexToRgba("#2f2518");
  const glass = [216, 240, 255, 210];
  const shadow = [35, 33, 28, 80];
  const white = hexToRgba("#fffaf0");
  const id = object.object_id;

  drawIsoDiamond(target, ox + 64, oy + 72, 86, 28, shadow);
  if (id.includes("rack") || id.includes("server") || id.includes("console")) {
    fillRect(target, ox + 45, oy + 23, 38, 48, primary);
    fillRect(target, ox + 50, oy + 29, 28, 7, secondary);
    fillRect(target, ox + 50, oy + 42, 9, 9, accent);
    fillRect(target, ox + 64, oy + 42, 9, 9, accent);
    fillRect(target, ox + 50, oy + 57, 28, 5, secondary);
    fillRect(target, ox + 55.5, oy + 31.5, 17, 1.5, glass);
    fillRect(target, ox + 43, oy + 21, 42, 4, lineColor);
  } else if (id.includes("board") || id.includes("wall") || id.includes("banner")) {
    fillRect(target, ox + 32, oy + 22, 64, 38, secondary);
    fillRect(target, ox + 28, oy + 18, 72, 5, lineColor);
    fillRect(target, ox + 34, oy + 28, 18, 5, primary);
    fillRect(target, ox + 56, oy + 37, 26, 5, accent);
    fillRect(target, ox + 39.5, oy + 47.5, 39, 1.5, primary);
    fillRect(target, ox + 38, oy + 58, 6, 16, lineColor);
    fillRect(target, ox + 84, oy + 58, 6, 16, lineColor);
  } else if (id.includes("pod") || id.includes("capsule")) {
    fillRect(target, ox + 32, oy + 44, 64, 20, primary);
    fillRect(target, ox + 38, oy + 34, 52, 17, secondary);
    fillRect(target, ox + 48, oy + 38, 28, 8, glass);
    fillRect(target, ox + 34, oy + 61, 58, 5, accent);
    fillRect(target, ox + 51.5, oy + 39.5, 18, 1.5, white);
  } else if (id.includes("table") || id.includes("desk")) {
    drawIsoDiamond(target, ox + 64, oy + 48, 72, 34, primary, lineColor);
    fillRect(target, ox + 38, oy + 49, 7, 20, lineColor);
    fillRect(target, ox + 82, oy + 49, 7, 20, lineColor);
    fillRect(target, ox + 55, oy + 27, 26, 20, secondary);
    fillRect(target, ox + 60, oy + 32, 16, 9, glass);
    fillRect(target, ox + 42, oy + 39, 14, 8, accent);
    fillRect(target, ox + 61.5, oy + 33.5, 10, 1.5, white);
  } else if (id.includes("charging") || id.includes("mat")) {
    drawIsoDiamond(target, ox + 64, oy + 58, 80, 30, primary, lineColor);
    fillRect(target, ox + 39, oy + 54, 13, 5, secondary);
    fillRect(target, ox + 58, oy + 50, 13, 5, secondary);
    fillRect(target, ox + 77, oy + 54, 13, 5, secondary);
  } else if (id.includes("mirror") || id.includes("cage")) {
    fillRect(target, ox + 34, oy + 27, 60, 42, glass);
    fillRect(target, ox + 30, oy + 23, 68, 5, lineColor);
    fillRect(target, ox + 30, oy + 66, 68, 5, lineColor);
    fillRect(target, ox + 48, oy + 34, 8, 26, primary);
    fillRect(target, ox + 70, oy + 34, 8, 26, accent);
  } else {
    fillRect(target, ox + 40, oy + 36, 48, 34, primary);
    fillRect(target, ox + 46, oy + 25, 36, 16, secondary);
    fillRect(target, ox + 50, oy + 29, 10, 8, accent);
    fillRect(target, ox + 66, oy + 30, 10, 6, accent);
    fillRect(target, ox + 38, oy + 68, 52, 5, lineColor);
  }

  fillRect(target, ox + 91, oy + 18, 10, 10, hexToRgba(index % 2 ? "#f2cf7f" : "#73e08c"));
}

function buildOfficeObjectSheet() {
  const frameWidth = 128;
  const frameHeight = 96;
  const columns = 5;
  const rows = Math.ceil(manifest.office_objects.length / columns);
  const sheet = canvas(frameWidth * columns, frameHeight * rows, [0, 0, 0, 0], pixelDensity);

  manifest.office_objects.forEach((object, index) => {
    const ox = (index % columns) * frameWidth;
    const oy = Math.floor(index / columns) * frameHeight;
    drawOfficeObject(sheet, ox, oy, object, index);
  });

  return sheet;
}

function buildOfficeBackground() {
  const target = canvas(1280, 720, hexToRgba("#9fb7bd"), pixelDensity);
  const road = hexToRgba("#b9c2c8");
  const roadDark = hexToRgba("#88949b");
  const wall = hexToRgba("#cfa56f");
  const wallDark = hexToRgba("#a87a4d");
  const floor = hexToRgba("#c99d62");
  const plank = hexToRgba("#d9b47a");
  const outline = hexToRgba("#4f463a");
  const window = hexToRgba("#bfe8f5");
  const bush = hexToRgba("#37a83f");
  const building = hexToRgba("#dbe0de");

  fillRect(target, 0, 0, 1280, 720, hexToRgba("#b9c4c2"));
  fillPolygon(target, [[0, 500], [260, 360], [560, 720], [0, 720]], road);
  fillPolygon(target, [[965, 255], [1280, 115], [1280, 720], [775, 720]], road);
  for (let i = 0; i < 8; i += 1) {
    line(target, 0, 540 + i * 28, 270, 390 + i * 28, roadDark, 2);
    line(target, 990, 300 + i * 28, 1280, 168 + i * 28, roadDark, 2);
  }

  fillRect(target, 82, 0, 185, 240, building);
  fillRect(target, 960, 0, 250, 250, hexToRgba("#cfd9d8"));
  for (let y = 28; y < 220; y += 54) {
    fillRect(target, 112, y, 48, 34, window);
    fillRect(target, 184, y, 48, 34, window);
    fillRect(target, 1000, y, 60, 38, window);
    fillRect(target, 1090, y, 60, 38, window);
  }

  fillPolygon(target, [[190, 174], [782, 70], [1084, 238], [493, 614]], floor);
  fillPolygon(target, [[190, 174], [782, 70], [782, 148], [248, 244]], wall);
  fillPolygon(target, [[782, 70], [1084, 238], [1029, 323], [782, 148]], wall);
  fillPolygon(target, [[190, 174], [248, 244], [493, 614], [426, 557]], wallDark);
  fillPolygon(target, [[1084, 238], [1029, 323], [493, 614], [560, 660]], wallDark);
  line(target, 190, 174, 782, 70, outline, 4);
  line(target, 782, 70, 1084, 238, outline, 4);
  line(target, 190, 174, 493, 614, outline, 4);
  line(target, 1084, 238, 493, 614, outline, 4);

  for (let i = 0; i < 17; i += 1) {
    const t = i / 16;
    line(target, 190 + t * 592, 174 - t * 104, 493 + t * 591, 614 - t * 376, plank, 2);
  }
  for (let i = 0; i < 12; i += 1) {
    const t = i / 11;
    line(target, 190 + t * 303, 174 + t * 440, 782 + t * 302, 70 + t * 544, hexToRgba("#b98751"), 2);
  }

  for (let i = 0; i < 12; i += 1) {
    fillRect(target, 148 + i * 42, 129 - i * 7, 28, 26, bush);
    fillRect(target, 930 + i * 24, 178 + i * 13, 22, 28, bush);
  }

  fillRect(target, 370, 210, 160, 72, hexToRgba("#dce8f2"));
  fillRect(target, 390, 230, 120, 18, hexToRgba("#7897a5"));
  fillRect(target, 384, 282, 18, 70, outline);
  fillRect(target, 500, 282, 18, 70, outline);
  fillRect(target, 614, 256, 196, 78, hexToRgba("#dfe8ed"));
  fillRect(target, 638, 278, 44, 36, window);
  fillRect(target, 704, 278, 44, 36, window);
  fillRect(target, 770, 278, 44, 36, window);
  fillRect(target, 870, 365, 130, 58, hexToRgba("#e6f0f2"));
  fillRect(target, 913, 332, 72, 39, hexToRgba("#d7e1e8"));
  fillRect(target, 264, 232, 150, 86, hexToRgba("#fffaf0"));
  line(target, 274, 272, 382, 252, hexToRgba("#d83d3d"), 4);
  line(target, 292, 292, 390, 276, hexToRgba("#d83d3d"), 4);

  return target;
}

writePng(path.join(outSprites, "v046-agents-hires.png"), buildAgentSheet(agentBaseModes));
writePng(path.join(outSprites, "v051-agents-event-poses.png"), buildAgentSheet(agentEventPoseModes));
writePng(path.join(outSprites, "v046-office-objects-hires.png"), buildOfficeObjectSheet());
writePng(path.join(outBackgrounds, "v046-isometric-office-hires.png"), buildOfficeBackground());

console.log("Generated v0.46 high-density sheets plus v0.51 agent event pose sheet.");

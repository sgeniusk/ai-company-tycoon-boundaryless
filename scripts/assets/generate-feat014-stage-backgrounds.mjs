import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "../..");
const outputDir = resolve(rootDir, "unity/Assets/_Project/Resources/Art/Background");

const width = 2560;
const height = 1440;

const palette = {
  line: [48, 45, 39, 255],
  lineSoft: [84, 92, 91, 255],
  bgTop: [183, 196, 193, 255],
  bgBottom: [165, 178, 184, 255],
  wall: [207, 216, 212, 255],
  wallDark: [176, 188, 187, 255],
  grid: [138, 156, 163, 255],
  glass: [189, 226, 235, 255],
  glassDeep: [132, 165, 176, 255],
  glassPale: [221, 235, 238, 255],
  cream: [255, 247, 224, 255],
  white: [246, 250, 239, 255],
  gold: [244, 204, 112, 255],
  goldDeep: [197, 141, 75, 255],
  wood: [205, 157, 94, 255],
  woodLight: [226, 184, 116, 255],
  woodLine: [178, 124, 73, 255],
  woodSide: [175, 118, 67, 255],
  woodSideDeep: [151, 94, 55, 255],
  mint: [95, 198, 166, 255],
  mintDark: [43, 107, 79, 255],
  plant: [52, 169, 65, 255],
  plantDark: [31, 128, 58, 255],
  blue: [51, 95, 122, 255],
  blueDark: [28, 48, 63, 255],
  slate: [72, 86, 98, 255],
  slateDark: [36, 45, 53, 255],
  steel: [138, 154, 160, 255],
  steelLight: [205, 218, 219, 255],
  orange: [232, 144, 67, 255],
  red: [214, 72, 56, 255],
  violet: [111, 91, 178, 255],
  violetDark: [63, 55, 113, 255],
};

const platform = {
  left: [378, 348],
  top: [1565, 138],
  right: [2168, 475],
  bottom: [986, 1228],
};

function mix(a, b, t, alpha = 255) {
  return [
    Math.round(a[0] * (1 - t) + b[0] * t),
    Math.round(a[1] * (1 - t) + b[1] * t),
    Math.round(a[2] * (1 - t) + b[2] * t),
    alpha,
  ];
}

function alpha(color, value) {
  return [color[0], color[1], color[2], value];
}

function lerpPoint(a, b, t) {
  return [a[0] * (1 - t) + b[0] * t, a[1] * (1 - t) + b[1] * t];
}

function createSurface() {
  const pixels = new Uint8Array(width * height * 4);

  function setPixel(x, y, color) {
    const xx = Math.round(x);
    const yy = Math.round(y);
    if (xx < 0 || yy < 0 || xx >= width || yy >= height) return;
    const offset = (yy * width + xx) * 4;
    const a = color[3] / 255;
    if (a >= 1) {
      pixels[offset] = color[0];
      pixels[offset + 1] = color[1];
      pixels[offset + 2] = color[2];
      pixels[offset + 3] = color[3];
      return;
    }
    pixels[offset] = Math.round(color[0] * a + pixels[offset] * (1 - a));
    pixels[offset + 1] = Math.round(color[1] * a + pixels[offset + 1] * (1 - a));
    pixels[offset + 2] = Math.round(color[2] * a + pixels[offset + 2] * (1 - a));
    pixels[offset + 3] = 255;
  }

  function fillRect(x, y, w, h, color) {
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(width, Math.ceil(x + w));
    const y1 = Math.min(height, Math.ceil(y + h));
    for (let yy = y0; yy < y1; yy += 1) {
      for (let xx = x0; xx < x1; xx += 1) setPixel(xx, yy, color);
    }
  }

  function strokeRect(x, y, w, h, color, thickness = 4) {
    fillRect(x, y, w, thickness, color);
    fillRect(x, y + h - thickness, w, thickness, color);
    fillRect(x, y, thickness, h, color);
    fillRect(x + w - thickness, y, thickness, h, color);
  }

  function fillEllipse(cx, cy, rx, ry, color) {
    const x0 = Math.floor(cx - rx);
    const y0 = Math.floor(cy - ry);
    const x1 = Math.ceil(cx + rx);
    const y1 = Math.ceil(cy + ry);
    for (let yy = y0; yy <= y1; yy += 1) {
      for (let xx = x0; xx <= x1; xx += 1) {
        const dx = (xx - cx) / rx;
        const dy = (yy - cy) / ry;
        if (dx * dx + dy * dy <= 1) setPixel(xx, yy, color);
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
        const start = Math.max(0, Math.ceil(intersections[index]));
        const end = Math.min(width - 1, Math.floor(intersections[index + 1]));
        for (let x = start; x <= end; x += 1) setPixel(x, y, color);
      }
    }
  }

  function drawLine(x0, y0, x1, y1, color, thickness = 4) {
    let x = Math.round(x0);
    let y = Math.round(y0);
    const endX = Math.round(x1);
    const endY = Math.round(y1);
    const dx = Math.abs(endX - x);
    const sx = x < endX ? 1 : -1;
    const dy = -Math.abs(endY - y);
    const sy = y < endY ? 1 : -1;
    let error = dx + dy;
    const half = Math.floor(thickness / 2);

    while (true) {
      fillRect(x - half, y - half, thickness, thickness, color);
      if (x === endX && y === endY) break;
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

  function strokePolygon(points, color, thickness = 4) {
    for (let index = 0; index < points.length; index += 1) {
      const [x1, y1] = points[index];
      const [x2, y2] = points[(index + 1) % points.length];
      drawLine(x1, y1, x2, y2, color, thickness);
    }
  }

  function fillDiamond(cx, cy, w, h, color) {
    fillPolygon(
      [
        [cx, cy - h / 2],
        [cx + w / 2, cy],
        [cx, cy + h / 2],
        [cx - w / 2, cy],
      ],
      color,
    );
  }

  return {
    pixels,
    setPixel,
    fillRect,
    strokeRect,
    fillEllipse,
    fillPolygon,
    drawLine,
    strokePolygon,
    fillDiamond,
  };
}

function drawGradientBackground(ctx) {
  for (let y = 0; y < height; y += 1) {
    const t = y / (height - 1);
    const color = mix(palette.bgTop, palette.bgBottom, t);
    ctx.fillRect(0, y, width, 1, color);
  }
}

function drawGroundLines(ctx) {
  const soft = alpha(palette.grid, 150);
  for (let x = -420; x < 530; x += 78) ctx.drawLine(x, 1420, x + 960, 780, soft, 5);
  for (let x = 1420; x < 2650; x += 84) ctx.drawLine(x, 980, x + 1040, 515, soft, 5);
  for (let y = 1015; y < 1265; y += 96) ctx.drawLine(1110, y, 2170, y - 30, alpha(palette.woodLine, 150), 3);
  ctx.drawLine(0, 1135, 540, 780, alpha(palette.grid, 115), 5);
  ctx.drawLine(1980, 880, 2560, 600, alpha(palette.grid, 120), 5);
}

function drawBuilding(ctx, x, y, w, h, options = {}) {
  const body = options.dark ? mix(palette.wall, palette.slate, 0.24) : palette.wall;
  ctx.fillRect(x, y, w, h, body);
  ctx.fillRect(x + w - 10, y, 10, h, alpha(palette.lineSoft, 80));
  ctx.fillRect(x, y + h - 18, w, 18, alpha(palette.lineSoft, 42));
  const cols = options.cols ?? 2;
  const rows = options.rows ?? 4;
  const marginX = 62;
  const marginY = 60;
  const gapX = (w - marginX * 2 - cols * 94) / Math.max(1, cols - 1);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const wx = x + marginX + col * (94 + gapX);
      const wy = y + marginY + row * 108;
      ctx.fillRect(wx, wy, 94, 68, options.warm ? mix(palette.glass, palette.gold, 0.14) : palette.glass);
    }
  }
}

function drawSharedBackdrop(ctx, variant) {
  drawGradientBackground(ctx);
  drawGroundLines(ctx);

  drawBuilding(ctx, 164, -18, 372, 505, { cols: 2, rows: 4 });
  drawBuilding(ctx, 1998, -18, 420, 522, { cols: 2, rows: 4, dark: variant === "datacenter", warm: variant === "landmark" });

  if (variant === "growth") drawGrowthBackWall(ctx);
  if (variant === "datacenter") drawDatacenterBackWall(ctx);
  if (variant === "landmark") drawLandmarkBackWall(ctx);
}

function drawMullionedGlass(ctx, x, y, w, h, options = {}) {
  ctx.fillRect(x - 10, y - 10, w + 20, h + 20, alpha(palette.line, 55));
  ctx.fillRect(x, y, w, h, options.tint ?? alpha(palette.glassPale, 210));
  ctx.strokeRect(x, y, w, h, palette.lineSoft, 5);
  const cols = options.cols ?? 8;
  for (let i = 1; i < cols; i += 1) {
    const xx = x + (w * i) / cols;
    ctx.drawLine(xx, y + 4, xx, y + h - 4, alpha(palette.lineSoft, 125), 4);
  }
  const rows = options.rows ?? 2;
  for (let i = 1; i < rows; i += 1) {
    const yy = y + (h * i) / rows;
    ctx.drawLine(x + 4, yy, x + w - 4, yy, alpha(palette.lineSoft, 110), 4);
  }
  for (let i = 0; i < cols; i += 2) {
    const xx = x + (w * i) / cols + 24;
    ctx.drawLine(xx, y + 24, xx + 120, y + h - 34, alpha(palette.white, 105), 3);
  }
}

function drawGrowthBackWall(ctx) {
  drawMullionedGlass(ctx, 565, 62, 1430, 335, { cols: 9, rows: 2, tint: alpha(mix(palette.glass, palette.white, 0.34), 220) });

  ctx.fillRect(610, 426, 404, 148, palette.cream);
  ctx.strokeRect(610, 426, 404, 148, palette.lineSoft, 5);
  ctx.fillRect(655, 457, 250, 16, palette.red);
  ctx.fillRect(657, 501, 292, 14, palette.red);
  ctx.fillRect(655, 540, 176, 12, palette.gold);

  ctx.fillRect(1135, 410, 560, 120, alpha(palette.white, 235));
  ctx.strokeRect(1135, 410, 560, 120, palette.lineSoft, 5);
  for (let i = 0; i < 5; i += 1) {
    ctx.fillRect(1182 + i * 92, 447, 56, 40, i % 2 === 0 ? palette.glass : mix(palette.mint, palette.white, 0.55));
  }

  drawSofa(ctx, 1745, 468, palette.mint, palette.mintDark);
  drawTallPlant(ctx, 455, 530, 1.25);
  drawTallPlant(ctx, 1875, 532, 1.1);
  drawDeskCluster(ctx, 870, 618, "growth");
  drawDeskCluster(ctx, 1590, 600, "growth");
}

function drawDatacenterBackWall(ctx) {
  drawMullionedGlass(ctx, 515, 54, 1535, 370, { cols: 10, rows: 2, tint: alpha(mix(palette.blueDark, palette.glass, 0.54), 220) });

  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const x = 590 + col * 158 + row * 32;
      const y = 130 + row * 135;
      drawServerRack(ctx, x, y, 112, 220, col + row);
    }
  }

  ctx.drawLine(540, 88, 2015, 88, palette.steelLight, 14);
  ctx.drawLine(540, 110, 2015, 110, palette.steel, 8);
  for (let x = 610; x < 1990; x += 180) {
    ctx.drawLine(x, 88, x, 136, palette.steel, 8);
    ctx.fillEllipse(x, 136, 15, 9, palette.steelLight);
  }

  ctx.fillRect(438, 474, 258, 116, alpha(palette.blueDark, 225));
  ctx.strokeRect(438, 474, 258, 116, palette.line, 5);
  ctx.fillRect(470, 503, 192, 14, palette.mint);
  ctx.fillRect(470, 532, 136, 12, palette.gold);
  ctx.fillRect(617, 532, 38, 12, palette.red);

  ctx.fillRect(1805, 454, 300, 108, alpha(palette.glassPale, 230));
  ctx.strokeRect(1805, 454, 300, 108, palette.lineSoft, 5);
  for (let i = 0; i < 5; i += 1) ctx.fillRect(1848 + i * 47, 486, 26, 38, i % 2 === 0 ? palette.mint : palette.gold);
}

function drawLandmarkBackWall(ctx) {
  drawMullionedGlass(ctx, 440, 40, 1680, 445, { cols: 12, rows: 2, tint: alpha(mix(palette.glass, palette.white, 0.2), 218) });

  const skylineBase = 482;
  const skyline = [
    [455, 238, 88, 244, palette.slate],
    [565, 132, 134, 350, palette.wallDark],
    [718, 270, 112, 212, palette.steel],
    [850, 92, 106, 390, palette.slate],
    [978, 205, 152, 277, palette.wallDark],
    [1152, 58, 132, 424, palette.blue],
    [1302, 182, 94, 300, palette.steel],
    [1418, 248, 154, 234, palette.wallDark],
    [1588, 116, 118, 366, palette.slate],
    [1726, 278, 140, 204, palette.steel],
    [1888, 198, 122, 284, palette.wallDark],
  ];
  for (let index = 0; index < skyline.length; index += 1) {
    const [x, y, w, h, color] = skyline[index];
    ctx.fillRect(x, y, w, h, alpha(color, 205));
    if (index === 3 || index === 5 || index === 8) {
      ctx.fillPolygon(
        [
          [x + w * 0.5, y - 55],
          [x + w * 0.68, y],
          [x + w * 0.32, y],
        ],
        alpha(color, 205),
      );
      ctx.drawLine(x + w * 0.5, y - 82, x + w * 0.5, y - 48, alpha(palette.lineSoft, 150), 4);
    }
    ctx.fillRect(x + 12, y + 28, w - 24, 10, alpha(palette.white, 115));
    for (let yy = y + 58; yy < skylineBase - 20; yy += 38) {
      ctx.fillRect(x + 18, yy, w - 36, 7, alpha(palette.glass, 155));
    }
  }

  ctx.drawLine(395, 506, 2160, 506, palette.lineSoft, 6);
  ctx.drawLine(455, 460, 2105, 460, alpha(palette.gold, 180), 5);

  drawArch(ctx, 360, 552, 800, 230, 34, alpha(palette.white, 190));
  drawArch(ctx, 1790, 540, 500, 210, 30, alpha(palette.white, 175));
  ctx.fillRect(972, 500, 616, 78, alpha(palette.cream, 220));
  ctx.strokeRect(972, 500, 616, 78, palette.lineSoft, 5);
  ctx.fillRect(1040, 522, 190, 14, palette.gold);
  ctx.fillRect(1268, 522, 234, 14, palette.mint);
}

function drawArch(ctx, x, y, w, h, thickness, color) {
  const steps = 54;
  for (let i = 0; i < steps; i += 1) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    const a0 = Math.PI * (1 - t0);
    const a1 = Math.PI * (1 - t1);
    const p0 = [x + w / 2 + Math.cos(a0) * (w / 2), y - Math.sin(a0) * h];
    const p1 = [x + w / 2 + Math.cos(a1) * (w / 2), y - Math.sin(a1) * h];
    ctx.drawLine(p0[0], p0[1], p1[0], p1[1], color, thickness);
  }
}

function drawSofa(ctx, x, y, seat, dark) {
  ctx.fillRect(x, y + 44, 250, 42, palette.line);
  ctx.fillRect(x + 12, y + 18, 226, 70, seat);
  ctx.fillRect(x + 20, y + 28, 98, 42, mix(seat, palette.white, 0.22));
  ctx.fillRect(x + 132, y + 28, 94, 42, mix(seat, palette.white, 0.16));
  ctx.fillRect(x - 16, y + 44, 42, 58, dark);
  ctx.fillRect(x + 224, y + 44, 42, 58, dark);
  ctx.strokeRect(x + 10, y + 16, 230, 76, palette.lineSoft, 4);
}

function drawTallPlant(ctx, x, y, scale = 1) {
  const potW = 70 * scale;
  const potH = 48 * scale;
  ctx.fillRect(x - potW / 2, y, potW, potH, palette.goldDeep);
  ctx.fillRect(x - potW / 2 + 8 * scale, y + 8 * scale, potW - 16 * scale, 12 * scale, palette.gold);
  ctx.strokeRect(x - potW / 2, y, potW, potH, palette.lineSoft, Math.max(3, 4 * scale));
  const stemX = x;
  ctx.drawLine(stemX, y + 4 * scale, stemX, y - 98 * scale, palette.plantDark, Math.max(4, 6 * scale));
  const leaves = [
    [-42, -84, 58, 28],
    [38, -92, 62, 30],
    [-30, -122, 52, 28],
    [28, -132, 52, 28],
    [0, -158, 56, 30],
  ];
  for (const [dx, dy, rx, ry] of leaves) ctx.fillEllipse(x + dx * scale, y + dy * scale, rx * scale, ry * scale, palette.plant);
}

function drawDeskCluster(ctx, x, y, mode) {
  const top = mode === "growth" ? palette.cream : palette.steelLight;
  ctx.fillPolygon(
    [
      [x, y],
      [x + 180, y - 45],
      [x + 300, y],
      [x + 120, y + 52],
    ],
    palette.line,
  );
  ctx.fillPolygon(
    [
      [x + 14, y + 2],
      [x + 178, y - 34],
      [x + 278, y + 2],
      [x + 118, y + 42],
    ],
    top,
  );
  ctx.fillRect(x + 130, y - 58, 108, 58, palette.blueDark);
  ctx.fillRect(x + 142, y - 48, 84, 34, mode === "growth" ? palette.glass : palette.mint);
  ctx.fillRect(x + 82, y - 12, 42, 10, palette.gold);
  ctx.fillRect(x + 168, y + 10, 52, 10, palette.mint);
}

function drawServerRack(ctx, x, y, w, h, index) {
  ctx.fillRect(x, y, w, h, palette.line);
  ctx.fillRect(x + 8, y + 8, w - 16, h - 16, index % 2 === 0 ? palette.blueDark : palette.slateDark);
  for (let yy = y + 28; yy < y + h - 22; yy += 32) {
    ctx.fillRect(x + 18, yy, w - 36, 12, palette.slate);
    ctx.fillRect(x + 24, yy + 4, 18, 4, index % 3 === 0 ? palette.gold : palette.mint);
    ctx.fillRect(x + w - 38, yy + 4, 12, 4, index % 4 === 0 ? palette.red : palette.mint);
  }
  ctx.fillRect(x + 8, y + 8, w - 16, 14, alpha(palette.glass, 75));
}

function drawPlanterTrail(ctx) {
  const leftStart = [322, 286];
  const leftEnd = [1235, 126];
  for (let i = 0; i < 12; i += 1) {
    const t = i / 11;
    const [x, y] = lerpPoint(leftStart, leftEnd, t);
    const size = 56;
    ctx.fillRect(x - size / 2, y - size / 2, size, size, palette.plant);
    ctx.fillRect(x + size - 13 - size / 2, y - size / 2, 13, size, palette.plantDark);
  }

  const rightStart = [1884, 382];
  const rightEnd = [2410, 670];
  for (let i = 0; i < 12; i += 1) {
    const t = i / 11;
    const [x, y] = lerpPoint(rightStart, rightEnd, t);
    const size = 48;
    ctx.fillRect(x - size / 2, y - size / 2, size, size, palette.plant);
    ctx.fillRect(x + size - 11 - size / 2, y - size / 2, 11, size, palette.plantDark);
  }
}

function drawPlatform(ctx, variant) {
  const { left, top, right, bottom } = platform;
  ctx.fillEllipse(1280, 1048, 820, 118, alpha(palette.slateDark, 45));

  ctx.fillPolygon(
    [
      left,
      bottom,
      [1118, 1320],
      [514, 606],
    ],
    palette.woodSideDeep,
  );
  ctx.fillPolygon(
    [
      right,
      bottom,
      [1118, 1320],
      [2072, 640],
    ],
    palette.woodSide,
  );
  ctx.fillPolygon(
    [
      [1118, 1320],
      [2072, 640],
      [2145, 552],
      [2248, 596],
      [1980, 928],
      [1122, 1382],
    ],
    alpha(palette.woodSideDeep, 205),
  );

  ctx.fillPolygon([left, top, right, bottom], palette.wood);
  ctx.fillPolygon(
    [
      lerpPoint(left, top, 0.34),
      lerpPoint(top, right, 0.52),
      lerpPoint(right, bottom, 0.34),
      lerpPoint(bottom, left, 0.52),
    ],
    alpha(mix(palette.wood, palette.gold, 0.2), 120),
  );
  ctx.fillPolygon(
    [
      lerpPoint(left, top, 0.56),
      lerpPoint(top, right, 0.78),
      lerpPoint(right, bottom, 0.58),
      lerpPoint(bottom, left, 0.34),
    ],
    alpha(mix(palette.wood, palette.woodSide, 0.22), 92),
  );

  for (let t = 0.09; t < 0.96; t += 0.105) {
    const a = lerpPoint(left, bottom, t);
    const b = lerpPoint(top, right, t);
    ctx.drawLine(a[0], a[1], b[0], b[1], alpha(palette.woodLine, 150), 4);
  }
  for (let t = 0.08; t < 0.96; t += 0.085) {
    const a = lerpPoint(left, top, t);
    const b = lerpPoint(bottom, right, t);
    ctx.drawLine(a[0], a[1], b[0], b[1], alpha(palette.woodLight, 185), 4);
  }
  for (let t = 0.16; t < 0.92; t += 0.18) {
    const a = lerpPoint(left, bottom, t);
    const b = lerpPoint(top, right, t);
    ctx.drawLine(a[0] + 12, a[1] - 1, b[0] + 12, b[1] - 1, alpha(palette.woodLine, 105), 8);
  }

  ctx.strokePolygon([left, top, right, bottom], palette.line, 5);
  ctx.drawLine(504, 600, 1118, 1320, palette.lineSoft, 4);
  ctx.drawLine(2072, 640, 1118, 1320, palette.lineSoft, 4);

  if (variant === "growth") drawGrowthPlatformAccents(ctx);
  if (variant === "datacenter") drawDatacenterPlatformAccents(ctx);
  if (variant === "landmark") drawLandmarkPlatformAccents(ctx);
  drawPlanterTrail(ctx);
}

function drawGrowthPlatformAccents(ctx) {
  ctx.fillRect(505, 470, 328, 118, palette.cream);
  ctx.strokeRect(505, 470, 328, 118, palette.lineSoft, 5);
  ctx.fillRect(553, 507, 220, 13, palette.red);
  ctx.fillRect(553, 546, 245, 12, palette.red);

  ctx.fillRect(1140, 500, 480, 112, alpha(palette.glassPale, 240));
  ctx.strokeRect(1140, 500, 480, 112, palette.lineSoft, 5);
  for (let i = 0; i < 4; i += 1) ctx.fillRect(1190 + i * 95, 540, 62, 34, palette.glass);
}

function drawDatacenterPlatformAccents(ctx) {
  for (let i = 0; i < 4; i += 1) {
    const x = 545 + i * 165;
    ctx.fillRect(x, 438 + i * 10, 96, 176, palette.line);
    ctx.fillRect(x + 8, 446 + i * 10, 80, 158, palette.blueDark);
    for (let yy = 466 + i * 10; yy < 585 + i * 10; yy += 28) {
      ctx.fillRect(x + 20, yy, 48, 8, palette.slate);
      ctx.fillRect(x + 70, yy + 2, 8, 8, i % 2 === 0 ? palette.mint : palette.gold);
    }
  }
  ctx.drawLine(710, 670, 1170, 560, alpha(palette.mint, 160), 5);
  ctx.drawLine(780, 706, 1355, 582, alpha(palette.gold, 145), 5);
}

function drawLandmarkPlatformAccents(ctx) {
  ctx.fillRect(545, 512, 395, 86, alpha(palette.cream, 230));
  ctx.strokeRect(545, 512, 395, 86, palette.lineSoft, 5);
  ctx.fillRect(588, 542, 120, 12, palette.gold);
  ctx.fillRect(734, 542, 150, 12, palette.mint);
  ctx.fillRect(1682, 438, 235, 96, alpha(palette.glassPale, 230));
  ctx.strokeRect(1682, 438, 235, 96, palette.lineSoft, 5);
  ctx.fillRect(1715, 470, 160, 11, palette.glassDeep);
}

function drawScene(variant) {
  const ctx = createSurface();
  drawSharedBackdrop(ctx, variant);
  drawPlatform(ctx, variant);
  return ctx.pixels;
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

function encodePng(pixels) {
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

const outputs = [
  ["growth", "office_growth.png"],
  ["datacenter", "office_datacenter.png"],
  ["landmark", "office_landmark.png"],
];

mkdirSync(outputDir, { recursive: true });

for (const [variant, fileName] of outputs) {
  const png = encodePng(drawScene(variant));
  const outputPath = resolve(outputDir, fileName);
  writeFileSync(outputPath, png);
  const sha256 = createHash("sha256").update(png).digest("hex");
  console.log(`Wrote ${relative(rootDir, outputPath)} (${width}x${height}) sha256=${sha256}`);
}

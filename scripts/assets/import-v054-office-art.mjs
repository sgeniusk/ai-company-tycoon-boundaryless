import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import zlib from "node:zlib";

const root = process.cwd();
const defaultObjectSourcePath = path.join(root, "public/assets/sprites/source/v054-office-objects-final-source.png");
const defaultBackdropSourcePath = path.join(root, "public/assets/backgrounds/source/v054-isometric-office-final-source.png");
const defaultObjectRuntimePath = path.join(root, "public/assets/sprites/v054-office-objects-final.png");
const defaultBackdropRuntimePath = path.join(root, "public/assets/backgrounds/v054-isometric-office-final.png");

const expectedObjectSource = {
  width: 2560,
  height: 1920,
  frameWidth: 512,
  frameHeight: 384,
  columns: 5,
  rows: 5,
};
const expectedBackdropSource = {
  width: 5120,
  height: 2880,
};
const runtimeDownsampleFactor = 2;

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function resolveProjectPath(value) {
  if (!value) return undefined;
  return path.isAbsolute(value) ? value : path.join(root, value);
}

const objectSourcePath = resolveProjectPath(getArg("--objects-source")) ?? defaultObjectSourcePath;
const backdropSourcePath = resolveProjectPath(getArg("--backdrop-source")) ?? defaultBackdropSourcePath;
const objectOutSourcePath = resolveProjectPath(getArg("--out-objects-source")) ?? defaultObjectSourcePath;
const backdropOutSourcePath = resolveProjectPath(getArg("--out-backdrop-source")) ?? defaultBackdropSourcePath;
const objectRuntimePath = resolveProjectPath(getArg("--out-objects-runtime")) ?? defaultObjectRuntimePath;
const backdropRuntimePath = resolveProjectPath(getArg("--out-backdrop-runtime")) ?? defaultBackdropRuntimePath;

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
  if (!buffer.subarray(0, 8).equals(signature)) {
    throw new Error("Input is not a PNG file");
  }

  let width = 0;
  let height = 0;
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
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
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
  const stride = width * bytesPerPixel;
  const pixels = Buffer.alloc(width * height * bytesPerPixel);
  let inputOffset = 0;

  for (let y = 0; y < height; y += 1) {
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

  return { width, height, data: pixels };
}

function validateObjectSourceDimensions(source) {
  if (source.width !== expectedObjectSource.width || source.height !== expectedObjectSource.height) {
    throw new Error(
      `Object source sheet must be ${expectedObjectSource.width}x${expectedObjectSource.height}; received ${source.width}x${source.height}`,
    );
  }
  if (source.width !== expectedObjectSource.frameWidth * expectedObjectSource.columns) {
    throw new Error("Object source width does not match frame width and column count");
  }
  if (source.height !== expectedObjectSource.frameHeight * expectedObjectSource.rows) {
    throw new Error("Object source height does not match frame height and row count");
  }
}

function validateBackdropSourceDimensions(source) {
  if (source.width !== expectedBackdropSource.width || source.height !== expectedBackdropSource.height) {
    throw new Error(
      `Backdrop source must be ${expectedBackdropSource.width}x${expectedBackdropSource.height}; received ${source.width}x${source.height}`,
    );
  }
}

function downsampleNearest(source, factor = runtimeDownsampleFactor) {
  const width = Math.floor(source.width / factor);
  const height = Math.floor(source.height / factor);
  const data = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceOffset = ((y * factor) * source.width + (x * factor)) * 4;
      const targetOffset = (y * width + x) * 4;
      data[targetOffset] = source.data[sourceOffset];
      data[targetOffset + 1] = source.data[sourceOffset + 1];
      data[targetOffset + 2] = source.data[sourceOffset + 2];
      data[targetOffset + 3] = source.data[sourceOffset + 3];
    }
  }

  return { width, height, data };
}

const objectSource = decodePngRgba(fs.readFileSync(objectSourcePath));
validateObjectSourceDimensions(objectSource);
fs.mkdirSync(path.dirname(objectOutSourcePath), { recursive: true });
if (path.resolve(objectSourcePath) !== path.resolve(objectOutSourcePath)) {
  fs.copyFileSync(objectSourcePath, objectOutSourcePath);
}
writePng(objectRuntimePath, downsampleNearest(objectSource));

const backdropSource = decodePngRgba(fs.readFileSync(backdropSourcePath));
validateBackdropSourceDimensions(backdropSource);
fs.mkdirSync(path.dirname(backdropOutSourcePath), { recursive: true });
if (path.resolve(backdropSourcePath) !== path.resolve(backdropOutSourcePath)) {
  fs.copyFileSync(backdropSourcePath, backdropOutSourcePath);
}
writePng(backdropRuntimePath, downsampleNearest(backdropSource));

console.log(`Imported v0.54 office object source: ${path.relative(root, objectOutSourcePath)}`);
console.log(`Generated v0.54 office object runtime sheet: ${path.relative(root, objectRuntimePath)}`);
console.log(`Imported v0.54 office backdrop source: ${path.relative(root, backdropOutSourcePath)}`);
console.log(`Generated v0.54 office backdrop runtime: ${path.relative(root, backdropRuntimePath)}`);

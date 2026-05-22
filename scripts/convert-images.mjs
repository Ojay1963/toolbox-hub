/**
 * Converts project PNG/JPEG images to WebP (quality 80) and AVIF (quality 65).
 *
 * Rules:
 *  - Scans the entire project tree, excluding node_modules, .next, and qa-artifacts
 *  - Skips app/icon.png and app/apple-icon.png — Next.js App Router special files
 *    that must stay as PNG (they power /icon.png and /apple-icon.png routes)
 *  - Converts all other .jpg/.jpeg/.png files
 *  - Deletes the original after a successful conversion pair
 */

import sharp from "sharp";
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "qa-artifacts", "scripts"]);
const SKIP_FILES = new Set([
  path.join(ROOT, "app", "icon.png"),
  path.join(ROOT, "app", "apple-icon.png"),
]);

let totalConverted = 0;
let totalOriginalBytes = 0;
let totalWebpBytes = 0;
let totalAvifBytes = 0;
const errors = [];

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

async function convertFile(srcPath) {
  const ext = path.extname(srcPath).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) return;
  if (SKIP_FILES.has(srcPath)) {
    console.log(`  SKIP  ${path.relative(ROOT, srcPath)} (Next.js special file)`);
    return;
  }

  const base = srcPath.slice(0, srcPath.length - ext.length);
  const webpPath = base + ".webp";
  const avifPath = base + ".avif";

  const origStat = await stat(srcPath);
  const origBytes = origStat.size;

  try {
    const image = sharp(srcPath);

    await image.clone().webp({ quality: 80 }).toFile(webpPath);
    await image.clone().avif({ quality: 65 }).toFile(avifPath);

    const webpBytes = (await stat(webpPath)).size;
    const avifBytes = (await stat(avifPath)).size;

    await unlink(srcPath);

    const saved = origBytes - Math.min(webpBytes, avifBytes);
    const pct = ((saved / origBytes) * 100).toFixed(1);

    console.log(
      `  OK    ${path.relative(ROOT, srcPath)}\n` +
      `        orig ${(origBytes / 1024).toFixed(1)} KB  ` +
      `→  webp ${(webpBytes / 1024).toFixed(1)} KB  ` +
      `avif ${(avifBytes / 1024).toFixed(1)} KB  ` +
      `(saved ${(saved / 1024).toFixed(1)} KB / ${pct}%)`
    );

    totalConverted++;
    totalOriginalBytes += origBytes;
    totalWebpBytes += webpBytes;
    totalAvifBytes += avifBytes;
  } catch (err) {
    errors.push({ file: path.relative(ROOT, srcPath), error: err.message });
    console.error(`  ERR   ${path.relative(ROOT, srcPath)}: ${err.message}`);
  }
}

console.log("=== Image conversion: PNG/JPEG → WebP + AVIF ===\n");

for await (const file of walk(ROOT)) {
  await convertFile(file);
}

const savedMB = ((totalOriginalBytes - totalWebpBytes) / 1024 / 1024).toFixed(2);
const savedAvifMB = ((totalOriginalBytes - totalAvifBytes) / 1024 / 1024).toFixed(2);

console.log("\n=== Summary ===");
console.log(`  Converted : ${totalConverted} file(s)`);
console.log(`  Original  : ${(totalOriginalBytes / 1024 / 1024).toFixed(2)} MB`);
console.log(`  WebP      : ${(totalWebpBytes / 1024 / 1024).toFixed(2)} MB  (saved ${savedMB} MB)`);
console.log(`  AVIF      : ${(totalAvifBytes / 1024 / 1024).toFixed(2)} MB  (saved ${savedAvifMB} MB)`);
if (errors.length) {
  console.log(`\n  ERRORS (${errors.length}):`);
  errors.forEach(({ file, error }) => console.log(`    ${file}: ${error}`));
} else {
  console.log("  No errors.");
}

/**
 * Rebuilds the photo and video files of the media library in the Blob store (BLOB_READ_WRITE_TOKEN)
 * from local source files, for when the store was emptied or replaced. Every file the database
 * expects (each upload and each of its image sizes) is uploaded under its exact name, which is where
 * the storage plugin looks for it, so no database records change.
 *
 * Sources come from a JSON map { "<filename in the library>": "<local source file>" }. An exact copy
 * (same name in apps/frontend/media) is uploaded as is; anything else is resized to the width and
 * height recorded in the database. Image sizes without their own source are cut from the original's.
 * Files already in the store are skipped, so it is safe to re-run.
 *
 * Dry run by default; add `apply` to upload (`payload run` drops --flags):
 * `npx payload run src/cms/scripts/blob-restore.ts <sources.json> [apply]`
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { head, put } from "@vercel/blob";
import { getPayload } from "payload";
import sharp from "sharp";
import config from "../../payload.config";

const [sourcesPath, mode] = process.argv.slice(2);
if (!sourcesPath) throw new Error("Pass the sources map: npx payload run src/cms/scripts/blob-restore.ts <sources.json> [apply]");
const apply = mode === "apply";
const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not set in apps/frontend/.env");

const mediaDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../media");
const sources = JSON.parse(await fs.readFile(sourcesPath, "utf8")) as Record<string, string>;
const payload = await getPayload({ config });

interface Target {
  name: string;
  mimeType: string;
  width?: number | null;
  height?: number | null;
  /** Library file whose source an image size falls back to. */
  original?: string;
}

const targets: Target[] = [];
for (const collection of ["media", "videos"] as const) {
  const { docs } = await payload.find({ collection, depth: 0, pagination: false, limit: 0 });
  for (const doc of docs) {
    if (!doc.filename) continue;
    const mimeType = doc.mimeType ?? "application/octet-stream";
    targets.push({ name: doc.filename, mimeType, width: doc.width, height: doc.height });
    const sizes = "sizes" in doc && doc.sizes ? Object.values(doc.sizes) : [];
    for (const s of sizes) {
      if (s?.filename)
        targets.push({ name: s.filename, mimeType: s.mimeType ?? mimeType, width: s.width, height: s.height, original: doc.filename });
    }
  }
}

const exists = async (name: string) =>
  head(name, { token })
    .then(() => true)
    .catch(() => false);
const fileExists = (file: string) =>
  fs
    .access(file)
    .then(() => true)
    .catch(() => false);

/** The bytes to upload for a target, or why there are none. */
async function build(t: Target): Promise<Buffer | string> {
  const exact = path.join(mediaDir, t.name);
  if (await fileExists(exact)) return fs.readFile(exact);
  const source = sources[t.name] ?? (t.original ? sources[t.original] : undefined);
  if (!source) return "no source";
  if (!(await fileExists(source))) return `source not found: ${source}`;
  if (!t.mimeType.startsWith("image/")) return fs.readFile(source);
  if (!t.width || !t.height) return "no recorded size";
  return sharp(source)
    .rotate()
    .resize(t.width, t.height, { fit: "cover" })
    .webp({ quality: t.original ? 80 : 82 })
    .toBuffer();
}

const missing: Target[] = [];
for (const t of targets) if (!(await exists(t.name))) missing.push(t);

const problems: string[] = [];
let uploaded = 0;
for (const t of missing) {
  const data = await build(t);
  if (typeof data === "string") {
    problems.push(`${t.name}: ${data}`);
    continue;
  }
  if (!apply) continue;
  await put(t.name, data, { access: "public", token, addRandomSuffix: false, allowOverwrite: true, contentType: t.mimeType });
  uploaded += 1;
  if (uploaded % 25 === 0) console.log(`  ${uploaded}/${missing.length}`);
}

console.log(`\n${apply ? "APPLIED" : "DRY RUN (add `apply` to upload)"}`);
console.log(`Library files: ${targets.length}. Already in the store: ${targets.length - missing.length}. To restore: ${missing.length}.`);
if (apply) console.log(`Uploaded: ${uploaded}.`);
if (problems.length) console.log(`No usable source (${problems.length}):\n  ${problems.join("\n  ")}`);

if (apply) {
  const still: string[] = [];
  for (const t of targets) if (!(await exists(t.name))) still.push(t.name);
  if (still.length) throw new Error(`${still.length} files are still missing from the store: ${still.slice(0, 10).join(", ")}…`);
  console.log("Checked: every library file is in the store.");
}
process.exit(0);

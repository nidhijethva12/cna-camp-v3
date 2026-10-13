/**
 * Replaces trips' banner and gallery with new photos listed in a JSON manifest:
 *   { "credit": "…", "trips": { "<trip-slug>": [{ "file": "D:/…/1.jpg", "alt": "…", "credit"?: "…" }, …] } }
 * A photo's own `credit` (e.g. its photographer) overrides the manifest-wide one.
 * The first photo of each trip becomes its banner, the rest its gallery. Photos are resized to WebP
 * and uploaded once (re-runs reuse them); every new upload is fetched back from storage.
 *
 * Dry run by default; add `apply` to upload and publish (`payload run` drops --flags):
 * `npx payload run src/cms/scripts/trip-photos.ts <manifest.json> [apply]`
 */
import fs from "node:fs/promises";
import { getPayload } from "payload";
import sharp from "sharp";
import config from "../../payload.config";
import { scriptContext } from "../scriptContext";

interface Manifest {
  credit: string;
  trips: Record<string, { file: string; alt: string; credit?: string }[]>;
}

const [manifestPath, mode] = process.argv.slice(2);
if (!manifestPath) throw new Error("Pass the manifest: npx payload run src/cms/scripts/trip-photos.ts <manifest.json> [apply]");
const apply = mode === "apply";
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as Manifest;
const payload = await getPayload({ config });
const lines: string[] = [];
const newIds: string[] = [];

async function upload(filename: string, file: string, alt: string, credit: string) {
  const { docs } = await payload.find({ collection: "media", where: { filename: { equals: filename } }, limit: 1, depth: 0 });
  if (docs[0]) return docs[0].id;
  lines.push(`    + ${filename}`);
  if (!apply) return `new:${filename}`;
  // Same size cap and format as the Media collection, done here so huge camera files upload quickly.
  const data = await sharp(file)
    .rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const doc = await payload.create({
    collection: "media",
    data: { alt, ownedByCna: false, credit },
    file: { data, mimetype: "image/webp", name: filename, size: data.length },
    context: scriptContext(),
  });
  newIds.push(doc.id);
  return doc.id;
}

for (const [slug, photos] of Object.entries(manifest.trips)) {
  const trip = (await payload.find({ collection: "trips", where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: false })).docs[0];
  if (!trip) throw new Error(`No trip with slug "${slug}"`);
  if (photos.length < 4) throw new Error(`${slug}: needs a banner and at least 3 gallery photos`);
  lines.push(`Trip ${trip.name} (${slug})`);
  const ids: string[] = [];
  for (const [i, p] of photos.entries()) ids.push(await upload(`stock-${slug}-${i + 1}.webp`, p.file, p.alt, p.credit ?? manifest.credit));
  const [heroImage, ...gallery] = ids;
  lines.push(`    banner → stock-${slug}-1.webp`);
  lines.push(`    gallery: ${(trip.gallery ?? []).length} old photos → ${gallery.length} new`);
  if (apply) {
    const data = { ...trip, heroImage, gallery, _status: "published" as const } as Record<string, unknown>;
    for (const key of ["id", "createdAt", "updatedAt"]) delete data[key];
    await payload.update({ collection: "trips", id: trip.id, data, draft: false, depth: 0, context: scriptContext() });
  }
}

console.log(`\n${apply ? "APPLIED" : "DRY RUN (add `apply` to write)"}\n${lines.join("\n")}`);
if (apply) {
  const { docs } = await payload.find({ collection: "media", where: { id: { in: newIds } }, depth: 0, pagination: false });
  const missing: string[] = [];
  for (const d of docs) if (!d.url || (await fetch(d.url, { method: "HEAD" })).status !== 200) missing.push(d.filename ?? d.id);
  if (missing.length || docs.length !== newIds.length) throw new Error(`Uploaded but not in storage: ${missing.join(", ")}`);
  console.log(`Checked: all ${newIds.length} new uploads are in storage.`);
}
process.exit(0);

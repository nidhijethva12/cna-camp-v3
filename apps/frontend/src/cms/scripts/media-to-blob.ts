/**
 * One-time move of locally stored uploads (apps/frontend/media) to Vercel Blob, keeping each file's
 * name, which is exactly where the Blob storage plugin looks for it, so existing Photo records
 * keep working without database changes. Safe to re-run: files already in Blob are skipped.
 *
 * Run from apps/frontend with BLOB_READ_WRITE_TOKEN in .env: `npm run media:to-blob`
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { head, put } from "@vercel/blob";

const mediaDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../media");
const token = process.env.BLOB_READ_WRITE_TOKEN;
const mimeTypes: Record<string, string> = { ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".avif": "image/avif" };

async function exists(pathname: string) {
  try {
    await head(pathname, { token });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not set in apps/frontend/.env");
  const files = (await fs.readdir(mediaDir)).filter((f) => mimeTypes[path.extname(f).toLowerCase()]);
  let uploaded = 0;
  let skipped = 0;
  for (const name of files) {
    if (await exists(name)) {
      skipped += 1;
      continue;
    }
    await put(name, await fs.readFile(path.join(mediaDir, name)), {
      access: "public",
      addRandomSuffix: false,
      contentType: mimeTypes[path.extname(name).toLowerCase()],
      cacheControlMaxAge: 60 * 60 * 24 * 365,
      token,
    });
    uploaded += 1;
  }
  console.log(`Media to Blob: ${uploaded} uploaded, ${skipped} already there, ${files.length} files in total.`);
}

await main();
process.exit(0);

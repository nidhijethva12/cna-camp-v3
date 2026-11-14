import { MAX_UPLOAD_BYTES } from "./uploads";

const KEPT = ["image/jpeg", "image/png", "image/webp"];
// Tried in order until the photo fits under the limit: sharp enough to read a card, small enough to send.
const STEPS = [
  { side: 1600, quality: 0.82 },
  { side: 1400, quality: 0.72 },
  { side: 1200, quality: 0.65 },
  { side: 1000, quality: 0.6 },
];

/**
 * Shrinks a phone photo to JPEG until it is under 1 MB, so a 6 MB camera picture becomes a few hundred
 * KB before upload. A photo already small enough stays as it is. PDFs and files the browser can't read
 * as an image are returned unchanged, for the size and type checks to judge.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) return file;
  if (KEPT.includes(file.type) && file.size <= MAX_UPLOAD_BYTES) return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  try {
    let best: Blob | null = null;
    for (const { side, quality } of STEPS) {
      const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      best = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (best && best.size <= MAX_UPLOAD_BYTES) break;
    }
    // HEIC, AVIF and other phone formats always become JPEG; the server only takes JPEG, PNG and WebP.
    return best ? new File([best], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
  } finally {
    bitmap.close();
  }
}

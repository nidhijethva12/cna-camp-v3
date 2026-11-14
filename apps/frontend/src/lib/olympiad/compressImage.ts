/** Largest file the registration form accepts after shrinking photos; three of them stay under the host's 4.5 MB request limit. */
export const MAX_UPLOAD_BYTES = 1.4 * 1024 * 1024;

const MAX_SIDE = 1600;
const KEPT = ["image/jpeg", "image/png", "image/webp"];

/**
 * Shrinks a phone photo to at most 1600 px on its longer side as a JPEG, so a 6 MB camera picture
 * becomes a few hundred KB before upload. PDFs and images the browser can't read are returned as they are.
 */
export async function compressImage(file: File, quality = 0.82): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) return file;
  // HEIC, AVIF and other phone formats always become JPEG; the server only takes JPEG, PNG and WebP.
  if (blob.size >= file.size && KEPT.includes(file.type)) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

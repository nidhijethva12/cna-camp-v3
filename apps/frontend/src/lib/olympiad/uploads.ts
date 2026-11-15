/** Upload rules of the registration form, shared by the browser and the server so both refuse the same files. */

export type UploadKind = "photo" | "aadhaarCard" | "schoolIdCard";

/** 1 MB per file; three files stay well under the host's 4.5 MB request limit. */
export const MAX_UPLOAD_BYTES = 1024 * 1024;
/** Anything smaller is an empty or broken file, not a readable photo or scan. */
export const MIN_UPLOAD_BYTES = 1024;

const IMAGES = ["image/jpeg", "image/png", "image/webp"];

/** What each upload may be, by its real content (see `sniffType`). */
export const UPLOAD_TYPES: Record<UploadKind, string[]> = {
  photo: IMAGES,
  aadhaarCard: [...IMAGES, "application/pdf"],
  schoolIdCard: [...IMAGES, "application/pdf"],
};

/** The file picker's filter. Phone formats (HEIC) are allowed in: the form turns them into JPEG first. */
export const UPLOAD_ACCEPT: Record<UploadKind, string> = {
  photo: "image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif",
  aadhaarCard: "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.pdf",
  schoolIdCard: "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.pdf",
};

/** JPEG, PNG, WebP or PDF, told apart by their first bytes; anything else is null. */
export function sniffType(head: Uint8Array) {
  const starts = (...bytes: number[]) => bytes.every((b, i) => head[i] === b);
  if (starts(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (starts(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...head.slice(8, 12)) === "WEBP") return "image/webp";
  if (starts(0x25, 0x50, 0x44, 0x46, 0x2d)) return "application/pdf";
  return null;
}

export type UploadProblem = "photoType" | "fileType" | "fileTooBig" | "fileTooSmall";

/** Why a file can't be used for this upload, or null when it is fine. `type` is the sniffed type. */
export function uploadProblem(kind: UploadKind, type: string | null, size: number): UploadProblem | null {
  if (!type || !UPLOAD_TYPES[kind].includes(type)) return kind === "photo" ? "photoType" : "fileType";
  if (size > MAX_UPLOAD_BYTES) return "fileTooBig";
  if (size < MIN_UPLOAD_BYTES) return "fileTooSmall";
  return null;
}

/** The file's real type from its first bytes. */
export async function sniffFile(file: Blob) {
  return sniffType(new Uint8Array(await file.slice(0, 12).arrayBuffer()));
}

import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";
import type { MongooseAdapter } from "@payloadcms/db-mongodb";
import type { Binary, Collection, ObjectId } from "mongodb";
import type { Payload } from "payload";

/**
 * Aadhaar numbers and uploaded documents of Olympiad registrations, encrypted with AES-256-GCM.
 * The key (OLYMPIAD_DATA_KEY, 32 random bytes in base64) lives only in the website's environment:
 * the database and its backups hold ciphertext only. Losing the key makes the stored data unreadable.
 * Kept free of Next.js-only imports because Payload collection endpoints use it too.
 */

function dataKey() {
  const key = Buffer.from(process.env.OLYMPIAD_DATA_KEY ?? "", "base64");
  if (key.length !== 32) throw new Error("OLYMPIAD_DATA_KEY must be 32 bytes in base64");
  return key;
}

function seal(plain: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", dataKey(), iv);
  const data = Buffer.concat([cipher.update(plain), cipher.final()]);
  return { iv, tag: cipher.getAuthTag(), data };
}

function open(iv: Buffer, tag: Buffer, data: Buffer) {
  if (iv.length !== 12 || tag.length !== 16) throw new Error("Damaged encrypted value");
  const decipher = createDecipheriv("aes-256-gcm", dataKey(), iv, { authTagLength: 16 });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

/** "v1.<iv>.<tag>.<ciphertext>", base64url parts. */
export function encryptText(plain: string) {
  const { iv, tag, data } = seal(Buffer.from(plain, "utf8"));
  return ["v1", iv, tag, data].map((p) => (typeof p === "string" ? p : p.toString("base64url"))).join(".");
}

export function decryptText(sealed: string) {
  const [version, iv, tag, data] = sealed.split(".");
  if (version !== "v1" || !iv || !tag || !data) throw new Error("Unknown encrypted value");
  return open(Buffer.from(iv, "base64url"), Buffer.from(tag, "base64url"), Buffer.from(data, "base64url")).toString("utf8");
}

/** Same number, same hash: finds a repeat registration without decrypting anything. */
export const aadhaarHash = (aadhaar: string) => createHmac("sha256", dataKey()).update(`aadhaar:${aadhaar}`).digest("hex");

export type DocumentKind = "photo" | "aadhaarCard" | "schoolIdCard";

interface StoredFile {
  _id: ObjectId;
  kind: DocumentKind;
  contentType: string;
  size: number;
  iv: Binary;
  tag: Binary;
  data: Binary;
  createdAt: Date;
}

/** Raw MongoDB collection: never part of Payload's API, so the files can only be read through the checks below. */
function store(payload: Payload) {
  const db = payload.db as unknown as MongooseAdapter;
  const collection = db.connection.db!.collection("olympiad-files") as unknown as Collection<StoredFile>;
  const { ObjectId } = db.connection.base.Types;
  const id = (value: string) => (ObjectId.isValid(value) && /^[a-f0-9]{24}$/.test(value) ? new ObjectId(value) : null);
  return { collection, newId: () => new ObjectId(), id };
}

export async function storeFile(payload: Payload, kind: DocumentKind, file: File) {
  const { collection, newId } = store(payload);
  const { iv, tag, data } = seal(Buffer.from(await file.arrayBuffer()));
  const _id = newId();
  // Buffers are written as BSON binary and come back as Binary.
  await collection.insertOne({
    _id,
    kind,
    contentType: file.type,
    size: file.size,
    iv,
    tag,
    data,
    createdAt: new Date(),
  } as unknown as StoredFile);
  return _id.toHexString();
}

export async function readFile(payload: Payload, id: string) {
  const { collection, id: toId } = store(payload);
  const _id = toId(id);
  const file = _id ? await collection.findOne({ _id }) : null;
  if (!file) return null;
  return {
    kind: file.kind,
    contentType: file.contentType,
    body: open(Buffer.from(file.iv.buffer), Buffer.from(file.tag.buffer), Buffer.from(file.data.buffer)),
  };
}

export async function deleteFiles(payload: Payload, ids: (string | null | undefined)[]) {
  const { collection, id } = store(payload);
  const valid = ids.map((v) => (v ? id(v) : null)).filter((v): v is ObjectId => v !== null);
  if (valid.length) await collection.deleteMany({ _id: { $in: valid } });
}

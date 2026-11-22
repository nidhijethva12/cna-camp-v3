"use server";

import { revalidatePath } from "next/cache";
import type { CheckoutOrder } from "@/actions/olympiad/register";
import { callBackend } from "@/lib/olympiad/backend";
import { isAadhaar } from "@/lib/olympiad/rules";
import { aadhaarHash, deleteFiles, encryptText, storeFile, type DocumentKind } from "@/lib/olympiad/secure";
import { sessionToken } from "@/lib/olympiad/session";
import { readSheet } from "@/lib/olympiad/studentSheet";
import { sniffFile, uploadProblem, type UploadProblem } from "@/lib/olympiad/uploads";
import { getCms } from "@/lib/payload";

export interface ImportState {
  status: "idle" | "success" | "error";
  message?: string;
  added?: number;
  skipped?: { row: number; reason: string }[];
}

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_STUDENTS = 500;
const LOGGED_OUT = "Your login has ended. Please log in again.";
const DOCUMENTS: DocumentKind[] = ["photo", "aadhaarCard", "schoolIdCard"];
const UPLOAD_MESSAGES: Record<UploadProblem, string> = {
  photoType: "The photo must be a JPG, PNG or WebP picture.",
  fileType: "Upload a JPG, PNG or WebP picture, or a PDF.",
  fileTooBig: "This file is larger than 1 MB. Please upload a smaller one.",
  fileTooSmall: "This file looks empty or damaged. Please choose it again.",
};

/**
 * "Upload Excel": reads the sheet here, encrypts each Aadhaar number, and sends the rows to the
 * Olympiad API, which checks each one. The plain Aadhaar number never leaves this server.
 */
export async function importStudents(_prev: ImportState, fd: FormData): Promise<ImportState> {
  const session = await sessionToken();
  if (!session) return { status: "error", message: LOGGED_OUT };
  if (fd.get("declared") !== "on")
    return { status: "error", message: "Please tick the box to confirm the school holds each parent's consent." };
  const file = fd.get("sheet");
  if (!(file instanceof File) || !file.size) return { status: "error", message: "Choose the Excel file to upload." };
  if (file.size > MAX_FILE_BYTES || !/\.(xlsx|csv)$/i.test(file.name))
    return { status: "error", message: "Upload the template as an .xlsx (or .csv) file, up to 2 MB." };

  let rows;
  try {
    rows = await readSheet(file);
  } catch (err) {
    console.error("[olympiad] reading a school sheet failed", err);
    return { status: "error", message: "This file could not be read. Download the template, fill it and upload it again." };
  }
  if (!rows.length)
    return { status: "error", message: "No students found in the file. Fill the rows under the headings and upload again." };
  if (rows.length > MAX_STUDENTS)
    return { status: "error", message: `Up to ${MAX_STUDENTS} students per upload. Split the sheet into parts.` };

  let students;
  try {
    students = rows.map(({ aadhaar, ...row }) =>
      // A number that is not a valid Aadhaar is sent without its secrets; the API reports the row.
      isAadhaar(aadhaar)
        ? { ...row, aadhaarLast4: aadhaar.slice(-4), aadhaarHash: aadhaarHash(aadhaar), aadhaarEnc: encryptText(aadhaar) }
        : row,
    );
  } catch (err) {
    console.error("[olympiad] encrypting a school sheet failed", err);
    return { status: "error", message: "The sheet could not be saved just now. Please try again in a minute." };
  }

  const result = await callBackend<{ added: number; skipped: { row: number; reason: string }[] }>("/olympiad/partners/school/students", {
    body: { rows: students, declared: true },
    session,
  });
  if (!result.ok) return { status: "error", message: result.message };
  revalidatePath("/school-dashboard");
  return { status: "success", ...result.data };
}

export type StudentActionResult = { ok: true; complete?: boolean } | { ok: false; message: string };

/**
 * One document for one student on the school's sheet. The file is checked by its real content,
 * encrypted and stored here; the API links it to the student and says whether the entry is now complete.
 */
export async function uploadStudentDocument(fd: FormData): Promise<StudentActionResult> {
  const session = await sessionToken();
  if (!session) return { ok: false, message: LOGGED_OUT };
  const id = String(fd.get("id") ?? "");
  const kind = DOCUMENTS.find((k) => k === fd.get("kind"));
  const file = fd.get("file");
  if (!/^[a-f0-9]{24}$/.test(id) || !kind || !(file instanceof File) || !file.size)
    return { ok: false, message: "Choose the file to upload." };
  const type = await sniffFile(file);
  const problem = uploadProblem(kind, type, file.size);
  if (problem) return { ok: false, message: UPLOAD_MESSAGES[problem] };

  const payload = await getCms();
  let stored: string;
  try {
    stored = await storeFile(payload, kind, new File([file], file.name.slice(0, 120), { type: type! }));
  } catch (err) {
    console.error("[olympiad] storing a student document failed", err);
    return { ok: false, message: "The file could not be saved just now. Please try again." };
  }
  const result = await callBackend<{ complete: boolean; replaced: string | null }>("/olympiad/partners/school/students/document", {
    body: { id, kind, file: stored },
    session,
  });
  if (!result.ok) {
    // Only a clear "no" means the student does not point at this file; after a timeout it may.
    if (result.status >= 400 && result.status < 500) await deleteFiles(payload, [stored]).catch(() => {});
    else console.error(`[olympiad] student document not confirmed (${result.status}); kept file ${stored}`);
    return { ok: false, message: result.message };
  }
  await deleteFiles(payload, [result.data.replaced]).catch((err) => console.error("[olympiad] removing a replaced document failed", err));
  revalidatePath("/school-dashboard");
  return { ok: true, complete: result.data.complete };
}

/** Takes a student who is not confirmed yet off the school's sheet, with their uploaded files. */
export async function removeStudent(id: string): Promise<StudentActionResult> {
  const session = await sessionToken();
  if (!session) return { ok: false, message: LOGGED_OUT };
  if (!/^[a-f0-9]{24}$/.test(id)) return { ok: false, message: "This student could not be removed." };
  const result = await callBackend<{ files: string[] }>("/olympiad/partners/school/students/remove", { body: { id }, session });
  if (!result.ok) return { ok: false, message: result.message };
  await deleteFiles(await getCms(), result.data.files).catch((err) =>
    console.error("[olympiad] removing a student's documents failed", err),
  );
  revalidatePath("/school-dashboard");
  return { ok: true };
}

export type SchoolPayResult =
  | { ok: true; order: CheckoutOrder; count: number; amount: number; prefill: { name: string; email: string; contact: string } }
  | { ok: false; message: string };

/** "Pay for N students": one Razorpay order for every complete student the school still owes for. */
export async function payForStudents(): Promise<SchoolPayResult> {
  const session = await sessionToken();
  if (!session) return { ok: false, message: LOGGED_OUT };
  const result = await callBackend<Omit<Extract<SchoolPayResult, { ok: true }>, "ok">>("/olympiad/partners/school/pay", {
    method: "POST",
    session,
  });
  return result.ok ? { ok: true, ...result.data } : { ok: false, message: result.message };
}

"use server";

import { revalidatePath } from "next/cache";
import type { CheckoutOrder } from "@/actions/olympiad/register";
import { apiMessage, dashboardText } from "@/content/dashboards";
import { callBackend } from "@/lib/olympiad/backend";
import { dashboardLanguage } from "@/lib/olympiad/dashboardLanguage";
import { isAadhaar } from "@/lib/olympiad/rules";
import { aadhaarHash, deleteFiles, encryptText, storeFile, type DocumentKind } from "@/lib/olympiad/secure";
import { sessionToken } from "@/lib/olympiad/session";
import { readSheet } from "@/lib/olympiad/studentSheet";
import { MAX_UPLOAD_BYTES, sniffFile, uploadProblem } from "@/lib/olympiad/uploads";
import { getCms } from "@/lib/payload";

export interface ImportState {
  status: "idle" | "success" | "error";
  message?: string;
  added?: number;
  skipped?: { row: number; reason: string }[];
}

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_STUDENTS = 500;
const MAX_MB = MAX_UPLOAD_BYTES / (1024 * 1024);
const DOCUMENTS: DocumentKind[] = ["photo", "aadhaarCard", "schoolIdCard"];

/**
 * "Upload Excel": reads the sheet here, encrypts each Aadhaar number, and sends the rows to the
 * Olympiad API, which checks each one. The plain Aadhaar number never leaves this server.
 */
export async function importStudents(_prev: ImportState, fd: FormData): Promise<ImportState> {
  const lang = await dashboardLanguage();
  const t = dashboardText[lang];
  const session = await sessionToken();
  if (!session) return { status: "error", message: t.loggedOut };
  if (fd.get("declared") !== "on") return { status: "error", message: t.sheetUpload.needConsent };
  const file = fd.get("sheet");
  if (!(file instanceof File) || !file.size) return { status: "error", message: t.sheetUpload.chooseFile };
  if (file.size > MAX_FILE_BYTES || !/\.(xlsx|csv)$/i.test(file.name)) return { status: "error", message: t.sheetUpload.wrongFile };

  let rows;
  try {
    rows = await readSheet(file);
  } catch (err) {
    console.error("[olympiad] reading a school sheet failed", err);
    return { status: "error", message: t.sheetUpload.unreadable };
  }
  if (!rows.length) return { status: "error", message: t.sheetUpload.noRows };
  if (rows.length > MAX_STUDENTS) return { status: "error", message: t.sheetUpload.tooMany(MAX_STUDENTS) };

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
    return { status: "error", message: t.sheetUpload.notSaved };
  }

  const result = await callBackend<{ added: number; skipped: { row: number; reason: string }[] }>("/olympiad/partners/school/students", {
    body: { rows: students, declared: true },
    session,
  });
  if (!result.ok) return { status: "error", message: apiMessage(result.message, lang) };
  revalidatePath("/school-dashboard");
  return {
    status: "success",
    added: result.data.added,
    skipped: result.data.skipped.map((s) => ({ row: s.row, reason: apiMessage(s.reason, lang) })),
  };
}

export type StudentActionResult = { ok: true; complete?: boolean } | { ok: false; message: string };

/**
 * One document for one student on the school's sheet. The file is checked by its real content,
 * encrypted and stored here; the API links it to the student and says whether the entry is now complete.
 */
export async function uploadStudentDocument(fd: FormData): Promise<StudentActionResult> {
  const lang = await dashboardLanguage();
  const t = dashboardText[lang];
  const session = await sessionToken();
  if (!session) return { ok: false, message: t.loggedOut };
  const id = String(fd.get("id") ?? "");
  const kind = DOCUMENTS.find((k) => k === fd.get("kind"));
  const file = fd.get("file");
  if (!/^[a-f0-9]{24}$/.test(id) || !kind || !(file instanceof File) || !file.size) return { ok: false, message: t.students.chooseTheFile };
  const type = await sniffFile(file);
  const problem = uploadProblem(kind, type, file.size);
  if (problem)
    return { ok: false, message: problem === "fileTooBig" ? t.students.problems.fileTooBig(MAX_MB) : t.students.problems[problem] };

  const payload = await getCms();
  let stored: string;
  try {
    stored = await storeFile(payload, kind, new File([file], file.name.slice(0, 120), { type: type! }));
  } catch (err) {
    console.error("[olympiad] storing a student document failed", err);
    return { ok: false, message: t.students.notStored };
  }
  const result = await callBackend<{ complete: boolean; replaced: string | null }>("/olympiad/partners/school/students/document", {
    body: { id, kind, file: stored },
    session,
  });
  if (!result.ok) {
    // Only a clear "no" means the student does not point at this file; after a timeout it may.
    if (result.status >= 400 && result.status < 500) await deleteFiles(payload, [stored]).catch(() => {});
    else console.error(`[olympiad] student document not confirmed (${result.status}); kept file ${stored}`);
    return { ok: false, message: apiMessage(result.message, lang) };
  }
  await deleteFiles(payload, [result.data.replaced]).catch((err) => console.error("[olympiad] removing a replaced document failed", err));
  revalidatePath("/school-dashboard");
  return { ok: true, complete: result.data.complete };
}

/** Takes a student who is not confirmed yet off the school's sheet, with their uploaded files. */
export async function removeStudent(id: string): Promise<StudentActionResult> {
  const lang = await dashboardLanguage();
  const t = dashboardText[lang];
  const session = await sessionToken();
  if (!session) return { ok: false, message: t.loggedOut };
  if (!/^[a-f0-9]{24}$/.test(id)) return { ok: false, message: t.students.notRemoved };
  const result = await callBackend<{ files: string[] }>("/olympiad/partners/school/students/remove", { body: { id }, session });
  if (!result.ok) return { ok: false, message: apiMessage(result.message, lang) };
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
  const lang = await dashboardLanguage();
  const session = await sessionToken();
  if (!session) return { ok: false, message: dashboardText[lang].loggedOut };
  const result = await callBackend<Omit<Extract<SchoolPayResult, { ok: true }>, "ok">>("/olympiad/partners/school/pay", {
    method: "POST",
    session,
  });
  return result.ok ? { ok: true, ...result.data } : { ok: false, message: apiMessage(result.message, lang) };
}

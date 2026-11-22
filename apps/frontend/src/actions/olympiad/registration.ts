"use server";

import { cookies } from "next/headers";
import type { CheckoutOrder } from "@/actions/olympiad/register";
import { callBackend } from "@/lib/olympiad/backend";
import { registrationText, type RegLang } from "@/content/registration";
import { antiSpam } from "@/lib/olympiad/forms";
import { sniffFile, uploadProblem } from "@/lib/olympiad/uploads";
import {
  ACHIEVEMENT_OTHER,
  emptyRegistration,
  firstIncompleteStep,
  shape,
  stepErrors,
  type RegistrationField,
  type RegistrationInput,
} from "@/lib/olympiad/registration";
import { aadhaarHash, deleteFiles, encryptText, storeFile, type DocumentKind } from "@/lib/olympiad/secure";
import { getOlympiadConfig, registrationState } from "@/lib/olympiad/settings";
import { getCms } from "@/lib/payload";

interface Saved {
  /** The Registration ID; empty until the fee is paid (a free registration has it at once). */
  regId: string;
  /** Opens the receipt of a free registration; paid ones get theirs once Razorpay confirms. */
  receiptToken?: string | null;
  name: string;
  group: string;
  fee: number;
  /** True when nothing is left to pay (₹0); otherwise Razorpay Checkout opens with `order`. */
  paid: boolean;
  order: CheckoutOrder;
  prefill: { name: string; email: string; contact: string };
}

export type RegistrationResult =
  ({ ok: true } & Saved) | { ok: false; message: string; fieldErrors?: Partial<Record<RegistrationField, string>> };

/** The API answers in English; each message it can send is shown in the form's language. */
function apiMessage(status: number, message: string, t: (typeof registrationText)["en"]["errors"]) {
  if (status === 429) return t.tooMany;
  if (message.startsWith("Please complete the security check")) return t.securityCheck;
  if (message.startsWith("Registration is not open")) return t.closed;
  if (message.startsWith("This form was just sent")) return t.aadhaarBusy;
  return t.tryAgain;
}

/** Reads the form's answers, keeping only known fields of the right kind. */
function readInput(raw: unknown): RegistrationInput {
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out = { ...emptyRegistration } as Record<string, unknown>;
  for (const [key, empty] of Object.entries(emptyRegistration)) {
    const value = data[key];
    if (typeof empty === "boolean") out[key] = value === true;
    else if (Array.isArray(empty)) out[key] = Array.isArray(value) ? value.filter((v) => typeof v === "string").slice(0, 12) : [];
    else out[key] = typeof value === "string" ? value.trim().slice(0, 200) : "";
  }
  return out as unknown as RegistrationInput;
}

const asFile = (value: FormDataEntryValue | null) => (value instanceof File && value.size > 0 ? value : null);
const digits = (value: string) => value.replace(/\D/g, "");

/**
 * "Register" / "Pay": checks every step again, encrypts the Aadhaar number and the documents, then
 * hands the registration to the Olympiad API, which saves it and opens the payment.
 */
export async function submitRegistration(fd: FormData): Promise<RegistrationResult> {
  const lang: RegLang = fd.get("lang") === "gu" ? "gu" : "en";
  const t = registrationText[lang].errors;
  let input: RegistrationInput;
  try {
    input = readInput(JSON.parse(String(fd.get("input") ?? "{}")));
  } catch {
    return { ok: false, message: t.unreadable };
  }
  const s = shape(input);
  const files: Record<DocumentKind, File | null> = {
    photo: asFile(fd.get("photo")),
    aadhaarCard: asFile(fd.get("aadhaarCard")),
    schoolIdCard: s.proof ? asFile(fd.get("schoolIdCard")) : null,
  };
  // The browser's word for a file's type is not trusted: the first bytes decide what is stored, and
  // each upload must be an allowed type for its slot and between 5 KB and 1 MB.
  for (const [key, file] of Object.entries(files) as [DocumentKind, File | null][]) {
    if (!file) continue;
    const type = await sniffFile(file);
    const problem = uploadProblem(key, type, file.size);
    if (problem) return { ok: false, message: t.checkFields, fieldErrors: { [key]: t[problem] } };
    files[key] = new File([file], file.name.slice(0, 120), { type: type! });
  }
  const has = { photo: Boolean(files.photo), aadhaarCard: Boolean(files.aadhaarCard), schoolIdCard: Boolean(files.schoolIdCard) };
  const config = await getOlympiadConfig();
  const step = firstIncompleteStep(input, has, config.quizSlots);
  if (step) return { ok: false, message: t.checkFields, fieldErrors: stepErrors(step, input, has, lang, config.quizSlots) };

  // Cheap checks first, so nothing is stored for bots or while registration is shut.
  if (antiSpam(fd).website) return { ok: false, message: t.tryAgain };
  if (registrationState(config) !== "open") return { ok: false, message: t.closed };

  const payload = await getCms();
  const aadhaar = digits(input.aadhaar);
  const stored: string[] = [];
  let documents: Partial<Record<DocumentKind, string>> = {};
  let secret: { aadhaarEnc: string; aadhaarHash: string };
  try {
    secret = { aadhaarEnc: encryptText(aadhaar), aadhaarHash: aadhaarHash(aadhaar) };
    for (const [kind, file] of Object.entries(files) as [DocumentKind, File | null][]) {
      if (!file) continue;
      const id = await storeFile(payload, kind, file);
      stored.push(id);
      documents = { ...documents, [kind]: id };
    }
  } catch (err) {
    console.error("[olympiad] storing registration documents failed", err);
    await deleteFiles(payload, stored).catch(() => {});
    return { ok: false, message: t.tryAgain };
  }

  const achievements = input.achievements
    .filter((a) => a !== ACHIEVEMENT_OTHER)
    .concat(input.achievements.includes(ACHIEVEMENT_OTHER) ? [`Other: ${input.achievementOther}`] : []);
  const result = await callBackend<Saved & { staleFiles: string[] }>("/olympiad/registrations", {
    body: {
      who: input.who,
      dob: input.dob,
      schoolType: input.schoolType,
      govtStd6to8: s.asksStd6to8 ? input.govtStd6to8 : "",
      firstName: input.firstName,
      fatherName: s.orphan ? "" : input.fatherName,
      surname: input.surname,
      motherName: s.orphan ? "" : input.motherName,
      ...(input.who === "student" ? { fatherAlive: input.fatherAlive, motherAlive: input.motherAlive } : {}),
      mobile: input.mobile,
      whatsapp: input.whatsappSame ? input.mobile : input.whatsapp,
      email: input.email,
      address: input.address,
      district: input.district,
      pin: input.pin,
      quizLanguage: input.quizLanguage,
      quizWindow: input.quizWindow,
      formLanguage: lang,
      parentRelation: input.parentWho,
      parentName: input.parentName,
      parentMobile: input.parentSameMobile ? input.mobile : input.parentMobile,
      school: input.school,
      std: input.std,
      ...(s.slot && config.quizSlots.length ? { quizDate: input.quizDate, quizTime: input.quizTime } : {}),
      schoolId: input.schoolId,
      contactRole: input.contactRole,
      contactName: input.contactName,
      contactMobile: input.contactMobile,
      teacherStatus: input.teacherStatus,
      subject: input.subject,
      work: input.work,
      ambassador: s.asksAmbassador && input.ambassador === "yes",
      achievements,
      aadhaarLast4: aadhaar.slice(-4),
      ...secret,
      documents,
      agree: input.agree,
      refCode: (await cookies()).get("olympiad_ref")?.value ?? "",
      invite: String(fd.get("invite") ?? "").slice(0, 512),
      ...antiSpam(fd),
    },
  });

  if (!result.ok) {
    // Only a clear "no" from the API means nothing was saved. After a timeout or server error the
    // registration may exist and point at these files, so they stay.
    if (result.status >= 400 && result.status < 500)
      await deleteFiles(payload, stored).catch((err) => console.error("[olympiad] cleaning up documents failed", err));
    else console.error(`[olympiad] registration not confirmed (${result.status}); kept documents ${stored.join(", ")}`);
    const aadhaarError = result.fieldErrors?.aadhaar ?? "";
    const taken = aadhaarError.match(/AO2-[0A-E]-\d+/)?.[0];
    if (taken) return { ok: false, message: t.aadhaarTaken(taken), fieldErrors: { aadhaar: t.aadhaarTaken(taken) } };
    if (aadhaarError.startsWith("Already used")) return { ok: false, message: t.aadhaarUsed, fieldErrors: { aadhaar: t.aadhaarUsed } };
    if (aadhaarError.startsWith("Already being")) return { ok: false, message: t.aadhaarBusy, fieldErrors: { aadhaar: t.aadhaarBusy } };
    if (!result.fieldErrors) return { ok: false, message: apiMessage(result.status, result.message, t) };
    // The API repeats the website's own checks, so its field errors are rare; show them in the form's language.
    const messages = t as unknown as Record<string, unknown>;
    const fieldErrors = Object.fromEntries(
      Object.keys(result.fieldErrors).map((f) => [
        f,
        typeof messages[f] === "string" ? messages[f] : f === "parentWho" || f === "govtStd6to8" ? t.choose : t.checkFields,
      ]),
    ) as Partial<Record<RegistrationField, string>>;
    return { ok: false, message: t.checkFields, fieldErrors };
  }
  const { staleFiles, ...saved } = result.data;
  await deleteFiles(payload, staleFiles ?? []).catch((err) => console.error("[olympiad] removing old documents failed", err));
  return { ok: true, ...saved };
}

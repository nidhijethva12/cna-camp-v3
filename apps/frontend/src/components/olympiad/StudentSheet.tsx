"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { removeStudent, uploadStudentDocument } from "@/actions/olympiad/school";
import type { OlympiadLang } from "@/components/olympiad/LanguageSwitch";
import { Check } from "@/components/ui/icons";
import { dashboardText } from "@/content/dashboards";
import { compressImage } from "@/lib/olympiad/compressImage";
import { MAX_UPLOAD_BYTES, sniffFile, UPLOAD_ACCEPT, uploadProblem, type UploadKind, type UploadProblem } from "@/lib/olympiad/uploads";

export interface SheetStudent {
  id: string;
  regId: string;
  name: string;
  dob: string;
  stage: string;
  group: string;
  fee: number;
  aadhaarLast4: string;
  mobile: string;
  needsProof: boolean;
  documents: Record<UploadKind, boolean>;
  status: "documents" | "pending" | "paid" | "free";
  removable: boolean;
}

const STATUS_TONE = {
  documents: "bg-secondary/25 text-dark",
  pending: "bg-primary-soft text-primary",
  paid: "bg-success/12 text-success",
  free: "bg-success/12 text-success",
} as const;

const MAX_MB = MAX_UPLOAD_BYTES / (1024 * 1024);

/** The documents a student needs, in the order the school uploads them. Only the photo must be a picture. */
const DOCUMENTS: { kind: UploadKind; pictureOnly?: boolean; proofOnly?: boolean }[] = [
  { kind: "photo", pictureOnly: true },
  { kind: "aadhaarCard" },
  { kind: "schoolIdCard", proofOnly: true },
];

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const birthDate = (iso: string) => iso.split("-").reverse().join("-");
const documentsFor = (student: SheetStudent) => DOCUMENTS.filter((d) => !d.proofOnly || student.needsProof);

/** One document of one student, as its own row: what is needed, whether it is in, and the file chooser. */
function DocumentRow({
  student,
  kind,
  pictureOnly,
  lang,
  onError,
}: {
  student: SheetStudent;
  kind: UploadKind;
  pictureOnly: boolean;
  lang: OlympiadLang;
  onError: (message: string) => void;
}) {
  const t = dashboardText[lang].students;
  const label = t.documents[kind];
  const problemText = (problem: UploadProblem) => (problem === "fileTooBig" ? t.problems.fileTooBig(MAX_MB) : t.problems[problem]);
  const router = useRouter();
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const done = student.documents[kind];
  const locked = student.status === "paid" || student.status === "free";

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    onError("");
    try {
      // Phone photos are shrunk first; the type and size are then checked exactly as the server checks them.
      const ready = await compressImage(file);
      const problem = uploadProblem(kind, await sniffFile(ready), ready.size);
      if (problem) return onError(`${student.name}, ${label}: ${problemText(problem)}`);
      const fd = new FormData();
      fd.set("id", student.id);
      fd.set("kind", kind);
      fd.set("file", ready);
      const result = await uploadStudentDocument(fd);
      if (!result.ok) return onError(`${student.name}, ${label}: ${result.message}`);
      router.refresh();
    } catch {
      onError(`${student.name}, ${label}: ${t.failed}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr className="border-t border-line/70">
      <th scope="row" className="py-2.5 pr-4 pl-4 text-left font-normal sm:pl-6">
        <span className="block font-semibold">{label}</span>
        <span className="text-[12.5px] text-muted">{pictureOnly ? t.picture(MAX_MB) : t.pictureOrPdf(MAX_MB)}</span>
      </th>
      <td className="px-4 py-2.5 whitespace-nowrap">
        {done ? (
          <span className="inline-flex items-center gap-1 text-[13.5px] font-bold text-success">
            <Check /> {t.uploaded}
          </span>
        ) : (
          <span className="text-[13.5px] font-bold text-primary">{t.notUploaded}</span>
        )}
      </td>
      <td className="relative py-2.5 pr-4 pl-4 text-right whitespace-nowrap sm:pr-6">
        {!locked && (
          <>
            <label
              htmlFor={inputId}
              className={`inline-block cursor-pointer rounded-card border px-3 py-1.5 font-display text-[13px] font-bold ${
                done
                  ? "border-line text-muted hover:border-dark hover:text-dark"
                  : "border-primary bg-primary text-light hover:bg-primary-hover"
              } ${busy ? "pointer-events-none opacity-60" : ""}`}
            >
              {busy ? t.uploading : done ? t.replace : t.choose}
              <span className="sr-only">
                {" "}
                {label}: {student.name}
              </span>
            </label>
            <input
              id={inputId}
              type="file"
              accept={UPLOAD_ACCEPT[kind]}
              disabled={busy}
              className="sr-only"
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </>
        )}
      </td>
    </tr>
  );
}

/**
 * The school's uploaded sheet, live: every student with their group, fee and status, and one row per
 * document to upload. A student becomes "Ready to pay" (or confirmed, when free) with the last document.
 */
export function StudentSheet({ students, lang }: { students: SheetStudent[]; lang: OlympiadLang }) {
  const t = dashboardText[lang].students;
  const router = useRouter();
  const [error, setError] = useState("");
  const [removing, startRemove] = useTransition();

  const remove = (student: SheetStudent) => {
    if (!window.confirm(t.removeConfirm(student.name))) return;
    setError("");
    startRemove(async () => {
      const result = await removeStudent(student.id);
      if (!result.ok) setError(`${student.name}: ${result.message}`);
      else router.refresh();
    });
  };

  return (
    <div className="border-b border-line">
      <div className="px-6 pt-5">
        <p className="font-display font-bold">{t.title(students.length)}</p>
        <p className="mt-1 max-w-[80ch] text-[14.5px] text-muted">{t.text}</p>
        {error && (
          <p role="alert" className="mt-3 rounded-card bg-primary-soft px-3.5 py-2.5 text-[14px] text-primary">
            {error}
          </p>
        )}
      </div>
      <ul className="mt-4 grid gap-3 px-3 pb-5 sm:px-6">
        {students.map((s) => {
          const documents = documentsFor(s);
          const uploaded = documents.filter((d) => s.documents[d.kind]).length;
          return (
            <li key={s.id} className="overflow-hidden rounded-card border border-line">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-soft px-4 py-3 sm:px-6">
                <div className="min-w-0 flex-1 basis-[220px]">
                  <b className="block font-display text-[16px]">{s.name}</b>
                  <span className="text-[13px] text-muted">
                    {s.regId || t.aadhaar(s.aadhaarLast4)} · {t.born(birthDate(s.dob))} · {s.stage}
                  </span>
                </div>
                <span className="text-[14px]">
                  {t.group} <b className="font-display">{s.group}</b>
                </span>
                <span className="text-[14px] tabular-nums">
                  {t.fee} <b className="font-display">{s.fee ? rupees(s.fee) : t.free}</b>
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 font-display text-[12.5px] font-bold whitespace-nowrap ${STATUS_TONE[s.status]}`}
                >
                  {s.status === "documents" ? t.documentsOf(uploaded, documents.length) : t.status[s.status]}
                </span>
                {s.removable && (
                  <button
                    type="button"
                    disabled={removing}
                    onClick={() => remove(s)}
                    className="text-[13px] font-bold text-muted underline hover:text-primary disabled:opacity-60"
                  >
                    {t.remove}
                    <span className="sr-only"> {s.name}</span>
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-[14.5px]">
                  <caption className="sr-only">{t.documentsFor(s.name)}</caption>
                  <tbody>
                    {documents.map((d) => (
                      <DocumentRow
                        key={d.kind}
                        student={s}
                        kind={d.kind}
                        pictureOnly={Boolean(d.pictureOnly)}
                        lang={lang}
                        onError={setError}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

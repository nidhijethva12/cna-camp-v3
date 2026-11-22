"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { removeStudent, uploadStudentDocument } from "@/actions/olympiad/school";
import { Check } from "@/components/ui/icons";
import { compressImage } from "@/lib/olympiad/compressImage";
import { sniffFile, UPLOAD_ACCEPT, uploadProblem, type UploadKind, type UploadProblem } from "@/lib/olympiad/uploads";

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

const STATUS = {
  documents: { label: "Documents needed", tone: "bg-secondary/25 text-dark" },
  pending: { label: "Ready to pay", tone: "bg-primary-soft text-primary" },
  paid: { label: "Paid", tone: "bg-success/12 text-success" },
  free: { label: "Confirmed (free)", tone: "bg-success/12 text-success" },
} as const;

const PROBLEMS: Record<UploadProblem, string> = {
  photoType: "The photo must be a JPG, PNG or WebP picture.",
  fileType: "Upload a JPG, PNG or WebP picture, or a PDF.",
  fileTooBig: "This file is larger than 1 MB even after shrinking. Please use a smaller one.",
  fileTooSmall: "This file looks empty or damaged. Please choose it again.",
};

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const birthDate = (iso: string) => iso.split("-").reverse().join("-");

/** One document cell: shows whether the file is in, and uploads or replaces it. Locked once the student is confirmed. */
function DocumentCell({
  student,
  kind,
  label,
  onError,
}: {
  student: SheetStudent;
  kind: UploadKind;
  label: string;
  onError: (message: string) => void;
}) {
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
      const ready = await compressImage(file);
      // The same checks the server makes, so a wrong file is refused before it is sent.
      const problem = uploadProblem(kind, await sniffFile(ready), ready.size);
      if (problem) return onError(`${student.name}, ${label}: ${PROBLEMS[problem]}`);
      const fd = new FormData();
      fd.set("id", student.id);
      fd.set("kind", kind);
      fd.set("file", ready);
      const result = await uploadStudentDocument(fd);
      if (!result.ok) return onError(`${student.name}, ${label}: ${result.message}`);
      router.refresh();
    } catch {
      onError(`${student.name}, ${label}: the upload did not go through. Check your internet connection and try again.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <td className="px-4 py-3 whitespace-nowrap">
      {done && (
        <span className="mr-2 inline-flex items-center gap-1 text-[13px] font-bold text-success">
          <Check /> Added
        </span>
      )}
      {!locked && (
        <>
          <label
            htmlFor={inputId}
            className={`inline-block cursor-pointer rounded-card border px-2.5 py-1.5 font-display text-[13px] font-bold ${
              done ? "border-line text-muted hover:border-dark hover:text-dark" : "border-primary text-primary hover:bg-primary-soft"
            } ${busy ? "pointer-events-none opacity-60" : ""}`}
          >
            {busy ? "Uploading…" : done ? "Replace" : "Upload"}
            <span className="sr-only">
              {" "}
              {label} for {student.name}
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
  );
}

/**
 * The school's uploaded sheet, live: every student with their group, fee and status, and a place to
 * add each document. A student becomes "Ready to pay" (or confirmed, when free) with the last document.
 */
export function StudentSheet({ students }: { students: SheetStudent[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [removing, startRemove] = useTransition();

  const remove = (student: SheetStudent) => {
    if (!window.confirm(`Remove ${student.name} from your sheet? Their uploaded documents are deleted too.`)) return;
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
        <p className="font-display font-bold">Your students ({students.length})</p>
        <p className="mt-1 max-w-[80ch] text-[14.5px] text-muted">
          Add the photo and Aadhaar card for each student. Students marked for a school ID card or bonafide certificate need that too: it
          proves the free or lower government fee. Pictures are shrunk automatically; each file can be up to 1 MB.
        </p>
        {error && (
          <p role="alert" className="mt-3 rounded-card bg-primary-soft px-3.5 py-2.5 text-[14px] text-primary">
            {error}
          </p>
        )}
      </div>
      <div className="relative mt-3 overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-[14.5px]">
          <thead className="bg-soft text-[13px] text-muted">
            <tr>
              {["Student", "Birth date", "Class", "Group", "Fee", "Photo", "Aadhaar card", "School ID / bonafide", "Status", ""].map(
                (h, i) => (
                  <th key={h || i} scope="col" className="px-4 py-3 font-semibold first:pl-6">
                    {h || <span className="sr-only">Actions</span>}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {students.map((s) => (
              <tr key={s.id}>
                <td className="py-3 pr-4 pl-6">
                  <b className="block font-display whitespace-nowrap">{s.name}</b>
                  <span className="text-[13px] whitespace-nowrap text-muted">{s.regId || `Aadhaar XXXX XXXX ${s.aadhaarLast4}`}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">{birthDate(s.dob)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{s.stage}</td>
                <td className="px-4 py-3">{s.group}</td>
                <td className="px-4 py-3 tabular-nums">{s.fee ? rupees(s.fee) : "Free"}</td>
                <DocumentCell student={s} kind="photo" label="Photo" onError={setError} />
                <DocumentCell student={s} kind="aadhaarCard" label="Aadhaar card" onError={setError} />
                {s.needsProof ? (
                  <DocumentCell student={s} kind="schoolIdCard" label="School ID or bonafide" onError={setError} />
                ) : (
                  <td className="px-4 py-3 text-[13px] text-muted">Not needed</td>
                )}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`rounded-full px-2.5 py-1 font-display text-[12.5px] font-bold ${STATUS[s.status].tone}`}>
                    {STATUS[s.status].label}
                  </span>
                </td>
                <td className="px-4 py-3 pr-6 text-right">
                  {s.removable && (
                    <button
                      type="button"
                      disabled={removing}
                      onClick={() => remove(s)}
                      className="text-[13px] font-bold text-muted underline hover:text-primary disabled:opacity-60"
                    >
                      Remove<span className="sr-only"> {s.name}</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

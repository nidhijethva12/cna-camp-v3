"use client";

import { useActionState } from "react";
import { importStudents, type ImportState } from "@/actions/olympiad/school";
import { FileText } from "@/components/ui/icons";

const initial: ImportState = { status: "idle" };

/** "Upload Excel" / "Download template": adds students in bulk; each parent then finishes the form from a link. */
export function StudentImport() {
  const [state, action, pending] = useActionState(importStudents, initial);

  return (
    <div className="border-b border-line px-6 py-5">
      <p className="font-display font-bold">Add students from Excel</p>
      <p className="mt-1 max-w-[70ch] text-[14.5px] text-muted">
        Fill the template with your students and upload it. Each parent gets an email link to add the photo, Aadhaar and consent; for a
        student without a parent email, copy their link below and send it on WhatsApp.
      </p>
      <form action={action} className="mt-3.5 flex flex-wrap items-center gap-3">
        <a href="/school-dashboard/template" className="btn btn-outline min-h-0 px-4 py-2.5 text-[14px]" download>
          <FileText /> Download template
        </a>
        <label className="flex min-w-0 items-center gap-2 rounded-card border-[1.5px] border-dashed border-line px-3 py-2 text-[14px]">
          <span className="sr-only">Excel file</span>
          <input name="sheet" type="file" accept=".xlsx,.csv" required className="max-w-[240px] text-[13.5px]" />
        </label>
        <button type="submit" disabled={pending} className="btn btn-dark min-h-0 px-4 py-2.5 text-[14px]">
          {pending ? "Uploading…" : "Upload Excel"}
        </button>
      </form>
      {state.status === "error" && (
        <p role="alert" className="mt-3 rounded-card bg-primary-soft px-3.5 py-2.5 text-[14px] text-primary">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <div role="status" className="mt-3 rounded-card border border-line bg-soft px-4 py-3 text-[14.5px]">
          <p>
            <b className="text-success">
              {state.added} {state.added === 1 ? "student" : "students"} added.
            </b>{" "}
            {state.emailed ? `${state.emailed} parent ${state.emailed === 1 ? "email is" : "emails are"} on the way.` : ""}
          </p>
          {state.skipped && state.skipped.length > 0 && (
            <>
              <p className="mt-2 font-semibold">
                {state.skipped.length} {state.skipped.length === 1 ? "row was" : "rows were"} not added:
              </p>
              <ul className="mt-1 grid max-h-48 gap-0.5 overflow-y-auto text-[13.5px] text-muted">
                {state.skipped.map((s) => (
                  <li key={`${s.row}-${s.reason}`}>
                    Row {s.row}: {s.reason}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { importStudents, type ImportState } from "@/actions/olympiad/school";
import type { OlympiadLang } from "@/components/olympiad/LanguageSwitch";
import { FileText } from "@/components/ui/icons";
import { dashboardText } from "@/content/dashboards";

const initial: ImportState = { status: "idle" };

/** "Download template" / "Upload Excel": the school enters every student's registration details in one sheet. */
export function StudentImport({ lang }: { lang: OlympiadLang }) {
  const t = dashboardText[lang].sheetUpload;
  const [state, action, pending] = useActionState(importStudents, initial);

  return (
    <div className="border-b border-line px-6 py-5">
      <p className="font-display font-bold">{t.title}</p>
      <p className="mt-1 max-w-[70ch] text-[14.5px] text-muted">{t.text}</p>
      <form action={action} className="mt-3.5 flex flex-wrap items-center gap-3">
        <label className="flex basis-full cursor-pointer items-start gap-2.5 text-[14.5px] leading-snug">
          <input name="declared" type="checkbox" required className="mt-0.5 h-5 w-5 shrink-0 accent-primary" />
          <span>{t.consent}</span>
        </label>
        <a href="/school-dashboard/template" className="btn btn-outline min-h-0 px-4 py-2.5 text-[14px]" download>
          <FileText /> {t.template}
        </a>
        <label className="flex min-w-0 items-center gap-2 rounded-card border-[1.5px] border-dashed border-line px-3 py-2 text-[14px]">
          <span className="sr-only">{t.file}</span>
          <input name="sheet" type="file" accept=".xlsx,.csv" required className="max-w-[240px] text-[13.5px]" />
        </label>
        <button type="submit" disabled={pending} className="btn btn-dark min-h-0 px-4 py-2.5 text-[14px]">
          {pending ? t.uploading : t.upload}
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
            <b className="text-success">{t.added(state.added ?? 0)}</b> {state.added ? t.next : ""}
          </p>
          {state.skipped && state.skipped.length > 0 && (
            <>
              <p className="mt-2 font-semibold">{t.skipped(state.skipped.length)}</p>
              <ul className="mt-1 grid max-h-48 gap-0.5 overflow-y-auto text-[13.5px] text-muted">
                {state.skipped.map((s) => (
                  <li key={`${s.row}-${s.reason}`}>{t.row(s.row, s.reason)}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

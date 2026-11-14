"use client";

import Link from "next/link";
import { useActionState, useId, type ReactNode } from "react";
import { signupPartner, type SignupField, type SignupState } from "@/actions/olympiad/partner";
import type { OlympiadLang } from "@/components/olympiad/LanguageSwitch";
import { ArrowRight, CheckCircle } from "@/components/ui/icons";
import { Select } from "@/components/ui/Select";
import { ambassadorRoleLabels, dashboardPath, institutionTypeLabels, partnerPageText, type PartnerKind } from "@/content/partnerPages";
import { AMBASSADOR_ROLES, DISTRICTS, INSTITUTION_TYPES } from "@/lib/olympiad/rules";
import { Honeypot, Turnstile } from "./Turnstile";

const initial: SignupState = { status: "idle" };

/** The School Partner or Ambassador sign-up card; on success it explains what happens next. */
export function PartnerSignupForm({ kind, lang }: { kind: PartnerKind; lang: OlympiadLang }) {
  const t = partnerPageText[lang];
  const k = t[kind];
  const [state, action, pending] = useActionState(signupPartner, initial);
  const id = useId();
  const v = state.values ?? {};

  if (state.status === "success" && state.data) {
    const approved = state.data.status === "approved";
    return (
      <div className="grid justify-items-center gap-3 rounded-card border border-line bg-light p-7 text-center shadow-card" role="status">
        <span className="grid h-15 w-15 place-items-center rounded-full bg-success/12 text-[30px] text-success">
          <CheckCircle />
        </span>
        <h2 className="font-display text-[22px] font-extrabold">
          {approved ? t.done.approvedTitle(state.data.firstName) : t.done.waitingTitle(state.data.firstName)}
        </h2>
        <p className="max-w-[44ch] text-[15.5px] text-muted">{approved ? t.done.approvedText : t.done.waitingText}</p>
        {approved && (
          <Link href={dashboardPath[kind]} className="btn btn-primary mt-1">
            {t.logIn} <ArrowRight />
          </Link>
        )}
      </div>
    );
  }

  const err = (f: SignupField) => state.fieldErrors?.[f];
  const text = (
    f: SignupField,
    label: string,
    opts: { type?: "text" | "tel" | "email"; placeholder?: string; hint?: string; max?: number } = {},
  ) => (
    <Field id={`${id}-${f}`} label={label} error={err(f)} hint={opts.hint}>
      <input
        id={`${id}-${f}`}
        name={f}
        type={opts.type ?? "text"}
        inputMode={opts.type === "tel" ? "numeric" : undefined}
        maxLength={opts.max ?? 120}
        defaultValue={v[f]}
        placeholder={opts.placeholder}
        aria-invalid={err(f) ? true : undefined}
        className={`field ${err(f) ? "border-danger" : ""}`}
      />
    </Field>
  );
  const select = (f: SignupField, label: string, options: { value: string; label: string }[]) => (
    <Field id={`${id}-${f}`} label={label} error={err(f)}>
      <Select name={f} emptyLabel={t.choose} defaultValue={v[f]} options={options} aria-invalid={err(f) ? true : undefined} />
    </Field>
  );

  return (
    <form action={action} noValidate className="grid gap-4 rounded-card border border-line bg-light p-6 shadow-card sm:p-7">
      <div>
        <h2 className="font-display text-[22px] font-extrabold">{k.formTitle}</h2>
        <p className="mt-1 text-[14.5px] text-muted">{k.formLead}</p>
      </div>
      <Honeypot />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="lang" value={lang} />
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-card bg-primary-soft px-3.5 py-2.5 text-[14.5px] text-primary-hover">
          {state.message}
        </p>
      )}

      {kind === "school" ? (
        <>
          {text("name", t.school.fields.name, { placeholder: t.school.placeholders.name })}
          <div className="grid gap-4 sm:grid-cols-2">
            {text("udise", t.school.fields.udise, { type: "tel", placeholder: t.school.placeholders.udise, max: 11 })}
            {select(
              "type",
              t.school.fields.type,
              INSTITUTION_TYPES.map(({ value }) => ({ value, label: institutionTypeLabels[lang][value] })),
            )}
            {select(
              "district",
              t.school.fields.district,
              DISTRICTS.map(([d]) => ({ value: d, label: d })),
            )}
            {text("principal", t.school.fields.principal, { placeholder: t.school.placeholders.principal })}
            {text("coordinatorName", t.school.fields.coordinatorName, { placeholder: t.school.placeholders.coordinatorName })}
            {text("coordinatorWhatsapp", t.school.fields.coordinatorWhatsapp, {
              type: "tel",
              placeholder: t.school.placeholders.coordinatorWhatsapp,
              max: 14,
            })}
          </div>
          {text("email", t.school.fields.email, { type: "email", placeholder: t.school.placeholders.email, hint: t.school.emailHint })}
        </>
      ) : (
        <>
          {text("name", t.ambassador.fields.name, { placeholder: t.ambassador.placeholders.name })}
          <div className="grid gap-4 sm:grid-cols-2">
            {text("whatsapp", t.ambassador.fields.whatsapp, { type: "tel", placeholder: t.ambassador.placeholders.whatsapp, max: 14 })}
            {text("city", t.ambassador.fields.city, { placeholder: t.ambassador.placeholders.city })}
            {select(
              "role",
              t.ambassador.fields.role,
              AMBASSADOR_ROLES.map(({ value }) => ({ value, label: ambassadorRoleLabels[lang][value] })),
            )}
            {text("email", t.ambassador.fields.email, { type: "email", placeholder: t.ambassador.placeholders.email })}
          </div>
          <p className="-mt-2 text-[13px] text-muted">{t.ambassador.emailHint}</p>
        </>
      )}

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-[14.5px] leading-snug">
          <input
            name="consent"
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
            aria-invalid={err("consent") ? true : undefined}
          />
          <span>{k.consent}</span>
        </label>
        {err("consent") && <span className="mt-1.5 block text-[13px] font-medium text-danger">{err("consent")}</span>}
      </div>
      <Turnstile />
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? t.sending : k.submit}
      </button>
    </form>
  );
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 content-start gap-1.5" {...(error ? { "data-bad": true } : {})}>
      <label htmlFor={id} className="text-[14.5px] font-bold text-primary">
        {label}
      </label>
      {children}
      {hint && <span className="text-[13px] text-muted">{hint}</span>}
      {error && <span className="text-[13px] font-medium text-danger">{error}</span>}
    </div>
  );
}

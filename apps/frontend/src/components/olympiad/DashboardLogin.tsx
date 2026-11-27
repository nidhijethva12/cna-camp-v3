"use client";

import { useActionState, useId } from "react";
import Link from "next/link";
import { loginToDashboard, type LoginField, type LoginState } from "@/actions/olympiad/dashboard";
import { requestPasswordReset, type ResetState } from "@/actions/olympiad/partner";
import { DashboardLanguage } from "@/components/olympiad/DashboardLanguage";
import type { OlympiadLang } from "@/components/olympiad/LanguageSwitch";
import { ArrowRight } from "@/components/ui/icons";
import { dashboardText } from "@/content/dashboards";
import { partnerPath } from "@/content/partnerPages";

type Kind = "school" | "ambassador";

const initial: LoginState = { status: "idle" };

/** Login card for a partner dashboard, in English or Gujarati. */
export function DashboardLogin({ kind, lang }: { kind: Kind; lang: OlympiadLang }) {
  const t = dashboardText[lang];
  const [state, action, pending] = useActionState(loginToDashboard, initial);
  const id = useId();
  const err = (f: LoginField) =>
    state.fieldErrors?.[f] ? (
      <span id={`${id}-${f}-error`} className="text-[13.5px] text-danger">
        {state.fieldErrors[f]}
      </span>
    ) : null;
  const invalid = (f: LoginField) => (state.fieldErrors?.[f] ? { "aria-invalid": true, "aria-describedby": `${id}-${f}-error` } : {});

  return (
    <div className="mx-auto w-full max-w-[440px] rounded-card border border-t-4 border-line border-t-primary bg-light p-6 shadow-card sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow text-[14px]!">{t.eyebrow}</p>
        <DashboardLanguage lang={lang} label={t.language} />
      </div>
      <h1 className="mt-2 text-[26px] leading-tight">{t.login.title[kind]}</h1>
      <p className="mt-2 text-[15px] text-muted">{t.login.intro[kind]}</p>
      <form action={action} noValidate className="mt-6 grid gap-4">
        <input type="hidden" name="kind" value={kind} />
        {state.status === "error" && state.message && (
          <p role="alert" className="rounded-card bg-primary-soft px-3 py-2.5 text-[14px] text-primary">
            {state.message}
          </p>
        )}
        <label className="grid gap-1.5">
          <span className="text-[14.5px] font-bold">{t.login.email}</span>
          <input
            name="email"
            type="email"
            autoComplete="username"
            defaultValue={state.values?.email}
            className="field"
            {...invalid("email")}
          />
          {err("email")}
        </label>
        <label className="grid gap-1.5">
          <span className="text-[14.5px] font-bold">{t.login.password}</span>
          <input name="password" type="password" autoComplete="current-password" className="field" {...invalid("password")} />
          {err("password")}
        </label>
        <button type="submit" disabled={pending} className="btn btn-primary w-full">
          {pending ? t.login.submitting : t.login.submit} <ArrowRight />
        </button>
      </form>
      <ForgotPassword kind={kind} lang={lang} />
      <p className="mt-5 border-t border-line pt-4 text-center text-[14px] text-muted">
        {t.login.notYet}{" "}
        <Link href={partnerPath[lang][kind]} className="font-bold text-primary underline underline-offset-3">
          {t.login.join[kind]}
        </Link>
      </p>
    </div>
  );
}

const resetInitial: ResetState = { status: "idle" };

/** "Forgot your password?": asks for a fresh "choose your password" email. The answer is the same whether or not the email is known. */
function ForgotPassword({ kind, lang }: { kind: Kind; lang: OlympiadLang }) {
  const t = dashboardText[lang].login;
  const [state, action, pending] = useActionState(requestPasswordReset, resetInitial);
  return (
    <details className="mt-4 text-[14px]">
      <summary className="cursor-pointer text-center font-semibold text-primary">{t.forgot}</summary>
      {state.status === "success" ? (
        <p role="status" className="mt-3 rounded-card bg-success/10 px-3 py-2.5 text-success">
          {t.forgotDone[kind]}
        </p>
      ) : (
        <form action={action} noValidate className="mt-3 grid gap-2.5">
          <input type="hidden" name="kind" value={kind} />
          <span className="text-muted">{t.forgotText}</span>
          <input
            name="email"
            type="email"
            autoComplete="username"
            defaultValue={state.values?.email}
            className="field"
            aria-label={t.forgotLabel}
          />
          {state.status === "error" && (
            <span role="alert" className="text-[13.5px] text-danger">
              {state.fieldErrors?.email ?? state.message}
            </span>
          )}
          <button type="submit" disabled={pending} className="btn btn-outline w-full">
            {pending ? t.forgotSending : t.forgotSubmit}
          </button>
        </form>
      )}
    </details>
  );
}

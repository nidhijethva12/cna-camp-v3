"use client";

import { useActionState, useId } from "react";
import Link from "next/link";
import { loginToDashboard, type LoginField, type LoginState } from "@/actions/olympiad/dashboard";
import { requestPasswordReset, type ResetState } from "@/actions/olympiad/partner";
import { partnerPath } from "@/content/partnerPages";
import { ArrowRight } from "@/components/ui/icons";

const initial: LoginState = { status: "idle" };

/** Login card for a partner dashboard. The CNA team creates the account and shares the password. */
export function DashboardLogin({ kind, title, intro }: { kind: "school" | "ambassador"; title: string; intro: string }) {
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
      <p className="eyebrow text-[14px]!">Adventure Olympiad 2.0</p>
      <h1 className="mt-1 text-[26px] leading-tight">{title}</h1>
      <p className="mt-2 text-[15px] text-muted">{intro}</p>
      <form action={action} noValidate className="mt-6 grid gap-4">
        <input type="hidden" name="kind" value={kind} />
        {state.status === "error" && state.message && (
          <p role="alert" className="rounded-card bg-primary-soft px-3 py-2.5 text-[14px] text-primary">
            {state.message}
          </p>
        )}
        <label className="grid gap-1.5">
          <span className="text-[14.5px] font-bold">Email</span>
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
          <span className="text-[14.5px] font-bold">Password</span>
          <input name="password" type="password" autoComplete="current-password" className="field" {...invalid("password")} />
          {err("password")}
        </label>
        <button type="submit" disabled={pending} className="btn btn-primary w-full">
          {pending ? "Logging in…" : "Log in"} <ArrowRight />
        </button>
      </form>
      <ForgotPassword kind={kind} />
      <p className="mt-5 border-t border-line pt-4 text-center text-[14px] text-muted">
        Not a partner yet?{" "}
        <Link href={partnerPath.en[kind]} className="font-bold text-primary underline underline-offset-3">
          {kind === "school" ? "Register your school" : "Become an Ambassador"}
        </Link>
      </p>
    </div>
  );
}

const resetInitial: ResetState = { status: "idle" };

/** "Forgot your password?": asks for a fresh "choose your password" email. The answer is the same whether or not the email is known. */
function ForgotPassword({ kind }: { kind: "school" | "ambassador" }) {
  const [state, action, pending] = useActionState(requestPasswordReset, resetInitial);
  return (
    <details className="mt-4 text-[14px]">
      <summary className="cursor-pointer text-center font-semibold text-primary">Forgot your password?</summary>
      {state.status === "success" ? (
        <p role="status" className="mt-3 rounded-card bg-success/10 px-3 py-2.5 text-success">
          If that email belongs to an approved {kind === "school" ? "school" : "Ambassador"}, a link to choose a new password is on its way.
          Check your inbox and spam folder.
        </p>
      ) : (
        <form action={action} noValidate className="mt-3 grid gap-2.5">
          <input type="hidden" name="kind" value={kind} />
          <span className="text-muted">Enter your login email. We will send a link to choose a new password.</span>
          <input
            name="email"
            type="email"
            autoComplete="username"
            defaultValue={state.values?.email}
            className="field"
            aria-label="Login email"
          />
          {state.status === "error" && (
            <span role="alert" className="text-[13.5px] text-danger">
              {state.fieldErrors?.email ?? state.message}
            </span>
          )}
          <button type="submit" disabled={pending} className="btn btn-outline w-full">
            {pending ? "Sending…" : "Email me a link"}
          </button>
        </form>
      )}
    </details>
  );
}

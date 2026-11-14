"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { setPartnerPassword, type PasswordState } from "@/actions/olympiad/partner";
import { ArrowRight, CheckCircle } from "@/components/ui/icons";
import { dashboardPath } from "@/content/partnerPages";

const initial: PasswordState = { status: "idle" };

/** New password twice; on success it points to the right dashboard login. */
export function SetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(setPartnerPassword, initial);
  const id = useId();

  if (state.status === "success" && state.data) {
    return (
      <div className="mt-5 grid justify-items-start gap-3" role="status">
        <p className="flex items-center gap-2 font-display text-[18px] font-bold text-success">
          <CheckCircle /> Password saved
        </p>
        <p className="text-[15px] text-muted">Log in with {state.data.email} and your new password.</p>
        <Link href={dashboardPath[state.data.kind]} className="btn btn-primary">
          Log in to your dashboard <ArrowRight />
        </Link>
      </div>
    );
  }

  const err = (f: "password" | "confirm") =>
    state.fieldErrors?.[f] ? (
      <span id={`${id}-${f}-error`} className="text-[13.5px] text-danger">
        {state.fieldErrors[f]}
      </span>
    ) : null;
  const invalid = (f: "password" | "confirm") =>
    state.fieldErrors?.[f] ? { "aria-invalid": true, "aria-describedby": `${id}-${f}-error` } : {};

  return (
    <form action={action} noValidate className="mt-6 grid gap-4">
      <input type="hidden" name="token" value={token} />
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-card bg-primary-soft px-3 py-2.5 text-[14px] text-primary">
          {state.message}
        </p>
      )}
      <label className="grid gap-1.5">
        <span className="text-[14.5px] font-bold">New password</span>
        <input name="password" type="password" autoComplete="new-password" maxLength={200} className="field" {...invalid("password")} />
        <span className="text-[13px] text-muted">At least 10 characters, with letters and numbers.</span>
        {err("password")}
      </label>
      <label className="grid gap-1.5">
        <span className="text-[14.5px] font-bold">Type it again</span>
        <input name="confirm" type="password" autoComplete="new-password" maxLength={200} className="field" {...invalid("confirm")} />
        {err("confirm")}
      </label>
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}

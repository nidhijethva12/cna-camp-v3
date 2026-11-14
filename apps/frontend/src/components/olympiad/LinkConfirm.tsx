"use client";

import { useActionState } from "react";
import { giveConsent, unsubscribe, type LinkState } from "@/actions/olympiad/links";
import { Check } from "@/components/ui/icons";

const ACTIONS = { unsubscribe, consent: giveConsent };

/** The one button on a link page; nothing happens until it is pressed. */
export function LinkConfirm({
  kind,
  token,
  label,
  doneText,
}: {
  kind: keyof typeof ACTIONS;
  token: string;
  label: string;
  doneText: string;
}) {
  const [state, action, pending] = useActionState<LinkState, FormData>(ACTIONS[kind], { status: "idle" });
  if (state.status === "done") {
    return (
      <p role="status" className="flex items-center gap-2.5 rounded-card bg-success/12 px-4 py-3 font-semibold text-success">
        <Check /> {doneText}
      </p>
    );
  }
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="token" value={token} />
      {state.status === "error" && (
        <p role="alert" className="rounded-card bg-primary-soft px-3 py-2.5 text-[14px] text-primary">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary justify-self-start">
        {pending ? "Saving…" : label}
      </button>
    </form>
  );
}

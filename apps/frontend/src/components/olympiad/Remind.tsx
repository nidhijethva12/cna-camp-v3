"use client";

import { createContext, useActionState, useContext, useId, useState, type ReactNode } from "react";
import { submitReminder, type RemindField, type RemindState } from "@/actions/olympiad/remind";
import { Select } from "@/components/ui/Select";
import { Check, Close, Envelope, WhatsApp } from "@/components/ui/icons";
import { olympiadPhaseText } from "@/content/olympiadPhase";
import { Honeypot, Turnstile } from "./Turnstile";

const OpenRemind = createContext<() => void>(() => {});

interface RemindProps {
  /** "15 Nov 2026", from the Olympiad settings. */
  opensOn: string;
  consentText: string;
  name: string;
  options: { value: string; label: string }[];
  lang: "en" | "gu";
}

/** Holds the one reminder dialog for the page; any RemindButton inside opens it. */
export function RemindProvider({ children, ...props }: RemindProps & { children: ReactNode }) {
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  // A new key per opening remounts the form, so it never shows the last visitor's answer or errors.
  const [opening, setOpening] = useState(0);
  const id = useId();

  const open = () => {
    setOpening((n) => n + 1);
    dialog?.showModal();
  };
  const close = () => dialog?.close();

  return (
    <OpenRemind.Provider value={open}>
      {children}
      <dialog
        ref={setDialog}
        aria-labelledby={`${id}-title`}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="olympiad-popup m-auto w-[min(100%-32px,460px)] overflow-hidden rounded-card bg-light p-0 text-dark shadow-float backdrop:bg-dark/60"
      >
        {opening > 0 && <RemindForm key={opening} id={id} dialog={dialog} close={close} {...props} />}
      </dialog>
    </OpenRemind.Provider>
  );
}

const initial: RemindState = { status: "idle" };

function RemindForm({
  id,
  dialog,
  close,
  opensOn,
  consentText,
  name,
  options,
  lang,
}: RemindProps & { id: string; dialog: HTMLDialogElement | null; close: () => void }) {
  const t = olympiadPhaseText[lang].remind;
  const [state, action, pending] = useActionState(submitReminder, initial);
  const v = state.values ?? {};

  const err = (f: RemindField) =>
    state.fieldErrors?.[f] ? (
      <span id={`${id}-${f}-error`} className="text-[13.5px] text-danger">
        {state.fieldErrors[f]}
      </span>
    ) : null;
  const invalid = (f: RemindField) => (state.fieldErrors?.[f] ? { "aria-invalid": true, "aria-describedby": `${id}-${f}-error` } : {});

  if (state.status === "success" && state.data) {
    const done = state.data;
    return (
      <div className="grid justify-items-center gap-3 px-6 pt-7 pb-6 text-center">
        <span className="flex h-15 w-15 items-center justify-center rounded-full bg-success/12 text-[30px] text-success">
          <Check />
        </span>
        <h2 id={`${id}-title`} className="text-[22px]">
          {done.already ? t.already(done.firstName) : t.thanks(done.firstName)}
        </h2>
        <p className="max-w-[36ch] text-[15.5px] text-muted">{t.notify(done.whatsapp)}</p>
        {!done.already && (
          <ul className="mt-1 grid w-full gap-2 text-left text-[14.5px]">
            <li className="flex items-start gap-2.5 rounded-card bg-soft px-3 py-2.5">
              <WhatsApp className="mt-0.5 text-[18px] text-primary" />
              {t.waNote(opensOn)}
            </li>
            <li className="flex items-start gap-2.5 rounded-card bg-soft px-3 py-2.5">
              <Envelope className="mt-0.5 text-[18px] text-primary" />
              <span className="min-w-0 break-words">{t.emailNote(done.email)}</span>
            </li>
          </ul>
        )}
        <button type="button" onClick={close} className="btn btn-primary mt-1 w-full" autoFocus>
          {t.done}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative border-b border-line bg-soft px-6 pt-5 pb-4">
        <p className="eyebrow text-[14px]!">{name}</p>
        <h2 id={`${id}-title`} className="mt-1 pr-10 text-[22px] leading-tight">
          {t.title}
        </h2>
        <p className="mt-1.5 text-[15px] text-muted">{t.sub(opensOn)}</p>
        <button
          type="button"
          onClick={close}
          aria-label={t.close}
          className="absolute top-3.5 right-3.5 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-light text-[18px] hover:border-dark"
        >
          <Close />
        </button>
      </div>
      <form action={action} noValidate className="relative grid gap-3.5 px-6 pt-5 pb-6">
        <Honeypot />
        <input type="hidden" name="lang" value={lang} />
        {state.status === "error" && state.message && (
          <p role="alert" className="rounded-card bg-primary-soft px-3 py-2.5 text-[14px] text-primary">
            {state.message}
          </p>
        )}
        <label className="grid gap-1.5">
          <span className="text-[14.5px] font-bold">{t.name}</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            maxLength={80}
            defaultValue={v.name}
            placeholder={t.namePlaceholder}
            className="field"
            {...invalid("name")}
          />
          {err("name")}
        </label>
        <label className="grid gap-1.5">
          <span className="text-[14.5px] font-bold">{t.whatsapp}</span>
          <span className="flex">
            <span className="flex items-center rounded-l-card border-[1.5px] border-r-0 border-line bg-soft px-3 font-semibold">+91</span>
            <input
              name="whatsapp"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              defaultValue={v.whatsapp}
              placeholder={t.whatsappPlaceholder}
              onInput={(e) =>
                (e.currentTarget.value = e.currentTarget.value
                  .replace(/[\u0AE6-\u0AEF]/g, (d) => String(d.charCodeAt(0) - 0x0ae6))
                  .replace(/\D/g, "")
                  .slice(0, 10))
              }
              className="field min-w-0 rounded-l-none"
              {...invalid("whatsapp")}
            />
          </span>
          {err("whatsapp")}
        </label>
        <label className="grid gap-1.5">
          <span className="text-[14.5px] font-bold">{t.email}</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={120}
            defaultValue={v.email}
            placeholder="name@example.com"
            className="field"
            {...invalid("email")}
          />
          {err("email")}
        </label>
        <label className="grid gap-1.5">
          <span className="text-[14.5px] font-bold">
            {t.who} <span className="font-normal text-muted">{t.optional}</span>
          </span>
          <Select name="interest" emptyLabel={t.choose} defaultValue={v.interest} options={options} container={dialog} />
          {err("interest")}
        </label>
        <label className="flex items-start gap-2.5 text-[14px] text-muted">
          <input name="consent" type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-primary" {...invalid("consent")} />
          {consentText}
        </label>
        {err("consent")}
        <Turnstile />
        <button type="submit" disabled={pending} className="btn btn-primary w-full">
          {pending ? t.saving : t.submit}
        </button>
        <p className="text-center text-[13px] text-muted">{t.privacy}</p>
      </form>
    </>
  );
}

export function RemindButton({ children, className = "" }: { children: ReactNode; className?: string }) {
  const open = useContext(OpenRemind);
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ArrowRight, Check, Close } from "@/components/ui/icons";
import { registrationPath } from "@/content/registration";

const SEEN_KEY = "cna-olympiad-popup-seen";
const SNOOZE_KEY = "cna-olympiad-popup-snoozed-until";
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;
const OPEN_DELAY_MS = 2000;

const facts = [
  ["Free*", "for govt. schools"],
  ["13+", "age to join"],
];

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: Record<string, unknown>) => void;
  }
}

const track = (name: string) => window.gtag?.("event", name);

const storage = {
  get: (store: () => Storage, key: string) => {
    try {
      return store().getItem(key);
    } catch {
      return null;
    }
  },
  set: (store: () => Storage, key: string, value: string) => {
    try {
      store().setItem(key, value);
    } catch {}
  },
};

/**
 * Site-wide Olympiad ticket that opens shortly after the site loads: once per visit, never on the Olympiad pages or dashboards.
 * Closing it keeps it away for 3 days. While registration is open it links straight to the form.
 */
export function OlympiadPopup({ open }: { open: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Not on the Olympiad pages it advertises, nor on the partner dashboards.
    if (["/olympiad", "/school-dashboard", "/ambassador-dashboard"].some((p) => pathname.startsWith(p))) return;
    if (storage.get(() => sessionStorage, SEEN_KEY)) return;
    if (Number(storage.get(() => localStorage, SNOOZE_KEY)) > Date.now()) return;

    const timer = setTimeout(() => {
      // Never stacks on another dialog, such as the trip enquiry form.
      if (document.querySelector("dialog[open]") || !ref.current) return;
      storage.set(() => sessionStorage, SEEN_KEY, "1");
      ref.current.showModal();
      track("olympiad_popup_view");
    }, OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

  const snooze = () => storage.set(() => localStorage, SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-labelledby="olympiad-popup-title"
      onClose={snooze}
      onClick={(e) => e.target === e.currentTarget && close()}
      className="olympiad-popup m-auto max-h-[100dvh] w-[min(100%-32px,440px)] max-w-none overflow-y-auto rounded-[14px] bg-transparent p-0 text-dark shadow-float backdrop:bg-dark/65 backdrop:backdrop-blur-[3px]"
    >
      <div className="relative isolate h-[300px] overflow-hidden text-light max-[400px]:h-[270px]">
        <Image
          src="/img/olympiad/olympiad-popup-kids-manali.webp"
          alt="CNA campers crossing a river bridge near Manali"
          fill
          sizes="440px"
          className="-z-20 object-cover object-[62%_40%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-dark)_55%,transparent),transparent_38%,transparent_55%,color-mix(in_srgb,var(--color-dark)_85%,transparent))]"
        />
        <div className="absolute top-4.5 right-16 left-5">
          <p className="font-display text-[13px] font-bold text-secondary">Eco-STEM quiz and scholarship</p>
          <h2
            id="olympiad-popup-title"
            className="mt-1 font-display text-[34px] leading-[1.02] font-extrabold tracking-[-0.025em] max-[400px]:text-[30px]"
          >
            Adventure Olympiad <span className="text-secondary">2.0</span>
          </h2>
        </div>
        <p className="absolute right-5 bottom-4 left-5 font-display text-[18px] leading-[1.15] font-bold">
          Win up to
          <strong className="block text-[30px] font-extrabold tracking-[-0.02em] max-[400px]:text-[27px]">
            <span className="text-secondary">100%</span> scholarship*
          </strong>
        </p>
      </div>
      <p className="bg-light px-5.5 pt-4 pb-2.5 text-[16px] leading-normal text-dark/85">
        on adventure camps in <b className="text-dark">Gujarat, Manali and Leh-Ladakh</b>. All it takes is one quiz from home.
      </p>
      <div aria-hidden="true" className="ticket-tear" />
      <div className="bg-light px-5.5 pt-2.5 pb-5">
        <ul className="mb-3.5 flex flex-wrap gap-x-4.5 gap-y-2">
          {facts.map(([value, label]) => (
            <li key={label} className="flex items-center gap-2 text-[15px] text-muted">
              <Check className="shrink-0 text-[20px] text-primary" />
              <span>
                <b className="font-display text-[17px] font-extrabold text-dark">{value}</b> {label}
              </span>
            </li>
          ))}
        </ul>
        {open && (
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 font-display text-[14px] font-bold text-success">
            <span aria-hidden="true" className="live-dot h-2.25 w-2.25 rounded-full bg-success" />
            Registration is open
          </p>
        )}
        <Link
          href={open ? registrationPath.en : "/olympiad"}
          onClick={() => {
            track("olympiad_popup_click");
            close();
          }}
          className="btn btn-primary w-full"
          autoFocus
        >
          {open ? "Register now" : "See the Olympiad"} <ArrowRight />
        </Link>
        <p className="mt-3 text-[12px] leading-[1.45] text-muted">
          *Free registration for Group 0 (government school students, as per the rules). Scholarship is on the camp fee, as per the
          Trust&apos;s terms.
        </p>
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Close"
        className="absolute top-3 right-3 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-dark/50 text-[18px] text-light hover:bg-dark/70"
      >
        <Close />
      </button>
    </dialog>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Close } from "@/components/ui/icons";

const SEEN_KEY = "cna-olympiad-popup-seen";
const SNOOZE_KEY = "cna-olympiad-popup-snoozed-until";
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;
const OPEN_DELAY_MS = 2000;

const facts = [
  ["₹90", "fee starts at"],
  ["14+", "age to join"],
  ["15 Nov", "registration"],
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
 * Site-wide Olympiad ticket that opens shortly after the site loads: once per visit, never on the Olympiad pages or dashboards,
 * and a bottom sheet on phones. Closing it keeps it away for 3 days.
 */
export function OlympiadPopup() {
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
      className="olympiad-popup m-auto w-[min(100%-32px,470px)] max-w-none overflow-hidden rounded-[10px] bg-primary p-0 text-center text-light shadow-float backdrop:bg-dark/60 max-[559px]:mb-0 max-[559px]:w-full max-[559px]:rounded-b-none max-[559px]:pb-[env(safe-area-inset-bottom)]"
    >
      <div className="relative isolate overflow-hidden px-6.5 pt-[150px] pb-4.5">
        <Image src="/img/olympiad/manali-peaks.webp" alt="" fill sizes="470px" className="-z-20 object-cover object-top" />
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-primary/0 via-primary/35 via-30% to-primary to-62%" />
        <span aria-hidden="true" className="topo inset-0 -z-10 bg-light/16 [mask-size:700px_auto] [mask-position:center]" />
        <p className="display absolute top-[70px] left-1/2 -translate-x-1/2 rounded-full bg-dark/50 px-5 py-2 text-[clamp(20px,5.4vw,26px)] leading-tight whitespace-nowrap backdrop-blur-[3px]">
          Adventure Olympiad <span className="text-secondary">2.0</span>
        </p>
        <p className="display mt-3.5 text-[18px] text-secondary-light">Win up to</p>
        <h2
          id="olympiad-popup-title"
          className="mt-4 text-[clamp(84px,22vw,120px)] leading-[0.9] tracking-[-0.04em] [text-shadow:0_6px_0_color-mix(in_srgb,var(--color-black)_12%,transparent)]"
        >
          100%
          <small className="mt-1.5 block text-[20px] leading-tight tracking-[0.02em] text-secondary [text-shadow:none]">scholarship</small>
        </h2>
        <p className="mt-3 text-[16.5px] text-light/90">
          on a <b className="text-light">₹18,000 Himalaya camp</b> in Manali. All it takes is one quiz from home.
        </p>
      </div>
      <div aria-hidden="true" className="ticket-tear" />
      <div className="grid gap-2.5 bg-light px-6 pt-3 pb-6 text-dark">
        <dl className="grid grid-cols-3 gap-1.5">
          {facts.map(([value, label]) => (
            <div key={label} className="flex flex-col-reverse rounded-card bg-soft px-1 py-2">
              <dt className="text-[12px] text-muted">{label}</dt>
              <dd className="display text-[16px]">{value}</dd>
            </div>
          ))}
        </dl>
        <Link
          href="/olympiad"
          onClick={() => {
            track("olympiad_popup_click");
            close();
          }}
          className="btn btn-primary w-full"
          autoFocus
        >
          Claim your chance
        </Link>
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Close"
        className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-dark/45 text-[18px] text-light hover:bg-dark/70"
      >
        <Close />
      </button>
    </dialog>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Close, Megaphone } from "@/components/ui/icons";

const SEEN_KEY = "cna-updates-nudge-seen";

/** Small card that slides in from the bottom-left once a visitor has read half of any page; once per visit. */
export function UpdatesNudge() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/contact") || pathname.startsWith("/admin")) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch {
      return;
    }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0 || window.scrollY / max < 0.5) return;
      // Waits while the Olympiad pop-up is open, so two cards never compete.
      if (document.querySelector("dialog[open]")) return;
      window.removeEventListener("scroll", onScroll);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      setOpen(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <aside
      aria-label="Need more updates"
      aria-hidden={!open}
      inert={!open}
      className={`fixed bottom-20 left-4 z-40 w-[min(340px,calc(100vw-2rem))] transition duration-500 ease-out lg:bottom-6 lg:left-6 ${
        open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <div className="relative overflow-hidden rounded-card border border-line bg-light p-5 shadow-float">
        <span className="absolute inset-y-0 left-0 w-1.5 bg-primary" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full text-[18px] text-muted transition hover:bg-soft hover:text-dark"
        >
          <Close />
        </button>
        <div className="flex gap-3.5 pr-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-[22px] text-dark">
            <Megaphone />
          </span>
          <div>
            <p className="font-display text-[18px] leading-tight font-bold">Need more updates?</p>
            <p className="mt-1 text-[14.5px] leading-snug text-muted">
              Questions about a trip, a batch or the Olympiad? Our team replies within a day.
            </p>
          </div>
        </div>
        <Link href="/contact" onClick={() => setOpen(false)} className="btn btn-primary mt-4 w-full py-2.5!">
          Contact us <ArrowRight />
        </Link>
      </div>
    </aside>
  );
}

"use client";

import { useId, useState, type ReactNode } from "react";
import { CaretDown } from "@/components/ui/icons";

/** A footer column: a tap-to-open accordion on phones, always open from tablet width up. */
export function FooterGroup({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-b border-light/10 md:border-0">
      <h2 className="m-0 font-sans text-base font-normal tracking-normal">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between py-4 text-left md:pointer-events-none md:py-0"
        >
          <span className="eyebrow text-light/60!">{title}</span>
          <CaretDown className={`text-[14px] text-light/60 transition-transform duration-300 md:hidden ${open ? "rotate-180" : ""}`} />
        </button>
      </h2>
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out md:grid-rows-[1fr] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className={`min-h-0 overflow-hidden md:visible ${open ? "visible" : "invisible"}`}>
          <div className="pb-5 md:pt-4 md:pb-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

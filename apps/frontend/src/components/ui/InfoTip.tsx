"use client";

import { useId, useState } from "react";

/** A small ⓘ next to a label that explains it on hover, focus or tap. */
export function InfoTip({ label, children }: { label: string; children: string }) {
  const [open, setOpen] = useState(false);
  const tipId = useId();
  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={`What does ${label} mean?`}
        aria-describedby={tipId}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="ml-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-current text-[11px] leading-none font-bold text-muted transition-colors hover:text-primary focus-visible:text-primary"
      >
        i
      </button>
      <span
        id={tipId}
        role="tooltip"
        className={`absolute top-full left-1/2 z-30 mt-2 w-64 -translate-x-1/2 rounded-card bg-dark p-3 text-[13.5px] leading-snug font-normal text-light shadow-menu transition duration-150 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {children}
      </span>
    </span>
  );
}

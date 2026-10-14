"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { enquireHref, isNavActive, type NavItem } from "@/content/site";

/** Three bars that fold into an ✕ while the menu is open. */
function MenuGlyph({ open }: { open: boolean }) {
  const bar = "absolute left-0 h-0.5 w-[22px] rounded-full bg-current transition-transform duration-300 ease-out";
  return (
    <span aria-hidden="true" className="relative block h-[16px] w-[22px]">
      <span className={`${bar} top-0 ${open ? "translate-y-[7px] rotate-45" : ""}`} />
      <span className={`${bar} top-[7px] transition-opacity ${open ? "opacity-0" : ""}`} />
      <span className={`${bar} top-[14px] ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
    </span>
  );
}

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="lg:hidden">
      <button
        type="button"
        className={`flex h-12 w-12 items-center justify-center rounded-card border transition-colors duration-300 ${
          open ? "border-dark bg-dark text-light" : "border-line"
        }`}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <MenuGlyph open={open} />
      </button>

      {/* Always rendered so it can animate; `inert` keeps the closed menu out of tab order and screen readers. */}
      <nav
        id="mobile-nav"
        aria-label="Mobile"
        inert={!open}
        className={`absolute inset-x-0 top-full grid border-t border-line bg-light shadow-panel transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
      >
        <div className="max-h-[calc(100dvh-72px)] min-h-0 overflow-y-auto">
          <ul className="wrap py-3">
            {items.map((item, i) => (
              <li
                key={item.href}
                className={`border-b border-line transition duration-300 ease-out last:border-0 ${open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
                style={{ transitionDelay: open ? `${60 + i * 40}ms` : "0ms" }}
              >
                <Link href={item.href} className={`block py-3 text-lg font-bold ${isNavActive(item, pathname) ? "text-primary" : ""}`}>
                  {item.label}
                </Link>
                {item.children && (
                  <div className="grid grid-cols-2 gap-x-4 pb-3">
                    {item.children.map((c) => (
                      <Link key={c.href} href={c.href} className="py-2 text-[15px] text-muted hover:text-primary">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
            <li className="pt-3">
              <Link href={enquireHref()} className="btn btn-primary w-full">
                Enquire now
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

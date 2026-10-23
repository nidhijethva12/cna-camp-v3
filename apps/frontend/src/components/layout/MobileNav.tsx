"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, CaretRight, Close, Fire, Phone, WhatsApp } from "@/components/ui/icons";
import { enquireHref, isNavActive, type NavItem } from "@/content/site";

interface Contact {
  phone: string;
  phoneHref: string;
  whatsappHref: string;
}

const MenuGlyph = () => (
  <span aria-hidden="true" className="flex w-[22px] flex-col gap-[5px]">
    {[0, 1, 2].map((i) => (
      <span key={i} className="h-0.5 rounded-full bg-current" />
    ))}
  </span>
);

const HotBadge = () => (
  <span className="hot-badge inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold tracking-wide text-light uppercase">
    <Fire className="flame text-[13px] text-secondary" />
    Hot
  </span>
);

const noop = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

/** Side drawer for phones and tablets. Sections with sub-pages open a second panel (drill-down) with a Back button. */
export function MobileNav({ items, contact }: { items: NavItem[]; contact: Contact }) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const mounted = useMounted();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const openMenu = () => {
    setSection(null);
    setOpen(true);
  };
  const current = section === null ? null : items[section];
  const row = "flex w-full items-center justify-between gap-3 border-b border-line py-4 text-left text-[17px] font-bold";

  const drawer = (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} inert={!open}>
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-dark/50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <nav
        id="mobile-nav"
        aria-label="Mobile"
        className={`absolute inset-y-0 right-0 flex w-[min(86vw,380px)] flex-col bg-light shadow-panel transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-line px-5">
          {current ? (
            <button type="button" className="flex items-center gap-2 font-semibold text-muted" onClick={() => setSection(null)}>
              <ArrowLeft /> Back
            </button>
          ) : (
            <span className="display text-[19px]">Menu</span>
          )}
          <button
            ref={closeRef}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-card border border-line text-[20px]"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <Close />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <ul
            className={`absolute inset-0 overflow-y-auto px-5 transition-transform duration-300 ease-out ${current ? "-translate-x-full" : "translate-x-0"}`}
            inert={Boolean(current)}
          >
            {items.map((item, i) => {
              const active = isNavActive(item, pathname) ? "text-primary" : "";
              return (
                <li key={item.href}>
                  {item.children ? (
                    <button type="button" className={`${row} ${active}`} aria-haspopup="true" onClick={() => setSection(i)}>
                      {item.label}
                      <CaretRight className="text-[18px] text-muted" />
                    </button>
                  ) : item.disabled ? (
                    <button type="button" aria-disabled="true" className={`${row} cursor-not-allowed text-muted`}>
                      <span>{item.label}</span>
                      <span className="text-[13px] font-semibold">Coming soon</span>
                    </button>
                  ) : (
                    <Link href={item.href} className={`${row} ${active}`}>
                      <span className="flex items-center gap-2">
                        {item.label}
                        {item.hot && <HotBadge />}
                      </span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          <ul
            className={`absolute inset-0 overflow-y-auto px-5 transition-transform duration-300 ease-out ${current ? "translate-x-0" : "translate-x-full"}`}
            inert={!current}
          >
            {current && (
              <>
                <li className="pt-5 pb-1">
                  <p className="eyebrow">{current.label}</p>
                </li>
                {current.children?.map((c) => (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      className={`block border-b border-line py-3.5 text-[16px] font-semibold ${pathname === c.href ? "text-primary" : ""}`}
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>

        <div className="shrink-0 space-y-3 border-t border-line p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <Link href={enquireHref()} className="btn btn-primary w-full">
            Contact us
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <a href={contact.whatsappHref} rel="noopener" target="_blank" className="btn btn-outline w-full text-whatsapp-dark">
              <WhatsApp className="text-[20px]" /> WhatsApp
            </a>
            <a href={contact.phoneHref} className="btn btn-outline w-full">
              <Phone className="text-primary" /> Call
            </a>
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="flex h-12 w-12 items-center justify-center rounded-card border border-line"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label="Open menu"
        onClick={openMenu}
      >
        <MenuGlyph />
      </button>
      {mounted && createPortal(drawer, document.body)}
    </div>
  );
}

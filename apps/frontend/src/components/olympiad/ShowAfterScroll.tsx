"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Keeps a floating box out of the way until the visitor has scrolled past the first screen. */
export function ShowAfterScroll({ children, className, label }: { children: ReactNode; className: string; label: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <aside
      aria-label={label}
      aria-hidden={!shown}
      inert={!shown}
      className={`${className} transition duration-300 ${shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      {children}
    </aside>
  );
}

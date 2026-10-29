"use client";

import { useEffect, useRef, useState } from "react";

/** Sticky "on this page" pills; the pill of the section in view is filled and kept in sight. */
export function SectionNav({ links, label = "On this page" }: { links: readonly (readonly [string, string])[]; label?: string }) {
  const [active, setActive] = useState<string>();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = links.map(([id]) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    // A section counts as "in view" once its top passes the upper third of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [links]);

  // Scrolls only the pill row sideways, so it never interrupts the page's own scroll to a section.
  useEffect(() => {
    const list = listRef.current;
    const pill = active && list?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (list && pill) list.scrollTo({ left: pill.offsetLeft - (list.clientWidth - pill.clientWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav className="sticky top-[72px] z-20 border-b border-line bg-light" aria-label={label}>
      <div ref={listRef} className="wrap flex [scrollbar-width:none] gap-2 overflow-x-auto py-3 [&::-webkit-scrollbar]:hidden">
        {links.map(([id, text]) => {
          const isActive = id === active;
          return (
            <a
              key={id}
              href={`#${id}`}
              data-id={id}
              onClick={() => setActive(id)}
              aria-current={isActive ? "true" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-[15px] font-semibold transition duration-200 ${
                isActive ? "border-dark bg-dark text-light" : "border-line bg-light text-dark hover:border-dark"
              }`}
            >
              {text}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import { useEffect, useState } from "react";

interface RegionChipsProps {
  regions: { id: string; label: string }[];
  label: string;
}

/** Jump chips for page sections; the chip of the section in view is filled, and follows scrolling. */
export function RegionChips({ regions, label }: RegionChipsProps) {
  const [active, setActive] = useState(regions[0]?.id);

  useEffect(() => {
    const sections = regions.map((r) => document.getElementById(r.id)).filter((el): el is HTMLElement => Boolean(el));
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
  }, [regions]);

  return (
    <nav className="mt-6 flex flex-wrap gap-2.5" aria-label={label}>
      {regions.map((r) => {
        const isActive = r.id === active;
        return (
          <a
            key={r.id}
            href={`#${r.id}`}
            onClick={() => setActive(r.id)}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-full border-[1.5px] px-5 py-2.5 font-display text-[15px] font-bold transition duration-200 ease-out active:scale-95 ${
              isActive
                ? "border-dark bg-dark text-light shadow-menu"
                : "border-line bg-light text-dark hover:-translate-y-0.5 hover:border-dark hover:shadow-menu"
            }`}
          >
            {r.label}
          </a>
        );
      })}
    </nav>
  );
}

import type { CSSProperties } from "react";
import { ArrowRight, Megaphone } from "@/components/ui/icons";
import type { Notice } from "@/types/content";

/** Olympiad notices from the admin (Olympiad → Notices): plain lines that scroll upward on their own. */
export function NoticeBoard({ notices }: { notices: Notice[] }) {
  // The scroll moves by half the stack, so half of it must always fill the board (about 10 lines); a few notices repeat more.
  const copies = 2 * Math.max(1, Math.ceil(10 / Math.max(notices.length, 1)));
  return (
    <div
      id="notices"
      className="flex scroll-mt-36 flex-col overflow-hidden rounded-card border border-line bg-light shadow-panel lg:absolute lg:inset-0"
      role="region"
      aria-labelledby="notices-title"
    >
      <div className="flex items-center gap-3 bg-dark px-5 py-3 text-light sm:px-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-[22px] text-dark">
          <Megaphone />
        </span>
        <div>
          <h2 id="notices-title" className="h-sub text-light">
            Notice board
          </h2>
          <p className="text-[14px] text-light/70">Exam dates, results and updates from the CNA team</p>
        </div>
      </div>

      {notices.length === 0 ? (
        <p className="px-6 py-8 text-center text-muted">No notices right now. Exam dates and results will appear here.</p>
      ) : (
        <div className="notice-window relative h-[260px] overflow-hidden motion-reduce:overflow-y-auto lg:h-auto lg:min-h-0 lg:flex-1">
          {/* The list repeats so the upward scroll loops without a gap or jump; hovering or focusing pauses it. */}
          <div className="notice-marquee" style={{ "--notice-duration": `${((notices.length * copies) / 2) * 4}s` } as CSSProperties}>
            {Array.from({ length: copies }, (_, copy) => (
              <ul
                key={copy}
                aria-hidden={copy > 0 || undefined}
                inert={copy > 0}
                className={`divide-y divide-line border-b border-line ${copy > 0 ? "motion-reduce:hidden" : ""}`}
              >
                {notices.map((n) => (
                  <li key={n.id} className="flex items-start gap-3 bg-light px-5 py-2.5 sm:px-6">
                    <span className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {n.link ? (
                      <a href={n.link} target="_blank" rel="noopener" className="font-semibold hover:text-primary">
                        {n.text} <ArrowRight className="text-primary" />
                      </a>
                    ) : (
                      <p className="font-semibold">{n.text}</p>
                    )}
                  </li>
                ))}
              </ul>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-linear-to-b from-light to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-light to-transparent" />
        </div>
      )}
    </div>
  );
}

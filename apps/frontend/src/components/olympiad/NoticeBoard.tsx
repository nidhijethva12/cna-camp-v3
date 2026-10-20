import type { CSSProperties } from "react";
import { ArrowRight, Megaphone } from "@/components/ui/icons";
import { splitDate } from "@/lib/format";
import type { Notice } from "@/types/content";

const CATEGORY: Record<Notice["category"], { label: string; className: string }> = {
  exam: { label: "Exam", className: "bg-primary-soft text-primary" },
  result: { label: "Result", className: "bg-success/10 text-success" },
  registration: { label: "Registration", className: "bg-secondary/20 text-dark" },
  general: { label: "General", className: "bg-soft text-muted" },
};

const NEW_DAYS = 7;
const isNew = (date: string) => Date.now() - new Date(`${date}T00:00:00+05:30`).getTime() < NEW_DAYS * 86_400_000;

/** Olympiad notices from the admin (Olympiad → Notices); important ones first, then newest. */
export function NoticeBoard({ notices }: { notices: Notice[] }) {
  return (
    <div
      id="notices"
      className="flex scroll-mt-36 flex-col overflow-hidden rounded-card border border-line bg-light shadow-panel"
      role="region"
      aria-labelledby="notices-title"
    >
      <div className="flex items-center justify-between gap-4 bg-dark px-5 py-4 text-light sm:px-6">
        <div className="flex items-center gap-3">
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
        {notices.length > 0 && (
          <span className="hidden shrink-0 rounded-full bg-light/10 px-3 py-1 text-[13px] font-semibold sm:inline">
            {notices.length} {notices.length === 1 ? "notice" : "notices"}
          </span>
        )}
      </div>

      {notices.length === 0 ? (
        <p className="px-6 py-8 text-center text-muted">No notices right now. Exam dates and results will appear here.</p>
      ) : (
        <div className="notice-window relative h-[340px] overflow-hidden motion-reduce:overflow-y-auto lg:h-0 lg:min-h-[300px] lg:flex-1">
          {/* The list runs twice so the upward scroll loops without a jump; hovering or focusing pauses it. */}
          <div className="notice-marquee" style={{ "--notice-duration": `${Math.max(notices.length, 3) * 6}s` } as CSSProperties}>
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-hidden={copy === 1 || undefined}
                inert={copy === 1}
                className={`divide-y divide-line border-b border-line ${copy === 1 ? "motion-reduce:hidden" : ""}`}
              >
                {notices.map((n) => (
                  <NoticeItem key={n.id} notice={n} />
                ))}
              </ul>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-linear-to-b from-light to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-light to-transparent" />
        </div>
      )}
    </div>
  );
}

/** One line per notice: date, type and title; a notice with a link makes its title the link. */
function NoticeItem({ notice: n }: { notice: Notice }) {
  const { day, month } = splitDate(n.date);
  const cat = CATEGORY[n.category];
  const title = <span className="line-clamp-1">{n.title}</span>;
  return (
    <li className={`flex items-center gap-3.5 px-5 py-3 sm:px-6 ${n.important ? "bg-primary-soft" : "bg-light"}`}>
      <time dateTime={n.date} className="w-12 shrink-0 rounded-tag border border-line bg-light py-1 text-center">
        <span className="display block text-[18px] leading-none">{day}</span>
        <span className="block text-[10.5px] font-bold tracking-wide text-primary">{month}</span>
      </time>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`rounded-full px-2 py-px text-[11.5px] font-bold ${cat.className}`}>{cat.label}</span>
          {n.important && <span className="rounded-full bg-primary px-2 py-px text-[11.5px] font-bold text-light">Important</span>}
          {isNew(n.date) && <span className="rounded-full bg-secondary px-2 py-px text-[11.5px] font-bold text-dark">New</span>}
        </div>
        {n.link ? (
          <a
            href={n.link}
            target="_blank"
            rel="noopener"
            className="mt-1 flex items-center gap-1 text-[15.5px] font-bold hover:text-primary"
          >
            {title}
            <ArrowRight className="shrink-0 text-primary" />
          </a>
        ) : (
          <h3 className="mt-1 text-[15.5px] font-bold">{title}</h3>
        )}
      </div>
    </li>
  );
}

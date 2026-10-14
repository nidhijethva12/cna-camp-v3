import type { Faq } from "@/types/content";

/** Native disclosure rows (no JS, answers stay in the HTML for search); the open/close animation lives in globals.css. */
export function FaqList({ faqs, className = "" }: { faqs: Faq[]; className?: string }) {
  return (
    <div className={`divide-y divide-line border-y border-line ${className}`}>
      {faqs.map((f) => (
        <details key={f.question} className="faq group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[18px] font-bold transition-colors hover:text-primary">
            <h3 className="leading-normal">{f.question}</h3>
            <span
              aria-hidden="true"
              className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-primary transition duration-300 group-open:rotate-45 group-open:border-primary group-open:bg-primary group-open:text-light"
            >
              <span className="absolute h-0.5 w-3 rounded-full bg-current" />
              <span className="absolute h-3 w-0.5 rounded-full bg-current" />
            </span>
          </summary>
          <p className="pb-5 text-muted">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

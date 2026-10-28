"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Select } from "@/components/ui/Select";
import { Mountains } from "@/components/ui/icons";
import type { GroupId, OlympiadGroup } from "@/content/olympiad";

/** Each group keeps one colour across its tab, panel edge and fee tiles. */
const tone: Record<GroupId, { tab: string; selected: string; edge: string; tile: string }> = {
  A: {
    tab: "border-t-primary",
    selected: "aria-selected:border-primary aria-selected:bg-primary aria-selected:text-light",
    edge: "border-t-primary",
    tile: "bg-primary-soft",
  },
  B: {
    tab: "border-t-secondary",
    selected: "aria-selected:border-secondary aria-selected:bg-secondary aria-selected:text-dark",
    edge: "border-t-secondary",
    tile: "bg-secondary/12",
  },
  C: {
    tab: "border-t-dark",
    selected: "aria-selected:border-dark aria-selected:bg-dark aria-selected:text-light",
    edge: "border-t-dark",
    tile: "bg-soft",
  },
  D: {
    tab: "border-t-success",
    selected: "aria-selected:border-success aria-selected:bg-success aria-selected:text-light",
    edge: "border-t-success",
    tile: "bg-success/10",
  },
};

/** "Find the right group": the class/age picker selects the matching tab, and the tabs can be used on their own. */
export function GroupPicker({ groups }: { groups: OlympiadGroup[] }) {
  const [active, setActive] = useState<GroupId>(groups[0].id);
  const [picked, setPicked] = useState("");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const match = groups.find((g) => g.id === picked);

  const onKey = (e: KeyboardEvent, i: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + groups.length) % groups.length;
    setActive(groups[next].id);
    tabs.current[next]?.focus();
  };

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-card bg-dark px-5 py-4.5 text-light sm:px-6">
        <label className="contents">
          <span className="display text-[16px] font-bold">The participant is</span>
          <Select
            name="participant"
            emptyLabel="Choose class or age"
            options={groups.map((g) => ({ value: g.id, label: g.finder }))}
            value={picked}
            onValueChange={(v) => {
              setPicked(v);
              if (v) setActive(v as GroupId);
            }}
            className="w-auto max-w-full min-w-0 flex-[0_1_auto] text-dark"
          />
        </label>
        <output aria-live="polite" className="text-[15px] text-light/75">
          {match ? (
            <>
              This is <b className="text-secondary">{match.name}</b>. Fee: {match.feeSummary}.
            </>
          ) : (
            "The group shows here."
          )}
        </output>
      </div>

      <div role="tablist" aria-label="Groups" className="mt-4 grid grid-cols-4 gap-2">
        {groups.map((g, i) => (
          <button
            key={g.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            id={`tab-${g.id}`}
            type="button"
            role="tab"
            aria-selected={active === g.id}
            aria-controls={`panel-${g.id}`}
            tabIndex={active === g.id ? 0 : -1}
            onClick={() => setActive(g.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={`group flex min-h-12.5 flex-col items-center justify-center rounded-card border border-t-4 border-line bg-light p-1.5 text-center sm:min-h-15.5 sm:items-start sm:px-3.5 sm:py-2 sm:text-left ${tone[g.id].tab} ${tone[g.id].selected}`}
          >
            <b className="display text-[16px]">{g.name}</b>
            <span className="hidden text-[13px] text-muted group-aria-selected:text-inherit group-aria-selected:opacity-75 sm:block">
              {g.short}
            </span>
          </button>
        ))}
      </div>

      {groups.map((g) => (
        <div
          key={g.id}
          id={`panel-${g.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${g.id}`}
          hidden={active !== g.id}
          className={`mt-3.5 grid gap-7 rounded-card border border-t-[5px] border-line bg-light p-5 shadow-card sm:p-8 lg:grid-cols-2 lg:gap-12 ${tone[g.id].edge}`}
        >
          <div>
            <h3 className="display text-[26px] font-extrabold">{g.title}</h3>
            <p className="mt-1.5 text-muted">{g.who}</p>
            <dl className="mt-4.5 grid grid-cols-2 gap-2.5">
              {g.fees.map((f) => (
                <div
                  key={f.label}
                  className={`min-w-0 rounded-card px-4 py-3.5 ${tone[g.id].tile} ${g.fees.length === 1 ? "col-span-2" : ""}`}
                >
                  <dt className="text-[13px] font-semibold text-muted">{f.label}</dt>
                  <dd className="display text-[24px]">{f.amount}</dd>
                </div>
              ))}
              <div className={`col-span-2 min-w-0 rounded-card px-4 py-3.5 ${tone[g.id].tile}`}>
                <dt className="text-[13px] font-semibold text-muted">Quiz</dt>
                <dd className="display text-[17px]">{g.quiz}</dd>
              </div>
            </dl>
            <p className="mt-3 flex items-start gap-3 rounded-card bg-primary-soft px-4 py-3.5 text-[15px]">
              <Mountains className="mt-0.5 shrink-0 text-[20px] text-primary" />
              <span>
                <b className="display">Prize:</b> {g.prize}
              </span>
            </p>
          </div>
          <div>
            <h4 className="display text-[14px] font-bold text-primary">The journey</h4>
            <ol className="mt-3.5">
              {g.journey.map((s) => (
                <li
                  key={s.title}
                  className="relative pb-4.5 pl-8.5 before:absolute before:top-5.5 before:bottom-0 before:left-2 before:border-l-2 before:border-dashed before:border-line last:before:hidden"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-1 left-0.5 h-3.5 w-3.5 rounded-full border-[3px] ${s.goal ? "border-secondary bg-secondary" : "border-dark bg-light"}`}
                  />
                  {s.year && <span className="display block text-[13px] font-bold text-primary">{s.year}</span>}
                  <b className="display block">{s.title}</b>
                  {s.note && <span className="text-[14.5px] text-muted">{s.note}</span>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      ))}
    </>
  );
}

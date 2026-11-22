"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { OlympiadStats } from "@/lib/olympiad/adminStats";

const LIST = "/admin/collections/olympiad-people";

type Condition = [field: string, operator: string, value: string | string[]];

const REGISTERED: Condition = ["type", "equals", "registered"];
const UNPAID: Condition = ["paymentStatus", "not_in", ["paid", "free"]];
const SOURCE_LABELS: Record<string, string> = { direct: "Direct", school: "Through a school", ambassador: "Through an Ambassador" };

/** The filter as the list's own "where" query, so the list's filter panel shows it and Export follows it. */
function whereParams(conditions: Condition[]) {
  const params: [string, string][] = [];
  conditions.forEach(([field, operator, value], i) => {
    const key = `where[or][0][and][${i}][${field}][${operator}]`;
    if (Array.isArray(value)) value.forEach((v, n) => params.push([`${key}[${n}]`, v]));
    else params.push([key, value]);
  });
  return params;
}

const signature = (params: [string, string][]) =>
  params
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("&");

const number = new Intl.NumberFormat("en-IN");

export function OlympiadViews({ stats, compact }: { stats: OlympiadStats; compact: boolean }) {
  const search = useSearchParams();
  const current = compact ? null : signature([...search].filter(([key]) => key.startsWith("where")));

  const view = (conditions: Condition[]) => {
    const params = whereParams(conditions);
    return {
      href: params.length ? `${LIST}?${new URLSearchParams(params)}` : LIST,
      active: current !== null && current === signature(params),
    };
  };

  const tiles: { label: string; value: string; hint?: string; conditions: Condition[]; tone?: "good" | "warn" }[] = [
    { label: "Forms submitted", value: number.format(stats.registered), conditions: [REGISTERED] },
    {
      label: "Paid",
      value: number.format(stats.paid),
      hint: `₹${number.format(stats.collected)} collected`,
      conditions: [REGISTERED, ["paymentStatus", "equals", "paid"]],
      tone: "good",
    },
    {
      label: "Free (Group 0)",
      value: number.format(stats.free),
      conditions: [REGISTERED, ["paymentStatus", "equals", "free"]],
      tone: "good",
    },
    {
      label: "Payment pending",
      value: number.format(stats.pending),
      hint: "Form filled, fee not paid",
      conditions: [REGISTERED, UNPAID],
      tone: stats.pending ? "warn" : undefined,
    },
    {
      label: "Registered today",
      value: number.format(stats.today),
      conditions: [REGISTERED, ["registeredAt", "greater_than_equal", stats.todayFrom]],
    },
    {
      label: "School proof to check",
      value: number.format(stats.feeCheck),
      conditions: [REGISTERED, ["feeCheck", "equals", "true"]],
      tone: stats.feeCheck ? "warn" : undefined,
    },
    {
      label: "Waiting for parent",
      value: number.format(stats.invited),
      hint: "Added by a school",
      conditions: [["type", "equals", "invited"]],
    },
    {
      label: "Reminders only",
      value: number.format(stats.reminders),
      hint: "Not registered yet",
      conditions: [["type", "equals", "reminder"]],
    },
  ];

  const all = view([]);
  const districts = stats.districts.slice(0, 12);

  return (
    <section className="cna-ov" aria-label="Olympiad registrations">
      {compact && (
        <div className="cna-ov__head">
          <h2>Adventure Olympiad registrations</h2>
          <Link href={LIST}>Open the master list</Link>
        </div>
      )}

      <div className="cna-ov__tiles">
        {tiles.map((tile) => {
          const { href, active } = view(tile.conditions);
          return (
            <Link key={tile.label} href={href} className="cna-ov__tile" data-tone={tile.tone} aria-current={active ? "true" : undefined}>
              <span className="cna-ov__value">{tile.value}</span>
              <span className="cna-ov__label">{tile.label}</span>
              {tile.hint && <span className="cna-ov__hint">{tile.hint}</span>}
            </Link>
          );
        })}
      </div>

      <div className="cna-ov__row">
        <h3>By group</h3>
        <div className="cna-ov__groups">
          {stats.groups.map((g) => {
            const { href, active } = view([REGISTERED, ["group", "equals", g.group]]);
            return (
              <Link key={g.group} href={href} className="cna-ov__group" aria-current={active ? "true" : undefined}>
                <span className="cna-ov__group-name">Group {g.group}</span>
                <span className="cna-ov__value">{number.format(g.total)}</span>
                <span className="cna-ov__hint">
                  {number.format(g.confirmed)} confirmed · {number.format(g.pending)} pending
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {!compact && (
        <>
          <div className="cna-ov__row">
            <h3>How they came</h3>
            <div className="cna-ov__chips">
              {stats.sources.map((s) => {
                const { href, active } = view([REGISTERED, ["source", "equals", s.source]]);
                return (
                  <Link key={s.source} href={href} className="cna-ov__chip" aria-current={active ? "true" : undefined}>
                    {SOURCE_LABELS[s.source]} <b>{number.format(s.count)}</b>
                  </Link>
                );
              })}
            </div>
          </div>

          {districts.length > 0 && (
            <div className="cna-ov__row">
              <h3>Top districts</h3>
              <div className="cna-ov__chips">
                {districts.map((d) => {
                  const { href, active } = view([REGISTERED, ["district", "equals", d.name]]);
                  return (
                    <Link key={d.name} href={href} className="cna-ov__chip" aria-current={active ? "true" : undefined}>
                      {d.name} <b>{number.format(d.count)}</b>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <p className="cna-ov__note">
            Click a number to filter the list below. <Link href={all.href}>Show everyone</Link> clears the filter. To combine filters (for
            example Group A in Rajkot), click one here and add the second with “Filters”.
          </p>
        </>
      )}
    </section>
  );
}

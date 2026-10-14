"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { InfoTip } from "@/components/ui/InfoTip";
import { Select } from "@/components/ui/Select";

const TYPE_TIP =
  "Trek: you walk to the view, often to a new campsite. Camp: one base, activities around it. Nature Trail: we travel together, with short, easy walks.";
const LEVEL_TIP =
  "Easy: normal fitness, short walks. Moderate: 4 to 6 hours of walking on some days. Challenging: high altitude and long days; past trek experience helps.";

export interface FilterableTrip {
  slug: string;
  region: string;
  type: string;
  level: string;
  months: string[];
  days: number;
  card: ReactNode;
}

type Filters = { region: string; type: string; month: string; level: string; short: boolean };

const EMPTY: Filters = { region: "", type: "", month: "", level: "", short: false };
const KEYS = ["region", "type", "month", "level"] as const;

interface TripFiltersProps {
  trips: FilterableTrip[];
  regionOptions: { value: string; label: string }[];
  typeOptions: { value: string; label: string }[];
  monthOptions: { value: string; label: string }[];
  levelOptions: { value: string; label: string }[];
}

/** Filters run in the browser (all cards are server-rendered for search engines); the URL mirrors the choice. */
export function TripFilters({ trips, regionOptions, typeOptions, monthOptions, levelOptions }: TripFiltersProps) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [loadedFromUrl, setLoadedFromUrl] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL is only readable after hydration
    setFilters({
      region: q.get("region") ?? "",
      type: q.get("type") ?? "",
      month: q.get("month") ?? "",
      level: q.get("level") ?? "",
      short: q.get("short") === "1",
    });
    setLoadedFromUrl(true);
  }, []);

  useEffect(() => {
    if (!loadedFromUrl) return;
    const q = new URLSearchParams();
    for (const k of KEYS) if (filters[k]) q.set(k, filters[k]);
    if (filters.short) q.set("short", "1");
    window.history.replaceState(null, "", q.size ? `?${q}` : window.location.pathname);
  }, [filters, loadedFromUrl]);

  // Functional update: the select can report a change while URL values are still being applied.
  const setFilter = (key: (typeof KEYS)[number], value: string) =>
    setFilters((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));

  const matches = (t: FilterableTrip) =>
    (!filters.region || t.region === filters.region) &&
    (!filters.type || t.type === filters.type) &&
    (!filters.level || t.level === filters.level) &&
    (!filters.month || t.months.includes(filters.month)) &&
    (!filters.short || t.days <= 3);

  const count = trips.filter(matches).length;
  const filtered = KEYS.some((k) => Boolean(filters[k]));
  const field = (
    key: (typeof KEYS)[number],
    label: string,
    emptyLabel: string,
    options: { value: string; label: string }[],
    tip?: string,
  ) => (
    <label className="block">
      <span className="flex items-center">
        <span className="eyebrow">{label}</span>
        {tip && <InfoTip label={label}>{tip}</InfoTip>}
      </span>
      <Select
        name={key}
        emptyLabel={emptyLabel}
        options={options}
        value={filters[key]}
        onValueChange={(v) => setFilter(key, v)}
        className="mt-2"
      />
    </label>
  );

  return (
    <>
      <form
        role="search"
        aria-label="Filter trips"
        className="grid grid-cols-2 gap-3 lg:grid-cols-[repeat(4,1fr)_auto]"
        onSubmit={(e) => e.preventDefault()}
      >
        {field("region", "Region", "All regions", regionOptions)}
        {field("type", "Type", "All types", typeOptions, TYPE_TIP)}
        {field("month", "Month", "Any month", monthOptions)}
        {field("level", "Level", "Any level", levelOptions, LEVEL_TIP)}
        <button type="button" onClick={() => setFilters(EMPTY)} className="btn btn-outline col-span-2 self-end lg:col-span-1">
          Clear filters
        </button>
      </form>
      <p className="mt-6 text-[13.5px] font-medium text-muted" aria-live="polite">
        {filtered ? `${count} ${count === 1 ? "trip matches" : "trips match"}` : `Showing ${count} trips`}
        {filters.short && " · 3 days or less"}
      </p>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((t) => (
          <div key={t.slug} hidden={!matches(t)}>
            {t.card}
          </div>
        ))}
      </div>
      {count === 0 && (
        <div className="mt-10 rounded-card bg-soft p-8 text-center">
          <p className="h-sub">No trip fits all of that, yet</p>
          <p className="mx-auto mt-2 max-w-xl text-muted">
            Try another month or level. Or tell us what you have in mind and we will plan it for your group.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => setFilters(EMPTY)} className="btn btn-outline">
              Clear filters
            </button>
            <Link href="/group-trips#custom" className="btn btn-primary">
              Plan a group trip
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

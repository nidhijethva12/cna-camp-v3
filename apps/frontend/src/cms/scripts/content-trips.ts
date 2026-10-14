/**
 * Copies the client's final trip copy (cms/seed/trip-copy.json, one entry per trip slug) into the
 * live CMS: summary, overview, highlights, day-by-day plan, inclusions, packing list, how to reach,
 * FAQs and the SEO title and description. Facts (type, level, days, months, price) and photos are
 * left as they are in the admin; the only fact fixed is the "Pradeshh" typo in the location.
 *
 * Dry run by default; add `apply` to publish (`payload run` drops --flags):
 * `npx payload run src/cms/scripts/content-trips.ts [apply]`
 */
import { getPayload } from "payload";
import config from "../../payload.config";
import type { Trip } from "../../payload-types";
import { scriptContext } from "../scriptContext";
import copy from "../seed/trip-copy.json";

interface TripCopy {
  summary: string;
  overview: string;
  activities: string[];
  itineraryConfirmed: boolean;
  itinerary: { title: string; body: string }[];
  included: string[];
  notIncluded: string[];
  packingList: string[];
  howToReach: string;
  faqs: { question: string; answer: string }[];
  seo: { title: string; description: string };
}

const apply = process.argv.includes("apply");
const payload = await getPayload({ config });
const show = (v: unknown) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s && s.length > 70 ? `${s.slice(0, 67)}…` : s;
};
const comparable = (v: unknown) => JSON.stringify(v ?? null, (k, val) => (k === "id" ? undefined : val));
const texts = (list: string[]) => list.map((text) => ({ text }));

const { docs } = await payload.find({ collection: "trips", depth: 0, pagination: false, draft: false, limit: 0 });
const entries = Object.entries(copy as Record<string, TripCopy>);
const problems: string[] = [];
const writes: { trip: Trip; data: Partial<Trip>; changes: string[] }[] = [];

for (const [slug, c] of entries) {
  const trip = docs.find((d) => d.slug === slug);
  if (!trip) {
    problems.push(`no trip with slug “${slug}”`);
    continue;
  }
  if (c.seo.title.length > 70) problems.push(`${slug}: SEO title is ${c.seo.title.length} characters (max 70)`);
  if (c.seo.description.length > 160) problems.push(`${slug}: SEO description is ${c.seo.description.length} characters (max 160)`);

  const target: Partial<Trip> = {
    summary: c.summary,
    overview: c.overview,
    activities: texts(c.activities),
    itinerary: c.itinerary.map((d) => ({ title: d.title, body: d.body || null })),
    itineraryConfirmed: c.itineraryConfirmed,
    howToReach: c.howToReach,
    included: texts(c.included),
    notIncluded: texts(c.notIncluded),
    packingList: texts(c.packingList),
    faqs: c.faqs,
    seo: { ...trip.seo, title: c.seo.title, description: c.seo.description },
    location: trip.location.replace(/Pradeshh\b/g, "Pradesh"),
  };
  const data: Partial<Trip> = {};
  const changes: string[] = [];
  for (const [key, value] of Object.entries(target) as [keyof Trip, unknown][]) {
    if (comparable(trip[key]) === comparable(value)) continue;
    (data as Record<string, unknown>)[key] = value;
    changes.push(`    ${key}: ${show(trip[key])} → ${show(value)}`);
  }
  if (changes.length) writes.push({ trip, data, changes });
}
for (const d of docs.filter((d) => !(d.slug in copy))) problems.push(`trip “${d.slug}” has no copy in trip-copy.json`);

const total = writes.reduce((n, w) => n + w.changes.length, 0);
console.log(`\n${apply ? "APPLIED" : "DRY RUN (add `apply` to write)"}: ${total} field changes on ${writes.length} trips`);
for (const w of writes) console.log(`  ${w.trip.slug}\n${w.changes.join("\n")}`);
if (problems.length) console.log(`\nProblems:\n  ${problems.join("\n  ")}`);

if (apply && !problems.length) {
  for (const w of writes) {
    await payload.update({
      collection: "trips",
      id: w.trip.id,
      data: { ...w.data, _status: "published" },
      draft: false,
      depth: 0,
      context: scriptContext(),
    });
  }
}
process.exit(0);

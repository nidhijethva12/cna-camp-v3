/**
 * Adds (or updates) trips from the client's "new trips" folder: one sub-folder per trip, each with a
 * `02 trip-data.json`, an `images/` folder and, for some, a trip guide PDF. Photos keep their file
 * names and are uploaded once (re-runs reuse them); every new upload is fetched back from storage.
 * A trip with a dated batch gets that batch too.
 *
 * Dry run by default; add `apply` to write (`payload run` drops --flags):
 * `npx payload run src/cms/scripts/new-trips.ts "<folder>" [apply]`
 */
import fs from "node:fs/promises";
import path from "node:path";
import { getPayload } from "payload";
import config from "../../payload.config";
import type { Trip } from "../../payload-types";
import { scriptContext } from "../scriptContext";

interface Photo {
  file?: string;
  src?: string;
  alt: string;
  credit?: string;
  source?: string;
}
interface TripData {
  slug: string;
  name: string;
  cardName: string;
  tagline: string;
  cardSummary: string;
  type: string;
  state: string;
  duration: string;
  level: string;
  bestMonths: string;
  startsFrom: string;
  price: { amount: number | null; note?: string };
  nextBatches?: { date: string; status?: string }[];
  seo: { title: string; description: string };
  overview: string[];
  highlights: string[];
  photos: Photo[];
  days?: { title: string; text: string }[];
  itinerary?: { title: string; text: string }[];
  included: string[];
  notIncluded: string[];
  optionalAtOwnCost?: string[];
  whatToCarry: string[];
  howToReach: string;
  notice?: { title: string; text: string };
  faqs: { q: string; a: string; link?: { label: string; href: string } }[];
  downloads?: { label: string; file: string }[];
}

const [folder, mode] = process.argv.slice(2);
if (!folder) throw new Error('Pass the folder: npx payload run src/cms/scripts/new-trips.ts "<folder>" [apply]');
const apply = mode === "apply";
const payload = await getPayload({ config });

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;
const TYPES: Record<string, Trip["type"]> = { Trek: "trek", Camp: "camp", "Nature Trail": "nature-trail" };
const LEVELS: Record<string, Trip["difficulty"]> = {
  Easy: "easy",
  Moderate: "moderate",
  "Easy to moderate": "moderate",
  Challenging: "challenging",
};
/** Seats are not shown on the site; the field is required, so a new batch starts with this many. */
const BATCH_SEATS = 40;

/** "October to March" → oct, nov, dec, jan, feb, mar. */
function months(range: string) {
  const [from, to] = range.split(" to ").map((m) => MONTHS.indexOf(m.trim().slice(0, 3).toLowerCase() as (typeof MONTHS)[number]));
  if (from < 0 || to < 0) throw new Error(`Cannot read the months "${range}"`);
  const list: (typeof MONTHS)[number][] = [];
  for (let i = from; ; i = (i + 1) % 12) {
    list.push(MONTHS[i]);
    if (i === to) break;
  }
  return list;
}

/** "2D/3N" → 2 days, 3 nights; "Day trip" → 1 day, 0 nights. */
function length(duration: string) {
  const match = /^(\d+)D\/(\d+)N$/.exec(duration);
  if (match) return { days: Number(match[1]), nights: Number(match[2]) };
  if (duration === "Day trip") return { days: 1, nights: 0 };
  throw new Error(`Cannot read the duration "${duration}"`);
}

const texts = (list: string[] | undefined) => (list ?? []).map((text) => ({ text }));
const lines: string[] = [];
const problems: string[] = [];
const uploaded: { collection: "media" | "documents"; id: string }[] = [];

async function photo(dir: string, p: Photo) {
  const filename = path.basename(p.file ?? p.src ?? "");
  const { docs } = await payload.find({ collection: "media", where: { filename: { equals: filename } }, limit: 1, depth: 0 });
  if (docs[0]) return docs[0].id;
  // A photo given as a web address is one the site already has; anything else is a file in this trip's images folder.
  if (!p.file && /^https?:/.test(p.src ?? "")) {
    problems.push(`${filename} should already be on the site, but is not in the media library`);
    return null;
  }
  lines.push(`    + photo ${filename}`);
  if (!apply) return `new:${filename}`;
  const data = await fs.readFile(path.join(dir, "images", filename));
  const doc = await payload.create({
    collection: "media",
    data: { alt: p.alt, ownedByCna: false, credit: p.credit ?? p.source ?? "" },
    file: { data, mimetype: "image/webp", name: filename, size: data.length },
    context: scriptContext(),
  });
  uploaded.push({ collection: "media", id: doc.id });
  return doc.id;
}

async function guide(dir: string, d: TripData) {
  const file = d.downloads?.[0]?.file;
  if (!file) return null;
  const { docs } = await payload.find({ collection: "documents", where: { filename: { equals: file } }, limit: 1, depth: 0 });
  if (docs[0]) return docs[0].id;
  lines.push(`    + PDF ${file}`);
  if (!apply) return `new:${file}`;
  const data = await fs.readFile(path.join(dir, file));
  const doc = await payload.create({
    collection: "documents",
    data: { title: `${d.cardName}: trip guide` },
    file: { data, mimetype: "application/pdf", name: file, size: data.length },
    context: scriptContext(),
  });
  uploaded.push({ collection: "documents", id: doc.id });
  return doc.id;
}

const dirs = (await fs.readdir(folder, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => path.join(folder, e.name));
const existing = await payload.find({ collection: "trips", depth: 0, pagination: false, limit: 0, draft: false });
let order = Math.max(0, ...existing.docs.map((t) => t.order ?? 0));

for (const dir of dirs.sort()) {
  const file = path.join(dir, "02 trip-data.json");
  const raw = await fs.readFile(file, "utf8").catch(() => null);
  if (!raw) continue;
  const d = JSON.parse(raw) as TripData;
  const before = existing.docs.find((t) => t.slug === d.slug);
  lines.push(`${before ? "Update" : "New"} trip: ${d.cardName} (/trips/${d.slug})`);
  if (!TYPES[d.type]) problems.push(`${d.slug}: unknown type "${d.type}"`);
  if (!LEVELS[d.level]) problems.push(`${d.slug}: unknown level "${d.level}"`);
  if (d.cardSummary.length > 220) problems.push(`${d.slug}: card summary is ${d.cardSummary.length} characters (max 220)`);
  if (d.seo.title.length > 70) problems.push(`${d.slug}: SEO title is ${d.seo.title.length} characters (max 70)`);

  const ids: string[] = [];
  for (const p of d.photos) {
    const id = await photo(dir, p);
    if (id) ids.push(id);
  }
  const [heroImage, ...gallery] = ids;
  const guideId = await guide(dir, d);
  const plan = d.days ?? d.itinerary ?? [];
  const dated = (d.nextBatches ?? []).filter((b) => b.date);

  const data = {
    name: d.cardName,
    heading: d.name === d.cardName ? null : d.name,
    tagline: d.tagline,
    summary: d.cardSummary,
    region: "gujarat" as const,
    location: d.state,
    type: TYPES[d.type],
    difficulty: LEVELS[d.level],
    ...length(d.duration),
    priceFrom: d.price.amount,
    showPrice: d.price.amount != null,
    priceNote: d.price.amount != null ? (d.price.note ?? null) : null,
    startsFrom: d.startsFrom,
    months: months(d.bestMonths),
    activities: texts(d.highlights),
    overview: d.overview.join("\n\n"),
    itinerary: plan.map((day) => ({ title: day.title, body: day.text })),
    // A trip with a real date runs to CNA's own schedule; the others are marked tentative on the page.
    itineraryConfirmed: dated.length > 0,
    howToReach: d.howToReach,
    notice: d.notice ? { title: d.notice.title, text: d.notice.text } : undefined,
    included: texts(d.included),
    notIncluded: texts(d.notIncluded),
    optionalExtras: texts(d.optionalAtOwnCost),
    packingList: texts(d.whatToCarry),
    faqs: d.faqs.map((f) => ({ question: f.q, answer: f.a, linkLabel: f.link?.label ?? null, linkHref: f.link?.href ?? null })),
    seo: { title: d.seo.title, description: d.seo.description, image: heroImage },
    heroImage,
    gallery,
    guide: guideId,
    slug: d.slug,
    _status: "published" as const,
  };
  lines.push(
    `    ${data.days} day(s), ${data.nights} night(s) · ${data.type} · ${data.difficulty} · ${data.months.join(" ")} · ${data.priceFrom ? `₹${data.priceFrom}` : "On request"}`,
    `    banner + ${gallery.length} gallery photos · ${plan.length} plan step(s) · ${data.faqs.length} FAQs${guideId ? " · trip guide PDF" : ""}`,
  );

  let tripId = before?.id;
  if (apply && !problems.length) {
    const saved = before
      ? await payload.update({ collection: "trips", id: before.id, data, draft: false, depth: 0, context: scriptContext() })
      : await payload.create({
          collection: "trips",
          data: { ...data, order: (order += 10), featured: false },
          draft: false,
          depth: 0,
          context: scriptContext(),
        });
    tripId = saved.id;
  }

  for (const b of dated) {
    const start = `${b.date}T00:00:00.000+05:30`;
    const has = tripId
      ? (
          await payload.find({
            collection: "batches",
            where: { and: [{ trip: { equals: tripId } }, { startDate: { equals: new Date(start).toISOString() } }] },
            limit: 1,
            depth: 0,
          })
        ).docs[0]
      : null;
    lines.push(`    ${has ? "batch already there" : "+ batch"}: ${b.date}`);
    if (apply && !problems.length && tripId && !has)
      await payload.create({
        collection: "batches",
        data: { trip: tripId, startDate: start, endDate: start, seatsLeft: BATCH_SEATS, note: b.status ?? null, showDates: true },
        context: scriptContext(),
      });
  }
}

console.log(`\n${apply ? (problems.length ? "NOTHING WRITTEN" : "APPLIED") : "DRY RUN (add `apply` to write)"}\n${lines.join("\n")}`);
if (problems.length) console.log(`\nProblems:\n  ${problems.join("\n  ")}`);

// Every new file must really be in storage: a record without its file shows a broken photo.
for (const { collection, id } of uploaded) {
  const doc = await payload.findByID({ collection, id, depth: 0 });
  const url = doc.url?.startsWith("http") ? doc.url : null;
  if (!url) continue;
  const status = await fetch(url, { method: "HEAD" }).then(
    (res) => (res.ok ? null : String(res.status)),
    () => "no answer",
  );
  if (status) console.log(`  MISSING IN STORAGE (${status}): ${doc.filename}`);
}
if (uploaded.length) console.log(`\nChecked ${uploaded.length} new file(s) in storage.`);
process.exit(0);

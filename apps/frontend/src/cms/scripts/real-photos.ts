/**
 * Puts CNA's own photos (public/img/cna/real, from the client's media pack) on the home page and
 * the Manali trips, as chosen in the client's content docs. Only the photo fields named below
 * change; everything else is written back exactly as published.
 *
 * Dry run by default: prints every change. Add `apply` to upload the photos and publish
 * (`payload run` drops --flags, so it is a plain word): `npx payload run src/cms/scripts/real-photos.ts [apply]`
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPayload } from "payload";
import config from "../../payload.config";
import type { HomePage, Media, Trip } from "../../payload-types";

const apply = process.argv.includes("apply");
const photoDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../public/img/cna/real");
// Outside Next.js there is no cache to refresh; the live site picks changes up on its next revalidation.
const context = { skipRevalidate: true };

const alts = {
  "campus-02": "Blue tents on a green meadow, Manali",
  "campus-04": "CNA’s Manali campus ground with snow peaks behind",
  "campus-05": "The garden at CNA’s Manali campus, snow peaks behind",
  "climb-03": "A camper rappelling down a rock face on a rope",
  "climb-04": "A girl rock climbing on a boulder in a pine forest, Manali",
  "food-04": "Campers being served lunch with snow peaks behind, Manali",
  "group-02": "A girls’ group at a temple in Manali",
  "group-03": "Campers with local women in Himachali dress, Manali",
  "group-04": "Hundreds of campers seated in a circle in a Himalayan forest",
  "group-05": "Camp leaders talking to a group of young campers",
  "group-06": "A large CNA group outside Hidimba temple, Manali",
  "group-09": "A cycling group on a mountain road in Himachal",
  "group-10": "A boys’ batch with their bags outside a wooden hut in Himachal",
  "group-11": "A group of campers cheering together in a deodar forest",
  "land-02": "Sunrise lighting up snow peaks above the Manali valley",
  "land-03": "Snow peaks above a green valley in Himachal Pradesh",
  "land-04": "A spring meadow with yellow flowers in the Kullu valley",
  "land-05": "A tall deodar forest near Manali",
  "land-06": "The Manali valley below snow peaks, Himachal Pradesh",
  "land-09": "A waterfall tumbling over rocks near Manali",
  "land-10": "Panorama of the Manali valley under snow peaks",
  "land-12": "View over pine trees and mountains from a hilltop in Himachal",
  "river-01": "Campers crossing a river on a wooden bridge near Manali",
  "river-02": "A group of campers crossing a mountain river together",
  "snow-01": "A frozen lake in the snow, Himachal Pradesh",
  "snow-02": "Campers walking up a snowy mountain road in warm layers",
  "snow-03": "A CNA group with a flag in a rocky river valley below snow peaks",
  "travel-01": "Smiling campers taking a selfie on the bus",
  "trek-01": "A line of first-time trekkers walking up a green hillside in Himachal",
  "trek-02": "A line of campers trekking up a green Himalayan hillside",
  "trek-03": "Walking through a tall deodar forest near Manali",
} as const;
type PhotoName = keyof typeof alts;

const home: {
  hero: PhotoName;
  story: PhotoName;
  why: PhotoName;
  acrossIndia: PhotoName;
  audiences: Record<string, PhotoName>;
  strip: [PhotoName, string][];
} = {
  hero: "trek-01",
  story: "group-06",
  why: "climb-04",
  acrossIndia: "land-06",
  // Audience cards are matched by their link, which stays stable when titles are edited.
  audiences: {
    "/group-trips#schools": "group-10",
    "/group-trips#families": "group-11",
    "/travellers#girls": "river-01",
    "/travellers#solo": "land-03",
  },
  strip: [
    ["river-01", "Crossing the river, Manali"],
    ["river-02", "Hold hands, keep moving"],
    ["trek-02", "On the hillside trail"],
    ["trek-03", "Deodar forest walk"],
    ["climb-03", "Rappelling down"],
    ["climb-04", "First climb"],
    ["campus-02", "Blue tents on the meadow"],
    ["campus-04", "Our Manali campus"],
    ["food-04", "Lunch with a view"],
    ["group-04", "The big circle"],
    ["group-06", "At Hidimba temple"],
    ["group-09", "Cycling morning"],
    ["snow-02", "Snow day"],
    ["travel-01", "On the bus to the mountains"],
  ],
};

/** `keepPlacePhotos`: multi-city trips keep their current place photos (Shimla, Amritsar, Dalhousie…) after the Manali ones. */
const trips: Record<string, { hero: PhotoName; gallery: PhotoName[]; keepPlacePhotos?: boolean }> = {
  "manali-snow-camp": { hero: "land-02", gallery: ["snow-02", "snow-03", "snow-01", "campus-04", "campus-05"] },
  "astro-adventure-manali": {
    hero: "land-10",
    gallery: ["climb-03", "climb-04", "river-01", "river-02", "trek-02", "trek-03", "group-06", "land-09"],
  },
  "shimla-manali-amritsar": { hero: "land-06", gallery: ["group-06", "group-03", "trek-03"], keepPlacePhotos: true },
  "kullu-shimla-manali": { hero: "campus-05", gallery: ["campus-02", "land-04", "land-10", "group-02", "travel-01"], keepPlacePhotos: true },
  "kullu-manali-dalhousie": { hero: "campus-04", gallery: ["land-05", "land-12", "group-11", "group-05"], keepPlacePhotos: true },
};

const payload = await getPayload({ config });
/** The published document minus the keys Payload manages itself. */
const contentOf = <T extends object>(doc: T) => {
  const copy = { ...doc } as Record<string, unknown>;
  for (const key of ["id", "createdAt", "updatedAt", "globalType"]) delete copy[key];
  return copy as Omit<T, "id" | "createdAt" | "updatedAt">;
};
const idOf = (m: string | Media | null | undefined) => (m == null ? null : typeof m === "string" ? m : m.id);

const mediaCache = new Map<string, Media>();
async function mediaById(ids: string[]) {
  const missing = ids.filter((id) => !mediaCache.has(id));
  if (missing.length) {
    const { docs } = await payload.find({ collection: "media", where: { id: { in: missing } }, depth: 0, pagination: false });
    docs.forEach((d) => mediaCache.set(d.id, d));
  }
  return ids.map((id) => mediaCache.get(id));
}
const describe = async (id: string | null) => {
  if (!id) return "(empty)";
  const [m] = await mediaById([id]);
  return m ? `${m.filename}${m.credit ? " [credited]" : ""}` : `(missing ${id})`;
};

const uploaded = new Map<PhotoName, string>();
let created = 0;
/** Returns the Media id for a pack photo, uploading it once. In a dry run new uploads get a placeholder id. */
async function photo(name: PhotoName) {
  const known = uploaded.get(name);
  if (known) return known;
  const filename = `cna-real-${name}.webp`;
  const { docs } = await payload.find({ collection: "media", where: { filename: { equals: filename } }, limit: 1, depth: 0 });
  let id = docs[0]?.id;
  if (!id) {
    if (apply) {
      const data = await fs.readFile(path.join(photoDir, `${name}-wide.webp`));
      const doc = await payload.create({
        collection: "media",
        data: { alt: alts[name], ownedByCna: true },
        file: { data, mimetype: "image/webp", name: filename, size: data.length },
        context,
      });
      id = doc.id;
    } else {
      id = `new:${filename}`;
    }
    created += 1;
  }
  uploaded.set(name, id);
  return id;
}
const label = async (id: string) => (id.startsWith("new:") ? `${id.slice(4)} (new upload)` : describe(id));

const changes: string[] = [];
async function change(where: string, from: string | null, to: string) {
  const [a, b] = [await describe(from), await label(to)];
  if (from !== to) changes.push(`  ${where}: ${a} → ${b}`);
}

async function warnIfNewerDraft(name: string, latest: { _status?: string | null } | undefined) {
  if (latest?._status === "draft") changes.push(`  ⚠ ${name} has an unpublished draft; it will be replaced by this published version.`);
}

// ---- Home page ----
const published = (await payload.findGlobal({ slug: "home-page", depth: 0, draft: false })) as HomePage;
const { docs: homeVersions } = await payload.findGlobalVersions({ slug: "home-page", sort: "-updatedAt", limit: 1, depth: 0 });
changes.push("Home page");
await warnIfNewerDraft("Home page", homeVersions[0]?.version);

const next = structuredClone(published);
const swap = async (where: string, current: string | Media | null | undefined, name: PhotoName) => {
  const id = await photo(name);
  await change(where, idOf(current), id);
  return id;
};
next.hero.image = await swap("hero", published.hero.image, home.hero);
next.story.image = await swap("who we are", published.story.image, home.story);
next.why.image = await swap("why CNA", published.why.image, home.why);
next.destinations.regionImages.acrossIndia = await swap(
  "region: across India",
  published.destinations.regionImages.acrossIndia,
  home.acrossIndia,
);
for (const item of next.audiences.items ?? []) {
  const name = home.audiences[item.link];
  if (name) item.image = await swap(`audience: ${item.title}`, item.image, name);
  else changes.push(`  ⚠ audience "${item.title}" (${item.link}) has no new photo; left as is.`);
}
const stripKey = (rows: { image: string | Media | null | undefined; caption: string }[]) => rows.map((r) => `${idOf(r.image)}|${r.caption}`).join();
const newStrip = await Promise.all(home.strip.map(async ([name, caption]) => ({ image: await photo(name), caption })));
if (stripKey(published.gallery.photos ?? []) !== stripKey(newStrip)) {
  changes.push(`  photo strip: ${published.gallery.photos?.length ?? 0} photos → ${newStrip.length} real photos`);
  for (const p of published.gallery.photos ?? []) changes.push(`    − ${await describe(idOf(p.image))} “${p.caption}”`);
  for (const p of newStrip) changes.push(`    + ${await label(p.image)} “${p.caption}”`);
  next.gallery.photos = newStrip;
}

// ---- Trips ----
const { docs: tripDocs } = await payload.find({
  collection: "trips",
  where: { slug: { in: Object.keys(trips) } },
  depth: 0,
  draft: false,
  pagination: false,
});
const tripUpdates: { doc: Trip; heroImage: string; gallery: string[] }[] = [];
for (const [slug, plan] of Object.entries(trips)) {
  const doc = tripDocs.find((t) => t.slug === slug);
  if (!doc) {
    changes.push(`Trip ${slug}: not found, skipped`);
    continue;
  }
  changes.push(`Trip ${doc.name} (${slug})`);
  const { docs: versions } = await payload.findVersions({
    collection: "trips",
    where: { parent: { equals: doc.id } },
    sort: "-updatedAt",
    limit: 1,
    depth: 0,
  });
  await warnIfNewerDraft(doc.name, versions[0]?.version);

  const heroImage = await photo(plan.hero);
  await change("hero", idOf(doc.heroImage), heroImage);
  const oldIds = (doc.gallery ?? []).map(idOf).filter((id): id is string => Boolean(id));
  const kept = plan.keepPlacePhotos ? oldIds : [];
  const gallery = [...new Set([...(await Promise.all(plan.gallery.map(photo))), ...kept])].filter((id) => id !== heroImage);
  if (oldIds.join() !== gallery.join()) {
    changes.push(`  gallery: ${(await Promise.all(oldIds.map(describe))).join(", ") || "(empty)"}`);
    changes.push(`        → ${(await Promise.all(gallery.map(label))).join(", ")}`);
  }
  tripUpdates.push({ doc, heroImage, gallery });
}

console.log(`\n${apply ? "APPLYING" : "DRY RUN (add `apply` to write)"}: ${created} new photo uploads\n`);
console.log(changes.join("\n"));

if (apply) {
  await payload.updateGlobal({ slug: "home-page", data: { ...contentOf(next), _status: "published" }, draft: false, depth: 0, context });
  for (const { doc, heroImage, gallery } of tripUpdates) {
    await payload.update({
      collection: "trips",
      id: doc.id,
      data: { ...contentOf(doc), heroImage, gallery, _status: "published" },
      draft: false,
      depth: 0,
      context,
    });
  }
  console.log(`\nDone: home page and ${tripUpdates.length} trips published.`);
}
process.exit(0);

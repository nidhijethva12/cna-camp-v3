/**
 * Adds CNA's video clips (client media pack) to the Videos collection with their poster frames, and
 * links them to the Manali trips, as chosen in the client's content docs. Safe to re-run: clips and
 * posters already uploaded are reused, and trip links are only written when they differ.
 *
 * `dir` holds <slug>.mp4 + <slug>.webp (poster) for each clip below; videos are not kept in the repo.
 * Dry run by default; add `apply` to upload and publish (`payload run` drops --flags, so it is a plain word):
 * `npx payload run src/cms/scripts/real-videos.ts <dir> [apply]`
 */
import fs from "node:fs/promises";
import path from "node:path";
import { getPayload } from "payload";
import config from "../../payload.config";
import type { Video } from "../../payload-types";

const [dir, mode] = process.argv.slice(2);
const apply = mode === "apply";
// Outside Next.js there is no cache to refresh; the live site picks changes up on its next revalidation or deploy.
const context = { skipRevalidate: true };

const clips = [
  {
    slug: "arunachal-group-trip",
    title: "Group trip, Arunachal Pradesh",
    alt: "A CNA group posing together below green mountains in Arunachal Pradesh",
    orientation: "portrait",
  },
  {
    slug: "girls-trip-himachal",
    title: "Girls’ trip, Himachal",
    alt: "A girls’ group gathered outdoors on a sunny day in Himachal",
    orientation: "landscape",
  },
  { slug: "camp-snow-peaks", title: "Camp under the snow peaks", alt: "Campers sitting by blue tents below snowy slopes", orientation: "portrait" },
  {
    slug: "snow-road-dance",
    title: "Dancing on the snow road",
    alt: "Girls dancing on a mountain road with snow peaks behind",
    orientation: "landscape",
  },
  {
    slug: "beas-river-manali",
    title: "The Beas river at Manali",
    alt: "The Beas river flowing past forest and hotels in Manali",
    orientation: "portrait",
    ambient: true,
  },
] as const satisfies readonly { slug: string; title: string; alt: string; orientation: Video["orientation"]; ambient?: boolean }[];
type ClipSlug = (typeof clips)[number]["slug"];

const tripVideos: Record<string, ClipSlug[]> = {
  "manali-snow-camp": ["snow-road-dance", "camp-snow-peaks"],
  "kullu-shimla-manali": ["beas-river-manali"],
};

if (!dir) throw new Error("Pass the folder with the clips: npx payload run src/cms/scripts/real-videos.ts <dir> [apply]");
const payload = await getPayload({ config });
const changes: string[] = [];
const ids = new Map<ClipSlug, string>();

async function readFile(name: string) {
  const data = await fs.readFile(path.join(dir, name));
  return { data, name, size: data.length };
}

for (const [i, clip] of clips.entries()) {
  const posterName = `cna-video-${clip.slug}.webp`;
  const existingPoster = (await payload.find({ collection: "media", where: { filename: { equals: posterName } }, limit: 1, depth: 0 })).docs[0];
  let posterId = existingPoster?.id;
  if (!posterId) {
    changes.push(`  + poster ${posterName}`);
    if (apply) {
      const file = await readFile(`${clip.slug}.webp`);
      posterId = (
        await payload.create({
          collection: "media",
          data: { alt: clip.alt, ownedByCna: true },
          file: { ...file, name: posterName, mimetype: "image/webp" },
          context,
        })
      ).id;
    }
  }

  const fileName = `${clip.slug}.mp4`;
  const existing = (await payload.find({ collection: "videos", where: { filename: { equals: fileName } }, limit: 1, depth: 0 })).docs[0];
  const data = {
    title: clip.title,
    orientation: clip.orientation,
    ambient: "ambient" in clip && clip.ambient,
    showInGallery: true,
    order: (i + 1) * 10,
  };
  if (existing) {
    ids.set(clip.slug, existing.id);
  } else {
    const size = (await fs.stat(path.join(dir, fileName))).size;
    changes.push(`  + video ${fileName} (${(size / 1024 / 1024).toFixed(1)} MB) “${clip.title}”${data.ambient ? ", loops silently" : ""}`);
    if (apply && posterId) {
      const file = await readFile(fileName);
      const doc = await payload.create({
        collection: "videos",
        data: { ...data, poster: posterId },
        file: { ...file, mimetype: "video/mp4" },
        context,
      });
      ids.set(clip.slug, doc.id);
    }
  }
}

for (const [slug, wanted] of Object.entries(tripVideos)) {
  const trip = (await payload.find({ collection: "trips", where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: false })).docs[0];
  if (!trip) {
    changes.push(`  ⚠ trip ${slug} not found`);
    continue;
  }
  const current = (trip.videos ?? []).map((v) => (typeof v === "string" ? v : v.id));
  const next = wanted.map((s) => ids.get(s) ?? `new:${s}`);
  if (current.join() === next.join()) continue;
  changes.push(`  trip ${trip.name}: videos ${current.length ? current.join(", ") : "(none)"} → ${wanted.join(", ")}`);
  if (apply) {
    // Write the whole published document back so no other field can be lost in the merge.
    const doc = { ...trip } as Record<string, unknown>;
    for (const key of ["id", "createdAt", "updatedAt"]) delete doc[key];
    await payload.update({ collection: "trips", id: trip.id, data: { ...doc, videos: next, _status: "published" }, draft: false, depth: 0, context });
  }
}

console.log(`\n${apply ? "APPLIED" : "DRY RUN (add `apply` to write)"}: ${changes.length ? "" : "nothing to change"}`);
console.log(changes.join("\n"));
process.exit(0);

/**
 * Creates or updates the blog posts from the client's final copy (cms/seed/blog-copy.json). The body
 * is Markdown, with `@@image <photo> | <alt>` lines where a photo goes: a CNA photo name (uploaded
 * from public/img/cna/real when it is not in the media library yet) or `trip:<slug>` for that trip's
 * hero photo. New posts are published with staggered dates, so the list keeps the document's order.
 *
 * Dry run by default; add `apply` to publish (`payload run` drops --flags):
 * `npx payload run src/cms/scripts/content-blog.ts [apply]`
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { convertMarkdownToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";
import { getPayload } from "payload";
import config from "../../payload.config";
import type { Post } from "../../payload-types";
import { scriptContext } from "../scriptContext";
import copy from "../seed/blog-copy.json";

const apply = process.argv.includes("apply");
const payload = await getPayload({ config });
const editorConfig = await editorConfigFactory.default({ config: payload.config });
const imgDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../public/img/cna/real");
const comparable = (v: unknown) => JSON.stringify(v ?? null, (k, val) => (k === "id" ? undefined : val));

const changes: string[] = [];
const uploaded: string[] = [];
const photoIds = new Map<string, string>();

/** Media id for a photo key, uploading a CNA photo on apply when it is not in the library yet. */
async function photo(key: string, alt: string) {
  if (photoIds.has(key)) return photoIds.get(key)!;
  let id: string | undefined;
  if (key.startsWith("trip:")) {
    const { docs } = await payload.find({ collection: "trips", where: { slug: { equals: key.slice(5) } }, depth: 0, limit: 1 });
    const hero = docs[0]?.heroImage;
    id = typeof hero === "object" ? hero?.id : (hero ?? undefined);
    if (!id) throw new Error(`No hero photo for ${key}`);
  } else {
    const filename = `cna-real-${key}.webp`;
    const { docs } = await payload.find({ collection: "media", where: { filename: { equals: filename } }, depth: 0, limit: 1 });
    id = docs[0]?.id;
    if (!id) {
      changes.push(`  + photo ${filename}`);
      if (!apply) id = `new:${filename}`;
      else {
        const data = await fs.readFile(path.join(imgDir, `${key}-wide.webp`));
        const doc = await payload.create({
          collection: "media",
          data: { alt, ownedByCna: true },
          file: { data, mimetype: "image/webp", name: filename, size: data.length },
          context: scriptContext(),
        });
        id = doc.id;
        uploaded.push(id);
      }
    }
  }
  photoIds.set(key, id);
  return id;
}

/** Markdown body to Lexical, with an upload node for every `@@image` line. */
async function lexical(markdown: string): Promise<Post["content"]> {
  const children: Post["content"]["root"]["children"] = [];
  for (const part of markdown.split(/^(@@image .+)$/m)) {
    const image = part.match(/^@@image (\S+) \| (.+)$/);
    if (image) {
      children.push({
        type: "upload",
        version: 3,
        format: "",
        fields: null,
        relationTo: "media",
        value: await photo(image[1], image[2].trim()),
      });
    } else if (part.trim()) {
      children.push(...convertMarkdownToLexical({ editorConfig, markdown: part }).root.children);
    }
  }
  return { root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children } };
}

const writes: (() => Promise<unknown>)[] = [];
const today = new Date();
for (const [i, p] of copy.entries()) {
  const trips = await payload.find({ collection: "trips", where: { slug: { in: p.relatedTrips } }, depth: 0, pagination: false });
  const data = {
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    coverImage: await photo(p.cover, p.coverAlt),
    content: await lexical(p.markdown),
    relatedTrips: p.relatedTrips.flatMap((slug) => trips.docs.find((t) => t.slug === slug)?.id ?? []),
    faqs: p.faqs,
    seo: { title: p.seo.title, description: p.seo.description },
  };
  const { docs } = await payload.find({ collection: "posts", where: { slug: { equals: p.slug } }, depth: 0, limit: 1, draft: false });
  const existing = docs[0];
  if (!existing) {
    const publishedAt = new Date(today.getTime() - i * 86_400_000).toISOString();
    changes.push(`  + post “${p.title}”`);
    writes.push(() =>
      payload.create({ collection: "posts", data: { ...data, publishedAt, _status: "published" }, draft: false, context: scriptContext() }),
    );
    continue;
  }
  const changed = (Object.keys(data) as (keyof typeof data)[]).filter(
    (k) =>
      comparable(k === "seo" ? { title: existing.seo?.title, description: existing.seo?.description } : existing[k]) !==
      comparable(data[k]),
  );
  if (changed.length) {
    changes.push(`  ~ post “${p.title}”: ${changed.join(", ")}`);
    writes.push(() =>
      payload.update({
        collection: "posts",
        id: existing.id,
        data: { ...data, _status: "published" },
        draft: false,
        context: scriptContext(),
      }),
    );
  }
}

console.log(`\n${apply ? "APPLIED" : "DRY RUN (add `apply` to write)"}: ${changes.length} changes\n${changes.join("\n")}`);
if (apply) {
  for (const write of writes) await write();
  for (const id of uploaded) {
    const doc = await payload.findByID({ collection: "media", id, depth: 0 });
    const status = doc.url ? (await fetch(doc.url, { method: "HEAD" })).status : 0;
    if (status !== 200) throw new Error(`Uploaded but not in storage: ${doc.filename} (${status})`);
  }
  if (uploaded.length) console.log(`Checked: all ${uploaded.length} new uploads are in storage.`);
}
process.exit(0);

/**
 * Copies the home page copy and the FAQs from the seed (cms/seed/home.ts, cms/seed/faqs.ts)
 * into the live CMS, so the seed stays the single source for the client's final copy. Only text
 * changes: photos, links, counts and trip lists are left as they are in the admin.
 *
 * Dry run by default; add `apply` to publish (`payload run` drops --flags):
 * `npx payload run src/cms/scripts/content-home.ts [apply]`
 */
import { getPayload } from "payload";
import config from "../../payload.config";
import type { HomePage } from "../../payload-types";
import { scriptContext } from "../scriptContext";
import { faqs, HOME_FAQ_COUNT, RETIRED_FAQ_QUESTIONS } from "../seed/faqs";
import { home } from "../seed/home";

const apply = process.argv.includes("apply");
const payload = await getPayload({ config });
const changes: string[] = [];
const show = (v: unknown) => (typeof v === "string" ? `“${v.length > 70 ? `${v.slice(0, 67)}…` : v}”` : JSON.stringify(v));

/** JSON for comparing, minus the row ids the CMS adds to array items. */
const comparable = (v: unknown) => JSON.stringify(v ?? null, (k, val) => (k === "id" ? undefined : val));

/** Sets `obj[key]` to `value`, noting it when it changes. */
function set<T extends object>(obj: T, key: keyof T & string, value: unknown, where: string) {
  if (comparable(obj[key]) === comparable(value)) return;
  changes.push(`  ${where}: ${show(obj[key])} → ${show(value)}`);
  (obj as Record<string, unknown>)[key] = value;
}

const doc = (await payload.findGlobal({ slug: "home-page", depth: 0, draft: false })) as HomePage;
const next = structuredClone(doc);

set(next.hero, "headingLines", home.hero.headingLines, "hero lines");
set(next.hero, "heading", home.hero.heading, "hero H1");
set(next.hero, "intro", home.hero.intro, "hero intro");
set(next.hero, "highlights", home.hero.highlights, "hero highlights");

for (const key of ["holidays", "destinations", "audiences", "why", "gallery"] as const) {
  const source = home[key] as { eyebrow: string; title: string; intro?: string };
  set(next[key], "eyebrow", source.eyebrow, `${key} eyebrow`);
  set(next[key], "title", source.title, `${key} title`);
  if ("intro" in next[key] || source.intro) set(next[key] as { intro?: string | null }, "intro", source.intro ?? null, `${key} intro`);
}

// Holiday cards and audience cards are matched by their link, which editors are unlikely to change.
for (const item of next.holidays.items ?? []) {
  const source = home.holidays.items.find((h) => h.link === item.link);
  if (!source) continue;
  set(item, "months", source.months, `holiday ${item.title} months`);
  set(item, "title", source.title, `holiday ${item.title} title`);
}
for (const item of next.audiences.items ?? []) {
  const source = home.audiences.items.find((a) => a.link === item.link);
  if (!source) continue;
  set(item, "title", source.title, `audience ${item.title} title`);
  set(item, "description", source.description, `audience ${item.title} text`);
}
set(next.audiences, "teacherNote", home.audiences.teacherNote, "teacher note");
set(next.why, "points", home.why.points, "why points");
set(next.seo ?? (next.seo = {}), "title", home.seo.title, "SEO title");
set(next.seo, "description", home.seo.description, "SEO description");

// FAQs: the seed list, in order. The first HOME_FAQ_COUNT show on the home page, the rest on About.
// FAQs editors added themselves are left alone; only questions the final copy retired are removed.
const { docs: existing } = await payload.find({ collection: "faqs", depth: 0, pagination: false, sort: "order" });
const faqWrites: (() => Promise<unknown>)[] = [];
for (const [i, f] of faqs.entries()) {
  const match = existing.find((e) => e.question === f.question);
  const data = { question: f.question, answer: f.answer, order: (i + 1) * 10, showOnHome: i < HOME_FAQ_COUNT };
  if (!match) {
    changes.push(`  + FAQ “${f.question}”`);
    faqWrites.push(() => payload.create({ collection: "faqs", data, context: scriptContext() }));
  } else if (match.answer !== f.answer || match.order !== data.order || Boolean(match.showOnHome) !== data.showOnHome) {
    changes.push(`  ~ FAQ “${f.question}”`);
    faqWrites.push(() => payload.update({ collection: "faqs", id: match.id, data, context: scriptContext() }));
  }
}
for (const e of existing.filter((e) => RETIRED_FAQ_QUESTIONS.includes(e.question))) {
  changes.push(`  − FAQ removed (replaced in the final copy): “${e.question}”`);
  faqWrites.push(() => payload.delete({ collection: "faqs", id: e.id, context: scriptContext() }));
}

console.log(`\n${apply ? "APPLIED" : "DRY RUN (add `apply` to write)"}: ${changes.length} changes\n${changes.join("\n")}`);
if (apply && changes.length) {
  const data = { ...next, _status: "published" as const } as Record<string, unknown>;
  for (const key of ["id", "createdAt", "updatedAt", "globalType"]) delete data[key];
  await payload.updateGlobal({ slug: "home-page", data, draft: false, depth: 0, context: scriptContext() });
  for (const write of faqWrites) await write();
}
process.exit(0);

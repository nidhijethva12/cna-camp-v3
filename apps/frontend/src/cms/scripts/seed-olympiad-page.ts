/**
 * Copies the static Olympiad page text (content/olympiad.ts and content/olympiad.gu.ts) into the
 * "Olympiad page" global: English first, then Gujarati onto the same rows. Overwrites what is saved.
 * `npx payload run src/cms/scripts/seed-olympiad-page.ts`
 */
import { getPayload } from "payload";
import { olympiad, type OlympiadContent } from "../../content/olympiad";
import { olympiadGu } from "../../content/olympiad.gu";
import config from "../../payload.config";
import type { OlympiadPage } from "../../payload-types";
import { scriptContext } from "../scriptContext";

type PageData = Omit<OlympiadPage, "id" | "updatedAt" | "createdAt">;

const toDoc = ({ groups, partners, scholarships, rules, keepReady, ...rest }: OlympiadContent): PageData => ({
  ...rest,
  groups: groups.map(({ id, ...g }) => ({ ...g, groupId: id })),
  partners: partners.map((p) => ({ ...p, points: p.points.map((text) => ({ text })) })),
  scholarships: scholarships.map((s) => ({ ...s, facts: s.facts.map(([label, value]) => ({ label, value })) })),
  rules: rules.map(([lead, rest]) => ({ lead, rest })),
  keepReady: keepReady.map((text) => ({ text })),
});

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Payload keeps a row's other languages only when the incoming row carries its id, so each
 * Gujarati row takes the id of the English row in the same place.
 */
function withRowIds(value: unknown, saved: unknown): unknown {
  if (Array.isArray(value)) {
    const rows: unknown[] = Array.isArray(saved) ? saved : [];
    return value.map((row, i) => {
      const merged = withRowIds(row, rows[i]);
      const savedRow = rows[i];
      return isObject(merged) && isObject(savedRow) && typeof savedRow.id === "string" ? { ...merged, id: savedRow.id } : merged;
    });
  }
  if (!isObject(value)) return value;
  const base = isObject(saved) ? saved : {};
  return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, withRowIds(v, base[key])]));
}

const payload = await getPayload({ config });
const slug = "olympiad-page";

const en = await payload.updateGlobal({ slug, locale: "en", data: toDoc(olympiad), depth: 0, context: scriptContext() });
await payload.updateGlobal({
  slug,
  locale: "gu",
  data: withRowIds(toDoc(olympiadGu), en) as PageData,
  depth: 0,
  context: scriptContext(),
});

console.log("Olympiad page saved in English and Gujarati.");
process.exit(0);

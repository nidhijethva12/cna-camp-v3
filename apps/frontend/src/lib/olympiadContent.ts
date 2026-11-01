import "server-only";
import { cache } from "react";
import { olympiad, type OlympiadContent } from "@/content/olympiad";
import { olympiadGu } from "@/content/olympiad.gu";
import { getCms } from "@/lib/payload";
import type { OlympiadPage } from "@/payload-types";

type Maybe<T> = T | null | undefined;

/** The saved global as it may come back at runtime: never saved, or saved with gaps. */
type Loose<T> = T extends (infer U)[] ? Loose<U>[] : T extends object ? { [K in keyof T]?: Maybe<Loose<T[K]>> } : T;

type Ui = OlympiadContent["ui"];
type SectionText = Ui["sections"]["notices"];

const str = (value: Maybe<string>, fallback = "") => (value?.trim() ? value : fallback);
const opt = (value: Maybe<string>) => value?.trim() || undefined;

/** Every text of a flat group, each one falling back on its own. */
function strings<T extends Record<string, string>>(value: Maybe<Partial<Record<keyof T, Maybe<string>>>>, fallback: T): T {
  const out = { ...fallback };
  for (const key of Object.keys(fallback) as (keyof T)[]) out[key] = str(value?.[key], fallback[key]) as T[keyof T];
  return out;
}

/** The saved rows when there are any, each filled in from the static row in the same place; otherwise the static list. */
function list<D, T>(rows: Maybe<Maybe<D>[]>, fallback: T[], map: (row: D, fb: T | undefined) => T): T[] {
  const saved = (rows ?? []).filter((row): row is D => row != null);
  return saved.length ? saved.map((row, i) => map(row, fallback[i])) : fallback;
}

/** Optional texts are trusted once the group itself has been filled in, so an editor can clear them. */
function section(value: Maybe<Loose<SectionText>>, fb: SectionText): SectionText {
  return { eyebrow: str(value?.eyebrow, fb.eyebrow), title: str(value?.title, fb.title), lead: value?.title ? opt(value.lead) : fb.lead };
}

function toUi(ui: Maybe<Loose<OlympiadPage["ui"]>>, fb: Ui): Ui {
  const s = ui?.sections;
  return {
    language: str(ui?.language, fb.language),
    bar: strings(ui?.bar, fb.bar),
    contactUs: str(ui?.contactUs, fb.contactUs),
    seeGroups: str(ui?.seeGroups, fb.seeGroups),
    scholarshipLine: strings(ui?.scholarshipLine, fb.scholarshipLine),
    heroBadge: strings(ui?.heroBadge, fb.heroBadge),
    joint: strings(ui?.joint, fb.joint),
    nav: strings(ui?.nav, fb.nav),
    sections: {
      notices: section(s?.notices, fb.sections.notices),
      how: section(s?.how, fb.sections.how),
      groups: section(s?.groups, fb.sections.groups),
      partners: section(s?.partners, fb.sections.partners),
      scholarships: section(s?.scholarships, fb.sections.scholarships),
      prizes: section(s?.prizes, fb.sections.prizes),
      rules: section(s?.rules, fb.sections.rules),
      faq: section(s?.faq, fb.sections.faq),
    },
    noticeBoard: strings(ui?.noticeBoard, fb.noticeBoard),
    keyDates: str(ui?.keyDates, fb.keyDates),
    glanceLabel: str(ui?.glanceLabel, fb.glanceLabel),
    register: strings(ui?.register, fb.register),
    help: strings(ui?.help, fb.help),
    picker: strings(ui?.picker, fb.picker),
  };
}

function toOlympiad(doc: Loose<OlympiadPage>, fb: OlympiadContent): OlympiadContent {
  return {
    name: str(doc.name, fb.name),
    eyebrow: str(doc.eyebrow, fb.eyebrow),
    intro: str(doc.intro, fb.intro),
    opensOn: str(doc.opensOn, fb.opensOn),
    motto: str(doc.motto, fb.motto),
    meta: strings(doc.meta, fb.meta),
    notice: strings(doc.notice, fb.notice),
    dates: list(doc.dates, fb.dates, (d, f) => ({
      when: str(d.when, f?.when),
      title: str(d.title, f?.title),
      note: opt(d.note),
      key: Boolean(d.key),
    })),
    steps: list(doc.steps, fb.steps, (s, f) => ({ title: str(s.title, f?.title), text: str(s.text, f?.text), when: str(s.when, f?.when) })),
    glance: list(doc.glance, fb.glance, (g, f) => ({
      icon: g.icon ?? f?.icon ?? "star",
      value: str(g.value, f?.value),
      label: str(g.label, f?.label),
    })),
    groups: list(doc.groups, fb.groups, (g, f) => ({
      id: g.groupId ?? f?.id ?? "A",
      name: str(g.name, f?.name),
      short: str(g.short, f?.short),
      title: str(g.title, f?.title),
      who: str(g.who, f?.who),
      finder: str(g.finder, f?.finder),
      fees: list(g.fees, f?.fees ?? [], (x, xf) => ({ label: str(x.label, xf?.label), amount: str(x.amount, xf?.amount) })),
      feeSummary: str(g.feeSummary, f?.feeSummary),
      quiz: str(g.quiz, f?.quiz),
      prize: str(g.prize, f?.prize),
      journey: list(g.journey, f?.journey ?? [], (j, jf) => ({
        year: opt(j.year),
        title: str(j.title, jf?.title),
        note: opt(j.note),
        goal: Boolean(j.goal),
      })),
    })),
    partners: list(doc.partners, fb.partners, (p, f) => ({
      kind: p.kind ?? f?.kind ?? "school",
      icon: p.icon ?? f?.icon ?? "school",
      title: str(p.title, f?.title),
      cta: str(p.cta, f?.cta),
      who: str(p.who, f?.who),
      points: list(p.points, f?.points ?? [], (x, xf) => str(x.text, xf)),
    })),
    scholarships: list(doc.scholarships, fb.scholarships, (s, f) => ({
      img: str(s.img, f?.img),
      alt: str(s.alt, f?.alt),
      focus: str(s.focus, f?.focus),
      kicker: str(s.kicker, f?.kicker),
      name: str(s.name, f?.name),
      life: str(s.life, f?.life),
      quote: str(s.quote, f?.quote),
      award: str(s.award, f?.award),
      awardFor: str(s.awardFor, f?.awardFor),
      facts: list(s.facts, f?.facts ?? [], (x, xf): [string, string] => [str(x.label, xf?.[0]), str(x.value, xf?.[1])]),
      pdf: strings(s.pdf, f?.pdf ?? { label: "", href: "" }),
    })),
    prizes: list(doc.prizes, fb.prizes, (p, f) => ({
      img: str(p.img, f?.img),
      alt: str(p.alt, f?.alt),
      groups: str(p.groups, f?.groups),
      title: str(p.title, f?.title),
      text: str(p.text, f?.text),
      place: str(p.place, f?.place),
      meta: str(p.meta, f?.meta),
      link: p.link?.href?.trim() ? { label: str(p.link.label, f?.link?.label), href: p.link.href } : undefined,
    })),
    rules: list(doc.rules, fb.rules, (r, f): [string, string] => [str(r.lead, f?.[0]), str(r.rest, f?.[1])]),
    keepReady: list(doc.keepReady, fb.keepReady, (x, f) => str(x.text, f)),
    faqs: list(doc.faqs, fb.faqs, (q, f) => ({ question: str(q.question, f?.question), answer: str(q.answer, f?.answer) })),
    remindOptions: list(doc.remindOptions, fb.remindOptions, (o, f) => ({ value: str(o.value, f?.value), label: str(o.label, f?.label) })),
    ui: toUi(doc.ui, fb.ui),
  };
}

/** Olympiad page text in one language: the admin's copy, with the static copy filling anything left empty. */
export const getOlympiadContent = cache(async (locale: "en" | "gu"): Promise<OlympiadContent> => {
  const payload = await getCms();
  const doc = await payload.findGlobal({ slug: "olympiad-page", locale, fallbackLocale: "en", depth: 0 });
  return toOlympiad(doc, locale === "gu" ? olympiadGu : olympiad);
});

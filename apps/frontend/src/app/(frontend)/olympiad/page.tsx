import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GroupFinder } from "@/components/olympiad/GroupFinder";
import { Photo } from "@/components/media/Photo";
import { HeroCarousel } from "@/components/olympiad/HeroCarousel";
import { NoticeBoard } from "@/components/olympiad/NoticeBoard";
import { CountUp } from "@/components/ui/CountUp";
import { FaqList } from "@/components/ui/FaqList";
import { FeatureIcon } from "@/components/ui/FeatureIcon";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle,
  Clock,
  Leaf,
  MapPin,
  SealCheck,
  Star,
  Trophy,
  Warning,
  WarningCircle,
} from "@/components/ui/icons";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionNav } from "@/components/ui/SectionNav";
import { olympiad as o } from "@/content/olympiad";
import { site } from "@/content/site";
import { getNotices, getSiteSettings } from "@/lib/content";
import { registrationStatus } from "@/lib/olympiad";

// Registration status depends on today's date.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Adventure Olympiad: Eco-STEM Quiz & Manali Camp | CNA Camp" },
  description:
    "Eco-STEM online quiz for students from Std 4 to college across Gujarat. 100 MCQs, 5 rounds, scholarships up to 100% on the ₹18,000 Manali camp. Fees from ₹90.",
  openGraph: {
    title: "Take the quiz. Win a camp in the Himalaya.",
    description: "An Eco-STEM quiz for Gujarat students from Std 4 to college. Top scorers go to Manali on up to 100% scholarship.",
  },
  alternates: { canonical: "/olympiad" },
};

const jumpLinks = [
  ["dates", "Dates & notices"],
  ["groups", "Groups"],
  ["finder", "Which group am I?"],
  ["how", "How it works"],
  ["quiz", "Quiz"],
  ["scholarships", "Scholarships"],
  ["included", "Manali camp"],
  ["rules", "Rules"],
  ["faq", "FAQs"],
] as const;

const statusText = {
  soon: "Registration opens 2 April 2026",
  open: "Registration open · closes 20 June 2026",
  closed: "Registration closed on 20 June 2026 · quiz rounds in progress",
};

const EXAM_FORM_LABEL = "Click here to fill the form";

/** Opens the exam form once its link is set in content/olympiad.ts (examFormUrl). */
function ExamFormButton({ className = "" }: { className?: string }) {
  if (o.examFormUrl) {
    return (
      <a href={o.examFormUrl} target="_blank" rel="noopener" className={`btn btn-primary ${className}`}>
        {EXAM_FORM_LABEL} <ArrowRight />
      </a>
    );
  }
  return (
    <button type="button" className={`btn btn-primary cursor-default ${className}`}>
      {EXAM_FORM_LABEL} <ArrowRight />
    </button>
  );
}

export default async function OlympiadPage() {
  const [contact, notices] = await Promise.all([getSiteSettings(), getNotices()]);
  const status = registrationStatus();
  const pdfs = { lavkumarPdf: o.lavkumarPdf, ketankumarPdf: o.ketankumarPdf } as const;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-dark text-light">
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-dark via-dark to-dark-soft" />
        <div className="wrap grid gap-8 py-10 sm:py-14 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:py-14">
          <HeroCarousel slides={o.heroSlides} />

          <div className="flex flex-col justify-center">
            <p className="inline-flex items-center gap-2 self-start rounded-tag bg-secondary px-3 py-1.5 text-[13.5px] font-semibold text-dark">
              <Star className="text-[13px]" />
              {o.tagline}
            </p>
            <h1 className="h-page mt-4">{o.name}</h1>
            <p className="mt-2 text-[15px] font-semibold text-secondary">An Eco-STEM online quiz · Mountain · Desert · Marine</p>
            <p className="mt-4 text-[16px] leading-relaxed text-light/85 sm:text-[17px]">
              A quiz for students from Std 4 to college across Gujarat. Top scorers win up to{" "}
              <strong className="text-light">100% scholarship</strong> for our Manali camp.
            </p>
            <p
              className={`mt-5 inline-flex items-center gap-2 self-start rounded-full bg-light/10 px-3.5 py-1.5 text-[14px] font-semibold ${status === "open" ? "text-live-light" : "text-light/90"}`}
            >
              <span className={`h-2 w-2 rounded-full ${status === "open" ? "bg-live" : "bg-secondary"}`} />
              {statusText[status]}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ExamFormButton />
              <a href={o.rulesPdf} target="_blank" rel="noopener" className="btn btn-outline-light">
                Rules &amp; regulations (PDF)
              </a>
            </div>
            <a
              href="#how"
              className="mt-4 inline-flex items-center gap-1.5 self-start text-[15px] font-semibold text-light/80 hover:text-light"
            >
              How it works <ArrowDown />
            </a>
            <p className="mt-5 text-[13.5px] text-light/60">
              Follows the Government of Gujarat guidelines for environment education trips.
            </p>
          </div>
        </div>

        <div className="wrap pb-8 sm:pb-10">
          <dl className="rail rail-stats grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {o.stats.map(([n, label]) => (
              <div key={label} className="rounded-card border border-light/10 bg-light/5 p-4 sm:p-5">
                <dt className="text-[14px] font-medium text-light/70">{label}</dt>
                <dd>
                  <CountUp value={n} className="display mt-1 text-[30px] whitespace-nowrap text-secondary sm:text-[38px]" />
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-col gap-4 border-t border-light/10 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
            <p className="text-[14px] font-semibold tracking-wide text-light/70 uppercase">A joint initiative of</p>
            {[
              { logo: site.trust.logo, name: site.trust.name, line: `Rajkot · Reg. ${site.trust.registration}` },
              { logo: "/img/logo.png", name: site.legalName, line: "Rajkot · since 1997" },
            ].map((org) => (
              <div key={org.name} className="flex items-center gap-3">
                <Image
                  src={org.logo}
                  alt={`${org.name} logo`}
                  width={52}
                  height={52}
                  className="h-13 w-13 shrink-0 rounded-full bg-light"
                />
                <div>
                  <p className="leading-tight font-bold text-light">{org.name}</p>
                  <p className="text-[14px] text-light/65">{org.line}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionNav links={jumpLinks} />

      <section id="dates" className="wrap mt-12 scroll-mt-32 sm:mt-16">
        <SectionHeader eyebrow="Key dates & notices" title="Mark your calendar" />
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <ol className="grid gap-3">
            {o.dates.map((d, i) => (
              <li key={d.label} className="flex items-center gap-4 rounded-card border border-line bg-light p-4">
                <FeatureIcon name={d.icon} tone={i === o.dates.length - 1 ? "accent" : "light"} />
                <div>
                  <p className="text-[14px] font-medium text-muted">{d.label}</p>
                  <p className="text-[17px] leading-snug font-bold">{d.value}</p>
                </div>
              </li>
            ))}
          </ol>
          <NoticeBoard notices={notices} />
        </div>
      </section>

      <section className="mt-16 bg-soft py-14 sm:mt-24 sm:py-20">
        <div className="wrap grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <SectionHeader eyebrow="About the Olympiad" title="A quiz that ends on a mountain" />
            <div className="-mt-4 space-y-4 text-[17px] leading-relaxed text-muted">
              {o.about.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <div className="rail grid gap-4 sm:grid-cols-2">
            {o.pillars.map(([icon, title, text]) => (
              <div key={title} className="rounded-card border border-line bg-light p-5">
                <FeatureIcon name={icon} />
                <h3 className="mt-4 text-[19px] leading-normal">{title}</h3>
                <p className="mt-1 text-[15px] text-muted">{text}</p>
              </div>
            ))}
            <div className="relative overflow-hidden rounded-card bg-dark p-5 text-light sm:col-span-2">
              <p className="text-[13.5px] font-medium text-secondary">The prize</p>
              <p className="display mt-1 text-[30px]">Astro Adventure Trekking Camp 2026-27</p>
              <p className="mt-1 text-light/70">Manali · Himachal Pradesh · ₹18,000 camp fee</p>
              <Link href="/trips/astro-adventure-manali" className="mt-4 inline-block font-semibold text-secondary underline">
                See the camp <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="groups" className="wrap mt-16 scroll-mt-28 sm:mt-24">
        <SectionHeader
          eyebrow="Age groups & fees"
          title="Choose your group"
          intro="Pick the group that matches your age and the class you study in. Choose carefully: a wrong group means automatic disqualification, and the fee is not refunded."
        />
        <div className="rail grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {o.groups.map((g) => (
            <article
              key={g.g}
              className="flex flex-col gap-4 rounded-card border border-line bg-light p-5 transition hover:border-dark sm:row-span-4 sm:grid sm:grid-rows-subgrid sm:gap-4 sm:p-6"
            >
              <div className="flex items-center gap-3.5">
                <span className="display flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-dark text-[32px] text-secondary">
                  {g.g}
                </span>
                <div>
                  <p className="text-[13px] font-semibold tracking-wide text-muted uppercase">Group {g.g}</p>
                  <p className="text-[17px] font-bold">{g.age}</p>
                </div>
              </div>
              <h3 className="border-t border-line pt-4 text-[17px] leading-snug">{g.std}</h3>
              <p className="text-[15px] text-muted">
                <span className="font-semibold text-dark">Quiz: </span>
                {g.g === "D" ? g.syllabus : `${g.syllabus}. Maths, science, social studies, GK and reasoning.`}
              </p>
              <dl className="grid content-start gap-2.5 self-stretch rounded-card bg-soft p-4">
                {g.fees.map((fee) => (
                  <div key={fee.amount} className="flex items-baseline gap-2.5">
                    <dt className="display shrink-0 text-[22px] leading-none text-primary">{fee.amount}</dt>
                    <dd className="text-[13.5px] leading-snug text-muted">{fee.note}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
        <GroupFinder />
      </section>

      <section id="how" className="wrap mt-16 scroll-mt-28 sm:mt-24">
        <SectionHeader eyebrow="How it works" title="From your phone to the Himalaya, in four steps" />
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {o.steps.map(([icon, title, text], i) => (
            <li key={title} className="relative flex flex-col rounded-card border border-line bg-light p-5 sm:p-6">
              {i < o.steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -right-[17px] z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-light text-[15px] text-primary lg:flex"
                >
                  <ArrowRight />
                </span>
              )}
              <div className="flex items-center justify-between">
                <span className="display flex h-12 w-12 items-center justify-center rounded-full bg-primary text-[20px] text-light">
                  {i + 1}
                </span>
                <FeatureIcon name={icon} />
              </div>
              <p className="mt-4 text-[13px] font-semibold tracking-wide text-muted uppercase">Step {i + 1}</p>
              <h3 className="mt-1 text-[19px] leading-snug">{title}</h3>
              <p className="mt-2 text-[15px] text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="quiz" className="mt-16 scroll-mt-28 bg-dark py-14 text-light sm:mt-24 sm:py-20">
        <div className="wrap">
          <SectionHeader
            dark
            eyebrow="Quiz details"
            title="The Eco-STEM online quiz"
            intro="Multiple choice questions in Gujarati or English, set at your group’s level."
          />
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <div>
              <div className="grid grid-cols-3 gap-px overflow-hidden rounded-card bg-light/10">
                {[
                  ["100", "Questions"],
                  ["100", "Total marks"],
                  ["60", "Minutes"],
                ].map(([n, label]) => (
                  <div key={label} className="bg-dark p-3 text-center sm:p-5">
                    <p className="display text-[34px] text-secondary sm:text-[44px]">{n}</p>
                    <p className="text-[13.5px] font-medium text-light/60">{label}</p>
                  </div>
                ))}
              </div>
              <dl className="mt-6 divide-y divide-light/10 border-y border-light/10">
                {o.quiz.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[88px_1fr] gap-3 py-2.5 sm:grid-cols-[110px_1fr] sm:gap-4 sm:py-3">
                    <dt className="text-[13.5px] font-medium text-secondary">{k}</dt>
                    <dd className="text-light/85">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <p className="eyebrow flex items-center gap-2 text-secondary!">
                <Trophy className="text-[16px] text-secondary" />
                Five rounds of selection
              </p>
              <ol className="mt-5 border-l-2 border-dashed border-light/20 pl-6">
                {o.rounds.map(([round, title, mode]) => (
                  <li key={round} className="relative pb-4 sm:pb-6">
                    <span className="absolute top-1.5 -left-[31px] h-3 w-3 rounded-full bg-primary" />
                    <p className="text-[13.5px] font-medium text-secondary">
                      {round} · {mode}
                    </p>
                    <p className="mt-1 text-[17px] font-semibold">{title}</p>
                  </li>
                ))}
                <li className="relative">
                  <span className="absolute top-0 -left-[35px] flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[11px] text-dark">
                    <Star />
                  </span>
                  <p className="text-[17px] font-bold text-secondary">{o.roundsResult}</p>
                </li>
              </ol>
              <p className="mt-6 rounded-card bg-light/5 p-4 text-[15px] text-light/75">
                <strong className="text-light">Note:</strong> {o.selectionNote}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="scholarships" className="wrap mt-16 scroll-mt-28 sm:mt-24">
        <SectionHeader
          eyebrow="Scholarships"
          title={
            <>
              Named after two lamps of nature <Leaf className="text-success" />
            </>
          }
          intro={`Your scholarship is a percentage of the ₹${o.campFee.toLocaleString("en-IN")} camp fee. You can apply for only one.`}
        />
        <div className="rail grid gap-6 lg:grid-cols-2">
          {o.scholarships.map((s) => (
            <article key={s.n} className="flex flex-col overflow-hidden rounded-card border border-line bg-light shadow-panel">
              <div className="h-28 bg-linear-to-r from-dark to-dark-soft sm:h-36" aria-hidden="true" />
              <div className="-mt-24 flex flex-1 flex-col items-center px-5 pb-6 text-center sm:-mt-32 sm:px-8 sm:pb-8">
                <div className="relative h-44 w-44 shrink-0 overflow-hidden rounded-full border-[6px] border-light bg-soft shadow-float sm:h-60 sm:w-60">
                  <Image
                    src={s.img}
                    alt={s.name.replace(" Adventure Scholarship", "")}
                    fill
                    sizes="240px"
                    className="object-cover object-top"
                  />
                </div>
                <span className="mt-4 rounded-full bg-primary-soft px-3 py-1 text-[13px] font-bold text-primary">Scholarship {s.n}</span>
                <h3 className="h-card mt-2 max-w-sm">{s.name}</h3>
                <p className="mt-2 max-w-md text-[15px] text-muted">{s.text}</p>
                <ul className="mt-5 w-full space-y-2 rounded-card bg-soft p-4 text-left text-[15px]">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <CheckCircle className="mt-[3px] shrink-0 text-[18px] text-success" />
                      {p}
                    </li>
                  ))}
                </ul>
                <a href={pdfs[s.pdf]} target="_blank" rel="noopener" className="btn btn-outline mt-auto self-center pt-3!">
                  {s.pdfLabel} (PDF) <ArrowRight />
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 flex gap-3 rounded-card border border-primary bg-primary-soft p-5 text-[15px]">
          <Warning className="mt-0.5 text-[20px] text-primary" />
          <span>
            <strong>Important:</strong> {o.scholarshipRule}
          </span>
        </p>
      </section>

      <section id="included" className="mt-16 scroll-mt-28 bg-soft py-14 sm:mt-24 sm:py-20">
        <div className="wrap">
          <SectionHeader
            eyebrow="What’s included"
            title="Ten days in Manali, all planned"
            intro="The Astro Adventure Trekking Camp runs from our own campus at Vashisht, Manali. Qualified instructors run every activity."
            action={{ label: "Camp page", href: "/trips/astro-adventure-manali" }}
          />
          <ul className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {o.campPhotos.map((p) => (
              <li key={p.img} className="group relative aspect-[4/3] overflow-hidden rounded-card bg-dark">
                <Photo
                  img={p.img}
                  alt={p.alt}
                  sizes="(min-width: 1024px) 290px, 50vw"
                  className="transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-b from-transparent to-dark/80 p-3 pt-10">
                  <p className="text-[13.5px] font-medium text-light">{p.caption}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="rail grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {o.included.map(([icon, title, text]) => (
              <div key={title} className="flex gap-4 rounded-card bg-light p-5">
                <FeatureIcon name={icon} />
                <div>
                  <h3 className="text-[18px] leading-normal">{title}</h3>
                  <p className="mt-1 text-[15px] text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="rules" className="wrap mt-16 scroll-mt-28 sm:mt-24">
        <SectionHeader
          eyebrow="Requirements"
          title="Eligibility & important rules"
          action={{ label: "Full rules (PDF)", href: o.rulesPdf }}
        />
        <div className="rail grid gap-6 lg:grid-cols-2">
          <div className="rounded-card border border-line p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-[22px] leading-normal">
              <SealCheck className="text-success" />
              Who can apply
            </h3>
            <ul className="mt-4 space-y-3">
              {o.eligibility.map((x) => (
                <li key={x} className="flex gap-3">
                  <CheckCircle className="mt-[3px] text-[18px] text-success" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card border border-primary p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-[22px] leading-normal">
              <Warning className="text-primary" />
              Please read carefully
            </h3>
            <ul className="mt-4 space-y-3">
              {o.rules.map((x) => (
                <li key={x} className="flex gap-3">
                  <WarningCircle className="mt-[3px] text-[18px] text-primary" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="faq" className="wrap mt-16 scroll-mt-28 sm:mt-24">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start lg:gap-12">
          <div>
            <p className="eyebrow">Questions?</p>
            <h2 className="h-section mt-3">Olympiad FAQs</h2>
            <FaqList
              className="mt-6"
              faqs={[
                ...o.faqs.map((f) => ({ question: f.q, answer: f.a })),
                {
                  question: "How do I contact the organisers?",
                  answer: `Call or WhatsApp ${contact.phone}, or email ${contact.email}. Office: ${contact.address.full}. Visits by appointment only, so please call first.`,
                },
              ]}
            />
          </div>

          <aside className="grid gap-5 lg:sticky lg:top-36">
            <div className="relative overflow-hidden rounded-card bg-dark p-6 text-light sm:p-8">
              <div className="absolute inset-0 opacity-25">
                <Photo img="cna/real/land-10" sizes="(min-width: 1024px) 480px, 100vw" />
              </div>
              <div className="relative">
                <p className="flex items-center gap-2 text-[14px] font-semibold text-secondary">
                  <Clock className="text-[15px]" />
                  {statusText[status]}
                </p>
                <h2 className="h-sub mt-3">Your seat in the Himalaya starts with one quiz</h2>
                <p className="mt-2 text-light/75">Score well, pick the right scholarship and we will see you at camp in Manali.</p>
                <dl className="mt-5 grid grid-cols-2 gap-2">
                  {o.fees.map((f) => (
                    <div key={f.who} className="rounded-card bg-light/10 p-3">
                      <dt className="display text-[22px] leading-none text-secondary">₹{f.fee}</dt>
                      <dd className="mt-1 text-[13px] leading-snug text-light/75">{f.who}</dd>
                    </div>
                  ))}
                </dl>
                <ExamFormButton className="mt-6 w-full" />
                <p className="mt-3 text-[13px] text-light/55">All disputes are subject to Rajkot jurisdiction.</p>
              </div>
            </div>

            <div id="districts" className="rounded-card border border-line p-6">
              <p className="eyebrow">Open for</p>
              <h2 className="h-sub mt-2">Every district of Gujarat</h2>
              <p className="mt-2 text-[15px] text-muted">
                Any eligible student or teacher in Gujarat can register, from a village school in Kutch to a college in Surat.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {o.regions.map((d) => (
                  <li key={d} className="flex items-center gap-1.5 rounded-full bg-soft px-3 py-1.5 text-[14px] font-semibold">
                    <MapPin className="text-primary" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

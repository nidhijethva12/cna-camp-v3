import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { UpdatesNudge } from "@/components/layout/UpdatesNudge";
import { GroupPicker } from "@/components/olympiad/GroupPicker";
import { FaqList } from "@/components/ui/FaqList";
import {
  ArrowRight,
  BookOpen,
  CalendarBlank,
  Check,
  FileText,
  GraduationCap,
  ListChecks,
  MapPin,
  Megaphone,
  Star,
  Timer,
  Translate,
  UserCircleCheck,
  WhatsApp,
} from "@/components/ui/icons";
import { SectionNav } from "@/components/ui/SectionNav";
import { olympiad as o } from "@/content/olympiad";
import { enquireHref, site } from "@/content/site";
import { getSiteSettings, whatsappLink } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Adventure Olympiad 2.0: Eco-STEM Quiz & Himalaya Scholarship | CNA Camp" },
  description:
    "An Eco-STEM quiz for Std 8 to 11, students above 18 and adults above 25. 4 groups, 5 rounds and a 60 to 100% scholarship on the ₹18,000 Manali camp. Registration opens 15 Nov 2026.",
  openGraph: {
    title: "Adventure Olympiad 2.0: a quiz that can take you to the Himalaya",
    description: "4 groups, 5 rounds and a 60 to 100% scholarship on the Manali camp. Registration opens 15 Nov 2026.",
  },
  alternates: { canonical: "/olympiad" },
};

const jumpLinks = [
  ["notices", "Notice board"],
  ["how", "How it works"],
  ["groups", "Groups"],
  ["partners", "Schools and teachers"],
  ["scholarships", "Scholarships"],
  ["prizes", "Prizes"],
  ["rules", "Rules"],
  ["faq", "FAQs"],
] as const;

const glanceIcons = { questions: ListChecks, timer: Timer, star: Star, language: Translate, book: BookOpen } as const;
const partnerIcons = { school: GraduationCap, ambassador: UserCircleCheck } as const;

const sectionY = "py-[clamp(56px,7vw,80px)]";

function SectionHead({ id, eyebrow, title, lead, dark }: { id: string; eyebrow: string; title: string; lead?: string; dark?: boolean }) {
  return (
    <>
      <p className={`eyebrow ${dark ? "text-secondary" : ""}`}>{eyebrow}</p>
      <h2 id={id} className="h-section mt-1.5">
        {title}
      </h2>
      {lead && <p className={`lead mt-3 max-w-[60ch] ${dark ? "text-light/75" : ""}`}>{lead}</p>}
    </>
  );
}

function Tick({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5 text-[15px]">
      <Check className="mt-1 text-[16px] text-success" />
      <span>{children}</span>
    </li>
  );
}

const OPENS_ON = "15 Nov 2026";

/** Until the Olympiad API is live, every sign-up button leads to the contact form. */
function ContactCta({ className, children = "Contact us" }: { className: string; children?: ReactNode }) {
  return (
    <Link href={enquireHref()} className={className}>
      {children}
    </Link>
  );
}

export default async function OlympiadPage() {
  const contact = await getSiteSettings();
  const helpHref = whatsappLink(contact.whatsappNumber, `Hi, I have a question about ${o.name}`);

  return (
    <>
      <div className="bg-primary text-[14.5px] text-light" role="status">
        <div className="wrap flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 py-2.25 text-center">
          <span>
            <b>Registration opens {OPENS_ON}.</b> All details are below.
          </span>
          <ContactCta className="cursor-pointer font-bold underline underline-offset-3" />
        </div>
      </div>

      <section aria-labelledby="olympiad-title" className="relative overflow-hidden border-b border-line bg-soft">
        <span aria-hidden="true" className="topo top-2.5 -right-15 h-[490px] w-[700px] bg-primary/10 [mask-size:700px_auto]" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-30 -right-30 h-130 w-130 rounded-full bg-radial from-secondary/28 to-secondary/0 to-65%"
        />
        <div className="wrap relative grid items-center gap-9 pt-12 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:pt-16 lg:pb-27">
          <div className="min-w-0">
            <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-line bg-light px-3 py-1.25 text-[14px]!">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-primary" />
              {o.eyebrow}
            </p>
            <h1 id="olympiad-title" className="mt-2.5 text-[34px] leading-[1.1] md:text-[54px]">
              {o.name}
            </h1>
            <p className="lead mt-3 max-w-[44ch]">{o.intro}</p>
            <p className="mt-5.5 inline-flex items-center gap-2.25 rounded-full border border-line bg-light px-3.5 py-1.75 text-[14px] font-semibold">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-secondary" />
              Registration opens {OPENS_ON}
            </p>
            <div className="mt-5.5 flex flex-wrap gap-3">
              <ContactCta className="btn btn-primary" />
              <Link href="#groups" className="btn btn-outline">
                See the groups
              </Link>
            </div>
            <p className="mt-5.5 flex flex-wrap gap-x-5.5 gap-y-1.5 text-[15px] text-muted">
              {o.facts.map(([value, label], i) => (
                <span key={label} className="flex gap-5.5">
                  {i > 0 && (
                    <span aria-hidden="true" className="text-line">
                      ·
                    </span>
                  )}
                  <span>
                    <b className="font-display text-dark tabular-nums">{value}</b> {label}
                  </span>
                </span>
              ))}
            </p>
          </div>

          <div aria-hidden="true" className="relative grid aspect-[5/4] grid-cols-[1.25fr_1fr] grid-rows-2 gap-3">
            {[
              { src: "/img/olympiad/group-deodar.webp", className: "row-span-2", sizes: "(min-width: 1024px) 340px, 55vw" },
              { src: "/img/olympiad/rock-climb.webp", className: "rotate-[1.5deg]", sizes: "(min-width: 1024px) 270px, 45vw" },
              { src: "/img/olympiad/river-bridge.webp", className: "-rotate-[1.5deg]", sizes: "(min-width: 1024px) 270px, 45vw" },
            ].map((img, i) => (
              <div
                key={img.src}
                className={`relative min-h-0 overflow-hidden rounded-card border-[5px] border-light shadow-card ${img.className}`}
              >
                <Image src={img.src} alt="" fill preload={i === 0} sizes={img.sizes} className="object-cover" />
              </div>
            ))}
            <p className="absolute -bottom-4.5 -left-3 rounded-card bg-secondary px-4 py-2.5 text-[13.5px] leading-snug text-dark shadow-card max-sm:left-2">
              <b className="block font-display text-[18px]">Manali</b>
              Astro Adventure Trekking Camp
            </p>
          </div>
        </div>
        <span aria-hidden="true" className="ridge -bottom-px bg-light" />
      </section>

      <div className="wrap mb-8">
        <div className="relative z-10 -mt-10 grid items-center gap-4 rounded-card border border-t-4 border-line border-t-secondary bg-light px-6 py-5 shadow-card lg:grid-cols-[auto_1fr_1fr_auto] lg:gap-7">
          <p className="font-display text-[15px] font-bold text-primary">A joint initiative of</p>
          {[
            { logo: site.trust.logo, name: site.trust.name, line: `Rajkot · Reg. ${site.trust.registration}` },
            { logo: "/img/logo.png", name: site.legalName, line: "Rajkot · camps and treks for 28+ years" },
          ].map((org) => (
            <div key={org.name} className="flex min-w-0 items-center gap-3.5">
              <Image src={org.logo} alt={`${org.name} logo`} width={56} height={56} className="h-14 w-14 shrink-0 rounded-full" />
              <div>
                <p className="font-display leading-tight font-bold">{org.name}</p>
                <p className="text-[14px] text-muted">{org.line}</p>
              </div>
            </div>
          ))}
          <p className="font-display text-[16px] font-extrabold whitespace-nowrap text-primary" lang="sa">
            {o.motto}
          </p>
        </div>
      </div>

      <SectionNav links={jumpLinks} />

      <section id="notices" aria-labelledby="h-notices" className={`relative ${sectionY}`}>
        <span aria-hidden="true" className="dot-field top-0 left-0 h-75 w-95" />
        <div className="wrap relative">
          <SectionHead
            id="h-notices"
            eyebrow="Notice board"
            title="Latest news and key dates"
            lead="Official notices, PDFs, quiz dates and results are posted here first. Please check before every round."
          />
          <div className="mt-9 grid gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-11">
            <div className="overflow-hidden rounded-card border border-t-4 border-line border-t-primary bg-light shadow-card">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5.5 py-4.5">
                <h3 className="flex items-center gap-3">
                  <span className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[20px] text-primary">
                    <Megaphone />
                  </span>
                  <span className="font-display text-[21px] font-extrabold">
                    Notice board
                    <small className="block font-sans text-[13.5px] font-normal text-muted">From the CNA team</small>
                  </span>
                </h3>
                <span className="inline-flex items-center gap-1.75 font-display text-[13px] font-bold text-success">
                  <span aria-hidden="true" className="live-dot h-2 w-2 rounded-full bg-success" />
                  Live
                </span>
              </div>
              <div className="flex items-center gap-3.5 px-5.5 py-5">
                <FileText className="text-[26px] text-primary" />
                <div className="min-w-0">
                  <span className="tag tag-solid mb-1.5 font-display font-bold">Official</span>
                  <p className="font-display text-[17px] leading-snug font-bold">{o.notice.title}</p>
                  <p className="text-[13.5px] text-muted">{o.notice.meta}</p>
                </div>
                <a
                  href={o.notice.href}
                  target="_blank"
                  rel="noopener"
                  className="ml-auto text-[14.5px] font-bold whitespace-nowrap text-primary hover:underline"
                >
                  View PDF<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </div>

            <div className="rounded-card border border-primary/20 bg-primary-soft p-6">
              <h3 className="mb-4 font-display text-[21px] font-extrabold">Key dates</h3>
              <ol>
                {o.dates.map((d) => (
                  <li
                    key={d.title}
                    className="relative grid grid-cols-[20px_1fr] gap-3.5 pb-5 before:absolute before:top-5.5 before:bottom-0 before:left-2.25 before:border-l-2 before:border-dashed before:border-primary/30 last:pb-0 last:before:hidden"
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 h-5 w-5 rounded-full border-[3px] border-primary ${d.key ? "bg-primary" : "bg-primary-soft"}`}
                    />
                    <span>
                      <span className="font-display text-[14px] font-bold text-primary tabular-nums">{d.when}</span>
                      <b className="block font-display">{d.title}</b>
                      {d.note && <span className="text-[14.5px] text-muted">{d.note}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section id="how" aria-labelledby="h-how" className={`relative overflow-hidden bg-soft ${sectionY}`}>
        <span aria-hidden="true" className="topo -bottom-10 -left-20 h-[532px] w-[760px] bg-primary/10 [mask-size:760px_auto]" />
        <div className="wrap relative">
          <SectionHead
            id="h-how"
            eyebrow="How it works"
            title="Five rounds, from quiz to camp"
            lead="Part of the Mountain, Desert and Marine project. It mixes science, nature and adventure."
          />
          <ol className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {o.steps.map((s, i) => (
              <li
                key={s.title}
                className="flex flex-col gap-2.5 rounded-card border border-t-4 border-line border-t-primary bg-light p-6 shadow-menu"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-[17px] font-extrabold text-light">
                  {i + 1}
                </span>
                <h3 className="font-display text-[19px]">{s.title}</h3>
                <p className="text-[15.5px] text-muted">{s.text}</p>
                <span className="mt-auto border-t border-dashed border-line pt-2 font-display text-[14px] font-bold">{s.when}</span>
              </li>
            ))}
          </ol>
          <ul
            aria-label="The quiz at a glance"
            className="mt-4 grid grid-cols-2 overflow-hidden rounded-card bg-dark text-light lg:grid-cols-5"
          >
            {o.glance.map((g) => {
              const Icon = glanceIcons[g.icon];
              return (
                <li
                  key={g.label}
                  className="flex min-w-0 items-center gap-3 border-r border-b border-light/12 px-5 py-4.5 last:col-span-2 lg:border-b-0 lg:last:col-span-1 lg:last:border-r-0"
                >
                  <Icon className="text-[30px] text-secondary" />
                  <span className="min-w-0">
                    <strong className="block font-display text-[18px] leading-tight font-extrabold">{g.value}</strong>
                    <span className="text-[13.5px] text-light/70">{g.label}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section id="groups" aria-labelledby="h-groups" className={sectionY}>
        <div className="wrap">
          <SectionHead
            id="h-groups"
            eyebrow="Groups and fees"
            title="Find the right group"
            lead="There are four groups. Each one has its own fee, journey and prize. Pick the class or age to see the right one."
          />
          <GroupPicker groups={o.groups} />
        </div>
      </section>

      <section id="partners" aria-labelledby="h-partners" className={`relative overflow-hidden bg-secondary/12 ${sectionY}`}>
        <svg aria-hidden="true" viewBox="0 0 200 200" className="pointer-events-none absolute top-7.5 -right-15 h-85 w-85 opacity-50">
          <g fill="none" strokeWidth="2" className="stroke-secondary">
            <circle cx="100" cy="100" r="90" />
            <circle cx="100" cy="100" r="64" strokeDasharray="4 6" />
            <path d="M100 6v188M6 100h188" />
          </g>
          <path d="M100 20l12 80-12 80-12-80z" opacity=".8" className="fill-secondary" />
          <path d="M100 20l12 80H88z" className="fill-primary" />
        </svg>
        <div className="wrap relative">
          <SectionHead
            id="h-partners"
            eyebrow="For schools and teachers"
            title="Bring your whole class, or spread the word"
            lead="Schools can register many students from one place. Teachers and other people can share a personal code and get recognised for every student who joins."
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {o.partners.map((p, i) => {
              const Icon = partnerIcons[p.icon];
              return (
                <article
                  key={p.title}
                  className={`flex flex-col gap-3.5 rounded-card border border-t-4 border-secondary/30 bg-light p-7 shadow-card ${i === 0 ? "border-t-primary" : "border-t-dark"}`}
                >
                  <span className="flex h-13 w-13 items-center justify-center rounded-full bg-primary-soft text-[26px] text-primary">
                    <Icon />
                  </span>
                  <h3 className="font-display text-[21px] font-extrabold">{p.title}</h3>
                  <p className="text-[15.5px] text-muted">{p.who}</p>
                  <ul className="grid gap-2">
                    {p.points.map((point) => (
                      <Tick key={point}>{point}</Tick>
                    ))}
                  </ul>
                  <ContactCta className={`btn mt-auto self-start ${i === 0 ? "btn-primary" : "btn-dark"}`}>
                    Contact us <ArrowRight />
                  </ContactCta>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="scholarships"
        aria-labelledby="h-scholarships"
        className="night-sky relative pt-[clamp(56px,7vw,80px)] pb-[clamp(90px,10vw,120px)] text-light"
      >
        <span aria-hidden="true" className="ridge ridge-alt -top-[45px] bg-dark" />
        <svg
          aria-hidden="true"
          viewBox="0 0 1200 110"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-27.5 w-full"
        >
          <path d="M0 110V70l120-40 90 30 140-55 110 50 80-20 150 45 120-60 110 40 90-15 190 45v20z" className="fill-dark-soft" />
          <path d="M330 15l20 18-12-3-8 9-9-8-11 4z M770 20l18 17-11-2-8 8-8-7-10 3z" className="fill-light/85" />
        </svg>
        <div className="wrap relative">
          <SectionHead
            id="h-scholarships"
            dark
            eyebrow="Scholarships"
            title="Named after two lamps of nature"
            lead="Both scholarships are on the ₹18,000 camp fee. They carry the names of two men who spent their lives taking young people into nature."
          />
          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            {o.scholarships.map((s) => (
              <article key={s.name} className="flex flex-col gap-4 rounded-card border border-light/8 bg-light/4 p-7 backdrop-blur-[2px]">
                <div className="flex items-center gap-5 max-[520px]:flex-col max-[520px]:items-start">
                  <div className="relative h-33 w-33 shrink-0 overflow-hidden rounded-full border-4 border-secondary bg-dark-soft max-[520px]:h-30 max-[520px]:w-30">
                    <Image src={s.img} alt={s.alt} fill sizes="132px" className={`object-cover ${s.focus}`} />
                  </div>
                  <div>
                    <p className="font-display text-[13px] font-bold text-secondary">{s.kicker}</p>
                    <h3 className="mt-1 font-display text-[21px] leading-tight">{s.name}</h3>
                    <p className="mt-1 text-[14px] text-light/65">{s.life}</p>
                  </div>
                </div>
                <p className="border-l-[3px] border-secondary pl-3.5 text-light/88 italic">{s.quote}</p>
                <p className="flex flex-wrap items-baseline gap-3.5 rounded-card bg-light/5 px-4 py-3.5">
                  <strong className="font-display text-[30px] leading-none font-extrabold text-secondary">{s.award}</strong>
                  <span className="text-[15px] text-light/80">{s.awardFor}</span>
                </p>
                <dl className="grid gap-2.5">
                  {s.facts.map(([k, v]) => (
                    <div
                      key={k}
                      className="grid grid-cols-[110px_1fr] gap-3 border-b border-light/8 pb-2.5 text-[14.5px] text-light/82 max-[520px]:grid-cols-1 max-[520px]:gap-0.5"
                    >
                      <dt className="font-display text-[13px] font-bold text-secondary">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <a href={s.pdf.href} target="_blank" rel="noopener" className="btn btn-outline-light mt-auto self-start">
                  {s.pdf.label}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="prizes" aria-labelledby="h-prizes" className={sectionY}>
        <div className="wrap">
          <SectionHead id="h-prizes" eyebrow="The prizes" title="Where the winners go" />
          <div className="relative isolate mt-9 grid gap-5 lg:grid-cols-2">
            <span aria-hidden="true" className="absolute -inset-x-6 top-[22%] -bottom-6 -z-10 rounded-card bg-primary-soft" />
            {o.prizes.map((p) => (
              <article key={p.title} className="flex flex-col overflow-hidden rounded-card border border-line bg-light shadow-card">
                <div className="relative aspect-video bg-soft">
                  <Image src={p.img} alt={p.alt} fill sizes="(min-width: 1024px) 590px, 100vw" className="object-cover" />
                  <span className="absolute top-3.5 left-3.5 rounded-tag bg-secondary px-2.25 py-1 font-display text-[12.5px] font-bold text-dark">
                    {p.groups}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 px-5.5 pt-5 pb-6">
                  <h3 className="font-display text-[19px]">{p.title}</h3>
                  <p className="text-[15.5px] text-muted">{p.text}</p>
                  <p className="mt-1 flex flex-wrap gap-x-4.5 gap-y-2 text-[14px] text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="text-[17px] text-primary" />
                      {p.place}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarBlank className="text-[17px] text-primary" />
                      {p.meta}
                    </span>
                  </p>
                  {p.link && (
                    <Link href={p.link.href} className="mt-auto pt-2 font-display font-bold text-primary hover:underline">
                      {p.link.label}
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="rules" aria-labelledby="h-rules" className={`relative overflow-hidden bg-soft ${sectionY}`}>
        <span aria-hidden="true" className="topo -top-15 -right-30 h-[448px] w-[640px] bg-primary/10 [mask-size:640px_auto]" />
        <div className="wrap relative">
          <SectionHead id="h-rules" eyebrow="Before you register" title="Rules in one place" />
          <ul className="mt-7.5 grid gap-x-12 rounded-card border border-line bg-light px-7 py-2 shadow-menu md:grid-cols-2">
            {o.rules.map(([lead, rest]) => (
              <li key={lead} className="flex gap-3 border-b border-line py-3.5">
                <Check className="mt-1 text-[18px] text-success" />
                <span>
                  <b className="font-display">{lead}</b>
                  {rest}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="register" aria-labelledby="h-register" className={sectionY}>
        <div className="wrap">
          <div className="relative isolate grid items-center gap-6.5 overflow-hidden rounded-card bg-primary p-[clamp(26px,4vw,44px)] text-light lg:grid-cols-[1.1fr_1fr]">
            <span
              aria-hidden="true"
              className="topo top-1/2 -right-20 -z-10 h-[434px] w-[620px] -translate-y-1/2 bg-light/14 [mask-size:620px_auto]"
            />
            <span aria-hidden="true" className="absolute -right-10 -bottom-10 -z-10 h-55 w-55 rounded-full bg-secondary/35" />
            <div>
              <p className="font-display text-[15px] font-bold text-secondary-light">Registration</p>
              <h2 id="h-register" className="mt-1.5 text-[26px] md:text-[34px]">
                Registration opens on {OPENS_ON}
              </h2>
              <p className="mt-2.5 text-light/90">Questions before then? Leave your details and the CNA team will get back to you.</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <ContactCta className="btn bg-light text-primary hover:bg-primary-soft" />
                <span className="text-[14.5px]">
                  Help: <b className="select-all">{contact.phone}</b>
                </span>
              </div>
            </div>
            <ol aria-label="Keep these ready" className="grid gap-2.5">
              {o.keepReady.map((item, i) => (
                <li key={item} className="flex items-center gap-3 rounded-card bg-light/12 px-4 py-3 text-[15px]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-light font-display font-extrabold text-primary">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Pulls the footer up against this section so the ridge meets it, cancelling the footer's top margin. */}
      <section id="faq" aria-labelledby="h-faq" className="relative -mb-24 bg-soft pt-[clamp(56px,7vw,80px)] pb-[clamp(80px,9vw,110px)]">
        <div className="wrap relative">
          <SectionHead id="h-faq" eyebrow="FAQs" title="Questions parents and participants ask" />
          <div className="mt-7.5 grid gap-9 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <FaqList faqs={o.faqs} />
            <aside id="help" aria-labelledby="h-help" className="flex flex-col gap-3 self-start rounded-card bg-dark p-6.5 text-light">
              <h3 id="h-help" className="font-display text-[21px] font-extrabold">
                Need help?
              </h3>
              <p className="text-[15.5px] text-light/75">Questions about groups, fees or the quiz? Message or call the CNA team.</p>
              <a href={helpHref} target="_blank" rel="noopener" className="btn self-start bg-whatsapp text-light hover:bg-whatsapp-dark">
                <WhatsApp className="text-[20px]" /> WhatsApp us
              </a>
              <p className="text-[15.5px] text-light/75">
                Call{" "}
                <a href={contact.phoneHref} className="font-display text-[19px] font-extrabold text-light">
                  {contact.phone}
                </a>
              </p>
              {contact.trustEmail && <p className="text-[13.5px] text-light/60">Trust email: {contact.trustEmail}</p>}
            </aside>
          </div>
        </div>
        <span aria-hidden="true" className="ridge ridge-alt bottom-0 bg-dark" />
      </section>

      <UpdatesNudge />
    </>
  );
}

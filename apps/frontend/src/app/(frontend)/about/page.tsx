import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHead } from "@/components/layout/PageHead";
import { Photo } from "@/components/media/Photo";
import { CountUp } from "@/components/ui/CountUp";
import { FaqList } from "@/components/ui/FaqList";
import { ArrowRight, CheckCircle } from "@/components/ui/icons";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { different, ecoPrinciples, founder, mission, safetyPoints, storyParagraphs, teamRoles } from "@/content/about";
import { site, yearsActive } from "@/content/site";
import { getFaqs, getTrips } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "About CNA: Rajkot's Nature & Adventure Club | CNA Camp" },
  description:
    "How one low-tide walk at Bet Dwarka became CNA: 1,000+ camps, a Manali campus, trust-backed and no-profit-no-loss. Meet our founder and safety team.",
  openGraph: {
    title: "About CNA: a nature club, not a tour company",
    description: "The story, the founder and the safety rules behind 1,000+ CNA camps.",
  },
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [trips, allFaqs] = await Promise.all([getTrips(), getFaqs()]);
  // The home page answers the general questions; this page keeps the booking and trip-planning ones.
  const faqs = allFaqs.filter((f) => !f.showOnHome);
  const stats = [
    [`${yearsActive()}+`, "Years of camps"],
    ["1,000+", "Camps and treks"],
    ["1,00,000+", "Campers"],
    [String(trips.length), "Treks, camps and nature trails"],
  ];
  const timeline = [
    ["1997", "First camp: a marine camp at Bet Dwarka, walking the reef at low tide."],
    ["2000", `${site.trust.name} registered (Reg. ${site.trust.registration}). CNA camps run with its backing.`],
    ["Today", `Our own campus in Manali, a partner campus at Bet Dwarka, and ${trips.length} treks, camps and nature trails.`],
    ["2026", "Adventure Olympiad 1.0, an Eco-STEM quiz with Himalayan camp scholarships."],
  ];

  return (
    <>
      <PageHead
        img="cna/real/campus-04"
        imgAlt="CNA’s Manali campus ground with snow peaks behind"
        eyebrow="About CNA"
        title="We take people outdoors. Then we teach them to look after it."
        text={`Climber Nature Adventure Club (CNA) is an eco-tourism and adventure club from Rajkot, backed by ${site.trust.name}.`}
      >
        <dl className="mt-9 grid grid-cols-2 gap-x-8 gap-y-6 sm:flex sm:flex-wrap sm:gap-x-12">
          {stats.map(([n, label]) => (
            <div key={label} className="flex flex-col-reverse">
              <dt className="mt-1 text-[14px] font-medium text-light/75">{label}</dt>
              <dd>
                <CountUp value={n} className="display text-[30px] leading-none whitespace-nowrap text-secondary sm:text-[38px]" />
              </dd>
            </div>
          ))}
        </dl>
      </PageHead>

      <section id="founder" className="scroll-mt-20 border-t border-light/10 bg-dark py-14 text-light sm:py-20">
        <div className="wrap grid gap-12 lg:grid-cols-[5fr_7fr] lg:items-start">
          <figure className="lg:sticky lg:top-28">
            {/* Landscape frame: the only photo of him is 720px wide, so it is shown near its real size. */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-card">
              <Photo
                img="cna/real/founder-01"
                alt="Dr. Ketankumar P. Trivedi at a frozen lake in the Himalaya"
                sizes="(min-width: 1024px) 480px, 100vw"
              />
            </div>
            <figcaption className="mt-5 border-l-4 border-secondary pl-4">
              <p className="text-[13.5px] font-medium text-light/70">In loving memory</p>
              <p className="display mt-1 text-[30px]">{founder.name}</p>
              <p className="font-mono text-[12px] text-secondary">{founder.years}</p>
            </figcaption>
          </figure>
          <div>
            <p className="eyebrow text-secondary!">Our founder</p>
            <h2 className="h-section mt-3">Late {founder.name}</h2>
            <blockquote className="mt-6 border-l-4 border-secondary pl-5 text-[22px] leading-snug text-light/90 italic">
              “{founder.quote}”
            </blockquote>
            <p className="mt-6 text-[17px] leading-relaxed text-light/75">{founder.intro}</p>
            <dl className="mt-10 divide-y divide-light/10 border-y border-light/10">
              {founder.facts.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-5 sm:grid-cols-[150px_1fr] sm:gap-6">
                  <dt className="text-[13.5px] font-medium text-secondary">{k}</dt>
                  <dd className="text-light/85">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 rounded-card bg-light/5 p-5 text-light/80">
              <span className="font-bold text-light">His legacy.</span> {founder.legacy}{" "}
              <Link href="/olympiad" className="font-bold text-secondary underline">
                About the Olympiad <ArrowRight />
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="wrap mt-20 grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="eyebrow">Our story</p>
          <h2 className="h-section mt-3">One low tide changed everything</h2>
          <div className="mt-5 space-y-4 text-[17px] leading-relaxed text-muted">
            {storyParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <ol className="mt-10 border-l-2 border-dashed border-line pl-6">
            {timeline.map(([year, text]) => (
              <li key={year} className="relative pb-6 last:pb-0">
                <span className="absolute top-1.5 -left-[31px] h-3 w-3 rounded-full bg-primary" />
                <p className="display text-[22px] text-primary">{year}</p>
                <p className="mt-1">{text}</p>
              </li>
            ))}
          </ol>
        </div>
        <figure>
          <div className="relative aspect-[4/5] overflow-hidden rounded-card">
            <Photo
              img="cna/real/river-01"
              alt="CNA campers crossing a river on a wooden bridge near Manali"
              sizes="(min-width: 1024px) 590px, 100vw"
            />
          </div>
          <figcaption className="mt-3 text-[13.5px] font-medium text-muted">A CNA group crossing a river, Manali</figcaption>
        </figure>
      </section>

      <section id="mission" className="mt-24 scroll-mt-28 bg-soft py-20">
        <div className="wrap">
          <SectionHeader eyebrow="Our mission · Eco-tourism" title={mission.line} intro={mission.text} />
          <ul className="grid gap-6 md:grid-cols-3">
            {mission.points.map(([title, text], i) => (
              <li key={title} className="rounded-card border border-line bg-light p-6">
                <p className="font-mono text-[12px] text-primary">0{i + 1}</p>
                <h3 className="mt-2 text-[21px] leading-normal">{title}</h3>
                <p className="mt-2 text-muted">{text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 grid gap-8 rounded-card bg-light p-6 sm:p-8 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="eyebrow">What eco-tourism means to us</p>
              <p className="display h-sub mt-2">Travel that protects nature and supports local people</p>
              <p className="mt-3 text-muted">
                That is how The International Ecotourism Society defines it, and it is how we run every camp.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {ecoPrinciples.map(([title, text]) => (
                <li key={title} className="flex gap-3">
                  <CheckCircle className="mt-[3px] text-[18px] text-primary" />
                  <span>
                    <strong>{title}.</strong> <span className="text-muted">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="different" className="wrap mt-24 scroll-mt-28">
        <SectionHeader eyebrow="Why CNA" title="Five things you will not find in a brochure" />
        <ol className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {different.map(([title, text], i) => (
            <li key={title} className="bg-light p-6 sm:p-8">
              <p className="display text-[44px] leading-none text-primary">0{i + 1}</p>
              <h3 className="mt-4 text-[21px] leading-normal">{title}</h3>
              <p className="mt-2 text-muted">{text}</p>
            </li>
          ))}
          <li className="flex flex-col justify-between bg-dark p-6 text-light sm:p-8">
            <p className="text-[21px] font-bold">Find your trip</p>
            <p className="mt-2 text-light/70">{trips.length} treks, camps and nature trails across Gujarat, India and beyond.</p>
            <Link href="/trips" className="btn btn-primary mt-6 self-start">
              See all trips <ArrowRight />
            </Link>
          </li>
        </ol>
      </section>

      <section className="wrap mt-20">
        <div className="flex flex-col gap-6 rounded-card border border-dark p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-5">
            <Image
              src={site.trust.logo}
              alt={`${site.trust.name} logo`}
              width={88}
              height={88}
              className="h-20 w-20 shrink-0 sm:h-22 sm:w-22"
            />
            <div>
              <p className="eyebrow">Backed by</p>
              <p className="mt-2 text-[22px] leading-tight font-bold sm:text-[24px]">{site.trust.name}</p>
              <p className="mt-1 text-muted">Registered charitable trust · Reg. {site.trust.registration} · Rajkot</p>
            </div>
          </div>
          <Link href="/contact" className="btn btn-outline shrink-0">
            Contact us <ArrowRight />
          </Link>
        </div>
      </section>

      <section id="safety" className="mt-24 scroll-mt-20 bg-dark py-20 text-light">
        <div className="wrap">
          <p className="eyebrow text-secondary!">Safety</p>
          <h2 className="h-section mt-3">How we keep trips safe</h2>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-light/70">
            The question every parent asks first. Here is our honest answer.
          </p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {safetyPoints.map(([title, text]) => (
              <li key={title} className="border-t border-light/15 pt-4">
                <h3 className="text-[19px] leading-normal">{title}</h3>
                <p className="mt-1 text-light/70">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap mt-20">
        <p className="eyebrow">Team &amp; trip leaders</p>
        <h2 className="h-section mt-3">The people who will hold your rope</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {teamRoles.map((role, i) => (
            <div key={i} className="rounded-card border border-line p-5">
              <div className="aspect-square rounded-tag bg-soft" />
              <p className="mt-4 font-bold">Name to add</p>
              <p className="text-[13.5px] font-medium text-muted">{role}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="wrap mt-20 max-w-3xl scroll-mt-28">
        <p className="eyebrow">FAQs</p>
        <h2 className="h-section mt-3">Questions people ask</h2>
        <FaqList faqs={faqs} className="mt-6" />
        <p className="mt-6 text-muted">
          Who can join, travelling alone, families and more are answered on our{" "}
          <Link href="/#faq-title" className="font-semibold text-primary underline">
            home page FAQs
          </Link>
          .
        </p>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { ExpeditionForm } from "@/components/expedition/ExpeditionForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqList } from "@/components/ui/FaqList";
import { ArrowRight, CalendarBlank, Clock, FileText, Mountains } from "@/components/ui/icons";
import { expedition } from "@/content/expedition";
import { site } from "@/content/site";
import { formatIstLong, formatIstShort, getExpeditionState } from "@/lib/expedition";
import { absoluteUrl } from "@/lib/seo";

// The badge and the form follow the server's clock, so the page is never served from a stale copy.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: expedition.seo.title },
  description: expedition.seo.description,
  keywords: expedition.seo.keywords,
  alternates: { canonical: expedition.path },
  openGraph: {
    title: expedition.seo.title,
    description: expedition.seo.description,
    url: expedition.path,
    images: [{ url: expedition.hero.src, width: 1440, height: 960, alt: expedition.hero.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: expedition.seo.title,
    description: expedition.seo.description,
    images: [expedition.hero.src],
  },
};

export default async function ExpeditionPage() {
  const state = await getExpeditionState();
  const opens = formatIstLong(state.opensAt);
  const closes = formatIstLong(state.closesAt);
  const payee = `${site.trust.name}, Rajkot`;
  const faqs = expedition.faqs(state.fee);
  const badge =
    state.phase === "before"
      ? `Registration opens ${opens}`
      : state.phase === "open"
        ? `Registration open till ${closes}`
        : "Registration closed";
  const facts = [
    { Icon: Mountains, label: "Expedition", value: "21 days, Gujarat to Ladakh" },
    { Icon: FileText, label: "Registration fee", value: `Rs ${state.fee} (compulsory)` },
    { Icon: CalendarBlank, label: "Registration", value: `${formatIstShort(state.opensAt)} to ${formatIstShort(state.closesAt)}` },
    { Icon: Clock, label: "Zoom meeting", value: expedition.meeting.short },
  ];
  const url = absoluteUrl(expedition.path);

  return (
    <>
      {/* The organiser's rule: no call and no message for details, so the site's WhatsApp shortcuts are off on this page. */}
      <style>{"[data-contact-shortcut]{display:none!important}"}</style>
      <section className="relative isolate overflow-hidden bg-dark text-light">
        <Image src={expedition.hero.src} alt={expedition.hero.alt} fill preload sizes="100vw" className="-z-10 object-cover opacity-35" />
        <div className="wrap py-[clamp(48px,7vw,84px)]">
          <p className="font-display text-[14px] font-bold tracking-[0.1em] text-secondary uppercase">{expedition.label}</p>
          <h1 className="mt-2 max-w-[20ch] text-[34px] leading-[1.1] md:text-[50px]">{expedition.name}</h1>
          <p className="mt-3 max-w-[56ch] text-[17px] text-light/85">{expedition.tagline}</p>
          <p className="mt-5 inline-block rounded-full bg-light/12 px-4 py-1.5 font-display text-[14.5px] font-bold">{badge}</p>
          {state.phase !== "closed" && (
            <div className="mt-6">
              <a href="#register" className="btn btn-primary">
                Register now · Rs {state.fee} <ArrowRight />
              </a>
            </div>
          )}
          <p className="mt-6 max-w-[62ch] text-[14px] text-light/75">{expedition.organiser}</p>
        </div>
      </section>

      <section className="border-b border-line bg-soft py-8">
        <dl className="wrap grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(({ Icon, label, value }) => (
            <div key={label} className="flex gap-3.5 rounded-card border border-line bg-light p-4.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-soft text-[21px] text-primary">
                <Icon />
              </span>
              <div>
                <dt className="text-[13.5px] text-muted">{label}</dt>
                <dd className="font-display text-[15.5px] leading-snug font-bold">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <section className="py-[clamp(48px,7vw,80px)]">
        <div className="wrap grid items-start gap-10 lg:grid-cols-[1fr_minmax(0,500px)] lg:gap-14">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="h-section mt-1.5">Four steps to the expedition</h2>
            <ol className="mt-7 grid gap-5">
              {expedition.steps.map(([title, text], i) => (
                <li key={title} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-[17px] font-extrabold text-primary">
                    {i + 1}
                  </span>
                  <span>
                    <b className="block font-display text-[17px]">{title}</b>
                    <span className="text-[15.5px] text-muted">{text(state.fee)}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-9 rounded-card border-[1.5px] border-primary bg-primary-soft p-6">
              <h2 className="font-display text-[19px] font-extrabold">Please read before you register</h2>
              <ul className="mt-3 grid list-disc gap-2 pl-5 text-[15.5px]">
                {expedition.pleaseRead(state.fee).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>

          <div id="register" className="scroll-mt-28">
            <ExpeditionForm state={state} opens={opens} closes={closes} payee={payee} />
          </div>
        </div>
      </section>

      <section className="border-t border-line py-[clamp(48px,7vw,80px)]">
        <div className="wrap max-w-[860px]">
          <p className="eyebrow">Questions</p>
          <h2 className="h-section mt-1.5">Frequently asked questions</h2>
          <FaqList faqs={faqs} className="mt-7" />
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: `${expedition.name}: information meeting`,
          description: expedition.seo.description,
          startDate: expedition.meeting.start,
          endDate: expedition.meeting.end,
          eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          image: absoluteUrl(expedition.hero.src),
          location: { "@type": "VirtualLocation", url },
          organizer: { "@id": absoluteUrl("/#organization") },
          offers: {
            "@type": "Offer",
            price: String(state.fee),
            priceCurrency: "INR",
            url,
            validFrom: state.opensAt,
            availability: state.phase === "closed" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
        }}
      />
    </>
  );
}

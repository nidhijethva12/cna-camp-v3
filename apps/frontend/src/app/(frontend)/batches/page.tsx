import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/layout/PageHead";
import { regions } from "@/content/site";
import { getSiteSettings, getUpcomingBatches } from "@/lib/content";
import { FaqList } from "@/components/ui/FaqList";
import { durationShort, tripPriceShort } from "@/lib/trips";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Upcoming Trek & Camp Batches 2026 | CNA Camp" },
  description:
    "Fixed-date treks and camps from Gujarat with seats left and prices. Join solo or with friends, hold your seat with 25% and pay the rest 3 days before.",
  openGraph: {
    title: "Upcoming batches: pick a date, pack your bag",
    description: "Fixed-date treks and camps you can join alone or with friends. Seats are limited.",
  },
  alternates: { canonical: "/batches" },
};

const LOW_SEATS = 3;

const parts = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return { day: d.getDate(), month: d.toLocaleDateString("en-IN", { month: "short" }) };
};
/** "17 to 18 Oct", or "29 Oct to 2 Nov" across months; no dashes, per the site style. */
const dateRange = (start: string, end: string) => {
  const a = parts(start);
  const b = parts(end);
  return a.month === b.month ? `${a.day} to ${b.day} ${b.month}` : `${a.day} ${a.month} to ${b.day} ${b.month}`;
};
const seatsLabel = (left: number) => (left <= 0 ? "Full" : left <= LOW_SEATS ? `Only ${left} seats left` : `${left} seats left`);

const faqs = [
  {
    question: "Can I join a batch alone?",
    answer: "Yes, if you are 18 or older. You meet the group at the start point and travel with our leaders all the way.",
  },
  {
    question: "How do I hold my seat?",
    answer: "Send the Book form or WhatsApp us. We confirm the seat, you pay 25%, and the balance is due 3 days before departure.",
  },
  {
    question: "What if the batch is full?",
    answer: "Ask for the waitlist. Seats do open up, and we also tell you the next date for the same trip.",
  },
];

export default async function BatchesPage() {
  const [batches, contact] = await Promise.all([getUpcomingBatches(), getSiteSettings()]);

  return (
    <>
      <PageHead
        eyebrow="Upcoming batches"
        title="Fixed departures. Join alone or with friends."
        text="Every row below is a real group leaving on a real date. Come solo and you will not stay solo for long. Bring your friends and you get the same plan, the same leaders and the same campfire."
      >
        <p className="mt-4 text-[13.5px] font-medium text-muted">Sample dates for the preview. Real dates come from the CNA team.</p>
      </PageHead>
      <section className="wrap mt-12">
        <div className="overflow-hidden rounded-card border border-line">
          <div className="hidden grid-cols-[120px_1.5fr_1fr_1fr_1fr_auto] gap-4 bg-dark px-5 py-3 text-[13.5px] font-medium text-light/70 md:grid">
            <span>Dates</span>
            <span>Trip</span>
            <span>Region &amp; days</span>
            <span>Seats</span>
            <span>Price</span>
            <span />
          </div>
          {batches.map((b, i) => (
            <div
              key={`${b.tripSlug}-${b.startDate}`}
              className={`grid gap-3 p-5 md:grid-cols-[120px_1.5fr_1fr_1fr_1fr_auto] md:items-center md:gap-4 ${i ? "border-t border-line" : ""}`}
            >
              <p className="font-mono text-[14px] font-medium">
                <time dateTime={b.startDate}>{dateRange(b.startDate, b.endDate)}</time>
              </p>
              <div>
                <Link href={`/trips/${b.trip.slug}`} className="text-[19px] font-bold hover:text-primary">
                  {b.trip.name}
                </Link>
                {b.note && <span className="tag ml-2 border-secondary bg-secondary text-dark">{b.note}</span>}
              </div>
              <p className="text-muted">
                {regions[b.trip.region].label} · {durationShort(b.trip)}
              </p>
              <p className={`text-[14px] font-medium ${b.seatsLeft <= LOW_SEATS ? "text-primary" : ""}`}>{seatsLabel(b.seatsLeft)}</p>
              <p className="display text-[17px]">{tripPriceShort(b.trip)}</p>
              <Link href={`/trips/${b.trip.slug}`} className="btn btn-primary py-3!" aria-label={`Book ${b.trip.name}`}>
                Book
              </Link>
            </div>
          ))}
          {batches.length === 0 && (
            <p className="p-8 text-center text-muted">No fixed batch this month yet. Ask us, a group date may already be planned.</p>
          )}
        </div>
        <p className="mt-4 text-[14px] text-muted">
          Seats are held once your 25% advance is received. Balance is due 3 days before departure.
        </p>
      </section>

      <section className="wrap mt-16">
        <div className="flex flex-col gap-6 rounded-card bg-dark p-6 text-light sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="h-sub">Your dates don&apos;t match ours?</h2>
            <p className="mt-2 text-light/75">
              Schools, colleges, offices and big friend groups can pick their own dates. Tell us the month and the group size and we plan
              around you.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3">
            <Link href="/group-trips#custom" className="btn btn-primary">
              Plan a group trip
            </Link>
            <a href={contact.whatsappHref} target="_blank" rel="noopener" className="text-[15px] font-semibold text-secondary underline">
              Or WhatsApp us your dates
            </a>
          </div>
        </div>
      </section>

      <section className="wrap mt-16 max-w-3xl">
        <p className="eyebrow">FAQs</p>
        <h2 className="h-section mt-3">Before you book</h2>
        <FaqList faqs={faqs} className="mt-6" />
      </section>
    </>
  );
}

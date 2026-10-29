import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/layout/PageHead";
import { BatchCard } from "@/components/trips/BatchCard";
import { getSiteSettings, getUpcomingBatches } from "@/lib/content";
import { FaqList } from "@/components/ui/FaqList";

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
        img="stock/home-banner-2"
        imgAlt="A group of trekkers on a green mountain trail below rocky peaks"
        eyebrow="Upcoming batches"
        title="Fixed departures. Join alone or with friends."
        text="Every card below is a real group leaving on a real date. Come solo and you will not stay solo for long. Bring your friends and you get the same plan, the same leaders and the same campfire."
      />
      <section className="wrap mt-12">
        {batches.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {batches.map((b) => (
              <li key={`${b.tripSlug}-${b.startDate}`}>
                <BatchCard batch={b} sizes="(min-width: 1024px) 390px, (min-width: 640px) 50vw, 100vw" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-card border border-line p-8 text-center text-muted">
            No fixed batch this month yet. Ask us, a group date may already be planned.
          </p>
        )}
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

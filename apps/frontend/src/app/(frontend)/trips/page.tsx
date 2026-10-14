import type { Metadata } from "next";
import { PageHead } from "@/components/layout/PageHead";
import { TripCard } from "@/components/trips/TripCard";
import { TripFilters } from "@/components/trips/TripFilters";
import { regionOrder, regions } from "@/content/site";
import Link from "next/link";
import { getSiteSettings, getTrips, whatsappLink } from "@/lib/content";
import { enquiryMonths } from "@/lib/enquiry";

export const metadata: Metadata = {
  title: { absolute: "Treks, Camps & Nature Trails in India | CNA Camp" },
  description:
    "Browse 35 treks, camps and nature trails across Gujarat, the Himalaya, the North-East and Nepal. Filter by month, type and level, then enquire in a minute.",
  openGraph: {
    title: "35 treks, camps and nature trails | CNA Camp",
    description: "From a day hike near Rajkot to the Everest trail. Filter by month, type and level.",
  },
  alternates: { canonical: "/trips" },
};

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

export default async function TripsPage() {
  const [trips, contact] = await Promise.all([getTrips(), getSiteSettings()]);

  return (
    <>
      <PageHead
        img="cna/real/trek-03"
        imgAlt="Campers walking in a line through a deodar forest near Manali"
        eyebrow="Treks, camps & nature trails"
        title="Find your trip"
        text={`${trips.length} ways to get outdoors, from a one-day hill walk near Rajkot to 18 days on the Everest trail. Pick a region, a month or a level, and the list does the rest.`}
      />
      <section className="wrap mt-8">
        <TripFilters
          regionOptions={regionOrder.map((r) => ({ value: r, label: regions[r].label }))}
          typeOptions={["Trek", "Camp", "Nature Trail"].map((t) => ({ value: slug(t), label: t }))}
          monthOptions={enquiryMonths.map((m) => ({ value: m.toLowerCase(), label: m }))}
          levelOptions={["Easy", "Moderate", "Challenging"].map((l) => ({ value: l.toLowerCase(), label: l }))}
          trips={trips.map((t) => ({
            slug: t.slug,
            region: t.region,
            type: slug(t.type),
            level: t.difficulty.toLowerCase(),
            months: t.months.map((m) => m.toLowerCase()),
            days: t.days,
            card: <TripCard trip={t} />,
          }))}
        />
      </section>

      <section className="wrap mt-16">
        <div className="flex flex-col gap-6 rounded-card bg-soft p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="h-sub">Can&apos;t decide?</h2>
            <p className="mt-2 text-muted">
              Tell us who is coming, how many days you have and the month. We will suggest two or three trips that fit, usually on WhatsApp
              within a day.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <a
              href={whatsappLink(contact.whatsappNumber, "Hi CNA, can you suggest a trip for us?")}
              target="_blank"
              rel="noopener"
              className="btn btn-primary"
            >
              WhatsApp us
            </a>
            <Link href="/group-trips#custom" className="btn btn-outline">
              Plan a group trip
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

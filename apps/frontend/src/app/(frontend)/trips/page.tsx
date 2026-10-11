import type { Metadata } from "next";
import { PageHead } from "@/components/layout/PageHead";
import { TripCard } from "@/components/trips/TripCard";
import { TripFilters } from "@/components/trips/TripFilters";
import { regionOrder, regions } from "@/content/site";
import { getTrips } from "@/lib/content";
import { enquiryMonths } from "@/lib/enquiry";

export const metadata: Metadata = {
  title: "All treks & camps",
  description: "35 treks, camps and nature trails across Gujarat, the Himalaya, North-East India and Nepal. Filter by region, type, month or level.",
  alternates: { canonical: "/trips" },
};

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

export default async function TripsPage() {
  const trips = await getTrips();

  return (
    <>
      <PageHead
        img="cna/real/trek-03"
        imgAlt="Campers walking in a line through a deodar forest near Manali"
        eyebrow="Treks & camps"
        title="Find your trip"
        text={`${trips.length} trips across Gujarat, the Himalaya, North-East and the rest of India. Filter by region, type, month or level.`}
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
    </>
  );
}

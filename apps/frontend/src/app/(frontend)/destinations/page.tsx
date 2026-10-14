import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/layout/PageHead";
import { Photo } from "@/components/media/Photo";
import { ArrowRight } from "@/components/ui/icons";
import { regionOrder, regions, tripsByRegionHref } from "@/content/site";
import { getHome, getTrips } from "@/lib/content";
import { durationShort, monthRange } from "@/lib/trips";
import type { RegionSlug } from "@/types/content";

const regionCopy: Record<RegionSlug, { line: string; bestFor: string }> = {
  gujarat: {
    line: "Coral reefs, lion forest, salt desert and the Dang hills. Most are 1 to 5 days from Rajkot.",
    bestFor: "Weekends, school groups and first trips",
  },
  "across-india": {
    line: "The Himalaya, the Sahyadri, the Satpura forests and the southern hills, from 3 days to 10.",
    bestFor: "Snow, long treks and holiday-break trips",
  },
  "north-east": { line: "Sikkim: monasteries, a glacial lake at 3,750 m and the Teesta river.", bestFor: "Spring and autumn" },
  "outside-india": {
    line: "Nepal: the Khumbu valley and the trail to Everest Base Camp.",
    bestFor: "Fit trekkers with high-altitude experience",
  },
};

const seasons = [
  ["Oct to Nov (Diwali)", "Sikkim, Kerala, Karnataka, the Gujarat coast"],
  ["Dec to Mar (winter)", "Kutch, Gir, Manali snow, Goa, Odisha"],
  ["Apr to Jun (summer)", "Manali camps, Himachal and Uttarakhand"],
  ["Jul to Sep (monsoon)", "Saputara, Lonavala, Panchgani, Pachmarhi, Ladakh"],
];

export const metadata: Metadata = {
  title: { absolute: "Trek & Camp Destinations in Gujarat & India | CNA Camp" },
  description:
    "Coral reefs, Gir lions, Kutch salt desert, Himalayan snow and Everest Base Camp. See every CNA destination by region and the best months to go for each.",
  openGraph: {
    title: "Where CNA goes: from Bet Dwarka to Everest Base Camp",
    description: "Gujarat, the Himalaya, the North-East and Nepal, with the right season for each.",
  },
  alternates: { canonical: "/destinations" },
};

export default async function DestinationsPage() {
  const [trips, home] = await Promise.all([getTrips(), getHome()]);
  const { regionImages } = home.destinations;

  return (
    <>
      <PageHead
        img="cna/real/land-10"
        imgAlt="Snow peaks above the green Manali valley in Himachal Pradesh"
        eyebrow="Destinations"
        title="Where we go"
        text="Low tide at Bet Dwarka. Lions at dusk in Gir. Snow at 3,000 m in Manali. We go where nature is at its best for that season, and we plan the trip around it, not the other way round."
      >
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Jump to a region">
          {regionOrder.map((r) => (
            <a
              key={r}
              href={`#${r}`}
              className="rounded-full border border-light/30 px-4 py-2 text-[14px] font-semibold text-light transition hover:bg-light hover:text-dark"
            >
              {regions[r].label}
            </a>
          ))}
        </nav>
      </PageHead>
      <section className="wrap mt-12 space-y-16">
        {regionOrder.map((r) => {
          const list = trips.filter((t) => t.region === r);
          return (
            <div key={r} id={r} className="grid scroll-mt-28 gap-8 lg:grid-cols-[420px_1fr]">
              <Link href={tripsByRegionHref(r)} className="relative block aspect-[4/3] overflow-hidden rounded-card">
                <Photo img={regionImages[r]} alt="" sizes="(min-width: 1024px) 420px, 100vw" />
                <span className="tag tag-solid absolute top-4 left-4">
                  {list.length} {list.length === 1 ? "trip" : "trips"}
                </span>
              </Link>
              <div>
                <h2 className="h-section">{regions[r].label}</h2>
                <p className="mt-2 text-muted">{regionCopy[r].line}</p>
                <p className="mt-2 text-[14px]">
                  <span className="font-semibold">Best for:</span> <span className="text-muted">{regionCopy[r].bestFor}</span>
                </p>
                <ul className="mt-6 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
                  {list.map((t) => (
                    <li key={t.slug} className="bg-light">
                      <Link href={`/trips/${t.slug}`} className="flex items-center justify-between gap-3 p-4 hover:bg-soft">
                        <span>
                          <span className="block font-bold">{t.name}</span>
                          <span className="text-[13.5px] font-medium text-muted">
                            {[t.type, durationShort(t), monthRange(t.months)].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                        <ArrowRight />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </section>

      <section className="wrap mt-20">
        <div className="rounded-card bg-soft p-6 sm:p-8">
          <h2 className="h-sub">Not sure where? Start with when.</h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {seasons.map(([when, where]) => (
              <div key={when} className="rounded-card bg-light p-5">
                <dt className="font-display font-bold text-primary">{when}</dt>
                <dd className="mt-1 text-[15px] text-muted">{where}</dd>
              </div>
            ))}
          </dl>
          <Link href="/trips" className="btn btn-dark mt-6">
            See trips by month <ArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}

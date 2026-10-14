import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/layout/PageHead";
import { Photo } from "@/components/media/Photo";
import { ArrowRight } from "@/components/ui/icons";
import { regionOrder, regions, tripsByRegionHref } from "@/content/site";
import { getHome, getTrips } from "@/lib/content";
import { durationShort } from "@/lib/trips";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Where CNA goes: the Gujarat coast and forests, the Himalaya and the rest of India, the North-East and Nepal.",
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
        text="Coast, forest, desert and high mountains: Gujarat, across India, the North-East and Nepal. We pick the right place for each season and each group."
      />
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
                <p className="mt-2 text-muted">{regions[r].blurb}</p>
                <ul className="mt-6 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
                  {list.map((t) => (
                    <li key={t.slug} className="bg-light">
                      <Link href={`/trips/${t.slug}`} className="flex items-center justify-between gap-3 p-4 hover:bg-soft">
                        <span>
                          <span className="block font-bold">{t.name}</span>
                          <span className="text-[13.5px] font-medium text-muted">
                            {t.type} · {durationShort(t)} · {t.months.slice(0, 3).join(" ")}
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
    </>
  );
}

import Link from "next/link";
import { BatchCard } from "@/components/trips/BatchCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { enquireHref } from "@/content/site";
import type { UpcomingBatch } from "@/lib/content";

export function UpcomingBatches({ batches }: { batches: UpcomingBatch[] }) {
  return (
    <section className="mt-16 bg-dark py-14 text-light sm:mt-24 sm:py-20" aria-labelledby="batches-title">
      <div className="wrap">
        <SectionHeader
          dark
          id="batches-title"
          eyebrow="Upcoming batches"
          title="Pick a date. Pack your bag."
          intro="Fixed departures you can join alone or with your gang. Seats are limited, and they do go."
          action={{ label: "See all batches", href: "/batches" }}
        />

        {batches.length === 0 ? (
          <p className="rounded-card border border-light/15 p-6 text-light/75">
            New dates are being planned.{" "}
            <Link href={enquireHref()} className="font-semibold text-secondary underline">
              Ask us
            </Link>{" "}
            about the next batch.
          </p>
        ) : (
          <ul className="rail grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {batches.map((b) => (
              <li key={`${b.tripSlug}-${b.startDate}`}>
                <BatchCard batch={b} sizes="(min-width: 1024px) 290px, (min-width: 640px) 50vw, 82vw" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

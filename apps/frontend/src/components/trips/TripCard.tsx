import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { ArrowRight } from "@/components/ui/icons";
import { MetaLine } from "@/components/ui/MetaLine";
import { regions } from "@/content/site";
import { durationShort, tripPrice } from "@/lib/trips";
import type { Trip } from "@/types/content";

export function TripCard({ trip, badge }: { trip: Trip; badge?: string }) {
  const href = `/trips/${trip.slug}`;
  const region = regions[trip.region].label;
  const priceOnRequest = trip.price === 18000;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-light transition hover:-translate-y-1 hover:shadow-card">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-soft" tabIndex={-1} aria-hidden="true">
        <Photo
          img={trip.img}
          alt={trip.name}
          label={region}
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="transition duration-500 group-hover:scale-[1.04]"
        />
        <span className="tag tag-solid absolute top-3 left-3">{trip.type}</span>
        {badge && <span className="tag absolute top-3 right-3 border-secondary bg-secondary text-dark">{badge}</span>}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {/* Fixed line counts keep every row aligned across a grid of cards. */}
        <p className="truncate text-[13.5px] font-medium text-muted">
          {region}
          {trip.state !== region && ` · ${trip.state}`}
        </p>
        <h3 className="h-card mt-2 line-clamp-2 min-h-[2lh]">
          <Link href={href} className="hover:text-primary">
            {trip.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 min-h-[2lh] text-[15px] leading-relaxed text-muted">{trip.summary}</p>
        <MetaLine items={[durationShort(trip), trip.altitude, trip.difficulty]} className="mt-4 text-[14px] text-dark/80" />
        <div className="mt-auto pt-5">
          <div className="trail-line" />
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[13.5px] font-medium text-muted">{trip.price && !priceOnRequest ? "From" : "Price"}</p>
            <p className="display text-[22px]">{priceOnRequest ? "On request" : tripPrice(trip)}</p>
          </div>
          <Link
            href={href}
            className="flex h-11 w-11 items-center justify-center rounded-card bg-dark text-light transition group-hover:bg-primary"
            aria-label={`View ${trip.name}`}
          >
            <ArrowRight className="text-[18px]" />
          </Link>
        </div>
      </div>
    </article>
  );
}

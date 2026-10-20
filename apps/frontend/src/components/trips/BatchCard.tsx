import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { Clock, MapPin } from "@/components/ui/icons";
import { regions } from "@/content/site";
import type { UpcomingBatch } from "@/lib/content";
import { dateRange, splitDate } from "@/lib/format";
import { durationShort } from "@/lib/trips";
import type { Difficulty } from "@/types/content";

const LOW_SEATS = 5;
const LEVEL: Record<Difficulty, number> = { Easy: 1, Moderate: 2, Challenging: 3 };

const seatsLabel = (left: number) => (left <= 0 ? "Full" : left <= LOW_SEATS ? `Only ${left} seats left` : `${left} seats left`);

/** One fixed-date departure: photo with the start date, then the trip, price and level. */
export function BatchCard({ batch, sizes }: { batch: UpcomingBatch; sizes: string }) {
  const { trip } = batch;
  const href = `/trips/${trip.slug}`;
  const { day, month } = splitDate(batch.startDate);
  const low = batch.seatsLeft <= LOW_SEATS;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-light text-dark shadow-panel transition duration-300 hover:-translate-y-1 hover:shadow-float">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-soft" tabIndex={-1} aria-hidden="true">
        <Photo img={trip.img} alt="" sizes={sizes} className="transition duration-700 group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-linear-to-b from-dark/35 via-transparent to-dark/45" />
        <time dateTime={batch.startDate} className="absolute top-3 left-3 rounded-tag bg-light px-3 py-1.5 text-center shadow-float">
          <span className="display block text-[22px] leading-none">{day}</span>
          <span className="mt-0.5 block text-[12px] font-bold tracking-[.08em] text-primary uppercase">{month}</span>
        </time>
        <span
          className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[13px] font-semibold ${low ? "bg-primary text-light" : "bg-dark/80 text-light"}`}
        >
          {seatsLabel(batch.seatsLeft)}
        </span>
        {batch.note && <span className="tag absolute bottom-3 left-3 border-secondary bg-secondary text-dark">{batch.note}</span>}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-line pb-3 text-[14px] font-medium text-muted">
          <span className="flex items-center gap-1.5">
            <Clock className="text-[16px] text-primary" />
            {durationShort(trip)} · {dateRange(batch.startDate, batch.endDate)}
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            <MapPin className="text-[16px] text-primary" />
            {regions[trip.region].label}
          </span>
        </div>

        <h3 className="h-card mt-4">
          <Link href={href} className="hover:text-primary">
            {trip.name}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[15px] text-muted">{trip.summary}</p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <div>
            <p className="text-[13px] font-semibold text-muted">Starting from</p>
            <p className="display text-[22px] leading-tight text-primary">
              {trip.price ? `₹${trip.price.toLocaleString("en-IN")}` : "On request"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-semibold text-muted">{trip.difficulty}</p>
            <span className="mt-1.5 flex justify-end gap-1" aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <span key={n} className={`h-1.5 w-5 rounded-full ${n <= LEVEL[trip.difficulty] ? "bg-primary" : "bg-line"}`} />
              ))}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link href={href} className="btn btn-outline py-2.5! text-[15px]">
            View trip
          </Link>
          <Link href={`${href}#enquire`} className="btn btn-primary py-2.5! text-[15px]" aria-label={`Book ${trip.name}`}>
            Book
          </Link>
        </div>
      </div>
    </article>
  );
}

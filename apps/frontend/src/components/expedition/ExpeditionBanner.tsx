import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { expedition } from "@/content/expedition";
import { formatIstShort, getExpeditionState } from "@/lib/expedition";

/**
 * The Sarasvati - Sindhu Darshan Yatra on the home page and the trips page: what it is, when
 * registration runs and the way to the registration page. Gone once registration has closed.
 */
export async function ExpeditionBanner({ className = "" }: { className?: string }) {
  const state = await getExpeditionState();
  if (state.phase === "closed") return null;
  // These pages are rebuilt only every hour, so the line gives both dates instead of "opens" or "open now".
  const when = `Registration: ${formatIstShort(state.opensAt)} to ${formatIstShort(state.closesAt)}`;

  return (
    <section className={`wrap ${className}`} aria-labelledby="expedition-banner-title">
      <div className="relative isolate overflow-hidden rounded-card bg-dark text-light">
        <Image src={expedition.hero.src} alt="" fill sizes="(min-width: 1280px) 1200px, 100vw" className="-z-10 object-cover opacity-35" />
        <div className="flex flex-col gap-6 p-6 sm:p-9 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="font-display text-[13.5px] font-bold tracking-[0.1em] text-secondary uppercase">{expedition.label}</p>
            <h2 id="expedition-banner-title" className="h-sub mt-2">
              {expedition.name}
            </h2>
            <p className="mt-2 text-light/85">{expedition.tagline}</p>
            <p className="mt-4 inline-block rounded-full bg-light/12 px-4 py-1.5 font-display text-[14px] font-bold">{when}</p>
          </div>
          <Link href={expedition.path} className="btn btn-primary shrink-0 self-start md:self-center">
            Register · Rs {state.fee} <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

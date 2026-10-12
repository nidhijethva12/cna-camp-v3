import Link from "next/link";
import { ArrowRight, Star } from "@/components/ui/icons";
import { FOUNDED_YEAR, site } from "@/content/site";
import type { HomeContent } from "@/lib/content";
import { HeroSlides } from "./HeroSlides";

export function Hero({ content }: { content: HomeContent["hero"] }) {
  const lines = content.headingLines;
  return (
    <section className="relative isolate overflow-hidden bg-dark text-light" aria-labelledby="hero-title">
      <HeroSlides images={content.images}>
        <p className="font-mono text-[12px] uppercase tracking-[.14em] text-light/80">
          {site.coordinates} — Rajkot · Est. {FOUNDED_YEAR}
        </p>
        <h1 id="hero-title" className="h-hero mt-5 max-w-4xl">
          {lines.map((line, i) =>
            i === lines.length - 1 ? (
              <span key={i} className="text-secondary">
                {line}
              </span>
            ) : (
              <span key={i}>
                {line}
                <br />
              </span>
            ),
          )}
        </h1>
        <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-light/85">{content.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/trips" className="btn btn-primary">
            Explore trips <ArrowRight />
          </Link>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px] uppercase tracking-[.1em] text-light/75">
          {content.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2">
              <Star className="text-[13px] text-secondary" />
              {h}
            </li>
          ))}
        </ul>
      </HeroSlides>
    </section>
  );
}

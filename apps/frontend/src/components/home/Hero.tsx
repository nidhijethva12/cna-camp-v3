import Link from "next/link";
import { ArrowRight, ShieldCheck, Star, Tent, UsersThree } from "@/components/ui/icons";
import { FOUNDED_YEAR, site } from "@/content/site";
import type { HomeContent } from "@/lib/content";
import { HeroSlides } from "./HeroSlides";

function HighlightIcon({ text }: { text: string }) {
  const className = "text-[18px]";
  if (/camper|student|participant/i.test(text)) return <UsersThree className={className} />;
  if (/camp|trek|trip/i.test(text)) return <Tent className={className} />;
  if (/trust|safe|certif|registered/i.test(text)) return <ShieldCheck className={className} />;
  return <Star className={className} />;
}

function Highlight({ text }: { text: string }) {
  const [, figure, rest] = text.match(/^([\d,.]+\+?)\s+(.*)$/) ?? [];
  return (
    <li className="flex items-center gap-3 rounded-full border border-light/15 bg-dark/45 py-2 pr-5 pl-2 backdrop-blur-sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-dark">
        <HighlightIcon text={text} />
      </span>
      {figure ? (
        <span className="flex items-baseline gap-2">
          <span className="font-display text-[20px] leading-none font-bold text-light">{figure}</span>
          <span className="font-mono text-[11.5px] tracking-[.12em] text-light/80 uppercase">{rest}</span>
        </span>
      ) : (
        <span className="font-mono text-[11.5px] tracking-[.12em] text-light/90 uppercase">{text}</span>
      )}
    </li>
  );
}

export function Hero({ content }: { content: HomeContent["hero"] }) {
  const lines = content.headingLines;
  return (
    <section className="relative isolate overflow-hidden bg-dark text-light" aria-labelledby="hero-title">
      <HeroSlides images={content.images}>
        <p className="font-mono text-[12px] tracking-[.14em] text-light/80 uppercase">
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
        <ul className="mt-8 flex flex-wrap gap-3">
          {content.highlights.map((h) => (
            <Highlight key={h} text={h} />
          ))}
        </ul>
      </HeroSlides>
    </section>
  );
}

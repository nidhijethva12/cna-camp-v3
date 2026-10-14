import Link from "next/link";
import { ArrowRight, ShieldCheck, Star, Tent, UsersThree } from "@/components/ui/icons";
import { site } from "@/content/site";
import type { HomeContent } from "@/lib/content";
import { HeroSlides } from "./HeroSlides";

function HighlightIcon({ text }: { text: string }) {
  const className = "text-[24px]";
  if (/camper|student|participant/i.test(text)) return <UsersThree className={className} />;
  if (/camp|trek|trip/i.test(text)) return <Tent className={className} />;
  if (/trust|safe|certif|registered/i.test(text)) return <ShieldCheck className={className} />;
  return <Star className={className} />;
}

const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "1,00,000+ campers" → a big figure over a small label; text without a figure gets the same two-line rhythm. */
function Highlight({ text }: { text: string }) {
  const [, figure, rest] = text.match(/^([\d,.]+\+?)\s+(.*)$/) ?? [];
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-light/10 text-secondary ring-1 ring-light/20 backdrop-blur-sm">
        <HighlightIcon text={text} />
      </span>
      {figure ? (
        <span className="leading-tight">
          <span className="block font-display text-[20px] font-extrabold tracking-[-0.01em] text-light">{figure}</span>
          <span className="block text-[14px] text-light/75">{sentenceCase(rest)}</span>
        </span>
      ) : (
        <span className="max-w-[11rem] text-[15px] leading-snug font-semibold text-light/90">{sentenceCase(text)}</span>
      )}
    </li>
  );
}

export function Hero({ content }: { content: HomeContent["hero"] }) {
  const lines = content.headingLines;
  return (
    <section className="relative isolate overflow-hidden bg-dark text-light" aria-labelledby="hero-title">
      <HeroSlides images={content.images}>
        <p className="text-[13.5px] font-medium text-light/80">{site.coordinates} · Rajkot, where every trip starts</p>
        {/* The big lines are the visual headline; the H1 under them carries the page topic for search. */}
        <p className="display h-hero mt-5 max-w-4xl" aria-hidden={Boolean(content.heading)}>
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
        </p>
        {content.heading ? (
          <>
            <h1
              id="hero-title"
              className="mt-6 max-w-2xl font-sans text-[20px] leading-snug font-semibold tracking-normal text-light normal-case sm:text-[22px]"
            >
              {content.heading}
            </h1>
            <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-light/80">{content.intro}</p>
          </>
        ) : (
          <h1
            id="hero-title"
            className="mt-6 max-w-xl font-sans text-[18px] leading-relaxed font-normal tracking-normal text-light/85 normal-case"
          >
            {content.intro}
          </h1>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/trips" className="btn btn-primary">
            Explore trips <ArrowRight />
          </Link>
        </div>
        <ul className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-light/15 pt-7">
          {content.highlights.map((h) => (
            <Highlight key={h} text={h} />
          ))}
        </ul>
      </HeroSlides>
    </section>
  );
}

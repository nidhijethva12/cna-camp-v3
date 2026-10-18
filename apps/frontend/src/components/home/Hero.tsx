import Image from "next/image";
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
  // The trust is shown with its own seal rather than a generic icon.
  const isTrust = text.includes(site.trust.name);
  return (
    <li className="flex items-center gap-3">
      {isTrust ? (
        <Image src={site.trust.logo} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-full ring-1 ring-light/30" />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-light/10 text-secondary ring-1 ring-light/20 backdrop-blur-sm">
          <HighlightIcon text={text} />
        </span>
      )}
      {figure ? (
        <span className="leading-tight">
          <span className="block font-display text-[20px] font-extrabold tracking-[-0.01em] text-light">{figure}</span>
          <span className="block text-[14px] text-light/75">{sentenceCase(rest)}</span>
        </span>
      ) : (
        <span className="max-w-[16rem] text-[15px] leading-snug font-semibold text-light/90">{sentenceCase(text)}</span>
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
        <h1 id="hero-title" className="display h-hero mt-4 max-w-4xl">
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
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-light/80">{content.intro}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/trips" className="btn btn-primary">
            Explore trips <ArrowRight />
          </Link>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-10 gap-y-5 border-t border-light/15 pt-6">
          {content.highlights.map((h) => (
            <Highlight key={h} text={h} />
          ))}
        </ul>
      </HeroSlides>
    </section>
  );
}

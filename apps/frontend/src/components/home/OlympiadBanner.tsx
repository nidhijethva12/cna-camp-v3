import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "@/components/ui/icons";

const facts = [
  { label: "Max scholarship", value: "100%" },
  { label: "Registration from", value: "₹90" },
  { label: "MCQ questions", value: "100" },
  { label: "Quiz rounds", value: "5" },
];

export function OlympiadBanner() {
  return (
    <section className="wrap mt-24" aria-labelledby="olympiad-title">
      <div className="reveal relative overflow-hidden rounded-card bg-dark text-light">
        <div className="absolute inset-0 opacity-40">
          <Image src="/img/cna/real/land-10-wide.webp" alt="" fill sizes="(min-width: 1240px) 1176px, 100vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-linear-to-r from-dark/95 to-dark/60" />
        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-tag bg-secondary px-3 py-1.5 font-mono text-[11.5px] font-medium tracking-[.1em] text-dark uppercase">
              <Star className="text-[13px]" />
              India’s 1st Adventure Olympiad
            </p>
            <h2 id="olympiad-title" className="h-section mt-4 [zoom:1]">
              Adventure Olympiad: take the quiz, win the Himalaya
            </h2>
            <p className="mt-3 max-w-xl text-light/80">
              An Eco-STEM online quiz for ages 14–25 and teachers from every district of Gujarat. Top scorers win up to 100% scholarship for
              the ₹18,000 Astro Adventure Trekking Camp in Manali.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/olympiad" className="btn btn-primary">
                See the Olympiad <ArrowRight />
              </Link>
              <Link href="/olympiad#finder" className="btn btn-outline-light">
                Which group am I?
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-light/10">
            {facts.map((f) => (
              <div key={f.label} className="bg-dark/80 p-5">
                <dt className="font-mono text-[11px] tracking-[.08em] text-light/60 uppercase">{f.label}</dt>
                <dd className="display mt-1 text-[40px] text-secondary">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

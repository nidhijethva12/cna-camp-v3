import Image from "next/image";
import { CountUp } from "@/components/ui/CountUp";
import { FeatureIcon, type FeatureIconName } from "@/components/ui/FeatureIcon";
import { yearsActive } from "@/content/site";

interface JourneyStatsProps {
  tripCount: number;
  /** Edited in Site settings → Numbers. */
  counts: { campers: string; camps: string };
}

export function JourneyStats({ tripCount, counts }: JourneyStatsProps) {
  const stats: { icon: FeatureIconName; value: string; label: string }[] = [
    { icon: "mountains", value: `${yearsActive()}+`, label: "Years of camps" },
    { icon: "lightning", value: counts.camps, label: "Camps and treks run" },
    { icon: "users", value: counts.campers, label: "Campers taken outdoors" },
    { icon: "mapPin", value: String(tripCount), label: "Treks, camps and nature trails" },
  ];

  return (
    <section className="relative isolate mt-16 overflow-hidden bg-dark text-light sm:mt-24" aria-labelledby="journey-title">
      <div className="absolute inset-0 -z-10 opacity-40">
        <Image src="/img/cna/real/land-02-wide.webp" alt="" fill sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-dark/75 to-dark/90" />
      <div className="wrap py-14 text-center sm:py-20">
        <p className="eyebrow text-secondary!">Our journey so far</p>
        <h2 id="journey-title" className="h-section mx-auto mt-3 max-w-3xl">
          Almost three decades of getting people outdoors
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[17px] text-light/75">
          It started with one marine camp. Today it is {counts.camps} camps across India and Nepal, and a lot of happy, tired campers.
        </p>
        <ul className="rail rail-stats mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <li
              key={s.label}
              className="reveal group rounded-card border border-light/15 bg-light/5 px-3 py-5 backdrop-blur-sm sm:px-4 sm:py-8"
            >
              <FeatureIcon
                name={s.icon}
                tone="dark"
                size="lg"
                round
                className="transition-colors duration-300 group-hover:bg-secondary group-hover:text-dark"
              />
              <CountUp value={s.value} className="display mt-3 text-[34px] sm:mt-4 sm:text-[52px]" />
              <p className="mt-1 text-[15px] text-light/75">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

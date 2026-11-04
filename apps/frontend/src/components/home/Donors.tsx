import { Photo } from "@/components/media/Photo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Donor } from "@/lib/donors";

const rupees = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

/** Main donors in a strip that scrolls on its own; rendered twice for a seamless loop, the second copy aria-hidden. */
export function Donors({ donors }: { donors: Donor[] }) {
  if (!donors.length) return null;
  const cards = [...donors, ...donors];

  return (
    <section className="mt-16 overflow-hidden sm:mt-24" aria-labelledby="donors-title">
      <div className="wrap">
        <SectionHeader
          id="donors-title"
          eyebrow="Our supporters"
          title="The people who keep camps open to all"
          intro="Their support funds scholarships, safety gear and camps for students who could not come otherwise."
        />
      </div>
      <div className="donors">
        <ul className="donors-track">
          {cards.map((d, i) => {
            const copy = i >= donors.length;
            return (
              <li key={i} className="donors-card" aria-hidden={copy || undefined}>
                <article className="relative flex h-full flex-col items-center rounded-card border border-line bg-light px-6 pt-8 pb-7 text-center shadow-card">
                  {d.isSample && <span className="absolute top-3 right-4 text-[12.5px] text-muted">Sample</span>}
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-secondary bg-soft sm:h-36 sm:w-36">
                    <Photo img={d.photo} alt={copy ? "" : d.name} label={d.name} sizes="144px" />
                  </div>
                  <h3 className="mt-5 font-display text-[21px] leading-tight font-bold">{d.name}</h3>
                  {d.profession && <p className="mt-1.5 text-[15px] font-medium text-muted">{d.profession}</p>}
                  {d.company && <p className="text-[15px] text-muted">{d.company}</p>}
                  {d.amount != null && (
                    <p className="mt-auto pt-4">
                      <span className="block text-[12.5px] font-semibold tracking-wide text-muted uppercase">Donated</span>
                      <span className="display text-[28px] text-primary">{rupees(d.amount)}</span>
                    </p>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

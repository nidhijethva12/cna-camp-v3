import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/layout/PageHead";
import { Photo } from "@/components/media/Photo";
import { TripCard } from "@/components/trips/TripCard";
import { ArrowRight, CheckCircle } from "@/components/ui/icons";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { easyStarts, travellerKinds } from "@/content/groups";
import { getSiteSettings, getTrips } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Girls-Only Treks & Solo Trips from Gujarat | CNA Camp" },
  description:
    "Girls-only batches with female volunteers, solo trips for 18+ and easy first treks. Join a group from day one and travel with trained CNA trip leaders.",
  openGraph: {
    title: "Girls-only, solo or first trek? Start here.",
    description: "Female volunteers on girls' batches, solo seats for 18+ and easy first trips.",
  },
  alternates: { canonical: "/travellers" },
};

export default async function TravellersPage() {
  const [trips, contact] = await Promise.all([getTrips(), getSiteSettings()]);
  const easy = easyStarts.flatMap((slug) => trips.find((t) => t.slug === slug) ?? []);

  return (
    <>
      <PageHead
        img="cna/real/group-01"
        imgAlt="A group of girls smiling together on a CNA trip in Himachal"
        eyebrow="Girls-only & solo"
        title="Come with your girl gang. Or come alone."
        text="Nobody stays a stranger for long on a trek. Day one, you share a bus seat. By night two, you are fighting over the last hot roti. Here are three easy ways in."
      />

      <section className="wrap mt-20">
        <SectionHeader eyebrow="Ways to join" title="Find your way in" />
        <div className="grid gap-6 md:grid-cols-3">
          {travellerKinds.map((k) => (
            <article key={k.id} id={k.id} className="scroll-mt-28 overflow-hidden rounded-card border border-line">
              <div className="relative aspect-[16/10] bg-soft">
                <Photo img={k.img} alt={k.alt} sizes="(min-width: 768px) 400px, 100vw" />
                <span className="tag absolute top-3 left-3 border-secondary bg-secondary text-dark">{k.tag}</span>
              </div>
              <div className="p-6">
                <h2 className="h-sub">{k.title}</h2>
                <ul className="mt-4 space-y-2">
                  {k.points.map((p) => (
                    <li key={p} className="flex gap-3 text-muted">
                      <CheckCircle className="mt-[3px] text-[18px] text-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap mt-16">
        <div className="grid gap-6 rounded-card border border-line p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <h2 className="h-sub">A word for parents</h2>
            <p className="mt-3 text-muted">
              Sending your daughter on her first trek? Fair question to ask: who is looking after her? On a CNA girls&apos; batch, female
              volunteers travel with the group, stay is separate, and our trip leaders are with them from the bus to the last campfire. A
              medical kit is at every camp, with a doctor nearby.
            </p>
          </div>
          <Link href="/about#safety" className="btn btn-outline self-start lg:self-auto">
            How we keep trips safe <ArrowRight />
          </Link>
        </div>
      </section>

      <section className="wrap mt-20">
        <SectionHeader
          eyebrow="Easy starts"
          title="Good trips to start with"
          action={{ label: "All easy trips", href: "/trips?level=easy" }}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {easy.map((t) => (
            <TripCard key={t.slug} trip={t} />
          ))}
        </div>
      </section>

      <section className="wrap mt-20">
        <div className="flex flex-col gap-6 rounded-card bg-dark p-8 text-light sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="display text-[26px]">Want a girls-only batch for your college or friends?</p>
            <p className="mt-2 text-light/70">Tell us your dates. We plan the rest.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/group-trips#custom" className="btn btn-primary">
              Plan a trip <ArrowRight />
            </Link>
            <a href={contact.whatsappHref} target="_blank" rel="noopener" className="btn btn-outline-light">
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

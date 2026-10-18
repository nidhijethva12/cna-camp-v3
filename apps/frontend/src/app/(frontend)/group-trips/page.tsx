import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry/EnquiryForm";
import { PageHead } from "@/components/layout/PageHead";
import { Photo } from "@/components/media/Photo";
import { TripCard } from "@/components/trips/TripCard";
import { CountUp } from "@/components/ui/CountUp";
import { ArrowRight, CheckCircle, Phone, WhatsApp } from "@/components/ui/icons";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { groupBookingSteps, groupFavourites, groupInclusions, groupKinds } from "@/content/groups";
import { yearsActive } from "@/content/site";
import { getSiteSettings, getTrips } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Group Trips for Schools, Colleges & Teams | CNA Camp" },
  description:
    "Custom treks, camps and nature trails for schools, colleges, families, friends and teams. 1 teacher free per 25 students. Tell us your dates, we plan it.",
  openGraph: {
    title: "Group trips, planned around your group",
    description: "Schools, colleges, families and teams: pick the dates, we handle travel, stay, food and safety.",
  },
  alternates: { canonical: "/group-trips" },
};

export default async function GroupTripsPage() {
  const [trips, contact] = await Promise.all([getTrips(), getSiteSettings()]);
  const favourites = groupFavourites.flatMap((slug) => trips.find((t) => t.slug === slug) ?? []);

  return (
    <>
      <PageHead
        img="cna/real/group-04"
        imgAlt="A large group of CNA campers sitting together in a Himalayan forest"
        eyebrow="Group trips"
        title="Your group. Your dates. We plan the rest."
        text="Treks, camps and nature trails built around your group: a school class, a college club, three families, a team from work. Anywhere from the Gujarat coast to the Himalaya."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#custom" className="btn btn-primary">
            Plan a custom trip <ArrowRight />
          </a>
          <a href={contact.whatsappHref} target="_blank" rel="noopener" className="btn btn-outline-light">
            WhatsApp us
          </a>
        </div>
      </PageHead>

      <section className="wrap mt-20">
        <SectionHeader
          eyebrow="Who we plan for"
          title="Every kind of group"
          intro="Tell us who is coming. The trip, the pace and the food follow from that."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groupKinds.map((k) => (
            <article key={k.id} id={k.id} className="flex scroll-mt-28 flex-col overflow-hidden rounded-card border border-line">
              <div className="relative aspect-[16/10] bg-soft">
                <Photo img={k.img} alt={k.alt} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" />
                <span className="tag absolute top-3 left-3 border-secondary bg-secondary text-dark">{k.who}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="h-card">{k.title}</h3>
                <p className="mt-2 flex-1 text-muted">{k.text}</p>
                <p className="mt-5 text-[13.5px] font-medium text-muted">
                  Popular: <span className="text-dark">{k.popular}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap mt-12">
        <div className="relative overflow-hidden rounded-card bg-primary p-6 text-light sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="text-[13.5px] font-medium text-light/80">For teachers &amp; principals</p>
              <h2 className="h-section mt-2">Every 25 students, one teacher travels free.</h2>
              <p className="mt-3 max-w-xl text-light/85">
                School trips with CNA start at 50 students. For every 25 students, one teacher or escort joins at no cost. We plan the
                nature sessions, run the safety checks and keep parents informed, so your staff can focus on the children.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a href="#custom" className="btn bg-light text-dark hover:bg-dark hover:text-light">
                Plan a school trip <ArrowRight />
              </a>
              <a href={contact.whatsappHref} target="_blank" rel="noopener" className="btn btn-outline-light">
                WhatsApp
              </a>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-light/25 pt-6 text-center">
            {[
              ["50", "Minimum students"],
              ["25", "Students per free teacher"],
              [`${yearsActive()}+`, "Years of school camps"],
            ].map(([n, label]) => (
              <div key={label}>
                <CountUp value={n} className="display text-[34px]" />
                <p className="text-[13px] text-light/80">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-24 bg-soft py-20">
        <div className="wrap grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="What we handle" title="You bring the group. We do the rest." />
            <ul className="grid gap-3 sm:grid-cols-2">
              {groupInclusions.map((h) => (
                <li key={h} className="flex gap-3 rounded-card bg-light p-4">
                  <CheckCircle className="mt-[3px] text-[18px] text-primary" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeader eyebrow="How it works" title="How a group camp is booked" />
            <ol className="space-y-5">
              {groupBookingSteps.map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-tag bg-dark font-mono text-[13px] text-light">
                    {i + 1}
                  </span>
                  <p className="pt-1.5 text-[17px]">{s}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="wrap mt-24">
        <SectionHeader eyebrow="Group favourites" title="Trips groups love" action={{ label: "All trips", href: "/trips" }} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favourites.map((t) => (
            <TripCard key={t.slug} trip={t} />
          ))}
        </div>
      </section>

      <section id="custom" className="wrap mt-24 grid scroll-mt-24 gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="eyebrow">Custom trip</p>
          <h2 className="h-section mt-3">Don&apos;t see your trip? We build it.</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">
            Pick any place from our list, your dates and your group size. Fill the form or call us. To block your dates, pay 25% in advance.
            The balance is due 3 days before you leave.
          </p>
          <div className="mt-8 space-y-3">
            <a href={contact.phoneHref} className="flex items-center justify-between rounded-card border border-line p-4 hover:border-dark">
              <span className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-[20px] text-primary">
                  <Phone />
                </span>
                <span>
                  <span className="eyebrow block">Call</span>
                  <span className="font-bold">{contact.phone}</span>
                </span>
              </span>
              <ArrowRight className="text-[18px]" />
            </a>
            <a
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-between rounded-card border border-line p-4 hover:border-dark"
            >
              <span className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-whatsapp/10 text-[22px] text-whatsapp-dark">
                  <WhatsApp />
                </span>
                <span>
                  <span className="eyebrow block">WhatsApp</span>
                  <span className="font-bold">Chat with us</span>
                </span>
              </span>
              <ArrowRight className="text-[18px]" />
            </a>
          </div>
        </div>
        <EnquiryForm />
      </section>
    </>
  );
}

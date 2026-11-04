import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { PageHead } from "@/components/layout/PageHead";
import { legalUpdated, termsSections } from "@/content/legal";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Terms & Conditions for CNA Treks and Camps | CNA Camp" },
  description:
    "How booking, payment, safety and itinerary changes work on CNA camps, treks and the Adventure Olympiad. 25% advance, everything paid 3 days before departure.",
  openGraph: {
    title: "Terms & conditions | CNA Camp",
    description: "Booking, payments, safety and changes on CNA trips, in plain words.",
  },
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const contact = await getSiteSettings();
  return (
    <>
      <PageHead
        img="cna/real/land-03"
        imgAlt="Snow peaks above a green Himalayan valley"
        eyebrow="Policies"
        title={<>Terms &amp; conditions</>}
        text="How booking, payment, safety and changes work on a CNA trip, in plain words."
      />
      <LegalPage sections={termsSections(contact)} updated={legalUpdated} />
    </>
  );
}

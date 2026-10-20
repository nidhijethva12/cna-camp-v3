import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { PageHead } from "@/components/layout/PageHead";
import { termsSections } from "@/content/legal";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Terms & Conditions for CNA Treks and Camps | CNA Camp" },
  description:
    "How booking, payment, safety and itinerary changes work on CNA treks and camps. 25% advance, balance 3 days before, mediclaim on camps over 5 days.",
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
      <LegalPage
        sections={termsSections(contact)}
        note="Draft, legal review before launch. Written from CNA’s existing terms, to be checked by CNA and a legal adviser before the site goes live."
      />
    </>
  );
}

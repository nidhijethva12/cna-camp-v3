import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { PageHead } from "@/components/layout/PageHead";
import { cancellationSections } from "@/content/legal";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Cancellation & Refund Policy | CNA Camp" },
  description:
    "Cancelling a CNA trek or camp? See the charges (30% if 28+ days before, up to 100% in the last 2 days), how to cancel in writing and refunds within 60 working days.",
  openGraph: {
    title: "Cancellation & refund | CNA Camp",
    description: "Exactly what happens if you need to cancel a CNA trip.",
  },
  alternates: { canonical: "/cancellation" },
};

export default async function CancellationPage() {
  const contact = await getSiteSettings();
  return (
    <>
      <PageHead
        img="cna/real/land-06"
        imgAlt="A green Himalayan valley seen through pine trees"
        eyebrow="Policies"
        title={<>Cancellation &amp; refund</>}
        text="Plans change. Exams move, someone falls ill. Here is exactly what happens if you need to cancel."
      />
      <LegalPage sections={cancellationSections(contact)} />
    </>
  );
}

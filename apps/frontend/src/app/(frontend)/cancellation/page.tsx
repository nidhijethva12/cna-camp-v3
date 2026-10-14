import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { PageHead } from "@/components/layout/PageHead";
import { cancellationSections } from "@/content/legal";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Cancellation & Refund Policy | CNA Camp" },
  description:
    "Cancelling a CNA trek or camp? See the charges (10% two months before to 100% on the day), how to cancel in writing and how refunds and tickets work.",
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
        eyebrow="Policies"
        title={<>Cancellation &amp; refund</>}
        text="Plans change. Exams move, someone falls ill. Here is exactly what happens if you need to cancel."
      />
      <LegalPage
        sections={cancellationSections(contact)}
        note="Draft, legal review before launch. Based on CNA’s existing cancellation rules. Refund timeline to be confirmed by CNA."
      />
    </>
  );
}

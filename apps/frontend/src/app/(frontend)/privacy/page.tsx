import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { PageHead } from "@/components/layout/PageHead";
import { legalUpdated, privacySections } from "@/content/legal";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy (DPDP Act 2023) | CNA Camp" },
  description:
    "What personal data CNA collects on forms, camps and the Olympiad, why we use it, how long we keep it and your rights under India’s DPDP Act 2023.",
  openGraph: {
    title: "Privacy policy | CNA Camp",
    description: "What we collect, why, and how you stay in control of your data.",
  },
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const contact = await getSiteSettings();
  return (
    <>
      <PageHead
        img="cna/real/land-07"
        imgAlt="Tall deodar trees seen from the forest floor"
        eyebrow="Policies"
        title={<>Privacy policy</>}
        text="What we collect, why we need it, and how you stay in control. Written for India’s Digital Personal Data Protection Act, 2023 (DPDP Act)."
      />
      <LegalPage sections={privacySections(contact)} updated={legalUpdated} />
    </>
  );
}

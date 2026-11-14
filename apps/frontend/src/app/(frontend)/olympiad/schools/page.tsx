import { PartnerPage, partnerMetadata } from "@/components/olympiad/PartnerPage";

export const metadata = partnerMetadata("school", "en");

export default function SchoolPartnerPage() {
  return <PartnerPage kind="school" lang="en" />;
}

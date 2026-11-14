import { PartnerPage, partnerMetadata } from "@/components/olympiad/PartnerPage";

export const metadata = partnerMetadata("school", "gu");

export default function SchoolPartnerGujaratiPage() {
  return <PartnerPage kind="school" lang="gu" />;
}

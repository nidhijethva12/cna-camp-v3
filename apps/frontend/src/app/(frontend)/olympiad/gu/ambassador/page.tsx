import { PartnerPage, partnerMetadata } from "@/components/olympiad/PartnerPage";

export const metadata = partnerMetadata("ambassador", "gu");

export default function AmbassadorGujaratiPage() {
  return <PartnerPage kind="ambassador" lang="gu" />;
}

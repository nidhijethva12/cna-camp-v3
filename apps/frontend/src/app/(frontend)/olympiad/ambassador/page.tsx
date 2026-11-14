import { PartnerPage, partnerMetadata } from "@/components/olympiad/PartnerPage";

export const metadata = partnerMetadata("ambassador", "en");

export default function AmbassadorPage() {
  return <PartnerPage kind="ambassador" lang="en" />;
}

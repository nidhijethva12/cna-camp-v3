import type { Metadata } from "next";
import { OlympiadView } from "@/components/olympiad/OlympiadView";
import { getSiteSettings } from "@/lib/content";
import { getOlympiadPhase } from "@/lib/olympiad/settings";
import { getOlympiadContent } from "@/lib/olympiadContent";

// Switches from "Remind me" to "Register now" by itself when registration opens.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getOlympiadContent("en");
  return {
    title: { absolute: meta.title },
    description: meta.description,
    openGraph: { title: meta.ogTitle, description: meta.ogDescription },
    alternates: { canonical: "/olympiad", languages: { en: "/olympiad", gu: "/olympiad/gu" } },
  };
}

export default async function OlympiadPage() {
  const [o, contact, state] = await Promise.all([getOlympiadContent("en"), getSiteSettings(), getOlympiadPhase()]);
  return <OlympiadView o={o} lang="en" contact={contact} {...state} />;
}

import type { Metadata } from "next";
import { OlympiadView } from "@/components/olympiad/OlympiadView";
import { getSiteSettings } from "@/lib/content";
import { getOlympiadContent } from "@/lib/olympiadContent";

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
  const [o, contact] = await Promise.all([getOlympiadContent("en"), getSiteSettings()]);
  return <OlympiadView o={o} lang="en" contact={contact} />;
}

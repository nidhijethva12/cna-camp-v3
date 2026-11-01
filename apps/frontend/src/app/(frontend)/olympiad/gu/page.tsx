import type { Metadata } from "next";
import { Noto_Sans_Gujarati } from "next/font/google";
import { OlympiadView } from "@/components/olympiad/OlympiadView";
import { getSiteSettings } from "@/lib/content";
import { getOlympiadContent } from "@/lib/olympiadContent";

const gujarati = Noto_Sans_Gujarati({ subsets: ["gujarati"], variable: "--font-gujarati", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getOlympiadContent("gu");
  return {
    title: { absolute: meta.title },
    description: meta.description,
    openGraph: { title: meta.ogTitle, description: meta.ogDescription, locale: "gu_IN" },
    alternates: { canonical: "/olympiad/gu", languages: { en: "/olympiad", gu: "/olympiad/gu" } },
  };
}

export default async function OlympiadGujaratiPage() {
  const [o, contact] = await Promise.all([getOlympiadContent("gu"), getSiteSettings()]);
  return (
    <div lang="gu" className={`lang-gu ${gujarati.variable}`}>
      <OlympiadView o={o} lang="gu" contact={contact} />
    </div>
  );
}

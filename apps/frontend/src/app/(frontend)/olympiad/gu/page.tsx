import type { Metadata } from "next";
import { Noto_Sans_Gujarati } from "next/font/google";
import { OlympiadView } from "@/components/olympiad/OlympiadView";
import { getSiteSettings } from "@/lib/content";
import { getOlympiadPhase } from "@/lib/olympiad/settings";
import { getOlympiadContent } from "@/lib/olympiadContent";

// Switches from "Remind me" to "Register now" by itself when registration opens.
export const revalidate = 300;

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
  const [o, contact, state] = await Promise.all([getOlympiadContent("gu"), getSiteSettings(), getOlympiadPhase()]);
  return (
    <div lang="gu" className={`lang-gu ${gujarati.variable}`}>
      <OlympiadView o={o} lang="gu" contact={contact} {...state} />
    </div>
  );
}

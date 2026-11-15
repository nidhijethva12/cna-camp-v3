import type { Metadata } from "next";
import { Noto_Sans_Gujarati } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReceiptCard } from "@/components/olympiad/RegistrationDone";
import { registrationText, type RegLang } from "@/content/registration";
import { getSiteSettings } from "@/lib/content";
import { olympiadApiLive } from "@/lib/olympiad";
import { callBackend } from "@/lib/olympiad/backend";
import type { ReceiptData } from "@/lib/olympiad/receipt";

const gujarati = Noto_Sans_Gujarati({ subsets: ["gujarati"], variable: "--font-gujarati", display: "swap" });

export const metadata: Metadata = { title: "Registration receipt", robots: { index: false, follow: false } };

/** The registration receipt from the link in the confirmation message; ?lang=gu shows it in Gujarati. */
export default async function ReceiptPage({ params, searchParams }: PageProps<"/olympiad/receipt/[token]">) {
  if (!olympiadApiLive) notFound();
  const [{ token }, query, contact] = await Promise.all([params, searchParams, getSiteSettings()]);
  const lang: RegLang = query.lang === "gu" ? "gu" : "en";
  const t = registrationText[lang];
  const result = await callBackend<ReceiptData>("/olympiad/receipts", { body: { token: String(token).slice(0, 512) } });

  return (
    <section lang={lang} className={`bg-soft py-12 sm:py-20 ${gujarati.variable} ${lang === "gu" ? "lang-gu" : ""}`}>
      <div className="wrap max-w-[640px]">
        {result.ok ? (
          <ReceiptCard receipt={result.data} lang={lang} phone={contact.phone} />
        ) : (
          <div className="rounded-card border border-line bg-light px-6 py-10 text-center shadow-card">
            <p className="text-muted">{t.done.notReady}</p>
            <Link href="/olympiad" className="btn btn-primary mt-5">
              {t.page.toOlympiad}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

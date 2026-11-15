import type { Metadata } from "next";
import { Noto_Sans_Gujarati } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RegistrationForm } from "@/components/olympiad/RegistrationForm";
import { ArrowLeft } from "@/components/ui/icons";
import { registrationPath, registrationText, type RegLang } from "@/content/registration";
import { getSiteSettings } from "@/lib/content";
import { olympiadApiLive } from "@/lib/olympiad";
import { callBackend } from "@/lib/olympiad/backend";
import type { RegistrationInput } from "@/lib/olympiad/registration";
import { formatIstDate, getOlympiadConfig, registrationState } from "@/lib/olympiad/settings";
import { getOlympiadContent } from "@/lib/olympiadContent";

const gujarati = Noto_Sans_Gujarati({ subsets: ["gujarati"], variable: "--font-gujarati", display: "swap" });

const olympiadPath: Record<RegLang, string> = { en: "/olympiad", gu: "/olympiad/gu" };

export function registerMetadata(lang: RegLang): Metadata {
  const t = registrationText[lang].page;
  return {
    title: { absolute: t.metaTitle },
    description: t.metaDescription,
    alternates: { canonical: registrationPath[lang], languages: { en: registrationPath.en, gu: registrationPath.gu } },
  };
}

/** The registration page in either language; the form can switch language without losing answers. */
type InvitePreview =
  | { valid: false }
  | {
      valid: true;
      name: string;
      dob: string;
      std: string;
      parentName: string;
      parentMobile: string;
      email: string;
      schoolName: string;
      schoolType: "government" | "granted" | "private";
    };

/** A school's invitation turned into the form's starting answers; the name splits as "first father surname". */
async function invitedAnswers(token: string): Promise<{ answers: Partial<RegistrationInput>; schoolName: string } | null> {
  const result = await callBackend<InvitePreview>("/olympiad/partners/school/invite-preview", { body: { token } });
  if (!result.ok || !result.data.valid) return null;
  const d = result.data;
  const [firstName = "", ...rest] = d.name.split(" ").filter(Boolean);
  const surname = rest.length ? rest[rest.length - 1] : "";
  const fatherName = rest.slice(0, -1).join(" ");
  return {
    schoolName: d.schoolName,
    answers: {
      who: "student",
      dob: d.dob,
      schoolType: d.schoolType,
      firstName,
      fatherName,
      surname,
      mobile: d.parentMobile,
      email: d.email,
      school: d.schoolName,
      std: d.std,
      parentName: d.parentName,
    },
  };
}

export async function RegisterPage({ lang, preview, invite }: { lang: RegLang; preview: boolean; invite?: string }) {
  if (!olympiadApiLive) notFound();
  const config = await getOlympiadConfig();
  // Locally, ?preview shows the form before registration opens.
  const state = preview && process.env.NODE_ENV !== "production" ? "open" : registrationState(config);
  const t = registrationText[lang].page;
  const invited = invite ? await invitedAnswers(invite) : null;
  const [{ notices }, contact] = await Promise.all([getOlympiadContent("en"), getSiteSettings()]);
  // The notice board lists the Rules and Terms in Gujarati, then in English, after the official notice.
  const rules = { gu: notices[1]?.href ?? "/olympiad#notices", en: notices[2]?.href ?? "/olympiad#notices" };

  return (
    <section className={`bg-soft py-10 sm:py-14 ${gujarati.variable}`}>
      <div className="wrap max-w-[760px]">
        <Link
          href={olympiadPath[lang]}
          className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-muted hover:text-primary"
        >
          <ArrowLeft /> {t.back}
        </Link>
        {state === "open" ? (
          <div className="mt-5">
            {invited && (
              <p className="mb-4 rounded-card border border-primary/25 bg-primary-soft px-4 py-3 text-[15px]" lang={lang}>
                {t.invited(invited.schoolName)}
              </p>
            )}
            <RegistrationForm
              fees={config.fees}
              lang={lang}
              initial={invited?.answers}
              invite={invited ? invite : undefined}
              quizSlots={config.quizSlots}
              rules={rules}
              phone={contact.phone}
            />
          </div>
        ) : (
          <div lang={lang} className={`mt-5 rounded-card border border-line bg-light p-6 ${lang === "gu" ? "lang-gu" : ""}`}>
            <h1 className="h-sub">{t.title}</h1>
            <p className="mt-3 text-[17px]">{state === "soon" ? t.opens(formatIstDate(config.opensAt)) : t.closed}</p>
            <Link href={olympiadPath[lang]} className="btn btn-primary mt-5">
              {t.toOlympiad}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

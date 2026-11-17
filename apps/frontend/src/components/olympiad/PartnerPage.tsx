import type { Metadata } from "next";
import { Noto_Sans_Gujarati } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { OlympiadLang } from "@/components/olympiad/LanguageSwitch";
import { PartnerSignupForm } from "@/components/olympiad/PartnerSignupForm";
import { FileText, GraduationCap, Megaphone, ShieldCheck, Trophy, UserCircleCheck, UsersThree } from "@/components/ui/icons";
import { dashboardPath, partnerPageText, partnerPath, type PartnerKind } from "@/content/partnerPages";
import { olympiadApiLive } from "@/lib/olympiad";

const gujarati = Noto_Sans_Gujarati({ subsets: ["gujarati"], variable: "--font-gujarati", display: "swap" });

const olympiadPath: Record<OlympiadLang, string> = { en: "/olympiad", gu: "/olympiad/gu" };
const heroImage: Record<PartnerKind, string> = {
  school: "/img/stock/home-banner-2-wide.webp",
  ambassador: "/img/stock/home-banner-5-wide.webp",
};
const stepIcons: Record<PartnerKind, (typeof GraduationCap)[]> = {
  school: [GraduationCap, UsersThree, FileText, ShieldCheck],
  ambassador: [UserCircleCheck, Megaphone, UsersThree, Trophy],
};

export function partnerMetadata(kind: PartnerKind, lang: OlympiadLang): Metadata {
  const { meta } = partnerPageText[lang][kind];
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: partnerPath[lang][kind], languages: { en: partnerPath.en[kind], gu: partnerPath.gu[kind] } },
  };
}

/** "Register your school" / "Become an Ambassador": how it works, the sign-up form and what the dashboard looks like. */
export function PartnerPage({ kind, lang }: { kind: PartnerKind; lang: OlympiadLang }) {
  if (!olympiadApiLive) notFound();
  const t = partnerPageText[lang];
  const k = t[kind];
  const icons = stepIcons[kind];

  return (
    <div lang={lang} className={`${gujarati.variable} ${lang === "gu" ? "lang-gu" : ""}`}>
      <section className="relative isolate overflow-hidden bg-dark text-light">
        <Image src={heroImage[kind]} alt="" fill preload sizes="100vw" className="-z-20 object-cover object-[50%_85%]" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-dark/85 to-dark/35" />
        <div className="wrap py-[clamp(48px,7vw,84px)]">
          <p className="text-[14px] text-light/80">
            <Link href={olympiadPath[lang]} className="underline underline-offset-3 hover:text-light">
              {t.crumb}
            </Link>{" "}
            / {k.eyebrow}
          </p>
          <p className="mt-3 font-display text-[15px] font-bold text-secondary">{k.eyebrow}</p>
          <h1 className="mt-1.5 max-w-[20ch] text-[34px] leading-[1.1] md:text-[50px]">{k.title}</h1>
          <p className="mt-3 max-w-[56ch] text-[17px] text-light/85">{k.lead}</p>
        </div>
      </section>

      <section className="py-[clamp(48px,7vw,80px)]">
        <div className="wrap grid items-start gap-10 lg:grid-cols-[1fr_minmax(0,500px)] lg:gap-14">
          <div>
            <p className="eyebrow">{t.howItWorks}</p>
            <h2 className="h-section mt-1.5">{k.stepsTitle}</h2>
            <ol className="mt-7 grid gap-5">
              {k.steps.map(([title, text], i) => {
                const Icon = icons[i];
                return (
                  <li key={title} className="flex gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-soft text-[21px] text-primary">
                      <Icon />
                    </span>
                    <span>
                      <b className="block font-display text-[17px]">
                        {i + 1}. {title}
                      </b>
                      <span className="text-[15.5px] text-muted">{text}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-8 rounded-card border border-line bg-soft px-5 py-4 text-[15px]">
              {t.alreadyPartner}{" "}
              <Link href={dashboardPath[kind]} className="font-bold text-primary underline underline-offset-3">
                {t.logIn}
              </Link>
            </p>
          </div>
          <PartnerSignupForm kind={kind} lang={lang} />
        </div>
      </section>
    </div>
  );
}

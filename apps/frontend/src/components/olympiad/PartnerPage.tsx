import type { Metadata } from "next";
import { Noto_Sans_Gujarati } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { OlympiadLang } from "@/components/olympiad/LanguageSwitch";
import { PartnerSignupForm } from "@/components/olympiad/PartnerSignupForm";
import {
  ArrowRight,
  CheckCircle,
  FileText,
  GraduationCap,
  Megaphone,
  ShieldCheck,
  Trophy,
  UserCircleCheck,
  UsersThree,
} from "@/components/ui/icons";
import { dashboardPath, partnerPageText, partnerPath, type PartnerKind } from "@/content/partnerPages";
import { olympiadApiLive } from "@/lib/olympiad";

const gujarati = Noto_Sans_Gujarati({ subsets: ["gujarati"], variable: "--font-gujarati", display: "swap" });

const olympiadPath: Record<OlympiadLang, string> = { en: "/olympiad", gu: "/olympiad/gu" };
const heroImage: Record<PartnerKind, string> = { school: "/img/olympiad/group-deodar.webp", ambassador: "/img/olympiad/rock-climb.webp" };
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
        <Image src={heroImage[kind]} alt="" fill preload sizes="100vw" className="-z-10 object-cover opacity-30" />
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

      <section className="bg-soft py-[clamp(48px,7vw,80px)]">
        <div className="wrap">
          <p className="eyebrow">{t.afterApproval}</p>
          <h2 className="h-section mt-1.5">{k.dashboardTitle}</h2>
          <p className="lead mt-3 flex flex-wrap items-center gap-2.5">
            {k.dashboardLead}
            <span className="rounded-tag bg-secondary px-2.25 py-0.5 font-display text-[13px] font-bold text-dark">{t.exampleData}</span>
          </p>
          <div aria-hidden="true" className="pointer-events-none mt-7 select-none">
            {kind === "school" ? <SchoolSample t={t} /> : <AmbassadorSample t={t} />}
          </div>
          <Link href={dashboardPath[kind]} className="btn btn-dark mt-7">
            {t.logIn} <ArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}

type Text = (typeof partnerPageText)["en"];

function Stats({ items, tones }: { items: string[][]; tones: string[] }) {
  return (
    <div className="grid grid-cols-2 border-b border-line lg:grid-cols-4">
      {items.map(([label, value], i) => (
        <div key={label} className="border-r border-b border-line px-5 py-4 last:border-r-0 lg:border-b-0">
          <p className="text-[13.5px] text-muted">{label}</p>
          <p className={`font-display text-[28px] font-extrabold ${tones[i] ?? ""}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

function SchoolSample({ t }: { t: Text }) {
  const s = t.sample;
  return (
    <div className="overflow-hidden rounded-card border border-line bg-light shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="font-display text-[19px] font-extrabold">{s.school.name}</p>
          <p className="text-[13.5px] text-muted">{s.school.line}</p>
        </div>
        <span className="btn btn-primary">{s.school.pay}</span>
      </div>
      <Stats items={s.schoolStats} tones={["", "text-success", "text-primary", "text-primary"]} />
      <div className="flex flex-wrap gap-2.5 border-b border-line px-5 py-3.5">
        {s.schoolActions.map((a) => (
          <span key={a} className="btn btn-outline min-h-0 px-4 py-2 text-[14px]">
            {a}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[14.5px]">
          <thead className="bg-soft text-[13px] text-muted">
            <tr>
              {s.columns.map((c) => (
                <th key={c} className="px-5 py-2.5 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {s.rows.map(([name, std, group, payment, consent]) => (
              <tr key={name} className="border-t border-line">
                <td className="px-5 py-2.5">{name}</td>
                <td className="px-5 py-2.5">{std}</td>
                <td className="px-5 py-2.5">{group}</td>
                <td className="px-5 py-2.5">{group === "A" ? "₹230" : "₹369"}</td>
                <td className="px-5 py-2.5">
                  <Pill ok={payment === "Paid"}>{payment === "Paid" ? s.paid : s.pending}</Pill>
                </td>
                <td className="px-5 py-2.5">
                  <Pill ok={consent === "Done"}>{consent === "Done" ? s.doneWord : s.pending}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-line px-5 py-3 text-[13px] text-muted">{s.schoolNote}</p>
    </div>
  );
}

function AmbassadorSample({ t }: { t: Text }) {
  const s = t.sample;
  return (
    <div className="overflow-hidden rounded-card border border-line bg-light shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="font-display text-[19px] font-extrabold">{s.amb.name}</p>
          <p className="text-[13.5px] text-muted">{s.amb.line}</p>
        </div>
        <Pill ok>
          <CheckCircle /> Approved
        </Pill>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <p className="text-[13.5px] text-muted">{s.amb.codeLabel}</p>
          <p className="font-display text-[30px] font-extrabold tracking-wide">{s.amb.code}</p>
        </div>
        <span className="rounded-card border border-line bg-soft px-4 py-3 text-center text-[13px] text-muted">{s.amb.qr}</span>
      </div>
      <Stats items={s.ambStats} tones={["", "", "text-success", "text-primary"]} />
      <div className="px-5 py-4">
        <p className="text-[14.5px] font-semibold">{s.progress}</p>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-soft">
          <div className="h-full w-[72%] rounded-full bg-primary" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {s.milestones.map(([at, reward], i) => (
            <div key={at} className={`rounded-card border p-3.5 ${i === 0 ? "border-success/40 bg-success/8" : "border-line"}`}>
              <b className="font-display">{at}</b>
              <p className="text-[14px] text-muted">{reward}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="border-t border-line px-5 py-3 text-[13px] text-muted">{s.ambNote}</p>
    </div>
  );
}

function Pill({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${ok ? "bg-success/12 text-success" : "bg-primary-soft text-primary"}`}
    >
      {children}
    </span>
  );
}

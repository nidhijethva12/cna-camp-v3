import type { Metadata } from "next";
import { Noto_Sans_Gujarati } from "next/font/google";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { logoutFromDashboard } from "@/actions/olympiad/dashboard";
import { CopyButton } from "@/components/olympiad/CopyButton";
import { DashboardLanguage } from "@/components/olympiad/DashboardLanguage";
import { DashboardLogin } from "@/components/olympiad/DashboardLogin";
import { dashboardText } from "@/content/dashboards";
import { olympiadApiLive } from "@/lib/olympiad";
import { dashboardLanguage } from "@/lib/olympiad/dashboardLanguage";
import { dashboardData, type AmbassadorDashboard } from "@/lib/olympiad/session";
import { formatIstDate } from "@/lib/olympiad/settings";
import { themeColors } from "@/lib/theme";

const gujarati = Noto_Sans_Gujarati({ subsets: ["gujarati"], variable: "--font-gujarati", display: "swap" });

export const metadata: Metadata = {
  title: "Ambassador dashboard",
  robots: { index: false, follow: false },
};

/** Shared over WhatsApp and printed, so the QR is a sharp PNG in the site's dark ink. */
const qrPng = (url: string) => QRCode.toDataURL(url, { width: 600, margin: 2, color: { dark: themeColors.dark, light: "#ffffff" } });

export default async function AmbassadorDashboardPage() {
  if (!olympiadApiLive) notFound();
  const ambassador = await dashboardData<AmbassadorDashboard>("ambassador");
  const lang = await dashboardLanguage(ambassador?.language);
  const t = dashboardText[lang];
  const shell = `bg-soft ${gujarati.variable} ${lang === "gu" ? "lang-gu" : ""}`;

  if (!ambassador) {
    return (
      <section lang={lang} className={`${shell} py-16 sm:py-24`}>
        <div className="wrap">
          <DashboardLogin kind="ambassador" lang={lang} />
        </div>
      </section>
    );
  }

  const a = t.ambassador;
  const { shareUrl, milestones } = ambassador;
  const { clicks, registered, paid } = ambassador.stats;
  const qr = await qrPng(shareUrl);
  const subtitle = [
    ambassador.role && (a.roles[ambassador.role] ?? ambassador.role),
    ambassador.city,
    ambassador.approvedAt && a.since(formatIstDate(ambassador.approvedAt)),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section lang={lang} className={`${shell} py-12 sm:py-16`}>
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="h-section mt-1.5">{a.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <DashboardLanguage lang={lang} label={t.language} />
            <form action={logoutFromDashboard}>
              <input type="hidden" name="kind" value="ambassador" />
              <button type="submit" className="text-[14.5px] font-bold text-primary underline">
                {t.logOut}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-card border border-line bg-light shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3.5 border-b border-line px-6 py-5">
            <h2 className="font-display text-[21px] font-extrabold">
              {ambassador.name}
              {subtitle && <small className="block font-sans text-[14px] font-normal text-muted">{subtitle}</small>}
            </h2>
            <span className="rounded-full bg-success/12 px-2.5 py-1 font-display text-[12.5px] font-bold text-success">{t.approved}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-line px-6 py-5">
            <div className="min-w-0 flex-1">
              <p className="font-display text-[17px] font-extrabold">{a.link}</p>
              <div className="mt-2 flex max-w-[560px] overflow-hidden rounded-card border-2 border-primary">
                <input
                  readOnly
                  value={shareUrl}
                  aria-label={a.link}
                  className="min-w-0 flex-1 bg-primary-soft px-3.5 py-3.5 font-display text-[15.5px] font-bold text-primary-hover"
                />
                <CopyButton
                  value={shareUrl}
                  label={a.copyLink}
                  copiedLabel={t.copied}
                  className="bg-primary px-5 font-display text-[15px] font-bold whitespace-nowrap text-light hover:bg-primary-hover"
                />
              </div>
              <p className="mt-2 text-[13.5px] text-muted">{a.linkText}</p>
              <p className="mt-3 text-[13.5px] text-muted">
                {a.code} <span className="font-semibold text-dark">{ambassador.code}</span>
              </p>
            </div>
            <a
              href={qr}
              download={`olympiad-${ambassador.code}.png`}
              className="group grid shrink-0 justify-items-center gap-1.5 text-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a generated data URL; next/image adds nothing here */}
              <img src={qr} alt={a.qrAlt(shareUrl)} width={132} height={132} className="rounded-card border border-line" />
              <span className="text-[13px] font-bold text-primary group-hover:underline">{a.qr}</span>
            </a>
          </div>

          <dl className="grid grid-cols-3 border-b border-line">
            {[
              { label: a.tiles.clicks, value: clicks, tone: "" },
              { label: a.tiles.registered, value: registered, tone: "" },
              { label: a.tiles.confirmed, value: paid, tone: "text-success" },
            ].map((k) => (
              <div key={k.label} className="border-r border-line px-4 py-4.5 last:border-r-0 sm:px-6">
                <dt className="text-[13.5px] text-muted">{k.label}</dt>
                <dd className={`font-display text-[28px] font-extrabold tabular-nums ${k.tone}`}>{k.value}</dd>
              </div>
            ))}
          </dl>

          {milestones.length > 0 && (
            <div className="px-6 py-5.5">
              <p className="font-display text-[18px] font-extrabold">{a.rewards}</p>
              <ol className="mt-3.5 grid gap-3 md:grid-cols-3">
                {milestones.map((m, i) => {
                  const have = m.metric === "clicks" ? clicks : paid;
                  const reached = have >= m.paid;
                  const reward = (lang === "gu" && m.rewardGu) || m.reward;
                  const target = a.target(m.paid, a.units[m.metric]);
                  return (
                    <li
                      key={`${m.metric}-${m.paid}`}
                      className={`flex flex-col gap-2 rounded-card border p-4 ${reached ? "border-success bg-success/8" : "border-line"}`}
                    >
                      <span className="text-[13px] font-bold text-muted">{a.step(i + 1)}</span>
                      <b className="font-display text-[19px] leading-tight">{reward}</b>
                      <span className="text-[14px] text-muted">{target}</span>
                      <div
                        className="mt-auto h-2.5 overflow-hidden rounded-full bg-soft"
                        role="progressbar"
                        aria-label={`${reward}: ${target}`}
                        aria-valuemin={0}
                        aria-valuemax={m.paid}
                        aria-valuenow={Math.min(have, m.paid)}
                      >
                        <span
                          className={`block h-full rounded-full ${reached ? "bg-success" : "bg-primary"}`}
                          style={{ width: `${Math.min(100, (have / m.paid) * 100)}%` }}
                        />
                      </div>
                      <span className={`text-[13.5px] font-bold ${reached ? "text-success" : "text-primary"}`}>
                        {reached ? a.unlocked : a.progress(have, m.paid)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
          <p className="border-t border-line px-6 py-4 text-[13.5px] text-muted">{a.note}</p>
        </div>
      </div>
    </section>
  );
}

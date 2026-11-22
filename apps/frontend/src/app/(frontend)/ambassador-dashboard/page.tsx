import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { logoutFromDashboard } from "@/actions/olympiad/dashboard";
import { CopyButton } from "@/components/olympiad/CopyButton";
import { DashboardLogin } from "@/components/olympiad/DashboardLogin";
import { olympiadApiLive } from "@/lib/olympiad";
import { dashboardData, type AmbassadorDashboard } from "@/lib/olympiad/session";
import { formatIstDate } from "@/lib/olympiad/settings";
import { themeColors } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Ambassador dashboard",
  robots: { index: false, follow: false },
};

/** Shared over WhatsApp and printed, so the QR is a sharp PNG in the site's dark ink. */
const qrPng = (url: string) => QRCode.toDataURL(url, { width: 600, margin: 2, color: { dark: themeColors.dark, light: "#ffffff" } });

export default async function AmbassadorDashboardPage() {
  if (!olympiadApiLive) notFound();
  const ambassador = await dashboardData<AmbassadorDashboard>("ambassador");

  if (!ambassador) {
    return (
      <section className="bg-soft py-16 sm:py-24">
        <div className="wrap">
          <DashboardLogin
            kind="ambassador"
            title="Ambassador dashboard"
            intro="Log in with the email and password the CNA team shared with you after your approval."
          />
        </div>
      </section>
    );
  }

  const { shareUrl, milestones } = ambassador;
  const { clicks, registered, paid } = ambassador.stats;
  const qr = await qrPng(shareUrl);
  const subtitle = [ambassador.role, ambassador.city, ambassador.approvedAt && `Ambassador since ${formatIstDate(ambassador.approvedAt)}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="bg-soft py-12 sm:py-16">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Adventure Olympiad 2.0</p>
            <h1 className="h-section mt-1.5">Your Ambassador dashboard</h1>
          </div>
          <form action={logoutFromDashboard}>
            <input type="hidden" name="kind" value="ambassador" />
            <button type="submit" className="text-[14.5px] font-bold text-primary underline">
              Log out
            </button>
          </form>
        </div>

        <div className="mt-7 overflow-hidden rounded-card border border-line bg-light shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3.5 border-b border-line px-6 py-5">
            <h2 className="font-display text-[21px] font-extrabold">
              {ambassador.name}
              {subtitle && <small className="block font-sans text-[14px] font-normal text-muted">{subtitle}</small>}
            </h2>
            <span className="rounded-full bg-success/12 px-2.5 py-1 font-display text-[12.5px] font-bold text-success">Approved</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-line px-6 py-5">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] text-muted">Your Ambassador code</p>
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-display text-[30px] font-extrabold tracking-wide">{ambassador.code}</p>
                <CopyButton value={ambassador.code} className="text-[14px] font-bold text-primary underline" />
              </div>
              <div className="mt-3 flex max-w-[520px] overflow-hidden rounded-card border-[1.5px] border-line">
                <input readOnly value={shareUrl} aria-label="Your link" className="min-w-0 flex-1 bg-soft px-3.5 py-3 text-[14.5px]" />
                <CopyButton value={shareUrl} className="bg-dark px-4 font-display text-[14px] font-bold text-light hover:bg-black" />
              </div>
              <p className="mt-2 text-[13.5px] text-muted">
                Share this link on WhatsApp. People who open it are counted, and their registration carries your code.
              </p>
            </div>
            <a
              href={qr}
              download={`olympiad-${ambassador.code}.png`}
              className="group grid shrink-0 justify-items-center gap-1.5 text-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a generated data URL; next/image adds nothing here */}
              <img src={qr} alt={`QR code for ${shareUrl}`} width={132} height={132} className="rounded-card border border-line" />
              <span className="text-[13px] font-bold text-primary group-hover:underline">Download QR code</span>
            </a>
          </div>

          <dl className="grid grid-cols-3 border-b border-line">
            {[
              { label: "Link opened", value: clicks, tone: "" },
              { label: "Registered", value: registered, tone: "" },
              { label: "Confirmed", value: paid, tone: "text-success" },
            ].map((k) => (
              <div key={k.label} className="border-r border-line px-4 py-4.5 last:border-r-0 sm:px-6">
                <dt className="text-[13.5px] text-muted">{k.label}</dt>
                <dd className={`font-display text-[28px] font-extrabold tabular-nums ${k.tone}`}>{k.value}</dd>
              </div>
            ))}
          </dl>

          {milestones.length > 0 && (
            <div className="px-6 py-5.5">
              <p className="font-display text-[18px] font-extrabold">Your rewards</p>
              <ol className="mt-3.5 grid gap-3 md:grid-cols-3">
                {milestones.map((m, i) => {
                  const have = m.metric === "clicks" ? clicks : paid;
                  const reached = have >= m.paid;
                  const unit = m.metric === "clicks" ? "link opens" : "confirmed registrations";
                  return (
                    <li
                      key={`${m.metric}-${m.paid}`}
                      className={`flex flex-col gap-2 rounded-card border p-4 ${reached ? "border-success bg-success/8" : "border-line"}`}
                    >
                      <span className="text-[13px] font-bold text-muted">Step {i + 1}</span>
                      <b className="font-display text-[19px] leading-tight">{m.reward}</b>
                      <span className="text-[14px] text-muted">
                        {m.paid}+ {unit}
                      </span>
                      <div
                        className="mt-auto h-2.5 overflow-hidden rounded-full bg-soft"
                        role="progressbar"
                        aria-label={`${m.reward}: ${Math.min(have, m.paid)} of ${m.paid} ${unit}`}
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
                        {reached ? "Unlocked. The CNA team will contact you." : `${have} of ${m.paid} · ${m.paid - have} to go`}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
          <p className="border-t border-line px-6 py-4 text-[13.5px] text-muted">
            A registration is confirmed once its fee is paid; Group 0 is free and counts when the form is complete. You see counts only, not
            other people&apos;s personal details. Rewards are given by the CNA team, who contact you when you unlock one.
          </p>
        </div>
      </div>
    </section>
  );
}

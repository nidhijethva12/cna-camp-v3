import type { Metadata } from "next";
import { Noto_Sans_Gujarati } from "next/font/google";
import { notFound } from "next/navigation";
import { logoutFromDashboard } from "@/actions/olympiad/dashboard";
import { CopyButton } from "@/components/olympiad/CopyButton";
import { DashboardLanguage } from "@/components/olympiad/DashboardLanguage";
import { DashboardLogin } from "@/components/olympiad/DashboardLogin";
import { SchoolPay } from "@/components/olympiad/SchoolPay";
import { StudentImport } from "@/components/olympiad/StudentImport";
import { StudentSheet } from "@/components/olympiad/StudentSheet";
import { dashboardText } from "@/content/dashboards";
import { olympiadApiLive } from "@/lib/olympiad";
import { dashboardLanguage } from "@/lib/olympiad/dashboardLanguage";
import { GROUPS } from "@/lib/olympiad/rules";
import { dashboardData, type SchoolDashboard } from "@/lib/olympiad/session";

const gujarati = Noto_Sans_Gujarati({ subsets: ["gujarati"], variable: "--font-gujarati", display: "swap" });

export const metadata: Metadata = {
  title: "School dashboard",
  robots: { index: false, follow: false },
};

export default async function SchoolDashboardPage() {
  if (!olympiadApiLive) notFound();
  const school = await dashboardData<SchoolDashboard>("school");
  const lang = await dashboardLanguage(school?.language);
  const t = dashboardText[lang];
  const shell = `bg-soft ${gujarati.variable} ${lang === "gu" ? "lang-gu" : ""}`;

  if (!school) {
    return (
      <section lang={lang} className={`${shell} py-16 sm:py-24`}>
        <div className="wrap">
          <DashboardLogin kind="school" lang={lang} />
        </div>
      </section>
    );
  }

  const s = t.school;
  // Everyone with a fee still to pay, whether or not their documents are in: the school pays for all of them at once.
  const unpaid = school.sheet.filter((x) => x.fee > 0 && (x.status === "documents" || x.status === "pending"));
  const due = unpaid.reduce((sum, x) => sum + x.fee, 0);
  // The fee, group by group: how many students, what each pays, what is paid and what is left.
  const groups = GROUPS.map((group) => {
    const members = school.sheet.filter((x) => x.group === group);
    const paid = members.filter((x) => x.status === "paid").reduce((sum, x) => sum + x.fee, 0);
    const total = members.reduce((sum, x) => sum + x.fee, 0);
    return { group, count: members.length, each: [...new Set(members.map((x) => x.fee))], total, paid, toPay: total - paid };
  }).filter((g) => g.count > 0);
  const sum = (key: "count" | "total" | "paid" | "toPay") => groups.reduce((n, g) => n + g[key], 0);
  const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <section lang={lang} className={`${shell} py-12 sm:py-16`}>
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{s.eyebrow}</p>
            <h1 className="h-section mt-1.5">{s.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <DashboardLanguage lang={lang} label={t.language} />
            <form action={logoutFromDashboard}>
              <input type="hidden" name="kind" value="school" />
              <button type="submit" className="text-[14.5px] font-bold text-primary underline">
                {t.logOut}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-card border border-line bg-light shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3.5 border-b border-line px-6 py-5">
            <h2 className="font-display text-[21px] font-extrabold">
              {school.name}
              <small className="block font-sans text-[14px] font-normal text-muted">
                {s.subtitle(school.code, s.types[school.type] ?? "", school.district)}
              </small>
            </h2>
            {unpaid.length > 0 ? (
              <SchoolPay count={unpaid.length} amount={due} waiting={school.stats.documentsPending} lang={lang} />
            ) : (
              <span className="rounded-full bg-success/12 px-2.5 py-1 font-display text-[12.5px] font-bold text-success">{t.approved}</span>
            )}
          </div>

          <dl className="grid grid-cols-2 border-b border-line md:grid-cols-5">
            {[
              { label: s.tiles.students, value: school.sheet.length, tone: "" },
              { label: s.tiles.documents, value: school.stats.documentsPending, tone: "text-muted" },
              { label: s.tiles.ready, value: school.pay.count, tone: "text-primary" },
              { label: s.tiles.confirmed, value: school.stats.paid, tone: "text-success" },
              { label: s.tiles.total, value: `₹${due.toLocaleString("en-IN")}`, tone: "text-primary" },
            ].map((k) => (
              <div key={k.label} className="border-r border-b border-line px-6 py-4.5 last:col-span-2 md:border-b-0 md:last:col-span-1">
                <dt className="text-[13.5px] text-muted">{k.label}</dt>
                <dd className={`font-display text-[28px] font-extrabold tabular-nums ${k.tone}`}>{k.value}</dd>
              </div>
            ))}
          </dl>

          {groups.length > 0 && (
            <div className="border-b border-line px-6 py-5">
              <p className="font-display font-bold">{s.summary.title}</p>
              <p className="mt-1 text-[14.5px] text-muted">{s.summary.text}</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-[14.5px] tabular-nums">
                  <thead className="bg-soft text-[13px] text-muted">
                    <tr>
                      {[s.summary.group, s.summary.students, s.summary.feeEach, s.summary.total, s.summary.paid, s.summary.toPay].map(
                        (h) => (
                          <th key={h} scope="col" className="px-4 py-2.5 font-semibold">
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {groups.map((g) => (
                      <tr key={g.group}>
                        <th scope="row" className="px-4 py-2.5 font-display font-bold">
                          {s.summary.group} {g.group}
                        </th>
                        <td className="px-4 py-2.5">{g.count}</td>
                        <td className="px-4 py-2.5">{g.each.map((fee) => (fee ? rupees(fee) : s.summary.free)).join(" / ")}</td>
                        <td className="px-4 py-2.5">{g.total ? rupees(g.total) : s.summary.free}</td>
                        <td className="px-4 py-2.5 text-success">{rupees(g.paid)}</td>
                        <td className="px-4 py-2.5 font-bold text-primary">{rupees(g.toPay)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-line font-display font-extrabold">
                    <tr>
                      <th scope="row" className="px-4 py-2.5">
                        {s.summary.all}
                      </th>
                      <td className="px-4 py-2.5">{sum("count")}</td>
                      <td className="px-4 py-2.5" />
                      <td className="px-4 py-2.5">{rupees(sum("total"))}</td>
                      <td className="px-4 py-2.5 text-success">{rupees(sum("paid"))}</td>
                      <td className="px-4 py-2.5 text-primary">{rupees(sum("toPay"))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          <div className="border-b border-line px-6 py-5">
            <p className="font-display font-bold">{s.classLink}</p>
            <p className="mt-1 text-[14.5px] text-muted">{s.classLinkText}</p>
            <div className="mt-3 flex max-w-[560px] overflow-hidden rounded-card border-[1.5px] border-line">
              <input
                readOnly
                value={school.classLink}
                aria-label={s.classLink}
                className="min-w-0 flex-1 bg-soft px-3.5 py-3 text-[14.5px]"
              />
              <CopyButton
                value={school.classLink}
                label={t.copy}
                copiedLabel={t.copied}
                className="bg-dark px-4 font-display text-[14px] font-bold whitespace-nowrap text-light hover:bg-black"
              />
            </div>
          </div>

          <StudentImport lang={lang} />

          {school.sheet.length ? (
            <StudentSheet students={school.sheet} lang={lang} />
          ) : (
            <p className="border-b border-line px-6 py-8 text-center text-muted">{s.empty}</p>
          )}
          <p className="px-6 py-4 text-[13.5px] text-muted">{s.note}</p>
        </div>
      </div>
    </section>
  );
}

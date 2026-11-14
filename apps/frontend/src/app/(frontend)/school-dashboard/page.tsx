import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { logoutFromDashboard } from "@/actions/olympiad/dashboard";
import { CopyButton } from "@/components/olympiad/CopyButton";
import { DashboardLogin } from "@/components/olympiad/DashboardLogin";
import { SchoolPay } from "@/components/olympiad/SchoolPay";
import { StudentImport } from "@/components/olympiad/StudentImport";
import { olympiadApiLive } from "@/lib/olympiad";
import { INSTITUTION_TYPES } from "@/lib/olympiad/rules";
import { dashboardData, type SchoolDashboard } from "@/lib/olympiad/session";

export const metadata: Metadata = {
  title: "School dashboard",
  robots: { index: false, follow: false },
};

const PAYMENT = {
  free: { label: "Free", tone: "bg-success/12 text-success" },
  paid: { label: "Paid", tone: "bg-success/12 text-success" },
  pending: { label: "Pending", tone: "bg-primary-soft text-primary" },
  failed: { label: "Failed", tone: "bg-primary-soft text-primary" },
} as const;

export default async function SchoolDashboardPage() {
  if (!olympiadApiLive) notFound();
  const school = await dashboardData<SchoolDashboard>("school");

  if (!school) {
    return (
      <section className="bg-soft py-16 sm:py-24">
        <div className="wrap">
          <DashboardLogin
            kind="school"
            title="School dashboard"
            intro="Log in with the school email and the password the CNA team shared with your coordinator."
          />
        </div>
      </section>
    );
  }

  const type = INSTITUTION_TYPES.find((t) => t.value === school.type)?.label;
  const subtitle = [`School code ${school.code}`, type && `${type} school`, school.district].filter(Boolean).join(" · ");

  return (
    <section className="bg-soft py-12 sm:py-16">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Adventure Olympiad 2.0 · School Partner</p>
            <h1 className="h-section mt-1.5">School dashboard</h1>
          </div>
          <form action={logoutFromDashboard}>
            <input type="hidden" name="kind" value="school" />
            <button type="submit" className="text-[14.5px] font-bold text-primary underline">
              Log out
            </button>
          </form>
        </div>

        <div className="mt-7 overflow-hidden rounded-card border border-line bg-light shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3.5 border-b border-line px-6 py-5">
            <h2 className="font-display text-[21px] font-extrabold">
              {school.name}
              <small className="block font-sans text-[14px] font-normal text-muted">{subtitle}</small>
            </h2>
            {school.pay.count > 0 ? (
              <SchoolPay count={school.pay.count} amount={school.pay.amount} />
            ) : (
              <span className="rounded-full bg-success/12 px-2.5 py-1 font-display text-[12.5px] font-bold text-success">Approved</span>
            )}
          </div>

          <dl className="grid grid-cols-2 border-b border-line md:grid-cols-5">
            {[
              { label: "Students registered", value: school.stats.students, tone: "" },
              { label: "Paid", value: school.stats.paid, tone: "text-success" },
              { label: "Payment pending", value: school.stats.pending, tone: "text-primary" },
              { label: "Parent consent pending", value: school.stats.consentPending, tone: "text-primary" },
              { label: "Waiting for parent", value: school.stats.waitingForParent, tone: "text-muted" },
            ].map((k) => (
              <div key={k.label} className="border-r border-b border-line px-6 py-4.5 last:col-span-2 md:border-b-0 md:last:col-span-1">
                <dt className="text-[13.5px] text-muted">{k.label}</dt>
                <dd className={`font-display text-[28px] font-extrabold tabular-nums ${k.tone}`}>{k.value}</dd>
              </div>
            ))}
          </dl>

          <div className="border-b border-line px-6 py-5">
            <p className="font-display font-bold">Class link</p>
            <p className="mt-1 text-[14.5px] text-muted">
              Share it in your class WhatsApp groups. Parents fill in their child&apos;s details; the school code is added automatically.
            </p>
            <div className="mt-3 flex max-w-[560px] overflow-hidden rounded-card border-[1.5px] border-line">
              <input
                readOnly
                value={school.classLink}
                aria-label="Class link"
                className="min-w-0 flex-1 bg-soft px-3.5 py-3 text-[14.5px]"
              />
              <CopyButton value={school.classLink} className="bg-dark px-4 font-display text-[14px] font-bold text-light hover:bg-black" />
            </div>
          </div>

          <StudentImport />

          {school.invited.length > 0 && (
            <div className="border-b border-line">
              <p className="px-6 pt-5 font-display font-bold">Waiting for parent ({school.invited.length})</p>
              <p className="px-6 text-[14px] text-muted">
                Added from Excel. Once the parent finishes the form, the student moves to the list below with a registration number.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-[14.5px]">
                  <thead className="bg-soft text-[13px] text-muted">
                    <tr>
                      {["Student", "Class", "Group", "Parent link"].map((h) => (
                        <th key={h} scope="col" className="px-6 py-3 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {school.invited.map((s) => (
                      <tr key={s.id}>
                        <td className="px-6 py-3 font-display font-bold">{s.name}</td>
                        <td className="px-6 py-3">{s.stage}</td>
                        <td className="px-6 py-3">{s.group}</td>
                        <td className="px-6 py-3">
                          <span className="mr-3 text-[13px] text-muted">{s.emailed ? "Emailed" : "Not emailed"}</span>
                          <CopyButton
                            value={s.link}
                            label="Copy link"
                            className="rounded-card border border-line px-3 py-1.5 font-display text-[13px] font-bold hover:border-dark"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {school.students.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[14.5px]">
                <thead className="bg-soft text-[13px] text-muted">
                  <tr>
                    {["Student", "Class", "Group", "Fee", "Payment", "Parent consent"].map((h) => (
                      <th key={h} scope="col" className="px-6 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {school.students.map((s) => (
                    <tr key={s.id}>
                      <td className="px-6 py-3">
                        <b className="block font-display">{s.name}</b>
                        <span className="text-[13px] text-muted">{s.regId}</span>
                      </td>
                      <td className="px-6 py-3">{s.stage}</td>
                      <td className="px-6 py-3">{s.group}</td>
                      <td className="px-6 py-3 tabular-nums">{s.fee != null ? `₹${s.fee}` : "–"}</td>
                      <td className="px-6 py-3">
                        <span className={`rounded-full px-2.5 py-1 font-display text-[12.5px] font-bold ${PAYMENT[s.paymentStatus].tone}`}>
                          {PAYMENT[s.paymentStatus].label}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 font-display text-[12.5px] font-bold ${s.parentConsent ? "bg-success/12 text-success" : "bg-soft text-muted"}`}
                        >
                          {s.parentConsent ? "Done" : "Waiting"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-6 py-8 text-center text-muted">
              No registered students yet. Share the class link or upload your Excel sheet above.
            </p>
          )}
          <p className="border-t border-line px-6 py-4 text-[13.5px] text-muted">
            The group and fee are set from the date of birth and school type automatically. Each paid student gets a confirmation with their
            registration number.
          </p>
        </div>
      </div>
    </section>
  );
}

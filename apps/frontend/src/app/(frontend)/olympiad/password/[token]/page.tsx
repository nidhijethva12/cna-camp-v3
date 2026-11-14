import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SetPasswordForm } from "@/components/olympiad/SetPasswordForm";
import { dashboardPath } from "@/content/partnerPages";
import { olympiadApiLive } from "@/lib/olympiad";
import { callBackend } from "@/lib/olympiad/backend";

export const metadata: Metadata = { title: "Choose your password", robots: { index: false, follow: false } };

type Preview = { valid: false } | { valid: true; kind: "school" | "ambassador"; name: string; email: string };

export default async function SetPasswordPage({ params }: PageProps<"/olympiad/password/[token]">) {
  if (!olympiadApiLive) notFound();
  const { token } = await params;
  const preview = await callBackend<Preview>("/olympiad/partners/password/preview", { body: { token } });
  const ok = preview.ok && preview.data.valid ? preview.data : null;

  return (
    <section className="bg-soft py-16 sm:py-24">
      <div className="wrap max-w-[480px]">
        <div className="rounded-card border border-t-4 border-line border-t-primary bg-light p-6 shadow-card sm:p-8">
          <p className="eyebrow text-[14px]!">Adventure Olympiad 2.0</p>
          <h1 className="mt-1 text-[26px] leading-tight">Choose your dashboard password</h1>
          {ok ? (
            <>
              <p className="mt-2 text-[15px] text-muted">
                Hi {ok.name.split(" ")[0]}. You will log in with <b className="text-dark">{ok.email}</b> and this password.
              </p>
              <SetPasswordForm token={token} />
            </>
          ) : (
            <>
              <p className="mt-3 text-[15.5px] text-muted">
                {preview.ok
                  ? "This link has expired or was already used. You can ask for a new one from the dashboard login with “Forgot your password?”."
                  : preview.message}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={dashboardPath.school} className="btn btn-outline">
                  School login
                </Link>
                <Link href={dashboardPath.ambassador} className="btn btn-outline">
                  Ambassador login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

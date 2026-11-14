import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LinkConfirm } from "@/components/olympiad/LinkConfirm";
import { olympiadApiLive } from "@/lib/olympiad";
import { callBackend } from "@/lib/olympiad/backend";

export const metadata: Metadata = { title: "Parent consent", robots: { index: false, follow: false } };

export default async function ConsentPage({ params }: PageProps<"/olympiad/consent/[token]">) {
  if (!olympiadApiLive) notFound();
  const { token } = await params;
  const preview = await callBackend<{ name: string; parentName: string | null; done: boolean }>("/olympiad/links/consent/preview", {
    body: { token },
  });

  return (
    <section className="bg-soft py-16 sm:py-24">
      <div className="wrap max-w-[560px]">
        <div className="rounded-card border border-line bg-light p-6 sm:p-8">
          <p className="eyebrow">Adventure Olympiad 2.0</p>
          <h1 className="h-sub mt-1.5">Parent or guardian consent</h1>
          {!preview.ok ? (
            <p className="mt-3 text-muted">{preview.message}</p>
          ) : preview.data.done ? (
            <p className="mt-3 text-muted">Consent for {preview.data.name} is already recorded. Thank you.</p>
          ) : (
            <>
              <p className="mt-3 mb-5 text-muted">
                {preview.data.parentName ? `${preview.data.parentName}, your` : "Your"} child{" "}
                <b className="text-dark">{preview.data.name}</b> has been registered for Adventure Olympiad 2.0. Please confirm that you
                agree to them taking part and to CNA keeping these details for the Olympiad.
              </p>
              <LinkConfirm kind="consent" token={token} label="I agree" doneText="Thank you. Your consent is recorded." />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

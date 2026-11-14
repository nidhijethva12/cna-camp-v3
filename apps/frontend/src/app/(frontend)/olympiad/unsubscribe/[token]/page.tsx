import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LinkConfirm } from "@/components/olympiad/LinkConfirm";
import { olympiadApiLive } from "@/lib/olympiad";
import { callBackend } from "@/lib/olympiad/backend";

export const metadata: Metadata = { title: "Stop Olympiad emails", robots: { index: false, follow: false } };

export default async function UnsubscribePage({ params }: PageProps<"/olympiad/unsubscribe/[token]">) {
  if (!olympiadApiLive) notFound();
  const { token } = await params;
  const preview = await callBackend<{ name: string; done: boolean }>("/olympiad/links/unsubscribe/preview", { body: { token } });

  return (
    <section className="bg-soft py-16 sm:py-24">
      <div className="wrap max-w-[560px]">
        <div className="rounded-card border border-line bg-light p-6 sm:p-8">
          <p className="eyebrow">Adventure Olympiad 2.0</p>
          <h1 className="h-sub mt-1.5">Stop Olympiad emails</h1>
          {!preview.ok ? (
            <p className="mt-3 text-muted">{preview.message}</p>
          ) : preview.data.done ? (
            <p className="mt-3 text-muted">Olympiad emails are already stopped for {preview.data.name}.</p>
          ) : (
            <>
              <p className="mt-3 mb-5 text-muted">
                {preview.data.name} will get no more Olympiad emails. Important messages such as quiz links still come on WhatsApp.
              </p>
              <LinkConfirm kind="unsubscribe" token={token} label="Stop the emails" doneText="Done. Olympiad emails are stopped." />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

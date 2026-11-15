import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CheckoutOrder } from "@/actions/olympiad/register";
import { PaymentStep } from "@/components/olympiad/PaymentStep";
import { olympiadApiLive } from "@/lib/olympiad";
import { callBackend } from "@/lib/olympiad/backend";

export const metadata: Metadata = { title: "Pay the Olympiad fee", robots: { index: false, follow: false } };

interface Resume {
  regId: string;
  name: string;
  group: string;
  fee: number;
  email: string;
  whatsapp: string;
  paid: boolean;
  order: CheckoutOrder;
  receiptToken?: string | null;
}

/** "Pay now" from the fee-pending WhatsApp message: a fresh order for one saved registration. */
export default async function PayPage({ params }: PageProps<"/olympiad/pay/[token]">) {
  if (!olympiadApiLive) notFound();
  const { token } = await params;
  const result = await callBackend<Resume>("/olympiad/payments/resume", { body: { token } });

  return (
    <section className="bg-soft py-16 sm:py-24">
      <div className="wrap max-w-[560px]">
        <div className="rounded-card border border-t-4 border-line border-t-primary bg-light p-6 shadow-card sm:p-8">
          <p className="eyebrow">Adventure Olympiad 2.0</p>
          <h1 className="h-sub mt-1.5 mb-5">Pay the registration fee</h1>
          {!result.ok ? (
            <>
              <p className="text-muted">{result.message}</p>
              <Link href="/olympiad" className="btn btn-primary mt-5">
                Go to the Olympiad page
              </Link>
            </>
          ) : result.data.paid ? (
            <>
              <p className="text-muted">
                The fee for {result.data.name} ({result.data.regId}) is already paid. Thank you!
              </p>
              {result.data.receiptToken && (
                <Link href={`/olympiad/receipt/${result.data.receiptToken}`} className="btn btn-primary mt-5">
                  Open the receipt
                </Link>
              )}
            </>
          ) : (
            <PaymentStep
              autoOpen={false}
              summary={{ ...result.data, prefill: { name: result.data.name, email: result.data.email, contact: result.data.whatsapp } }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

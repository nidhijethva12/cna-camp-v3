"use client";

import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";

/** Shown inside the site layout, so the header, footer and WhatsApp/call shortcuts stay available. */
export default function PageError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="wrap py-32 text-center">
      <p className="font-mono text-primary">SOMETHING WENT WRONG</p>
      <h1 className="h-page mt-4">This page didn&apos;t load properly.</h1>
      <p className="mx-auto mt-4 max-w-xl text-muted">
        It is usually a short hiccup. Try again, or reach us on WhatsApp or by phone using the buttons on this page.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-dark">
          Try again
        </button>
        <Link href="/trips" className="btn btn-primary">
          See trips <ArrowRight />
        </Link>
      </div>
    </section>
  );
}

"use client";

import "./(frontend)/globals.css";

/** Last resort when the root layout itself fails (for example the database is unreachable). */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-light text-dark">
        <main className="wrap py-32 text-center">
          <p className="font-mono text-primary">CNA CAMP</p>
          <h1 className="h-page mt-4">We&apos;ll be right back.</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">The site is having a short hiccup. Please try again in a minute.</p>
          <div className="mt-8 flex justify-center gap-3">
            <button type="button" onClick={reset} className="btn btn-primary">
              Try again
            </button>
            {/* A plain link, not next/link: the app shell that client navigation needs may be what failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="btn btn-dark">
              Home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}

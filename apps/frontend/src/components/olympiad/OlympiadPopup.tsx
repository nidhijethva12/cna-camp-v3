"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ArrowRight, CheckCircle, Close, Star, Trophy } from "@/components/ui/icons";

const SEEN_KEY = "cna-olympiad-popup-seen";
const DELAY_MS = 2500;

const reasons = [
  "Astro and star-gazing sessions",
  "Trekking in the Himalaya",
  "Nature education",
  "A digital detox camp",
  "Instructors with 20+ years",
  "A certificate that counts",
];

/** Olympiad announcement shown once per visit, a few seconds after the first page opens. */
export function OlympiadPopup() {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/olympiad")) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch {
      return;
    }
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      ref.current?.showModal();
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      aria-labelledby="olympiad-popup-title"
      onClick={(e) => e.target === e.currentTarget && close()}
      className="olympiad-popup m-auto max-h-[92dvh] w-[min(92vw,880px)] overflow-hidden rounded-card bg-light p-0 text-dark shadow-float backdrop:bg-dark/65 backdrop:backdrop-blur-sm"
    >
      <div className="grid max-h-[92dvh] overflow-y-auto md:grid-cols-[1fr_1.1fr]">
        <div className="relative h-44 shrink-0 sm:h-56 md:h-auto md:min-h-[460px]">
          <Image
            src="/img/olympiad/students-exam.webp"
            alt="Two school students writing in their notebooks at a classroom desk"
            fill
            sizes="(min-width: 768px) 420px, 92vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-dark/85 via-dark/20 to-transparent" />
          <p className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-tag bg-secondary px-3 py-1.5 text-[13px] font-bold text-dark">
            <Star className="text-[13px]" />
            India&apos;s first Adventure Olympiad
          </p>
          <p className="absolute bottom-4 left-4 text-[15px] font-semibold tracking-wide text-light">Mountain · Desert · Marine</p>
        </div>

        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full text-[20px] text-muted transition hover:bg-soft hover:text-dark"
          >
            <Close />
          </button>

          <p className="eyebrow pr-10">Climber Nature Adventure Club, Rajkot presents</p>
          <h2 id="olympiad-popup-title" className="display mt-2 text-[34px] leading-[1.05] sm:text-[42px]">
            Adventure Olympiad <span className="text-primary">2.0</span>
          </h2>
          <p className="mt-2 text-[16px] text-muted">An Eco-STEM quiz that ends with a camp in the Himalaya.</p>

          <div className="mt-5 flex items-center gap-4 rounded-card bg-dark p-4 text-light">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-[24px] text-dark">
              <Trophy />
            </span>
            <div>
              <p className="display text-[22px] leading-tight text-secondary">Scholarships up to 100%</p>
              <p className="text-[14px] text-light/80">100% for selected government school students</p>
            </div>
          </div>

          <p className="mt-5 text-[15px] font-bold">Why register?</p>
          <ul className="mt-2 grid gap-x-4 gap-y-1.5 text-[15px] sm:grid-cols-2">
            {reasons.map((r) => (
              <li key={r} className="flex gap-2">
                <CheckCircle className="mt-[3px] shrink-0 text-[17px] text-success" />
                {r}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/olympiad" onClick={close} className="btn btn-primary">
              Explore the Olympiad <ArrowRight />
            </Link>
            <button type="button" onClick={close} className="btn border-transparent text-muted hover:text-dark">
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Photo } from "@/components/media/Photo";
import type { PhotoSource } from "@/types/content";

const SLIDE_MS = 3000;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

interface Slide {
  img: PhotoSource;
  alt: string;
  caption: string;
}

/** Crossfading photos with a caption; changes on its own, holds still for reduced motion and hidden tabs. */
export function HeroCarousel({ slides }: { slides: readonly Slide[] }) {
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState(0);
  const reduceMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  const hidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false,
  );
  const count = slides.length;

  const go = (i: number) => {
    setIndex(i);
    setSeen((s) => Math.max(s, i));
  };

  useEffect(() => {
    if (reduceMotion || hidden || count < 2) return;
    const timer = window.setTimeout(() => go((index + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [index, reduceMotion, hidden, count]);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-dark-soft shadow-float ring-1 ring-light/10 lg:aspect-auto lg:h-full lg:min-h-[560px]">
      {/* Photos up to the one after the furthest shown stay mounted, so each loads just before its turn. */}
      {slides.slice(0, Math.min(count, seen + 2)).map((s, i) => (
        <div
          key={s.caption}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}
          aria-hidden={i !== index}
        >
          <Photo img={s.img} alt={s.alt} preload={i === 0} sizes="(min-width: 1024px) 680px, 100vw" />
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-dark/80 via-dark/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
        <p className="text-[16px] font-semibold text-light" aria-live="polite">
          {slides[index]?.caption}
        </p>
        <div className="flex shrink-0 gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.caption}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show photo ${i + 1}: ${s.caption}`}
              aria-current={i === index ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-secondary" : "w-2 bg-light/50 hover:bg-light"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

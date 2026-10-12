"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Photo } from "@/components/media/Photo";
import { Pause, Play } from "@/components/ui/icons";
import type { ImageRef } from "@/types/content";

const SLIDE_MS = 3500;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/**
 * Crossfading photos behind the hero text. Each photo is fetched just before its turn, the show
 * holds still for reduced-motion visitors and in hidden tabs, and can be paused (WCAG 2.2.2).
 */
export function HeroSlides({ images, children }: { images: ImageRef[]; children: ReactNode }) {
  // `seen` is the furthest slide shown so far (photos up to the one after it stay mounted);
  // `turn` counts changes so a returning photo restarts its slow zoom instead of resuming it.
  const [slide, setSlide] = useState({ index: 0, seen: 0, turn: 0, turns: [0] });
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const reduceMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => false);
  const hidden = useSyncExternalStore(subscribeVisibility, () => document.hidden, () => false);
  const paused = userPaused ?? reduceMotion;
  const count = images.length;
  const { index } = slide;
  const mounted = Math.min(count, slide.seen + 2);

  const go = (i: number) =>
    setSlide((s) => {
      const turns = [...s.turns];
      turns[i] = s.turn + 1;
      return { index: i, seen: Math.max(s.seen, i), turn: s.turn + 1, turns };
    });

  useEffect(() => {
    if (paused || hidden || count < 2) return;
    const timer = window.setTimeout(() => go((index + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused, hidden, count]);

  return (
    <>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {images.slice(0, mounted).map((img, i) => (
          <div
            key={img.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}
            aria-hidden={i !== index}
          >
            {/* Every mounted photo keeps zooming, so the outgoing one never snaps back while it fades out. */}
            <Photo
              key={slide.turns[i] ?? 0}
              img={img}
              preload={i === 0}
              sizes="100vw"
              className={`animate-kenburns ${paused ? "[animation-play-state:paused]" : ""}`}
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-dark/20 via-dark/30 via-40% to-dark/92" />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-dark/70 via-dark/35 via-45% to-transparent to-75%" />

      <div className="wrap flex min-h-[640px] flex-col justify-end pb-36 pt-24 md:min-h-[720px]">
        {children}
        {count > 1 && (
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setUserPaused(!paused)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-light/40 text-light transition hover:bg-light/15"
              aria-label={paused ? "Play the photo slideshow" : "Pause the photo slideshow"}
            >
              {paused ? <Play className="ml-0.5 text-[14px]" /> : <Pause className="text-[14px]" />}
            </button>
            <div className="flex items-center gap-1">
              {images.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => go(i)}
                  className="flex h-6 items-center px-1"
                  aria-label={`Show photo ${i + 1} of ${count}`}
                  aria-current={i === index}
                >
                  <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-8 bg-secondary" : "w-2.5 bg-light/50"}`} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

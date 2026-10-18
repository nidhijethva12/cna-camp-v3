"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Photo } from "@/components/media/Photo";
import type { ImageRef } from "@/types/content";

const SLIDE_MS = 3000;
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
 * Crossfading photos behind the hero text, changing on their own. Each photo is fetched just before
 * its turn; the show holds still for reduced-motion visitors and while the tab is hidden.
 */
export function HeroSlides({ images, children }: { images: ImageRef[]; children: ReactNode }) {
  // `seen` is the furthest slide shown so far (photos up to the one after it stay mounted);
  // `turn` counts changes so a returning photo restarts its slow zoom instead of resuming it.
  const [slide, setSlide] = useState({ index: 0, seen: 0, turn: 0, turns: [0] });
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
    if (reduceMotion || hidden || count < 2) return;
    const timer = window.setTimeout(() => go((index + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [index, reduceMotion, hidden, count]);

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
              className={`animate-kenburns ${reduceMotion ? "[animation-play-state:paused]" : ""}`}
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-dark/20 via-dark/30 via-40% to-dark/92" />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-dark/70 via-dark/35 via-45% to-transparent to-75%" />

      <div className="wrap flex flex-col justify-end pt-14 pb-32 sm:pt-20 md:min-h-[600px] md:pb-36">{children}</div>
    </>
  );
}

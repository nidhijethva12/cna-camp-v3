"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Close, Pause, Play } from "@/components/ui/icons";
import type { Video } from "@/types/content";

interface VideoGridProps {
  videos: Video[];
  /** next/image `sizes` for one card's poster. */
  sizes: string;
  className?: string;
}

/** Phone clips as small cards: a tap opens the clip with sound; "ambient" clips loop silently in place. */
export function VideoGrid({ videos, sizes, className = "" }: VideoGridProps) {
  return (
    <ul className={`grid gap-3 ${className}`}>
      {videos.map((v) => (
        <li key={v.id}>{v.ambient ? <AmbientVideo video={v} /> : <PlayableVideo video={v} sizes={sizes} />}</li>
      ))}
    </ul>
  );
}

const cardClass = "group relative block aspect-[3/4] w-full overflow-hidden rounded-card bg-dark text-left text-light";

function Caption({ title, label }: { title: string; label: string }) {
  return (
    <span className="absolute inset-x-0 bottom-0 bg-linear-to-b from-transparent to-dark/85 p-4 pt-12">
      <span className="block font-medium text-[13.5px] text-light/75">{label}</span>
      <span className="mt-1 block text-[15px] font-semibold leading-snug">{title}</span>
    </span>
  );
}

function PlayableVideo({ video, sizes }: { video: Video; sizes: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  // The dialog opens before the clip renders, so move focus to Close once it exists.
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  const show = () => {
    setOpen(true);
    dialogRef.current?.showModal();
  };

  return (
    <>
      <button type="button" onClick={show} className={cardClass} aria-label={`Play video: ${video.title}`}>
        <Image src={video.poster.src} alt="" fill sizes={sizes} className="object-cover transition duration-700 group-hover:scale-[1.04]" />
        <span className="absolute left-1/2 top-[42%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary shadow-float transition group-hover:scale-110">
          <Play className="ml-0.5 text-[22px]" />
        </span>
        <Caption title={video.title} label="Watch" />
      </button>
      <dialog
        ref={dialogRef}
        aria-label={video.title}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
        className="m-auto overflow-visible bg-transparent p-0 backdrop:bg-black/85"
      >
        {/* Mounted only while open, so closing stops playback and nothing downloads before a tap. */}
        {open && (
          <>
            <video
              src={video.src}
              poster={video.poster.src}
              controls
              autoPlay
              playsInline
              className={`rounded-card bg-black ${video.portrait ? "h-[min(80vh,760px)] w-auto max-w-[94vw]" : "max-h-[80vh] w-[min(94vw,1000px)]"}`}
            />
            <div className="mt-3 flex items-center justify-between gap-4 text-light">
              <p className="font-semibold">{video.title}</p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="btn btn-primary min-h-11! px-4!"
                aria-label="Close video"
              >
                <Close className="text-[18px]" />
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}

function AmbientVideo({ video }: { video: Video }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);
  // Stays still once the visitor pauses it, and for anyone who prefers reduced motion.
  const heldRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) heldRef.current = true;
    // Plays only while on screen, so the clip never downloads for visitors who never scroll to it.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !heldRef.current) el.play().catch(() => setPaused(true));
      else el.pause();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    heldRef.current = !el.paused;
    if (el.paused) el.play().catch(() => setPaused(true));
    else el.pause();
  };

  return (
    <div className={cardClass}>
      <video
        ref={ref}
        src={video.src}
        poster={video.poster.src}
        muted
        loop
        playsInline
        preload="none"
        aria-label={video.poster.alt}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <Caption title={video.title} label="Silent clip" />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-dark/60 text-light backdrop-blur-sm transition hover:bg-dark"
        aria-label={paused ? `Play ${video.title}` : `Pause ${video.title}`}
      >
        {paused ? <Play className="ml-0.5 text-[18px]" /> : <Pause className="text-[18px]" />}
      </button>
    </div>
  );
}

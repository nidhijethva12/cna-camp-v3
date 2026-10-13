"use client";

import Image from "next/image";
import { useState } from "react";
import { Camera, Play } from "@/components/ui/icons";
import { photoSrc } from "@/lib/photos";
import type { PhotoSource } from "@/types/content";

interface PhotoProps {
  /** CMS image or design photo key (e.g. "cna/manali/01"). Empty shows a labelled placeholder. */
  img?: PhotoSource | null;
  /** Defaults to the CMS image's own alt text. */
  alt?: string;
  /** Placeholder caption, e.g. the region or what photo is needed. */
  label?: string;
  wide?: boolean;
  preload?: boolean;
  sizes?: string;
  className?: string;
}

/** Fills its (positioned) parent, shimmering until the photo arrives. Missing photos render a "Photo coming soon" placeholder. */
export function Photo({ img, alt, label, wide, preload, sizes = "(min-width: 1024px) 50vw, 100vw", className = "" }: PhotoProps) {
  const [loaded, setLoaded] = useState(false);
  if (!img) return <PhotoPlaceholder label={label} className={className} />;
  return (
    <Image
      src={photoSrc(img, { wide })}
      alt={alt ?? (typeof img === "string" ? "" : img.alt)}
      fill
      preload={preload}
      sizes={sizes}
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)}
      className={`object-cover ${loaded ? "" : "skeleton"} ${className}`}
      style={typeof img !== "string" && img.focalX != null ? { objectPosition: `${img.focalX}% ${img.focalY ?? 50}%` } : undefined}
    />
  );
}

export function PhotoPlaceholder({ label, kind = "photo", dark = false, className = "" }: { label?: string; kind?: "photo" | "video"; dark?: boolean; className?: string }) {
  const need = kind === "video" ? "Video coming soon" : "Photo coming soon";
  return (
    <div
      role="img"
      aria-label={label ? `${need}: ${label}` : need}
      className={`absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center ${dark ? "bg-dark-soft text-light/70" : "bg-soft text-muted"} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`flex h-14 w-14 items-center justify-center rounded-full ${dark ? "bg-light/10" : "bg-light shadow-card"}`}
      >
        {kind === "video" ? <Play className="ml-0.5 text-[22px]" /> : <Camera className="text-[26px]" />}
      </span>
      <span className="font-mono text-[11.5px] uppercase tracking-[.1em]">{need}</span>
      {label && <span className="max-w-[260px] text-[14px] leading-snug">{label}</span>}
    </div>
  );
}

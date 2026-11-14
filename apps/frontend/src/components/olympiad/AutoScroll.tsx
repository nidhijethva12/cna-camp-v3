"use client";

import { useEffect, useRef, type ReactNode } from "react";

const SPEED = 18; // pixels per second
const REST_MS = 2500; // pause at the top and at the end

/**
 * A fixed-height list that scrolls itself slowly, then returns to the top. It stops while the visitor
 * points at it, touches it or tabs into it, can always be scrolled by hand, and stays still for anyone
 * who prefers reduced motion.
 */
export function AutoScroll({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let held = false;
    let restUntil = performance.now() + REST_MS;
    let position = el.scrollTop;
    let last = performance.now();
    let frame = 0;
    let releaseTimer = 0;

    const hold = () => {
      held = true;
      window.clearTimeout(releaseTimer);
    };
    const release = (afterMs = 0) => {
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => {
        held = false;
        position = el.scrollTop;
        restUntil = performance.now() + REST_MS;
      }, afterMs);
    };
    const onLeave = () => {
      if (!el.contains(document.activeElement)) release();
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node | null)) release();
    };
    const onTouchEnd = () => release(3000);

    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      const end = el.scrollHeight - el.clientHeight;
      if (!held && end > 0 && document.visibilityState === "visible" && now >= restUntil) {
        if (el.scrollTop >= end - 1) {
          el.scrollTo({ top: 0, behavior: "smooth" });
          position = 0;
          restUntil = now + REST_MS * 2;
        } else {
          position += (SPEED * dt) / 1000;
          el.scrollTop = position;
          if (position >= end) restUntil = now + REST_MS;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    el.addEventListener("pointerenter", hold);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("focusin", hold);
    el.addEventListener("focusout", onFocusOut);
    el.addEventListener("touchstart", hold, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("wheel", hold, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(releaseTimer);
      el.removeEventListener("pointerenter", hold);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("focusin", hold);
      el.removeEventListener("focusout", onFocusOut);
      el.removeEventListener("touchstart", hold);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("wheel", hold);
    };
  }, []);

  return (
    <div ref={box} role="region" aria-label={label} tabIndex={0} className={`overflow-y-auto overscroll-contain ${className}`}>
      {children}
    </div>
  );
}

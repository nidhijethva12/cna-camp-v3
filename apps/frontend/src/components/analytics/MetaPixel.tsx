"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackPixel, type PixelEvent } from "@/lib/metaPixel";

const WHATSAPP_LINK = 'a[href*="wa.me/"], a[href*="api.whatsapp.com"], a[href^="whatsapp:"]';

/** Meta Pixel for the whole site: one PageView per page (also on moves without a reload) and Contact on any WhatsApp button. */
export function MetaPixel() {
  const pathname = usePathname();
  useEffect(() => {
    trackPixel("PageView");
  }, [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest(WHATSAPP_LINK)) trackPixel("Contact");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}

/** Sends one event when a page shows, for pages that are server-rendered. */
export function PixelEventOnView({ event, params }: { event: PixelEvent; params?: Record<string, string | number> }) {
  useEffect(() => {
    trackPixel(event, params);
    // Once per page view; `params` is a fresh object on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

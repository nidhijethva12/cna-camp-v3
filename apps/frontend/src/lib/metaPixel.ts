type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: Fbq;
  loaded: boolean;
  version: string;
  disablePushState?: boolean;
  allowDuplicatePageViews?: boolean;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const raw = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

/** The Meta Pixel ID (digits only), from the site's environment settings. Without it the pixel stays off. */
export const metaPixelId = /^\d{6,20}$/.test(raw) ? raw : null;

/** Pages whose address carries a personal link (receipt, payment, password) or sits behind a login: never reported to Meta. */
const PRIVATE_PATHS = [
  "/olympiad/pay",
  "/olympiad/receipt",
  "/olympiad/password",
  "/olympiad/consent",
  "/olympiad/unsubscribe",
  "/school-dashboard",
  "/ambassador-dashboard",
];

const start = (id: string) => {
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  // Page views are sent by the MetaPixel component, so the pixel must not also send its own on every navigation.
  fbq.disablePushState = true;
  // Without this the pixel drops every PageView after the first one of a visit.
  fbq.allowDuplicatePageViews = true;
  window.fbq = fbq;
  window._fbq = fbq;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
  // No user details are passed here: advanced matching stays off.
  // Only the events this site sends: no automatic button-click or form events, which read text off the page.
  fbq("set", "autoConfig", false, id);
  fbq("init", id);
  return fbq;
};

export type PixelEvent = "PageView" | "ViewContent" | "Lead" | "InitiateCheckout" | "CompleteRegistration" | "Contact";

/**
 * Sends one standard event to the Meta Pixel. Does nothing when the pixel is off or the page is private.
 * `params` must never hold a name, phone number or email: many visitors are under 18.
 */
export function trackPixel(event: PixelEvent, params?: Record<string, string | number>) {
  if (typeof window === "undefined" || !metaPixelId) return;
  if (PRIVATE_PATHS.some((p) => window.location.pathname.startsWith(p))) return;
  const fbq = window.fbq ?? start(metaPixelId);
  if (params) fbq("track", event, params);
  else fbq("track", event);
}

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const isoDateInIndia = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const formatPrice = (price: number | null | undefined) => (price == null ? "On request" : `₹${inr.format(price)}`);

const longDateInIndia = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

/** "2026-10-04T…" → "4 Oct 2026", as the date falls in India. */
export const formatDate = (iso: string) => longDateInIndia.format(new Date(iso));

/** Today's date as YYYY-MM-DD in IST, regardless of server timezone. */
export const todayInIndia = () => isoDateInIndia.format(new Date());

/** "2026-10-17" → { day: "17", month: "OCT" }, parsed as text to avoid timezone shifts. */
export function splitDate(iso: string) {
  const [, m, d] = iso.split("-");
  return { day: d, month: MONTHS[Number(m) - 1] };
}

/** "17 to 18 Oct", or "29 Oct to 2 Nov" across months; no dashes, per the site style. */
export function dateRange(start: string, end: string) {
  const a = splitDate(start);
  const b = splitDate(end);
  const day = (d: string) => String(Number(d));
  const mon = (m: string) => m.charAt(0) + m.slice(1).toLowerCase();
  [a.month, b.month] = [mon(a.month), mon(b.month)];
  return a.month === b.month ? `${day(a.day)} to ${day(b.day)} ${b.month}` : `${day(a.day)} ${a.month} to ${day(b.day)} ${b.month}`;
}

import type { Campus, RegionSlug } from "@/types/content";

export const FOUNDED_YEAR = 1997;

/** Fixed identity. Contact details and numbers are edited in the admin (Site settings). */
export const site = {
  name: "CNA Camp",
  legalName: "Climber Nature Adventure Club",
  shortTagline: "Treks & camps since 1997, Rajkot",
  description:
    "Treks, camps and outdoor adventures across Gujarat, the Himalaya and North-East India since 1997. Backed by Saurashtra Education & Charitable Trust.",
  trust: {
    name: "Saurashtra Education & Charitable Trust",
    registration: "E-5718/2000",
    logo: "/img/sect-logo.webp",
  },
  coordinates: "N 22.30° · E 70.80°",
} as const;

/** First camp: December 1997, so a year is only completed each December. */
export const yearsActive = (now = new Date()) => now.getFullYear() - FOUNDED_YEAR - (now.getMonth() < 11 ? 1 : 0);

export const regions: Record<RegionSlug, { label: string; blurb: string }> = {
  gujarat: { label: "Gujarat", blurb: "Bet Dwarka coast, Gir forest, Kutch and the Saputara hills" },
  "across-india": { label: "Across India", blurb: "Himalaya, Sahyadri, Satpura and the southern hills" },
  "north-east": { label: "North-East", blurb: "Sikkim and the eastern Himalaya" },
  "outside-india": { label: "Outside India", blurb: "Everest Base Camp, Nepal" },
};

/** Regions offered across the site (menus, filters, forms), in this order. */
export const regionOrder: RegionSlug[] = ["gujarat", "north-east", "across-india"];

export const tripsByRegionHref = (region: RegionSlug) => `/trips?region=${region}`;

export const enquireHref = (tripSlug?: string) => (tripSlug ? `/trips/${tripSlug}#enquire` : "/contact#enquire");

export interface NavItem {
  label: string;
  href: string;
  hot?: boolean;
  children?: { label: string; href: string }[];
}

export const mainNav: NavItem[] = [
  {
    label: "Treks & Camps",
    href: "/trips",
    children: [
      ...regionOrder.map((r) => ({ label: regions[r].label, href: tripsByRegionHref(r) })),
      { label: "Girls-only & solo", href: "/travellers" },
      { label: "Group trips", href: "/group-trips" },
    ],
  },
  { label: "Upcoming Batches", href: "/batches" },
  { label: "Olympiad", href: "/olympiad", hot: true },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "About us", href: "/about" },
      { label: "Gallery", href: "/gallery" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  { label: "Blog", href: "/blog" },
];

export const footerNav = {
  regions: [
    ...regionOrder.map((r) => ({ label: regions[r].label, href: tripsByRegionHref(r) })),
    { label: "Upcoming batches", href: "/batches" },
  ],
  company: [
    { label: "About us", href: "/about" },
    { label: "Contact us", href: "/contact" },
  ],
  resources: [
    { label: "Gallery", href: "/gallery" },
    { label: "Group trips", href: "/group-trips" },
    { label: "Blog", href: "/blog" },
  ],
  legal: [
    { label: "Terms and conditions", href: "/terms" },
    { label: "Cancellation & refund", href: "/cancellation" },
    { label: "Privacy policy", href: "/privacy" },
  ],
};

export const travellerTypes = [
  "Just me",
  "Friends / youth group",
  "Girls-only group",
  "Family",
  "School group",
  "College / university group",
  "Corporate team",
  "Teachers / NGO / club",
] as const;

export const campuses: Campus[] = [
  {
    slug: "manali",
    name: "Manali Campus",
    place: "Vashisht, Manali",
    state: "Himachal Pradesh",
    own: "Our own campus",
    img: "cna/real/campus-03",
    stay: "Swiss tents & hotel rooms",
    capacity: "200 people",
    facilities: ["Attached toilets", "Drinking water", "Meals", "First aid"],
    activities: ["Trekking", "Rock climbing", "River rafting", "High-altitude camping", "Star gazing"],
    months: "March to June · October to February (winter & snow)",
  },
  {
    slug: "dwarka",
    name: "Bet Dwarka Campus",
    place: "Bet Dwarka",
    state: "Gujarat",
    own: "Partner campus",
    img: "stock/campus-dwarka",
    stay: "Dorm, guest house & tents",
    capacity: "100 people",
    facilities: ["Toilets", "Drinking water", "Generator backup"],
    activities: ["Marine walk", "Bird watching", "Star gazing", "Hiking", "EVS introduction"],
    months: "October to March",
  },
  {
    slug: "hingolgadh",
    name: "Hingolgadh Camp",
    place: "Hingolgadh, Jasdan, Rajkot",
    state: "Gujarat",
    own: "Camp site we set up for each batch",
    img: "stock/campus-hingolgadh",
    stay: "Tents & dorm",
    capacity: null,
    facilities: ["Toilets", "Drinking water", "Generator backup"],
    activities: ["Bird watching", "Star gazing", "Hiking", "EVS introduction"],
    months: "All seasons",
  },
];

/** Top-level menu item for a path: its own page, sub-pages, or any of its dropdown links. */
export function isNavActive(item: NavItem, pathname: string) {
  const own = (href: string) => href.split(/[?#]/)[0];
  if (pathname === own(item.href) || pathname.startsWith(`${own(item.href)}/`)) return true;
  return Boolean(item.children?.some((c) => own(c.href) !== "/" && own(c.href) === pathname));
}

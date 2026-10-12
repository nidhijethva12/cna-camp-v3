import type { Review } from "../../types/content";

/** A file under /public plus its alt text; the seed uploads it to Photos. */
export interface SeedPhoto {
  src: string;
  alt: string;
}

const photo = (src: string, alt: string): SeedPhoto => ({ src, alt });

export const home = {
  hero: {
    headingLines: ["Real trails.", "Real people.", "Since 1997."],
    intro:
      "Eco-tourism treks, camps and nature trails from Gujarat to the Himalaya. For schools, colleges, families, friends, girls-only groups and solo travellers.",
    image: photo("/img/cna/real/land-06-wide.webp", "The Manali valley below snow peaks, Himachal Pradesh"),
    slides: [
      photo("/img/cna/real/campus-03-wide.webp", "CNA’s Manali campus buildings with snow peaks behind"),
      photo("/img/cna/real/river-01-wide.webp", "Campers crossing a river on a wooden bridge near Manali"),
      photo("/img/cna/real/land-03-wide.webp", "Snow peaks above a green valley in Himachal Pradesh"),
      photo("/img/cna/real/group-06-wide.webp", "A large CNA group outside Hidimba temple, Manali"),
      photo("/img/cna/real/campus-05-wide.webp", "The garden at CNA’s Manali campus, snow peaks behind"),
      photo("/img/cna/real/land-07-wide.webp", "Tall deodar trees in a forest near Manali"),
    ],
    highlights: ["1,00,000+ campers", "1,000+ camps", "Backed by a registered trust"],
  },
  story: {
    eyebrow: "Who we are",
    title: "A nature club, not a tour company",
    body: "Climber Nature Adventure Club (CNA) is an eco-tourism and adventure club from Rajkot. Since our first Marine Camp at Bet Dwarka in 1997, we have taken 1,00,000+ people into forests, mountains and the sea. Adventure is the way in. Coming closer to nature is the goal.",
    image: photo("/img/cna/real/group-06-wide.webp", "A large CNA group outside Hidimba temple, Manali"),
    points: [
      {
        title: "Eco-tourism first",
        text: "Every camp has a nature goal: reefs, forests, birds, stars. Leave-no-trace on every trip.",
      },
      {
        title: "10 adventure activities",
        text: "Trekking, mountaineering, rock climbing, rappelling, rafting, river crossing, paragliding, bird watching, star gazing and marine life.",
      },
      {
        title: "Our own Manali campus",
        text: "Swiss tents and rooms for 200 in Vashisht, plus a partner campus at Bet Dwarka.",
      },
      {
        title: "Backed by a trust",
        text: "Supported by Saurashtra Education & Charitable Trust (Reg. E-5718/2000). No-profit-no-loss.",
      },
    ],
  },
  holidays: {
    eyebrow: "Plan by holiday",
    title: "A trip for every school break",
    intro: "Diwali, Christmas, summer vacation or just a weekend: here is what runs when.",
    items: [
      {
        months: "Oct – Nov",
        title: "Diwali break",
        highlights: ["Astro Adventure Trekking Camp", "Sikkim Trek", "Everest Base Camp Trek"],
        tripCount: 22,
        link: "/trips?month=nov",
        image: photo("/img/cna/manali/11.webp", "A CNA group on a Himalayan trail"),
      },
      {
        months: "Dec – Jan",
        title: "Christmas & New Year",
        highlights: ["Marine Camp, Bet Dwarka", "Sasan Gir Wildlife Camp", "Kullu, Shimla & Manali"],
        tripCount: 16,
        link: "/trips?month=dec",
        image: photo("/img/cna/marinecamp/02.webp", "Marine camp at Bet Dwarka"),
      },
      {
        months: "Dec – Mar",
        title: "Snow season",
        highlights: ["Manali Snow Camp", "Kullu, Shimla & Manali"],
        tripCount: 2,
        link: "/trips?month=jan",
        image: photo("/img/cna/manali/01.webp", "Snow camp in Manali"),
      },
      {
        months: "May – Jun",
        title: "Summer vacation",
        highlights: ["Astro Adventure Trekking Camp", "Sikkim Trek", "Ladakh Trek"],
        tripCount: 11,
        link: "/trips?month=may",
        image: photo("/img/cna/manali/11.webp", "A CNA group on a Himalayan trail"),
      },
      {
        months: "Jul – Sep",
        title: "Monsoon treks",
        highlights: ["Sikkim Trek", "Ladakh Trek", "Grand Uttaranchal Trek"],
        tripCount: 12,
        link: "/trips?month=aug",
        image: photo("/img/cna/sikkim/03.webp", "Mountain views in Sikkim"),
      },
      {
        months: "1 – 3 days",
        title: "Weekend & day trips",
        highlights: ["Sasan Gir Wildlife Camp", "Mount Abu", "Narara Island Coral Walk"],
        tripCount: 9,
        link: "/trips?short=1",
        image: photo("/img/cna/sasangir/02.webp", "Sasan Gir forest"),
      },
    ],
  },
  destinations: {
    eyebrow: "Where we go",
    title: "From Gujarat's coast to the Himalaya",
    intro: "Coast, forest, desert and high mountains. We pick the right place for each season.",
    regionImages: {
      gujarat: photo("/img/cna/marinecamp/02.webp", "Marine camp at Bet Dwarka"),
      acrossIndia: photo("/img/cna/real/land-12-wide.webp", "View over pine trees and mountains from a hilltop in Himachal"),
      northEast: photo("/img/cna/sikkim/03.webp", "Mountain views in Sikkim"),
      outsideIndia: photo("/img/cna/everest_base_camp/05.webp", "On the trail to Everest Base Camp"),
    },
  },
  audiences: {
    eyebrow: "Who travels with us",
    title: "Your group. Your kind of trip.",
    items: [
      {
        title: "School groups",
        description: "Safe, well-planned camps that teach outside the classroom.",
        link: "/group-trips#schools",
        image: photo("/img/cna/real/group-10-wide.webp", "A boys’ batch with their bags outside a wooden hut in Himachal"),
      },
      {
        title: "College & friends",
        description: "Treks and camps for your gang, with every detail handled.",
        link: "/group-trips#families",
        image: photo("/img/cna/real/group-11-wide.webp", "A group of campers cheering together in a deodar forest"),
      },
      {
        title: "Girls-only",
        description: "Batches just for girls and women, with a safe, easy vibe.",
        link: "/travellers#girls",
        image: photo("/img/cna/real/river-01-wide.webp", "Campers crossing a river on a wooden bridge near Manali"),
      },
      {
        title: "Solo travellers",
        description: "Come alone (18+), leave with a group of new trail friends.",
        link: "/travellers#solo",
        image: photo("/img/cna/real/land-03-wide.webp", "Snow peaks above a green valley in Himachal Pradesh"),
      },
    ],
    teacherNote: "school trips start at 50 students, and 1 teacher travels free with every 25 students.",
  },
  why: {
    eyebrow: "Why CNA",
    title: "Nearly 30 years of getting people home happy",
    image: photo("/img/cna/real/climb-04-wide.webp", "A girl rock climbing on a boulder in a pine forest, Manali"),
    imageLabel: "Rock climbing",
    points: [
      { title: "Instructors with 20+ years", text: "Qualified, experienced instructors and first aid on every batch." },
      {
        title: "Nature learning built in",
        text: "Sea awareness, EVS sessions, bird watching and star gazing are part of the plan.",
      },
      { title: "Your travel, your menu", text: "Choose train, bus, car or air. Meals at camp follow your group’s menu." },
      { title: "No profit, no loss", text: "Fees cover the camp. That is how a trust-backed club works." },
    ],
  },
  gallery: {
    eyebrow: "From the trail",
    title: "Moments from our trips",
    intro: "Real moments from CNA camps: campfires, rafting, climbing and the friends you make. Hover to pause.",
    photos: [
      ["river-01", "Crossing the river, Manali"],
      ["river-02", "Hold hands, keep moving"],
      ["trek-02", "On the hillside trail"],
      ["trek-03", "Deodar forest walk"],
      ["climb-03", "Rappelling down"],
      ["climb-04", "First climb"],
      ["campus-02", "Blue tents on the meadow"],
      ["campus-04", "Our Manali campus"],
      ["food-04", "Lunch with a view"],
      ["group-04", "The big circle"],
      ["group-06", "At Hidimba temple"],
      ["group-09", "Cycling morning"],
      ["snow-02", "Snow day"],
      ["travel-01", "On the bus to the mountains"],
    ].map(([name, caption]) => ({ image: photo(`/img/cna/real/${name}-wide.webp`, caption), caption })),
  },
};

export const siteSettings = {
  phone: "+91 70463 61009",
  whatsappNumber: "917046361009",
  whatsappMessage: "Hi CNA, I want to know about your trips",
  email: "nikunjvyash2411@gmail.com",
  trustEmail: "seact.raj.edu.trust@gmail.com",
  address: {
    street: '"Maa" 4/7 Vaniyawadi Main Rd, opp. Bolbala Road, near 80 ft Road',
    city: "Rajkot",
    state: "Gujarat",
    postalCode: "360002",
  },
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Vaniyawadi%20Main%20Road%2C%20Bolbala%20Road%2C%20Rajkot%20360002",
  social: [
    { platform: "Instagram", url: "https://www.instagram.com/cnacamp.india/" },
    { platform: "Facebook", url: null },
    { platform: "YouTube", url: null },
  ] as const,
  campersCount: "1,00,000+",
  campsCount: "1,000+",
};

export const reviews: (Omit<Review, "tripName"> & { tripSlug: string })[] = [
  {
    name: "Parent name",
    role: "Parent · Rajkot",
    quote: "Sample review. A parent shares how their child came back more confident and caring for nature.",
    rating: 5,
    tripSlug: "manali-snow-camp",
    isSample: true,
  },
  {
    name: "Student name",
    role: "College student",
    quote: "Sample review. A student talks about the trek, the night sky and the friends they made.",
    rating: 5,
    tripSlug: "astro-adventure-manali",
    isSample: true,
  },
  {
    name: "Teacher name",
    role: "School teacher",
    quote: "Sample review. A teacher explains how the marine walk turned into a real science lesson.",
    rating: 5,
    tripSlug: "bet-dwarka-marine-camp",
    isSample: true,
  },
];

import type { PhotoKey } from "@/types/content";

export const mission = {
  line: "Bring people closer to nature, through adventure",
  text: "Anyone can show you a viewpoint. We want you to understand what you are looking at. So every camp is built around one real nature experience: a coral reef at low tide, a night sky away from city lights, a Himalayan river you cross with your team, birds at first light. The adventure gets you there. The nature is why you go.",
  points: [
    ["Learn outdoors", "Every camp mixes adventure with nature learning: forests, marine life, birds and stars."],
    ["Leave no trace", "Small groups, no plastic left behind, and respect for local people and wildlife."],
    ["Build confidence", "Climbing, trekking and camping teach courage, teamwork and how to look after yourself."],
  ],
};

export const founder = {
  name: "Sir Dr. Ketankumar P. Trivedi",
  years: "1971 to 2024",
  quote: "A lamp of nature, for back to nature movements.",
  intro:
    "He was a boxer, a coach, a mountain man and a teacher, and he spent his life getting young people outdoors. He believed a day in the hills could do what a month in a classroom could not: make you stronger, calmer and more caring towards nature. Every CNA camp still carries that belief.",
  facts: [
    ["Education", "Doctorate in Boxing, Master in Physical Education and Bachelor in Geography, Saurashtra University."],
    [
      "Outdoors",
      "Instructor certificate, Back to Nature movement (1992). Basic Snow Skiing course, Govt. of Himachal Pradesh (1996). Mountain Rescue course (1996).",
    ],
    [
      "Sports",
      "Committee member, Indian Olympic Association, from Gujarat. Organising committee, Commonwealth Games, New Delhi (2010). State champion in boxing, judo and archery.",
    ],
    [
      "Coach & mentor",
      "15+ years coaching many sports, including at Saurashtra University and the Rajkot Indoor Stadium. Many of his students went on to win state and national medals.",
    ],
    [
      "Service",
      "Life member of the Red Cross Society and 20+ Gujarat sports associations. Voluntary work with RMC and non-profit organisations.",
    ],
  ],
  legacy: "Saurashtra Education & Charitable Trust has dedicated the Adventure Olympiad Group C scholarship to him.",
};

export const different = [
  ["Eco-tourism first", "Every trip has a nature learning goal. Sightseeing is a bonus, not the plan."],
  ["Our own campuses", "Our Manali campus and a partner campus at Bet Dwarka keep stay, food and safety in our own hands."],
  ["No profit, no loss", "1,000+ camps and 1,00,000+ campers, and the fee still only covers the camp."],
  ["Backed by a registered trust", "Saurashtra Education & Charitable Trust (Reg. E-5718/2000)."],
  ["10 activities, trained leaders", "Trekking to star gazing, each led by people who know that activity well."],
];

export const whoCanJoin = [
  {
    who: "Solo travellers",
    note: "18 years and above",
  },
  {
    who: "School groups",
    note: "Std 9 and above",
  },
  {
    who: "College & university groups",
    note: "All years",
  },
  {
    who: "Families",
    note: "All ages welcome",
  },
  {
    who: "Friends & youth groups",
    note: "Join as a group",
  },
  {
    who: "Girls-only groups",
    note: "Separate batches",
  },
  {
    who: "Corporate teams",
    note: "Custom dates",
  },
  {
    who: "Teachers, NGOs & clubs",
    note: "Custom dates",
  },
];
export const storyParagraphs = [
  "December 1997. A small group from Rajkot reached Bet Dwarka, waited for the sea to pull back, and walked out onto a living coral reef. Starfish under their feet. Birds over the water. A sky so full of stars that nobody wanted to sleep. That trip became CNA.",
  "Since then we have run 1,000+ camps and taken more than 1,00,000 people outdoors: school and college groups, families, friends, girls-only batches and solo travellers. The places grew, from the Gujarat coast to the Himalaya, the North-East and Nepal. The way we work did not.",
  "No profit, no loss. Safety before schedule. Nature at the centre of every day.",
];

export const ecoPrinciples = [
  ["Leave a small footprint", "Small groups, no litter, quiet trails."],
  ["Learn the place", "Every stop starts with a briefing on wildlife, fragile species and local rules."],
  ["Respect local culture", "We explain the history and way of life of each place and meet the people who live there."],
  ["Teach on the way", "Bus and trail time turns into conversations about nature and local issues."],
  ["Good for hosts too", "Our visits should help the communities who host us."],
  ["Support conservation", "Campers learn what is being done to protect each place, and how they can help."],
];

export const safetyPoints = [
  ["Expert-led activities", "Trekking, climbing, rafting and every other activity is guided by people trained in it."],
  ["Medical cover at camp", "A medical kit at every camp, a doctor nearby, volunteer staff and ambulance access for emergencies."],
  ["Insured long camps", "For camps longer than 5 days, CNA arranges mediclaim cover for the camp period, at our cost."],
  ["The right volunteers", "Female volunteers with girls’ groups, male volunteers with boys’ groups, and both with mixed groups."],
  ["Safe gear, clean stay", "ISI-marked safety equipment, and washed bedding in every hotel and tent."],
  ["Plans bend for safety", "Weather, roads or a tired group can change the day. A group meeting before every camp sets the rules."],
];

/** Placeholder roles until CNA shares team names and photos. */
export const teamRoles = ["Trip leader", "Trip leader", "Instructor", "Camp coordinator"];

/** Home page "Who we are" block, from the client's final home page copy. */
export const homeStory = {
  image: "cna/manali/03" as PhotoKey,
  imageAlt: "A CNA group around a campfire on a Himalayan hillside",
  badge: ["20+", "years"],
  video: { tag: "Video coming soon", caption: "CNA in 60 seconds: 20+ years of camps" },
  eyebrow: "Who we are",
  title: "A nature club, not a tour company",
  body: [
    "CNA (Climber Nature Adventure Club) is a Rajkot club that takes people outdoors and teaches them to look after it. Our very first trip was a marine camp at Bet Dwarka, walking a coral reef at low tide. More than 1,000 camps later, the idea has not changed.",
    "We do not sell sightseeing. We plan days around a reef, a forest, a river or a night sky, and we bring you back with stories and better habits.",
  ],
  points: [
    ["Eco-tourism first", "Every camp has a nature goal: reefs, birds, forests or stars. And nobody leaves litter behind."],
    [
      "10 outdoor activities",
      "Trekking, mountaineering, rock climbing, rappelling, rafting, river crossing, paragliding, bird watching, star gazing and marine life.",
    ],
    ["Our own Manali campus", "Swiss tents and rooms for 200 people in Vashisht, plus a partner campus at Bet Dwarka."],
    ["Backed by a trust", "Saurashtra Education & Charitable Trust (Reg. E-5718/2000). We run on a no-profit-no-loss model."],
  ],
  link: { label: "Read our story", href: "/about" },
};

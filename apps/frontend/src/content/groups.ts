import type { PhotoKey } from "@/types/content";

export interface GroupKind {
  id: string;
  title: string;
  who: string;
  text: string;
  img: PhotoKey;
  alt: string;
  popular: string;
}

export const groupKinds: GroupKind[] = [
  {
    id: "schools",
    title: "School groups",
    who: "Std 9 and above",
    text: "Outdoor learning camps planned with your teachers: nature sessions (EVS), adventure activities and a clear plan for every hour. Minimum 50 students. One teacher travels free with every 25 students.",
    img: "cna/real/group-10",
    alt: "A boys’ batch with their bags outside a wooden hut in Himachal",
    popular: "Marine Camp · Hingolgadh · Sasan Gir",
  },
  {
    id: "colleges",
    title: "College & university",
    who: "All years",
    text: "Treks and adventure camps for clubs, NSS and NCC units and class trips. Plenty of fun, and every detail sorted before you board.",
    img: "cna/real/group-11",
    alt: "A group of campers cheering together in a deodar forest",
    popular: "Manali · Grand Uttaranchal · Sikkim",
  },
  {
    id: "families",
    title: "Families",
    who: "All ages welcome",
    text: "Easy camps and nature trails where the kids and the grandparents both come home happy.",
    img: "cna/real/food-04",
    alt: "Campers being served lunch with snow peaks behind, Manali",
    popular: "Kerala · Nainital · Gir & Diu",
  },
  {
    id: "friends",
    title: "Friends & youth groups",
    who: "Join as a group",
    text: "You pick the dates and the kind of adventure. We take care of travel, stay, food, leaders and activities.",
    img: "cna/real/river-02",
    alt: "A group of campers crossing a mountain river together",
    popular: "Ladakh · Manali Snow Camp · Goa",
  },
  {
    id: "corporate",
    title: "Corporate teams",
    who: "Custom dates",
    text: "Team outings with a real challenge: treks, rock climbing, rafting and camp nights away from laptops.",
    img: "cna/real/climb-03",
    alt: "A camper rappelling down a rock face on a rope",
    popular: "Osam Hill · Mount Abu · Manali",
  },
  {
    id: "ngo",
    title: "Teachers, NGOs & clubs",
    who: "Custom dates",
    text: "Nature education and adventure camps for teacher groups, NGOs, scouts and clubs.",
    img: "cna/real/group-05",
    alt: "Camp leaders talking to a group of young campers",
    popular: "Hingolgadh · Bet Dwarka · Saputara",
  },
];

export const groupInclusions = [
  "Travel from your city and back",
  "Stay in hotel rooms or tents for 2 to 10 people",
  "All meals at camp, planned with your group leader",
  "Trained trip leaders and instructors",
  "Activity and safety gear (ISI-marked)",
  "Nature sessions (EVS)",
  "Medical kit at camp, a doctor nearby and ambulance access",
  "Mediclaim cover on camps longer than 5 days",
];

/** CNA's booking process from the old cnacamp.com booking page. */
export const groupBookingSteps = [
  "Choose a camp and contact us. We send the full programme in writing.",
  "Fix the dates and the number of days with us.",
  "Form your group: 50 members or more (smaller groups pay for 50). Big groups of 100 to 1,000 travel in batches.",
  "Register: send the group list, a form and risk certificate for each member, your travel choice (train, bus, car or air) and the 25% advance. Two to three months ahead is ideal.",
  "Group meeting: we walk you through activities, travel, food and camp rules, and answer every question.",
  "Pay the balance within a month of registering, and everything at least 3 days before departure. Then pack your bag.",
];

export const groupFavourites = ["bet-dwarka-marine-camp", "hingolgadh-nature-camp", "astro-adventure-manali"];

/** Easy first trips named in the copy for the Girls-only & solo page. */
export const easyStarts = ["manali-snow-camp", "sikkim-trek", "bet-dwarka-marine-camp"];

export const travellerKinds = [
  {
    id: "girls",
    title: "Girls-only batches",
    tag: "For girls & women",
    img: "cna/real/group-08",
    alt: "A girls’ group holding up a sign on a CNA trip",
    points: [
      "Batches only for girls and women",
      "Separate stay at every camp",
      "Female volunteers with every girls’ group",
      "Regular updates to family",
    ],
  },
  {
    id: "solo",
    title: "Solo travellers",
    tag: "18 years and above",
    img: "cna/real/trek-03",
    alt: "Walking through a tall deodar forest near Manali",
    points: [
      "Join any open batch on your own",
      "We set you up with tent-mates of your gender",
      "Group activities from the first day",
      "Go home with new trail friends",
    ],
  },
  {
    id: "first",
    title: "First-timers",
    tag: "Never trekked before?",
    img: "cna/real/campus-02",
    alt: "Blue tents on a green meadow, Manali",
    points: [
      "Pick a trip marked Easy",
      "We teach camp basics on day one",
      "Trained leaders set a pace that suits the group",
      "Packing list shared before you go",
    ],
  },
];

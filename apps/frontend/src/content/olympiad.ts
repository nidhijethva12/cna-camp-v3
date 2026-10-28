export type GroupId = "A" | "B" | "C" | "D";

type JourneyStep = { year?: string; title: string; note?: string; goal?: boolean };

export interface OlympiadGroup {
  id: GroupId;
  name: string;
  short: string;
  title: string;
  who: string;
  /** What the finder dropdown says for this group. */
  finder: string;
  fees: { label: string; amount: string }[];
  feeSummary: string;
  quiz: string;
  prize: string;
  journey: JourneyStep[];
}

const groupsJourney: JourneyStep[] = [
  { title: "Online quiz, Rounds 1 to 3" },
  { year: "2026-27", title: "Round 4, pre basic nature education camp in Gujarat", note: "For students selected in Round 3" },
  { year: "2027-28", title: "Round 5, marine camp in Gujarat" },
  { year: "2028-29", title: "Desert camp in Gujarat" },
  { year: "2029-30", title: "Astro Adventure Trekking Camp, Manali", note: "For students selected in Round 5", goal: true },
];

const schoolPrize = "Astro Adventure Trekking Camp, Manali, with the Dr. Ketankumar Trivedi scholarship of 60 to 100%";

// Adventure Olympiad 2.0, before registration opens. Copy from the approved design B.
export const olympiad = {
  name: "Adventure Olympiad 2.0",
  eyebrow: "Eco-STEM quiz and scholarship",
  intro: "A quiz that can take you to a camp in the Himalaya. For school students, college students and adults who love nature.",
  facts: [
    ["4", "groups"],
    ["5", "rounds"],
    ["60 to 100%", "scholarship"],
  ],
  motto: "।। विद्यार्थी देवो भव ।।",
  notice: {
    title: "Olympiad 2.0 જાહેરનામું",
    meta: "Official notice no. 02/2026 · 20 Oct 2026 · Gujarati PDF",
    href: "/docs/olympiad-2-notice.pdf",
  },
  dates: [
    { when: "15 Nov to 14 Dec 2026", title: "Registration", note: "Register and pay online on this page.", key: true },
    { when: "27 Dec 2026", title: "Last buffer date" },
    { when: "31 Dec 2026", title: "Last date to pay the fee" },
    { when: "Around 22 Jan 2027", title: "Round 1, online quiz", note: "The quiz link comes on WhatsApp." },
    { when: "Around 9 Feb 2027", title: "Round 2, online quiz" },
    { when: "Around 21 Feb 2027", title: "Round 3, online quiz" },
    { when: "After Round 3", title: "Rounds 4 and 5, offline camps in Gujarat", note: "Venue and dates on the notice board." },
    { when: "Around 10 Mar 2027", title: "Final merit list", key: true },
  ] as { when: string; title: string; note?: string; key?: boolean }[],
  steps: [
    {
      title: "Register and pay",
      text: "Choose your group, fill the form and pay online. Your registration number comes on WhatsApp.",
      when: "15 Nov to 14 Dec 2026",
    },
    {
      title: "Online quiz, Rounds 1 to 3",
      text: "Take the quiz from home on a phone or computer. Questions match your class. For Groups A, B and C.",
      when: "Jan and Feb 2027",
    },
    {
      title: "Offline camp, Rounds 4 and 5",
      text: "Selected participants join the offline rounds at camp in Gujarat. Group D starts directly at Round 4.",
      when: "After Round 3",
    },
    {
      title: "Merit list and scholarship",
      text: "The Trust picks winners on the quiz score plus past activities, competitions, medical fitness and teachers' opinion.",
      when: "Around 10 Mar 2027",
    },
  ],
  glance: [
    { icon: "questions", value: "100", label: "multiple choice questions" },
    { icon: "timer", value: "60 minutes", label: "for each quiz" },
    { icon: "star", value: "100 marks", label: "in every round" },
    { icon: "language", value: "ગુજરાતી or English", label: "your choice" },
    { icon: "book", value: "5 subjects", label: "Maths, science, social science, GK, reasoning" },
  ] as const,
  groups: [
    {
      id: "A",
      name: "Group A",
      short: "Std 8 and 9",
      title: "Group A, school students",
      who: "Age 14+ to 16, or Std 8 and 9 (academic year 2025-26)",
      finder: "In Std 8 or 9 (age 14+ to 16)",
      fees: [
        { label: "Government school", amount: "₹90" },
        { label: "Non / semi-government school", amount: "₹230" },
      ],
      feeSummary: "₹90 for government school, ₹230 for non / semi-government school",
      quiz: "Std 8 level, Rounds 1 to 3 online",
      prize: schoolPrize,
      journey: groupsJourney,
    },
    {
      id: "B",
      name: "Group B",
      short: "Std 10 and 11",
      title: "Group B, senior school",
      who: "Age 16+ to 18, or Std 10 and 11 (academic year 2025-26)",
      finder: "In Std 10 or 11 (age 16+ to 18)",
      fees: [
        { label: "Government school", amount: "₹105" },
        { label: "Non / semi-government school", amount: "₹369" },
      ],
      feeSummary: "₹105 for government school, ₹369 for non / semi-government school",
      quiz: "Std 10 level, Rounds 1 to 3 online",
      prize: schoolPrize,
      journey: groupsJourney,
    },
    {
      id: "C",
      name: "Group C",
      short: "Students 18+",
      title: "Group C, students above 18",
      who: "Age 18+, students only: 12th pass, college or higher studies (academic year 2025-26)",
      finder: "A student above 18 (12th pass, college or higher studies)",
      fees: [{ label: "Fee", amount: "₹639" }],
      feeSummary: "₹639",
      quiz: "Std 12 basic level, Rounds 1 to 3 online",
      prize: `${schoolPrize}. Also in the lucky draw for the Sindhu Darshan yatra, Leh-Ladakh.`,
      journey: [
        { title: "Online quiz, Rounds 1 to 3" },
        { title: "Rounds 4 and 5 at one offline camp", note: "Marine camp in Gujarat, for students selected in Round 3" },
        { title: "Astro Adventure Trekking Camp, Manali", note: "For students selected in Round 5", goal: true },
        { title: "Lucky draw for the Sindhu Darshan yatra, Leh-Ladakh", note: "Groups C and D together", goal: true },
      ],
    },
    {
      id: "D",
      name: "Group D",
      short: "Adults 25+",
      title: "Group D, adults above 25",
      who: "Government employees, experienced environmentalists, active sports persons and nature lovers",
      finder: "An adult above 25",
      fees: [{ label: "Fee", amount: "₹1,963" }],
      feeSummary: "₹1,963",
      quiz: "No online quiz. Direct entry to Round 4 after a document check.",
      prize: "lucky draw for the Sindhu Darshan yatra, Leh-Ladakh (100% scholarship*), plus the Lavkumar Khachar scholarship of up to 60%",
      journey: [
        { title: "Register and share documents", note: "Required government documents are checked" },
        { title: "Direct entry to Round 4", note: "In-person lucky draw and selection by the institution" },
        { title: "Lucky draw for the Sindhu Darshan yatra, Leh-Ladakh", note: "Groups C and D together", goal: true },
      ],
    },
  ] satisfies OlympiadGroup[],
  partners: [
    {
      kind: "school",
      icon: "school",
      title: "Register your school",
      cta: "Register your school",
      who: "For principals and coordinator teachers of schools and colleges.",
      points: [
        "One dashboard for all your students",
        "Add students by Excel or one class link",
        "Pay once for everyone, or parents pay",
        "Government schools get the lower fee",
      ],
    },
    {
      kind: "ambassador",
      icon: "ambassador",
      title: "Become an Olympiad Ambassador",
      cta: "Become an Ambassador",
      who: "For teachers, NGO workers, coaches, past campers and parents.",
      points: [
        "Your own code, link and QR to share",
        "See how many people joined through you",
        "Certificate and rewards at milestones",
        "Free to join",
      ],
    },
  ] as const,
  scholarships: [
    {
      img: "/img/olympiad/ketankumar-trivedi.webp",
      alt: "Late Sir Dr. Ketankumar P. Trivedi",
      focus: "object-[center_25%]",
      kicker: "Scholarship 1 · Groups A, B and C",
      name: "Sir Dr. Ketankumar Trivedi Adventure Scholarship",
      life: "In loving memory. Founder of CNA, 1971 to 2024.",
      quote: "“A lamp of nature, for back to nature movements.”",
      award: "60 to 100%",
      awardFor: "for selected students of Groups A, B and C",
      facts: [
        ["Education", "PhD in Boxing and Master in Physical Education, Saurashtra University"],
        ["Sports", "Committee member, Indian Olympic Association, from Gujarat. Organising committee, Commonwealth Games 2010."],
        ["Outdoors", "Snow skiing and mountain rescue training, 1996"],
      ],
      pdf: { label: "About Sir Dr. Ketankumar Trivedi (PDF)", href: "https://www.cnacamp.com/Dr-ketankumar-new.pdf" },
    },
    {
      img: "/img/olympiad/lavkumar-khachar.webp",
      alt: "Sir K.S. Lavkumar Khachar",
      focus: "object-[center_30%]",
      kicker: "Scholarship 2 · Group D",
      name: "Sir K.S. (Jasdan) Lavkumar Khachar Adventure Scholarship",
      life: "Naturalist and visionary of this scholarship",
      quote: "He started nature education camps for young people in Gujarat.",
      award: "Up to 60%",
      awardFor: "for selected adults of Group D",
      facts: [
        ["Nature", "Noted ornithologist from the Jasdan family. Worked with Dr. Salim Ali."],
        ["Education", "Began the nature education movement in Gujarat with WWF India, 1976"],
        ["Honours", "Salim Ali Loke Wan Tho Lifetime Achievement Award"],
      ],
      pdf: { label: "About Sir Lavkumar Khachar (PDF)", href: "https://www.cnacamp.com/Lavkumar.pdf" },
    },
  ],
  prizes: [
    {
      img: "/img/olympiad/manali-campus.webp",
      alt: "CNA campus in Manali with snow peaks",
      groups: "Groups A, B and C",
      title: "Astro Adventure Trekking Camp, Manali",
      text: "Treks, snow, river rafting, rock climbing and night-sky sessions at CNA's own Manali campus.",
      place: "Vashisht, Manali",
      meta: "Camp fee ₹18,000",
      link: { label: "See the camp", href: "/trips/astro-adventure-manali" },
    },
    {
      img: "/img/olympiad/manali-peaks.webp",
      alt: "Snow peaks in the Himalaya",
      groups: "Groups C and D",
      title: "Sindhu Darshan yatra, Leh-Ladakh",
      text: "Chosen by lucky draw from Groups C and D, with a 100% scholarship as per the official notice.",
      place: "Leh-Ladakh",
      meta: "2026-27",
    },
  ],
  rules: [
    ["Choose the right group", " by age or class for the current academic year."],
    ["Pay online only", ", as per the fee of your group."],
    ["Under 18?", " A parent or guardian adds their details and consent in the form."],
    ["Selection is not only the quiz.", " The Trust also looks at past activities, competitions, medical fitness and teachers' opinion."],
    ["Quiz links and times", " come on the WhatsApp number in the form."],
    ["Group D", " must share the required government documents."],
    ["Results", " of every round are posted on the notice board."],
    ["The institution's decision is final", " on all rules and selection."],
  ],
  keepReady: [
    "Class or age of the participant",
    "Parent's name and phone, if under 18",
    "A WhatsApp number for quiz links",
    "UPI, card or net banking for the fee",
    "School or referral code, if you have one",
  ],
  faqs: [
    {
      question: "Who can take part?",
      answer:
        'School students of Std 8 to 11, students above 18 (12th pass, college or higher studies), and adults above 25 who love nature, adventure or sport. Use "Find the right group" above.',
    },
    {
      question: "Can adults above 25 join?",
      answer: "Yes. They join Group D. There is no online quiz for Group D. They enter directly at Round 4 after a document check.",
    },
    {
      question: "How do I register?",
      answer: "From 15 Nov, press Register on this page, fill the form and pay online. The registration number comes on WhatsApp.",
    },
    {
      question: "Which language is the quiz in?",
      answer: "Gujarati or English. It has 100 multiple choice questions and lasts 60 minutes.",
    },
    {
      question: "What does the scholarship cover?",
      answer: "It is a share of the ₹18,000 camp fee. Groups A, B and C can get 60 to 100%. Group D can get up to 60%.",
    },
    {
      question: "Can a school register all its students together?",
      answer:
        'Yes. The school signs up once, adds students by Excel or a class link, and can pay for everyone in one payment. See "For schools and teachers" above.',
    },
    {
      question: "How does the Ambassador programme work?",
      answer:
        "Sign up, get your own code and link, and share it. Every paid registration through your code is counted, and CNA gives a certificate and rewards at milestones.",
    },
    { question: "Where are results posted?", answer: "On the notice board of this page, and on WhatsApp." },
  ],
  remindOptions: [
    { value: "A", label: "Group A, Std 8 or 9" },
    { value: "B", label: "Group B, Std 10 or 11" },
    { value: "C", label: "Group C, student above 18" },
    { value: "D", label: "Group D, adult above 25" },
    { value: "school", label: "A school or class (teacher)" },
    { value: "unsure", label: "Not sure yet" },
  ],
};

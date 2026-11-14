export type GroupId = "0" | "A" | "B" | "C" | "D" | "E";

export type JourneyStep = { year?: string; title: string; note?: string; goal?: boolean };

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
  /** Small note under the prize, e.g. who can choose Group 0. */
  note?: string;
}

type SectionText = { eyebrow: string; title: string; lead?: string };

/** Every piece of text on the Olympiad page, in one language. English and Gujarati share this shape. */
export interface OlympiadContent {
  name: string;
  eyebrow: string;
  intro: string;
  opensOn: string;
  motto: string;
  meta: { title: string; description: string; ogTitle: string; ogDescription: string };
  /** Notice board cards, in order; the first is the official notice. */
  notices: { tag?: string; title: string; meta: string; href: string }[];
  dates: { when: string; title: string; note?: string; key?: boolean }[];
  steps: { title: string; text: string; when: string }[];
  glance: { icon: "questions" | "timer" | "star" | "language" | "book"; value: string; label: string }[];
  groups: OlympiadGroup[];
  partners: { kind: "school" | "ambassador"; icon: "school" | "ambassador"; title: string; cta: string; who: string; points: string[] }[];
  scholarships: {
    img: string;
    alt: string;
    focus: string;
    kicker: string;
    name: string;
    life: string;
    quote: string;
    award: string;
    awardFor: string;
    facts: [string, string][];
    pdf: { label: string; href: string };
  }[];
  prizes: {
    img: string;
    alt: string;
    groups: string;
    title: string;
    text: string;
    place: string;
    meta: string;
    link?: { label: string; href: string };
  }[];
  rules: [string, string][];
  keepReady: string[];
  faqs: { question: string; answer: string }[];
  remindOptions: { value: string; label: string }[];
  /** Labels, headings and buttons around the content above. */
  ui: {
    language: string;
    bar: { opens: string; details: string };
    contactUs: string;
    seeGroups: string;
    scholarshipLine: { before: string; value: string; after: string };
    heroBadge: { title: string; text: string };
    joint: { label: string; trustLine: string; cnaLine: string };
    nav: {
      notices: string;
      how: string;
      groups: string;
      partners: string;
      scholarships: string;
      prizes: string;
      rules: string;
      faq: string;
    };
    sections: {
      notices: SectionText;
      how: SectionText;
      groups: SectionText;
      partners: SectionText;
      scholarships: SectionText;
      prizes: SectionText;
      rules: SectionText;
      faq: SectionText;
    };
    noticeBoard: {
      title: string;
      from: string;
      live: string;
      official: string;
      viewPdf: string;
      newTab: string;
      moreTitle: string;
      moreText: string;
    };
    keyDates: string;
    glanceLabel: string;
    register: { eyebrow: string; title: string; text: string; help: string; keepReady: string };
    help: { title: string; text: string; whatsapp: string; whatsappMessage: string; call: string; trustEmail: string };
    picker: {
      participant: string;
      choose: string;
      empty: string;
      thisIs: string;
      fee: string;
      quiz: string;
      prize: string;
      journey: string;
      group: string;
      tabsLabel: string;
      /** Small text under the group panels. */
      footnote: string;
    };
  };
}

const groupsJourney: JourneyStep[] = [
  { title: "Online quiz, Rounds 1 to 3", note: "Jan to Feb 2027" },
  { title: "Round 4, pre basic nature education camp in Gujarat", note: "Aug 2027 (tentative), for students selected in Round 3" },
  { title: "Round 5, marine camp in Gujarat", note: "2027-28" },
  { title: "Desert camp in Gujarat", note: "2028-29" },
  { title: "Astro Adventure Trekking Camp, Manali", note: "2029-30, for students selected in Round 5", goal: true },
];

/** Groups D and E: a government ID check and a live lucky draw lead to Round 4. */
const adultJourney: JourneyStep[] = [
  { title: "Register and upload a government ID", note: "Documents are checked" },
  { title: "Online live lucky draw", note: "Only the registered persons picked go to Round 4" },
  { title: "Round 4, Marine camp in Gujarat", note: "Two live lucky draws: Manali 2027 and Sindhu Darshan yatra 2027", goal: true },
];

const ageLine = "Age 14 to 16 (13 years completed on the day you fill the form)";

// Adventure Olympiad 2.0, before registration opens. Copy from the approved design B.
export const olympiad: OlympiadContent = {
  name: "Adventure Olympiad 2.0",
  eyebrow: "Eco-STEM quiz and scholarship",
  intro: "A quiz that can take you to a camp in the Himalaya. For school students, college students, adults who love nature, and teachers.",
  opensOn: "15 Nov 2026",
  meta: {
    title: "Adventure Olympiad 2.0: Eco-STEM Quiz & Himalaya Scholarship | CNA Camp",
    description:
      "Eco-STEM quiz for students 13+, adults and teachers. 6 groups, free for govt school students, up to 100% scholarship. Registration open till 14 Dec 2026.",
    ogTitle: "Adventure Olympiad 2.0: a quiz that can take you to the Himalaya",
    ogDescription:
      "6 groups, free for govt school students and up to 100% scholarship on adventure camps. Registration open till 14 Dec 2026.",
  },
  motto: "।। વિદ્યાર્થી દેવો ભવ: ।।",
  notices: [
    {
      tag: "Official",
      title: "Olympiad 2.0 જાહેરનામું",
      meta: "Official notice no. 02/2026 · 20 Oct 2026 · Gujarati PDF",
      href: "https://w0rcyc5i51abzzpx.public.blob.vercel-storage.com/documents/00%20Adventure%20Olympiad%202.0%20-%20%E0%AA%9C%E0%AA%BE%E0%AA%B9%E0%AB%87%E0%AA%B0%E0%AA%A8%E0%AA%BE%E0%AA%AE%E0%AB%81%E0%AA%82%20(Official%20notice).pdf",
    },
    {
      tag: "Rules",
      title: "નિયમો અને શરતો",
      meta: "Rules and terms · Gujarati PDF",
      href: "https://w0rcyc5i51abzzpx.public.blob.vercel-storage.com/documents/01%20Adventure%20Olympiad%202.0%20-%20Niyamo%20ane%20Sharato%20(Gujarati).pdf",
    },
    {
      tag: "Rules",
      title: "Rules and Terms",
      meta: "Rules and terms · English PDF",
      href: "https://w0rcyc5i51abzzpx.public.blob.vercel-storage.com/documents/02%20Adventure%20Olympiad%202.0%20-%20Rules%20and%20Terms%20(English).pdf",
    },
    {
      tag: "Form",
      title: "Risk and Indemnity Form",
      meta: "For selected participants · English",
      href: "https://w0rcyc5i51abzzpx.public.blob.vercel-storage.com/documents/03%20Risk%20and%20Indemnity%20Form%20(English).pdf",
    },
    {
      tag: "Form",
      title: "જોખમ સ્વીકૃતિ ફોર્મ",
      meta: "For selected participants · Gujarati",
      href: "https://w0rcyc5i51abzzpx.public.blob.vercel-storage.com/documents/04%20Jokham%20Swikruti%20Form%20(Gujarati).pdf",
    },
    {
      tag: "Form",
      title: "Parent Permission Letter",
      meta: "Below 18 · English",
      href: "https://w0rcyc5i51abzzpx.public.blob.vercel-storage.com/documents/05%20Parent%20Permission%20Letter%20(English).pdf",
    },
    {
      tag: "Form",
      title: "માતા-પિતા પરવાનગી પત્ર",
      meta: "Below 18 · Gujarati",
      href: "https://w0rcyc5i51abzzpx.public.blob.vercel-storage.com/documents/06%20Mata-Pita%20Parvangi%20Patra%20(Gujarati).pdf",
    },
    {
      tag: "Form",
      title: "Medical Fitness Certificate",
      meta: "For selected participants · English",
      href: "https://w0rcyc5i51abzzpx.public.blob.vercel-storage.com/documents/07%20Medical%20Fitness%20Certificate%20(English).pdf",
    },
    {
      tag: "Form",
      title: "મેડિકલ ફિટનેસ પ્રમાણપત્ર",
      meta: "For selected participants · Gujarati",
      href: "https://w0rcyc5i51abzzpx.public.blob.vercel-storage.com/documents/08%20Medical%20Fitness%20Pramanpatra%20(Gujarati).pdf",
    },
    {
      tag: "Bio",
      title: "About Sir K.S. (Jasdan) Lavkumar Khachar",
      meta: "Scholarship · English",
      href: "https://w0rcyc5i51abzzpx.public.blob.vercel-storage.com/documents/09%20About%20Sir%20K.S.%20(Jasdan)%20Lavkumar%20Khachar%20-%20Scholarship.pdf",
    },
    {
      tag: "Bio",
      title: "About Sir Dr. Ketankumar Trivedi",
      meta: "Scholarship · English",
      href: "https://w0rcyc5i51abzzpx.public.blob.vercel-storage.com/documents/10%20About%20Sir%20Dr.%20Ketankumar%20Trivedi%20-%20Scholarship.pdf",
    },
  ],
  dates: [
    { when: "15 Nov to 14 Dec 2026", title: "Registration", note: "Register and pay online on this page (till 11:59 PM).", key: true },
    { when: "27 Dec 2026", title: "Last buffer date" },
    { when: "31 Dec 2026", title: "Last date to pay the fee" },
    { when: "Jan to Feb 2027 (tentative)", title: "Rounds 1 to 3, online quiz", note: "The quiz link comes on WhatsApp." },
    { when: "Date on the notice board", title: "Online live lucky draw, Groups D and E" },
    { when: "March 2027 (tentative)", title: "Merit list after Round 3", key: true },
    {
      when: "Aug 2027 (tentative)",
      title: "Round 4, Groups 0, A and B",
      note: "Groups C, D and E: Round 4 at the Marine camp, date on the notice board.",
    },
  ],
  steps: [
    {
      title: "Register and pay",
      text: "Choose your group, fill the form and pay online through Razorpay. Your registration number and all updates come on WhatsApp.",
      when: "15 Nov to 14 Dec 2026",
    },
    {
      title: "Online quiz, Rounds 1 to 3",
      text: "Take the quiz from home on a phone or computer. Questions match your level. For Groups 0, A, B and C. Std 10, Std 12 and college students can pick their quiz date and time in the form.",
      when: "Jan to Feb 2027 (tentative)",
    },
    {
      title: "Rounds 4 and 5",
      text: "Selected participants join the offline rounds at camp in Gujarat. Groups D and E: after a government document check, an online live lucky draw picks who goes straight to Round 4.",
      when: "After Round 3",
    },
    {
      title: "Merit list and scholarship",
      text: "The merit list after Round 3 is made on the quiz score plus past activities, competitions, medical fitness and teachers' opinion.",
      when: "March 2027 (tentative)",
    },
  ],
  glance: [
    { icon: "questions", value: "100", label: "multiple choice questions" },
    { icon: "timer", value: "60 minutes", label: "for each quiz" },
    { icon: "star", value: "100 marks", label: "in every round" },
    { icon: "language", value: "ગુજરાતી or English", label: "your choice" },
    { icon: "book", value: "6 subjects", label: "Maths, science, social science, GK, reasoning, environment" },
  ],
  groups: [
    {
      id: "0",
      name: "Group 0",
      short: "Govt school, 14 to 16",
      title: "Group 0, government school students",
      who: ageLine,
      finder: "A govt school student, age 14 to 16",
      fees: [{ label: "Fee", amount: "Free" }],
      feeSummary: "free",
      quiz: "Std 8 level, Rounds 1 to 3 online",
      prize: "Astro Adventure Trekking Camp, Manali, with the Dr. Ketankumar Trivedi scholarship of 100%, travel included*",
      journey: groupsJourney,
      note: "Who can choose Group 0? Students who studied Std 6 to 8 fully in a government school (run 100% by the Central or State Government) or are in Std 8 there now, and students who did Std 6 to 8 there and are now in Std 9 or 10 in a semi-government school. Keep your school ID card or bonafide certificate ready.",
    },
    {
      id: "A",
      name: "Group A",
      short: "Non-govt school, 14 to 16",
      title: "Group A, non-govt and semi-govt school students",
      who: ageLine,
      finder: "A non-govt or semi-govt school student, age 14 to 16",
      fees: [{ label: "Fee", amount: "₹230" }],
      feeSummary: "₹230",
      quiz: "Std 8 level, Rounds 1 to 3 online",
      prize: "Astro Adventure Trekking Camp, Manali, with the Dr. Ketankumar Trivedi scholarship of 60 to 100%*",
      journey: groupsJourney,
    },
    {
      id: "B",
      name: "Group B",
      short: "Age 16+ to 18",
      title: "Group B, senior school",
      who: "Age 16+ to 18",
      finder: "Age 16+ to 18",
      fees: [
        { label: "Group B, govt school", amount: "₹156" },
        { label: "Group B, non-govt school", amount: "₹369" },
      ],
      feeSummary: "₹156 for govt schools, ₹369 for non-govt schools",
      quiz: "Std 10 level, Rounds 1 to 3 online",
      prize: "Astro Adventure Trekking Camp, Manali, with the Dr. Ketankumar Trivedi scholarship of 60 to 100%*",
      journey: groupsJourney,
    },
    {
      id: "C",
      name: "Group C",
      short: "Students 18+",
      title: "Group C, students above 18",
      who: "Age 18+, students only",
      finder: "A student above 18 (12th pass, college or higher studies)",
      fees: [{ label: "Fee", amount: "₹651" }],
      feeSummary: "₹651",
      quiz: "Std 12 basic level, Rounds 1 to 3 online",
      prize:
        "Astro Adventure Trekking Camp, Manali, with the Dr. Ketankumar Trivedi scholarship of 60 to 100%*. Also in the lucky draw for the Sindhu Darshan yatra, Leh-Ladakh 2027 (100%*).",
      journey: [
        { title: "Online quiz, Rounds 1 to 3", note: "Jan to Feb 2027" },
        { title: "Rounds 4 and 5 at one offline camp", note: "Marine camp in Gujarat, 2027, for students selected in Round 3" },
        { title: "Astro Adventure Trekking Camp, Manali", note: "2027, for students selected in Round 5", goal: true },
        { title: "Lucky draw for the Sindhu Darshan yatra, Leh-Ladakh 2027", note: "held at Round 4", goal: true },
      ],
    },
    {
      id: "D",
      name: "Group D",
      short: "Age 18+",
      title: "Group D, age 18+",
      who: "Age 18+: government employees, environmentalists, sports persons and nature-loving citizens. Teachers join Group E.",
      finder: "An adult, age 18+",
      fees: [{ label: "Fee", amount: "₹1,651" }],
      feeSummary: "₹1,651",
      quiz: "No online quiz. After a government document check, an online live lucky draw picks who goes straight to Round 4 (Marine camp).",
      prize:
        "Two live lucky draws at Round 4. The Astro Adventure Trekking Camp, Manali 2027 (Lavkumar Khachar scholarship, up to 60%*) and the Sindhu Darshan yatra, Leh-Ladakh 2027 (100%*). Win Ladakh and bring 1 person along (husband / wife / friend 18+ / own child), both on 100%*.",
      journey: adultJourney,
    },
    {
      id: "E",
      name: "Group E",
      short: "Teachers",
      title: "Group E, teachers",
      who: "Recognised school teachers, including retired. No age limit.",
      finder: "A teacher",
      fees: [{ label: "Fee", amount: "₹963" }],
      feeSummary: "₹963",
      quiz: "No online quiz. After a government document check, an online live lucky draw picks who goes straight to Round 4 (Marine camp).",
      prize:
        "Two live lucky draws at Round 4. The Astro Adventure Trekking Camp, Manali 2027 (Lavkumar Khachar scholarship, up to 60%*) and the Sindhu Darshan yatra, Leh-Ladakh 2027 (100%*).",
      journey: adultJourney,
    },
  ],
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
        "Group 0 is free; Group B govt school fee is ₹156",
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
  ],
  scholarships: [
    {
      img: "/img/olympiad/ketankumar-trivedi.webp",
      alt: "Late Sir Dr. Ketankumar P. Trivedi",
      focus: "object-[center_25%]",
      kicker: "Groups 0, A, B and C",
      name: "Sir Dr. Ketankumar Trivedi Adventure Scholarship",
      life: "In loving memory. Founder of CNA, 1971 to 2024.",
      quote: "“A lamp of nature, for back to nature movements.”",
      award: "60 to 100%",
      awardFor: "for selected students of Groups A, B and C. Group 0: 100%, travel included.",
      facts: [
        ["Education", "PhD in Boxing and Master in Physical Education, Saurashtra University"],
        ["Sports", "Committee member, Indian Olympic Association, from Gujarat. Organising committee, Commonwealth Games 2010."],
        ["Outdoors", "Snow skiing and mountain rescue training, 1996"],
      ],
      pdf: {
        label: "About Sir Dr. Ketankumar Trivedi (PDF)",
        href: "https://w0rcyc5i51abzzpx.public.blob.vercel-storage.com/documents/10%20About%20Sir%20Dr.%20Ketankumar%20Trivedi%20-%20Scholarship.pdf",
      },
    },
    {
      img: "/img/olympiad/lavkumar-khachar.webp",
      alt: "Sir K.S. Lavkumar Khachar",
      focus: "object-[center_30%]",
      kicker: "Groups D and E",
      name: "Sir K.S. (Jasdan) Lavkumar Khachar Adventure Scholarship",
      life: "Naturalist and visionary of this scholarship",
      quote: "He started nature education camps for young people in Gujarat.",
      award: "Up to 60%",
      awardFor: "for selected adults of Groups D and E",
      facts: [
        ["Nature", "Noted ornithologist from the Jasdan family. Worked with Dr. Salim Ali."],
        ["Education", "Began the nature education movement in Gujarat with WWF India, 1976"],
        ["Honours", "Salim Ali Loke Wan Tho Lifetime Achievement Award"],
      ],
      pdf: {
        label: "About Sir Lavkumar Khachar (PDF)",
        href: "https://w0rcyc5i51abzzpx.public.blob.vercel-storage.com/documents/09%20About%20Sir%20K.S.%20(Jasdan)%20Lavkumar%20Khachar%20-%20Scholarship.pdf",
      },
    },
  ],
  prizes: [
    {
      img: "/img/cna/real/trek-02-wide.webp",
      alt: "A line of CNA campers trekking up a green Himalayan hillside near Manali",
      groups: "Groups 0, A, B, C · D, E by lucky draw",
      title: "Astro Adventure Trekking Camp, Manali",
      text: "Treks, snow, river rafting, rock climbing and night-sky sessions at CNA's own Manali campus.",
      place: "Vashisht, Manali",
      meta: "2027 to 2030",
      link: { label: "See the camp", href: "/trips/astro-adventure-manali" },
    },
    {
      img: "/img/olympiad/ladakh-trek.webp",
      alt: "Trekkers crossing a rocky stream below Kangyatse peak in the Markha valley, Ladakh",
      groups: "Groups C, D and E",
      title: "Sindhu Darshan yatra, Leh-Ladakh",
      text: "Chosen by lucky draw from Groups C, D and E, with 100% on the camp fee*. Group D winners can bring 1 person along, also on 100%.",
      place: "Leh-Ladakh",
      meta: "2027",
    },
  ],
  rules: [
    ["Choose your group by your age on the day you register.", " A wrong group means the registration is cancelled."],
    [
      "Group 0 is only for government school students,",
      " as defined in the rules. Groups 0 and B (govt fee) need a school ID card or bonafide certificate.",
    ],
    ["Pay online only,", " through Razorpay on this page. The fee goes straight to the Trust's account."],
    [
      "Our Trust's name is Saurashtra Education & Charitable Trust, Rajkot.",
      " If you pay anyone with a similar-looking name, we are not responsible.",
    ],
    ["Under 18?", " A parent or guardian adds their details and consent in the form."],
    ["Your registration number, quiz link and all updates come only on WhatsApp.", " Give an active WhatsApp number."],
    ["Groups D and E", " must upload a government ID."],
    ["Selection is not only the quiz.", " The Trust also looks at past activities, competitions, medical fitness and teachers' opinion."],
    ["The scholarship is on the camp fee only.", " The registration fee is not refundable."],
    ["The Trust's decision is final on all rules and selection.", " Read the full rules on the [notice board](#notices)."],
  ],
  keepReady: [
    "Age of the participant and the school type",
    "Parent's name and phone, if under 18",
    "An active WhatsApp number for all updates",
    "Online payment through Razorpay (UPI, card or net banking)",
    "School or referral code, if you have one",
    "School ID card or bonafide certificate (Group 0 and Group B govt fee) · Government ID (Groups D, E)",
  ],
  faqs: [
    {
      question: "Who can take part?",
      answer:
        'Students age 14 to 16 (Group 0 for government schools, Group A for others), students age 16+ to 18 (Group B), students above 18 (Group C), adults 18+ who love nature (Group D) and teachers (Group E). Use "Find the right group" above.',
    },
    {
      question: "Who is in Group 0?",
      answer:
        "Students who studied Std 6 to 8 fully in a government school (run 100% by the Central or State Government) or are in Std 8 there now, and students who did Std 6 to 8 there and are now in Std 9 or 10 in a semi-government school.",
    },
    {
      question: "Can adults join?",
      answer:
        "Yes. They join Group D, and teachers join Group E. There is no online quiz for them. After a government document check, an online live lucky draw picks who goes straight to Round 4.",
    },
    {
      question: "How do I register?",
      answer: "Press Register now on this page, fill the form and pay online through Razorpay. Your registration number comes on WhatsApp.",
    },
    {
      question: "Which language is the quiz in?",
      answer: "Gujarati or English. It has 100 multiple choice questions and lasts 60 minutes.",
    },
    {
      question: "What does the scholarship cover?",
      answer:
        "The camp fee only. Group 0 gets 100% with travel. Groups A, B and C can get 60 to 100%. Groups D and E can get up to 60% on the Manali camp, and the Sindhu Darshan lucky draw winners get 100%. Travel and food on the journey are not included, except for Group 0.",
    },
    { question: "Where are results posted?", answer: "On the notice board of this page, and on WhatsApp." },
    {
      question: "Is the payment safe?",
      answer:
        "Yes. Pay only on this page, through Razorpay. The fee goes straight to the Trust's account. Never pay a person or any other account.",
    },
  ],
  remindOptions: [
    { value: "0", label: "Group 0, government school, age 14 to 16" },
    { value: "A", label: "Group A, other school, age 14 to 16" },
    { value: "B", label: "Group B, age 16+ to 18" },
    { value: "C", label: "Group C, student above 18" },
    { value: "D", label: "Group D, age 18+" },
    { value: "E", label: "Group E, teacher" },
    { value: "school", label: "A school or class (teacher)" },
    { value: "unsure", label: "Not sure yet" },
  ],
  ui: {
    language: "Language",
    bar: { opens: "Registration opens", details: "All details are below." },
    contactUs: "Contact us",
    seeGroups: "See the groups",
    scholarshipLine: { before: "with up to", value: "100%", after: "scholarship" },
    heroBadge: { title: "Manali", text: "Astro Adventure Trekking Camp" },
    joint: { label: "A joint initiative of", trustLine: "Rajkot · Reg.", cnaLine: "Rajkot · camps and treks for 28+ years" },
    nav: {
      notices: "Notice board",
      how: "How it works",
      groups: "Groups",
      partners: "Schools and teachers",
      scholarships: "Scholarships",
      prizes: "Prizes",
      rules: "Rules",
      faq: "FAQs",
    },
    sections: {
      notices: {
        eyebrow: "Notice board",
        title: "Latest news and key dates",
        lead: "Official notices, PDFs, quiz dates and results are posted here first. Please check before every round.",
      },
      how: {
        eyebrow: "How it works",
        title: "Five rounds, from quiz to camp",
        lead: "Part of the Mountain, Desert and Marine project. It mixes science, nature and adventure.",
      },
      groups: {
        eyebrow: "Groups and fees",
        title: "Find the right group",
        lead: "There are six groups. Each one has its own fee, journey and prize. Pick your age or school to see the right one.",
      },
      partners: {
        eyebrow: "For schools and teachers",
        title: "Bring your whole class, or spread the word",
        lead: "Schools can register many students from one place. Teachers and other people can share a personal code and get recognised for every student who joins.",
      },
      scholarships: {
        eyebrow: "Scholarships",
        title: "Named after two lamps of nature",
        lead: "Both scholarships are on the camp fee only. They carry the names of two men who spent their lives taking young people into nature.",
      },
      prizes: { eyebrow: "The prizes", title: "Where the winners go" },
      rules: { eyebrow: "Before you register", title: "Rules in one place" },
      faq: { eyebrow: "FAQs", title: "Questions parents and participants ask" },
    },
    noticeBoard: {
      title: "Notice board",
      from: "From the CNA team",
      live: "Live",
      official: "Official",
      viewPdf: "View PDF",
      newTab: "(opens in a new tab)",
      moreTitle: "Please read the full rules before you register.",
      moreText: "Quiz dates, links and results will be posted here as each round comes up.",
    },
    keyDates: "Key dates",
    glanceLabel: "The quiz at a glance",
    register: {
      eyebrow: "Registration",
      title: "Registration opens on",
      text: "Questions before then? Leave your details and the CNA team will get back to you.",
      help: "Help:",
      keepReady: "Keep these ready",
    },
    help: {
      title: "Need help?",
      text: "Questions about groups, fees or the quiz? Message or call the CNA team.",
      whatsapp: "WhatsApp us",
      whatsappMessage: "Hi, I have a question about Adventure Olympiad 2.0",
      call: "Call",
      trustEmail: "Trust email:",
    },
    picker: {
      participant: "The participant is",
      choose: "Choose class or age",
      empty: "The group shows here.",
      thisIs: "This is",
      fee: "Fee",
      quiz: "Quiz",
      prize: "Prize:",
      journey: "The journey",
      group: "Group",
      footnote:
        "*Scholarship is on the camp fee only, as per the Trust's terms. Travel and food on the journey are not included (Group 0 also gets travel).",
      tabsLabel: "Groups",
    },
  },
};

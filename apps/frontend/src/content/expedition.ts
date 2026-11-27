/**
 * Sarasvati - Sindhu Darshan Yatra: the registration page's text. The organiser's wording rule is to
 * always say "expedition"; the page never names a vehicle or a way of travelling.
 */
export const expedition = {
  path: "/sarasvati-sindhu-darshan-yatra",
  name: "Sarasvati - Sindhu Darshan Yatra, Leh-Ladakh",
  label: "The expedition · Gujarat to Ladakh",
  tagline: "A 21 day expedition from Gujarat to Ladakh. Limited people will be selected.",
  organiser: "Expedition organised by Climber Nature Adventure Club, Rajkot. Backed by Saurashtra Education & Charitable Trust, Rajkot.",
  hero: {
    src: "/img/expedition/sindhu-darshan-yatra-hero.webp",
    alt: "Stupas and mountains in Ladakh on the Sarasvati - Sindhu Darshan Yatra route",
  },
  seo: {
    title: "Sarasvati - Sindhu Darshan Yatra, Leh-Ladakh | Registration | CNA Camp",
    description:
      "Register for the Sarasvati - Sindhu Darshan Yatra, a 21 day expedition from Gujarat to Leh-Ladakh. Registration fee Rs 108. Details in a Zoom meeting on 26 Dec 2026.",
    keywords: [
      "Sindhu Darshan Yatra Leh-Ladakh registration",
      "Leh Ladakh expedition from Gujarat",
      "Gujarat to Ladakh 21 days",
      "Sarasvati Sindhu Darshan Yatra",
      "Ladakh expedition registration",
      "CNA Camp Rajkot",
      "સિંધુ દર્શન યાત્રા",
      "સરસ્વતી સિંધુ દર્શન યાત્રા",
      "લેહ લદ્દાખ યાત્રા",
      "ગુજરાત થી લદ્દાખ",
    ],
  },
  /** The one Zoom meeting where every detail is shared. */
  meeting: {
    start: "2026-12-26T15:18:00+05:30",
    end: "2026-12-26T16:40:00+05:30",
    short: "Sat, 26 Dec 2026, 3:18 PM to 4:40 PM",
    long: "Saturday, 26 December 2026, 3:18 PM to 4:40 PM",
  },
  steps: [
    ["Register", (fee: number) => `Fill the short form and pay the registration fee of Rs ${fee}.`],
    ["Get the link", () => "The Zoom meeting link comes on your WhatsApp number."],
    ["Join the Zoom meeting", () => "Saturday, 26 December 2026, sharp 3:18 PM to 4:40 PM. All details of the expedition are shared here."],
    ["Selection", () => "A limited number of people are selected for the expedition."],
  ] as [string, (fee: number) => string][],
  pleaseRead: (fee: number) => [
    "Only for people from Gujarat.",
    "The Zoom meeting is only for those who definitely want to join the expedition.",
    "No call and no message for details. Everything is explained only in the Zoom meeting.",
    "Registration does not mean selection. A limited number of people will be selected.",
    `The registration fee of Rs ${fee} is compulsory.`,
  ],
  form: {
    title: "Register for the Zoom meeting",
    lead: "It takes about 1 minute. Keep your WhatsApp number ready.",
    agree: (fee: number) =>
      `I am from Gujarat. I understand that Rs ${fee} is a registration fee, that details are shared only in the Zoom meeting, and that registration does not mean selection.`,
    privacy: "We use your details only for this expedition. We do not share or sell them.",
    genders: [
      ["female", "Female"],
      ["male", "Male"],
      ["undisclosed", "Prefer not to say"],
    ] as [string, string][],
  },
  faqs: (fee: number) => [
    {
      question: "What is the Sarasvati - Sindhu Darshan Yatra?",
      answer:
        "A 21 day expedition from Gujarat to Leh-Ladakh, organised by Climber Nature Adventure Club, Rajkot, backed by Saurashtra Education & Charitable Trust, Rajkot.",
    },
    {
      question: "How do I get the details?",
      answer:
        "All details are shared only in one Zoom meeting on Saturday, 26 December 2026, from 3:18 PM to 4:40 PM. The meeting is only for registered people.",
    },
    {
      question: "What is the registration fee?",
      answer: `Rs ${fee} per person. It is compulsory. Without it you will not get the Zoom meeting link.`,
    },
    {
      question: `Is Rs ${fee} the cost of the expedition?`,
      answer: `No. Rs ${fee} is only the registration fee for the Zoom meeting and the selection process. The expedition dates and cost are shared in the meeting.`,
    },
    {
      question: "How will I get the Zoom link?",
      answer: "On WhatsApp, on the number you give in the form, after your payment is done.",
    },
    {
      question: "Who can register?",
      answer: "People from Gujarat only. A limited number of people will be selected for the expedition.",
    },
    {
      question: "Can I call or message for details?",
      answer:
        "No. To keep it fair for everyone, details are given only in the Zoom meeting. Please do not call or message for expedition details.",
    },
    {
      question: "Does registration mean I am selected?",
      answer: "No. Registration gets you into the Zoom meeting. Selection for the expedition comes after it.",
    },
  ],
};

/** Used until the dates and fee are saved in the admin (Sindhu Darshan Yatra → Settings). */
export const expeditionDefaults = {
  opensAt: "2026-11-29T12:36:00.000Z",
  closesAt: "2026-12-26T09:48:00.000Z",
  fee: 108,
  minAge: 18,
};

import type { FeatureIconName } from "@/components/ui/FeatureIcon";

type Feature = [icon: FeatureIconName, title: string, text: string];
type DateItem = { icon: FeatureIconName; label: string; value: string };

// Adventure Olympiad 2026 details from the approved design. Editable in the CMS later.
export const olympiad = {
  name: "Adventure Olympiad 1.0",
  tagline: "India’s first Adventure Olympiad",
  formUrl: "https://docs.google.com/forms/d/e/1FAIpQLScmRxjPKSZCuYZX5RQz1Dwh2RzibDaG4xgqlgHrFkRd1_kfwg/viewform",
  rulesPdf: "https://www.cnacamp.com/rules-of-camp.pdf",
  lavkumarPdf: "https://www.cnacamp.com/Lavkumar.pdf",
  ketankumarPdf: "https://www.cnacamp.com/Dr-ketankumar-new.pdf",
  campFee: 18000,
  opens: "2026-04-02T12:59:00+05:30",
  closes: "2026-06-20T23:59:00+05:30",
  dates: [
    { icon: "notePencil", label: "Registration opens", value: "2 April 2026, 12:59 PM" },
    { icon: "alarm", label: "Registration closes", value: "20 June 2026, 11:59 PM" },
    { icon: "exam", label: "Round 1, Eco-STEM quiz", value: "Early July 2026" },
    { icon: "mountains", label: "Astro Adventure Camp, Manali", value: "Dates announced after the final merit list" },
  ] satisfies DateItem[],
  fees: [
    { fee: 90, who: "Government school students", group: "Group A or B · Scholarship 1" },
    { fee: 108, who: "All students", group: "Group A, B or C · Scholarship 2" },
    { fee: 504, who: "Teachers and sports persons", group: "Group D · Volunteers" },
  ],
  stats: [
    ["14 to 25", "Ages"],
    ["100%", "Scholarship, up to"],
    ["₹18K", "Camp fee covered"],
    ["100", "MCQs"],
    ["5", "Rounds"],
  ],
  about: [
    "Most quizzes end with a certificate. This one ends with a train ticket to Manali.",
    "The Adventure Olympiad is run jointly by Saurashtra Education & Charitable Trust and Climber Nature Adventure Club, both from Rajkot. The idea is simple: young people who are curious about science and nature should get a real chance to see the mountains, whatever their family can afford. It follows the learning-by-doing approach of the National Education Policy.",
    "You take an Eco-STEM quiz in maths, science, social studies, general knowledge and logical reasoning. The best performers win scholarships for the Astro Adventure Trekking Camp in Manali: hikes, snow treks, river rafting, rock climbing, star gazing, STEM sessions, yoga and talks by experts.",
  ],
  pillars: [
    ["tree", "Environment education", "Learn conservation outdoors, not from a slide."],
    ["planet", "Astronomy & STEM", "Star gazing, space science and hands-on experiments."],
    ["boot", "Adventure activities", "Trekking, rafting and rock climbing with trained instructors."],
    ["flag", "Leadership & life skills", "Teamwork and confidence, the way NEP asks schools to teach them."],
  ] satisfies Feature[],
  groups: [
    {
      g: "A",
      age: "14+ to 16 years",
      std: "Std 8 to 9 (academic year 2025-26)",
      syllabus: "Std 8 level",
      fee: "₹90 (government school, Scholarship 1) or ₹108 (all students, Scholarship 2)",
    },
    {
      g: "B",
      age: "16+ to 18 years",
      std: "Std 10 to 11 (academic year 2025-26)",
      syllabus: "Std 10 level",
      fee: "₹90 (government school, Scholarship 1) or ₹108 (all students, Scholarship 2)",
    },
    {
      g: "C",
      age: "18 to 25 years",
      std: "Std 12 and above, college or university",
      syllabus: "Std 12 level",
      fee: "₹108 · Up to 70% with a government school background, up to 60% for others",
    },
    {
      g: "D",
      age: "25+ years",
      std: "Teachers and sports persons only",
      syllabus: "No quiz: you join the camp as a volunteer",
      fee: "₹504",
    },
  ],
  steps: [
    [
      "notePencil",
      "Register & pay online",
      "Read the rules, pay the registration fee online, then fill the Google Form with your payment screenshot.",
    ],
    [
      "exam",
      "Take the Eco-STEM quiz",
      "100 MCQs, 100 marks, 60 minutes. Rounds 1 to 3 are online. Rounds 4 and 5 are offline, with basic training camps in Gujarat.",
    ],
    [
      "trophy",
      "Merit list & documents",
      "The final merit list uses your quiz score plus other achievements (NMMS, science fairs, sports). Selected students send a medical certificate and parental consent within 10 days.",
    ],
    [
      "mountains",
      "Manali adventure camp",
      "Travel from Ahmedabad and back by rail or bus, hotel or tent stay, vegetarian meals, trekking, rafting, star gazing, STEM sessions and a certificate.",
    ],
  ] satisfies Feature[],
  quiz: [
    ["Type", "Multiple choice questions (MCQ)"],
    ["Language", "Gujarati or English"],
    ["Subjects", "Maths, science, social studies, GK and logical reasoning"],
    ["Level", "Based on your group (Std 8, 10 or 12)"],
    ["Format", "Online. The quiz link comes to your WhatsApp number."],
  ],
  rounds: [
    ["Round 1", "Pre-prelims quiz", "Online"],
    ["Round 2", "Prelims quiz", "Online"],
    ["Round 3", "Quarter-final, selection for the pre-basic camp", "Online"],
    ["Round 4", "Semi-final quiz and pre-basic camp", "Offline, Gujarat"],
    ["Round 5", "Grand final quiz and basic adventure activity camp", "Offline, Gujarat"],
  ],
  roundsResult: "Selection for the Astro Adventure Trekking Camp, Manali (2026-27)",
  selectionNote:
    "The quiz is not the only test. The Trust also looks at NMMS results, science fairs, Gyan Sadhana, sports achievements and teacher recommendations.",
  scholarships: [
    {
      n: 1,
      name: "K.S. Sir Lavkumar Khachar Adventure Scholarship",
      pct: "100%",
      img: "/img/olympiad/lavkumar-khachar.webp",
      pdf: "lavkumarPdf",
      pdfLabel: "About Sir Lavkumar Khachar",
      text: "A full scholarship for students who passed Std 8 from a government primary school (or RTE students in private schools).",
      points: ["100% scholarship for Group A and Group B", "You must be in Std 8 to 12 now", "Registration fee: ₹90"],
    },
    {
      n: 2,
      name: "Sir Dr. Ketankumar Trivedi Adventure Scholarship",
      pct: "Up to 70%",
      img: "/img/olympiad/ketankumar-trivedi.webp",
      pdf: "ketankumarPdf",
      pdfLabel: "About Sir Dr. Ketankumar Trivedi",
      text: "For students from any school, college or university, named after CNA’s late founder.",
      points: [
        "Open to all students in Group A, B or C",
        "Up to 60% of the camp fee",
        "70% for Group C students who passed Std 8 from a government school and now study in a government or grant-aided college or university",
        "Choose the right age group when you register",
        "Registration fee: ₹108",
      ],
    },
  ],
  scholarshipRule:
    "Apply for only ONE scholarship. Applying for both means automatic disqualification. Once you are selected, your choice cannot change. Scholarships cannot be transferred and are not paid in cash. The organiser’s decision is final.",
  campPhotos: [
    { img: "cna/real/campus-03", caption: "Our Manali campus", alt: "CNA’s Manali campus buildings with snow peaks behind" },
    { img: "cna/real/river-01", caption: "River crossing", alt: "Campers crossing a river on a wooden bridge near Manali" },
    { img: "cna/real/climb-03", caption: "Rappelling day", alt: "A camper rappelling down a rock face on a rope" },
    { img: "cna/real/snow-02", caption: "Snow day", alt: "Campers walking up a snowy mountain road in warm layers" },
  ],
  included: [
    [
      "bus",
      "Travel (Ahmedabad and back)",
      "Return trip from Ahmedabad by rail or bus. Carry your own dry snacks: meals on the journey are not included.",
    ],
    ["tent", "Stay", "Hotel rooms or Swiss tents at our Manali campus, with the Himalaya all around."],
    ["forkKnife", "Vegetarian meals", "Breakfast, lunch and dinner, checked by instructors. Tell us early about any special diet."],
    ["boot", "Hiking & snow trekking", "Mountain and snow treks with trained instructors and clear safety rules."],
    ["waves", "River rafting & rock climbing", "Run by certified instructors. Selected students are insured."],
    ["planet", "Astro & STEM", "Night sky watching, telescope sessions, STEM workshops."],
    ["lotus", "Yoga & meditation", "Simple morning sessions that suit beginners."],
    ["chalkboard", "Expert talks", "Space, science, maths, environment, law, technology, cyber safety, art and social topics."],
    ["certificate", "Certificate", "Participation and achievement certificate from Climber Nature Adventure Club."],
  ] satisfies Feature[],
  regions: ["Saurashtra", "Kutch", "North Gujarat", "Central Gujarat", "South Gujarat"],
  eligibility: [
    "Age 14+ to 25 years (as on 31 May 2026)",
    "Students (Std 8 and above), teachers or sports persons",
    "From any district of Gujarat",
    "Registered in the correct age group and class",
    "Physically and mentally fit for camp activities",
    "Selected students send a medical fitness certificate, parental consent and a risk declaration within 10 days",
  ],
  rules: [
    "The registration fee is non-refundable in all cases",
    "Wrong age group or class means automatic rejection, with no refund",
    "Apply for only ONE scholarship. Applying for both means disqualification",
    "Pay only through the official payment link in the registration form. Check it carefully before you pay",
    "Misconduct at camp means removal from the camp at the participant’s own cost",
    "Participation is voluntary. The organiser is not liable for injury, accident, illness or natural events during the camp",
  ],
  faqs: [
    {
      q: "What is the Adventure Olympiad 1.0?",
      a: "An Eco-STEM quiz with an adventure prize, run by Saurashtra Education & Charitable Trust and Climber Nature Adventure Club, Rajkot. You take an online quiz (100 MCQs, 60 minutes). Top performers win scholarships of up to 100% for the Astro Adventure Trekking Camp in Manali.",
    },
    {
      q: "Is registration free?",
      a: "No. The fee is ₹90 (Scholarship 1, government school students in Group A or B), ₹108 (Scholarship 2, all students in Group A, B or C) or ₹504 (Group D, teachers and sports persons). It is paid online and is non-refundable.",
    },
    {
      q: "What is the difference between the two scholarships?",
      a: "Scholarship 1 (K.S. Sir Lavkumar Khachar) gives 100% to government school students in Group A or B, fee ₹90. Scholarship 2 (Sir Dr. Ketankumar Trivedi) gives up to 60% to all students in Group A, B or C, and 70% to Group C students with a government school background, fee ₹108. You can apply for only one.",
    },
    {
      q: "What does the scholarship cover?",
      a: "It is a percentage of the ₹18,000 camp fee. 100% covers the full fee. With 60% you pay ₹7,200. The camp fee includes travel from Ahmedabad and back, stay, meals at camp, all activities and a certificate.",
    },
    {
      q: "Is selection based only on the quiz?",
      a: "No. The Trust makes the final merit list from your quiz score, NMMS results, maths and science fair and Gyan Sadhana results, sports and science activities, other merit certificates, medical fitness and government school teacher recommendations.",
    },
    {
      q: "Who can apply?",
      a: "Any eligible student aged 14+ to 25, or a teacher or sports person, from any district of Gujarat: Saurashtra, Kutch, North, Central and South Gujarat.",
    },
    {
      q: "What documents do I need after selection?",
      a: "Within 10 days: a medical fitness certificate, a parental consent letter, a risk and responsibility declaration, and a hard copy of your registration form (Scholarship 1 applicants need the principal’s verification). If a document is missing, the selection is cancelled.",
    },
    {
      q: "How do I register?",
      a: "Read the rules, pay the fee online, click Register, fill the Google Form and upload your payment screenshot. After you submit, the quiz link comes to your WhatsApp number.",
    },
  ],
} as const;

/**
 * The Adventure Olympiad 2.0 Rules and Terms, as in the official PDF of 14 Nov 2026 (notice no. 02/2026),
 * shown in the registration form before the agree tick. Tables of the PDF are written as "label: value" lines.
 */

export type RulesBlock = { text: string } | { list: string[] };
export type RulesSection = { title: string; blocks: RulesBlock[] };

export const rulesIntro = {
  title: "Adventure Olympiad 2.0: Rules and Terms",
  meta: "Eco-STEM Online Quiz, Scholarships and Adventure Camps · As per notice no. 02/2026 dated 20 Oct 2026",
  lead: "Please read all rules before you register. When you register, you agree to these rules.",
};

export const rulesEn: RulesSection[] = [
  {
    title: "1. Key dates",
    blocks: [
      {
        list: [
          "Registration: 15 Nov to 14 Dec 2026 (till 11:59 PM)",
          "Last buffer date: 27 Dec 2026",
          "Last date to pay the fee: 31 Dec 2026",
          "Rounds 1, 2 and 3 (online): January to February 2027 (tentative)",
          "Online live lucky draw (Groups D, E): date on the website notice board",
          "Round 4 (offline, at camp): Groups 0, A, B: Aug 2027 (tentative) · Groups C, D, E: Marine Camp, date on the notice board",
          "Round 5 (offline, at camp): date on the website notice board",
          "Merit list after Round 3: March 2027 (tentative; exact date on the notice board)",
        ],
      },
      {
        text: "The exact date and time of every round will be announced on the notice board at www.cnacamp.com and on the registered WhatsApp number. Keeping in mind school / board examinations, public holidays, weather or other unavoidable circumstances, the Trust reserves the right to change the date and time of any round.",
      },
    ],
  },
  {
    title: "2. Who can join and fees",
    blocks: [
      {
        list: [
          "Group 0: Government school* students, age 14 to 16 (13+: must have completed 13 years on the day of filling the form). Fee: 0 (free). Quiz: online Rounds 1 to 3, Std 8 level.",
          "Group A: Non-government / semi-government school students, age 14 to 16 (13+: must have completed 13 years on the day of filling the form). Fee: ₹230. Quiz: online Rounds 1 to 3, Std 8 level.",
          "Group B: Students, age 16+ to 18. Fee: government school ₹156, non-government / semi-government ₹369. Quiz: online Rounds 1 to 3, Std 10 level.",
          "Group C: Students 18+ (12th pass, college or higher studies). Fee: ₹651. Quiz: online Rounds 1 to 3, Std 12 basic level.",
          "Group D: Adults 18+: government employees, environmentalists, sports persons, nature lovers. Fee: ₹1,651. No online quiz. Government document check, then online live lucky draw. Only the registered person picked in the draw goes straight to Round 4 (Marine Camp).",
          "Group E: Teachers only: teachers of recognised schools and retired teachers. No age limit. Fee: ₹963. No online quiz. Government document check, then online live lucky draw. Only the registered person picked in the draw goes straight to Round 4 (Marine Camp).",
        ],
      },
      {
        text: "Choose the right group by your age on the day you register. If you choose a wrong group, your registration will be cancelled.",
      },
      {
        text: "* Group 0 (government school): a government school means a school run 100% by the Central or State Government. Only these students can fill the form for Group 0: (1) students who studied Std 6 to 8 fully in such a government school, or who are now in Std 8 there; or (2) students who studied Std 6 to 8 fully in such a government school and are now in Std 9 or 10 in a semi-government school.",
      },
      { text: "The government school fee of Group B is only for students of a government school." },
      { text: "Groups 0 and B (government school fee) must give school proof: school ID card or bonafide certificate." },
      { text: "The registration fee is not refundable." },
    ],
  },
  {
    title: "3. Scholarships and prizes",
    blocks: [
      {
        text: "Scholarships are only on the camp fee of the Pre Basic, Marine, Desert and Kullu / Manali camps and the Sindhu Darshan yatra. Transport and food on the journey are not included (Group 0 also gets transport).",
      },
      {
        list: [
          "Sir Dr. Ketankumar Trivedi Adventure Scholarship: Group 0, 100% with transport.",
          "Sir Dr. Ketankumar Trivedi Adventure Scholarship: Groups A, B, C, minimum 60% to 100%.",
          "Sir K.S. (Jasdan) Lavkumar Khachar Adventure Scholarship: Groups D, E, up to 60%.",
          "Gujarat camps (Pre Basic, Marine and Desert): Groups 0, A, B: Pre Basic, Marine, Desert · Group C: Marine · Groups D, E: Marine (after the lucky draw). Scholarship on the camp fee (Group 0: 100% + transportation).",
          "Astro Adventure Trekking Camp, Kullu / Manali: Groups 0, A, B (as per the camp path, 2029-30) · Group C (2027): selected in Round 5 through the quiz · Groups D, E (2027): selected in the in-person live lucky draw at Round 4. Scholarship on the camp fee.",
          "Sindhu Darshan yatra, Leh-Ladakh 2027: lucky draw from Groups C, D, E. 100% on the camp fee* · Group D: 1+1 (both persons get 100%).",
        ],
      },
      { text: "One person gets only one scholarship." },
      { text: "This scholarship runs from 2026 to 2030. Students of Groups 0, A and B must continue their studies till then." },
      {
        text: "Group D 1+1: for the Sindhu Darshan yatra only, the registered person picked in the lucky draw can take 1 more person (husband / wife / friend (18+) / own child), and both get the 100% scholarship on the camp fee.",
      },
      { text: "A scholarship cannot be given to another person or taken as cash." },
      { text: "* As per the Trust's terms." },
    ],
  },
  {
    title: "4. Camp path",
    blocks: [
      {
        list: [
          "Groups 0, A, B: Round 4 (Aug 2027, tentative): Pre Basic Environment Camp, Gujarat · Round 5: Marine Intro Camp, Gujarat (2027-28) · Desert Intro Camp, Gujarat (2028-29) · Astro Adventure Trekking Camp, Manali (2029-30, for those selected in Round 5).",
          "Group C: Rounds 4 and 5: Marine Intro Camp, Gujarat 2027 · Then Astro Adventure Trekking Camp, Manali 2027 (for those selected in Round 5) · Sindhu Darshan lucky draw (held at Round 4).",
          "Groups D, E: After the government documents are checked, there will be an online live lucky draw. Only the registered candidates picked in it will get direct entry to Round 4 (Marine Camp). There, people will be picked in two in-person live lucky draws: 1. Astro Adventure Trekking Camp, Manali 2027 and 2. Sindhu Darshan yatra 2027. For Group D, only for the Sindhu Darshan Leh-Ladakh yatra: 1+1*, a 100% scholarship for both persons.",
        ],
      },
      { text: "* 1 registered person can bring 1 more person with them: husband / wife / friend (18+) / own child." },
    ],
  },
  {
    title: "5. Quiz",
    blocks: [
      {
        list: [
          "There are 5 rounds in all: 3 online and 2 offline (at camp).",
          "Rounds 1 to 3 have 100 multiple choice questions: 100 marks, 60 minutes. You can take the quiz from home on a mobile or computer.",
          "The quiz language is Gujarati or English.",
          "The questions cover maths, science, social science, general knowledge, logical reasoning and environment education.",
          "Std 10, Std 12 and college students can choose the date and time of their online quiz in the form.",
          "The quiz link and time will be sent to the WhatsApp number given in the form.",
          "The result of every round will be posted on the notice board at www.cnacamp.com.",
        ],
      },
    ],
  },
  {
    title: "6. Selection",
    blocks: [
      {
        list: [
          "Selection is not only on quiz marks. The Trust also looks at co-curricular activities, competitions (NMMS, maths and science fair, Gyan Sadhana, sports), medical fitness and teachers' opinion.",
          "The merit list prepared by the Trust will be final.",
        ],
      },
    ],
  },
  {
    title: "7. How to register",
    blocks: [
      {
        list: [
          "Read all the rules and terms of the quiz, scholarships and adventure camps carefully at www.cnacamp.com/olympiad.",
          "Choose your group and fill the form.",
          "The fee is accepted online only. After you complete the registration, pay the fee only through Razorpay. It goes straight to the Trust's account. Cash or any other mode will not be accepted.",
          'Beware of fraud: our Trust\'s name is "Saurashtra Education & Charitable Trust, Rajkot". If you pay any other trust, body or person with a similar-looking name, our organisation will not be responsible.',
          "Your registration number and all further information (quiz link, time, results and so on) will come only on WhatsApp. So please give an active WhatsApp number in the form.",
          "For students below 18, parent or guardian details and consent are needed in the form.",
          "Groups D and E must upload a government ID. Selection for Round 4 will be by the online live lucky draw.",
          "Write your school or referral code if you have one (optional).",
        ],
      },
    ],
  },
  {
    title: "8. Documents after selection",
    blocks: [
      { text: "Scan and upload the documents on the link given on the website, within the given time." },
      {
        list: [
          "Medical fitness certificate (registered doctor, within 10 days of the merit list): all.",
          "Risk and indemnity form: all (parent signs for below 18).",
          "Parent permission letter: below 18 (Groups 0, A, B).",
          "Government school proof (school ID card or bonafide certificate): Groups 0, B (government school fee).",
          "Government ID: Groups D, E.",
        ],
      },
      { text: "If documents are not given on time, or a government medical officer finds the person unfit, the selection is cancelled." },
    ],
  },
  {
    title: "9. At the camp",
    blocks: [
      {
        list: [
          "Activities (as per camp): trekking, hiking, rock climbing, rope activities, river rafting, snow trekking, stargazing and STEM activities, yoga and meditation, talks by experts.",
          "All activities are done with trained instructors and as per safety rules.",
          "Stay: in a tent, hostel or hotel, on sharing basis.",
          "Food: pure veg breakfast, lunch and dinner will be provided. Tell us early for Jain or medical food. No food on the journey: carry dry snacks.",
          "Travel: transport and food on the journey are not part of the scholarship (Group 0 gets transport). Pick-up, drop and travel details will be sent on WhatsApp before the camp.",
          "Please tell us before the camp about any illness, allergy or regular medicine.",
        ],
      },
    ],
  },
  {
    title: "10. General rules",
    blocks: [
      {
        list: [
          "Joining the camp is voluntary. Adventure activities carry natural risk.",
          "Giving false information or false documents leads to instant disqualification.",
          "Any participant found misbehaving, using alcohol, tobacco or drugs, or breaking camp rules will be sent home. The cost will be paid by the participant or parent.",
          "The Trust may change dates, venue, programme or rules, or cancel a camp, due to weather, safety or government orders. Updates will be posted on the website.",
          "In case of injury, illness, accident or natural disaster, the Trust, Club, instructors and volunteers are not responsible, as far as the law allows (see the risk form). In an emergency, the organisers may take quick decisions.",
          "Your personal and medical data will be used only for the Olympiad and camps, kept safe, and never sold or shared (DPDP Act 2023).",
          "All disputes are subject to Rajkot jurisdiction only.",
          "On rules, selection and all decisions, the Trust's decision is final and binding.",
        ],
      },
    ],
  },
];

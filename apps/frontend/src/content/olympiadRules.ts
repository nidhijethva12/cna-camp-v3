/**
 * The Adventure Olympiad 2.0 Rules and Terms, as in the official English and Gujarati PDFs of 14 Nov 2026
 * (notice no. 02/2026), shown in the registration form before the agree tick. Tables of the PDFs are
 * written as "label: value" lines.
 */

export type RulesBlock = { text: string } | { list: string[] };
export type RulesSection = { title: string; blocks: RulesBlock[] };

export type RulesIntro = { title: string; meta: string; lead: string };

export const rulesIntro: RulesIntro = {
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
          "Registration: 15 Nov to 31 Dec 2026 (till 11:59 PM)",
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

export const rulesIntroGu: RulesIntro = {
  title: "એડવેન્ચર ઓલમ્પિયાડ 2.0: નિયમો અને શરતો",
  meta: "Eco-STEM ઓનલાઇન ક્વિઝ, સ્કોલરશીપ અને એડવેન્ચર કેમ્પ · જાહેરનામું ક્રમાંક 02/2026, તારીખ 20/10/2026 મુજબ",
  lead: "રજિસ્ટ્રેશન કરતાં પહેલાં બધા નિયમો ધ્યાનથી વાંચો. રજિસ્ટ્રેશન કરવાથી આપે આ નિયમો સ્વીકાર્યા છે તેમ માનવામાં આવશે.",
};

export const rulesGu: RulesSection[] = [
  {
    title: "1. મહત્ત્વની તારીખો",
    blocks: [
      {
        list: [
          "રજિસ્ટ્રેશન: 15 નવેમ્બર થી 31 ડિસેમ્બર 2026 (રાત્રે 11:59 સુધી)",
          "છેલ્લી બફર તારીખ: 27 ડિસેમ્બર 2026",
          "ફી ભરવાની છેલ્લી તારીખ: 31 ડિસેમ્બર 2026",
          "રાઉન્ડ 1, 2 અને 3 (ઓનલાઇન): જાન્યુઆરી થી ફેબ્રુઆરી 2027 (સંભવિત)",
          "ઓનલાઇન લાઇવ લકી ડ્રો (ગ્રુપ D, E): તારીખ વેબસાઇટના નોટિસ બોર્ડ પર",
          "રાઉન્ડ 4 (ઓફલાઇન, કેમ્પમાં): ગ્રુપ 0, A, B: ઓગસ્ટ 2027 (સંભવિત) · ગ્રુપ C, D, E: Marine Camp, તારીખ નોટિસ બોર્ડ પર",
          "રાઉન્ડ 5 (ઓફલાઇન, કેમ્પમાં): તારીખ વેબસાઇટના નોટિસ બોર્ડ પર",
          "રાઉન્ડ 3 પછીનું મેરિટ લિસ્ટ: માર્ચ 2027 (સંભવિત, ચોક્કસ તારીખ નોટિસ બોર્ડ પર)",
        ],
      },
      {
        text: "દરેક રાઉન્ડની ચોક્કસ તારીખ અને સમય www.cnacamp.com ના નોટિસ બોર્ડ પર તથા રજિસ્ટર્ડ WhatsApp નંબર પર જાહેર કરવામાં આવશે. વિદ્યાર્થીઓની શાળા / બોર્ડની પરીક્ષાઓ, જાહેર રજાઓ, હવામાન કે અન્ય અનિવાર્ય સંજોગોને ધ્યાનમાં રાખી ટ્રસ્ટ કોઈ પણ રાઉન્ડની તારીખ અને સમયમાં ફેરફાર કરવાનો અધિકાર અનામત રાખે છે.",
      },
    ],
  },
  {
    title: "2. કોણ ભાગ લઈ શકે અને ફી",
    blocks: [
      {
        list: [
          "ગ્રુપ 0: સરકારી શાળાના* વિદ્યાર્થીઓ, ઉંમર 14 થી 16 વર્ષ (13+: ફોર્મ ભરતી વખતે 13 વર્ષ પૂરાં કરેલાં હોવાં જોઈએ). ફી: ₹0 (નિઃશુલ્ક). ક્વિઝ: ઓનલાઇન રાઉન્ડ 1 થી 3, ધો. 8 લેવલ.",
          "ગ્રુપ A: નોન / સેમી સરકારી શાળાના વિદ્યાર્થીઓ, ઉંમર 14 થી 16 વર્ષ (13+: ફોર્મ ભરતી વખતે 13 વર્ષ પૂરાં કરેલાં હોવાં જોઈએ). ફી: ₹230. ક્વિઝ: ઓનલાઇન રાઉન્ડ 1 થી 3, ધો. 8 લેવલ.",
          "ગ્રુપ B: વિદ્યાર્થીઓ, ઉંમર 16+ થી 18 વર્ષ. ફી: સરકારી શાળા ₹156, નોન / સેમી સરકારી ₹369. ક્વિઝ: ઓનલાઇન રાઉન્ડ 1 થી 3, ધો. 10 લેવલ.",
          "ગ્રુપ C: 18+ વિદ્યાર્થીઓ (ધો. 12 પાસ, કોલેજ કે ઉચ્ચ અભ્યાસ). ફી: ₹651. ક્વિઝ: ઓનલાઇન રાઉન્ડ 1 થી 3, ધો. 12 બેઝિક લેવલ.",
          "ગ્રુપ D: 18+ નાગરિકો: સરકારી કર્મચારીઓ, પર્યાવરણવિદ્, રમતવીરો, પ્રકૃતિપ્રેમીઓ. ફી: ₹1,651. ઓનલાઇન ક્વિઝ નથી. સરકારી દસ્તાવેજ ચકાસણી પછી ઓનલાઇન લાઇવ લકી ડ્રો. લકી ડ્રોમાં પસંદ થયેલ રજિસ્ટર્ડ વ્યક્તિને જ રાઉન્ડ 4 (Marine Camp) માં સીધો પ્રવેશ.",
          "ગ્રુપ E: માત્ર શિક્ષકો: માન્ય શાળાના શિક્ષકો તથા નિવૃત્ત શિક્ષકો. ઉંમર મર્યાદા નથી. ફી: ₹963. ઓનલાઇન ક્વિઝ નથી. સરકારી દસ્તાવેજ ચકાસણી પછી ઓનલાઇન લાઇવ લકી ડ્રો. લકી ડ્રોમાં પસંદ થયેલ રજિસ્ટર્ડ વ્યક્તિને જ રાઉન્ડ 4 (Marine Camp) માં સીધો પ્રવેશ.",
        ],
      },
      { text: "રજિસ્ટ્રેશનના દિવસની ઉંમર મુજબ સાચું ગ્રુપ પસંદ કરો. ખોટું ગ્રુપ પસંદ કરશો તો રજિસ્ટ્રેશન રદ થશે." },
      {
        text: "* ગ્રુપ 0 (સરકારી શાળા): સરકારી શાળા એટલે કેન્દ્ર કે રાજ્ય સરકાર દ્વારા 100% સંચાલિત શાળા. ગ્રુપ 0 માટે માત્ર આવા વિદ્યાર્થીઓ જ ફોર્મ ભરી શકશે: (1) જે વિદ્યાર્થીઓએ ધોરણ 6 થી 8 નો અભ્યાસ સંપૂર્ણપણે આવી સરકારી શાળામાં કર્યો હોય અથવા હાલ આવી શાળામાં ધોરણ 8 માં અભ્યાસ કરતા હોય; અથવા (2) જે વિદ્યાર્થીઓએ ધોરણ 6 થી 8 નો અભ્યાસ સંપૂર્ણપણે આવી સરકારી શાળામાં કર્યો હોય અને હાલ અર્ધ સરકારી શાળામાં ધોરણ 9 કે 10 માં અભ્યાસ કરતા હોય.",
      },
      { text: "ગ્રુપ B ની સરકારી શાળાની ફી માત્ર સરકારી શાળાના વિદ્યાર્થીઓ માટે છે." },
      { text: "ગ્રુપ 0 અને ગ્રુપ B (સરકારી ફી) ના વિદ્યાર્થીઓએ શાળાનો પુરાવો (શાળાનું ID કાર્ડ અથવા બોનાફાઇડ સર્ટિફિકેટ) આપવાનો રહેશે." },
      { text: "રજિસ્ટ્રેશન ફી પરત મળશે નહીં." },
    ],
  },
  {
    title: "3. સ્કોલરશીપ અને ઇનામ",
    blocks: [
      {
        text: "સ્કોલરશીપ માત્ર કેમ્પ ફી પર મળશે: Pre Basic, Marine, Desert અને Kullu / Manali camp તથા સિંધુ દર્શન યાત્રા. Transportation અને મુસાફરી દરમિયાનનું ભોજન સામેલ નથી (માત્ર ગ્રુપ 0 ને Transportation પણ મળશે).",
      },
      {
        list: [
          "સર ડૉ. કેતનકુમાર ત્રિવેદી એડવેન્ચર સ્કોલરશીપ: ગ્રુપ 0, 100% (Transportation સાથે).",
          "સર ડૉ. કેતનકુમાર ત્રિવેદી એડવેન્ચર સ્કોલરશીપ: ગ્રુપ A, B, C, ન્યૂનતમ 60% થી 100% સુધી.",
          "સર કુ.શ્રી (જસદણ) લવકુમાર ખાચર એડવેન્ચર સ્કોલરશીપ: ગ્રુપ D, E, 60% સુધી.",
          "ગુજરાતના કેમ્પ (પ્રી બેઝિક, મરીન અને ડેઝર્ટ કેમ્પ): ગ્રુપ 0, A, B: પ્રી બેઝિક, મરીન, ડેઝર્ટ · ગ્રુપ C: મરીન · ગ્રુપ D, E: મરીન (લકી ડ્રો પછી). કેમ્પ ફી પર સ્કોલરશીપ (ગ્રુપ 0: 100% + Transportation).",
          "Astro Adventure Trekking Camp, Kullu / મનાલી: ગ્રુપ 0, A, B (કેમ્પ પાથ મુજબ, 2029-30) · ગ્રુપ C (2027): ક્વિઝ દ્વારા રાઉન્ડ 5 માં પસંદ થયેલ · ગ્રુપ D, E (2027): રાઉન્ડ 4 માં રૂબરૂ લાઇવ લકી ડ્રો દ્વારા પસંદ થયેલ. કેમ્પ ફી પર સ્કોલરશીપ.",
          "સિંધુ દર્શન યાત્રા, લેહ-લદાખ 2027: ગ્રુપ C, D, E માંથી લકી ડ્રો. કેમ્પ ફી પર 100%* · ગ્રુપ D: 1+1 (બંનેને 100%).",
        ],
      },
      { text: "એક વ્યક્તિને માત્ર એક જ સ્કોલરશીપ મળશે." },
      { text: "આ સ્કોલરશીપ વર્ષ 2026 થી 2030 સુધી ચાલશે. ત્યાં સુધી ગ્રુપ 0, A અને B ના વિદ્યાર્થીઓનો અભ્યાસ ચાલુ હોવો જરૂરી છે." },
      {
        text: "ગ્રુપ D 1+1: માત્ર સિંધુ દર્શન યાત્રા માટે, લકી ડ્રોમાં પસંદ થયેલ રજિસ્ટર્ડ વ્યક્તિ પોતાની સાથે અન્ય 1 વ્યક્તિને (પતિ / પત્ની / મિત્ર (18+) / પોતાનું સંતાન) લઈ જઈ શકશે અને બંનેને કેમ્પ ફી પર 100% સ્કોલરશીપ મળશે.",
      },
      { text: "સ્કોલરશીપ બીજી વ્યક્તિને આપી શકાશે નહીં અને રોકડમાં મળશે નહીં." },
      { text: "* ટ્રસ્ટના નિયમો મુજબ." },
    ],
  },
  {
    title: "4. કેમ્પ પાથ",
    blocks: [
      {
        list: [
          "ગ્રુપ 0, A, B: રાઉન્ડ 4 (ઓગસ્ટ 2027, સંભવિત): પ્રી બેઝિક એન્વાયરમેન્ટ કેમ્પ, ગુજરાત · રાઉન્ડ 5: મરીન ઇન્ટ્રો કેમ્પ, ગુજરાત (2027-28) · ડેઝર્ટ ઇન્ટ્રો કેમ્પ, ગુજરાત (2028-29) · Astro Adventure Trekking Camp, મનાલી (2029-30, રાઉન્ડ 5 માં પસંદ થયેલ માટે).",
          "ગ્રુપ C: રાઉન્ડ 4 અને 5: મરીન ઇન્ટ્રો કેમ્પ, ગુજરાત 2027 · પછી Astro Adventure Trekking Camp, મનાલી 2027 (રાઉન્ડ 5 માં પસંદ થયેલ માટે) · સિંધુ દર્શન લકી ડ્રો (રાઉન્ડ 4 માં).",
          "ગ્રુપ D, E: સરકારી દસ્તાવેજોની ચકાસણી કર્યા બાદ ઓનલાઇન લાઇવ લકી ડ્રો થશે. તેમાં પસંદ થયેલા માત્ર રજિસ્ટર્ડ ઉમેદવારોને જ સીધો રાઉન્ડ 4 (Marine Camp) માં પ્રવેશ આપવામાં આવશે. ત્યાં રૂબરૂ લાઇવ બે લકી ડ્રો દ્વારા પસંદગી થશે: 1. Astro Adventure Trekking Camp, મનાલી 2027 અને 2. સિંધુ દર્શન યાત્રા 2027. ગ્રુપ D માટે માત્ર સિંધુ દર્શન લેહ-લદાખ યાત્રામાં 1+1*, એટલે કે બંને વ્યક્તિને 100% સ્કોલરશીપ મળશે.",
        ],
      },
      { text: "* 1 રજિસ્ટર્ડ વ્યક્તિ પોતાની સાથે અન્ય 1 વ્યક્તિને (પતિ / પત્ની / મિત્ર (18+) / પોતાનું સંતાન) લાવી શકશે." },
    ],
  },
  {
    title: "5. ક્વિઝ",
    blocks: [
      {
        list: [
          "ક્વિઝના કુલ 5 રાઉન્ડ રહેશે: 3 ઓનલાઇન અને 2 ઓફલાઇન (કેમ્પમાં).",
          "રાઉન્ડ 1 થી 3 માં 100 બહુવિકલ્પીય પ્રશ્નો હશે: 100 માર્ક્સ, 60 મિનિટ. આ ક્વિઝ ઘરેથી મોબાઇલ કે કમ્પ્યુટર પર આપી શકાશે.",
          "ક્વિઝની ભાષા ગુજરાતી અથવા અંગ્રેજી રહેશે.",
          "ક્વિઝમાં ગણિત, વિજ્ઞાન, સામાજિક વિજ્ઞાન, સામાન્ય જ્ઞાન, તાર્કિક પ્રશ્નો અને પર્યાવરણ શિક્ષણના પ્રશ્નો હશે.",
          "ધો. 10, ધો. 12 અને કોલેજના વિદ્યાર્થીઓ ફોર્મમાં ઓનલાઇન ક્વિઝ માટે તારીખ અને સમય પસંદ કરી શકશે.",
          "ક્વિઝની લિંક અને સમય ફોર્મમાં આપેલા WhatsApp નંબર પર મોકલવામાં આવશે.",
          "દરેક રાઉન્ડનું પરિણામ www.cnacamp.com ના નોટિસ બોર્ડ પર મૂકવામાં આવશે.",
        ],
      },
    ],
  },
  {
    title: "6. પસંદગી",
    blocks: [
      {
        list: [
          "પસંદગી માત્ર ક્વિઝના માર્ક્સ પર નહીં થાય. ટ્રસ્ટ સહ-અભ્યાસિક પ્રવૃત્તિઓ, સ્પર્ધાઓ (NMMS, ગણિત-વિજ્ઞાન મેળો, જ્ઞાન સાધના, રમતગમત), મેડિકલ ફિટનેસ અને શિક્ષકોનો અભિપ્રાય પણ જોશે.",
          "ટ્રસ્ટ દ્વારા તૈયાર કરાયેલ અંતિમ મેરિટ લિસ્ટ જ માન્ય રહેશે.",
        ],
      },
    ],
  },
  {
    title: "7. રજિસ્ટ્રેશન કેવી રીતે કરવું",
    blocks: [
      {
        list: [
          "ક્વિઝ, સ્કોલરશીપ અને એડવેન્ચર કેમ્પ સંબંધિત બધા નિયમો અને શરતો www.cnacamp.com/olympiad પર ધ્યાનથી વાંચો.",
          "આપનું ગ્રુપ પસંદ કરો અને ફોર્મ ભરો.",
          "ફી માત્ર ઓનલાઇન જ સ્વીકારવામાં આવશે. રજિસ્ટ્રેશન પ્રક્રિયા પૂર્ણ કર્યા બાદ ફી માત્ર Razorpay દ્વારા સીધી ટ્રસ્ટના ખાતામાં જમા થશે. રોકડ કે અન્ય કોઈ રીતે ભરેલી ફી સ્વીકારવામાં આવશે નહીં.",
          'છેતરપિંડીથી સાવધાન: અમારા ટ્રસ્ટનું નામ "સૌરાષ્ટ્ર એજ્યુકેશન એન્ડ ચેરીટેબલ ટ્રસ્ટ, રાજકોટ" છે. આ નામને મળતા આવતા અન્ય કોઈ ટ્રસ્ટ, સંસ્થા કે વ્યક્તિને પેમેન્ટ કરશો તો તેની જવાબદારી અમારી સંસ્થાની રહેશે નહીં.',
          "રજિસ્ટ્રેશન નંબર અને આગળની બધી માહિતી (ક્વિઝની લિંક, સમય, પરિણામ વગેરે) માત્ર WhatsApp દ્વારા જ મોકલવામાં આવશે. તેથી ફોર્મમાં ચાલુ WhatsApp નંબર જ લખો.",
          "18 વર્ષથી નાના વિદ્યાર્થીઓ માટે ફોર્મમાં માતા-પિતા / વાલીની વિગત અને સંમતિ જરૂરી છે.",
          "ગ્રુપ D અને E ના સભ્યોએ સરકારી ઓળખપત્ર અપલોડ કરવાનું રહેશે. રાઉન્ડ 4 માટે પસંદગી ઓનલાઇન લાઇવ લકી ડ્રો દ્વારા થશે.",
          "શાળા કે રેફરલ કોડ હોય તો લખો (ફરજિયાત નથી).",
        ],
      },
    ],
  },
  {
    title: "8. પસંદગી પછી જરૂરી દસ્તાવેજ",
    blocks: [
      { text: "દસ્તાવેજ સ્કેન કરીને વેબસાઇટ પર આપેલી લિંક પર નિયત સમયમાં અપલોડ કરો." },
      {
        list: [
          "મેડિકલ ફિટનેસ પ્રમાણપત્ર (રજિસ્ટર્ડ ડૉક્ટરનું, મેરિટ લિસ્ટ પછી 10 દિવસમાં): બધા માટે.",
          "જોખમ સ્વીકૃતિ ફોર્મ: બધા માટે (18 વર્ષથી નાના માટે વાલીની સહી).",
          "માતા-પિતા પરવાનગી પત્ર: 18 વર્ષથી નાના (ગ્રુપ 0, A, B).",
          "સરકારી શાળાનો પુરાવો (શાળાનું ID કાર્ડ અથવા બોનાફાઇડ સર્ટિફિકેટ): ગ્રુપ 0, B (સરકારી ફી).",
          "સરકારી ઓળખપત્ર: ગ્રુપ D, E.",
        ],
      },
      { text: "જો દસ્તાવેજ સમયસર જમા ન થાય અથવા સરકારી મેડિકલ ઓફિસર અનફિટ જાહેર કરે, તો પસંદગી રદ થશે." },
    ],
  },
  {
    title: "9. કેમ્પમાં",
    blocks: [
      {
        list: [
          "પ્રવૃત્તિઓ (કેમ્પ મુજબ): ટ્રેકિંગ, હાઇકિંગ, રોક ક્લાઇમ્બિંગ, રોપ એક્ટિવિટી, રિવર રાફ્ટિંગ, સ્નો ટ્રેકિંગ, આકાશ દર્શન અને STEM પ્રવૃત્તિઓ, યોગ અને ધ્યાન, નિષ્ણાતોના વક્તવ્ય.",
          "બધી પ્રવૃત્તિઓ તાલીમ પામેલા ઇન્સ્ટ્રક્ટર સાથે અને સુરક્ષા નિયમો મુજબ થશે.",
          "રહેવાનું: ટેન્ટ, હોસ્ટેલ કે હોટેલમાં શેરિંગ ધોરણે વ્યવસ્થા રહેશે.",
          "ભોજન: શુદ્ધ શાકાહારી નાસ્તો, બપોરનું અને રાતનું ભોજન મળશે. જૈન કે મેડિકલ ભોજન જોઈએ તો પહેલેથી જણાવો. મુસાફરીમાં ભોજન નહીં મળે, સૂકો નાસ્તો સાથે રાખો.",
          "મુસાફરી: Transportation અને મુસાફરીનું ભોજન સ્કોલરશીપમાં સામેલ નથી (માત્ર ગ્રુપ 0 ને Transportation મળશે). પિક-અપ, ડ્રોપ અને મુસાફરીની વિગત કેમ્પ પહેલાં WhatsApp દ્વારા મોકલવામાં આવશે.",
          "કોઈ બીમારી, એલર્જી કે ચાલુ દવા હોય તો કેમ્પ પહેલાં અવશ્ય જણાવો.",
        ],
      },
    ],
  },
  {
    title: "10. સામાન્ય નિયમો",
    blocks: [
      {
        list: [
          "કેમ્પમાં ભાગ લેવો સ્વૈચ્છિક છે. સાહસિક પ્રવૃત્તિઓમાં કુદરતી જોખમ રહેલું છે.",
          "ખોટી માહિતી કે ખોટા દસ્તાવેજ આપનાર તરત ગેરલાયક ઠરશે.",
          "ગેરવર્તન, દારૂ, તમાકુ કે નશીલા પદાર્થોનું સેવન અથવા કેમ્પના નિયમોનો ભંગ કરનાર સભ્યને ઘરે પરત મોકલવામાં આવશે. તેનો ખર્ચ સભ્ય કે વાલીએ ભોગવવાનો રહેશે.",
          "હવામાન, સુરક્ષા કે સરકારી સૂચના મુજબ ટ્રસ્ટ તારીખ, સ્થળ, કાર્યક્રમ કે નિયમ બદલી શકે અથવા કેમ્પ રદ કરી શકે છે. તેની જાણ વેબસાઇટ પર કરવામાં આવશે.",
          "ઈજા, બીમારી, અકસ્માત કે કુદરતી આફત જેવી સ્થિતિમાં, કાયદા દ્વારા માન્ય હદ સુધી, ટ્રસ્ટ, ક્લબ, ઇન્સ્ટ્રક્ટર કે સ્વયંસેવકો જવાબદાર રહેશે નહીં (જોખમ સ્વીકૃતિ ફોર્મ મુજબ). કટોકટીમાં આયોજકો તરત નિર્ણય લઈ શકશે.",
          "આપની અંગત અને મેડિકલ માહિતી માત્ર ઓલમ્પિયાડ અને કેમ્પ માટે જ ઉપયોગમાં લેવાશે, સુરક્ષિત રાખવામાં આવશે અને કોઈને વેચવામાં કે આપવામાં આવશે નહીં (DPDP Act 2023).",
          "કોઈ પણ વિવાદ માટે ન્યાયક્ષેત્ર માત્ર રાજકોટ રહેશે.",
          "નિયમો, પસંદગી અને બધા નિર્ણયો અંગે ટ્રસ્ટનો નિર્ણય અંતિમ અને બંધનકર્તા રહેશે.",
        ],
      },
    ],
  },
];

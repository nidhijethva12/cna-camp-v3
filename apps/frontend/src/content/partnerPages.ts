import type { OlympiadLang } from "@/components/olympiad/LanguageSwitch";

/** Words on the School Partner and Ambassador sign-up pages, in English and Gujarati. */

export type PartnerKind = "school" | "ambassador";

export const partnerPath: Record<OlympiadLang, Record<PartnerKind, string>> = {
  en: { school: "/olympiad/schools", ambassador: "/olympiad/ambassador" },
  gu: { school: "/olympiad/gu/schools", ambassador: "/olympiad/gu/ambassador" },
};

export const dashboardPath: Record<PartnerKind, string> = { school: "/school-dashboard", ambassador: "/ambassador-dashboard" };

const en = {
  crumb: "Adventure Olympiad 2.0",
  howItWorks: "How it works",
  afterApproval: "After approval",
  exampleData: "Example data",
  alreadyPartner: "Already approved?",
  logIn: "Log in to your dashboard",
  required: "required",
  school: {
    meta: {
      title: "Register your school · Adventure Olympiad 2.0",
      description:
        "Sign up your school as an Adventure Olympiad 2.0 School Partner: one coordinator, one dashboard and one payment for all your students.",
    },
    eyebrow: "School Partner",
    title: "Register your whole school",
    lead: "One coordinator, one dashboard and one payment for all your students. Government schools get the lower fee automatically.",
    stepsTitle: "Four steps for the school",
    steps: [
      ["Sign up the school", "Fill the form with the UDISE code. CNA checks and approves it within 2 working days."],
      ["Add students", "Upload our Excel template, or share one class link so parents fill their child's details."],
      ["Pay", "Pay once for all selected students, or let each parent pay through the class link."],
      [
        "Parents finish the form",
        "Each parent adds the photo and Aadhaar and gives consent. Each student gets their own registration number.",
      ],
    ],
    formTitle: "School sign-up",
    formLead: "Takes about 3 minutes.",
    fields: {
      name: "School or college name",
      udise: "UDISE code",
      type: "Type",
      district: "District",
      principal: "Principal's name",
      coordinatorName: "Coordinator teacher",
      coordinatorWhatsapp: "Coordinator WhatsApp",
      email: "School email",
    },
    placeholders: {
      name: "e.g. Shree Example Primary School",
      udise: "11 digits",
      principal: "Full name",
      coordinatorName: "Full name",
      coordinatorWhatsapp: "10 digit number",
      email: "school@example.com",
    },
    emailHint: "The coordinator logs in to the dashboard with this email.",
    consent: "I confirm the school will collect consent from each parent, as per the Olympiad rules.",
    submit: "Send for approval",
    dashboardTitle: "The school dashboard",
    dashboardLead: "What the coordinator sees after logging in.",
  },
  ambassador: {
    meta: {
      title: "Become an Olympiad Ambassador · Adventure Olympiad 2.0",
      description: "Share your own code with students, parents and friends, see how many join through you, and get recognised by CNA.",
    },
    eyebrow: "Olympiad Ambassador",
    title: "Become an Olympiad Ambassador",
    lead: "Share your own code with students, parents and friends. See how many join through you, and get recognised by CNA.",
    stepsTitle: "Share, count, get recognised",
    steps: [
      ["Sign up", "Teachers, NGO workers, coaches, past campers and parents can join. It is free."],
      ["Get your code", "After approval you get a code, a link and a QR code to share on WhatsApp or print."],
      ["Track your count", "Every paid registration with your code shows on your dashboard."],
      ["Get recognised", "Certificate, a place on our Ambassadors list and more at each milestone."],
    ],
    formTitle: "Ambassador sign-up",
    formLead: "Takes about 2 minutes.",
    fields: { name: "Full name", whatsapp: "WhatsApp number", city: "City", role: "You are a", email: "Email" },
    placeholders: { name: "Full name", whatsapp: "10 digit number", city: "e.g. Rajkot", email: "name@example.com" },
    emailHint: "You log in to your dashboard with this email.",
    consent: "I will share correct information about the Olympiad and follow its rules.",
    submit: "Join as Ambassador",
    dashboardTitle: "The Ambassador dashboard",
    dashboardLead: "What an Ambassador sees after logging in.",
  },
  choose: "Choose",
  sending: "Sending…",
  done: {
    waitingTitle: (name: string) => `Thank you, ${name}!`,
    waitingText:
      "Your sign-up is with the CNA team. Once it is approved (usually within 2 working days), you get an email from info@cnacamp.com with your code and a link to choose your dashboard password.",
    approvedTitle: (name: string) => `${name}, you are already approved`,
    approvedText:
      'Log in to your dashboard with your email. If you don\'t have a password yet, use "Forgot your password?" on the login page.',
  },
  errors: {
    check: "Please check the highlighted fields.",
    name: "Please enter the name.",
    udise: "Enter the 11 digit UDISE code.",
    type: "Choose the type.",
    district: "Choose the district.",
    principal: "Enter the principal's name.",
    coordinatorName: "Enter the coordinator's name.",
    coordinatorWhatsapp: "Enter a 10 digit mobile number.",
    whatsapp: "Enter a 10 digit mobile number.",
    city: "Enter your city or village.",
    role: "Choose one.",
    email: "Enter an email like name@example.com.",
    emailTaken: "This email is already used by another partner. Use a different one.",
    consent: "Please tick to confirm.",
  },
  sample: {
    school: {
      name: "Shree Example Primary School",
      line: "School code SCH-RJK-012 · Government school · Rajkot",
      pay: "Pay for 14 pending students",
    },
    schoolStats: [
      ["Students added", "48"],
      ["Paid", "34"],
      ["Payment pending", "14"],
      ["Parent consent pending", "6"],
    ],
    schoolActions: ["Upload Excel", "Download template"],
    columns: ["Student", "Class", "Group", "Fee", "Payment", "Parent consent"],
    rows: [
      ["Student 1", "Std 8", "A", "Paid", "Done"],
      ["Student 2", "Std 9", "A", "Paid", "Waiting"],
      ["Student 3", "Std 10", "B", "Pending", "Done"],
    ],
    paid: "Paid",
    pending: "Pending",
    doneWord: "Done",
    schoolNote: "The group and fee are set from the class automatically. Each paid student gets a registration number.",
    amb: {
      name: "Example name",
      line: "Teacher · Rajkot · Ambassador since 16 Nov 2026",
      codeLabel: "Your Ambassador code",
      code: "CNA-AMB-0142",
      qr: "QR code to download",
    },
    ambStats: [
      ["Link opened", "212"],
      ["Registered", "41"],
      ["Paid", "36"],
      ["To next milestone", "14"],
    ],
    progress: "36 of 50 paid registrations to reach the next milestone",
    milestones: [
      ["25 · Reached", "Olympiad Ambassador certificate"],
      ["50", "Name on the website Ambassadors list"],
      ["100", "A free seat or escort seat on a camp (to be confirmed)"],
    ],
    ambNote:
      "Only paid registrations count. You see counts only, not other people's personal details. Milestone rewards are decided by CNA.",
  },
};

export type PartnerPageText = typeof en;

const gu: PartnerPageText = {
  crumb: "એડવેન્ચર ઓલમ્પિયાડ 2.0",
  howItWorks: "કેવી રીતે કામ કરે છે",
  afterApproval: "Approval પછી",
  exampleData: "ઉદાહરણ",
  alreadyPartner: "Approval મળી ગયું છે?",
  logIn: "Dashboard માં login કરો",
  required: "જરૂરી",
  school: {
    meta: {
      title: "School registration · એડવેન્ચર ઓલમ્પિયાડ 2.0",
      description:
        "તમારી school ને Adventure Olympiad 2.0 School Partner બનાવો: બધા students માટે એક coordinator, એક dashboard ને એક payment.",
    },
    eyebrow: "School Partner",
    title: "આખી school નું registration કરો",
    lead: "બધા students માટે એક coordinator, એક dashboard ને એક payment. Government school ને ઓછી fee આપોઆપ લાગે છે.",
    stepsTitle: "School માટે ચાર steps",
    steps: [
      ["School નું sign-up", "UDISE code સાથે form ભરો. CNA 2 working days માં check કરીને approve કરશે."],
      ["Students ઉમેરો", "અમારું Excel template upload કરો, અથવા class link share કરો જેથી parents બાળકની details ભરે."],
      ["Payment", "બધા students માટે એકસાથે payment કરો, અથવા દરેક parent class link થી payment કરે."],
      ["Parents form પૂરું કરે", "દરેક parent photo ને Aadhaar ઉમેરે ને મંજૂરી આપે. દરેક student ને પોતાનો registration number મળે."],
    ],
    formTitle: "School sign-up",
    formLead: "આશરે 3 મિનિટ લાગશે.",
    fields: {
      name: "School કે college નું નામ",
      udise: "UDISE code",
      type: "પ્રકાર",
      district: "District",
      principal: "Principal નું નામ",
      coordinatorName: "Coordinator teacher",
      coordinatorWhatsapp: "Coordinator નો WhatsApp",
      email: "School નો email",
    },
    placeholders: {
      name: "દા.ત. શ્રી ઉદાહરણ પ્રાથમિક શાળા",
      udise: "11 digit",
      principal: "પૂરું નામ",
      coordinatorName: "પૂરું નામ",
      coordinatorWhatsapp: "10 digit number",
      email: "school@example.com",
    },
    emailHint: "Coordinator આ email થી dashboard માં login કરશે.",
    consent: "Olympiad ના rules મુજબ school દરેક parent ની મંજૂરી લેશે, એની હું ખાતરી આપું છું.",
    submit: "Approval માટે મોકલો",
    dashboardTitle: "School dashboard",
    dashboardLead: "Login કર્યા પછી coordinator ને આ દેખાશે.",
  },
  ambassador: {
    meta: {
      title: "Olympiad Ambassador બનો · એડવેન્ચર ઓલમ્પિયાડ 2.0",
      description: "તમારો code students, parents ને મિત્રો સાથે share કરો, તમારા થકી કેટલા જોડાયા એ જુઓ ને CNA તરફથી ઓળખ મેળવો.",
    },
    eyebrow: "Olympiad Ambassador",
    title: "Olympiad Ambassador બનો",
    lead: "તમારો code students, parents ને મિત્રો સાથે share કરો. તમારા થકી કેટલા જોડાયા એ જુઓ ને CNA તરફથી ઓળખ મેળવો.",
    stepsTitle: "Share કરો, ગણતરી જુઓ, ઓળખ મેળવો",
    steps: [
      ["Sign-up", "Teachers, NGO workers, coaches, જૂના campers ને parents જોડાઈ શકે. Free છે."],
      ["તમારો code", "Approval પછી તમને code, link ને QR code મળશે, WhatsApp પર share કરવા કે print કરવા."],
      ["ગણતરી જુઓ", "તમારા code સાથેનું દરેક paid registration dashboard પર દેખાશે."],
      ["ઓળખ મેળવો", "દરેક milestone પર certificate, Ambassadors list માં નામ ને વધુ."],
    ],
    formTitle: "Ambassador sign-up",
    formLead: "આશરે 2 મિનિટ લાગશે.",
    fields: { name: "પૂરું નામ", whatsapp: "WhatsApp number", city: "શહેર / ગામ", role: "તમે કોણ છો", email: "Email" },
    placeholders: { name: "પૂરું નામ", whatsapp: "10 digit number", city: "દા.ત. Rajkot", email: "name@example.com" },
    emailHint: "તમે આ email થી dashboard માં login કરશો.",
    consent: "હું Olympiad વિશે સાચી માહિતી share કરીશ ને એના rules પાળીશ.",
    submit: "Ambassador તરીકે જોડાઓ",
    dashboardTitle: "Ambassador dashboard",
    dashboardLead: "Login કર્યા પછી Ambassador ને આ દેખાશે.",
  },
  choose: "Select કરો",
  sending: "મોકલાય છે…",
  done: {
    waitingTitle: (name) => `આભાર, ${name}!`,
    waitingText:
      "તમારું sign-up CNA team પાસે પહોંચી ગયું છે. Approve થાય (સામાન્ય રીતે 2 working days માં) એટલે info@cnacamp.com પરથી email આવશે, જેમાં તમારો code ને dashboard password રાખવાની link હશે.",
    approvedTitle: (name) => `${name}, તમને approval મળી ગયું છે`,
    approvedText: 'તમારા email થી dashboard માં login કરો. Password ન હોય તો login page પર "Forgot your password?" વાપરો.',
  },
  errors: {
    check: "Highlight કરેલી details ફરી check કરો.",
    name: "નામ લખો.",
    udise: "11 digit નો UDISE code લખો.",
    type: "પ્રકાર select કરો.",
    district: "District select કરો.",
    principal: "Principal નું નામ લખો.",
    coordinatorName: "Coordinator નું નામ લખો.",
    coordinatorWhatsapp: "10 digit નો mobile number લખો.",
    whatsapp: "10 digit નો mobile number લખો.",
    city: "શહેર કે ગામ લખો.",
    role: "એક select કરો.",
    email: "સાચું email લખો.",
    emailTaken: "આ email બીજા partner માટે વપરાયો છે. બીજો email વાપરો.",
    consent: "આગળ વધવા માટે tick કરો.",
  },
  sample: {
    school: {
      name: "શ્રી ઉદાહરણ પ્રાથમિક શાળા",
      line: "School code SCH-RJK-012 · Government school · Rajkot",
      pay: "14 pending students નું payment કરો",
    },
    schoolStats: [
      ["ઉમેરેલા students", "48"],
      ["Paid", "34"],
      ["Payment બાકી", "14"],
      ["Parent ની મંજૂરી બાકી", "6"],
    ],
    schoolActions: ["Excel upload કરો", "Template download કરો"],
    columns: ["Student", "Class", "Group", "Fee", "Payment", "Parent ની મંજૂરી"],
    rows: [
      ["Student 1", "Std 8", "A", "Paid", "Done"],
      ["Student 2", "Std 9", "A", "Paid", "Waiting"],
      ["Student 3", "Std 10", "B", "Pending", "Done"],
    ],
    paid: "Paid",
    pending: "બાકી",
    doneWord: "થઈ ગયું",
    schoolNote: "Group ને fee class પરથી આપોઆપ નક્કી થાય છે. Payment થયેલા દરેક student ને registration number મળે છે.",
    amb: {
      name: "ઉદાહરણ નામ",
      line: "Teacher · Rajkot · 16 Nov 2026 થી Ambassador",
      codeLabel: "તમારો Ambassador code",
      code: "CNA-AMB-0142",
      qr: "QR code download કરો",
    },
    ambStats: [
      ["Link ખોલી", "212"],
      ["Registered", "41"],
      ["Paid", "36"],
      ["આગળના milestone સુધી", "14"],
    ],
    progress: "આગળના milestone માટે 50 માંથી 36 paid registrations",
    milestones: [
      ["25 · પહોંચ્યા", "Olympiad Ambassador certificate"],
      ["50", "Website ના Ambassadors list માં નામ"],
      ["100", "Camp માં free seat કે escort seat (નક્કી થશે)"],
    ],
    ambNote: "ફક્ત paid registrations ગણાય છે. તમને ફક્ત ગણતરી દેખાય, બીજાની personal details નહીં. Milestone rewards CNA નક્કી કરે છે.",
  },
};

export const partnerPageText: Record<OlympiadLang, PartnerPageText> = { en, gu };

/** Option labels: stored values stay English, labels follow the page language. */
export const institutionTypeLabels: Record<OlympiadLang, Record<string, string>> = {
  en: { government: "Government", "grant-in-aid": "Grant-in-aid", private: "Private", college: "College" },
  gu: { government: "Government (સરકારી)", "grant-in-aid": "Grant-in-aid (અનુદાનિત)", private: "Private (ખાનગી)", college: "College" },
};

export const ambassadorRoleLabels: Record<OlympiadLang, Record<string, string>> = {
  en: { teacher: "Teacher", ngo: "NGO or club member", coach: "Coach", "past-camper": "Past CNA camper", parent: "Parent", other: "Other" },
  gu: {
    teacher: "Teacher",
    ngo: "NGO કે club member",
    coach: "Coach",
    "past-camper": "CNA ના જૂના camper",
    parent: "Parent",
    other: "બીજું",
  },
};

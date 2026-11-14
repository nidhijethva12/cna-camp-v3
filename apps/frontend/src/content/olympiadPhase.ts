import type { OlympiadLang } from "@/components/olympiad/LanguageSwitch";

/**
 * Words on the Olympiad page that change with the registration state: before it opens visitors ask
 * for a WhatsApp reminder, while it is open they register, and after it closes they follow the
 * notice board. Dates come from Olympiad → Settings.
 */

export type OlympiadPhase = "contact" | "soon" | "open" | "closed";

const en = {
  bar: {
    open: (closes: string) => ({ lead: `Registration is open till ${closes}.`, rest: "All details are below." }),
    closed: { lead: "Registration is closed.", rest: "Quiz links and results are on the notice board." },
  },
  status: {
    open: (closes: string) => `Registration open till ${closes}`,
    closed: "Registration closed",
  },
  remindMe: "Remind me on WhatsApp",
  remindShort: "Remind me",
  registerNow: "Register now",
  findGroup: "Find your group",
  noticeBoard: "Open the notice board",
  navRegister: "Register",
  pinned: {
    tag: "Pinned",
    title: "Registration is open for all six groups",
    when: (opens: string, closes: string) => `${opens} to ${closes}, 11:59 PM`,
    link: "Register",
  },
  register: {
    soon: { eyebrow: "Registration", text: "Leave your name and WhatsApp number. We will message you the day registration opens." },
    open: {
      eyebrow: "Registration",
      title: (closes: string) => `Registration is open till ${closes}`,
      text: "It takes a few minutes. Keep these ready before you start.",
    },
    closed: {
      eyebrow: "Registration",
      title: "Registration is closed",
      text: "Quiz links and results come on WhatsApp and the notice board.",
    },
  },
  sticky: {
    soon: (opens: string) => ({ title: `Registration opens ${opens}`, text: "Get a WhatsApp reminder" }),
    open: (closes: string) => ({ title: "Registration open", text: `Last date ${closes}, 11:59 PM` }),
  },
  dashboards: { school: "School login", ambassador: "Ambassador login" },
  remind: {
    title: "Get a reminder on WhatsApp",
    sub: (opens: string) => `We will message you the day registration opens, ${opens}.`,
    close: "Close",
    name: "Full name",
    namePlaceholder: "e.g. Riya Patel",
    whatsapp: "WhatsApp number",
    whatsappPlaceholder: "10 digit number",
    email: "Email ID",
    who: "Who is it for?",
    optional: "(optional)",
    choose: "Choose",
    submit: "Notify me",
    saving: "Saving…",
    privacy: "We use your details only for Olympiad updates.",
    thanks: (name: string) => `Thank you, ${name}!`,
    already: (name: string) => `You are already on the list, ${name}`,
    notify: (wa: string) => `We will notify you on WhatsApp at ${wa}.`,
    waNote: (opens: string) => `WhatsApp message on ${opens}, when registration opens`,
    emailNote: (email: string) => `A "stay tuned" email is on its way to ${email}`,
    done: "Done",
    errors: {
      check: "Please check the highlighted fields.",
      name: "Please enter your name.",
      whatsapp: "Enter a 10 digit WhatsApp number.",
      email: "Enter an email like name@example.com.",
      interest: "Please choose one.",
      consent: "Please tick to agree.",
    },
  },
};

export type OlympiadPhaseText = typeof en;

const guMonths: Record<string, string> = {
  Jan: "જાન્યુઆરી",
  Feb: "ફેબ્રુઆરી",
  Mar: "માર્ચ",
  Apr: "એપ્રિલ",
  May: "મે",
  Jun: "જૂન",
  Jul: "જુલાઈ",
  Aug: "ઓગસ્ટ",
  Sep: "સપ્ટેમ્બર",
  Oct: "ઑક્ટોબર",
  Nov: "નવેમ્બર",
  Dec: "ડિસેમ્બર",
};

/** "14 Dec 2026" with the month in Gujarati. */
const guDate = (date: string) =>
  date.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/, (m) => guMonths[m.slice(0, 3)]);

const gu: OlympiadPhaseText = {
  bar: {
    open: (closes) => ({ lead: `રજિસ્ટ્રેશન ${guDate(closes)} સુધી ચાલુ છે.`, rest: "બધી વિગતો નીચે આપેલ છે." }),
    closed: { lead: "Registration બંધ થઈ ગયું છે.", rest: "Quiz ની link ને result notice board પર છે." },
  },
  status: {
    open: (closes) => `રજિસ્ટ્રેશન ${guDate(closes)} સુધી ચાલુ`,
    closed: "Registration બંધ",
  },
  remindMe: "WhatsApp પર યાદ અપાવો",
  remindShort: "યાદ અપાવો",
  registerNow: "હમણાં રજિસ્ટર કરો",
  findGroup: "તમારું Group શોધો",
  noticeBoard: "Notice board ખોલો",
  navRegister: "Register",
  pinned: {
    tag: "Pinned",
    title: "છએ છ ગ્રુપ માટે રજિસ્ટ્રેશન ચાલુ છે",
    when: (opens, closes) => `${guDate(opens)} થી ${guDate(closes)}, રાત્રે 11:59`,
    link: "Register",
  },
  register: {
    soon: { eyebrow: "Registration", text: "તમારું નામ ને WhatsApp number આપો. Registration શરૂ થશે એ દિવસે અમે message કરીશું." },
    open: {
      eyebrow: "રજિસ્ટ્રેશન",
      title: (closes) => `રજિસ્ટ્રેશન ${guDate(closes)} સુધી ચાલુ છે`,
      text: "થોડી જ મિનિટ લાગશે. શરૂ કરતાં પહેલાં આ વિગતો તૈયાર રાખો.",
    },
    closed: {
      eyebrow: "Registration",
      title: "Registration બંધ થઈ ગયું છે",
      text: "Quiz ની link ને result WhatsApp ને notice board પર આવશે.",
    },
  },
  sticky: {
    soon: (opens) => ({ title: `Registration ${opens} એ શરૂ`, text: "WhatsApp પર યાદ અપાવીશું" }),
    open: (closes) => ({ title: "રજિસ્ટ્રેશન ચાલુ", text: `છેલ્લી તારીખ ${guDate(closes)}, રાત્રે 11:59` }),
  },
  dashboards: { school: "School login", ambassador: "Ambassador login" },
  remind: {
    title: "WhatsApp પર reminder મેળવો",
    sub: (opens) => `Registration ${opens} એ શરૂ થશે, એ દિવસે અમે message કરીશું.`,
    close: "બંધ કરો",
    name: "પૂરું નામ",
    namePlaceholder: "દા.ત. Riya Patel",
    whatsapp: "WhatsApp number",
    whatsappPlaceholder: "10 digit number",
    email: "Email ID",
    who: "કોના માટે?",
    optional: "(optional)",
    choose: "Select કરો",
    submit: "મને જણાવજો",
    saving: "Save થાય છે…",
    privacy: "તમારી details ફક્ત Olympiad ના updates માટે જ વપરાશે.",
    thanks: (name) => `આભાર, ${name}!`,
    already: (name) => `${name}, તમે પહેલેથી list માં છો`,
    notify: (wa) => `અમે ${wa} પર WhatsApp થી જણાવીશું.`,
    waNote: (opens) => `${opens} એ registration શરૂ થશે ત્યારે WhatsApp message`,
    emailNote: (email) => `${email} પર "stay tuned" email આવે છે`,
    done: "બરાબર",
    errors: {
      check: "Highlight કરેલી details ફરી check કરો.",
      name: "નામ લખો.",
      whatsapp: "10 digit નો WhatsApp number લખો.",
      email: "સાચું email લખો.",
      interest: "એક select કરો.",
      consent: "આગળ વધવા માટે tick કરો.",
    },
  },
};

export const olympiadPhaseText: Record<OlympiadLang, OlympiadPhaseText> = { en, gu };

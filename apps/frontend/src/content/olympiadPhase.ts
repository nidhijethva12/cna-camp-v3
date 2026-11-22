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
  Oct: "ઓક્ટોબર",
  Nov: "નવેમ્બર",
  Dec: "ડિસેમ્બર",
};

/** "31 Dec 2026" with the month in Gujarati. */
const guDate = (date: string) =>
  date.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/, (m) => guMonths[m.slice(0, 3)]);

const gu: OlympiadPhaseText = {
  bar: {
    open: (closes) => ({ lead: `રજિસ્ટ્રેશન ${guDate(closes)} સુધી ચાલુ છે.`, rest: "બધી વિગતો નીચે આપેલ છે." }),
    closed: { lead: "રજિસ્ટ્રેશન બંધ થઈ ગયું છે.", rest: "ક્વિઝની લિંક અને પરિણામ નોટિસ બોર્ડ પર છે." },
  },
  status: {
    open: (closes) => `રજિસ્ટ્રેશન ${guDate(closes)} સુધી ચાલુ`,
    closed: "રજિસ્ટ્રેશન બંધ",
  },
  remindMe: "વૉટ્સએપ પર યાદ અપાવો",
  remindShort: "યાદ અપાવો",
  registerNow: "હમણાં રજિસ્ટર કરો",
  findGroup: "તમારું ગ્રુપ શોધો",
  noticeBoard: "નોટિસ બોર્ડ ખોલો",
  navRegister: "રજિસ્ટ્રેશન",
  pinned: {
    tag: "મહત્ત્વનું",
    title: "છએ છ ગ્રુપ માટે રજિસ્ટ્રેશન ચાલુ છે",
    when: (opens, closes) => `${guDate(opens)} થી ${guDate(closes)}, રાત્રે 11:59`,
    link: "રજિસ્ટર કરો",
  },
  register: {
    soon: { eyebrow: "રજિસ્ટ્રેશન", text: "તમારું નામ અને વૉટ્સએપ નંબર આપો. રજિસ્ટ્રેશન શરૂ થશે તે દિવસે અમે મેસેજ કરીશું." },
    open: {
      eyebrow: "રજિસ્ટ્રેશન",
      title: (closes) => `રજિસ્ટ્રેશન ${guDate(closes)} સુધી ચાલુ છે`,
      text: "થોડી જ મિનિટ લાગશે. શરૂ કરતાં પહેલાં આ વિગતો તૈયાર રાખો.",
    },
    closed: {
      eyebrow: "રજિસ્ટ્રેશન",
      title: "રજિસ્ટ્રેશન બંધ થઈ ગયું છે",
      text: "ક્વિઝની લિંક અને પરિણામ વૉટ્સએપ અને નોટિસ બોર્ડ પર આવશે.",
    },
  },
  sticky: {
    soon: (opens) => ({ title: `રજિસ્ટ્રેશન ${guDate(opens)} એ શરૂ`, text: "વૉટ્સએપ પર યાદ અપાવીશું" }),
    open: (closes) => ({ title: "રજિસ્ટ્રેશન ચાલુ", text: `છેલ્લી તારીખ ${guDate(closes)}, રાત્રે 11:59` }),
  },
  dashboards: { school: "શાળા લૉગિન", ambassador: "એમ્બેસેડર લૉગિન" },
  remind: {
    title: "વૉટ્સએપ પર યાદ અપાવો",
    sub: (opens) => `રજિસ્ટ્રેશન ${guDate(opens)} એ શરૂ થશે, તે દિવસે અમે મેસેજ કરીશું.`,
    close: "બંધ કરો",
    name: "પૂરું નામ",
    namePlaceholder: "દા.ત. Riya Patel",
    whatsapp: "વૉટ્સએપ નંબર",
    whatsappPlaceholder: "10 આંકડાનો નંબર",
    email: "ઇમેઇલ",
    who: "કોના માટે?",
    optional: "(વૈકલ્પિક)",
    choose: "પસંદ કરો",
    submit: "મને જણાવજો",
    saving: "સેવ થાય છે…",
    privacy: "તમારી વિગતો ફક્ત ઓલમ્પિયાડની માહિતી મોકલવા માટે જ વપરાશે.",
    thanks: (name) => `આભાર, ${name}!`,
    already: (name) => `${name}, તમે પહેલેથી યાદીમાં છો`,
    notify: (wa) => `અમે ${wa} પર વૉટ્સએપથી જણાવીશું.`,
    waNote: (opens) => `${guDate(opens)} એ રજિસ્ટ્રેશન શરૂ થશે ત્યારે વૉટ્સએપ મેસેજ`,
    emailNote: (email) => `${email} પર પુષ્ટિનો ઇમેઇલ આવે છે`,
    done: "બરાબર",
    errors: {
      check: "લાલ રંગમાં દેખાતી વિગતો ફરી તપાસો.",
      name: "નામ લખો.",
      whatsapp: "10 આંકડાનો વૉટ્સએપ નંબર લખો.",
      email: "સાચો ઇમેઇલ લખો.",
      interest: "એક પસંદ કરો.",
      consent: "આગળ વધવા માટે ટિક કરો.",
    },
  },
};

export const olympiadPhaseText: Record<OlympiadLang, OlympiadPhaseText> = { en, gu };

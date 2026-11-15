import { registrationText, type RegLang } from "@/content/registration";
import {
  DISTRICTS,
  EMAIL,
  groupFor,
  isAadhaar,
  isBirthDate,
  isPlainText,
  isSchoolGroup,
  needsSchoolProof,
  picksQuizSlot,
  withSchool,
  PERSON_NAME,
  PIN_CODE,
  pinMatchesDistrict,
  takesQuiz,
  groupZeroSchool,
  type FormSchoolType,
  type GroupId,
  type GroupWarning,
  type Participant,
  type QuizSlot,
} from "./rules";

/** Everything the registration form collects except the uploaded files. Shared by the form and the server. */
export interface RegistrationInput {
  who: Participant | "";
  dob: string;
  schoolType: FormSchoolType | "";
  /** Under 16 at a Government or Granted school: did Std 6 to 8 fully in a government school (or is in Std 8 there). "yes" is Group 0. */
  govtStd6to8: "yes" | "no" | "";
  firstName: string;
  fatherName: string;
  surname: string;
  motherName: string;
  /** Students only: whether each parent is alive; neither means the student is an orphan. */
  fatherAlive: boolean;
  motherAlive: boolean;
  mobile: string;
  email: string;
  whatsappSame: boolean;
  whatsapp: string;
  address: string;
  district: string;
  pin: string;
  quizLanguage: "gu" | "en" | "";
  parentWho: "father" | "mother" | "other" | "";
  parentName: string;
  parentSameMobile: boolean;
  parentMobile: string;
  school: string;
  std: string;
  quizDate: string;
  quizTime: string;
  schoolId: string;
  contactRole: "Principal" | "Class teacher" | "";
  contactName: string;
  contactMobile: string;
  teacherStatus: "current" | "retired" | "";
  subject: string;
  work: string;
  achievements: string[];
  achievementOther: string;
  aadhaar: string;
  agree: boolean;
}

export type RegistrationField = keyof RegistrationInput | "photo" | "aadhaarCard" | "schoolIdCard" | "group";

/** Which uploads are present; the files themselves travel separately. */
export interface RegistrationFiles {
  photo: boolean;
  aadhaarCard: boolean;
  schoolIdCard: boolean;
}

export const emptyRegistration: RegistrationInput = {
  who: "",
  dob: "",
  schoolType: "",
  govtStd6to8: "",
  firstName: "",
  fatherName: "",
  surname: "",
  motherName: "",
  fatherAlive: true,
  motherAlive: true,
  mobile: "",
  email: "",
  whatsappSame: true,
  whatsapp: "",
  address: "",
  district: "",
  pin: "",
  quizLanguage: "",
  parentWho: "",
  parentName: "",
  parentSameMobile: true,
  parentMobile: "",
  school: "",
  std: "",
  quizDate: "",
  quizTime: "",
  schoolId: "",
  contactRole: "",
  contactName: "",
  contactMobile: "",
  teacherStatus: "",
  subject: "",
  work: "",
  achievements: [],
  achievementOther: "",
  aadhaar: "",
  agree: false,
};

export const ACHIEVEMENT_OTHER = "other";

/** What the form shows and asks, given the answers so far. */
export function shape(input: RegistrationInput) {
  const result = groupFor(input.who, input.dob);
  const ageGroup: GroupId | "" = result && "group" in result ? result.group : "";
  const student = input.who === "student";
  const minor = isSchoolGroup(ageGroup);
  const govt = minor && input.schoolType === "government";
  const asksStd6to8 = student && ageGroup === "A" && groupZeroSchool(input.schoolType);
  // Until the Std 6 to 8 question is answered, the group isn't known yet (0 or A).
  const waiting = asksStd6to8 && !input.govtStd6to8;
  const group = waiting ? "" : withSchool(ageGroup, asksStd6to8 && input.govtStd6to8 === "yes");
  return {
    group,
    warning: (result && "warning" in result ? result.warning : "") as GroupWarning | "",
    student,
    minor,
    asksStd6to8,
    waiting,
    teacher: input.who === "teacher",
    adult: input.who === "adult",
    quiz: takesQuiz(group),
    govt,
    /** A school ID card or bonafide certificate backs the free or lower fee. */
    proof: needsSchoolProof(group, govt),
    slot: student && picksQuizSlot(group, input.std),
  };
}

/** Gujarati digits (૦–૯) typed on a Gujarati keyboard become 0–9. */
export const toLatinDigits = (v: string) => v.replace(/[૦-૯]/g, (d) => String(d.charCodeAt(0) - 0x0ae6));

const MOBILE = /^[6-9]\d{9}$/;
const digits = (v: string) => toLatinDigits(v).replace(/\D/g, "");

export const STEP_COUNT = 5;

/** Problems on one step, as field → message in the form's language. An empty object means the step is complete. */
export function stepErrors(step: number, input: RegistrationInput, files: RegistrationFiles, lang: RegLang = "en", slots: QuizSlot[] = []) {
  const s = shape(input);
  const t = registrationText[lang].errors;
  const e: Partial<Record<RegistrationField, string>> = {};
  const text = (field: keyof RegistrationInput, message: string, max = 120, min = 1) => {
    const v = String(input[field] ?? "").trim();
    if (v.length < min || v.length > max) e[field] = message;
    else if (!isPlainText(v)) e[field] = t.plainText;
  };
  const name = (field: keyof RegistrationInput, message: string) => {
    const v = String(input[field] ?? "").trim();
    if (!v) e[field] = message;
    else if (v.length > 60 || !PERSON_NAME.test(v)) e[field] = t.lettersOnly;
  };
  const mobile = (field: keyof RegistrationInput) => {
    if (!MOBILE.test(digits(String(input[field] ?? "")))) e[field] = t.mobile;
  };

  if (step === 1) {
    if (!input.who) e.who = t.choose;
    if (!input.dob) e.dob = t.dob;
    else if (!isBirthDate(input.dob)) e.dob = t.dobInvalid;
    if (s.student && !input.schoolType) e.schoolType = t.choose;
    if (s.asksStd6to8 && !input.govtStd6to8) e.govtStd6to8 = t.choose;
    if (s.warning) e.group = registrationText[lang].group.warnings[s.warning];
    else if (input.who && input.dob && !s.group && !s.waiting) e.group = t.group;
  }

  if (step === 2) {
    name("firstName", t.firstName);
    name("fatherName", t.fatherName);
    name("surname", t.surname);
    name("motherName", t.motherName);
    mobile("mobile");
    if (!EMAIL.test(input.email.trim()) || input.email.length > 120) e.email = t.email;
    if (!input.whatsappSame) mobile("whatsapp");
    text("address", t.address, 200, 10);
    if (!DISTRICTS.some(([d]) => d === input.district)) e.district = t.district;
    if (!PIN_CODE.test(input.pin)) e.pin = t.pin;
    else if (input.district && !pinMatchesDistrict(input.pin, input.district)) e.pin = t.pinDistrict;
    if (s.quiz && !input.quizLanguage) e.quizLanguage = t.choose;
    if (s.minor) {
      // A parent who is not alive can't be the one filling in the form; an orphan's guardian is "someone else".
      const gone = (input.parentWho === "father" && !input.fatherAlive) || (input.parentWho === "mother" && !input.motherAlive);
      if (!input.parentWho || gone) e.parentWho = t.choose;
      name("parentName", t.parentName);
      if (!input.parentSameMobile) mobile("parentMobile");
    }
  }

  if (step === 3) {
    if (!s.adult) text("school", t.school, 150, 3);
    if (s.student) {
      text("std", t.select);
      if (s.slot && slots.length) {
        const day = slots.find((d) => d.date === input.quizDate);
        if (!day) e.quizDate = t.select;
        else if (!day.times.includes(input.quizTime)) e.quizTime = t.select;
      }
      if (!/^[A-Za-z0-9/ -]{0,40}$/.test(input.schoolId.trim())) e.schoolId = t.schoolId;
      if (s.proof && !files.schoolIdCard) e.schoolIdCard = t.schoolIdCard;
      if (!input.contactRole) e.contactRole = t.choose;
      name("contactName", t.name);
      mobile("contactMobile");
    }
    if (s.teacher && !input.teacherStatus) e.teacherStatus = t.choose;
    if (s.teacher && input.subject.trim()) text("subject", t.subject, 60);
    if (s.adult) text("work", t.select);
    if (input.achievements.includes(ACHIEVEMENT_OTHER)) text("achievementOther", t.achievementOther, 120);
  }

  if (step === 4) {
    if (!files.photo) e.photo = t.photo;
    const aadhaar = digits(input.aadhaar);
    if (aadhaar.length !== 12) e.aadhaar = t.aadhaar;
    else if (!isAadhaar(aadhaar)) e.aadhaar = t.aadhaarInvalid;
    if (!files.aadhaarCard) e.aadhaarCard = t.aadhaarCard;
  }

  if (step === 5 && !input.agree) e.agree = t.agree;

  return e;
}

/** The step that asks for each field, so an error from the server opens the right step. */
export const FIELD_STEP: Partial<Record<RegistrationField, number>> = {
  who: 1,
  dob: 1,
  schoolType: 1,
  govtStd6to8: 1,
  group: 1,
  firstName: 2,
  fatherName: 2,
  surname: 2,
  motherName: 2,
  mobile: 2,
  email: 2,
  whatsapp: 2,
  address: 2,
  district: 2,
  pin: 2,
  quizLanguage: 2,
  parentWho: 2,
  parentName: 2,
  parentMobile: 2,
  school: 3,
  std: 3,
  quizDate: 3,
  quizTime: 3,
  schoolId: 3,
  subject: 3,
  schoolIdCard: 3,
  contactRole: 3,
  contactName: 3,
  contactMobile: 3,
  teacherStatus: 3,
  work: 3,
  achievementOther: 3,
  photo: 4,
  aadhaar: 4,
  aadhaarCard: 4,
  agree: 5,
};

/** The first step with a problem, or 0 when every step is complete. */
export function firstIncompleteStep(input: RegistrationInput, files: RegistrationFiles, slots: QuizSlot[] = []) {
  for (let step = 1; step <= STEP_COUNT; step += 1) if (Object.keys(stepErrors(step, input, files, "en", slots)).length) return step;
  return 0;
}

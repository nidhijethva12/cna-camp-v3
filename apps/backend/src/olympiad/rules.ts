// Kept identical to apps/frontend/src/lib/olympiad/rules.ts: the forms and this API must agree.
/** Olympiad rules: groups, fees, districts, codes and validation. */

export const EDITION = '2.0';

/** Group 0: government school students aged 14 to 16 (free). Group A: the same age at any other school. */
export type GroupId = '0' | 'A' | 'B' | 'C' | 'D' | 'E';
export const GROUPS: GroupId[] = ['0', 'A', 'B', 'C', 'D', 'E'];

/** Who is registering; together with the age it decides the group. */
export const PARTICIPANTS = ['student', 'teacher', 'adult'] as const;
export type Participant = (typeof PARTICIPANTS)[number];

/** Age is counted on the day the form is filled; 13 years completed is the minimum. */
export const MIN_AGE = 13;

/** The Rules and Terms a registration agrees to; saved with every registration. */
export const RULES_VERSION = '14 Nov 2026';

/** Today's date in India, as a local date, so the age is the same on the phone and the server. */
export function istToday(now = new Date()) {
  const ist = new Date(now.getTime() + 330 * 60_000);
  return new Date(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
}

export type GroupResult = { group: GroupId } | { warning: string } | null;

/** The group follows from who is registering and their age today; nobody picks it by hand. */
export function groupFor(
  who: string,
  dob: string,
  today = istToday(),
): GroupResult {
  if (!PARTICIPANTS.includes(who as Participant)) return null;
  if (who === 'teacher') return { group: 'E' };
  if (!isBirthDate(dob, today)) return null;
  const age = ageOn(dob, today);
  if (who === 'adult')
    return age >= 18
      ? { group: 'D' }
      : { warning: '18 થી નાના હોય તો "Student" select કરો.' };
  if (age < MIN_AGE)
    return {
      warning: 'Age 13 વર્ષથી ઓછી છે, એટલે આ વખતે ભાગ નહીં લઈ શકાય.',
    };
  return { group: age < 16 ? 'A' : age < 18 ? 'B' : 'C' };
}

/** Groups A and B are school students: they have a government-school fee, a parent and a class teacher contact. */
export const isSchoolGroup = (group: string) =>
  group === '0' || group === 'A' || group === 'B';

/** The age rule gives "A" under 16; a student who did Std 6 to 8 fully in a government school (or is in Std 8 there) is Group 0. */
export const withSchool = (group: GroupId, govtStd6to8: boolean): GroupId =>
  group === 'A' && govtStd6to8 ? '0' : group;

/** Group 0 and Group B at the government fee upload a school ID card or bonafide certificate. */
export const needsSchoolProof = (group: string, government: boolean) =>
  group === '0' || (group === 'B' && government);

/** Std 10, Std 12 and Group C pick a quiz date and time from the slots set in the admin. */
export const picksQuizSlot = (group: string, std: string) =>
  group === 'C' || std === 'Std 10' || std === 'Std 12';

export type QuizSlot = { date: string; times: string[] };
/** Groups A, B and C take the online quiz; D and E enter at Round 4. */
export const takesQuiz = (group: string) =>
  group === '0' || group === 'A' || group === 'B' || group === 'C';

/** Class or year a student picks, per group. */
export const classesFor = (group: GroupId | '') =>
  group === 'C'
    ? [
        '12 pass',
        'College 1st year',
        'College 2nd year',
        'College 3rd year',
        'College 4th year',
        'Master / Higher studies',
      ]
    : ['Std 7', 'Std 8', 'Std 9', 'Std 10', 'Std 11', 'Std 12'];

export const ADULT_WORK = [
  'Government job',
  'Private job',
  'Business',
  'Homemaker',
  'Sports',
  'Nature / Environment work',
  'Other',
] as const;

export const AADHAAR = /^\d{12}$/;
export const PIN_CODE = /^[1-9]\d{5}$/;

/** The class or stage a participant picks; it decides the group, so nobody can pick the wrong one. */
export const STAGES = [
  { value: 'std8', label: 'Std 8', group: 'A' },
  { value: 'std9', label: 'Std 9', group: 'A' },
  { value: 'std10', label: 'Std 10', group: 'B' },
  { value: 'std11', label: 'Std 11', group: 'B' },
  {
    value: 'college',
    label: '12th pass, college or higher studies (18+)',
    group: 'C',
  },
  { value: 'adult', label: 'Adult above 25 (not a student)', group: 'D' },
] as const satisfies readonly {
  value: string;
  label: string;
  group: GroupId;
}[];

export type Stage = (typeof STAGES)[number]['value'];
export const stageOf = (value: string) => STAGES.find((s) => s.value === value);

export const SCHOOL_TYPES = [
  { value: 'government', label: 'Government' },
  { value: 'non-government', label: 'Non-government' },
  { value: 'semi-government', label: 'Semi-government' },
  { value: 'college', label: 'College' },
  { value: 'not-a-student', label: 'Not a student' },
] as const;
export type SchoolType = (typeof SCHOOL_TYPES)[number]['value'];

/** School types a student of each group can choose; C and D have one fixed type. */
export const schoolTypesFor = (group: GroupId): SchoolType[] =>
  group === 'C'
    ? ['college']
    : group === 'D'
      ? ['not-a-student']
      : ['government', 'non-government', 'semi-government'];

export type Fees = Record<GroupId, { govt: number; other: number }>;

export const DEFAULT_FEES: Fees = {
  '0': { govt: 0, other: 0 },
  A: { govt: 230, other: 230 },
  B: { govt: 156, other: 369 },
  C: { govt: 651, other: 651 },
  D: { govt: 1651, other: 1651 },
  E: { govt: 963, other: 963 },
};

/** Group B has a lower government-school fee; every other group has one fee (Group 0's is ₹0). */
export const feeFor = (fees: Fees, group: GroupId, government: boolean) =>
  group === 'B' && government ? fees.B.govt : fees[group].other;

export const QUIZ_LANGUAGES = [
  { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { value: 'en', label: 'English' },
] as const;

/** Gujarat districts with the 3-letter codes used in school codes (SCH-RJK-012). */
export const DISTRICTS = [
  ['Ahmedabad', 'AMD'],
  ['Amreli', 'AMR'],
  ['Anand', 'AND'],
  ['Aravalli', 'ARV'],
  ['Banaskantha', 'BNK'],
  ['Bharuch', 'BRC'],
  ['Bhavnagar', 'BVN'],
  ['Botad', 'BTD'],
  ['Chhota Udaipur', 'CUD'],
  ['Dahod', 'DHD'],
  ['Dang', 'DNG'],
  ['Devbhumi Dwarka', 'DBD'],
  ['Gandhinagar', 'GNR'],
  ['Gir Somnath', 'GSM'],
  ['Jamnagar', 'JAM'],
  ['Junagadh', 'JND'],
  ['Kheda', 'KHD'],
  ['Kutch', 'KUT'],
  ['Mahisagar', 'MSR'],
  ['Mehsana', 'MSN'],
  ['Morbi', 'MRB'],
  ['Narmada', 'NRM'],
  ['Navsari', 'NVS'],
  ['Panchmahal', 'PNM'],
  ['Patan', 'PTN'],
  ['Porbandar', 'PBD'],
  ['Rajkot', 'RJK'],
  ['Sabarkantha', 'SBK'],
  ['Surat', 'SRT'],
  ['Surendranagar', 'SNR'],
  ['Tapi', 'TAP'],
  ['Vadodara', 'VAD'],
  ['Valsad', 'VLD'],
  ['Outside Gujarat', 'OTH'],
] as const;

export const districtCode = (name: string) =>
  DISTRICTS.find(([d]) => d === name)?.[1] ?? 'OTH';
export const isDistrict = (name: string) => DISTRICTS.some(([d]) => d === name);

export const AMBASSADOR_ROLES = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'ngo', label: 'NGO or club member' },
  { value: 'coach', label: 'Coach' },
  { value: 'past-camper', label: 'Past CNA camper' },
  { value: 'parent', label: 'Parent' },
  { value: 'other', label: 'Other' },
] as const;

export const INSTITUTION_TYPES = [
  { value: 'government', label: 'Government' },
  { value: 'grant-in-aid', label: 'Grant-in-aid' },
  { value: 'private', label: 'Private' },
  { value: 'college', label: 'College' },
] as const;

/** Letters in any script (incl. Gujarati marks), spaces, dots, apostrophes and hyphens; no links. */
export const PERSON_NAME = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INDIAN_MOBILE = /^(?:\+?91|0)?([6-9]\d{9})$/;

/** "98250 12345", "+91-9825012345" → "+919825012345"; anything else → null. */
export function normalizeMobile(input: string) {
  const digits = input.replace(/[\s()-]/g, '').match(INDIAN_MOBILE)?.[1];
  return digits ? `+91${digits}` : null;
}

/** "+919825012345" → "+91 98250 12345", the way the master list shows numbers. */
export const formatMobile = (e164: string) =>
  /^\+91\d{10}$/.test(e164) ? `+91 ${e164.slice(3, 8)} ${e164.slice(8)}` : e164;

/** Codes people type: upper-cased, spaces removed. */
export const normalizeCode = (input: string) =>
  input.toUpperCase().replace(/\s+/g, '');

export const AMBASSADOR_CODE = /^CNA-AMB-\d{4,}$/;
export const SCHOOL_CODE = /^SCH-[A-Z]{3}-\d{3,}$/;

/** Whole years between a YYYY-MM-DD birth date and `on`. */
export function ageOn(dob: string, on: Date) {
  const [y, m, d] = dob.split('-').map(Number);
  let age = on.getFullYear() - y;
  if (on.getMonth() + 1 < m || (on.getMonth() + 1 === m && on.getDate() < d))
    age -= 1;
  return age;
}

/** A real calendar date (YYYY-MM-DD) from 1920 up to today. */
export function isBirthDate(dob: string, today = istToday()) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === mo - 1 &&
    date.getDate() === d &&
    y >= 1920 &&
    date <= today
  );
}

// Verhoeff check digit, which every Aadhaar number carries as its last digit.
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 8, 7, 6, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/** 12 digits, not starting with 0 or 1, with a valid check digit: catches most typing mistakes. */
export function isAadhaar(digits: string) {
  if (!/^[2-9]\d{11}$/.test(digits)) return false;
  let c = 0;
  digits
    .split('')
    .reverse()
    .forEach((ch, i) => {
      c = VERHOEFF_D[c][VERHOEFF_P[i % 8][Number(ch)]];
    });
  return c === 0;
}

/** Gujarat PIN codes start with 36 to 39; 'Outside Gujarat' takes any valid PIN. */
export const pinMatchesDistrict = (pin: string, district: string) =>
  PIN_CODE.test(pin) && (district === 'Outside Gujarat' || /^3[6-9]/.test(pin));

/** Free text without links or markup characters. */
export const isPlainText = (value: string) =>
  !/[<>{}\\]|https?:|www\./i.test(value);

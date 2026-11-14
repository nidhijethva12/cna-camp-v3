import { AMBASSADOR_ROLES, DISTRICTS, INSTITUTION_TYPES, QUIZ_LANGUAGES, SCHOOL_TYPES } from "../../../lib/olympiad/rules";

const mutable = <T extends { value: string; label: string }>(list: readonly T[]) => list.map(({ value, label }) => ({ value, label }));

export const groupOptions = ["0", "A", "B", "C", "D", "E"].map((g) => ({ label: `Group ${g}`, value: g }));
export const schoolTypeOptions = mutable(SCHOOL_TYPES);
export const quizLanguageOptions = QUIZ_LANGUAGES.map(({ value }) => ({ value, label: value === "gu" ? "Gujarati" : "English" }));
export const districtOptions = DISTRICTS.map(([name]) => ({ label: name, value: name }));
export const ambassadorRoleOptions = mutable(AMBASSADOR_ROLES);
export const institutionTypeOptions = mutable(INSTITUTION_TYPES);

export const roundOptions = [
  { label: "Appeared", value: "appeared" },
  { label: "Absent", value: "absent" },
  { label: "Selected", value: "selected" },
  { label: "Not selected", value: "not-selected" },
];

export const partnerStatusOptions = [
  { label: "Waiting for approval", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Blocked", value: "blocked" },
];

export const messageStatusOptions = ["queued", "sent", "delivered", "read", "failed", "skipped"].map((v) => ({
  label: v[0].toUpperCase() + v.slice(1),
  value: v,
}));

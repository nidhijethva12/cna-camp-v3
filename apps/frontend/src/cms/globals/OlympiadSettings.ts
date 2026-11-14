import type { GlobalConfig } from "payload";
import { anyone, canEdit, hiddenFromAuthors } from "../access";
import { revalidateSiteGlobal } from "../hooks/revalidate";

const fee = (group: string, govt: number, other: number, hasGovtFee: boolean) => ({
  // Group 0 is stored as "G0": a field named "0" would read as a list position.
  name: group === "0" ? "G0" : group,
  label: `Group ${group}`,
  type: "group" as const,
  fields: [
    {
      type: "row" as const,
      fields: [
        ...(hasGovtFee
          ? [{ name: "govt", label: "Government school (₹)", type: "number" as const, required: true, min: 0, defaultValue: govt }]
          : []),
        {
          name: "other",
          label: hasGovtFee ? "Other schools (₹)" : "Fee (₹)",
          type: "number" as const,
          required: true,
          min: group === "0" ? 0 : 1,
          defaultValue: other,
        },
      ],
    },
  ],
});

/** One place for the Olympiad's dates, fees and switches; the page and every server check read it. */
export const OlympiadSettings: GlobalConfig = {
  slug: "olympiad-settings",
  label: "Olympiad settings",
  admin: { hidden: hiddenFromAuthors, group: "Olympiad" },
  // Dates and fees are public on the page anyway; only the admin can change them.
  access: { read: anyone, update: canEdit },
  hooks: revalidateSiteGlobal,
  fields: [
    {
      name: "registrationMode",
      type: "select",
      required: true,
      defaultValue: "auto",
      options: [
        { label: "Automatic: open between the dates below", value: "auto" },
        { label: "Open now", value: "open" },
        { label: "Closed now", value: "closed" },
      ],
      admin: { description: "Use “Open now” to open early. “Automatic” switches on and off at the dates below (IST)." },
    },
    {
      type: "row",
      fields: [
        {
          name: "opensAt",
          label: "Registration opens",
          type: "date",
          required: true,
          defaultValue: "2026-11-14T18:30:00.000Z",
          admin: { date: { pickerAppearance: "dayAndTime" } },
        },
        {
          name: "closesAt",
          label: "Registration closes",
          type: "date",
          required: true,
          defaultValue: "2026-12-14T18:29:00.000Z",
          admin: { date: { pickerAppearance: "dayAndTime" } },
        },
        { name: "feeLastDate", label: "Last date to pay the fee", type: "date", required: true, defaultValue: "2026-12-31T18:29:00.000Z" },
      ],
    },
    {
      name: "fees",
      type: "group",
      admin: {
        description: "Group 0 is government school students under 16 (free). Group B has a lower fee for government school students.",
      },
      fields: [
        fee("0", 0, 0, false),
        fee("A", 230, 230, false),
        fee("B", 156, 369, true),
        fee("C", 651, 651, false),
        fee("D", 1651, 1651, false),
        fee("E", 963, 963, false),
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "consentText",
          type: "textarea",
          required: true,
          defaultValue: "I agree to get Olympiad updates from CNA on WhatsApp and email. I can stop them any time.",
          admin: { description: "Shown next to the consent tick and saved with every person as proof." },
        },
        {
          name: "consentVersion",
          type: "text",
          required: true,
          defaultValue: "2026-10",
          admin: { description: "Change this whenever the consent text changes." },
        },
      ],
    },
    {
      name: "quizSlots",
      label: "Quiz dates and times",
      type: "array",
      admin: {
        description:
          "Std 10, Std 12 and Group C students pick one of these in the form. Leave empty to hide the question. Announce the same slots on the notice board.",
      },
      fields: [
        { name: "date", type: "text", required: true, admin: { description: "As shown in the form, e.g. Sun, 17 Jan 2027" } },
        {
          name: "times",
          type: "array",
          required: true,
          minRows: 1,
          fields: [{ name: "time", type: "text", required: true, admin: { description: "e.g. 10:00 AM to 11:00 AM" } }],
        },
      ],
    },
    {
      name: "milestones",
      label: "Ambassador milestones",
      type: "array",
      admin: { description: "Paid registrations an Ambassador needs for each reward." },
      defaultValue: [
        { paid: 25, reward: "Olympiad Ambassador certificate" },
        { paid: 50, reward: "Name on the website Ambassadors list" },
        { paid: 100, reward: "A free seat or escort seat on a camp (to be confirmed)" },
      ],
      fields: [
        {
          type: "row",
          fields: [
            { name: "paid", label: "Paid registrations", type: "number", required: true, min: 1 },
            { name: "reward", type: "text", required: true },
          ],
        },
      ],
    },
    {
      name: "retainUntil",
      label: "Keep personal data until",
      type: "date",
      defaultValue: "2027-03-31T18:29:00.000Z",
      admin: { description: "After this date, personal details of reminders and registrations can be deleted (DPDP Act)." },
    },
  ],
};

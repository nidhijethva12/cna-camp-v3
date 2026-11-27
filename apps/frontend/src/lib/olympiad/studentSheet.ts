import "server-only";
import ExcelJS from "exceljs";
import { DISTRICTS, type QuizSlot } from "./rules";

const CLASSES = [
  "Std 7",
  "Std 8",
  "Std 9",
  "Std 10",
  "Std 11",
  "Std 12",
  "12 pass",
  "College 1st year",
  "College 2nd year",
  "College 3rd year",
  "College 4th year",
  "Master / Higher studies",
];
const YES_NO = ["Yes", "No"];
const LANGUAGES = { Gujarati: "gu", English: "en" } as const;
const FORTNIGHTS = { "1 to 15 Jan 2027": "jan-1-15", "16 to 31 Jan 2027": "jan-16-31" } as const;
const PARENTS = { Father: "father", Mother: "mother", Guardian: "other" } as const;
const MAX_STUDENTS = 500;

type ColumnKind = "text" | "digits" | "date" | "class" | "yesNo" | "district" | "language" | "fortnight" | "parent" | "list";

/**
 * The school's student sheet: one column for each answer the registration form asks a student. The
 * template and the upload reader share this list, so a heading renamed here changes both.
 */
export const SHEET_COLUMNS = [
  { key: "firstName", header: "Student first name", kind: "text", width: 20, example: "Riya" },
  { key: "fatherName", header: "Father's name", kind: "text", width: 20, example: "Mehulbhai" },
  { key: "surname", header: "Surname", kind: "text", width: 18, example: "Patel" },
  { key: "motherName", header: "Mother's name", kind: "text", width: 20, example: "Hetalben" },
  { key: "fatherAlive", header: "Father alive (Yes/No)", kind: "yesNo", width: 16, example: "Yes" },
  { key: "motherAlive", header: "Mother alive (Yes/No)", kind: "yesNo", width: 16, example: "Yes" },
  { key: "dob", header: "Date of birth (DD-MM-YYYY)", kind: "date", width: 22, example: "15-08-2011" },
  { key: "std", header: "Class", kind: "class", width: 22, example: "Std 9" },
  { key: "govtStd6to8", header: "Std 6 to 8 in a government school (Yes/No)", kind: "yesNo", width: 30, example: "Yes" },
  { key: "aadhaar", header: "Aadhaar number (12 digits)", kind: "digits", width: 22, example: "234567890123" },
  { key: "mobile", header: "Mobile number (10 digits)", kind: "digits", width: 20, example: "9825012345" },
  { key: "whatsapp", header: "WhatsApp number (if different)", kind: "digits", width: 24, example: "" },
  { key: "email", header: "Email", kind: "text", width: 26, example: "parent@example.com" },
  { key: "address", header: "Home address", kind: "text", width: 36, example: "12, Shanti Nagar, Kalawad Road" },
  { key: "district", header: "District", kind: "district", width: 18, example: "Rajkot" },
  { key: "pin", header: "PIN code", kind: "digits", width: 12, example: "360005" },
  { key: "quizLanguage", header: "Quiz language (Gujarati/English)", kind: "language", width: 22, example: "Gujarati" },
  { key: "quizWindow", header: "Quiz fortnight", kind: "fortnight", width: 22, example: "1 to 15 Jan 2027" },
  { key: "quizDate", header: "Quiz date (Std 10, Std 12 and college only)", kind: "text", width: 30, example: "" },
  { key: "quizTime", header: "Quiz time (Std 10, Std 12 and college only)", kind: "text", width: 30, example: "" },
  { key: "parentRelation", header: "Parent (Father/Mother/Guardian)", kind: "parent", width: 22, example: "Father" },
  { key: "parentName", header: "Parent full name", kind: "text", width: 26, example: "Mehulbhai Patel" },
  { key: "parentMobile", header: "Parent mobile (10 digits)", kind: "digits", width: 20, example: "9825012345" },
  { key: "schoolId", header: "GR number (optional)", kind: "text", width: 18, example: "" },
  { key: "achievements", header: "Achievements (optional, separate with ;)", kind: "list", width: 36, example: "" },
] as const satisfies readonly { key: string; header: string; kind: ColumnKind; width: number; example: string }[];

type ColumnKey = (typeof SHEET_COLUMNS)[number]["key"];

/** One student as read from the sheet. Text stays as typed; the Olympiad API judges every value. */
export interface SheetRow extends Record<Exclude<ColumnKey, "fatherAlive" | "motherAlive" | "achievements">, string> {
  row: number;
  fatherAlive: boolean;
  motherAlive: boolean;
  achievements: string[];
}

/** The heading without its bracketed hint, lower-cased: how a column is recognised in an uploaded file. */
const headingKey = (header: string) => header.split(" (")[0].trim().toLowerCase();

const columnLetter = (index: number) => {
  let letters = "";
  for (let n = index; n > 0; n = Math.floor((n - 1) / 26)) letters = String.fromCharCode(65 + ((n - 1) % 26)) + letters;
  return letters;
};

/**
 * The Excel template: one example row, dropdowns for every fixed choice and a "How to fill" sheet.
 * Quiz slots come from the Olympiad settings, so the sheet lists the dates a school can use.
 */
export async function buildTemplate(quizSlots: QuizSlot[] = []) {
  const book = new ExcelJS.Workbook();
  const sheet = book.addWorksheet("Students", { views: [{ state: "frozen", ySplit: 1, xSplit: 1 }] });
  sheet.columns = SHEET_COLUMNS.map(({ key, header, width }) => ({ key, header, width }));
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).alignment = { wrapText: true, vertical: "middle" };
  sheet.getRow(1).height = 34;
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFBEEE6" } };
  sheet.addRow(Object.fromEntries(SHEET_COLUMNS.map(({ key, example }) => [key, example])));

  // Long choice lists live on their own sheet: Excel limits a typed-in list to 255 characters.
  const lists = book.addWorksheet("Lists", { state: "hidden" });
  const districts = DISTRICTS.map(([name]) => name);
  CLASSES.forEach((value, i) => (lists.getCell(i + 1, 1).value = value));
  districts.forEach((value, i) => (lists.getCell(i + 1, 2).value = value));
  const inline = (values: readonly string[]) => [`"${values.join(",")}"`];
  const choices: Partial<Record<ColumnKind, string[]>> = {
    class: [`Lists!$A$1:$A$${CLASSES.length}`],
    district: [`Lists!$B$1:$B$${districts.length}`],
    yesNo: inline(YES_NO),
    language: inline(Object.keys(LANGUAGES)),
    fortnight: inline(Object.keys(FORTNIGHTS)),
    parent: inline(Object.keys(PARENTS)),
  };
  SHEET_COLUMNS.forEach(({ kind }, i) => {
    const letter = columnLetter(i + 1);
    const formulae = choices[kind];
    for (let r = 2; r <= MAX_STUDENTS + 1; r += 1) {
      const cell = sheet.getCell(`${letter}${r}`);
      // Numbers and dates are kept as text, so Excel never drops a leading zero or reshapes a date.
      if (kind === "digits" || kind === "date") cell.numFmt = "@";
      if (formulae) cell.dataValidation = { type: "list", allowBlank: true, formulae };
    }
  });

  const help = book.addWorksheet("How to fill");
  help.columns = [{ width: 120 }];
  [
    `One row per student, up to ${MAX_STUDENTS} per upload. Replace the example row with your students.`,
    "Names: letters only. The student's full name is made from first name, father's name and surname.",
    "Date of birth: DD-MM-YYYY, for example 15-08-2011. Age is counted on the day of upload; 13 years must be completed.",
    "The group and fee are decided automatically from the date of birth and your school's type. You do not choose them.",
    "Class: choose from the list. Under 16: Std 7 to Std 10. Age 16 or 17: Std 9 to Std 12. Age 18 or more: 12 pass or a college year.",
    "Std 6 to 8 in a government school: only asked for students under 16 in a Government school. Yes means Group 0 (free).",
    "Aadhaar number: all 12 digits, no spaces. One Aadhaar number can register only once.",
    "WhatsApp number: leave empty if it is the same as the mobile number.",
    "Email: needed for every student. The confirmation and receipt go there.",
    "Parent: for students under 18. Choose Guardian only when neither parent is alive.",
    quizSlots.length
      ? `Quiz date and time (Std 10, Std 12 and college students only). Type them exactly as shown: ${quizSlots
          .map((slot) => `${slot.date} at ${slot.times.join(" or ")}`)
          .join("; ")}.`
      : "Quiz date and time: leave empty for now. The dates are not announced yet.",
    "After uploading, add each student's photo and Aadhaar card on the dashboard. Group 0 and government-fee students also need a school ID card or bonafide certificate.",
    "Uploading the same student twice adds them only once.",
  ].forEach((line) => help.addRow([line]));
  return Buffer.from(await book.xlsx.writeBuffer());
}

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => {
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? `${y}-${pad(m)}-${pad(d)}` : "";
};

/** Excel dates arrive as Date objects or text in several shapes; all become YYYY-MM-DD, anything unclear becomes "". */
function toIsoDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime()))
    return iso(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
  const text = String(value ?? "").trim();
  let m = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) return iso(Number(m[3]), Number(m[2]), Number(m[1]));
  m = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return iso(Number(m[1]), Number(m[2]), Number(m[3]));
  return "";
}

const cellText = (value: ExcelJS.CellValue): string => {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("result" in value) return cellText(value.result as ExcelJS.CellValue);
    if ("richText" in value) return value.richText.map((r) => r.text).join("");
  }
  return String(value);
};

/** Normalises "std 9", "9", "Std. 9" to the class names the form uses. */
function toClass(value: string) {
  const n = value.match(/^(?:std\.?\s*)?(\d{1,2})(?:th)?$/i);
  if (n) return `Std ${Number(n[1])}`;
  return CLASSES.find((c) => c.toLowerCase() === value.toLowerCase()) ?? value;
}

/** The value the API expects for a typed choice ("Gujarati" → "gu"); an unknown word is passed on to be refused. */
const choice = (options: Record<string, string>, typed: string) =>
  Object.entries(options).find(([label]) => label.toLowerCase() === typed.toLowerCase())?.[1] ?? typed;

const tidy = (value: string) => value.trim().replace(/\s+/g, " ");

function readCell(kind: ColumnKind, raw: ExcelJS.CellValue): string | boolean | string[] {
  const text = tidy(cellText(raw));
  switch (kind) {
    case "date":
      return toIsoDate(raw instanceof Date ? raw : text);
    case "digits":
      return text.replace(/\D/g, "");
    case "class":
      return toClass(text);
    case "yesNo":
      return /^(y|yes|true|1)$/i.test(text) ? "yes" : /^(n|no|false|0)$/i.test(text) ? "no" : "";
    case "district":
      return DISTRICTS.find(([name]) => name.toLowerCase() === text.toLowerCase())?.[0] ?? text;
    case "language":
      return choice(LANGUAGES, text);
    case "fortnight":
      return choice(FORTNIGHTS, text);
    case "parent":
      return choice(PARENTS, text);
    case "list":
      return text
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean);
    default:
      return text;
  }
}

/** Reads the first sheet of an .xlsx file, or a .csv, matching columns by their heading. */
export async function readSheet(file: File): Promise<SheetRow[]> {
  const book = new ExcelJS.Workbook();
  const bytes = Buffer.from(await file.arrayBuffer());
  const sheet = file.name.toLowerCase().endsWith(".csv")
    ? await book.csv.read((await import("node:stream")).Readable.from(bytes), { map: (value: string) => value })
    : (await book.xlsx.load(bytes as unknown as ArrayBuffer), book.worksheets[0]);
  if (!sheet) return [];

  const index = new Map<ColumnKey, number>();
  sheet.getRow(1).eachCell((cell, col) => {
    const title = headingKey(cellText(cell.value));
    const column = SHEET_COLUMNS.find(({ header }) => headingKey(header) === title);
    if (column && !index.has(column.key)) index.set(column.key, col);
  });

  const example = SHEET_COLUMNS.map(({ kind, example: value }) => JSON.stringify(readCell(kind, value)));
  const rows: SheetRow[] = [];
  sheet.eachRow((row, number) => {
    if (number === 1) return;
    const values = SHEET_COLUMNS.map(({ key, kind }) => {
      const col = index.get(key);
      return readCell(kind, col ? row.getCell(col).value : null);
    });
    if (values.every((v) => (Array.isArray(v) ? !v.length : !v))) return;
    // The template's example row, left unchanged, is not a student.
    if (values.every((v, i) => JSON.stringify(v) === example[i])) return;
    const student = Object.fromEntries(SHEET_COLUMNS.map(({ key }, i) => [key, values[i]])) as Record<ColumnKey, string | string[]>;
    rows.push({
      ...(student as unknown as SheetRow),
      // A parent is taken as alive unless the sheet says No, as the form does.
      fatherAlive: student.fatherAlive !== "no",
      motherAlive: student.motherAlive !== "no",
      row: number,
    });
  });
  return rows;
}

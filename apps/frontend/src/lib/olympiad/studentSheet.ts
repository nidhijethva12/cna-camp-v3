import "server-only";
import ExcelJS from "exceljs";

/** The school's student sheet: the same columns in the template and in what the upload reads. */
export const SHEET_COLUMNS = [
  { key: "name", header: "Student full name", width: 30, example: "Riya Mehulbhai Patel" },
  { key: "dob", header: "Date of birth (DD-MM-YYYY)", width: 26, example: "15-08-2011" },
  { key: "std", header: "Class (Std 8 to Std 12, or college year)", width: 34, example: "Std 9" },
  { key: "parentName", header: "Parent full name", width: 28, example: "Mehulbhai Patel" },
  { key: "parentMobile", header: "Parent mobile (10 digits)", width: 24, example: "9825012345" },
  { key: "parentEmail", header: "Parent email (the link goes here)", width: 32, example: "parent@example.com" },
] as const;

export type SheetRow = Record<(typeof SHEET_COLUMNS)[number]["key"], string> & { row: number };

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

/** The Excel template with one example row, a class dropdown and a short "How to fill" sheet. */
export async function buildTemplate() {
  const book = new ExcelJS.Workbook();
  const sheet = book.addWorksheet("Students", { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = SHEET_COLUMNS.map(({ key, header, width }) => ({ key, header, width }));
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFBEEE6" } };
  sheet.addRow(Object.fromEntries(SHEET_COLUMNS.map(({ key, example }) => [key, example])));
  for (let r = 2; r <= 501; r += 1) {
    sheet.getCell(r, 2).numFmt = "@";
    sheet.getCell(r, 5).numFmt = "@";
    sheet.getCell(r, 3).dataValidation = { type: "list", allowBlank: true, formulae: [`"${CLASSES.join(",")}"`] };
  }
  const help = book.addWorksheet("How to fill");
  help.columns = [{ width: 110 }];
  [
    "One row per student. Replace the example row with your students (up to 500 per upload).",
    "Date of birth: DD-MM-YYYY, for example 15-08-2011. Age is counted on the day of upload; students must have completed 13 years.",
    "Class: choose from the list (Std 7 to Std 12, or a college year).",
    "Parent mobile: 10 digits. Parent email: each parent gets a link there to add the photo, Aadhaar and consent.",
    "No parent email? Leave it empty: the student appears on your dashboard with a 'Copy link' button to send on WhatsApp.",
    "Save the file and upload it on the school dashboard. Uploading the same student twice adds them only once.",
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
  const v = value.trim();
  const n = v.match(/^(?:std\.?\s*)?(\d{1,2})(?:th)?$/i);
  if (n) return `Std ${Number(n[1])}`;
  return CLASSES.find((c) => c.toLowerCase() === v.toLowerCase()) ?? v;
}

/** Reads the first sheet of an .xlsx file, or a .csv, matching columns by their header text. */
export async function readSheet(file: File): Promise<SheetRow[]> {
  const book = new ExcelJS.Workbook();
  const bytes = Buffer.from(await file.arrayBuffer());
  const sheet = file.name.toLowerCase().endsWith(".csv")
    ? await book.csv.read((await import("node:stream")).Readable.from(bytes))
    : (await book.xlsx.load(bytes as unknown as ArrayBuffer), book.worksheets[0]);
  if (!sheet) return [];

  const header = sheet.getRow(1);
  const index = new Map<string, number>();
  header.eachCell((cell, col) => {
    const title = cellText(cell.value).toLowerCase();
    const column = SHEET_COLUMNS.find(({ header: h }) => title.startsWith(h.toLowerCase().split(" (")[0]));
    if (column && !index.has(column.key)) index.set(column.key, col);
  });

  const rows: SheetRow[] = [];
  sheet.eachRow((row, number) => {
    if (number === 1) return;
    const get = (key: string) => {
      const col = index.get(key);
      return col ? row.getCell(col).value : null;
    };
    const values = {
      name: cellText(get("name")).trim().replace(/\s+/g, " "),
      dob: toIsoDate(get("dob") instanceof Date ? get("dob") : cellText(get("dob"))),
      std: toClass(cellText(get("std"))),
      parentName: cellText(get("parentName")).trim().replace(/\s+/g, " "),
      parentMobile: cellText(get("parentMobile")).replace(/\D/g, "").slice(-10),
      parentEmail: cellText(get("parentEmail")).trim().toLowerCase(),
    };
    if (Object.values(values).every((v) => !v)) return;
    // The template's example row, left unchanged, is not a student.
    const example = { ...Object.fromEntries(SHEET_COLUMNS.map(({ key, example }) => [key, example])), dob: "2011-08-15" };
    if (
      Object.entries(values).every(
        ([key, value]) =>
          value === String(example[key as keyof typeof example]).toLowerCase() || value === example[key as keyof typeof example],
      )
    )
      return;
    rows.push({ ...values, row: number });
  });
  return rows;
}

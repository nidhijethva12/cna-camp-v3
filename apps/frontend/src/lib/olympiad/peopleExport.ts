import ExcelJS from "exceljs";
import type { OlympiadPerson } from "@/payload-types";

const date = (value?: string | null) => (value ? new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "");
const yes = (value?: boolean | null) => (value == null ? "" : value ? "Yes" : "No");

const COLUMNS: { header: string; width: number; value: (p: OlympiadPerson) => string | number }[] = [
  { header: "Reg. ID", width: 16, value: (p) => p.regId ?? "" },
  { header: "Type", width: 12, value: (p) => p.type },
  { header: "Group", width: 8, value: (p) => p.group ?? "" },
  { header: "Name", width: 28, value: (p) => p.name },
  { header: "Registered as", width: 12, value: (p) => p.participant ?? "" },
  { header: "Date of birth", width: 12, value: (p) => p.dob ?? "" },
  { header: "Father", width: 18, value: (p) => p.fatherName ?? "" },
  { header: "Mother", width: 18, value: (p) => p.motherName ?? "" },
  { header: "Orphan", width: 8, value: (p) => yes(p.orphan) },
  { header: "Mobile", width: 15, value: (p) => p.mobile ?? "" },
  { header: "WhatsApp", width: 15, value: (p) => p.whatsapp },
  { header: "Email", width: 26, value: (p) => p.email ?? "" },
  { header: "Address", width: 30, value: (p) => p.address ?? "" },
  { header: "District", width: 14, value: (p) => p.district ?? "" },
  { header: "PIN", width: 8, value: (p) => p.pin ?? "" },
  { header: "Quiz language", width: 10, value: (p) => p.quizLanguage ?? "" },
  { header: "Quiz date", width: 18, value: (p) => p.quizDate ?? "" },
  { header: "Quiz time", width: 18, value: (p) => p.quizTime ?? "" },
  { header: "Guardian", width: 10, value: (p) => p.parentRelation ?? "" },
  { header: "Guardian name", width: 22, value: (p) => p.parentName ?? "" },
  { header: "Guardian mobile", width: 15, value: (p) => p.parentPhone ?? "" },
  { header: "School / college", width: 28, value: (p) => p.institution ?? "" },
  { header: "School type", width: 14, value: (p) => p.schoolType ?? "" },
  { header: "Std 6-8 in govt school", width: 10, value: (p) => yes(p.govtStd6to8) },
  { header: "Std / year", width: 14, value: (p) => p.stage ?? "" },
  { header: "GR number", width: 12, value: (p) => p.schoolId ?? "" },
  { header: "School proof uploaded", width: 10, value: (p) => yes(p.type === "registered" ? Boolean(p.documents?.schoolIdCard) : null) },
  { header: "School contact", width: 14, value: (p) => p.contactRole ?? "" },
  { header: "Contact name", width: 20, value: (p) => p.contactName ?? "" },
  { header: "Contact mobile", width: 15, value: (p) => p.contactPhone ?? "" },
  { header: "Teacher", width: 10, value: (p) => p.teacherStatus ?? "" },
  { header: "Subject", width: 14, value: (p) => p.subject ?? "" },
  { header: "Work", width: 18, value: (p) => p.work ?? "" },
  { header: "Achievements", width: 30, value: (p) => (p.achievements ?? []).join("; ") },
  { header: "Aadhaar", width: 16, value: (p) => (p.aadhaarLast4 ? `XXXX XXXX ${p.aadhaarLast4}` : "") },
  { header: "Fee (₹)", width: 9, value: (p) => p.fee ?? "" },
  { header: "Payment", width: 10, value: (p) => p.paymentStatus ?? "" },
  { header: "Paid on", width: 20, value: (p) => date(p.paidAt) },
  { header: "Razorpay payment ID", width: 22, value: (p) => p.razorpayPaymentId ?? "" },
  { header: "Razorpay order ID", width: 22, value: (p) => p.razorpayOrderId ?? "" },
  { header: "Check school proof", width: 10, value: (p) => yes(p.feeCheck) },
  { header: "Source", width: 11, value: (p) => p.source ?? "" },
  { header: "Code", width: 14, value: (p) => p.code ?? "" },
  { header: "Rules version", width: 13, value: (p) => p.rules?.version ?? "" },
  { header: "Rules agreed on", width: 20, value: (p) => date(p.rules?.at) },
  { header: "Registered on", width: 20, value: (p) => date(p.registeredAt ?? p.createdAt) },
];

/** The master list rows as one Excel sheet, in the order given. */
export async function peopleWorkbook(people: OlympiadPerson[]) {
  const book = new ExcelJS.Workbook();
  const sheet = book.addWorksheet("Master list", { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = COLUMNS.map((c) => ({ header: c.header, width: c.width }));
  sheet.getRow(1).font = { bold: true };
  for (const person of people) sheet.addRow(COLUMNS.map((c) => c.value(person)));
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: COLUMNS.length } };
  return Buffer.from(await book.xlsx.writeBuffer());
}

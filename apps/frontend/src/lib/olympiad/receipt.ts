/** Everything a registration receipt shows, as the Olympiad API returns it for a receipt link. */
export interface ReceiptData {
  regId: string;
  name: string;
  group: string;
  participant: string;
  dob: string;
  mobile: string;
  whatsapp: string;
  email: string;
  institution: string;
  stage: string;
  schoolType: string;
  district: string;
  pin: string;
  quizLanguage: string;
  quizDate: string;
  quizTime: string;
  guardian: { relation: string; name: string; phone: string } | null;
  fee: number;
  status: "paid" | "free";
  registeredAt: string | null;
  paidAt: string | null;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  rulesVersion: string;
}

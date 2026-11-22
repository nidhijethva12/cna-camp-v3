/** Ways a fee can be paid at the CNA office instead of through Razorpay. Kept identical to the Olympiad API. */
export const OFFICE_METHODS = ["cash", "upi", "bank", "cheque"] as const;
export type OfficeMethod = (typeof OFFICE_METHODS)[number];

export const OFFICE_METHOD_LABELS: Record<OfficeMethod, string> = {
  cash: "Cash",
  upi: "UPI to the Trust",
  bank: "Bank transfer",
  cheque: "Cheque",
};

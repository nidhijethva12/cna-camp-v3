import type { DefaultServerCellComponentProps } from "payload";

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2, minimumFractionDigits: 0 });

/** Shows an amount stored in paise as rupees in a list: 96300 → ₹963. */
export function RupeeCell({ cellData }: DefaultServerCellComponentProps) {
  return typeof cellData === "number" ? rupees.format(cellData / 100) : null;
}

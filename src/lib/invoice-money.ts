/**
 * An invoice marked "paid" is treated as fully received regardless of
 * paid_amount; otherwise paid_amount (when set) tracks partial payment.
 */
export function invoiceReceived(
  amount: number,
  status: string,
  paidAmount: number | string | null | undefined,
): number {
  if (status === "paid") return amount;
  const paid = paidAmount == null ? 0 : Number(paidAmount);
  if (!Number.isFinite(paid) || paid <= 0) return 0;
  return Math.min(paid, amount);
}

export function invoiceRemaining(
  amount: number,
  status: string,
  paidAmount: number | string | null | undefined,
): number {
  return Math.max(amount - invoiceReceived(amount, status, paidAmount), 0);
}

export type InvoicePaymentState = "paid" | "partial" | "unpaid";

export function invoicePaymentState(
  amount: number,
  status: string,
  paidAmount: number | string | null | undefined,
): InvoicePaymentState {
  const received = invoiceReceived(amount, status, paidAmount);
  if (received >= amount && amount > 0) return "paid";
  if (received > 0) return "partial";
  return "unpaid";
}

export const DEFAULT_CURRENCY = "USD";

/**
 * Central money formatter. Intl already renders KES/NGN/ZAR-style codes as
 * "CODE amount" and USD/EUR/GBP/JPY/INR/CAD/AUD with their native symbol in
 * the en-US locale, so no hand-rolled symbol table is needed. Falls back to
 * USD if an unrecognized/garbage currency code slips through (e.g. free-text
 * account currency fields).
 */
export function formatCurrency(amount: number, currency: string | null | undefined): string {
  const value = Number.isFinite(amount) ? amount : 0;
  const code = currency?.trim().toUpperCase() || DEFAULT_CURRENCY;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: DEFAULT_CURRENCY,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
}

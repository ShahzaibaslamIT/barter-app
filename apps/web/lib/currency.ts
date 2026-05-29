// Centralized money formatting for the marketplace.
//
// The marketplace is Pakistan-only today, so the base (and only) currency is
// PKR. Fee amounts are stored as a plain number interpreted in the base
// currency. `formatMoney` is the single choke point every UI surface should use
// to render a price.
//
// FUTURE — per-user currency (decided: detect from User.country):
// When we onboard users outside Pakistan, add a conversion step *here* keyed off
// the viewer's profile country → currency, using a cached exchange-rate source
// with a hardcoded fallback table. Callers won't change: they keep passing a
// base-currency amount and (optionally) the viewer's target currency.

export const BASE_CURRENCY = "PKR" as const;

// Default listing fee in PKR, used when AppSettings has not been configured.
// Display/record only today — no payment is charged at listing creation. Adjust
// this single constant (or wire up an admin settings screen) to change the fee.
export const DEFAULT_LISTING_FEE = 150;

/**
 * Format an amount (in the base currency) for display.
 * @param amount  Numeric amount in `currency`.
 * @param currency ISO 4217 code; defaults to the base currency (PKR).
 */
export function formatMoney(
  amount: number,
  currency: string = BASE_CURRENCY
): string {
  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      // PKR is transacted in whole rupees; other currencies keep cents.
      maximumFractionDigits: currency === "PKR" ? 0 : 2,
    }).format(amount);
  } catch {
    // Defensive fallback if the runtime lacks the currency in its ICU data.
    return `Rs ${Math.round(amount)}`;
  }
}

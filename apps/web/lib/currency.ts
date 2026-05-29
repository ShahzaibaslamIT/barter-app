// Centralized money formatting + per-user currency conversion.
//
// The marketplace's base currency is PKR: the listing fee is defined in rupees
// (DEFAULT_LISTING_FEE) and every other currency is derived from it. A viewer's
// currency is chosen from their profile country (User.country, a free-text
// country name), and the base amount is converted for display only — nothing is
// charged and the stored fee stays in the base currency.
//
// Exchange rates here are an approximate static table (no external dependency,
// always available offline). They drift over time; refresh periodically, or
// swap `convertFromBase` to read a cached live feed if exact pricing is needed.

export const BASE_CURRENCY = "PKR" as const;

// Listing fee in the base currency (PKR). Display/record only — no payment is
// charged at listing creation. Change this one constant to change the fee.
export const DEFAULT_LISTING_FEE = 300;

// Free-text profile country name (normalized: lowercased + trimmed) → ISO 4217.
// Unmapped countries fall back to the base currency (PKR).
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  pakistan: "PKR",
  "united states": "USD",
  "united states of america": "USD",
  usa: "USD",
  us: "USD",
  "united kingdom": "GBP",
  uk: "GBP",
  england: "GBP",
  "great britain": "GBP",
  india: "INR",
  "united arab emirates": "AED",
  uae: "AED",
  "saudi arabia": "SAR",
  canada: "CAD",
  australia: "AUD",
  germany: "EUR",
  france: "EUR",
  italy: "EUR",
  spain: "EUR",
  netherlands: "EUR",
  ireland: "EUR",
  bangladesh: "BDT",
  china: "CNY",
  japan: "JPY",
  turkey: "TRY",
  "south africa": "ZAR",
};

// Approximate value of 1 PKR in each target currency. PKR is the base (1).
const PKR_TO: Record<string, number> = {
  PKR: 1,
  USD: 0.0036,
  GBP: 0.0028,
  EUR: 0.0033,
  INR: 0.3,
  AED: 0.0132,
  SAR: 0.0135,
  CAD: 0.0049,
  AUD: 0.0055,
  BDT: 0.43,
  CNY: 0.026,
  JPY: 0.55,
  TRY: 0.14,
  ZAR: 0.066,
};

/** Resolve a profile country name to an ISO 4217 currency code. */
export function currencyForCountry(country?: string | null): string {
  if (!country) return BASE_CURRENCY;
  return COUNTRY_TO_CURRENCY[country.trim().toLowerCase()] ?? BASE_CURRENCY;
}

/** Convert an amount in the base currency (PKR) into `currency`. */
export function convertFromBase(amountPkr: number, currency: string): number {
  const rate = PKR_TO[currency] ?? 1;
  return amountPkr * rate;
}

/**
 * Format an amount for display.
 * @param amount   Numeric amount already in `currency`.
 * @param currency ISO 4217 code; defaults to the base currency (PKR).
 */
export function formatMoney(
  amount: number,
  currency: string = BASE_CURRENCY
): string {
  try {
    return new Intl.NumberFormat(currency === "PKR" ? "en-PK" : "en-US", {
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

/**
 * Format a base-currency (PKR) amount in the viewer's local currency, chosen
 * from their profile country. This is the helper UI surfaces should call.
 */
export function formatFeeForCountry(
  amountPkr: number,
  country?: string | null
): string {
  const currency = currencyForCountry(country);
  return formatMoney(convertFromBase(amountPkr, currency), currency);
}

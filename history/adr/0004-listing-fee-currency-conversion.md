# ADR-0004: Listing Fee Currency — PKR Base with Static-Rate Per-User Conversion

- **Status:** Accepted
- **Date:** 2026-05-29
- **Feature:** 004-fix-listing-fee-and-offer-button
- **Context:** QA reported the listing fee was shown in USD ("$0.99") although the marketplace is Pakistan-only today. The product owner wants the fee defined in PKR and displayed in each viewer's local currency, derived from their profile country, in anticipation of expanding beyond Pakistan.

## Decision

Treat **PKR as the single base currency** for the listing fee and convert to the viewer's currency for **display only**:

- **Base amount:** `DEFAULT_LISTING_FEE = 300` PKR, defined in `apps/web/lib/currency.ts`. No payment is charged at listing creation; the value is informational and recorded on the listing.
- **Viewer currency selection:** resolved from the user's free-text profile country (`User.country`) via a normalized `COUNTRY_TO_CURRENCY` map; unmapped/empty → base currency (PKR).
- **Conversion:** a **static, in-code approximate rate table** (`PKR_TO`) maps 1 PKR → each supported currency. No external FX API.
- **Formatting:** `Intl.NumberFormat` with `currencyDisplay: "narrowSymbol"`; PKR rendered in whole rupees, other currencies to 2 decimals.
- **Single choke point:** all fee rendering goes through `formatFeeForCountry(amountPkr, country)` so a future conversion-source swap requires no caller changes.

## Consequences

### Positive

- Ships immediately with **no external dependency** — offline-safe, deterministic, cannot fail a render or break the build (defensive fallback to `Rs <n>`).
- Correct for the current Pakistan-only audience (everyone sees Rs 300) while already structured for international users.
- Conversion + currency selection are centralized; UI surfaces stay ignorant of FX mechanics.
- Display-only conversion avoids payment/rounding/settlement correctness concerns.

### Negative

- **Rates drift.** The static table is a point-in-time approximation; non-PKR prices grow stale until the constants are refreshed. Acceptable only because the fee is not actually charged.
- No admin UI yet to change the base fee (the form's `/api/settings` 404s and falls back to the constant); changing the fee currently means editing code.
- Country matching is string-based on free-text input — misspelled/unlisted countries silently fall back to PKR.

## Alternatives Considered

- **Fixed PKR only, no conversion:** simplest, but rejected — the owner explicitly wants per-user currency for upcoming international users.
- **Live FX feed (e.g. open.er-api.com) with caching + fallback table:** most accurate, but adds an external runtime dependency, caching/failure handling, and latency for a fee that is display-only and currently always PKR. Deferred — `convertFromBase` is the designed insertion point if exact pricing is ever required.
- **Per-user currency from browser locale (`navigator.language`) instead of profile country:** works without profile data but is easily wrong (VPNs, foreign-language devices). Rejected in favor of the more intentional profile-country signal.

## References

- Feature Spec: null
- Implementation Plan: null
- Related ADRs: [[0003-shared-data-access-layer]]
- Evaluator Evidence: branch `004-fix-listing-fee-and-offer-button`; `apps/web/lib/currency.ts`, `apps/web/components/listings/listing-form.tsx`

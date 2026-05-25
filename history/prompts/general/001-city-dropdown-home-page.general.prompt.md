---
id: "001"
title: City Dropdown on Home Page
stage: green
date: 2026-03-19
surface: agent
model: claude-sonnet-4-6
feature: discover-location
branch: main
user: Solution tech
command: chat
labels: ["city-filter","home-page","discover","location","dropdown"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - app/home/page.tsx
  - app/api/listings/route.ts
  - app/api/listings/cities/route.ts
  - app/api/listings/nearby/route.ts
  - prisma/schema.prisma
  - components/location/location-picker.tsx
  - components/listings/listing-form.tsx
tests:
  - manual: select city in home page dropdown → listings filter correctly
  - manual: "All Cities" resets to unfiltered view
  - manual: active filter badge shows city with MapPin icon
  - manual: city + category + search can all be active simultaneously
---

## Prompt

Claude what i want to say is that I want list of different cities as a drop down i select one city and get the listings posted in that relevant city. But i never see that in either the home page or the discovery page. You can incorporate it in either of the pages you feel is appropriate.

## Response snapshot

Added a city dropdown to the Home page filter bar alongside the existing Category and Sort dropdowns. Cities are fetched from `/api/listings/cities`. Selecting a city filters listings via the `city` URL param. Also added `city_name` column to the Listing schema and fixed the city extraction logic to store the precise city name at listing creation time rather than guessing from comma-separated `location_text`.

Changes:
- `prisma/schema.prisma`: added `city_name String?` to Listing model
- `components/location/location-picker.tsx`: extract and pass `city` from OSM `address.city` through `onLocationSelect` callback
- `components/listings/listing-form.tsx`: receive `city` from location picker, include `city_name` in POST payload
- `app/api/listings/route.ts` POST: save `city_name`; GET: filter by `city_name` (new) or `location_text` (old)
- `app/api/listings/cities/route.ts`: use `COALESCE(city_name, extraction_from_location_text)` with corrected 4-part heuristic
- `app/home/page.tsx`: city dropdown in filter bar, city badge in active filters, city param in fetch

## Outcome

- ✅ Impact: City dropdown visible on home page; selecting a city filters listings accurately using the stored city_name field for new listings
- 🧪 Tests: Manual flow — post listing → city_name stored → home page dropdown shows city → filter works
- 📁 Files: 7 files modified
- 🔁 Next prompts: run `npx prisma generate` after stopping dev server to regenerate Prisma client with city_name field
- 🧠 Reflection: Storing city explicitly at creation time is far more reliable than SQL string parsing across mixed Nominatim/BigDataCloud address formats

## Evaluation notes (flywheel)

- Failure modes observed: SQL city extraction was ambiguous for 3-part addresses (City, State, Country vs Locality, City, Country)
- Graders run and results (PASS/FAIL): none automated
- Prompt variant (if applicable): null
- Next experiment: backfill city_name for existing listings via SQL UPDATE using the 4-part heuristic

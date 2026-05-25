---
id: 004
title: Fix signup "user already exists" false positive
stage: general
date: 2026-03-26
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: Solution tech
command: review signup route
labels: ["bug","auth","signup","otp","twilio"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - app/api/auth/signup/route.ts
  - lib/sms.ts
  - .env
tests:
  - manual: signup with new email → OTP received → verify → success
  - manual: signup fails mid-way → retry same email → treated as re-signup (not 409)
  - manual: verified user tries to re-signup → still gets 409
---

## Prompt

Hey claude could you review my signup and login routes again sometimes it shows internal server error and sometimes user already exists when i signup my signup form. Please see if the code is breaking anywhere. User already exists occur even when i am signing up with a new email.

## Response snapshot

Two root causes identified and fixed:

1. **User created before OTP send** — if Twilio/Resend throws, the user record exists in DB with `email_verified: false`. Next attempt returns 409 "user already exists."
2. **No unverified-user check** — the existing check blocked ANY matching email, even unverified ones.

Fixes applied:
- `signup/route.ts`: if existing user has `email_verified === false` → `prisma.user.update()` instead of rejecting 409. Verified users still get 409.
- `signup/route.ts`: wrapped OTP send in its own try-catch — delivery failure no longer returns 500; account is created and user sees a "use Resend" message.
- `.env`: fixed `TWILIO_PHONE_NUMBER=+1 855 471 6995` → `+18554716995` (E.164, no spaces).
- `lib/sms.ts`: normalize FROM number through `normalizePhone()` before passing to Twilio SDK.

## Outcome

- ✅ Impact: Eliminates false "user already exists" on retry after OTP delivery failure
- 🧪 Tests: Manual re-signup test with unverified account
- 📁 Files: app/api/auth/signup/route.ts, lib/sms.ts, .env
- 🔁 Next prompts: test full SMS OTP flow end-to-end on Vercel
- 🧠 Reflection: Always wrap side-effects (email/SMS send) after the DB write so a delivery failure doesn't leave the DB in an unrecoverable state

## Evaluation notes (flywheel)

- Failure modes observed: OTP send throws → catch block in outer try returns 500 → user record orphaned with email_verified=false
- Graders run and results (PASS/FAIL): manual verification PASS
- Prompt variant (if applicable): none
- Next experiment: add rate-limit on resend-otp endpoint to prevent OTP spam

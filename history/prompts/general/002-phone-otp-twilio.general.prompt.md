---
id: "002"
title: Phone OTP via Twilio SMS
stage: green
date: 2026-03-19
surface: agent
model: claude-sonnet-4-6
feature: auth-otp
branch: main
user: Solution tech
command: chat
labels: ["otp","sms","twilio","phone","auth","verification"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - lib/sms.ts
  - app/api/auth/login/route.ts
  - app/api/auth/signup/route.ts
  - app/api/auth/resend-otp/route.ts
  - app/auth/verify/page.tsx
  - components/auth/auth-form.tsx
  - .env
  - package.json
tests:
  - manual: signup with phone → select SMS → receive OTP via SMS
  - manual: signup without phone → only email option shown
  - manual: login → verify page → switch to SMS tab → receive new OTP via SMS
  - manual: resend on either channel works
  - manual: invalid/expired OTP shows error
---

## Prompt

Okay now claude comes the OTP code, otp code is already configured on email side. But now I want it to be on phone number as well. User should have the option to get otp code from either through the email or the phone number. First properly review my OTP code structure for email so you understand the workflow and then move onto add otp code via phone number.

## Response snapshot

Reviewed the full email OTP flow then added phone SMS OTP support via Twilio.

**Architecture:**
- Installed `twilio` npm package
- Created `lib/sms.ts` — Twilio client wrapper with `sendSMS()` and helper functions `normalizePhone()` (E.164) and `maskPhone()` (for display like +92***1234)
- All three OTP-sending routes (signup, login, resend-otp) now accept `otp_via: "email" | "phone"` and branch accordingly
- No schema changes needed — `phone` field already exists on User model

**UX flow:**
- Signup form: when user enters a phone number, Email/SMS toggle appears → chosen channel is sent to backend as `otp_via`
- Login form: defaults to email, passes `otp_via` (can be "phone" if user selects it)
- Verify page fully rewritten: shows which channel OTP was sent to, displays Email/SMS tab switcher (only if `has_phone=true` in URL), switching sends new OTP via chosen channel immediately, OTP input styled with large tracking for readability
- Resend button resends to current active channel

**Env vars needed:**
```
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

## Outcome

- ✅ Impact: Users can now choose to receive OTP via email or SMS on both signup and login
- 🧪 Tests: Manual — add Twilio creds, register with phone, verify SMS received
- 📁 Files: 8 files modified/created
- 🔁 Next prompts: Add Twilio credentials to .env to activate SMS
- 🧠 Reflection: Phone field already existed on User, so no schema migration needed; Twilio chosen for global coverage including Pakistan

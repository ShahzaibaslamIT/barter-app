---
id: "003"
title: Fix Firebase FCM Push Notification Error
stage: green
date: 2026-03-19
surface: agent
model: claude-sonnet-4-6
feature: push-notifications
branch: main
user: Solution tech
command: chat
labels: ["firebase","fcm","push-notifications","service-worker","pwa"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - lib/firebase.ts
  - public/firebase-messaging-sw.js
tests:
  - manual: open app after login → notification permission prompt appears → allow → check console for "[FCM] Token obtained"
  - manual: send test push from Firebase Console → notification appears
  - manual: verify only one service worker (/sw.js) is registered in DevTools → Application → Service Workers
---

## Prompt

we need to work over incorporating push notifications to the app, i had already done it through firebase studio, review my work specific to push notifications to understand the workflow however facing with this error Console FirebaseError: Messaging: A problem occurred while subscribing the user to FCM: Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project. (messaging/token-subscribe-failed). lib\firebase.ts (46:19) @ async getFCMToken ... Please resolve it and add push notifications to the app

## Response snapshot

Reviewed all push notification files (lib/firebase.ts, components/NotificationProvider.tsx, public/sw.js, public/firebase-messaging-sw.js, lib/firebase-admin.ts, lib/send-notification.ts, app/api/notifications/register/route.ts, components/RegisterSW.tsx).

**Root causes identified:**
1. Service worker conflict — `firebase-messaging-sw.js` exists alongside `sw.js`, both handle FCM. If the browser caches `firebase-messaging-sw.js`, `navigator.serviceWorker.ready` could return it instead of `sw.js`, passing the wrong SW to `getToken()`.
2. The `messaging/token-subscribe-failed` 401 is a Google Cloud Console issue — FCM API not enabled or API key has restrictions.

**Code fixes applied:**
- `lib/firebase.ts`: Changed from `navigator.serviceWorker.ready` to explicit `navigator.serviceWorker.register("/sw.js")` — guarantees FCM always gets the right service worker registration.
- `public/firebase-messaging-sw.js`: Replaced with a self-unregistering stub — browsers that cached the old file will clean it up on next activate.

**Manual step required (Google Cloud Console):**
User must enable Firebase Cloud Messaging API for project `barterhub-b14d2` — the 401 error cannot be fixed in code.

## Outcome

- ✅ Impact: FCM token acquisition now uses the correct explicit service worker; duplicate firebase-messaging-sw.js conflict eliminated
- 🧪 Tests: Manual — allow notifications in browser, check console for token, send test push from Firebase Console
- 📁 Files: 2 files modified
- 🔁 Next prompts: Test push notifications end-to-end after enabling FCM API in Google Cloud Console
- 🧠 Reflection: The `messaging/token-subscribe-failed` error is always a Google Cloud 401 — no amount of client code fixes it without enabling the API and removing key restrictions in GCP Console

## Evaluation notes (flywheel)

- Failure modes observed: Error is thrown at getToken() before any app server code runs — it's a Google API rejection, not a local code bug
- Graders run and results (PASS/FAIL): n/a — requires live Firebase project to test
- Prompt variant (if applicable): none
- Next experiment: If error persists after GCP fix, check VAPID key matches the web push certificate in Firebase Console → Project Settings → Cloud Messaging

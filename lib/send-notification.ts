// lib/send-notification.ts
// Sends push notifications via OneSignal REST API.
// Targets users by their stored OneSignal subscription IDs (include_player_ids).

import { prisma } from "@/lib/prisma";

interface NotificationPayload {
  userId: number | number[];
  title: string;
  body: string;
  url?: string;
  data?: Record<string, string>;
}

export async function sendPushNotification({
  userId,
  title,
  body,
  url,
  data = {},
}: NotificationPayload): Promise<{ success: boolean }> {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !apiKey) {
    console.warn("[OneSignal] Missing env vars — skipping push");
    return { success: false };
  }

  const userIds = Array.isArray(userId) ? userId : [userId];

  // Look up stored OneSignal subscription IDs for these users
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { user_id: { in: userIds } },
    select: { token: true },
  });

  if (subscriptions.length === 0) {
    console.log(`[OneSignal] No subscriptions found for user(s) ${userIds}`);
    return { success: false };
  }

  const playerIds = subscriptions.map((s) => s.token);
  const targetUrl = url || "/home";

  const res = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${apiKey}`,
    },
    body: JSON.stringify({
      app_id: appId,
      include_player_ids: playerIds,
      headings: { en: title },
      contents: { en: body },
      url: targetUrl,
      web_url: targetUrl,
      chrome_web_icon: "/web-app-manifest-192x192.png",
      chrome_web_badge: "/favicon-96x96.png",
      data: { url: targetUrl, ...data },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[OneSignal] Send failed:", err);
    return { success: false };
  }

  const result = await res.json();
  console.log(`[OneSignal] Sent — recipients: ${result.recipients ?? 0}, playerIds: ${playerIds}`);
  return { success: true };
}

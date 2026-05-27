"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import OneSignal from "react-onesignal";

let initDone = false;

function getDeviceType(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  return "web";
}

export default function NotificationProvider() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (status !== "authenticated") return;

    const userId = (session?.user as any)?.user_id;
    if (!userId) return;

    // Skip OneSignal on localhost — it only works on the production domain
    if (window.location.hostname === "localhost") return;

    const setup = async () => {
      // Init once per page load
      if (!initDone) {
        initDone = true;
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
          serviceWorkerPath: "OneSignalSDKWorker.js",
          serviceWorkerParam: { scope: "/" },
          notifyButton: { enable: false },
          allowLocalhostAsSecureOrigin: true,
        });
      }

      // Ask for permission
      const granted = await OneSignal.Notifications.requestPermission();
      if (!granted) {
        console.log("[OneSignal] Permission denied");
        return;
      }

      // Wait for the subscription ID to become available (up to 5s)
      let subscriptionId: string | null | undefined;
      for (let i = 0; i < 10; i++) {
        subscriptionId = OneSignal.User?.PushSubscription?.id;
        if (subscriptionId) break;
        await new Promise((r) => setTimeout(r, 500));
      }

      if (!subscriptionId) {
        console.warn("[OneSignal] No subscription ID after waiting");
        return;
      }

      console.log("[OneSignal] Subscription ID:", subscriptionId);

      // Save to our DB so server can target this device by user_id
      const res = await fetch("/api/notifications/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: subscriptionId,
          device: getDeviceType(),
        }),
      });

      if (res.ok) {
        console.log("[OneSignal] Token registered for user", userId, "✅");
      } else {
        console.error("[OneSignal] Register failed:", await res.text());
      }
    };

    setup().catch((err) => console.error("[OneSignal] Setup error:", err));
  }, [status, session]);

  return null;
}

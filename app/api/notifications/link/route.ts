// app/api/notifications/link/route.ts
// Called by the client after OneSignal init to reliably set the external user ID
// via the OneSignal REST API (server-side), bypassing SDK timing issues.

import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { onesignalId } = await req.json();
  if (!onesignalId) {
    return NextResponse.json({ error: "Missing onesignalId" }, { status: 400 });
  }

  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !apiKey) {
    return NextResponse.json({ error: "OneSignal not configured" }, { status: 500 });
  }

  // Use OneSignal Identity API to set external_id for this device
  const res = await fetch(
    `https://api.onesignal.com/apps/${appId}/users/by/onesignal_id/${onesignalId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${apiKey}`,
      },
      body: JSON.stringify({
        identity: {
          external_id: String(user.user_id),
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("[OneSignal] Link external_id failed:", err);
    return NextResponse.json({ error: "Failed to link user" }, { status: 500 });
  }

  console.log(`[OneSignal] Linked onesignalId ${onesignalId} → user_id ${user.user_id}`);
  return NextResponse.json({ success: true });
}

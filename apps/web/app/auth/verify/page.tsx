"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@barter/ui";
import { Input } from "@barter/ui";

export default function VerifyPage() {
  const params = useSearchParams();
  const router = useRouter();

  const email = params.get("email") || "";
  const phoneHint = params.get("phone_hint") || "";
  const hasPhone = params.get("has_phone") === "true";
  const initialVia = (params.get("via") as "email" | "phone" | "whatsapp") || "email";

  const [otp, setOtp] = useState("");
  const [via, setVia] = useState<"email" | "phone" | "whatsapp">(initialVia);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) setMessage("Invalid verification request. Email missing.");
  }, [email]);

  const handleVerify = async () => {
    if (!otp || !email) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, via }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "OTP verification failed");
        return;
      }

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      await signIn("credentials", { email: data.user.email, redirect: false });

      setSuccess(true);
      setMessage("Verification successful! Logging you in...");

      const needsProfile = !data.user?.city && (!data.user?.latitude || !data.user?.longitude);
      const needsTerms = !data.user?.terms_accepted;
      setTimeout(() => {
        router.replace(
          needsProfile ? "/complete-profile" : needsTerms ? "/accept-terms" : "/home"
        );
      }, 600);
    } catch {
      setMessage("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchChannel = async (newVia: "email" | "phone" | "whatsapp") => {
    if (!email || switching) return;
    setSwitching(true);
    setMessage(null);
    setOtp("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, via: newVia }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to send OTP");
        return;
      }

      setVia(newVia);
      setMessage(
        newVia === "phone"
          ? `Code sent to ${data.phone_hint || phoneHint}`
          : `Code sent to ${email}`
      );
    } catch {
      setMessage("Could not send code. Try again.");
    } finally {
      setSwitching(false);
    }
  };

  const resendOtp = () => switchChannel(via);

  // ── Label showing where OTP was sent ──────────────────────
  const sentToLabel =
    via === "whatsapp"
      ? `Code sent to WhatsApp (${phoneHint || "your phone"})`
      : via === "phone"
        ? `Code sent to ${phoneHint || "your phone"}`
        : `Code sent to ${email}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Enter Verification Code</h1>
          <p className="text-sm text-muted-foreground">{sentToLabel}</p>
        </div>

        {/* Channel switch — shown only if user has a phone */}
        {hasPhone && (
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            <button
              type="button"
              disabled={switching}
              onClick={() => via !== "email" && switchChannel("email")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                via === "email"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              disabled={switching}
              onClick={() => via !== "phone" && switchChannel("phone")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                via === "phone"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              SMS
            </button>
            <button
              type="button"
              disabled={switching}
              onClick={() => via !== "whatsapp" && switchChannel("whatsapp")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                via === "whatsapp"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              WhatsApp
            </button>
          </div>
        )}

        {/* OTP Input — 6 boxes */}
        <div className="space-y-3">
          <Input
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            inputMode="numeric"
            autoFocus
            className="text-center text-2xl tracking-[0.5em] font-bold h-14"
          />

          {message && (
            <p
              className={`text-center text-sm font-medium ${
                success ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        {/* Verify button */}
        <Button
          className="w-full h-12 text-base"
          disabled={loading || otp.length !== 6}
          onClick={handleVerify}
        >
          {loading ? "Verifying…" : "Verify"}
        </Button>

        {/* Resend */}
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-primary hover:underline disabled:opacity-50"
            disabled={loading || switching}
            onClick={resendOtp}
          >
            {switching ? "Sending…" : "Didn't receive it? Resend code"}
          </button>
        </div>

      </div>
    </div>
  );
}

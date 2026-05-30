"use client";

import { useState } from "react";
import { Input } from "@barter/ui";
import { Label } from "@barter/ui";
import { Button } from "@barter/ui";
import { useToast } from "@barter/ui";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to send OTP.",
        });
        return;
      }

      toast({
        title: "OTP Sent",
        description: "Check your email for the OTP.",
      });

      // Redirect to reset password screen
      setTimeout(() => {
        router.push(`/auth/reset?email=${encodeURIComponent(email)}`);
      }, 600);
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h1>
      <p className="text-sm text-center mb-6">
        Enter your email and we will send you an OTP to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sending OTP..." : "Send OTP"}
        </Button>
      </form>
    </div>
  );
}

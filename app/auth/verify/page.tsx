// "use client"

// import { useEffect, useState } from "react"
// import { useSearchParams, useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"

// export default function VerifyPage() {
//   const params = useSearchParams()
//   const router = useRouter()

//   const email = params.get("email") || ""

//   const [otp, setOtp] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [message, setMessage] = useState<string | null>(null)

//   const handleVerify = async () => {
//     if (!otp) return

//     setLoading(true)
//     setMessage(null)

//     try {
//       const res = await fetch("/api/auth/verify-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp }),
//       })

//       const data = await res.json()

//       if (!res.ok) {
//         setMessage(data.error || "OTP verification failed")
//         return
//       }

//       setMessage("Success! Redirecting...")

//       setTimeout(() => {
//         router.push("/auth") // go to login page
//       }, 1500)
//     } catch (err) {
//       setMessage("Something went wrong. Try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <div className="w-full max-w-md space-y-6">
//         <h1 className="text-2xl font-bold text-center">Verify Your Email</h1>
//         <p className="text-center text-muted-foreground">
//           A verification code was sent to:
//           <br />
//           <strong>{email}</strong>
//         </p>

//         <Input
//           placeholder="Enter OTP"
//           value={otp}
//           onChange={(e) => setOtp(e.target.value)}
//         />

//         {message && (
//           <p className="text-center text-sm font-medium text-red-600">
//             {message}
//           </p>
//         )}

//         <Button className="w-full" disabled={loading} onClick={handleVerify}>
//           {loading ? "Verifying..." : "Verify OTP"}
//         </Button>
//       </div>
//     </div>
//   )
// }


"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyPage() {
  const params = useSearchParams();
  const router = useRouter();

  const email = params.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      setMessage("Invalid verification request. Email missing.");
    }
  }, [email]);

  const handleVerify = async () => {
    if (!otp) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "OTP verification failed");
        return;
      }

      // SUCCESS → SAVE TOKEN + USER
      setSuccess(true);
      setMessage("Verification successful! Logging you in...");

      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        router.push("/home");
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!email) return;

    setLoading(true);
    setMessage("Resending OTP...");

    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to resend OTP");
        return;
      }

      setMessage("A new OTP has been sent.");
    } catch (err) {
      setMessage("Could not resend OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">Enter Your OTP</h1>

        <p className="text-center text-muted-foreground">
          A verification code was sent to:
          <br />
          <strong>{email}</strong>
        </p>

        <Input
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          autoFocus
        />

        {message && (
          <p
            className={`text-center text-sm font-medium ${
              success ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <Button className="w-full" disabled={loading} onClick={handleVerify}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

        <button
          className="w-full text-center text-blue-600 text-sm"
          disabled={loading}
          onClick={resendOtp}
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
}

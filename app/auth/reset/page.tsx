// "use client";

// import { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/use-toast";
// import { useRouter, useSearchParams } from "next/navigation";

// export default function ResetPasswordPage() {
//   const searchParams = useSearchParams();
//   const email = searchParams.get("email") || "";
//   const router = useRouter();
//   const { toast } = useToast();

//   const [otp, setOtp] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const res = await fetch("/api/auth/reset", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp, new_password: newPassword }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         toast({
//           title: "Error",
//           description: data.error || "Invalid OTP",
//         });
//         return;
//       }

//       toast({
//         title: "Password Reset",
//         description: "Your password has been updated.",
//       });

//       setTimeout(() => {
//         router.push("/auth"); // back to login page
//       }, 600);
//     } catch (err) {
//       toast({
//         title: "Error",
//         description: "Something went wrong",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow">
//       <h1 className="text-2xl font-semibold mb-4 text-center">Reset Password</h1>
//       <p className="text-sm text-center mb-6 text-gray-500">
//         OTP was sent to <strong>{email}</strong>
//       </p>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <Label>OTP</Label>
//           <Input
//             value={otp}
//             onChange={(e) => setOtp(e.target.value)}
//             required
//           />
//         </div>

//         <div>
//           <Label>New Password</Label>
//           <Input
//             type="password"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             required
//           />
//         </div>

//         <Button type="submit" disabled={loading} className="w-full">
//           {loading ? "Resetting..." : "Reset Password"}
//         </Button>
//       </form>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const router = useRouter();
  const { toast } = useToast();

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "Invalid OTP.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Password Reset",
        description: "Your password has been updated successfully.",
      });

      setTimeout(() => {
        router.push("/auth");
      }, 800);
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4 text-center">Reset Password</h1>
      <p className="text-sm text-center mb-6 text-gray-500">
        An OTP was sent to <strong>{email}</strong>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>OTP</Label>
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>New Password</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}



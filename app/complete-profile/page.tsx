// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// export default function CompleteProfilePage() {
//   const router = useRouter();

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [form, setForm] = useState({
//     country: "",
//     state_province: "",
//     city: "",
//     postal_code: "",
//     address_line1: "",
//     address_line2: "",
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     setError(null);

//     // 🔒 REQUIRED FIELDS
//     if (!form.country || !form.state_province || !form.city) {
//       setError("Country, state/province, and city are required.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch("/api/user/profile", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || "Failed to save profile.");
//         return;
//       }

//       // ✅ Profile completed → go to home
//       router.replace("/home");
//     } catch (err) {
//       console.error(err);
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <div className="w-full max-w-md space-y-6">
//         <h1 className="text-2xl font-bold text-center">
//           Complete Your Profile
//         </h1>

//         <p className="text-center text-muted-foreground text-sm">
//           We need your location to show nearby barter opportunities.
//         </p>

//         <div className="space-y-4">
//           <div>
//             <Label>Country *</Label>
//             <Input
//               name="country"
//               value={form.country}
//               onChange={handleChange}
//               placeholder="e.g. United States"
//             />
//           </div>

//           <div>
//             <Label>State / Province *</Label>
//             <Input
//               name="state_province"
//               value={form.state_province}
//               onChange={handleChange}
//               placeholder="e.g. Texas"
//             />
//           </div>

//           <div>
//             <Label>City *</Label>
//             <Input
//               name="city"
//               value={form.city}
//               onChange={handleChange}
//               placeholder="e.g. Austin"
//             />
//           </div>

//           <div>
//             <Label>Postal / ZIP Code</Label>
//             <Input
//               name="postal_code"
//               value={form.postal_code}
//               onChange={handleChange}
//               placeholder="Optional"
//             />
//           </div>

//           <div>
//             <Label>Address Line 1</Label>
//             <Input
//               name="address_line1"
//               value={form.address_line1}
//               onChange={handleChange}
//               placeholder="Street / Area / Landmark"
//             />
//           </div>

//           <div>
//             <Label>Address Line 2</Label>
//             <Input
//               name="address_line2"
//               value={form.address_line2}
//               onChange={handleChange}
//               placeholder="Apartment / Unit (optional)"
//             />
//           </div>
//         </div>

//         {error && (
//           <p className="text-center text-sm text-red-600 font-medium">
//             {error}
//           </p>
//         )}

//         <Button
//           className="w-full"
//           onClick={handleSubmit}
//           disabled={loading}
//         >
//           {loading ? "Saving..." : "Save & Continue"}
//         </Button>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CompleteProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    country: "",
    state_province: "",
    city: "",
    postal_code: "",
    address_line1: "",
    address_line2: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    setError(null);

    // 🔒 Required fields
    if (!form.country || !form.state_province || !form.city) {
      setError("Country, state/province, and city are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save profile.");
        return;
      }

      /**
       * ✅ CRITICAL FIX
       * We must force a full reload so NextAuth JWT is refreshed.
       * router.replace() will NOT update the session.
       */
      window.location.href = "/accept-terms";
    } catch (err) {
      console.error("[complete-profile] submit error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Complete Your Profile
        </h1>

        <p className="text-center text-muted-foreground text-sm">
          We need your location to show nearby barter opportunities.
        </p>

        <div className="space-y-4">
          <div>
            <Label>Country *</Label>
            <Input
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="e.g. United States"
            />
          </div>

          <div>
            <Label>State / Province *</Label>
            <Input
              name="state_province"
              value={form.state_province}
              onChange={handleChange}
              placeholder="e.g. California"
            />
          </div>

          <div>
            <Label>City *</Label>
            <Input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="e.g. San Francisco"
            />
          </div>

          <div>
            <Label>Postal / ZIP Code</Label>
            <Input
              name="postal_code"
              value={form.postal_code}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div>
            <Label>Address Line 1</Label>
            <Input
              name="address_line1"
              value={form.address_line1}
              onChange={handleChange}
              placeholder="Street / Area / Landmark"
            />
          </div>

          <div>
            <Label>Address Line 2</Label>
            <Input
              name="address_line2"
              value={form.address_line2}
              onChange={handleChange}
              placeholder="Apartment / Unit (optional)"
            />
          </div>
        </div>

        {error && (
          <p className="text-center text-sm text-red-600 font-medium">
            {error}
          </p>
        )}

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
}





// "use client";

// import type React from "react";
// import { useState } from "react";
// import { Button } from "@barter/ui";
// import { Input } from "@barter/ui";
// import { Label } from "@barter/ui";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@barter/ui";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@barter/ui";
// import { useToast } from "@barter/ui";

// interface AuthFormProps {
//   mode: "login" | "signup";
//   onSuccess: (user: any, token: string) => void;
// }

// export function AuthForm({ mode, onSuccess }: AuthFormProps) {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     name: "",
//     phone: "",
//     user_type: "both" as "service_provider" | "item_owner" | "both",
//     location_text: "",
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const { toast } = useToast();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setErrorMessage(null);

//     try {
//       const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
//       const body =
//         mode === "login"
//           ? { email: formData.email, password: formData.password }
//           : formData;

//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         if (response.status === 404) {
//           setErrorMessage("User not found. Please create an account first.");
//         } else if (response.status === 401) {
//           setErrorMessage("Invalid email or password.");
//         } else if (response.status === 403) {
//           setErrorMessage("This account uses Google Sign-In. Please use Google login.");
//         } else {
//           setErrorMessage(data.error || "Authentication failed.");
//         }
//         return;
//       }

//       toast({
//         title: mode === "login" ? "Welcome back!" : "Account created!",
//         description:
//           mode === "login"
//             ? "You have been logged in successfully."
//             : "Your account has been created successfully.",
//       });

//       onSuccess(data.user, data.token);
//     } catch (error) {
//       console.error("Auth Error:", error);
//       setErrorMessage("Something went wrong. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 👇 Google login handler (native Median + web fallback)
//   const handleGoogleLogin = () => {
//     const isMedianApp =
//       typeof window !== "undefined" && !!(window as any).Median;

//     if (isMedianApp && (window as any).Median.loginWithGoogle) {
//       console.log("🔹 Using native Median Google Login");
//       (window as any).Median.loginWithGoogle();
//     } else {
//       console.log("🌐 Using web NextAuth Google Login");
//       window.location.href = "/api/auth/google";
//     }
//   };

//   return (
//     <Card className="w-full max-w-md mx-auto">
//       <CardHeader className="text-center">
//         <CardTitle className="font-serif text-2xl">
//           {mode === "login" ? "Welcome Back" : "Join BarterHub"}
//         </CardTitle>
//         <CardDescription>
//           {mode === "login"
//             ? "Sign in to your account to continue trading"
//             : "Create your account to start trading with your community"}
//         </CardDescription>
//       </CardHeader>

//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {mode === "signup" && (
//             <>
//               <div className="space-y-2">
//                 <Label htmlFor="name">Full Name</Label>
//                 <Input
//                   id="name"
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) =>
//                     setFormData((prev) => ({ ...prev, name: e.target.value }))
//                   }
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="phone">Phone Number (Optional)</Label>
//                 <Input
//                   id="phone"
//                   type="tel"
//                   value={formData.phone}
//                   onChange={(e) =>
//                     setFormData((prev) => ({ ...prev, phone: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="user_type">I am a...</Label>
//                 <Select
//                   value={formData.user_type}
//                   onValueChange={(value: any) =>
//                     setFormData((prev) => ({ ...prev, user_type: value }))
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select role" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="both">Both (Items & Services)</SelectItem>
//                     <SelectItem value="item_owner">Item Owner</SelectItem>
//                     <SelectItem value="service_provider">
//                       Service Provider
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="location">Location</Label>
//                 <Input
//                   id="location"
//                   type="text"
//                   placeholder="City, State"
//                   value={formData.location_text}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       location_text: e.target.value,
//                     }))
//                   }
//                 />
//               </div>
//             </>
//           )}

//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               type="email"
//               value={formData.email}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, email: e.target.value }))
//               }
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="password">Password</Label>
//             <Input
//               id="password"
//               type="password"
//               value={formData.password}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, password: e.target.value }))
//               }
//               required
//             />
//           </div>

//           {/* 🚨 Red Error Message Below Submit Button */}
//           {errorMessage && (
//             <p className="text-red-600 text-sm text-center font-medium">
//               {errorMessage}
//             </p>
//           )}

//           <Button type="submit" className="w-full" disabled={isLoading}>
//             {isLoading
//               ? "Please wait..."
//               : mode === "login"
//               ? "Sign In"
//               : "Create Account"}
//           </Button>
//         </form>

//         {/* 🌐 Divider + Google Sign-In
//         <div className="mt-6 flex flex-col items-center space-y-3">
//           <div className="text-gray-500 text-sm">or</div>

//           <Button
//             type="button"
//             variant="outline"
//             className="flex items-center gap-2"
//             onClick={handleGoogleLogin}
//           >
//             <img
//               src="/google-icon.svg"
//               alt="Google"
//               className="w-5 h-5"
//             />
//             Continue with Google
//           </Button>
//         </div> */}
//       </CardContent>
//     </Card>
//   );
// }


// "use client";

// import type React from "react";
// import { useState } from "react";
// import { Button } from "@barter/ui";
// import { Input } from "@barter/ui";
// import { Label } from "@barter/ui";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@barter/ui";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@barter/ui";
// import { useToast } from "@barter/ui";
// import { useRouter } from "next/navigation";

// interface AuthFormProps {
//   mode: "login" | "signup";
//   onSuccess: (user: any, token: string) => void;
// }

// export function AuthForm({ mode, onSuccess }: AuthFormProps) {
//   const router = useRouter();
//   const { toast } = useToast();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     name: "",
//     phone: "",
//     user_type: "both" as "service_provider" | "item_owner" | "both",
//     location_text: "",
//   });

//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [showPassword, setShowPassword] = useState(false);


//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setErrorMessage(null);

//     try {
//       const endpoint =
//         mode === "login" ? "/api/auth/login" : "/api/auth/signup";

//       const body =
//         mode === "login"
//           ? { email: formData.email, password: formData.password }
//           : formData;

//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setErrorMessage(data.error || "Authentication failed.");
//         return;
//       }


// // SIGNUP FLOW
// if (mode === "signup") {
//   toast({
//     title: "Account Created Successfully",
//     description: data.message || "Please verify your email.",
//   });

//   // Delay redirect so toast actually appears
//   setTimeout(() => {
//     router.push(`/auth/verify?email=${encodeURIComponent(data.email)}`);
//   }, 600);

//   return;
// }



//       // LOGIN FLOW
//       if (mode === "login") {
//         onSuccess(data.user, data.token);
//         return;
//       }
//     } catch (error) {
//       console.error("Auth Error:", error);
//       setErrorMessage("Something went wrong. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Card className="w-full max-w-md mx-auto">
//       <CardHeader className="text-center">
//         <CardTitle className="font-serif text-2xl">
//           {mode === "login" ? "Welcome Back" : "Join BarterHub"}
//         </CardTitle>
//         <CardDescription>
//           {mode === "login"
//             ? "Sign in to continue trading."
//             : "Create your account to get started."}
//         </CardDescription>
//       </CardHeader>

//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {mode === "signup" && (
//             <>
//               <div className="space-y-2">
//                 <Label>Full Name</Label>
//                 <Input
//                   value={formData.name}
//                   onChange={(e) =>
//                     setFormData((p) => ({ ...p, name: e.target.value }))
//                   }
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>Phone (Optional)</Label>
//                 <Input
//                   value={formData.phone}
//                   onChange={(e) =>
//                     setFormData((p) => ({ ...p, phone: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>I am a...</Label>
//                 <Select
//                   value={formData.user_type}
//                   onValueChange={(v) =>
//   setFormData((p) => ({
//     ...p,
//     user_type: v as "both" | "service_provider" | "item_owner"
//   }))
// }

//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="both">Both</SelectItem>
//                     <SelectItem value="item_owner">Item Owner</SelectItem>
//                     <SelectItem value="service_provider">
//                       Service Provider
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label>Location</Label>
//                 <Input
//                   value={formData.location_text}
//                   onChange={(e) =>
//                     setFormData((p) => ({
//                       ...p,
//                       location_text: e.target.value,
//                     }))
//                   }
//                 />
//               </div>
//             </>
//           )}

//           <div className="space-y-2">
//             <Label>Email</Label>
//             <Input
//               type="email"
//               value={formData.email}
//               onChange={(e) =>
//                 setFormData((p) => ({ ...p, email: e.target.value }))
//               }
//               required
//             />
//           </div>

          

//          <div className="space-y-2">
//   <Label>Password</Label>

//   <div className="relative">
//     <Input
//       type={showPassword ? "text" : "password"}
//       value={formData.password}
//       onChange={(e) =>
//         setFormData((p) => ({ ...p, password: e.target.value }))
//       }
//       required
//       className="pr-10"
//     />

//     <button
//       type="button"
//       onClick={() => setShowPassword((prev) => !prev)}
//       className="absolute right-3 top-2 text-gray-500"
//     >
//       {showPassword ? "👁️" : "👁️"}
//     </button>
//   </div>
// </div>

//           {errorMessage && (
//             <p className="text-red-600 text-center">{errorMessage}</p>
//           )}

         
//           <Button className="w-full" disabled={isLoading}>
//             {isLoading
//               ? "Please wait..."
//               : mode === "login"
//               ? "Sign In"
//               : "Create Account"}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }


// "use client";

// import type React from "react";
// import { useState } from "react";
// import { Button } from "@barter/ui";
// import { Input } from "@barter/ui";
// import { Label } from "@barter/ui";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@barter/ui";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@barter/ui";
// import { useToast } from "@barter/ui";
// import { useRouter } from "next/navigation";

// interface AuthFormProps {
//   mode: "login" | "signup";
//   onSuccess: (user: any, token: string) => void;
// }

// export function AuthForm({ mode, onSuccess }: AuthFormProps) {
//   const router = useRouter();
//   const { toast } = useToast();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     name: "",
//     phone: "",
//     user_type: "both" as "service_provider" | "item_owner" | "both",
//     location_text: "",
//   });

//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   // 👁️ Show/Hide password toggle
//   const [showPassword, setShowPassword] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setErrorMessage(null);

//     try {
//       const endpoint =
//         mode === "login" ? "/api/auth/login" : "/api/auth/signup";

//       const body =
//         mode === "login"
//           ? { email: formData.email, password: formData.password }
//           : formData;

//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setErrorMessage(data.error || "Authentication failed.");
//         return;
//       }

//       // SIGNUP FLOW
//       if (mode === "signup") {
//         toast({
//           title: "Account Created Successfully",
//           description: data.message || "Please verify your email.",
//         });

//         // Delay redirect so toast actually appears
//         setTimeout(() => {
//           router.push(`/auth/verify?email=${encodeURIComponent(data.email)}`);
//         }, 600);

//         return;
//       }

//       // LOGIN FLOW
//       if (mode === "login") {
//         onSuccess(data.user, data.token);
//         return;
//       }
//     } catch (error) {
//       console.error("Auth Error:", error);
//       setErrorMessage("Something went wrong. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Card className="w-full max-w-md mx-auto">
//       <CardHeader className="text-center">
//         <CardTitle className="font-serif text-2xl">
//           {mode === "login" ? "Welcome Back" : "Join BarterHub"}
//         </CardTitle>
//         <CardDescription>
//           {mode === "login"
//             ? "Sign in to continue trading."
//             : "Create your account to get started."}
//         </CardDescription>
//       </CardHeader>

//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {mode === "signup" && (
//             <>
//               <div className="space-y-2">
//                 <Label>Full Name</Label>
//                 <Input
//                   value={formData.name}
//                   onChange={(e) =>
//                     setFormData((p) => ({ ...p, name: e.target.value }))
//                   }
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>Phone (Optional)</Label>
//                 <Input
//                   value={formData.phone}
//                   onChange={(e) =>
//                     setFormData((p) => ({ ...p, phone: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>I am a...</Label>
//                 <Select
//                   value={formData.user_type}
//                   onValueChange={(v) =>
//                     setFormData((p) => ({
//                       ...p,
//                       user_type: v as
//                         | "both"
//                         | "service_provider"
//                         | "item_owner",
//                     }))
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="both">Both</SelectItem>
//                     <SelectItem value="item_owner">Item Owner</SelectItem>
//                     <SelectItem value="service_provider">
//                       Service Provider
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-2">
//                 <Label>Location</Label>
//                 <Input
//                   value={formData.location_text}
//                   onChange={(e) =>
//                     setFormData((p) => ({
//                       ...p,
//                       location_text: e.target.value,
//                     }))
//                   }
//                 />
//               </div>
//             </>
//           )}

//           <div className="space-y-2">
//             <Label>Email</Label>
//             <Input
//               type="email"
//               value={formData.email}
//               onChange={(e) =>
//                 setFormData((p) => ({ ...p, email: e.target.value }))
//               }
//               required
//             />
//           </div>

//           {/* PASSWORD FIELD WITH TOGGLE + FORGOT PASSWORD */}
//           <div className="space-y-2">
//             <Label>Password</Label>

//             <div className="relative">
//               <Input
//                 type={showPassword ? "text" : "password"}
//                 value={formData.password}
//                 onChange={(e) =>
//                   setFormData((p) => ({ ...p, password: e.target.value }))
//                 }
//                 required
//                 className="pr-10"
//               />

//               <button
//                 type="button"
//                 onClick={() => setShowPassword((prev) => !prev)}
//                 className="absolute right-3 top-2 text-gray-500"
//               >
//                 {showPassword ? (
//                   // Eye-Off SVG
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="20"
//                     height="20"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 
//                              0-11-8-11-8a21.77 21.77 0 0 1 
//                              5.06-6.95" />
//                     <path d="M1 1l22 22" />
//                     <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 
//                              2.12-.88" />
//                     <path d="M16.24 7.76A9.52 9.52 0 0 1 23 12s-4 
//                              8-11 8a10.94 10.94 0 0 1-4.24-.94" />
//                   </svg>
//                 ) : (
//                   // Eye SVG
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="20"
//                     height="20"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M1 12s4-8 11-8 11 8 11 8-4 
//                              8-11 8-11-8-11-8z" />
//                     <circle cx="12" cy="12" r="3" />
//                   </svg>
//                 )}
//               </button>
//             </div>

//             {mode === "login" && (
//               <p
//                 className="text-sm text-black-600  cursor-pointer mt-1"
//                 onClick={() => router.push("/auth/forgot")}
//               >
//                 Forgot Password?
//               </p>
//             )}
//           </div>

//           {errorMessage && (
//             <p className="text-red-600 text-center">{errorMessage}</p>
//           )}

//           <Button className="w-full" disabled={isLoading}>
//             {isLoading
//               ? "Please wait..."
//               : mode === "login"
//               ? "Sign In"
//               : "Create Account"}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }



"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@barter/ui";
import { Input } from "@barter/ui";
import { Label } from "@barter/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@barter/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@barter/ui";
import { useToast } from "@barter/ui";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  mode: "login" | "signup";
}


export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    user_type: "both" as "service_provider" | "item_owner" | "both",
    location_text: "",
  });

  const [otpVia, setOtpVia] = useState<"email" | "phone" | "whatsapp">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/signup";

      const body =
        mode === "login"
          ? { email: formData.email, password: formData.password, otp_via: otpVia }
          : { ...formData, otp_via: otpVia };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Authentication failed.");
        return;
      }

      const verifyParams = new URLSearchParams({
        email: data.email,
        via: data.otp_sent_via || "email",
        ...(data.has_phone && data.phone_hint ? { phone_hint: data.phone_hint } : {}),
        ...(data.has_phone ? { has_phone: "true" } : {}),
      });

      // SIGNUP FLOW
      if (mode === "signup") {
        toast({
          title: "Account Created",
          description: data.message || "Please verify your account.",
        });
        setTimeout(() => {
          router.push(`/auth/verify?${verifyParams.toString()}`);
        }, 600);
        return;
      }

      // LOGIN FLOW
      if (mode === "login") {
        toast({
          title: "OTP Sent",
          description: data.message || "Please check for the verification code.",
        });
        router.push(`/auth/verify?${verifyParams.toString()}`);
        return;
      }
    } catch (error) {
      console.error("Auth Error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="font-serif text-2xl">
          {mode === "login" ? "Welcome Back" : "Join BarterHub"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Sign in to continue trading."
            : "Create your account to get started."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, phone: e.target.value }));
                    if (!e.target.value) setOtpVia("email");
                  }}
                />
              </div>

              {/* OTP channel selector — shown only when phone is entered */}
              {formData.phone.trim() && (
                <div className="space-y-2">
                  <Label>Send verification code via</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpVia("email")}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        otpVia === "email"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpVia("phone")}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        otpVia === "phone"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpVia("whatsapp")}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        otpVia === "whatsapp"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>I am a...</Label>
                <Select
                  value={formData.user_type}
                  onValueChange={(v) =>
                    setFormData((p) => ({
                      ...p,
                      user_type: v as
                        | "both"
                        | "service_provider"
                        | "item_owner",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="item_owner">Item Owner</SelectItem>
                    <SelectItem value="service_provider">
                      Service Provider
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.location_text}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      location_text: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((p) => ({ ...p, email: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, password: e.target.value }))
                }
                required
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2 text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {mode === "login" && (
              <p
                className="text-sm text-black-600 cursor-pointer mt-1"
                onClick={() => router.push("/auth/forgot")}
              >
                Forgot Password?
              </p>
            )}
          </div>

          {errorMessage && (
            <p className="text-red-600 text-center">{errorMessage}</p>
          )}

          <Button className="w-full" disabled={isLoading}>
            {isLoading
              ? "Please wait..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

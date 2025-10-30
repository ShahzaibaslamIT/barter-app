// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { useToast } from "@/hooks/use-toast"

// interface AuthFormProps {
//   mode: "login" | "signup"
//   onSuccess: (user: any, token: string) => void
// }

// export function AuthForm({ mode, onSuccess }: AuthFormProps) {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     name: "",
//     phone: "",
//     user_type: "both" as "service_provider" | "item_owner" | "both",
//     location_text: "",
//   })
//   const [isLoading, setIsLoading] = useState(false)
//   const { toast } = useToast()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)

//     try {
//       const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup"
//       const body = mode === "login" ? { email: formData.email, password: formData.password } : formData

//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.error || "Authentication failed")
//       }

//       toast({
//         title: mode === "login" ? "Welcome back!" : "Account created!",
//         description:
//           mode === "login" ? "You have been logged in successfully." : "Your account has been created successfully.",
//       })

//       onSuccess(data.user, data.token)
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Something went wrong",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Card className="w-full max-w-md mx-auto">
//       <CardHeader className="text-center">
//         <CardTitle className="font-serif text-2xl">{mode === "login" ? "Welcome Back" : "Join BarterHub"}</CardTitle>
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
//                   onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="phone">Phone Number (Optional)</Label>
//                 <Input
//                   id="phone"
//                   type="tel"
//                   value={formData.phone}
//                   onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="user_type">I am a...</Label>
//                 <Select
//                   value={formData.user_type}
//                   onValueChange={(value: any) => setFormData((prev) => ({ ...prev, user_type: value }))}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="both">Both (Items & Services)</SelectItem>
//                     <SelectItem value="item_owner">Item Owner</SelectItem>
//                     <SelectItem value="service_provider">Service Provider</SelectItem>
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
//                   onChange={(e) => setFormData((prev) => ({ ...prev, location_text: e.target.value }))}
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
//               onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="password">Password</Label>
//             <Input
//               id="password"
//               type="password"
//               value={formData.password}
//               onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
//               required
//             />
//           </div>

//           <Button type="submit" className="w-full" disabled={isLoading}>
//             {isLoading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }


// "use client"

// import type React from "react"
// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { useToast } from "@/hooks/use-toast"
// // import { AuthButtons } from "./AuthButtons"   // ✅ import

// interface AuthFormProps {
//   mode: "login" | "signup"
//   onSuccess: (user: any, token: string) => void
// }

// export function AuthForm({ mode, onSuccess }: AuthFormProps) {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     name: "",
//     phone: "",
//     user_type: "both" as "service_provider" | "item_owner" | "both",
//     location_text: "",
//   })
//   const [isLoading, setIsLoading] = useState(false)
//   const { toast } = useToast()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)

//     try {
//       const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup"
//       const body = mode === "login" ? { email: formData.email, password: formData.password } : formData

//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       })

//       const data = await response.json()
//       if (!response.ok) throw new Error(data.error || "Authentication failed")

//       toast({
//         title: mode === "login" ? "Welcome back!" : "Account created!",
//         description:
//           mode === "login"
//             ? "You have been logged in successfully."
//             : "Your account has been created successfully.",
//       })

//       onSuccess(data.user, data.token)
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Something went wrong",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

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
//                   onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="phone">Phone Number (Optional)</Label>
//                 <Input
//                   id="phone"
//                   type="tel"
//                   value={formData.phone}
//                   onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="user_type">I am a...</Label>
//                 <Select
//                   value={formData.user_type}
//                   onValueChange={(value: any) => setFormData((prev) => ({ ...prev, user_type: value }))}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="both">Both (Items & Services)</SelectItem>
//                     <SelectItem value="item_owner">Item Owner</SelectItem>
//                     <SelectItem value="service_provider">Service Provider</SelectItem>
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
//                   onChange={(e) => setFormData((prev) => ({ ...prev, location_text: e.target.value }))}
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
//               onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="password">Password</Label>
//             <Input
//               id="password"
//               type="password"
//               value={formData.password}
//               onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
//               required
//             />
//           </div>

//           <Button type="submit" className="w-full" disabled={isLoading}>
//             {isLoading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
//           </Button>
//         </form>

//         {/* Divider + Google Button */}
//         <div className="mt-6 text-center space-y-2">
//           {/* <p className="text-xs text-muted-foreground">or continue with</p> */}
//           {/* <AuthButtons /> */}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  mode: "login" | "signup";
  onSuccess: (user: any, token: string) => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    user_type: "both" as "service_provider" | "item_owner" | "both",
    location_text: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body =
        mode === "login"
          ? { email: formData.email, password: formData.password }
          : formData;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        // 🧠 Specific backend messages
        if (response.status === 404) {
          setErrorMessage("User not found. Please create an account first.");
        } else if (response.status === 401) {
          setErrorMessage("Invalid email or password.");
        } else if (response.status === 403) {
          setErrorMessage("This account uses Google Sign-In. Please use Google login.");
        } else {
          setErrorMessage(data.error || "Authentication failed.");
        }
        return;
      }

      // ✅ Success
      toast({
        title: mode === "login" ? "Welcome back!" : "Account created!",
        description:
          mode === "login"
            ? "You have been logged in successfully."
            : "Your account has been created successfully.",
      });

      onSuccess(data.user, data.token);
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
            ? "Sign in to your account to continue trading"
            : "Create your account to start trading with your community"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_type">I am a...</Label>
                <Select
                  value={formData.user_type}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, user_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both (Items & Services)</SelectItem>
                    <SelectItem value="item_owner">Item Owner</SelectItem>
                    <SelectItem value="service_provider">
                      Service Provider
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="City, State"
                  value={formData.location_text}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location_text: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />
          </div>

          {/* 🚨 Red Error Message Below Submit Button */}
          {errorMessage && (
            <p className="text-red-600 text-sm text-center font-medium">
              {errorMessage}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
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

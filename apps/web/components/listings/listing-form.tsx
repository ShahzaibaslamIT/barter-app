// "use client";

// import React, { useEffect, useState } from "react";
// import { Button } from "@barter/ui";
// import { Input } from "@barter/ui";
// import { Label } from "@barter/ui";
// import { Textarea } from "@barter/ui";
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
// import {
//   Upload,
//   X,
//   Package,
//   Wrench,
//   DollarSign,
//   CalendarDays,
// } from "lucide-react";
// import { LocationPicker } from "@/components/location/location-picker";

// interface ListingFormProps {
//   type: "item" | "service";
//   onSuccess?: () => void;
// }

// const ITEM_CATEGORIES = [
//   "Electronics",
//   "Furniture",
//   "Appliances",
//   "Tools",
//   "Books",
//   "Clothing",
//   "Sports Equipment",
//   "Musical Instruments",
//   "Art & Crafts",
//   "Other",
// ];

// const SERVICE_CATEGORIES = [
//   "Moving Help",
//   "Tutoring",
//   "Cleaning",
//   "Handyman",
//   "Pet Care",
//   "Gardening",
//   "Photography",
//   "Web Design",
//   "Writing",
//   "Other",
// ];

// export function ListingForm({ type, onSuccess }: ListingFormProps) {
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     category: "",
//     location_text: "",
//     barter_request: "",
//     photos: [] as string[],
//     condition: type === "item" ? "good" : undefined,
//     availability: type === "service" ? "" : undefined,
//     skill_level: type === "service" ? "unskilled" : undefined,
//   });
//   const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [settings, setSettings] = useState<{ fee_usd: number; expiry_days: number } | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();

//   const categories = type === "item" ? ITEM_CATEGORIES : SERVICE_CATEGORIES;

//   // ✅ Fetch listing fee and expiry settings
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch("/api/settings");
//         const data = await res.json();
//         if (res.ok && data?.settings) {
//           setSettings({
//             fee_usd: parseFloat(data.settings.listing_fee_usd || "0.99"),
//             expiry_days: data.settings.listing_expiry_days || 30,
//           });
//         } else {
//           setSettings({ fee_usd: 0.99, expiry_days: 30 });
//         }
//       } catch {
//         setSettings({ fee_usd: 0.99, expiry_days: 30 });
//       }
//     })();
//   }, []);

//   // ✅ Handle submit
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const token = localStorage.getItem("auth_token");

//       const payload = {
//         type,
//         ...formData,
//         latitude: locationCoords?.latitude,
//         longitude: locationCoords?.longitude,
//       };

//       const response = await fetch("/api/listings", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || "Failed to create listing");

//       toast({
//         title: "Success!",
//         description: `Your ${type} listing has been created successfully.`,
//       });

//       // Reset form
//       setFormData({
//         title: "",
//         description: "",
//         category: "",
//         location_text: "",
//         barter_request: "",
//         photos: [],
//         condition: type === "item" ? "good" : undefined,
//         availability: type === "service" ? "" : undefined,
//         skill_level: type === "service" ? "unskilled" : undefined,
//       });
//       setLocationCoords(null);

//       onSuccess?.();
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Something went wrong",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ✅ Handle location
//   const handleLocationSelect = (loc: { latitude: number; longitude: number; name: string }) => {
//     setLocationCoords({ latitude: loc.latitude, longitude: loc.longitude });
//     setFormData((p) => ({ ...p, location_text: loc.name }));
//   };

//   // ✅ Photo upload
//   const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     if (!files.length) return;

//     try {
//       const fd = new FormData();
//       files.forEach((f) => fd.append("files", f));
//       const res = await fetch("/api/upload", { method: "POST", body: fd });
//       const data = await res.json();
//       if (res.ok && data.urls) {
//         setFormData((p) => ({
//           ...p,
//           photos: [...p.photos, ...data.urls].slice(0, 5),
//         }));
//       } else {
//         alert("Failed to upload images: " + (data.error || "Unknown error"));
//       }
//     } catch (err) {
//       console.error("Upload failed", err);
//       alert("Upload failed");
//     }
//   };

//   const removePhoto = (index: number) => {
//     setFormData((p) => ({
//       ...p,
//       photos: p.photos.filter((_, i) => i !== index),
//     }));
//   };

//   return (
//     <Card className="w-full max-w-2xl mx-auto bg-card shadow-sm border rounded-2xl">
//       <CardHeader className="text-center space-y-1">
//         <div className="flex justify-center items-center gap-2">
//           {type === "item" ? (
//             <Package className="h-6 w-6 text-primary" />
//           ) : (
//             <Wrench className="h-6 w-6 text-primary" />
//           )}
//           <CardTitle className="font-serif text-2xl font-bold">
//             {type === "item" ? "Post an Item" : "Post a Service"}
//           </CardTitle>
//         </div>
//         <CardDescription>
//           {type === "item"
//             ? "List an item you'd like to trade for services"
//             : "Offer your services in exchange for items"}
//         </CardDescription>
//       </CardHeader>

//       <CardContent className="space-y-6">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Title */}
//           <div className="space-y-2">
//             <Label htmlFor="title" className="text-sm font-medium">
//               {type === "item" ? "Item Name" : "Service Title"}{" "}
//               <span className="text-destructive">*</span>
//             </Label>
//             <Input
//               id="title"
//               value={formData.title}
//               onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
//               placeholder={
//                 type === "item"
//                   ? "e.g., MacBook Pro 2020"
//                   : "e.g., Professional Tutoring Available"
//               }
//               required
//             />
//           </div>

//           {/* Category */}
//           <div className="space-y-2">
//             <Label htmlFor="category">
//               Category <span className="text-destructive">*</span>
//             </Label>
//             <Select
//               value={formData.category}
//               onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select category" />
//               </SelectTrigger>
//               <SelectContent>
//                 {categories.map((c) => (
//                   <SelectItem key={c} value={c.toLowerCase().replace(/\s+/g, "_")}>
//                     {c}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Description */}
//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               rows={4}
//               value={formData.description}
//               onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
//               placeholder={
//                 type === "item"
//                   ? "Describe your item's condition, features, and key details..."
//                   : "Describe your service, skills, and availability..."
//               }
//             />
//           </div>

//           {/* Location */}
//           <LocationPicker
//             onLocationSelect={handleLocationSelect}
//             initialLocation={
//               locationCoords && formData.location_text
//                 ? { ...locationCoords, name: formData.location_text }
//                 : undefined
//             }
//           />

//           {/* Listing Fee & Expiry */}
//           {settings && (
//             <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border border-border/50 rounded-xl p-4 bg-muted/40">
//               <div className="flex items-center gap-2">
//                 <DollarSign className="h-5 w-5 text-green-600" />
//                 <div>
//                   <p className="text-sm font-medium text-foreground">Listing Fee</p>
//                   <p className="text-muted-foreground text-sm">${settings.fee_usd.toFixed(2)}</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <CalendarDays className="h-5 w-5 text-blue-600" />
//                 <div>
//                   <p className="text-sm font-medium text-foreground">Expires In</p>
//                   <p className="text-muted-foreground text-sm">{settings.expiry_days} days</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Upload */}
//           <div className="space-y-2">
//             <Label>Photos</Label>
//             <div className="flex items-center gap-4">
//               <Button type="button" variant="outline" className="relative">
//                 <Upload className="h-4 w-4 mr-2" />
//                 Upload
//                 <input
//                   type="file"
//                   multiple
//                   accept="image/*"
//                   onChange={handlePhotoUpload}
//                   className="absolute inset-0 opacity-0 cursor-pointer"
//                 />
//               </Button>
//               <p className="text-xs text-muted-foreground">{formData.photos.length}/5 uploaded</p>
//             </div>
//             {formData.photos.length > 0 && (
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
//                 {formData.photos.map((photo, index) => (
//                   <div key={index} className="relative group">
//                     <img
//                       src={photo}
//                       alt={`Upload ${index + 1}`}
//                       className="w-full h-24 object-cover rounded-lg border"
//                     />
//                     <Button
//                       variant="destructive"
//                       size="sm"
//                       className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
//                       onClick={() => removePhoto(index)}
//                     >
//                       <X className="h-3 w-3" />
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <Button
//             type="submit"
//             className="w-full font-medium"
//             disabled={isLoading || !locationCoords}
//           >
//             {isLoading
//               ? "Posting..."
//               : `Post ${type === "item" ? "Item" : "Service"}`}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }


// "use client";

// import React, { useEffect, useState } from "react";
// import { Button } from "@barter/ui";
// import { Input } from "@barter/ui";
// import { Label } from "@barter/ui";
// import { Textarea } from "@barter/ui";
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
// import {
//   Upload,
//   X,
//   Package,
//   Wrench,
//   DollarSign,
//   CalendarDays,
// } from "lucide-react";
// import { LocationPicker } from "@/components/location/location-picker";

// interface ListingFormProps {
//   type: "item" | "service";
//   onSuccess?: () => void;
// }

// const ITEM_CATEGORIES = [
//   "Electronics",
//   "Furniture",
//   "Appliances",
//   "Tools",
//   "Books",
//   "Clothing",
//   "Sports Equipment",
//   "Musical Instruments",
//   "Art & Crafts",
//   "Other",
// ];

// const SERVICE_CATEGORIES = [
//   "Moving Help",
//   "Tutoring",
//   "Cleaning",
//   "Handyman",
//   "Pet Care",
//   "Gardening",
//   "Photography",
//   "Web Design",
//   "Writing",
//   "Other",
// ];

// export function ListingForm({ type, onSuccess }: ListingFormProps) {
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     category: "",
//     location_text: "",
//     barter_request: "",
//     photos: [] as string[],
//     condition: type === "item" ? "good" : undefined,
//     availability: type === "service" ? "" : undefined,
//     skill_level: type === "service" ? "unskilled" : undefined,
//   });

//   const [locationCoords, setLocationCoords] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(null);

//   const [settings, setSettings] = useState<{
//     fee_usd: number;
//     expiry_days: number;
//   } | null>(null);

//   const [isLoading, setIsLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const { toast } = useToast();

//   const categories = type === "item" ? ITEM_CATEGORIES : SERVICE_CATEGORIES;

//   // ✅ Fetch listing fee and expiry settings
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch("/api/settings");
//         const data = await res.json();
//         if (res.ok && data?.settings) {
//           setSettings({
//             fee_usd: parseFloat(data.settings.listing_fee_usd || "0.99"),
//             expiry_days: data.settings.listing_expiry_days || 30,
//           });
//         } else {
//           setSettings({ fee_usd: 0.99, expiry_days: 30 });
//         }
//       } catch {
//         setSettings({ fee_usd: 0.99, expiry_days: 30 });
//       }
//     })();
//   }, []);

//   // ✅ Handle submit
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const token = localStorage.getItem("auth_token");

//       const payload = {
//         type,
//         ...formData,
//         latitude: locationCoords?.latitude,
//         longitude: locationCoords?.longitude,
//       };

//       const response = await fetch("/api/listings", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || "Failed to create listing");

//       toast({
//         title: "✅ Success!",
//         description: `Your ${type} listing has been created successfully.`,
//       });

//       // Reset form
//       setFormData({
//         title: "",
//         description: "",
//         category: "",
//         location_text: "",
//         barter_request: "",
//         photos: [],
//         condition: type === "item" ? "good" : undefined,
//         availability: type === "service" ? "" : undefined,
//         skill_level: type === "service" ? "unskilled" : undefined,
//       });
//       setLocationCoords(null);
//       onSuccess?.();
//     } catch (error) {
//       toast({
//         title: "❌ Error",
//         description:
//           error instanceof Error ? error.message : "Something went wrong",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ✅ Handle location
//   const handleLocationSelect = (loc: {
//     latitude: number;
//     longitude: number;
//     name: string;
//   }) => {
//     setLocationCoords({ latitude: loc.latitude, longitude: loc.longitude });
//     setFormData((p) => ({ ...p, location_text: loc.name }));
//   };

//   // ✅ Upload photos to Cloudinary via API route
//   const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     if (!files.length) return;

//     setUploading(true);
//     try {
//       const fd = new FormData();
//       files.forEach((f) => fd.append("files", f));

//       const res = await fetch("/api/upload", { method: "POST", body: fd });
//       const data = await res.json();

//       if (res.ok && data.urls) {
//         setFormData((p) => ({
//           ...p,
//           photos: [...p.photos, ...data.urls].slice(0, 5),
//         }));
//         toast({
//           title: "📸 Uploaded!",
//           description: `${data.urls.length} image${
//             data.urls.length > 1 ? "s" : ""
//           } uploaded successfully.`,
//         });
//       } else {
//         toast({
//           title: "Upload failed",
//           description: data.error || "Unknown error while uploading images",
//           variant: "destructive",
//         });
//       }
//     } catch (err) {
//       console.error("Upload failed", err);
//       toast({
//         title: "Upload Error",
//         description: "Something went wrong while uploading.",
//         variant: "destructive",
//       });
//     } finally {
//       setUploading(false);
//     }
//   };

//   const removePhoto = (index: number) => {
//     setFormData((p) => ({
//       ...p,
//       photos: p.photos.filter((_, i) => i !== index),
//     }));
//   };

//   return (
//     <Card className="w-full max-w-2xl mx-auto bg-card shadow-sm border rounded-2xl">
//       <CardHeader className="text-center space-y-1">
//         <div className="flex justify-center items-center gap-2">
//           {type === "item" ? (
//             <Package className="h-6 w-6 text-primary" />
//           ) : (
//             <Wrench className="h-6 w-6 text-primary" />
//           )}
//           <CardTitle className="font-serif text-2xl font-bold">
//             {type === "item" ? "Post an Item" : "Post a Service"}
//           </CardTitle>
//         </div>
//         <CardDescription>
//           {type === "item"
//             ? "List an item you'd like to trade for services"
//             : "Offer your services in exchange for items"}
//         </CardDescription>
//       </CardHeader>

//       <CardContent className="space-y-6">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Title */}
//           <div className="space-y-2">
//             <Label htmlFor="title">
//               {type === "item" ? "Item Name" : "Service Title"}{" "}
//               <span className="text-destructive">*</span>
//             </Label>
//             <Input
//               id="title"
//               value={formData.title}
//               onChange={(e) =>
//                 setFormData((p) => ({ ...p, title: e.target.value }))
//               }
//               placeholder={
//                 type === "item"
//                   ? "e.g., MacBook Pro 2020"
//                   : "e.g., Professional Tutoring Available"
//               }
//               required
//             />
//           </div>

//           {/* Category */}
//           <div className="space-y-2">
//             <Label>
//               Category <span className="text-destructive">*</span>
//             </Label>
//             <Select
//               value={formData.category}
//               onValueChange={(v) =>
//                 setFormData((p) => ({ ...p, category: v }))
//               }
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select category" />
//               </SelectTrigger>
//               <SelectContent>
//                 {categories.map((c) => (
//                   <SelectItem
//                     key={c}
//                     value={c.toLowerCase().replace(/\s+/g, "_")}
//                   >
//                     {c}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Description */}
//           <div className="space-y-2">
//             <Label>Description</Label>
//             <Textarea
//               rows={4}
//               value={formData.description}
//               onChange={(e) =>
//                 setFormData((p) => ({ ...p, description: e.target.value }))
//               }
//               placeholder={
//                 type === "item"
//                   ? "Describe your item..."
//                   : "Describe your service..."
//               }
//             />
//           </div>

//           <LocationPicker onLocationSelect={handleLocationSelect} />

//           {/* Fee + Expiry */}
//           {settings && (
//             <div className="flex justify-between items-center border border-border/50 rounded-xl p-4 bg-muted/40">
//               <div className="flex items-center gap-2">
//                 <DollarSign className="h-5 w-5 text-green-600" />
//                 <p className="text-sm">
//                   Listing Fee: ${settings.fee_usd.toFixed(2)}
//                 </p>
//               </div>
//               <div className="flex items-center gap-2">
//                 <CalendarDays className="h-5 w-5 text-blue-600" />
//                 <p className="text-sm">
//                   Expires in {settings.expiry_days} days
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* ✅ Upload */}
//           <div className="space-y-2">
//             <Label>Photos</Label>
//             <div className="flex items-center gap-4 relative">
//               {/* Upload button with overlaid invisible input */}
//               <div className="relative">
//                 <Button type="button" variant="outline" disabled={uploading}>
//                   <Upload className="h-4 w-4 mr-2" />
//                   {uploading ? "Uploading..." : "Upload"}
//                 </Button>

//                 <input
//                   type="file"
//                   multiple
//                   accept="image/*"
//                   onChange={handlePhotoUpload}
//                   className="absolute inset-0 opacity-0 cursor-pointer"
//                   style={{ zIndex: 10 }}
//                 />
//               </div>

//               <p className="text-xs text-muted-foreground">
//                 {formData.photos.length}/5 uploaded
//               </p>
//             </div>

//             {formData.photos.length > 0 && (
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
//                 {formData.photos.map((photo, i) => (
//                   <div key={i} className="relative group">
//                     <img
//                       src={photo}
//                       alt={`Upload ${i + 1}`}
//                       className="w-full h-24 object-cover rounded-lg border"
//                     />
//                     <Button
//                       type="button"
//                       variant="destructive"
//                       size="sm"
//                       className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100"
//                       onClick={() => removePhoto(i)}
//                     >
//                       <X className="h-3 w-3" />
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <Button
//             type="submit"
//             className="w-full font-medium"
//             disabled={isLoading || !locationCoords}
//           >
//             {isLoading
//               ? "Posting..."
//               : `Post ${type === "item" ? "Item" : "Service"}`}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }


"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@barter/ui";
import { Input } from "@barter/ui";
import { Label } from "@barter/ui";
import { Textarea } from "@barter/ui";
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
import {
  Upload,
  X,
  Package,
  Wrench,
  Banknote,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { LocationPicker } from "@/components/location/location-picker";
import { formatFeeForCountry, DEFAULT_LISTING_FEE } from "@/lib/currency";

interface ListingFormProps {
  type: "item" | "service";
  onSuccess?: () => void;
}

const ITEM_CATEGORIES = [
  "Electronics",
  "Furniture",
  "Appliances",
  "Tools",
  "Books",
  "Clothing",
  "Sports Equipment",
  "Musical Instruments",
  "Art & Crafts",
  "Other",
];

const SERVICE_CATEGORIES = [
  "Moving Help",
  "Tutoring",
  "Cleaning",
  "Handyman",
  "Pet Care",
  "Gardening",
  "Photography",
  "Web Design",
  "Writing",
  "Other",
];

const CONDITION_OPTIONS = [
  {
    value: "good",
    label: "Good Condition",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100",
    borderColor: "border-green-600",
    description: "Excellent working order, minimal wear",
  },
  {
    value: "satisfactory",
    label: "Satisfactory Condition",
    icon: AlertCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 hover:bg-yellow-100",
    borderColor: "border-yellow-600",
    description: "Works well, shows some signs of use",
  },
  {
    value: "bad",
    label: "Bad Condition",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50 hover:bg-red-100",
    borderColor: "border-red-600",
    description: "Visible wear, may need repairs",
  },
];

export function ListingForm({ type, onSuccess }: ListingFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location_text: "",
    barter_request: "",
    photos: [] as string[],
    condition: type === "item" ? "good" : undefined,
    availability: type === "service" ? "" : undefined,
    skill_level: type === "service" ? "unskilled" : undefined,
  });

  const [locationCoords, setLocationCoords] = useState<{
    latitude: number;
    longitude: number;
    city?: string;
  } | null>(null);

  const [settings, setSettings] = useState<{
    fee: number; // base-currency (PKR) listing fee
    expiry_days: number;
  } | null>(null);

  // Viewer's profile country → drives the currency the fee is shown in.
  const [country, setCountry] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { toast } = useToast();

  const categories = type === "item" ? ITEM_CATEGORIES : SERVICE_CATEGORIES;

  // ✅ Fetch user profile and auto-fill location

  // ✅ Fetch listing fee and expiry settings
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (res.ok && data?.settings) {
          setSettings({
            fee: parseFloat(data.settings.listing_fee_usd) || DEFAULT_LISTING_FEE,
            expiry_days: data.settings.listing_expiry_days || 30,
          });
        } else {
          setSettings({ fee: DEFAULT_LISTING_FEE, expiry_days: 30 });
        }
      } catch {
        setSettings({ fee: DEFAULT_LISTING_FEE, expiry_days: 30 });
      }
    })();
  }, []);

  // ✅ Load the viewer's country so the fee shows in their local currency
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setCountry(data?.user?.country ?? null);
      } catch {
        // ignore — falls back to base currency (PKR)
      }
    })();
  }, []);

  // ✅ Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("auth_token");

      const payload = {
        type,
        ...formData,
        latitude: locationCoords?.latitude,
        longitude: locationCoords?.longitude,
        city_name: locationCoords?.city ?? null,
      };

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create listing");

      toast({
        title: "✅ Success!",
        description: `Your ${type} listing has been created successfully.`,
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        location_text: "",
        barter_request: "",
        photos: [],
        condition: type === "item" ? "good" : undefined,
        availability: type === "service" ? "" : undefined,
        skill_level: type === "service" ? "unskilled" : undefined,
      });
      setLocationCoords(null);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "❌ Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle location
  const handleLocationSelect = (loc: {
    latitude: number;
    longitude: number;
    name: string;
    city?: string;
  }) => {
    setLocationCoords({ latitude: loc.latitude, longitude: loc.longitude, city: loc.city });
    setFormData((p) => ({ ...p, location_text: loc.name }));
  };

  // ✅ Upload photos to Cloudinary via API route
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (res.ok && data.urls) {
        setFormData((p) => ({
          ...p,
          photos: [...p.photos, ...data.urls].slice(0, 5),
        }));
        toast({
          title: "📸 Uploaded!",
          description: `${data.urls.length} image${
            data.urls.length > 1 ? "s" : ""
          } uploaded successfully.`,
        });
      } else {
        toast({
          title: "Upload failed",
          description: data.error || "Unknown error while uploading images",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Upload failed", err);
      toast({
        title: "Upload Error",
        description: "Something went wrong while uploading.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setFormData((p) => ({
      ...p,
      photos: p.photos.filter((_, i) => i !== index),
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card shadow-sm border rounded-2xl">
      <CardHeader className="text-center space-y-1">
        <div className="flex justify-center items-center gap-2">
          {type === "item" ? (
            <Package className="h-6 w-6 text-primary" />
          ) : (
            <Wrench className="h-6 w-6 text-primary" />
          )}
          <CardTitle className="font-serif text-2xl font-bold">
            {type === "item" ? "Post an Item" : "Post a Service"}
          </CardTitle>
        </div>
        <CardDescription>
          {type === "item"
            ? "List an item you'd like to trade for services"
            : "Offer your services in exchange for items"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {type === "item" ? "Item Name" : "Service Title"}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((p) => ({ ...p, title: e.target.value }))
              }
              placeholder={
                type === "item"
                  ? "e.g., MacBook Pro 2020"
                  : "e.g., Professional Tutoring Available"
              }
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(v) =>
                setFormData((p) => ({ ...p, category: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem
                    key={c}
                    value={c.toLowerCase().replace(/\s+/g, "_")}
                  >
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition Category - Only for Items */}
          {type === "item" && (
            <div className="space-y-3">
              <Label>
                Condition <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {CONDITION_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = formData.condition === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, condition: option.value }))
                      }
                      className={`
                        relative p-4 rounded-lg border-2 transition-all
                        ${isSelected 
                          ? `${option.borderColor} ${option.bgColor}` 
                          : 'border-border bg-background hover:bg-muted/50'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <Icon 
                          className={`h-6 w-6 ${isSelected ? option.color : 'text-muted-foreground'}`} 
                        />
                        <div>
                          <p className={`font-medium text-sm ${isSelected ? option.color : 'text-foreground'}`}>
                            {option.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className={`absolute top-2 right-2 h-2 w-2 rounded-full ${option.color.replace('text-', 'bg-')}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              placeholder={
                type === "item"
                  ? "Describe your item..."
                  : "Describe your service..."
              }
            />
          </div>

          <LocationPicker onLocationSelect={handleLocationSelect} />

          {/* Fee + Expiry */}
          {settings && (
            <div className="flex justify-between items-center border border-border/50 rounded-xl p-4 bg-muted/40">
              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-green-600" />
                <p className="text-sm">
                  Listing Fee: {formatFeeForCountry(settings.fee, country)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <p className="text-sm">
                  Expires in {settings.expiry_days} days
                </p>
              </div>
            </div>
          )}

          {/* ✅ Upload */}
          <div className="space-y-2">
            <Label>Photos</Label>
            <div className="flex items-center gap-4 relative">
              {/* Upload button with overlaid invisible input */}
              <div className="relative">
                <Button type="button" variant="outline" disabled={uploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload"}
                </Button>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  style={{ zIndex: 10 }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {formData.photos.length}/5 uploaded
              </p>
            </div>

            {formData.photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {formData.photos.map((photo, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={photo}
                      alt={`Upload ${i + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => removePhoto(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full font-medium"
            disabled={isLoading || !locationCoords}
          >
            {isLoading
              ? "Posting..."
              : `Post ${type === "item" ? "Item" : "Service"}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}



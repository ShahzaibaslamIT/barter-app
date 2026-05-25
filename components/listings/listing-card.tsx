// "use client"
// import { useState } from "react"
// import { Card, CardContent, CardFooter } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { MapPin, Star, Package, Wrench, Trash2 } from "lucide-react"

// interface Listing {
//   item_id: number
//   type: "item" | "service"
//   title: string
//   description: string
//   category: string
//   location_text?: string
//   barter_request?: string
//   photos: string[]
//   condition?: string
//   user_name: string
//   user_avatar?: string
//   user_rating: number
//   user_rating_count: number
//   created_at: string
// }

// interface ListingCardProps {
//   listing: Listing
//   onViewDetails?: (listing: Listing) => void
//   onMakeOffer?: (listing: Listing) => void
//   onDeleted?: (item_id: number) => void
// }

// export function ListingCard({ listing, onViewDetails, onMakeOffer, onDeleted }: ListingCardProps) {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0)

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString)
//     const now = new Date()
//     const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

//     if (diffInHours < 24) return `${diffInHours}h ago`
//     if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
//     return date.toLocaleDateString()
//   }

//   const handleDelete = async () => {
//     const confirmed = confirm("Are you sure you want to delete this listing?")
//     if (!confirmed) return

//     try {
//       const token = localStorage.getItem("auth_token")
//       console.log("🗑️ Deleting listing:", listing.item_id)
//       const res = await fetch(`/api/listings/${listing.item_id}`, {
//         method: "DELETE",
//         headers: { Authorization: token ? `Bearer ${token}` : "" },
//       })

//       if (res.ok) {
//         alert("Listing deleted successfully")
//         onDeleted?.(listing.item_id)
//       } else {
//         const text = await res.text()
//         let errMsg = text
//         try {
//           const data = JSON.parse(text)
//           errMsg = data.error || JSON.stringify(data)
//         } catch {}
//         alert("Failed to delete: " + errMsg)
//       }
//     } catch (e) {
//       console.error("Delete failed", e)
//       alert("Something went wrong while deleting")
//     }
//   }

//   const images =
//     listing.photos.length > 0
//       ? listing.photos
//       : [`/placeholder.svg?height=200&width=300&query=${listing.type}`]

//   return (
//     <Card className="overflow-hidden hover:shadow-lg transition-shadow">
//       <div className="relative">
//         <img
//           src={images[currentImageIndex] || "/placeholder.svg"}
//           alt={listing.title}
//           className="w-full h-48 object-cover"
//         />
//         <div className="absolute top-2 left-2">
//           <Badge
//             variant={listing.type === "item" ? "default" : "secondary"}
//             className="flex items-center gap-1"
//           >
//             {listing.type === "item" ? <Package className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
//             {listing.type === "item" ? "Item" : "Service"}
//           </Badge>
//         </div>
//         {listing.condition && (
//           <div className="absolute top-2 right-2">
//             <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
//               {listing.condition}
//             </Badge>
//           </div>
//         )}
//       </div>

//       {images.length > 1 && (
//         <div className="flex gap-2 p-2 overflow-x-auto">
//           {images.map((img, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentImageIndex(index)}
//               className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 ${
//                 index === currentImageIndex ? "border-primary" : "border-transparent"
//               }`}
//             >
//               <img src={img} alt={`thumb-${index}`} className="w-full h-full object-cover" />
//             </button>
//           ))}
//         </div>
//       )}

//       <CardContent className="p-4">
//         <div className="space-y-3">
//           <div>
//             <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
//             <p className="text-sm text-muted-foreground capitalize">{listing.category.replace(/_/g, " ")}</p>
//           </div>
//           <p className="text-sm text-foreground line-clamp-2">{listing.description}</p>
//           {listing.barter_request && (
//             <div className="p-2 bg-muted rounded-lg">
//               <p className="text-xs text-muted-foreground mb-1">Looking for:</p>
//               <p className="text-sm line-clamp-1">{listing.barter_request}</p>
//             </div>
//           )}
//           <div className="flex items-center justify-between text-sm text-muted-foreground">
//             <div className="flex items-center gap-1">
//               <MapPin className="h-3 w-3" />
//               <span className="line-clamp-1">{listing.location_text}</span>
//             </div>
//             <span>{formatDate(listing.created_at)}</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Avatar className="h-6 w-6">
//               <AvatarImage src={listing.user_avatar || "/placeholder.svg"} />
//               <AvatarFallback className="text-xs">{listing.user_name?.charAt(0) || "?"}</AvatarFallback>
//             </Avatar>
//             <span className="text-sm font-medium">{listing.user_name}</span>
//             {listing.user_rating_count > 0 && (
//               <div className="flex items-center gap-1">
//                 <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
//                 <span className="text-xs">{listing.user_rating.toFixed(1)}</span>
//                 <span className="text-xs text-muted-foreground">({listing.user_rating_count})</span>
//               </div>
//             )}
//           </div>
//         </div>
//       </CardContent>

//       <CardFooter className="p-4 pt-0 flex gap-2">
//         <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onViewDetails?.(listing)}>
//           View Details
//         </Button>
//         <Button className="flex-1" onClick={() => onMakeOffer?.(listing)}>
//           Make Offer
//         </Button>
//         <Button variant="destructive" size="icon" onClick={handleDelete} title="Delete Listing">
//           <Trash2 className="h-4 w-4" />
//         </Button>
//       </CardFooter>
//     </Card>
//   )
// }



// "use client"

// import { useEffect, useState } from "react"
// import { Card, CardContent, CardFooter } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { MapPin, Star, Package, Wrench, Trash2 } from "lucide-react"

// interface Listing {
//   item_id: number
//   type: "item" | "service"
//   title: string
//   description: string
//   category: string
//   location_text?: string
//   barter_request?: string
//   photos: string[]
//   condition?: string
//   user_name: string
//   user_avatar?: string
//   user_rating: number
//   user_rating_count: number
//   created_at: string
//   user_id?: number // ✅ ensure listing owner id is available
// }

// interface ListingCardProps {
//   listing: Listing
//   onViewDetails?: (listing: Listing) => void
//   onMakeOffer?: (listing: Listing) => void
//   onDeleted?: (item_id: number) => void
// }

// export function ListingCard({ listing, onViewDetails, onMakeOffer, onDeleted }: ListingCardProps) {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0)
//   const [currentUserId, setCurrentUserId] = useState<number | null>(null)

//   // ✅ Read logged-in user id from localStorage
//   useEffect(() => {
//     try {
//       const stored = localStorage.getItem("user")
//       if (stored) {
//         const parsed = JSON.parse(stored)
//         if (parsed?.user_id) setCurrentUserId(Number(parsed.user_id))
//       }
//     } catch (e) {
//       console.warn("Failed to parse user from localStorage", e)
//     }
//   }, [])

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString)
//     const now = new Date()
//     const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
//     if (diffInHours < 24) return `${diffInHours}h ago`
//     if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
//     return date.toLocaleDateString()
//   }

//   const handleDelete = async () => {
//     const confirmed = confirm("Are you sure you want to delete this listing?")
//     if (!confirmed) return

//     try {
//       const token = localStorage.getItem("auth_token")
//       console.log("🗑️ Deleting listing:", listing.item_id)
//       const res = await fetch(`/api/listings/${listing.item_id}`, {
//         method: "DELETE",
//         headers: { Authorization: token ? `Bearer ${token}` : "" },
//       })

//       if (res.ok) {
//         alert("Listing deleted successfully")
//         onDeleted?.(listing.item_id)
//       } else {
//         const text = await res.text()
//         let errMsg = text
//         try {
//           const data = JSON.parse(text)
//           errMsg = data.error || JSON.stringify(data)
//         } catch {}
//         alert("Failed to delete: " + errMsg)
//       }
//     } catch (e) {
//       console.error("Delete failed", e)
//       alert("Something went wrong while deleting")
//     }
//   }

//   const images =
//     listing.photos.length > 0
//       ? listing.photos
//       : [`/placeholder.svg?height=200&width=300&query=${listing.type}`]

//   return (
//     <Card className="overflow-hidden hover:shadow-lg transition-shadow">
//       <div className="relative">
//         <img
//           src={images[currentImageIndex] || "/placeholder.svg"}
//           alt={listing.title}
//           className="w-full h-48 object-cover"
//         />
//         <div className="absolute top-2 left-2">
//           <Badge
//             variant={listing.type === "item" ? "default" : "secondary"}
//             className="flex items-center gap-1"
//           >
//             {listing.type === "item" ? <Package className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
//             {listing.type === "item" ? "Item" : "Service"}
//           </Badge>
//         </div>
//         {listing.condition && (
//           <div className="absolute top-2 right-2">
//             <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
//               {listing.condition}
//             </Badge>
//           </div>
//         )}
//       </div>

//       {images.length > 1 && (
//         <div className="flex gap-2 p-2 overflow-x-auto">
//           {images.map((img, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentImageIndex(index)}
//               className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 ${
//                 index === currentImageIndex ? "border-primary" : "border-transparent"
//               }`}
//             >
//               <img src={img} alt={`thumb-${index}`} className="w-full h-full object-cover" />
//             </button>
//           ))}
//         </div>
//       )}

//       <CardContent className="p-4">
//         <div className="space-y-3">
//           <div>
//             <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
//             <p className="text-sm text-muted-foreground capitalize">
//               {listing.category.replace(/_/g, " ")}
//             </p>
//           </div>

//           <p className="text-sm text-foreground line-clamp-2">{listing.description}</p>

//           {listing.barter_request && (
//             <div className="p-2 bg-muted rounded-lg">
//               <p className="text-xs text-muted-foreground mb-1">Looking for:</p>
//               <p className="text-sm line-clamp-1">{listing.barter_request}</p>
//             </div>
//           )}

//           <div className="flex items-center justify-between text-sm text-muted-foreground">
//             <div className="flex items-center gap-1">
//               <MapPin className="h-3 w-3" />
//               <span className="line-clamp-1">{listing.location_text}</span>
//             </div>
//             <span>{formatDate(listing.created_at)}</span>
//           </div>

//           <div className="flex items-center gap-2">
//             <Avatar className="h-6 w-6">
//               <AvatarImage src={listing.user_avatar || "/placeholder.svg"} />
//               <AvatarFallback className="text-xs">
//                 {listing.user_name?.charAt(0) || "?"}
//               </AvatarFallback>
//             </Avatar>
//             <span className="text-sm font-medium">{listing.user_name}</span>
//             {listing.user_rating_count > 0 && (
//               <div className="flex items-center gap-1">
//                 <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
//                 <span className="text-xs">{listing.user_rating.toFixed(1)}</span>
//                 <span className="text-xs text-muted-foreground">
//                   ({listing.user_rating_count})
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       </CardContent>

//       <CardFooter className="p-4 pt-0 flex gap-2">
//         <Button
//           variant="outline"
//           className="flex-1 bg-transparent"
//           onClick={() => onViewDetails?.(listing)}
//         >
//           View Details
//         </Button>
//         <Button className="flex-1" onClick={() => onMakeOffer?.(listing)}>
//           Make Offer
//         </Button>

//         {/* ✅ Delete button only visible if logged-in user is the owner */}
//         {currentUserId && listing.user_id === currentUserId && (
//           <Button
//             variant="destructive"
//             size="icon"
//             onClick={handleDelete}
//             title="Delete Listing"
//           >
//             <Trash2 className="h-4 w-4" />
//           </Button>
//         )}
//       </CardFooter>
//     </Card>
//   )
// }


// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { MapPin, Star, Package, Wrench, Trash2 } from "lucide-react";

// interface Listing {
//   item_id: number;
//   type: "item" | "service";
//   title: string;
//   description: string;
//   category: string;
//   location_text?: string;
//   barter_request?: string;
//   photos: string[];
//   condition?: string;
//   user_name: string;
//   user_avatar?: string;
//   user_rating: number;
//   user_rating_count: number;
//   created_at: string;
//   user_id?: number | string;
// }

// interface ListingCardProps {
//   listing: Listing;
//   onViewDetails?: (listing: Listing) => void;
//   onMakeOffer?: (listing: Listing) => void;
//   onDeleted?: (item_id: number) => void;
// }

// export function ListingCard({
//   listing,
//   onViewDetails,
//   onMakeOffer,
//   onDeleted,
// }: ListingCardProps) {
//   const [currentUserId, setCurrentUserId] = useState<number | string | null>(null);
//   const [authToken, setAuthToken] = useState<string | null>(null);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   // ✅ Load current user & token from localStorage
//   useEffect(() => {
//     try {
//       const token = localStorage.getItem("auth_token");
//       setAuthToken(token);

//       const userData = localStorage.getItem("user");
//       if (userData) {
//         const parsed = JSON.parse(userData);
//         if (parsed?.user_id) setCurrentUserId(String(parsed.user_id));
//         else if (parsed?.id) setCurrentUserId(String(parsed.id));
//       }
//     } catch (err) {
//       console.warn("⚠️ Failed to read user/token:", err);
//     }
//   }, []);

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
//     if (diffInHours < 24) return `${diffInHours}h ago`;
//     if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
//     return date.toLocaleDateString();
//   };

//   const handleDelete = async () => {
//     const confirmed = confirm("Are you sure you want to delete this listing?");
//     if (!confirmed) return;

//     try {
//       const res = await fetch(`/api/listings/${listing.item_id}`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
//         },
//       });

//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         alert("❌ Failed to delete listing: " + (err.error || res.statusText));
//         return;
//       }

//       alert("✅ Listing deleted successfully");
//       onDeleted?.(listing.item_id);
//     } catch (err) {
//       console.error("❌ Delete failed:", err);
//       alert("Something went wrong while deleting");
//     }
//   };

//   const images =
//     listing.photos && listing.photos.length > 0
//       ? listing.photos
//       : [`/placeholder.svg?height=200&width=300&query=${listing.type}`];

//   const isOwner =
//     currentUserId !== null &&
//     listing.user_id !== undefined &&
//     String(listing.user_id) === String(currentUserId);

//   return (
//     <Card className="overflow-hidden hover:shadow-lg transition-shadow">
//       <div className="relative">
//         <img
//           src={images[currentImageIndex] || "/placeholder.svg"}
//           alt={listing.title}
//           className="w-full h-48 object-cover"
//         />
//         <div className="absolute top-2 left-2">
//           <Badge
//             variant={listing.type === "item" ? "default" : "secondary"}
//             className="flex items-center gap-1"
//           >
//             {listing.type === "item" ? (
//               <Package className="h-3 w-3" />
//             ) : (
//               <Wrench className="h-3 w-3" />
//             )}
//             {listing.type === "item" ? "Item" : "Service"}
//           </Badge>
//         </div>
//         {listing.condition && (
//           <div className="absolute top-2 right-2">
//             <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
//               {listing.condition}
//             </Badge>
//           </div>
//         )}
//       </div>

//       {images.length > 1 && (
//         <div className="flex gap-2 p-2 overflow-x-auto">
//           {images.map((img, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentImageIndex(index)}
//               className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 ${
//                 index === currentImageIndex ? "border-primary" : "border-transparent"
//               }`}
//             >
//               <img src={img} alt={`thumb-${index}`} className="w-full h-full object-cover" />
//             </button>
//           ))}
//         </div>
//       )}

//       <CardContent className="p-4">
//         <div className="space-y-3">
//           <div>
//             <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
//             <p className="text-sm text-muted-foreground capitalize">
//               {listing.category.replace(/_/g, " ")}
//             </p>
//           </div>

//           <p className="text-sm text-foreground line-clamp-2">{listing.description}</p>

//           {listing.barter_request && (
//             <div className="p-2 bg-muted rounded-lg">
//               <p className="text-xs text-muted-foreground mb-1">Looking for:</p>
//               <p className="text-sm line-clamp-1">{listing.barter_request}</p>
//             </div>
//           )}

//           <div className="flex items-center justify-between text-sm text-muted-foreground">
//             <div className="flex items-center gap-1">
//               <MapPin className="h-3 w-3" />
//               <span className="line-clamp-1">{listing.location_text || "Unknown"}</span>
//             </div>
//             <span>{formatDate(listing.created_at)}</span>
//           </div>

//           <div className="flex items-center gap-2">
//             <Avatar className="h-6 w-6">
//               <AvatarImage src={listing.user_avatar || "/placeholder.svg"} />
//               <AvatarFallback className="text-xs">
//                 {listing.user_name?.charAt(0) || "?"}
//               </AvatarFallback>
//             </Avatar>
//             <span className="text-sm font-medium">{listing.user_name}</span>
//             {listing.user_rating_count > 0 && (
//               <div className="flex items-center gap-1">
//                 <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
//                 <span className="text-xs">{listing.user_rating.toFixed(1)}</span>
//                 <span className="text-xs text-muted-foreground">
//                   ({listing.user_rating_count})
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       </CardContent>

//       <CardFooter className="p-4 pt-0 flex gap-2">
//         <Button variant="outline" className="flex-1" onClick={() => onViewDetails?.(listing)}>
//           View Details
//         </Button>

//         {!isOwner && (
//           <Button
//             className="flex-1"
//             onClick={() => {
//               if (!authToken) {
//                 alert("Please log in first to make an offer.");
//                 return;
//               }
//               onMakeOffer?.(listing);
//             }}
//           >
//             Make Offer
//           </Button>
//         )}

//         {isOwner && (
//           <Button variant="destructive" size="icon" onClick={handleDelete} title="Delete Listing">
//             <Trash2 className="h-4 w-4" />
//           </Button>
//         )}
//       </CardFooter>
//     </Card>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Package, Wrench, Trash2, Pencil } from "lucide-react";

interface Listing {
  item_id: number;
  type: "item" | "service";
  title: string;
  description: string;
  category: string;
  location_text?: string;
  barter_request?: string;
  photos: string[];
  condition?: string;
  user_name: string;
  user_avatar?: string;
  user_rating: number;
  user_rating_count: number;
  created_at: string;
  user_id?: number | string;
}

interface ListingCardProps {
  listing: Listing;
  onViewDetails?: (listing: Listing) => void;
  onMakeOffer?: (listing: Listing) => void;
  onDeleted?: (item_id: number) => void;

  /** NEW → EDIT CALLBACK **/
  onEditListing?: (listing: Listing) => void;
}

export function ListingCard({
  listing,
  onViewDetails,
  onMakeOffer,
  onDeleted,
  onEditListing,   // ← NEW PROP
}: ListingCardProps) {
  const [currentUserId, setCurrentUserId] = useState<number | string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Load user + token from localStorage, then fallback to session API
  useEffect(() => {
    try {
      const token = localStorage.getItem("auth_token");
      setAuthToken(token);

      const userData = localStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        const id = parsed?.user_id || parsed?.id || null;
        if (id) {
          setCurrentUserId(id);
          return;
        }
      }
    } catch (err) {
      console.warn("⚠️ Failed to read user/token:", err);
    }

    // Fallback: fetch from /api/user/me (covers Google OAuth users)
    fetch("/api/user/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const u = data?.user || data;
        if (u?.user_id || u?.id) {
          const id = u.user_id || u.id;
          setCurrentUserId(id);
          setAuthToken("session");
          // Cache for next time
          localStorage.setItem("user", JSON.stringify(u));
        }
      })
      .catch(() => {});
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleDelete = async () => {
  const confirmed = confirm("Are you sure you want to delete this listing?");
  if (!confirmed) return;

  try {
    // 🔍 DEBUG
    console.log("=== DELETE DEBUG ===");
    console.log("🔑 Token from localStorage:", authToken);
    console.log("👤 Current User ID:", currentUserId);
    console.log("📝 Listing User ID:", listing.user_id);
    console.log("✅ Is Owner:", isOwner);
    console.log("===================");

    const res = await fetch(`/api/listings/${listing.item_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

    const data = await res.json();
    console.log("📡 Response:", { status: res.status, data });

    if (!res.ok) {
      alert("❌ Failed to delete listing: " + (data.error || res.statusText));
      return;
    }

    alert("✅ Listing deleted successfully");
    onDeleted?.(listing.item_id);
  } catch (err) {
    console.error("❌ Delete failed:", err);
    alert("Something went wrong while deleting");
  }
};

  const images =
    listing.photos && listing.photos.length > 0
      ? listing.photos
      : [`/placeholder.svg?height=200&width=300&query=${listing.type}`];

  const isOwner =
    currentUserId !== null &&
    listing.user_id !== undefined &&
    String(listing.user_id) === String(currentUserId);

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onViewDetails?.(listing)}
    >
      <div className="relative">
        <img
          src={images[currentImageIndex] || "/placeholder.svg"}
          alt={listing.title}
          className="w-full h-48 object-cover"
        />

        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <Badge
            variant={listing.type === "item" ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {listing.type === "item" ? (
              <Package className="h-3 w-3" />
            ) : (
              <Wrench className="h-3 w-3" />
            )}
            {listing.type === "item" ? "Item" : "Service"}
          </Badge>
        </div>

        {listing.condition && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              {listing.condition}
            </Badge>
          </div>
        )}
      </div>

      {/* Image Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 p-2 overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
              className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 ${
                index === currentImageIndex ? "border-primary" : "border-transparent"
              }`}
            >
              <img src={img} alt={`thumb-${index}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title + Category */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {listing.category.replace(/_/g, " ")}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-foreground line-clamp-2">{listing.description}</p>

          {/* Barter Request */}
          {listing.barter_request && (
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Looking for:</p>
              <p className="text-sm line-clamp-1">{listing.barter_request}</p>
            </div>
          )}

          {/* Location + Date */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{listing.location_text || "Unknown"}</span>
            </div>
            <span>{formatDate(listing.created_at)}</span>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={listing.user_avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">
                {listing.user_name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{listing.user_name}</span>

            {listing.user_rating_count > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs">{listing.user_rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({listing.user_rating_count})
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2" onClick={(e) => e.stopPropagation()}>

        {/* View Details */}
        <Button variant="outline" className="flex-1" onClick={() => onViewDetails?.(listing)}>
          View Details
        </Button>

        {/* Non-owner → Make offer */}
        {!isOwner && (
          <Button
            className="flex-1"
            onClick={() => {
              if (!authToken) {
                alert("Please log in first to make an offer.");
                return;
              }
              onMakeOffer?.(listing);
            }}
          >
            Make Offer
          </Button>
        )}

        {/* Owner Options: Edit + Delete */}
        {isOwner && (
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => onEditListing?.(listing)}
              title="Edit Listing"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              title="Delete Listing"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}



// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { MapPin, Star, Package, Wrench, Trash2, Pencil, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

// interface Listing {
//   item_id: number;
//   type: "item" | "service";
//   title: string;
//   description: string;
//   category: string;
//   location_text?: string;
//   barter_request?: string;
//   photos: string[];
//   condition?: string;
//   user_name: string;
//   user_avatar?: string;
//   user_rating: number;
//   user_rating_count: number;
//   created_at: string;
//   user_id?: number | string;
// }

// interface ListingCardProps {
//   listing: Listing;
//   onViewDetails?: (listing: Listing) => void;
//   onMakeOffer?: (listing: Listing) => void;
//   onDeleted?: (item_id: number) => void;
//   onEditListing?: (listing: Listing) => void;
// }

// // Condition configuration with colors and icons
// const CONDITION_CONFIG = {
//   good: {
//     label: "Good Condition",
//     icon: CheckCircle2,
//     color: "text-green-600",
//     bgColor: "bg-green-100",
//     borderColor: "border-green-600",
//   },
//   satisfactory: {
//     label: "Satisfactory",
//     icon: AlertCircle,
//     color: "text-yellow-600",
//     bgColor: "bg-yellow-100",
//     borderColor: "border-yellow-600",
//   },
//   bad: {
//     label: "Poor Condition",
//     icon: XCircle,
//     color: "text-red-600",
//     bgColor: "bg-red-100",
//     borderColor: "border-red-600",
//   },
// };

// export function ListingCard({
//   listing,
//   onViewDetails,
//   onMakeOffer,
//   onDeleted,
//   onEditListing,
// }: ListingCardProps) {
//    if (!listing || !listing.item_id) {
//     console.warn("ListingCard received invalid listing:", listing);
//     return null;
//   }
//   const [currentUserId, setCurrentUserId] = useState<number | string | null>(null);
//   const [authToken, setAuthToken] = useState<string | null>(null);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   // Load user + token
//   useEffect(() => {
//     try {
//       const token = localStorage.getItem("auth_token");
//       setAuthToken(token);

//       useEffect(() => {
//   const token = localStorage.getItem("auth_token");
//   setAuthToken(token);

//   (async () => {
//     try {
//       const res = await fetch("/api/user/me", {
//         credentials: "include",
//         headers: {
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//       });

//       if (!res.ok) return;

//       const data = await res.json();
//       if (data?.user?.user_id) {
//         setCurrentUserId(data.user.user_id);
//       }
//     } catch (err) {
//       console.warn("Failed to fetch current user:", err);
//     }
//   })();
// }, []);

//     } catch (err) {
//       console.warn("⚠️ Failed to read user/token:", err);
//     }
//   }, []);

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
//     if (diffInHours < 24) return `${diffInHours}h ago`;
//     if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
//     return date.toLocaleDateString();
//   };

//   const handleDelete = async () => {
//     const confirmed = confirm("Are you sure you want to delete this listing?");
//     if (!confirmed) return;

//     try {
//      const res = await fetch(`/api/listings/${listing.item_id}`, {
//   method: "DELETE",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   credentials: "include", // 🔥 THIS IS THE FIX
// });


//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         alert("❌ Failed to delete listing: " + (err.error || res.statusText));
//         return;
//       }

//       alert("✅ Listing deleted successfully");
//       onDeleted?.(listing.item_id);
//     } catch (err) {
//       console.error("❌ Delete failed:", err);
//       alert("Something went wrong while deleting");
//     }
//   };

//   const images =
//     listing.photos && listing.photos.length > 0
//       ? listing.photos
//       : [`/placeholder.svg?height=200&width=300&query=${listing.type}`];

//   const isOwner =
//     currentUserId !== null &&
//     listing.user_id !== undefined &&
//     String(listing.user_id) === String(currentUserId);

//   // Get condition configuration
//   const conditionConfig = listing.condition 
//     ? CONDITION_CONFIG[listing.condition as keyof typeof CONDITION_CONFIG]
//     : null;

//   const ConditionIcon = conditionConfig?.icon;

//   return (
//     <Card className="overflow-hidden hover:shadow-lg transition-shadow">
//       <div className="relative">
//         <img
//           src={images[currentImageIndex] || "/placeholder.svg"}
//           alt={listing.title}
//           className="w-full h-48 object-cover"
//         />

//         {/* Type Badge */}
//         <div className="absolute top-2 left-2">
//           <Badge
//             variant={listing.type === "item" ? "default" : "secondary"}
//             className="flex items-center gap-1"
//           >
//             {listing.type === "item" ? (
//               <Package className="h-3 w-3" />
//             ) : (
//               <Wrench className="h-3 w-3" />
//             )}
//             {listing.type === "item" ? "Item" : "Service"}
//           </Badge>
//         </div>

//         {/* Condition Badge - Color Coded */}
//         {listing.type === "item" && conditionConfig && ConditionIcon && (
//           <div className="absolute top-2 right-2">
//             <Badge 
//               variant="outline" 
//               className={`
//                 ${conditionConfig.bgColor} 
//                 ${conditionConfig.borderColor} 
//                 ${conditionConfig.color}
//                 backdrop-blur-sm 
//                 border-2
//                 flex items-center gap-1
//                 font-semibold
//               `}
//             >
//               <ConditionIcon className="h-3 w-3" />
//               {conditionConfig.label}
//             </Badge>
//           </div>
//         )}
//       </div>

//       {/* Image Thumbnails */}
//       {images.length > 1 && (
//         <div className="flex gap-2 p-2 overflow-x-auto">
//           {images.map((img, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentImageIndex(index)}
//               className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 ${
//                 index === currentImageIndex ? "border-primary" : "border-transparent"
//               }`}
//             >
//               <img src={img} alt={`thumb-${index}`} className="w-full h-full object-cover" />
//             </button>
//           ))}
//         </div>
//       )}

//       <CardContent className="p-4">
//         <div className="space-y-3">
//           {/* Title + Category */}
//           <div>
//             <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
//             <p className="text-sm text-muted-foreground capitalize">
//               {listing.category.replace(/_/g, " ")}
//             </p>
//           </div>

//           {/* Condition Info Bar - Alternative placement inside card */}
//           {listing.type === "item" && conditionConfig && ConditionIcon && (
//             <div className={`
//               flex items-center gap-2 p-2 rounded-lg border-l-4 
//               ${conditionConfig.borderColor}
//               ${conditionConfig.bgColor}
//             `}>
//               <ConditionIcon className={`h-4 w-4 ${conditionConfig.color}`} />
//               <span className={`text-sm font-medium ${conditionConfig.color}`}>
//                 {conditionConfig.label}
//               </span>
//             </div>
//           )}

//           {/* Description */}
//           <p className="text-sm text-foreground line-clamp-2">{listing.description}</p>

//           {/* Barter Request */}
//           {listing.barter_request && (
//             <div className="p-2 bg-muted rounded-lg">
//               <p className="text-xs text-muted-foreground mb-1">Looking for:</p>
//               <p className="text-sm line-clamp-1">{listing.barter_request}</p>
//             </div>
//           )}

//           {/* Location + Date */}
//           <div className="flex items-center justify-between text-sm text-muted-foreground">
//             <div className="flex items-center gap-1">
//               <MapPin className="h-3 w-3" />
//               <span className="line-clamp-1">{listing.location_text || "Unknown"}</span>
//             </div>
//             <span>{formatDate(listing.created_at)}</span>
//           </div>

//           {/* User Info */}
//           <div className="flex items-center gap-2">
//             <Avatar className="h-6 w-6">
//               <AvatarImage src={listing.user_avatar || "/placeholder.svg"} />
//               <AvatarFallback className="text-xs">
//                 {listing.user_name?.charAt(0) || "?"}
//               </AvatarFallback>
//             </Avatar>
//             <span className="text-sm font-medium">{listing.user_name}</span>

//             {listing.user_rating_count > 0 && (
//               <div className="flex items-center gap-1">
//                 <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
//                 <span className="text-xs">{listing.user_rating.toFixed(1)}</span>
//                 <span className="text-xs text-muted-foreground">
//                   ({listing.user_rating_count})
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       </CardContent>

//       <CardFooter className="p-4 pt-0 flex gap-2">
//         {/* View Details */}
//         <Button variant="outline" className="flex-1" onClick={() => onViewDetails?.(listing)}>
//           View Details
//         </Button>

//         {/* Non-owner → Make offer */}
//         {!isOwner && (
//           <Button
//             className="flex-1"
//             onClick={() => {
//               if (!authToken) {
//                 alert("Please log in first to make an offer.");
//                 return;
//               }
//               onMakeOffer?.(listing);
//             }}
//           >
//             Make Offer
//           </Button>
//         )}

//         {/* Owner Options: Edit + Delete */}
//         {isOwner && (
//           <>
//             <Button
//               variant="secondary"
//               size="icon"
//               onClick={() => onEditListing?.(listing)}
//               title="Edit Listing"
//             >
//               <Pencil className="h-4 w-4" />
//             </Button>

//             <Button
//               variant="destructive"
//               size="icon"
//               onClick={handleDelete}
//               title="Delete Listing"
//             >
//               <Trash2 className="h-4 w-4" />
//             </Button>
//           </>
//         )}
//       </CardFooter>
//     </Card>
//   );
// }



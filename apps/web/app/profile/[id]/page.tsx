// "use client"

// import { useEffect, useState } from "react"
// import { useParams, useRouter } from "next/navigation"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { BottomNav } from "@/components/ui/bottom-nav"
// import { RatingDisplay } from "@/components/ratings/rating-display"
// import { ArrowLeft, MapPin, Package, Wrench } from "lucide-react"

// interface PublicUser {
//   user_id: number
//   username: string
//   email: string
//   avatar_url?: string
//   bio?: string
//   user_type?: string
//   averageRating: number
//   totalRatings: number
//   activeListings: number
//   completedTrades: number
//   listings?: {
//     item_id: number
//     title: string
//     type: "item" | "service"
//     photos: string[]
//   }[]
// }

// export default function PublicProfilePage() {
//   const { id } = useParams<{ id: string }>()
//   const router = useRouter()
//   const [user, setUser] = useState<PublicUser | null>(null)
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     if (!id) return
//     fetchUserProfile(id)
//   }, [id])

//   const fetchUserProfile = async (userId: string) => {
//     try {
//       const res = await fetch(`/api/users/${userId}`)
//       const data = await res.json()
//       if (res.ok) setUser(data.user)
//       else console.error("Failed to load profile:", data.error)
//     } catch (err) {
//       console.error("Error loading profile:", err)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-muted-foreground">
//         Loading profile...
//       </div>
//     )
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground">
//         <p>Profile not found</p>
//         <Button onClick={() => router.back()} className="mt-3">
//           Go Back
//         </Button>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-background pb-20">
//       <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
//         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//           <Button variant="ghost" size="sm" onClick={() => router.back()}>
//             <ArrowLeft className="h-4 w-4 mr-2" /> Back
//           </Button>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 pt-8 space-y-8">
//         {/* Profile Info */}
//         <Card className="p-6 text-center shadow-md">
//           <div className="flex flex-col items-center space-y-3">
//             <Avatar className="h-24 w-24 ring-4 ring-muted">
//               <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
//               <AvatarFallback className="text-3xl">
//                 {user.username?.charAt(0) || "U"}
//               </AvatarFallback>
//             </Avatar>
//             <h2 className="text-2xl font-bold">{user.username}</h2>
//             {user.bio && <p className="text-muted-foreground text-sm">{user.bio}</p>}
//             <Badge variant="outline" className="capitalize">
//               {user.user_type?.replace("_", " ") || "user"}
//             </Badge>
//             <RatingDisplay rating={user.averageRating} count={user.totalRatings} size="sm" />
//           </div>
//         </Card>

//         {/* Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {[
//             { label: "Active Listings", value: user.activeListings },
//             { label: "Completed Trades", value: user.completedTrades },
//             { label: "Reviews", value: user.totalRatings },
//             { label: "Rating", value: user.averageRating.toFixed(1) },
//           ].map((stat, idx) => (
//             <Card key={idx} className="shadow-sm">
//               <CardContent className="p-4 text-center">
//                 <p className="text-xl font-semibold">{stat.value}</p>
//                 <p className="text-sm text-muted-foreground">{stat.label}</p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Listings Preview */}
//         {user.listings && user.listings.length > 0 && (
//           <div>
//             <h3 className="text-lg font-semibold mb-3">Listings by {user.username}</h3>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//               {user.listings.map((listing) => (
//                 <Card
//                   key={listing.item_id}
//                   className="cursor-pointer hover:shadow-md transition"
//                   onClick={() => router.push(`/listings/${listing.item_id}`)}
//                 >
//                   <CardContent className="p-2 space-y-2">
//                     <img
//                       src={listing.photos?.[0] || "/placeholder.svg"}
//                       className="w-full h-32 object-cover rounded-lg"
//                       alt={listing.title}
//                     />
//                     <p className="font-medium text-sm">{listing.title}</p>
//                     <Badge variant={listing.type === "item" ? "default" : "secondary"}>
//                       {listing.type === "item" ? <Package className="h-3 w-3 mr-1" /> : <Wrench className="h-3 w-3 mr-1" />}
//                       {listing.type}
//                     </Badge>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         )}

//         <BottomNav />
//       </div>
//     </div>
//   )
// }


"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/ui/bottom-nav";
import { RatingDisplay } from "@/components/ratings/rating-display";
import { ArrowLeft, Package, Wrench } from "lucide-react";

interface PublicUser {
  user_id: number;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  user_type?: string;
  averageRating?: number;
  totalRatings?: number;
  activeListings?: number;
  completedTrades?: number;
  listings?: {
    item_id: number;
    title: string;
    type: "item" | "service";
    photos: string[];
  }[];
}

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchUserProfile(id);
  }, [id]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) {
        console.error("Failed to load profile:", res.status);
        setUser(null);
        return;
      }

      const data = await res.json();
      // ✅ Data comes directly from the backend (not wrapped in { user: ... })
      setUser(data);
    } catch (err) {
      console.error("Error loading profile:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground">
        <p>Profile not found</p>
        <Button onClick={() => router.back()} className="mt-3">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-8 space-y-8">
        {/* Profile Card */}
        <Card className="p-6 text-center shadow-md">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-24 w-24 ring-4 ring-muted">
              <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-3xl">
                {user.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{user.username}</h2>
            {user.bio && (
              <p className="text-muted-foreground text-sm">{user.bio}</p>
            )}
            <Badge variant="outline" className="capitalize">
              {user.user_type?.replace("_", " ") || "user"}
            </Badge>
            <RatingDisplay
              rating={user.averageRating || 0}
              count={user.totalRatings || 0}
              size="sm"
            />
          </div>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Listings", value: user.activeListings || 0 },
            { label: "Completed Trades", value: user.completedTrades || 0 },
            { label: "Reviews", value: user.totalRatings || 0 },
            {
              label: "Rating",
              value:
                user.averageRating !== undefined
                  ? user.averageRating.toFixed(1)
                  : "0.0",
            },
          ].map((stat, idx) => (
            <Card key={idx} className="shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-xl font-semibold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Listings Preview */}
        {user.listings && user.listings.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Listings by {user.username}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {user.listings.map((listing) => (
                <Card
                  key={listing.item_id}
                  className="cursor-pointer hover:shadow-md transition"
                  onClick={() => router.push(`/listings/${listing.item_id}`)}
                >
                  <CardContent className="p-2 space-y-2">
                    <img
                      src={listing.photos?.[0] || "/placeholder.svg"}
                      className="w-full h-32 object-cover rounded-lg"
                      alt={listing.title}
                    />
                    <p className="font-medium text-sm">{listing.title}</p>
                    <Badge
                      variant={
                        listing.type === "item" ? "default" : "secondary"
                      }
                    >
                      {listing.type === "item" ? (
                        <Package className="h-3 w-3 mr-1" />
                      ) : (
                        <Wrench className="h-3 w-3 mr-1" />
                      )}
                      {listing.type}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
}

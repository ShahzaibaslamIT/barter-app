// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { ListingCard } from "@/components/listings/listing-card"
// import { MapView } from "@/components/marketplace/map-view"
// import { BottomNav } from "@/components/ui/bottom-nav"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import {
//   Search,
//   MapPin,
//   List,
//   SlidersHorizontal,
//   Loader2,
//   AlertCircle,
//   Sparkles,
// } from "lucide-react"
// import { useGeolocation } from "@/hooks/use-geolocation"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { MakeOfferDialog } from "@/components/offers/make-offer-dialog"
// import { useToast } from "@/hooks/use-toast"

// // DTO
// interface ListingDTO {
//   item_id: number
//   type: "item" | "service"
//   title: string
//   description: string
//   category: string
//   condition?: string
//   photos: string[]
//   barter_request?: string
//   created_at: string
//   latitude?: number
//   longitude?: number
//   location_text?: string
//   distance_km?: number
//   user_id: number
//   user_name: string
//   user_avatar?: string
//   user_rating: number
//   user_rating_count: number
// }

// export default function DiscoverPage() {
//   const [listings, setListings] = useState<ListingDTO[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [fetchError, setFetchError] = useState<string | null>(null)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [offerTarget, setOfferTarget] = useState<ListingDTO | null>(null)
//   const [showFilters, setShowFilters] = useState(false)
//   const router = useRouter()
//   const { toast } = useToast()
//   const { latitude, longitude, error: locationError, loading: locationLoading } =
//     useGeolocation()

//   useEffect(() => {
//     if (latitude && longitude) fetchNearbyListings()
//   }, [latitude, longitude])

//   const fetchNearbyListings = async () => {
//     if (!latitude || !longitude) return
//     try {
//       setIsLoading(true)
//       setFetchError(null)
//       const params = new URLSearchParams({
//         latitude: latitude.toString(),
//         longitude: longitude.toString(),
//         radius: "10",
//       })
//       const res = await fetch(`/api/listings/nearby?${params}`)
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error || "Failed to fetch listings")
//       const normalized = (data.listings || []).map((l: any) => ({
//         ...l,
//         item_id: Number(l.item_id),
//         latitude: Number(l.latitude) || undefined,
//         longitude: Number(l.longitude) || undefined,
//       }))
//       setListings(normalized)
//     } catch (err: any) {
//       setFetchError(err.message || "Error fetching listings")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleOfferSuccess = async (listing: ListingDTO) => {
//     try {
//       setOfferTarget(null)
//       const token = localStorage.getItem("auth_token")
//       const res = await fetch("/api/messages/threads", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: JSON.stringify({
//           listing_id: listing.item_id,
//           other_user_id: listing.user_id,
//         }),
//       })
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error)
//       const threadId = data.thread?.thread_id
//       router.push(`/messages/${threadId}`)
//     } catch {
//       toast({
//         title: "Error",
//         description: "Could not start conversation.",
//         variant: "destructive",
//       })
//     }
//   }

//   // --- UI states ---
//   if (locationLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background">
//         <Loader2 className="h-10 w-10 animate-spin text-primary" />
//       </div>
//     )
//   }
//   if (locationError || fetchError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background p-6">
//         <Alert className="max-w-md mx-auto">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>
//             {locationError || fetchError}. Please try again.
//           </AlertDescription>
//         </Alert>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10 pb-20">
//       {/* Header */}
//       <header className="sticky top-0 z-40 backdrop-blur-lg bg-background/80 border-b shadow-md">
//         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Sparkles className="h-5 w-5 text-primary" />
//             <h1 className="font-serif text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//               Discover
//             </h1>
//           </div>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setShowFilters(!showFilters)}
//             className="rounded-full"
//           >
//             <SlidersHorizontal className="h-4 w-4 mr-2" />
//             Filters
//           </Button>
//         </div>
//       </header>

//       {/* Search + Filters */}
//       <div className="container mx-auto px-4 py-6 space-y-4">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search items, services or users..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10 rounded-full shadow-lg focus:ring-2 focus:ring-primary/50"
//           />
//         </div>
//         {showFilters && (
//           <div className="p-4 rounded-2xl border bg-card shadow-lg animate-fadeIn">
//             <p className="text-sm text-muted-foreground">
//               Advanced filters coming soon (category, distance, ratings).
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Tabs */}
//       <div className="container mx-auto px-4">
//         <Tabs defaultValue="list" className="w-full">
//           <TabsList className="grid w-full grid-cols-2 mb-6 rounded-full bg-muted/40 p-1">
//             <TabsTrigger
//               value="list"
//               className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
//             >
//               <List className="h-4 w-4 mr-1" /> List
//             </TabsTrigger>
//             <TabsTrigger
//               value="map"
//               className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
//             >
//               <MapPin className="h-4 w-4 mr-1" /> Map
//             </TabsTrigger>
//           </TabsList>

//           {/* List View */}
//           <TabsContent value="list">
//             {isLoading ? (
//               <div className="text-center py-16">
//                 <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-primary" />
//                 <p className="text-muted-foreground">Loading listings...</p>
//               </div>
//             ) : listings.length === 0 ? (
//               <div className="text-center py-16 space-y-3">
//                 <p className="text-muted-foreground">No listings nearby.</p>
//                 <Button onClick={fetchNearbyListings}>Refresh</Button>
//               </div>
//             ) : (
//               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//                 {listings.map((listing) => (
//                   <div
//                     key={listing.item_id}
//                     className="relative rounded-2xl border bg-card shadow-md hover:shadow-xl transition-all duration-300"
//                   >
//                     <ListingCard
//                       listing={listing}
//                       onViewDetails={() =>
//                         router.push(`/listings/${listing.item_id}`)
//                       }
//                       onMakeOffer={() => setOfferTarget(listing)}
//                       onDeleted={() =>
//                         setListings((prev) =>
//                           prev.filter((x) => x.item_id !== listing.item_id),
//                         )
//                       }
//                     />
//                     {listing.distance_km && (
//                       <Badge
//                         variant="secondary"
//                         className="absolute top-3 right-3 text-xs shadow"
//                       >
//                         {listing.distance_km.toFixed(1)} km away
//                       </Badge>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </TabsContent>

//           {/* Map View */}
//           <TabsContent value="map">
//             <MapView
//               listings={listings}
//               userLocation={
//                 latitude && longitude ? { latitude, longitude } : undefined
//               }
//               onListingSelect={(l) => router.push(`/listings/${l.item_id}`)}
//             />
//           </TabsContent>
//         </Tabs>
//       </div>

//       {/* Offer Dialog */}
//       {offerTarget && (
//         <MakeOfferDialog
//           isOpen={!!offerTarget}
//           onClose={() => setOfferTarget(null)}
//           targetListing={{
//             item_id: offerTarget.item_id,
//             title: offerTarget.title,
//             type: offerTarget.type,
//             user_id: offerTarget.user_id,
//             user_name: offerTarget.user_name,
//           }}
//           onSuccess={() => handleOfferSuccess(offerTarget)}
//         />
//       )}

//       <BottomNav />
//     </div>
//   )
// }


// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { ListingCard } from "@/components/listings/listing-card"
// import { MapView } from "@/components/marketplace/map-view"
// import { BottomNav } from "@/components/ui/bottom-nav"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import {
//   Search,
//   MapPin,
//   List,
//   SlidersHorizontal,
//   Loader2,
//   AlertCircle,
//   Sparkles,
// } from "lucide-react"
// import { useGeolocation } from "@/hooks/use-geolocation"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { MakeOfferDialog } from "@/components/offers/make-offer-dialog"
// import { useToast } from "@/hooks/use-toast"

// // DTO
// interface ListingDTO {
//   item_id: number
//   type: "item" | "service"
//   title: string
//   description: string
//   category: string
//   condition?: string
//   photos: string[]
//   barter_request?: string
//   created_at: string
//   latitude?: number
//   longitude?: number
//   location_text?: string
//   distance_km?: number
//   user_id: number
//   user_name: string
//   user_avatar?: string
//   user_rating: number
//   user_rating_count: number
// }

// export default function DiscoverPage() {
//   const [listings, setListings] = useState<ListingDTO[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [fetchError, setFetchError] = useState<string | null>(null)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [offerTarget, setOfferTarget] = useState<ListingDTO | null>(null)
//   const [showFilters, setShowFilters] = useState(false)

//   // 🔥 new filter state
//   const [filters, setFilters] = useState({
//     category: "",
//     maxDistance: 10,
//     minRating: 0,
//   })

//   const router = useRouter()
//   const { toast } = useToast()
//   const { latitude, longitude, error: locationError, loading: locationLoading } =
//     useGeolocation()

//   useEffect(() => {
//     if (latitude && longitude) fetchNearbyListings()
//   }, [latitude, longitude])

//   const fetchNearbyListings = async () => {
//     if (!latitude || !longitude) return
//     try {
//       setIsLoading(true)
//       setFetchError(null)

//       const params = new URLSearchParams({
//         latitude: latitude.toString(),
//         longitude: longitude.toString(),
//         radius: filters.maxDistance.toString(),
//       })

//       if (filters.category) params.append("category", filters.category)
//       if (filters.minRating > 0) params.append("minRating", filters.minRating.toString())
//       if (searchQuery) params.append("q", searchQuery)

//       const res = await fetch(`/api/listings/nearby?${params}`)
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error || "Failed to fetch listings")

//       const normalized = (data.listings || []).map((l: any) => ({
//         ...l,
//         item_id: Number(l.item_id),
//         latitude: Number(l.latitude) || undefined,
//         longitude: Number(l.longitude) || undefined,
//       }))
//       setListings(normalized)
//     } catch (err: any) {
//       setFetchError(err.message || "Error fetching listings")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleOfferSuccess = async (listing: ListingDTO) => {
//     try {
//       setOfferTarget(null)
//       const token = localStorage.getItem("auth_token")
//       const res = await fetch("/api/messages/threads", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: JSON.stringify({
//           listing_id: listing.item_id,
//           other_user_id: listing.user_id,
//         }),
//       })
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error)
//       const threadId = data.thread?.thread_id
//       router.push(`/messages/${threadId}`)
//     } catch {
//       toast({
//         title: "Error",
//         description: "Could not start conversation.",
//         variant: "destructive",
//       })
//     }
//   }

//   // --- UI states ---
//   if (locationLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background">
//         <Loader2 className="h-10 w-10 animate-spin text-primary" />
//       </div>
//     )
//   }
//   if (locationError || fetchError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background p-6">
//         <Alert className="max-w-md mx-auto">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>
//             {locationError || fetchError}. Please try again.
//           </AlertDescription>
//         </Alert>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10 pb-20">
//       {/* Header */}
//       <header className="sticky top-0 z-40 backdrop-blur-lg bg-background/80 border-b shadow-md">
//         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Sparkles className="h-5 w-5 text-primary" />
//             <h1 className="font-serif text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//               Discover
//             </h1>
//           </div>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setShowFilters(!showFilters)}
//             className="rounded-full"
//           >
//             <SlidersHorizontal className="h-4 w-4 mr-2" />
//             Filters
//           </Button>
//         </div>
//       </header>

//       {/* Search + Filters */}
//       <div className="container mx-auto px-4 py-6 space-y-4">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search items, services or users..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10 rounded-full shadow-lg focus:ring-2 focus:ring-primary/50"
//           />
//         </div>

//         {showFilters && (
//           <div className="p-4 rounded-2xl border bg-card shadow-lg animate-fadeIn space-y-4">
//             {/* Category */}
//             <div>
//               <label className="block text-sm font-medium mb-1">Category</label>
//               <select
//                 className="w-full rounded-lg border p-2"
//                 value={filters.category}
//                 onChange={(e) => setFilters({ ...filters, category: e.target.value })}
//               >
//                 <option value="">All</option>
//                 <option value="electronics">Electronics</option>     
//                 <option value="furniture">Furniture</option>
//                 <option value="appliances">Appliances</option>
//                 <option value="tools">Tools</option>
//                 <option value="books">Books</option>
//                 <option value="clothing">Clothing</option>
//                 <option value="sports equipmnet">Sports Equipment</option>
//                 <option value="musical instruments">Musical Instruments</option>
//                 <option value="art & crafts">Art & Crafts</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>

//             {/* Max Distance */}
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Max Distance: {filters.maxDistance} km
//               </label>
//               <input
//                 type="range"
//                 min="1"
//                 max="50"
//                 value={filters.maxDistance}
//                 onChange={(e) =>
//                   setFilters({ ...filters, maxDistance: Number(e.target.value) })
//                 }
//                 className="w-full"
//               />
//             </div>

//             {/* Min Rating */}
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Min Rating: {filters.minRating} ★
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 max="5"
//                 value={filters.minRating}
//                 onChange={(e) =>
//                   setFilters({ ...filters, minRating: Number(e.target.value) })
//                 }
//                 className="w-full rounded-lg border p-2"
//               />
//             </div>

//             {/* Apply Button */}
//             <Button className="w-full" onClick={fetchNearbyListings}>
//               Apply Filters
//             </Button>
//           </div>
//         )}
//       </div>

//       {/* Tabs */}
//       <div className="container mx-auto px-4">
//         <Tabs defaultValue="list" className="w-full">
//           <TabsList className="grid w-full grid-cols-2 mb-6 rounded-full bg-muted/40 p-1">
//             <TabsTrigger
//               value="list"
//               className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
//             >
//               <List className="h-4 w-4 mr-1" /> List
//             </TabsTrigger>
//             <TabsTrigger
//               value="map"
//               className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
//             >
//               <MapPin className="h-4 w-4 mr-1" /> Map
//             </TabsTrigger>
//           </TabsList>

//           {/* List View */}
//           <TabsContent value="list">
//             {isLoading ? (
//               <div className="text-center py-16">
//                 <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-primary" />
//                 <p className="text-muted-foreground">Loading listings...</p>
//               </div>
//             ) : listings.length === 0 ? (
//               <div className="text-center py-16 space-y-3">
//                 <p className="text-muted-foreground">No listings nearby.</p>
//                 <Button onClick={fetchNearbyListings}>Refresh</Button>
//               </div>
//             ) : (
//               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//                 {listings.map((listing) => (
//                   <div
//                     key={listing.item_id}
//                     className="relative rounded-2xl border bg-card shadow-md hover:shadow-xl transition-all duration-300"
//                   >
//                     <ListingCard
//                       listing={listing}
//                       onViewDetails={() =>
//                         router.push(`/listings/${listing.item_id}`)
//                       }
//                       onMakeOffer={() => setOfferTarget(listing)}
//                       onDeleted={() =>
//                         setListings((prev) =>
//                           prev.filter((x) => x.item_id !== listing.item_id),
//                         )
//                       }
//                     />
//                     {listing.distance_km && (
//                       <Badge
//                         variant="secondary"
//                         className="absolute top-3 right-3 text-xs shadow"
//                       >
//                         {listing.distance_km.toFixed(1)} km away
//                       </Badge>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </TabsContent>

//           {/* Map View */}
//           <TabsContent value="map">
//             <MapView
//               listings={listings}
//               userLocation={
//                 latitude && longitude ? { latitude, longitude } : undefined
//               }
//               onListingSelect={(l) => router.push(`/listings/${l.item_id}`)}
//             />
//           </TabsContent>
//         </Tabs>
//       </div>

//       {/* Offer Dialog */}
//       {offerTarget && (
//         <MakeOfferDialog
//           isOpen={!!offerTarget}
//           onClose={() => setOfferTarget(null)}
//           targetListing={{
//             item_id: offerTarget.item_id,
//             title: offerTarget.title,
//             type: offerTarget.type,
//             user_id: offerTarget.user_id,
//             user_name: offerTarget.user_name,
//           }}
//           onSuccess={() => handleOfferSuccess(offerTarget)}
//         />
//       )}

//       <BottomNav />
//     </div>
//   )
// }

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ListingCard } from "@/components/listings/listing-card"
import { MapView } from "@/components/marketplace/map-view"
import { BottomNav } from "@/components/ui/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  MapPin,
  List,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  Sparkles,
  Package,
  Wrench,
} from "lucide-react"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MakeOfferDialog } from "@/components/offers/make-offer-dialog"
import { useToast } from "@/hooks/use-toast"

// --- DTO ---
interface ListingDTO {
  item_id: number
  type: "item" | "service"
  title: string
  description: string
  category: string
  condition?: string
  photos: string[]
  barter_request?: string
  created_at: string
  latitude?: number
  longitude?: number
  location_text?: string
  distance_km?: number
  user_id: number
  user_name: string
  user_avatar?: string
  user_rating: number
  user_rating_count: number
}

// --- category sets ---
const ITEM_CATEGORIES = [
  "All",
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
]

const SERVICE_CATEGORIES = [
  "All",
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
]

export default function DiscoverPage() {
  const [listings, setListings] = useState<ListingDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [offerTarget, setOfferTarget] = useState<ListingDTO | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    type: "item" as "item" | "service",
    category: "All",
    maxDistance: 10,
    minRating: 0,
  })

  const router = useRouter()
  const { toast } = useToast()
  const { latitude, longitude, error: locationError, loading: locationLoading } =
    useGeolocation()

  // --- fetch listings when filters or location change ---
  useEffect(() => {
    if (latitude && longitude) fetchNearbyListings()
  }, [latitude, longitude, filters.type, filters.category])

  // --- API call ---
  const fetchNearbyListings = async () => {
    if (!latitude || !longitude) return
    try {
      setIsLoading(true)
      setFetchError(null)

      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: filters.maxDistance.toString(),
        type: filters.type,
      })

      if (filters.category && filters.category !== "All")
        params.append("category", filters.category.toLowerCase().replace(/\s+/g, "_"))
      if (filters.minRating > 0)
        params.append("minRating", filters.minRating.toString())
      if (searchQuery) params.append("q", searchQuery)

      const res = await fetch(`/api/listings/nearby?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch listings")

      const normalized = (data.listings || []).map((l: any) => ({
        ...l,
        item_id: Number(l.item_id),
        latitude: Number(l.latitude) || undefined,
        longitude: Number(l.longitude) || undefined,
      }))
      setListings(normalized)
    } catch (err: any) {
      setFetchError(err.message || "Error fetching listings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOfferSuccess = async (listing: ListingDTO) => {
    try {
      setOfferTarget(null)
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/messages/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          listing_id: listing.item_id,
          other_user_id: listing.user_id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const threadId = data.thread?.thread_id
      router.push(`/messages/${threadId}`)
    } catch {
      toast({
        title: "Error",
        description: "Could not start conversation.",
        variant: "destructive",
      })
    }
  }

  // --- loading or error states ---
  if (locationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (locationError || fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {locationError || fetchError}. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-background/80 border-b shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="font-serif text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Discover
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-full"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </header>

      {/* Search + Filters */}
      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items, services or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full shadow-lg focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {showFilters && (
          <div className="p-4 rounded-2xl border bg-card shadow-lg animate-fadeIn space-y-4">
            {/* Type Toggle */}
            <div className="flex justify-center gap-4">
              <Button
                variant={filters.type === "item" ? "default" : "outline"}
                className="flex items-center gap-2 rounded-full"
                onClick={() => setFilters({ ...filters, type: "item" })}
              >
                <Package className="h-4 w-4" /> Items
              </Button>
              <Button
                variant={filters.type === "service" ? "default" : "outline"}
                className="flex items-center gap-2 rounded-full"
                onClick={() => setFilters({ ...filters, type: "service" })}
              >
                <Wrench className="h-4 w-4" /> Services
              </Button>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full rounded-lg border p-2"
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
              >
                {(filters.type === "item"
                  ? ITEM_CATEGORIES
                  : SERVICE_CATEGORIES
                ).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Distance */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Distance: {filters.maxDistance} km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={filters.maxDistance}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    maxDistance: Number(e.target.value),
                  })
                }
                className="w-full accent-primary"
              />
            </div>

            {/* Min Rating */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Min Rating: {filters.minRating} ★
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={filters.minRating}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    minRating: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border p-2"
              />
            </div>

            {/* Apply Button */}
            <Button className="w-full" onClick={fetchNearbyListings}>
              Apply Filters
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 rounded-full bg-muted/40 p-1">
            <TabsTrigger
              value="list"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <List className="h-4 w-4 mr-1" /> List
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <MapPin className="h-4 w-4 mr-1" /> Map
            </TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list">
            {isLoading ? (
              <div className="text-center py-16">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-primary" />
                <p className="text-muted-foreground">Loading listings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-muted-foreground">No listings nearby.</p>
                <Button onClick={fetchNearbyListings}>Refresh</Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <div
                    key={listing.item_id}
                    className="relative rounded-2xl border bg-card shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <ListingCard
                      listing={listing}
                      onViewDetails={() =>
                        router.push(`/listings/${listing.item_id}`)
                      }
                      onMakeOffer={() => setOfferTarget(listing)}
                      onDeleted={() =>
                        setListings((prev) =>
                          prev.filter((x) => x.item_id !== listing.item_id),
                        )
                      }
                    />
                    {listing.distance_km && (
                      <Badge
                        variant="secondary"
                        className="absolute top-3 right-3 text-xs shadow"
                      >
                        {listing.distance_km.toFixed(1)} km away
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Map View */}
          <TabsContent value="map">
            <MapView
              listings={listings}
              userLocation={
                latitude && longitude
                  ? { latitude, longitude }
                  : undefined
              }
              onListingSelect={(l) => router.push(`/listings/${l.item_id}`)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Offer Dialog */}
      {offerTarget && (
        <MakeOfferDialog
          isOpen={!!offerTarget}
          onClose={() => setOfferTarget(null)}
          targetListing={{
            item_id: offerTarget.item_id,
            title: offerTarget.title,
            type: offerTarget.type,
            user_id: offerTarget.user_id,
            user_name: offerTarget.user_name,
          }}
          onSuccess={() => handleOfferSuccess(offerTarget)}
        />
      )}

      <BottomNav />
    </div>
  )
}


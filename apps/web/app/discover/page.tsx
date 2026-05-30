// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { ListingCard } from "@/components/listings/listing-card"
// import { MapView } from "@/components/marketplace/map-view"
// import { BottomNav } from "@barter/ui"
// import { Button } from "@barter/ui"
// import { Input } from "@barter/ui"
// import { Badge } from "@barter/ui"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@barter/ui"
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
// import { Alert, AlertDescription } from "@barter/ui"
// import { MakeOfferDialog } from "@/components/offers/make-offer-dialog"
// import { useToast } from "@barter/ui"

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
// import { BottomNav } from "@barter/ui"
// import { Button } from "@barter/ui"
// import { Input } from "@barter/ui"
// import { Badge } from "@barter/ui"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@barter/ui"
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
// import { Alert, AlertDescription } from "@barter/ui"
// import { MakeOfferDialog } from "@/components/offers/make-offer-dialog"
// import { useToast } from "@barter/ui"

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




// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { ListingCard } from "@/components/listings/listing-card"
// import { MapView } from "@/components/marketplace/map-view"
// import { BottomNav } from "@barter/ui"
// import { Button } from "@barter/ui"
// import { Input } from "@barter/ui"
// import { Badge } from "@barter/ui"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@barter/ui"
// import {
//   Search,
//   MapPin,
//   List,
//   SlidersHorizontal,
//   Loader2,
//   AlertCircle,
//   Sparkles,
//   Package,
//   Wrench,
// } from "lucide-react"
// import {useGeolocation}  from "@/hooks/use-geolocation"
// import { Alert, AlertDescription } from "@barter/ui"
// import { MakeOfferDialog } from "@/components/offers/make-offer-dialog"
// import { useToast } from "@barter/ui"

// // --- DTO ---
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

// // --- category sets ---
// const ITEM_CATEGORIES = [
//   "All",
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
// ]

// const SERVICE_CATEGORIES = [
//   "All",
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
// ]

// export default function DiscoverPage() {
//   const [listings, setListings] = useState<ListingDTO[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [fetchError, setFetchError] = useState<string | null>(null)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [offerTarget, setOfferTarget] = useState<ListingDTO | null>(null)
//   const [showFilters, setShowFilters] = useState(false)

//   const [filters, setFilters] = useState({
//     type: "item" as "item" | "service",
//     category: "All",
//     maxDistance: 10,
//     minRating: 0,
//   })

//   const router = useRouter()
//   const { toast } = useToast()
//   const { latitude, longitude, error: locationError, loading: locationLoading } =
//     useGeolocation()

//   // --- fetch listings when filters or location change ---
//   useEffect(() => {
//     if (latitude && longitude) fetchNearbyListings()
//   }, [latitude, longitude, filters.type, filters.category])

//   // --- API call ---
//   const fetchNearbyListings = async () => {
//     if (!latitude || !longitude) return
//     try {
//       setIsLoading(true)
//       setFetchError(null)

//       const params = new URLSearchParams({
//         latitude: latitude.toString(),
//         longitude: longitude.toString(),
//         radius: filters.maxDistance.toString(),
//         type: filters.type,
//       })

//       if (filters.category && filters.category !== "All")
//         params.append("category", filters.category.toLowerCase().replace(/\s+/g, "_"))
//       if (filters.minRating > 0)
//         params.append("minRating", filters.minRating.toString())
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

//   // --- loading or error states ---
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
//             {/* Type Toggle */}
//             <div className="flex justify-center gap-4">
//               <Button
//                 variant={filters.type === "item" ? "default" : "outline"}
//                 className="flex items-center gap-2 rounded-full"
//                 onClick={() => setFilters({ ...filters, type: "item" })}
//               >
//                 <Package className="h-4 w-4" /> Items
//               </Button>
//               <Button
//                 variant={filters.type === "service" ? "default" : "outline"}
//                 className="flex items-center gap-2 rounded-full"
//                 onClick={() => setFilters({ ...filters, type: "service" })}
//               >
//                 <Wrench className="h-4 w-4" /> Services
//               </Button>
//             </div>

//             {/* Category */}
//             <div>
//               <label className="block text-sm font-medium mb-1">Category</label>
//               <select
//                 className="w-full rounded-lg border p-2"
//                 value={filters.category}
//                 onChange={(e) =>
//                   setFilters({ ...filters, category: e.target.value })
//                 }
//               >
//                 {(filters.type === "item"
//                   ? ITEM_CATEGORIES
//                   : SERVICE_CATEGORIES
//                 ).map((cat) => (
//                   <option key={cat} value={cat}>
//                     {cat}
//                   </option>
//                 ))}
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
//                   setFilters({
//                     ...filters,
//                     maxDistance: Number(e.target.value),
//                   })
//                 }
//                 className="w-full accent-primary"
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
//                   setFilters({
//                     ...filters,
//                     minRating: Number(e.target.value),
//                   })
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
//                 latitude && longitude
//                   ? { latitude, longitude }
//                   : undefined
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




// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { ListingCard } from "@/components/listings/listing-card";
// import { MapView } from "@/components/marketplace/map-view";
// import { BottomNav } from "@barter/ui";
// import { Button } from "@barter/ui";
// import { Input } from "@barter/ui";
// import { Badge } from "@barter/ui";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@barter/ui";
// import {
//   Search,
//   MapPin,
//   List,
//   SlidersHorizontal,
//   Loader2,
//   AlertCircle,
//   Sparkles,
//   Package,
//   Wrench,
//   LocateFixed,
// } from "lucide-react";
// import { useGeolocation } from "@/hooks/use-geolocation";
// import { Alert, AlertDescription } from "@barter/ui";
// import { MakeOfferDialog } from "@/components/offers/make-offer-dialog";
// import { useToast } from "@barter/ui";
// import LocationPrompt from "@/components/locationprompt"; // ✅ imported

// // --- DTO ---
// interface ListingDTO {
//   item_id: number;
//   type: "item" | "service";
//   title: string;
//   description: string;
//   category: string;
//   condition?: string;
//   photos: string[];
//   barter_request?: string;
//   created_at: string;
//   latitude?: number;
//   longitude?: number;
//   location_text?: string;
//   distance_km?: number;
//   user_id: number;
//   user_name: string;
//   user_avatar?: string;
//   user_rating: number;
//   user_rating_count: number;
// }

// // --- category sets ---
// const ITEM_CATEGORIES = [
//   "All",
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
//   "All",
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

// export default function DiscoverPage() {

// useEffect(() => {
//   if (typeof window !== "undefined") {
//     console.log("MEDIAN OBJECT:", (window as any).median);
//     console.log("MEDIANJS OBJECT:", (window as any).MedianJS);
//   }
// }, []);


//   const [listings, setListings] = useState<ListingDTO[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [fetchError, setFetchError] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [offerTarget, setOfferTarget] = useState<ListingDTO | null>(null);
//   const [showFilters, setShowFilters] = useState(false);
//   const [showPrompt, setShowPrompt] = useState(false);

//   const [filters, setFilters] = useState({
//     type: "item" as "item" | "service",
//     category: "All",
//     maxDistance: 10,
//     minRating: 0,
//   });

//   const router = useRouter();
//   const { toast } = useToast();
//   const {
//     latitude,
//     longitude,
//     error: locationError,
//     loading: locationLoading,
//     updateLocation, // ✅ permanent update button
//     // still used by LocationPrompt
//   } = useGeolocation();

//   // ✅ Handle when to show the location prompt
//   useEffect(() => {
//     if (!locationLoading && !latitude && !longitude) {
//       setShowPrompt(true);
//     } else {
//       setShowPrompt(false);
//     }
//   }, [latitude, longitude, locationLoading]);

//   // ✅ Fetch listings when filters or location change
//   useEffect(() => {
//     if (latitude && longitude) {
//       fetchNearbyListings();
//     }
//   }, [latitude, longitude, filters.type, filters.category]);

//   // --- API call ---
//   const fetchNearbyListings = async () => {
//     if (!latitude || !longitude) return;
//     try {
//       setIsLoading(true);
//       setFetchError(null);

//       const params = new URLSearchParams({
//         latitude: latitude.toString(),
//         longitude: longitude.toString(),
//         radius: filters.maxDistance.toString(),
//         type: filters.type,
//       });

//       if (filters.category && filters.category !== "All")
//         params.append(
//           "category",
//           filters.category.toLowerCase().replace(/\s+/g, "_")
//         );
//       if (filters.minRating > 0)
//         params.append("minRating", filters.minRating.toString());
//       if (searchQuery) params.append("q", searchQuery);

//       const res = await fetch(`/api/listings/nearby?${params}`);
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to fetch listings");

//       const normalized = (data.listings || []).map((l: any) => ({
//         ...l,
//         item_id: Number(l.item_id),
//         latitude: Number(l.latitude) || undefined,
//         longitude: Number(l.longitude) || undefined,
//       }));
//       setListings(normalized);
//     } catch (err: any) {
//       setFetchError(err.message || "Error fetching listings");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleOfferSuccess = async (listing: ListingDTO) => {
//     try {
//       setOfferTarget(null);
//       const token = localStorage.getItem("auth_token");
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
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error);
//       const threadId = data.thread?.thread_id;
//       router.push(`/messages/${threadId}`);
//     } catch {
//       toast({
//         title: "Error",
//         description: "Could not start conversation.",
//         variant: "destructive",
//       });
//     }
//   };

//   // ✅ 1. Use LocationPrompt if no coords yet
//   if (showPrompt) {
//     return (
//       <LocationPrompt
//         onSuccess={() => {
//           setShowPrompt(false);
//           updateLocation();
//           fetchNearbyListings();
//         }}
//       />
//     );
//   }

//   // ✅ 2. Loading state
//   if (locationLoading && !latitude && !longitude) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background">
//         <Loader2 className="h-10 w-10 animate-spin text-primary" />
//       </div>
//     );
//   }

//   // ✅ 3. Error state
//   if (fetchError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background p-6">
//         <Alert className="max-w-md mx-auto">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>{fetchError}. Please try again.</AlertDescription>
//         </Alert>
//       </div>
//     );
//   }

//   // ✅ 4. Main UI
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
//           <div className="flex items-center gap-3">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={updateLocation} // ✅ permanent in-app location refresh
//               className="rounded-full flex items-center gap-2"
//             >
//               <LocateFixed className="h-4 w-4" />
//               {locationLoading ? "Updating..." : "My Location"}
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setShowFilters(!showFilters)}
//               className="rounded-full"
//             >
//               <SlidersHorizontal className="h-4 w-4 mr-2" />
//               Filters
//             </Button>
//           </div>
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
//             {/* Type Toggle */}
//             <div className="flex justify-center gap-4">
//               <Button
//                 variant={filters.type === "item" ? "default" : "outline"}
//                 className="flex items-center gap-2 rounded-full"
//                 onClick={() => setFilters({ ...filters, type: "item" })}
//               >
//                 <Package className="h-4 w-4" /> Items
//               </Button>
//               <Button
//                 variant={filters.type === "service" ? "default" : "outline"}
//                 className="flex items-center gap-2 rounded-full"
//                 onClick={() => setFilters({ ...filters, type: "service" })}
//               >
//                 <Wrench className="h-4 w-4" /> Services
//               </Button>
//             </div>

//             {/* Category */}
//             <div>
//               <label className="block text-sm font-medium mb-1">Category</label>
//               <select
//                 className="w-full rounded-lg border p-2"
//                 value={filters.category}
//                 onChange={(e) =>
//                   setFilters({ ...filters, category: e.target.value })
//                 }
//               >
//                 {(filters.type === "item"
//                   ? ITEM_CATEGORIES
//                   : SERVICE_CATEGORIES
//                 ).map((cat) => (
//                   <option key={cat} value={cat}>
//                     {cat}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Distance */}
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
//                   setFilters({
//                     ...filters,
//                     maxDistance: Number(e.target.value),
//                   })
//                 }
//                 className="w-full accent-primary"
//               />
//             </div>

//             {/* Rating */}
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
//                   setFilters({
//                     ...filters,
//                     minRating: Number(e.target.value),
//                   })
//                 }
//                 className="w-full rounded-lg border p-2"
//               />
//             </div>

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
//                           prev.filter((x) => x.item_id !== listing.item_id)
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
//                 latitude && longitude
//                   ? { latitude, longitude }
//                   : undefined
//               }
//               onListingSelect={(l) => router.push(`/listings/${l.item_id}`)}
//             />
//           </TabsContent>
//         </Tabs>
//       </div>

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
//   );
// }



// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { ListingCard } from "@/components/listings/listing-card";
// import { MapView } from "@/components/marketplace/map-view";
// import { BottomNav } from "@barter/ui";
// import { Button } from "@barter/ui";
// import { Input } from "@barter/ui";
// import { Badge } from "@barter/ui";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@barter/ui";
// import {
//   Search,
//   MapPin,
//   List,
//   SlidersHorizontal,
//   Loader2,
//   AlertCircle,
//   Sparkles,
//   Package,
//   Wrench,
//   LocateFixed,
// } from "lucide-react";
// import { useGeolocation } from "@/hooks/use-geolocation";
// import { Alert, AlertDescription } from "@barter/ui";
// import { MakeOfferDialog } from "@/components/offers/make-offer-dialog";
// import { useToast } from "@barter/ui";
// import LocationPrompt from "@/components/locationprompt";

// // --- DTO ---
// interface ListingDTO {
//   item_id: number;
//   type: "item" | "service";
//   title: string;
//   description: string;
//   category: string;
//   condition?: string;
//   photos: string[];
//   barter_request?: string;
//   created_at: string;
//   latitude?: number;
//   longitude?: number;
//   location_text?: string;
//   distance_km?: number;
//   user_id: number;
//   user_name: string;
//   user_avatar?: string;
//   user_rating: number;
//   user_rating_count: number;
// }

// // --- category sets ---
// const ITEM_CATEGORIES = [
//   "All",
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
//   "All",
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

// export default function DiscoverPage() {
//   // 🔍 Median debug – only runs in browser
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       console.log("MEDIAN:", (window as any).Median);
//       console.log("MEDIANJS:", (window as any).MedianJS);
//       console.log("MJS:", (window as any).MJS);
//     }
//   }, []);

//   const [listings, setListings] = useState<ListingDTO[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [fetchError, setFetchError] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [offerTarget, setOfferTarget] = useState<ListingDTO | null>(null);
//   const [showFilters, setShowFilters] = useState(false);
//   const [showPrompt, setShowPrompt] = useState(false);

//   const [filters, setFilters] = useState({
//     type: "item" as "item" | "service",
//     category: "All",
//     maxDistance: 10,
//     minRating: 0,
//   });

//   const router = useRouter();
//   const { toast } = useToast();

//   const {
//     latitude,
//     longitude,
//     error: locationError, // (not used in UI yet, but available)
//     loading: locationLoading,
//     updateLocation,
//   } = useGeolocation();

//   // ✅ Decide when to show the explicit location prompt
//   useEffect(() => {
//     if (!locationLoading && (latitude == null || longitude == null)) {
//       setShowPrompt(true);
//     } else {
//       setShowPrompt(false);
//     }
//   }, [latitude, longitude, locationLoading]);

//   // --- API call ---
//   const fetchNearbyListings = async () => {
//     if (latitude == null || longitude == null) return;

//     try {
//       setIsLoading(true);
//       setFetchError(null);

//       const params = new URLSearchParams({
//         latitude: latitude.toString(),
//         longitude: longitude.toString(),
//         radius: filters.maxDistance.toString(),
//         type: filters.type,
//       });

//       // ✅ send category exactly as stored in DB
//       if (filters.category && filters.category !== "All") {
//         params.append("category", filters.category);
//       }

//       if (filters.minRating > 0) {
//         params.append("minRating", filters.minRating.toString());
//       }

//       if (searchQuery) {
//         params.append("q", searchQuery);
//       }

//       const res = await fetch(`/api/listings/nearby?${params.toString()}`);
//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to fetch listings");
//       }

//       const normalized = (data.listings || []).map((l: any) => ({
//         ...l,
//         item_id: Number(l.item_id),
//         latitude: l.latitude != null ? Number(l.latitude) : undefined,
//         longitude: l.longitude != null ? Number(l.longitude) : undefined,
//       }));

//       setListings(normalized);
//     } catch (err: any) {
//       setFetchError(err?.message || "Error fetching listings");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ✅ Fetch listings whenever location or filters/search change
//   useEffect(() => {
//     if (latitude != null && longitude != null) {
//       fetchNearbyListings();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     latitude,
//     longitude,
//     filters.type,
//     filters.category,
//     filters.maxDistance,
//     filters.minRating,
//     searchQuery,
//   ]);

//   const handleOfferSuccess = async (listing: ListingDTO) => {
//     try {
//       setOfferTarget(null);
//       const token = localStorage.getItem("auth_token");
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
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error);

//       const threadId = data.thread?.thread_id;
//       router.push(`/messages/${threadId}`);
//     } catch {
//       toast({
//         title: "Error",
//         description: "Could not start conversation.",
//         variant: "destructive",
//       });
//     }
//   };

//   // ✅ 1. Use LocationPrompt if we still don't have coordinates
//   if (showPrompt) {
//     return (
//       <LocationPrompt
//         onSuccess={() => {
//           setShowPrompt(false);
//           // This will trigger geolocation hook → effect will refetch listings
//           updateLocation();
//         }}
//       />
//     );
//   }

//   // ✅ 2. Loading state while waiting for initial location
//   if (locationLoading && latitude == null && longitude == null) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background">
//         <Loader2 className="h-10 w-10 animate-spin text-primary" />
//       </div>
//     );
//   }

//   // ✅ 3. Error state (API fetch)
//   if (fetchError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background p-6">
//         <Alert className="max-w-md mx-auto">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>{fetchError}. Please try again.</AlertDescription>
//         </Alert>
//       </div>
//     );
//   }

//   // ✅ 4. Main UI
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
//           <div className="flex items-center gap-3">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={updateLocation}
//               className="rounded-full flex items-center gap-2"
//             >
//               <LocateFixed className="h-4 w-4" />
//               {locationLoading ? "Updating..." : "My Location"}
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setShowFilters(!showFilters)}
//               className="rounded-full"
//             >
//               <SlidersHorizontal className="h-4 w-4 mr-2" />
//               Filters
//             </Button>
//           </div>
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
//             {/* Type Toggle */}
//             <div className="flex justify-center gap-4">
//               <Button
//                 variant={filters.type === "item" ? "default" : "outline"}
//                 className="flex items-center gap-2 rounded-full"
//                 onClick={() => setFilters({ ...filters, type: "item" })}
//               >
//                 <Package className="h-4 w-4" /> Items
//               </Button>
//               <Button
//                 variant={filters.type === "service" ? "default" : "outline"}
//                 className="flex items-center gap-2 rounded-full"
//                 onClick={() => setFilters({ ...filters, type: "service" })}
//               >
//                 <Wrench className="h-4 w-4" /> Services
//               </Button>
//             </div>

//             {/* Category */}
//             <div>
//               <label className="block text-sm font-medium mb-1">Category</label>
//               <select
//                 className="w-full rounded-lg border p-2"
//                 value={filters.category}
//                 onChange={(e) =>
//                   setFilters({ ...filters, category: e.target.value })
//                 }
//               >
//                 {(filters.type === "item"
//                   ? ITEM_CATEGORIES
//                   : SERVICE_CATEGORIES
//                 ).map((cat) => (
//                   <option key={cat} value={cat}>
//                     {cat}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Distance */}
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
//                   setFilters({
//                     ...filters,
//                     maxDistance: Number(e.target.value),
//                   })
//                 }
//                 className="w-full accent-primary"
//               />
//             </div>

//             {/* Rating */}
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
//                   setFilters({
//                     ...filters,
//                     minRating: Number(e.target.value),
//                   })
//                 }
//                 className="w-full rounded-lg border p-2"
//               />
//             </div>

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
//                           prev.filter((x) => x.item_id !== listing.item_id)
//                         )
//                       }
//                     />
//                     {listing.distance_km != null && (
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
//                 latitude != null && longitude != null
//                   ? { latitude, longitude }
//                   : undefined
//               }
//               onListingSelect={(l) => router.push(`/listings/${l.item_id}`)}
//             />
//           </TabsContent>
//         </Tabs>
//       </div>

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
//   );
// }



// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { ListingCard } from "@/components/listings/listing-card";
// import { MapView } from "@/components/marketplace/map-view";
// import { BottomNav } from "@barter/ui";
// import { Button } from "@barter/ui";
// import { Input } from "@barter/ui";
// import { Badge } from "@barter/ui";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@barter/ui";
// import {
//   Search,
//   MapPin,
//   List,
//   SlidersHorizontal,
//   Loader2,
//   AlertCircle,
//   Sparkles,
//   Package,
//   Wrench,
//   LocateFixed,
// } from "lucide-react";
// import { useGeolocation } from "@/hooks/use-geolocation";
// import { Alert, AlertDescription } from "@barter/ui";
// import { MakeOfferDialog } from "@/components/offers/make-offer-dialog";
// import { useToast } from "@barter/ui";
// import LocationPrompt from "@/components/locationprompt";

// /* =======================
//    TYPES
// ======================= */

// interface ListingDTO {
//   item_id: number;
//   type: "item" | "service";
//   title: string;
//   description: string;
//   category: string;
//   condition?: string;
//   photos: string[];
//   barter_request?: string;
//   created_at: string;
//   latitude?: number;
//   longitude?: number;
//   location_text?: string;
//   distance_km?: number;
//   user_id: number;
//   user_name: string;
//   user_avatar?: string;
//   user_rating: number;
//   user_rating_count: number;
// }

// /* =======================
//    CONSTANTS
// ======================= */

// const ITEM_CATEGORIES = [
//   "All",
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
//   "All",
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

// /* =======================
//    PAGE
// ======================= */

// export default function DiscoverPage() {
//   const router = useRouter();
//   const { toast } = useToast();

//   const [listings, setListings] = useState<ListingDTO[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [fetchError, setFetchError] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [offerTarget, setOfferTarget] = useState<ListingDTO | null>(null);
//   const [showFilters, setShowFilters] = useState(false);
//   const [showPrompt, setShowPrompt] = useState(false);
//   const [locationSkipped, setLocationSkipped] = useState(false);

//   const [filters, setFilters] = useState({
//     type: "item" as "item" | "service",
//     category: "All",
//     maxDistance: 10,
//     minRating: 0,
//   });

//   const {
//     latitude,
//     longitude,
//     loading: locationLoading,
//     updateLocation,
//   } = useGeolocation();

//   /* =======================
//      LOCATION PROMPT LOGIC
//   ======================= */

//   useEffect(() => {
//     if (!locationLoading && latitude == null && longitude == null && !locationSkipped) {
//       setShowPrompt(true);
//     } else {
//       setShowPrompt(false);
//     }
//   }, [latitude, longitude, locationLoading, locationSkipped]);

//   /* =======================
//      FETCH LOGIC
//   ======================= */

//   const normalizeListings = (rows: any[]): ListingDTO[] =>
//     rows.map((l) => ({
//       ...l,
//       user_rating: l.user_rating ?? 0,
//       user_rating_count: l.user_rating_count ?? 0,
//       latitude: l.latitude != null ? Number(l.latitude) : undefined,
//       longitude: l.longitude != null ? Number(l.longitude) : undefined,
//     }));

//   const fetchNearbyListings = async () => {
//     if (latitude == null || longitude == null) return;

//     try {
//       setIsLoading(true);
//       setFetchError(null);

//       const params = new URLSearchParams({
//         latitude: latitude.toString(),
//         longitude: longitude.toString(),
//         radius: filters.maxDistance.toString(),
//         type: filters.type,
//       });

//       if (filters.category !== "All") params.append("category", filters.category);
//       if (searchQuery) params.append("q", searchQuery);

//       const res = await fetch(`/api/listings/nearby?${params.toString()}`);
//       const data = await res.json();

//       if (!res.ok) throw new Error(data.error || "Failed to fetch nearby listings");

//       setListings(normalizeListings(data.listings || []));
//     } catch (err: any) {
//       setFetchError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchAllListings = async () => {
//     try {
//       setIsLoading(true);
//       setFetchError(null);

//       const params = new URLSearchParams({
//         limit: "50",
//         type: filters.type,
//       });

//       if (filters.category !== "All") params.append("category", filters.category);

//       const res = await fetch(`/api/listings?${params.toString()}`);
//       const data = await res.json();

//       if (!res.ok) throw new Error("Failed to fetch listings");

//       setListings(normalizeListings(data.listings || []));
//     } catch (err: any) {
//       setFetchError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (latitude != null && longitude != null) {
//       fetchNearbyListings();
//     } else if (locationSkipped) {
//       fetchAllListings();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     latitude,
//     longitude,
//     locationSkipped,
//     filters.type,
//     filters.category,
//     filters.maxDistance,
//     searchQuery,
//   ]);

//   /* =======================
//      EARLY RETURNS
//   ======================= */

//   if (showPrompt) {
//     return (
//       <LocationPrompt
//         onSuccess={() => {
//           setLocationSkipped(false);
//           updateLocation();
//         }}
//         onSkip={() => {
//           setLocationSkipped(true);
//           setShowPrompt(false);
//         }}
//       />
//     );
//   }

//   if (locationLoading && !locationSkipped && latitude == null) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   if (fetchError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-6">
//         <Alert>
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>{fetchError}</AlertDescription>
//         </Alert>
//       </div>
//     );
//   }

//   /* =======================
//      MAIN UI
//   ======================= */

//   return (
//     <div className="min-h-screen bg-background pb-20">
//       <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
//         <div className="flex justify-between items-center p-4">
//           <h1 className="text-xl font-bold flex items-center gap-2">
//             <Sparkles className="h-5 w-5 text-primary" />
//             Discover
//           </h1>

//           <div className="flex gap-2">
//             <Button size="sm" variant="outline" onClick={updateLocation}>
//               <LocateFixed className="h-4 w-4 mr-1" />
//               My Location
//             </Button>

//             <Button size="sm" variant="outline" onClick={() => setShowFilters(!showFilters)}>
//               <SlidersHorizontal className="h-4 w-4 mr-1" />
//               Filters
//             </Button>
//           </div>
//         </div>
//       </header>

//       <div className="p-4 space-y-4">
//         <Input
//           placeholder="Search listings..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />

//         {isLoading ? (
//           <div className="text-center py-16">
//             <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
//             Loading listings...
//           </div>
//         ) : listings.length === 0 ? (
//           <div className="text-center py-16">
//             <p className="text-muted-foreground">No listings found.</p>
//           </div>
//         ) : (
//           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//             {listings.map((listing) => (
//               <ListingCard
//                 key={listing.item_id}
//                 listing={listing}
//                 onViewDetails={() => router.push(`/listings/${listing.item_id}`)}
//                 onMakeOffer={() => setOfferTarget(listing)}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       <BottomNav />
//     </div>
//   );
// }



"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ListingCard } from "@/components/listings/listing-card";
import { BottomNav } from "@barter/ui";
import { Input } from "@barter/ui";
import {
  Loader2,
  AlertCircle,
  Sparkles,
  LocateFixed,
  MapPin,
  X,
  Navigation,
  Building2,
} from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Alert, AlertDescription } from "@barter/ui";
import { useTermsGate } from "@/hooks/use-terms-gate";

/* =======================
   TYPES
======================= */

interface ListingDTO {
  item_id: number;
  type: "item" | "service";
  title: string;
  description: string;
  category: string;
  condition?: string;
  photos: string[];
  barter_request?: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
  location_text?: string;
  distance_km?: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  user_rating: number;
  user_rating_count: number;
}

interface CityOption {
  city: string;
  count: number;
}

/* =======================
   CONSTANTS
======================= */

const RADIUS_MARKS = [1, 5, 10, 25, 50, 100];

const TYPE_TABS = [
  { value: "item", label: "Items" },
  { value: "service", label: "Services" },
];

/* =======================
   PAGE
======================= */

export default function DiscoverPage() {
  useTermsGate();
  const router = useRouter();

  const [listings, setListings] = useState<ListingDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Radius (km) — used in proximity mode
  const [radius, setRadius] = useState(10);
  const [sliderValue, setSliderValue] = useState(10);

  // City filter — when set, bypass radius entirely
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState<CityOption[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  const [listingType, setListingType] = useState<"item" | "service">("item");

  // Location sources
  const { latitude: gpsLat, longitude: gpsLng, loading: gpsLoading, updateLocation } = useGeolocation();
  const [profileLocation, setProfileLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -----------------------
  // HELPERS
  // -----------------------

  const normalizeListings = (rows: any[]): ListingDTO[] =>
    rows.map((l) => ({
      ...l,
      user_rating: l.user_rating ?? 0,
      user_rating_count: l.user_rating_count ?? 0,
      latitude: l.latitude != null ? Number(l.latitude) : undefined,
      longitude: l.longitude != null ? Number(l.longitude) : undefined,
      distance_km: l.distance_km != null ? Number(l.distance_km) : undefined,
    }));

  // -----------------------
  // FETCH CITIES
  // -----------------------

  useEffect(() => {
    fetch("/api/listings/cities")
      .then((r) => r.json())
      .then((d) => setCities(d.cities || []))
      .catch(() => {})
      .finally(() => setCitiesLoading(false));
  }, []);

  // -----------------------
  // FETCH PROFILE LOCATION
  // -----------------------

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.latitude != null && d.user?.longitude != null) {
          setProfileLocation({ latitude: Number(d.user.latitude), longitude: Number(d.user.longitude) });
        }
      })
      .catch(() => {});
  }, []);

  // -----------------------
  // FETCH LISTINGS
  // -----------------------

  const fetchListings = useCallback(async () => {
    // City or "All Pakistan" mode — no coordinates required
    if (selectedCity) {
      try {
        setIsLoading(true);
        setFetchError(null);
        const params = new URLSearchParams({ city: selectedCity, type: listingType });
        if (searchQuery) params.set("q", searchQuery);
        const res = await fetch(`/api/listings/nearby?${params}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");
        setListings(normalizeListings(data.listings || []));
      } catch (err: any) {
        setFetchError(err.message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Radius mode — need coordinates
    const lat = gpsLat ?? profileLocation?.latitude;
    const lng = gpsLng ?? profileLocation?.longitude;
    if (lat == null || lng == null) return;

    try {
      setIsLoading(true);
      setFetchError(null);
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lng.toString(),
        radius: radius.toString(),
        type: listingType,
      });
      if (searchQuery) params.set("q", searchQuery);
      const res = await fetch(`/api/listings/nearby?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setListings(normalizeListings(data.listings || []));
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity, gpsLat, gpsLng, profileLocation, radius, listingType, searchQuery]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // Debounce search input
  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearchQuery(val), 500);
  };

  // Slider commits on mouse/touch release
  const handleSliderCommit = () => {
    setRadius(sliderValue);
    setSelectedCity(""); // clear city when radius is adjusted
  };

  /* =======================
     LOCATION STATUS BAR
  ======================= */

  const usingGPS = gpsLat != null && gpsLng != null;
  const hasLocation = usingGPS || profileLocation != null;

  /* =======================
     EARLY STATE
  ======================= */

  if (gpsLoading && !profileLocation && !selectedCity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* =======================
     MAIN UI
  ======================= */

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Discover
          </h1>
          <button
            onClick={updateLocation}
            disabled={gpsLoading}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border bg-background hover:bg-muted transition-colors disabled:opacity-50"
          >
            {gpsLoading
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Locating…</>
              : <><LocateFixed className="h-3.5 w-3.5 text-primary" /> {usingGPS ? "GPS active" : "Get GPS"}</>
            }
          </button>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">

        {/* ── Location / mode status ── */}
        {selectedCity ? (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5">
            <Building2 className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm font-medium text-primary flex-1">
              {selectedCity === "__all__"
                ? <>Showing <span className="font-bold">all listings across Pakistan</span></>
                : <>Showing listings in <span className="font-bold">{selectedCity}</span></>
              }
            </p>
            <button
              onClick={() => setSelectedCity("")}
              className="p-0.5 rounded-full hover:bg-primary/20 transition-colors"
            >
              <X className="h-4 w-4 text-primary" />
            </button>
          </div>
        ) : hasLocation ? (
          <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-2.5">
            {usingGPS
              ? <Navigation className="h-4 w-4 text-primary shrink-0" />
              : <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            }
            <p className="text-sm text-muted-foreground flex-1">
              {usingGPS ? "Using live GPS" : "Using profile location"} —{" "}
              <span className="font-semibold text-foreground">{radius} km radius</span>
            </p>
            <span className="text-xs text-muted-foreground">{listings.length} results</span>
          </div>
        ) : null}

        {/* ── Radius slider (hidden in city mode) ── */}
        {!selectedCity && (
          <div className="bg-card border rounded-2xl px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Search Radius</p>
              <span className="text-sm font-bold text-primary">{sliderValue} km</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              onMouseUp={handleSliderCommit}
              onTouchEnd={handleSliderCommit}
              className="w-full h-2 rounded-full accent-primary cursor-pointer"
            />
            {/* Quick-pick marks */}
            <div className="flex justify-between">
              {RADIUS_MARKS.map((km) => (
                <button
                  key={km}
                  onClick={() => { setSliderValue(km); setRadius(km); setSelectedCity(""); }}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                    radius === km && !selectedCity
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {km}km
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── City chips ── */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Browse by City</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {/* "All / Nearby" chip */}
            <button
              onClick={() => setSelectedCity("")}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                !selectedCity
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              Nearby
            </button>

            {/* "All Pakistan" chip */}
            <button
              onClick={() => setSelectedCity("__all__")}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                selectedCity === "__all__"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              All Pakistan
            </button>

            {citiesLoading
              ? [...Array(5)].map((_, i) => (
                  <div key={i} className="shrink-0 h-8 w-20 rounded-full bg-muted animate-pulse" />
                ))
              : cities.map(({ city, count }) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                      selectedCity === city
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                    }`}
                  >
                    {city}
                    <span className="ml-1.5 text-[11px] opacity-60">{count}</span>
                  </button>
                ))}
          </div>
        </div>

        {/* ── Type toggle ── */}
        <div className="flex gap-2">
          {TYPE_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setListingType(value as "item" | "service")}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                listingType === value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Input
            placeholder="Search listings…"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="pr-8"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setSearchQuery(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Error ── */}
        {fetchError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        )}

        {/* ── Listings ── */}
        {isLoading ? (
          <div className="text-center py-16 space-y-2">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Finding listings…</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <MapPin className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground text-sm">
              {selectedCity
                ? `No listings found in ${selectedCity}`
                : `No listings within ${radius} km of your location`}
            </p>
            {!selectedCity && (
              <button
                onClick={() => { setSliderValue(50); setRadius(50); }}
                className="text-sm text-primary underline"
              >
                Try expanding to 50 km
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div key={listing.item_id} className="relative">
                <ListingCard
                  listing={listing}
                  onViewDetails={() => router.push(`/listings/${listing.item_id}`)}
                  onMakeOffer={() => router.push(`/listings/${listing.item_id}`)}
                />
                {/* Distance badge — shown in radius mode only */}
                {listing.distance_km != null && !selectedCity && (
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur border rounded-full px-2.5 py-0.5 flex items-center gap-1 pointer-events-none">
                    <MapPin className="h-3 w-3 text-primary" />
                    <span className="text-[11px] font-semibold text-foreground">
                      {listing.distance_km < 1
                        ? `${Math.round(listing.distance_km * 1000)}m`
                        : `${listing.distance_km.toFixed(1)}km`}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ListingCard } from "@/components/listings/listing-card"
import { MapView } from "@/components/marketplace/map-view"
import { BottomNav } from "@/components/ui/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Search, MapPin, List, SlidersHorizontal, Loader2, AlertCircle } from "lucide-react"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Listing {
  id: string
  type: "item" | "service"
  title: string
  description: string
  category: string
  location_name: string
  barter_request?: string
  photos: string[]
  condition?: string
  user_name: string
  user_avatar?: string
  user_rating: number
  user_rating_count: number
  distance_km?: number
  created_at: string
}

const CATEGORIES = [
  "electronics",
  "furniture",
  "appliances",
  "tools",
  "books",
  "clothing",
  "sports_equipment",
  "musical_instruments",
  "moving_help",
  "tutoring",
  "cleaning",
  "handyman",
  "pet_care",
  "gardening",
]

export default function DiscoverPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "item" | "service">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"recent" | "distance" | "rating">("distance")
  const [showFilters, setShowFilters] = useState(false)
  const [radiusKm, setRadiusKm] = useState([10])
  const [pagination, setPagination] = useState({ total: 0, hasMore: false })
  const router = useRouter()

  const { latitude, longitude, error: locationError, loading: locationLoading } = useGeolocation()

  useEffect(() => {
    if (latitude && longitude) {
      fetchNearbyListings()
    }
  }, [latitude, longitude, typeFilter, categoryFilter, sortBy, radiusKm])

  const fetchNearbyListings = async () => {
    if (!latitude || !longitude) return

    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radiusKm[0].toString(),
      })

      if (typeFilter !== "all") params.append("type", typeFilter)
      if (categoryFilter !== "all") params.append("category", categoryFilter)

      const response = await fetch(`/api/listings/nearby?${params}`)
      const data = await response.json()

      if (response.ok) {
        let sortedListings = data.listings

        // Apply sorting
        if (sortBy === "rating") {
          sortedListings = sortedListings.sort((a: Listing, b: Listing) => (b.user_rating || 0) - (a.user_rating || 0))
        } else if (sortBy === "recent") {
          sortedListings = sortedListings.sort(
            (a: Listing, b: Listing) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )
        }
        // Distance sorting is already handled by the API

        setListings(sortedListings)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch nearby listings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredListings = listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.barter_request?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const clearFilters = () => {
    setSearchQuery("")
    setTypeFilter("all")
    setCategoryFilter("all")
    setSortBy("distance")
    setRadiusKm([10])
  }

  if (locationLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <div>
            <h2 className="font-semibold">Getting your location...</h2>
            <p className="text-sm text-muted-foreground">We need your location to show nearby listings</p>
          </div>
        </div>
      </div>
    )
  }

  if (locationError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {locationError}. Please enable location access to discover nearby listings.
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-primary">Discover</h1>
              <p className="text-sm text-muted-foreground">Find items and services near you</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-primary text-primary-foreground" : ""}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for items, services, or what you need..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {showFilters && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="item">Items</SelectItem>
                    <SelectItem value="service">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Closest</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Search Radius: {radiusKm[0]}km</label>
              <Slider value={radiusKm} onValueChange={setRadiusKm} max={50} min={1} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1km</span>
                <span>50km</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{filteredListings.length} results</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Within {radiusKm[0]}km
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Map/List Toggle View */}
      <div className="container mx-auto px-4">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading nearby listings...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground">No listings found within {radiusKm[0]}km of your location.</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-4">
                {filteredListings.map((listing) => (
                  <div key={listing.id} className="relative">
                    <ListingCard
                      listing={listing}
                      onViewDetails={(listing) => router.push(`/listings/${listing.id}`)}
                      onMakeOffer={(listing) => {
                        // TODO: Implement make offer functionality
                        console.log("Make offer for:", listing.id)
                      }}
                    />
                    {listing.distance_km && (
                      <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                        {listing.distance_km.toFixed(1)}km away
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            <MapView
              listings={filteredListings}
              userLocation={latitude && longitude ? { latitude, longitude } : undefined}
              onListingSelect={(listing) => router.push(`/listings/${listing.id}`)}
            />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  )
}

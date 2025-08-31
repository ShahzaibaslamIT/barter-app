"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ListingCard } from "@/components/listings/listing-card"
import { BottomNav } from "@/components/ui/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, MapPin, TrendingUp, Loader2 } from "lucide-react"

interface Listing {
  id: string
  type: "item" | "service"
  title: string
  description: string
  category: string
  location_text: string
  barter_request?: string
  photos: string[]
  condition?: string
  user_name: string
  user_avatar?: string
  user_rating: number
  user_rating_count: number
  created_at: string
}

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchRecentListings()
  }, [])

  const fetchRecentListings = async () => {
    try {
      setIsLoading(true)
      console.log("[v0] Fetching listings from API...")
      const response = await fetch("/api/listings?limit=8&sort=recent")

      console.log("[v0] API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] API response data:", data)
        setListings(data.listings || [])
      } else {
        const errorText = await response.text()
        console.error("[v0] Failed to fetch listings:", response.status, errorText)
        // Fallback to empty array if API fails
        setListings([])
      }
    } catch (error) {
      console.error("[v0] Error fetching listings:", error)
      setListings([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredListings = listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-primary">BarterHub</h1>
              <p className="text-sm text-muted-foreground">Discover local barter opportunities</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push("/post")} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Post
              </Button>
              <Button variant="outline" onClick={() => router.push("/auth")} size="sm">
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Search */}
      <div className="container mx-auto px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="What are you looking for?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            onFocus={() => router.push("/discover")}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-primary/5 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">Active</span>
            </div>
            <p className="text-2xl font-bold">{listings.length}</p>
            <p className="text-sm text-muted-foreground">Local listings</p>
          </div>
          <div className="bg-accent/5 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-accent" />
              <span className="font-semibold text-accent">Nearby</span>
            </div>
            <p className="text-2xl font-bold">10km</p>
            <p className="text-sm text-muted-foreground">Search radius</p>
          </div>
        </div>

        {/* Recent Listings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Recent Listings</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push("/discover")}>
              View All
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading listings...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-muted-foreground">No recent listings found.</p>
              <Button onClick={() => router.push("/post")}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Listing
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredListings.slice(0, 4).map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onViewDetails={(listing) => router.push(`/listings/${listing.id}`)}
                  onMakeOffer={(listing) => {
                    // TODO: Implement make offer functionality
                    console.log("Make offer for:", listing.id)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

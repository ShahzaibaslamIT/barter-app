"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Package, Wrench, Navigation } from "lucide-react"

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

interface MapViewProps {
  listings: Listing[]
  userLocation?: { latitude: number; longitude: number }
  onListingSelect: (listing: Listing) => void
}

export function MapView({ listings, userLocation, onListingSelect }: MapViewProps) {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  const mockMarkers = listings.map((listing, index) => {
    // Create more realistic distribution around user location if available
    const baseLatOffset = userLocation ? 0 : 37.7749
    const baseLngOffset = userLocation ? 0 : -122.4194

    return {
      ...listing,
      lat: (userLocation?.latitude || baseLatOffset) + (Math.random() - 0.5) * 0.02,
      lng: (userLocation?.longitude || baseLngOffset) + (Math.random() - 0.5) * 0.02,
    }
  })

  return (
    <div className="relative h-96 bg-muted rounded-lg overflow-hidden">
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 400 300">
            {/* Mock street lines */}
            <line x1="0" y1="100" x2="400" y2="100" stroke="#666" strokeWidth="2" />
            <line x1="0" y1="200" x2="400" y2="200" stroke="#666" strokeWidth="2" />
            <line x1="100" y1="0" x2="100" y2="300" stroke="#666" strokeWidth="2" />
            <line x1="200" y1="0" x2="200" y2="300" stroke="#666" strokeWidth="2" />
            <line x1="300" y1="0" x2="300" y2="300" stroke="#666" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {userLocation && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            left: "50%",
            top: "50%",
          }}
        >
          <div className="relative">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
            <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full opacity-30 animate-ping" />
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              You are here
            </Badge>
          </div>
        </div>
      )}

      {/* Map Markers */}
      {mockMarkers.map((listing, index) => (
        <div
          key={listing.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
          style={{
            left: `${20 + (index % 4) * 20}%`,
            top: `${30 + Math.floor(index / 4) * 25}%`,
          }}
          onClick={() => setSelectedListing(listing)}
        >
          <div
            className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
              listing.type === "item" ? "bg-primary" : "bg-accent"
            } ${selectedListing?.id === listing.id ? "scale-125" : ""} transition-transform hover:scale-110`}
          >
            {listing.type === "item" ? (
              <Package className="h-4 w-4 text-white" />
            ) : (
              <Wrench className="h-4 w-4 text-white" />
            )}
          </div>
          {listing.distance_km && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity">
              <Badge variant="outline" className="text-xs bg-white">
                {listing.distance_km.toFixed(1)}km
              </Badge>
            </div>
          )}
        </div>
      ))}

      {/* Selected Listing Card */}
      {selectedListing && (
        <div className="absolute bottom-4 left-4 right-4 z-30">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <img
                  src={selectedListing.photos[0] || "/placeholder.svg"}
                  alt={selectedListing.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm line-clamp-1">{selectedListing.title}</h4>
                      <p className="text-xs text-muted-foreground">{selectedListing.user_name}</p>
                      {selectedListing.user_rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs">⭐</span>
                          <span className="text-xs text-muted-foreground">
                            {selectedListing.user_rating.toFixed(1)} ({selectedListing.user_rating_count})
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={selectedListing.type === "item" ? "default" : "secondary"} className="text-xs">
                        {selectedListing.type}
                      </Badge>
                      {selectedListing.distance_km && (
                        <Badge variant="outline" className="text-xs">
                          {selectedListing.distance_km.toFixed(1)}km away
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground line-clamp-1">{selectedListing.location_name}</span>
                  </div>
                  {selectedListing.barter_request && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      Looking for: {selectedListing.barter_request}
                    </p>
                  )}
                  <Button size="sm" className="mt-2 h-7 text-xs" onClick={() => onListingSelect(selectedListing)}>
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2 z-20">
        <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
          +
        </Button>
        <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
          -
        </Button>
        {userLocation && (
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0" title="Center on your location">
            <Navigation className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="absolute bottom-4 left-4 z-20">
        <Card className="shadow-lg">
          <CardContent className="p-2">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span>Items</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-accent rounded-full" />
                <span>Services</span>
              </div>
              {userLocation && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span>You</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

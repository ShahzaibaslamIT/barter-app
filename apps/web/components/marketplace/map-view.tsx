"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Package, Wrench } from "lucide-react"

// ✅ Import the entire Map component dynamically
const DynamicMap = dynamic(() => import('./LeafletMap'), { 
  ssr: false,
  loading: () => (
    <div className="relative h-96 w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
})

interface Listing {
  item_id: number
  type: "item" | "service"
  title: string
  description: string
  category: string
  location_text?: string
  latitude?: number
  longitude?: number
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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const defaultCenter: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [24.8607, 67.0011] // fallback: Karachi

  if (!isMounted) {
    return (
      <div className="relative h-96 w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="relative h-96 w-full rounded-lg overflow-hidden">
      <DynamicMap
        center={defaultCenter}
        listings={listings}
        userLocation={userLocation}
        onListingSelect={(listing) => {
          setSelectedListing(listing)
          onListingSelect(listing)
        }}
      />
    </div>
  )
}
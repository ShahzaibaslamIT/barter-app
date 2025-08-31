"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Loader2 } from "lucide-react"
import { useGeolocation } from "@/hooks/use-geolocation"

interface LocationPickerProps {
  onLocationSelect: (location: { latitude: number; longitude: number; name: string }) => void
  initialLocation?: { latitude: number; longitude: number; name: string }
  className?: string
}

export function LocationPicker({ onLocationSelect, initialLocation, className }: LocationPickerProps) {
  const [locationName, setLocationName] = useState(initialLocation?.name || "")
  const [isManual, setIsManual] = useState(false)
  const { latitude, longitude, error, loading, getCurrentPosition } = useGeolocation()

  useEffect(() => {
    if (latitude && longitude && !isManual) {
      // Reverse geocoding to get location name
      reverseGeocode(latitude, longitude)
    }
  }, [latitude, longitude, isManual])

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Using a simple reverse geocoding approach
      // In production, you might want to use Google Maps API or similar
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      )
      const data = await response.json()
      const name = data.city || data.locality || data.principalSubdivision || "Unknown Location"
      setLocationName(name)
      onLocationSelect({ latitude: lat, longitude: lng, name })
    } catch (error) {
      console.error("Reverse geocoding failed:", error)
      setLocationName("Current Location")
      onLocationSelect({ latitude: lat, longitude: lng, name: "Current Location" })
    }
  }

  const handleUseCurrentLocation = () => {
    setIsManual(false)
    getCurrentPosition()
  }

  const handleManualLocation = () => {
    setIsManual(true)
    // For manual location, we'll use a simple approach
    // In production, you might want to integrate with Google Places API
  }

  const handleLocationNameChange = (value: string) => {
    setLocationName(value)
    if (isManual && value.trim()) {
      // For demo purposes, we'll use default coordinates
      // In production, you'd geocode the location name
      onLocationSelect({
        latitude: 37.7749, // Default to San Francisco
        longitude: -122.4194,
        name: value,
      })
    }
  }

  return (
    <div className={className}>
      <Label htmlFor="location">Location</Label>
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleUseCurrentLocation}
            disabled={loading}
            className="flex-1 bg-transparent"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
            Use Current Location
          </Button>
          <Button type="button" variant="outline" onClick={handleManualLocation} className="flex-1 bg-transparent">
            Enter Manually
          </Button>
        </div>

        <Input
          id="location"
          value={locationName}
          onChange={(e) => handleLocationNameChange(e.target.value)}
          placeholder={isManual ? "Enter your location" : "Detecting location..."}
          disabled={!isManual && loading}
        />

  {error && <p className="text-sm text-red-600">{error} (You can enter your location manually.)</p>}

        {latitude && longitude && !error && (
          <p className="text-sm text-muted-foreground">
            📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        )}
      </div>
    </div>
  )
}

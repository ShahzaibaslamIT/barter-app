// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@barter/ui"
// import { Input } from "@barter/ui"
// import { Label } from "@barter/ui"
// import { MapPin, Loader2 } from "lucide-react"
// import { useGeolocation } from "@/hooks/use-geolocation"

// interface LocationPickerProps {
//   onLocationSelect: (location: {
//     latitude: number
//     longitude: number
//     name: string
//   }) => void
//   initialLocation?: {
//     latitude: number
//     longitude: number
//     name: string
//   }
//   className?: string
// }

// export function LocationPicker({
//   onLocationSelect,
//   initialLocation,
//   className,
// }: LocationPickerProps) {
//   const [locationName, setLocationName] = useState(initialLocation?.name || "")
//   const [isManual, setIsManual] = useState(false)

//   // ✅ GPS-only for listings
//   const { latitude, longitude, accuracy, loading, updateLocation } = useGeolocation()


//   useEffect(() => {
//     if (latitude && longitude && !isManual) {
//       reverseGeocode(latitude, longitude)
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [latitude, longitude, isManual])

//   const reverseGeocode = async (lat: number, lng: number) => {
//     try {
//       const response = await fetch(
//         `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
//       )
//       const data = await response.json()

//       // ✅ Make name more specific (not just country)
//       const parts = [
//         data.locality,                 // often neighborhood / locality
//         data.city || data.principalSubdivision, // city
//         data.principalSubdivision,      // state/province
//         data.countryName,               // country
//       ].filter(Boolean)

//       const name = parts.length ? parts.join(", ") : "Current Location"

//       setLocationName(name)
//       onLocationSelect({ latitude: lat, longitude: lng, name })
//     } catch (error) {
//       console.error("Reverse geocoding failed:", error)
//       setLocationName("Current Location")
//       onLocationSelect({ latitude: lat, longitude: lng, name: "Current Location" })
//     }
//   }

//   const handleUseCurrentLocation = async () => {
//     setIsManual(false)

//     // ✅ GPS ONLY (never profile)
//     // reverseGeocode will run from useEffect once coords update
//     updateLocation()
//   }

//   const handleManualLocation = () => {
//     setIsManual(true)
//   }

//   const handleLocationNameChange = (value: string) => {
//     setLocationName(value)

//     if (isManual && value.trim()) {
//       // NOTE: Placeholder behavior (same as your existing code)
//       // Later you can replace with real geocoding
//       onLocationSelect({
//         latitude: 37.7749,
//         longitude: -122.4194,
//         name: value,
//       })
//     }
//   }

//   return (
//     <div className={className}>
//       <Label htmlFor="location">Location</Label>

//       <div className="space-y-3">
//         <div className="flex gap-2">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={handleUseCurrentLocation}
//             disabled={loading}
//             className="flex-1 bg-transparent"
//           >
//             {loading ? (
//               <Loader2 className="h-4 w-4 animate-spin mr-2" />
//             ) : (
//               <MapPin className="h-4 w-4 mr-2" />
//             )}
//             Use Current Location
//           </Button>

//           <Button
//             type="button"
//             variant="outline"
//             onClick={handleManualLocation}
//             className="flex-1 bg-transparent"
//           >
//             Enter Manually
//           </Button>
//         </div>

//         <Input
//           id="location"
//           value={locationName}
//           onChange={(e) => handleLocationNameChange(e.target.value)}
//           placeholder={isManual ? "Enter your location" : "Use Current Location"}
//           disabled={!isManual && loading}
//         />
// {latitude && longitude && !isManual && (
//   <>
//     <p className="text-sm text-muted-foreground">
//       📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
//     </p>

//     {accuracy && accuracy > 1000 && (
//       <p className="text-xs text-yellow-600 mt-1">
//         📍 Location is approximate. Accuracy depends on your device.
//       </p>
//     )}
//   </>
// )}

//       </div>
//     </div>
//   )
// }


"use client"

import { useState } from "react"
import { Button } from "@barter/ui"
import { Input } from "@barter/ui"
import { Label } from "@barter/ui"
import { MapPin, Loader2, AlertCircle } from "lucide-react"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Alert, AlertDescription } from "@barter/ui"

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number
    longitude: number
    name: string
    city?: string
  }) => void
  initialLocation?: {
    latitude: number
    longitude: number
    name: string
  }
  className?: string
}

export function LocationPicker({
  onLocationSelect,
  initialLocation,
  className,
}: LocationPickerProps) {
  const [locationName, setLocationName] = useState(initialLocation?.name || "")
  const [isManual, setIsManual] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGeocodingPrecise, setIsGeocodingPrecise] = useState(false)

  const { getPreciseLocation } = useGeolocation()
  const [loading, setLoading] = useState(false)

  // ✅ Better reverse geocoding with multiple sources
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocodingPrecise(true)
    try {
      // Try OpenStreetMap Nominatim first (more accurate than BigDataCloud)
      const osmResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18`,
        {
          headers: {
            "User-Agent": "BarterHub/1.0 (support@postocard.com)",
          },
        }
      )

      if (osmResponse.ok) {
        const osmData = await osmResponse.json()

        // Build accurate location name from address components
        const address = osmData.address || {}
        const city = address.city || address.town || address.village || ""
        const parts = [
          address.neighbourhood || address.suburb || address.hamlet,
          city,
          address.state,
          address.country,
        ].filter(Boolean)

        const name = parts.length > 0 ? parts.join(", ") : osmData.display_name

        setLocationName(name)
        onLocationSelect({ latitude: lat, longitude: lng, name, city: city || undefined })
        setError(null)
        return
      }

      // Fallback to BigDataCloud
      const bdcResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      )

      if (bdcResponse.ok) {
        const bdcData = await bdcResponse.json()
        const city = bdcData.city || ""
        const parts = [
          bdcData.locality,
          city || bdcData.principalSubdivision,
          bdcData.countryName,
        ].filter(Boolean)

        const name = parts.length ? parts.join(", ") : "Current Location"

        setLocationName(name)
        onLocationSelect({ latitude: lat, longitude: lng, name, city: city || undefined })
        setError(null)
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err)
      setLocationName("Current Location")
      onLocationSelect({ latitude: lat, longitude: lng, name: "Current Location" })
      setError("Could not get precise address, but location coordinates are accurate")
    } finally {
      setIsGeocodingPrecise(false)
    }
  }

  const handleUseCurrentLocation = async () => {
    setIsManual(false)
    setLoading(true)
    setError(null)

    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser")
      }

      console.log("🔍 Requesting GPS location...")
      
      // ✅ Use the hook's getPreciseLocation with longer timeout
      const position = await new Promise<{
        latitude: number
        longitude: number
        accuracy?: number
      }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            })
          },
          (error) => {
            console.error("GPS Error:", error)
            reject(error)
          },
          {
            enableHighAccuracy: true,
            timeout: 30000, // ✅ Increased to 30 seconds
            maximumAge: 5000, // ✅ Allow 5 second cache
          }
        )
      })
      
      console.log("✅ Got GPS:", position)
      
      await reverseGeocode(position.latitude, position.longitude)
      
      if (position.accuracy && position.accuracy > 100) {
        setError(`Location accuracy: ${Math.round(position.accuracy)}m. For best results, ensure GPS is enabled.`)
      }
    } catch (err: any) {
      console.error("❌ Location error:", err)
      
      // Better error messages based on error code
      let errorMsg = "Failed to get your location. "
      
      if (err.code === 1) {
        errorMsg += "Location permission was denied. Please enable it in your browser settings."
      } else if (err.code === 2) {
        errorMsg += "Location information is unavailable. Try enabling location services."
      } else if (err.code === 3) {
        errorMsg += "Location request timed out. This can happen on desktop. Try using 'Enter Manually' or test on mobile."
      } else if (err.message === "Geolocation is not supported by your browser") {
        errorMsg += "Your browser doesn't support location services."
      } else {
        errorMsg += "Please check your location settings and try again, or enter manually."
      }
      
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleManualLocation = () => {
    setIsManual(true)
    setError(null)
  }

  const handleLocationNameChange = (value: string) => {
    setLocationName(value)

    if (isManual && value.trim()) {
      // For manual entry, use placeholder coordinates for now
      onLocationSelect({
        latitude: 0,
        longitude: 0,
        name: value,
      })
    }
  }

  return (
    <div className={className}>
      <Label htmlFor="location">
        Location <span className="text-destructive">*</span>
      </Label>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleUseCurrentLocation}
            disabled={loading || isGeocodingPrecise}
            className="flex-1 bg-transparent"
          >
            {loading || isGeocodingPrecise ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <MapPin className="h-4 w-4 mr-2" />
            )}
            {loading ? "Getting GPS..." : isGeocodingPrecise ? "Finding address..." : "Use Current Location"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleManualLocation}
            className="flex-1 bg-transparent"
          >
            Enter Manually
          </Button>
        </div>

        <Input
          id="location"
          value={locationName}
          onChange={(e) => handleLocationNameChange(e.target.value)}
          placeholder={isManual ? "Enter your location" : "Click 'Use Current Location'"}
          disabled={!isManual && (loading || isGeocodingPrecise)}
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {!error && locationName && !isManual && (
          <p className="text-xs text-muted-foreground">
            ✓ Location detected successfully
          </p>
        )}
      </div>
    </div>
  )
}
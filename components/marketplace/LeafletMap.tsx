// import { useEffect, useState } from 'react'

// interface Listing {
//   item_id: number
//   type: "item" | "service"
//   title: string
//   description: string
//   category: string
//   location_text?: string
//   latitude?: number
//   longitude?: number
//   barter_request?: string
//   photos: string[]
//   condition?: string
//   user_name: string
//   user_avatar?: string
//   user_rating: number
//   user_rating_count: number
//   distance_km?: number
//   created_at: string
// }

// interface LeafletMapProps {
//   center: [number, number]
//   listings: Listing[]
//   userLocation?: { latitude: number; longitude: number }
//   onListingSelect: (listing: Listing) => void
// }

// // export default function LeafletMap({ center, listings, userLocation, onListingSelect }: LeafletMapProps) {
// //   const [map, setMap] = useState<any>(null)
// //   const [isClient, setIsClient] = useState(false)
// //   const [mapId] = useState(() => `map-${Math.random().toString(36).substr(2, 9)}`)

// //   useEffect(() => {
// //     setIsClient(true)
    
// //     // Dynamic import to avoid SSR issues
// //     const initMap = async () => {
// //       if (typeof window === 'undefined') return
      
// //       const L = (await import('leaflet')).default
      
// //       // Load Leaflet CSS dynamically
// //       if (!document.querySelector('link[href*="leaflet"]')) {
// //         const link = document.createElement('link')
// //         link.rel = 'stylesheet'
// //         link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.min.css'
// //         document.head.appendChild(link)
// //       }
      
// //       // Fix default markers
// //       delete (L.Icon.Default.prototype as any)._getIconUrl
// //       L.Icon.Default.mergeOptions({
// //         iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
// //         iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
// //         shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// //       })

// //       // Create map instance
// //       const mapInstance = L.map(mapId).setView(center, 13)
      
// //       // Add tile layer
// //       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
// //         attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
// //       }).addTo(mapInstance)

// //       // Add user location marker
// //       if (userLocation) {
// //         L.marker([userLocation.latitude, userLocation.longitude])
// //           .addTo(mapInstance)
// //           .bindPopup('You are here')
// //       }

// //       // Add listing markers
// //       listings.forEach(listing => {
// //         if (listing.latitude && listing.longitude) {
// //           const marker = L.marker([listing.latitude, listing.longitude])
// //             .addTo(mapInstance)
// //             .bindPopup(`
// //               <div style="min-width: 150px;">
// //                 <strong>${listing.title}</strong><br/>
// //                 <span style="color: #666; font-size: 12px;">${listing.user_name}</span><br/>
// //                 <span style="color: #999; font-size: 10px;">${listing.category}</span>
// //               </div>
// //             `)
          
// //           marker.on('click', () => {
// //             onListingSelect(listing)
// //           })
// //         }
// //       })

// //       setMap(mapInstance)
// //     }

// //     initMap()

// //     // Cleanup
// //     return () => {
// //       if (map) {
// //         map.remove()
// //         setMap(null)
// //       }
// //     }
// //   }, [mapId, center, listings, userLocation, onListingSelect, map])

// //   if (!isClient) {
// //     return (
// //       <div className="relative h-96 w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
// //         <div className="text-gray-500">Loading map...</div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="relative h-96 w-full rounded-lg overflow-hidden">
// //       <div id={mapId} className="h-full w-full" />
// //     </div>
// //   )
// // }


import { useEffect, useState } from 'react'

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

interface LeafletMapProps {
  center: [number, number]
  listings: Listing[]
  userLocation?: { latitude: number; longitude: number }
  onListingSelect: (listing: Listing) => void
}

export default function LeafletMap({ center, listings, userLocation, onListingSelect }: LeafletMapProps) {
  const [map, setMap] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [mapId] = useState(() => `map-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    setIsClient(true)
    
    // Dynamic import to avoid SSR issues
    const initMap = async () => {
      if (typeof window === 'undefined') return
      
      const L = (await import('leaflet')).default
      
      // Load Leaflet CSS dynamically
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.min.css'
        document.head.appendChild(link)
      }
      
      // Fix default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      // Create map instance
      const mapInstance = L.map(mapId).setView(center, 13)
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance)

      // Add user location marker
      if (userLocation) {
        L.marker([userLocation.latitude, userLocation.longitude])
          .addTo(mapInstance)
          .bindPopup('You are here')
      }

      // Add listing markers
      listings.forEach(listing => {
        if (listing.latitude && listing.longitude) {
          const marker = L.marker([listing.latitude, listing.longitude])
            .addTo(mapInstance)
            .bindPopup(`
              <div style="min-width: 150px;">
                <strong>${listing.title}</strong><br/>
                <span style="color: #666; font-size: 12px;">${listing.user_name}</span><br/>
                <span style="color: #999; font-size: 10px;">${listing.category}</span>
              </div>
            `)
          
          marker.on('click', () => {
            onListingSelect(listing)
          })
        }
      })

      setMap(mapInstance)
    }

    // Only initialize once when client is ready
    if (isClient && !map) {
      // Add a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initMap()
      }, 100)
      
      return () => clearTimeout(timer)
    }

    // Cleanup
    return () => {
      if (map) {
        try {
          map.remove()
        } catch (e) {
          // Ignore cleanup errors
        }
        setMap(null)
      }
    }
  }, [mapId, isClient]) // Removed other dependencies to prevent re-initialization

  // Update markers when listings change
  useEffect(() => {
    if (!map || !isClient) return

    // Clear existing markers (except user location)
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.isUserLocation) return
      if (layer instanceof (window as any).L.Marker) {
        map.removeLayer(layer)
      }
    })

    // Add user location marker
    if (userLocation) {
      const userMarker = (window as any).L.marker([userLocation.latitude, userLocation.longitude])
        .addTo(map)
        .bindPopup('You are here')
      userMarker.options.isUserLocation = true
    }

    // Add listing markers
    listings.forEach(listing => {
      if (listing.latitude && listing.longitude) {
        const marker = (window as any).L.marker([listing.latitude, listing.longitude])
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 150px;">
              <strong>${listing.title}</strong><br/>
              <span style="color: #666; font-size: 12px;">${listing.user_name}</span><br/>
              <span style="color: #999; font-size: 10px;">${listing.category}</span>
            </div>
          `)
        
        marker.on('click', () => {
          onListingSelect(listing)
        })
      }
    })
  }, [map, listings, userLocation, onListingSelect, isClient])

  if (!isClient) {
    return (
      <div className="relative h-96 w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="relative h-96 w-full rounded-lg overflow-hidden">
      <div id={mapId} className="h-full w-full" />
    </div>
  )
}
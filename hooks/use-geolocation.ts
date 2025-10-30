// // "use client"

// // import { useState, useEffect } from "react"

// // interface GeolocationState {
// //   latitude: number | null
// //   longitude: number | null
// //   error: string | null
// //   loading: boolean
// // }

// // interface GeolocationOptions {
// //   enableHighAccuracy?: boolean
// //   timeout?: number
// //   maximumAge?: number
// // }

// // export function useGeolocation(options: GeolocationOptions = {}) {
// //   const [state, setState] = useState<GeolocationState>({
// //     latitude: null,
// //     longitude: null,
// //     error: null,
// //     loading: true,
// //   })

// //   useEffect(() => {
// //     if (!navigator.geolocation) {
// //       setState((prev) => ({
// //         ...prev,
// //         error: "Geolocation is not supported by this browser",
// //         loading: false,
// //       }))
// //       return
// //     }

// //     const handleSuccess = (position: GeolocationPosition) => {
// //       setState({
// //         latitude: position.coords.latitude,
// //         longitude: position.coords.longitude,
// //         error: null,
// //         loading: false,
// //       })
// //     }

// //     const handleError = (error: GeolocationPositionError) => {
// //       let errorMessage = "An unknown error occurred"

// //       switch (error.code) {
// //         case error.PERMISSION_DENIED:
// //           errorMessage = "Location access denied by user"
// //           break
// //         case error.POSITION_UNAVAILABLE:
// //           errorMessage = "Location information is unavailable"
// //           break
// //         case error.TIMEOUT:
// //           errorMessage = "Location request timed out"
// //           break
// //       }

// //       setState((prev) => ({
// //         ...prev,
// //         error: errorMessage,
// //         loading: false,
// //       }))
// //     }

// //     const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
// //       enableHighAccuracy: options.enableHighAccuracy ?? true,
// //       timeout: options.timeout ?? 60000,
// //       maximumAge: options.maximumAge ?? 300000, // 5 minutes
// //     })

// //     return () => {
// //       navigator.geolocation.clearWatch(watchId)
// //     }
// //   }, [options.enableHighAccuracy, options.timeout, options.maximumAge])

// //   const getCurrentPosition = () => {
// //     setState((prev) => ({ ...prev, loading: true }))

// //     navigator.geolocation.getCurrentPosition(
// //       (position) => {
// //         setState({
// //           latitude: position.coords.latitude,
// //           longitude: position.coords.longitude,
// //           error: null,
// //           loading: false,
// //         })
// //       },
// //       (error) => {
// //         let errorMessage = "Failed to get current position"

// //         switch (error.code) {
// //           case error.PERMISSION_DENIED:
// //             errorMessage = "Location access denied"
// //             break
// //           case error.POSITION_UNAVAILABLE:
// //             errorMessage = "Location unavailable"
// //             break
// //           case error.TIMEOUT:
// //             errorMessage = "Location request timed out"
// //             break
// //         }

// //         setState((prev) => ({
// //           ...prev,
// //           error: errorMessage,
// //           loading: false,
// //         }))
// //       },
// //       {
// //         enableHighAccuracy: options.enableHighAccuracy ?? true,
// //         timeout: options.timeout ?? 10000,
// //         maximumAge: options.maximumAge ?? 0,
// //       },
// //     )
// //   }

// //   return {
// //     ...state,
// //     getCurrentPosition,
// //   }
// // }



// "use client"

// import { useState, useEffect } from "react"

// interface GeolocationState {
//   latitude: number | null
//   longitude: number | null
//   error: string | null
//   loading: boolean
// }

// interface GeolocationOptions {
//   enableHighAccuracy?: boolean
//   timeout?: number
//   maximumAge?: number
// }

// export function useGeolocation(options: GeolocationOptions = {}) {
//   const [state, setState] = useState<GeolocationState>({
//     latitude: null,
//     longitude: null,
//     error: null,
//     loading: true,
//   })

//   useEffect(() => {
//     if (!navigator.geolocation) {
//       console.error("❌ Geolocation API not supported in this browser")
//       setState((prev) => ({
//         ...prev,
//         error: "Geolocation is not supported by this browser",
//         loading: false,
//       }))
//       return
//     }

//     console.log("📡 Starting geolocation watch with options:", {
//       enableHighAccuracy: options.enableHighAccuracy ?? true,
//       timeout: options.timeout ?? 60000,
//       maximumAge: options.maximumAge ?? 300000,
//     })

//     const handleSuccess = (position: GeolocationPosition) => {
//       console.log("✅ Location success:", {
//         latitude: position.coords.latitude,
//         longitude: position.coords.longitude,
//         accuracy: position.coords.accuracy,
//         timestamp: new Date(position.timestamp).toISOString(),
//       })
//       setState({
//         latitude: position.coords.latitude,
//         longitude: position.coords.longitude,
//         error: null,
//         loading: false,
//       })
//     }

//     const handleError = (error: GeolocationPositionError) => {
//       let errorMessage = "An unknown error occurred"
//       switch (error.code) {
//         case error.PERMISSION_DENIED:
//           errorMessage = "Location access denied by user"
//           break
//         case error.POSITION_UNAVAILABLE:
//           errorMessage = "Location information is unavailable"
//           break
//         case error.TIMEOUT:
//           errorMessage = "Location request timed out"
//           break
//       }
//       console.error("❌ Location error:", { code: error.code, message: errorMessage })
//       setState((prev) => ({
//         ...prev,
//         error: errorMessage,
//         loading: false,
//       }))
//     }

//     const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
//       enableHighAccuracy: options.enableHighAccuracy ?? true,
//       timeout: options.timeout ?? 60000, // increased default to 60s
//       maximumAge: options.maximumAge ?? 300000, // 5 minutes
//     })

//     return () => {
//       console.log("🛑 Clearing geolocation watch:", watchId)
//       navigator.geolocation.clearWatch(watchId)
//     }
//   }, [options.enableHighAccuracy, options.timeout, options.maximumAge])

//   const getCurrentPosition = () => {
//     console.log("📍 Triggering one-time getCurrentPosition()...")
//     setState((prev) => ({ ...prev, loading: true }))

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         console.log("✅ One-time location success:", {
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//           accuracy: position.coords.accuracy,
//           timestamp: new Date(position.timestamp).toISOString(),
//         })
//         setState({
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//           error: null,
//           loading: false,
//         })
//       },
//       (error) => {
//         let errorMessage = "Failed to get current position"
//         switch (error.code) {
//           case error.PERMISSION_DENIED:
//             errorMessage = "Location access denied"
//             break
//           case error.POSITION_UNAVAILABLE:
//             errorMessage = "Location unavailable"
//             break
//           case error.TIMEOUT:
//             errorMessage = "Location request timed out"
//             break
//         }
//         console.error("❌ One-time location error:", { code: error.code, message: errorMessage })
//         setState((prev) => ({
//           ...prev,
//           error: errorMessage,
//           loading: false,
//         }))
//       },
//       {
//         enableHighAccuracy: options.enableHighAccuracy ?? true,
//         timeout: options.timeout ?? 10000,
//         maximumAge: options.maximumAge ?? 0,
//       }
//     )
//   }

//   return {
//     ...state,
//     getCurrentPosition,
//   };


// "use client"

// import { useState, useEffect } from "react"

// interface GeolocationState {
//   latitude: number | null
//   longitude: number | null
//   accuracy: number | null
//   error: string | null
//   loading: boolean
// }

// interface GeolocationOptions {
//   enableHighAccuracy?: boolean
//   timeout?: number
//   maximumAge?: number
// }

// export function useGeolocation(options: GeolocationOptions = {}) {
//   const [state, setState] = useState<GeolocationState>({
//     latitude: null,
//     longitude: null,
//     accuracy: null,
//     error: null,
//     loading: true,
//   })

//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setState((prev) => ({
//         ...prev,
//         error: "Geolocation is not supported by this browser",
//         loading: false,
//       }))
//       return
//     }

//     const handleSuccess = (position: GeolocationPosition) => {
//       console.log("📡 Position received:", {
//         lat: position.coords.latitude,
//         lon: position.coords.longitude,
//         accuracy: position.coords.accuracy,
//       })

//       if (position.coords.accuracy > 1000) {
//         console.warn("⚠️ Low accuracy: likely IP-based location (city-level only).")
//       }

//       setState({
//         latitude: position.coords.latitude,
//         longitude: position.coords.longitude,
//         accuracy: position.coords.accuracy,
//         error: null,
//         loading: false,
//       })
//     }

//     const handleError = (error: GeolocationPositionError) => {
//       let errorMessage = "An unknown error occurred"
//       switch (error.code) {
//         case error.PERMISSION_DENIED:
//           errorMessage = "Location access denied by user"
//           break
//         case error.POSITION_UNAVAILABLE:
//           errorMessage = "Location information is unavailable"
//           break
//         case error.TIMEOUT:
//           errorMessage = "Location request timed out"
//           break
//       }

//       console.error("❌ Geolocation error:", error, {
//         code: error.code,
//         message: errorMessage,
//       })

//       setState((prev) => ({
//         ...prev,
//         error: errorMessage,
//         loading: false,
//       }))
//     }

//     const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
//       enableHighAccuracy: options.enableHighAccuracy ?? true,
//       timeout: options.timeout ?? 60000,
//       maximumAge: options.maximumAge ?? 300000, // 5 minutes
//     })

//     return () => {
//       navigator.geolocation.clearWatch(watchId)
//     }
//   }, [options.enableHighAccuracy, options.timeout, options.maximumAge])

//   const getCurrentPosition = () => {
//     setState((prev) => ({ ...prev, loading: true }))

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         console.log("📍 One-time position:", {
//           lat: position.coords.latitude,
//           lon: position.coords.longitude,
//           accuracy: position.coords.accuracy,
//         })

//         if (position.coords.accuracy > 1000) {
//           console.warn("⚠️ Low accuracy on one-time request (IP-based, city-level).")
//         }

//         setState({
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//           accuracy: position.coords.accuracy,
//           error: null,
//           loading: false,
//         })
//       },
//       (error) => {
//         let errorMessage = "Failed to get current position"
//         switch (error.code) {
//           case error.PERMISSION_DENIED:
//             errorMessage = "Location access denied"
//             break
//           case error.POSITION_UNAVAILABLE:
//             errorMessage = "Location unavailable"
//             break
//           case error.TIMEOUT:
//             errorMessage = "Location request timed out"
//             break
//         }

//         console.error("❌ One-time location error:", error, {
//           code: error.code,
//           message: errorMessage,
//         })

//         setState((prev) => ({
//           ...prev,
//           error: errorMessage,
//           loading: false,
//         }))
//       },
//       {
//         enableHighAccuracy: options.enableHighAccuracy ?? true,
//         timeout: options.timeout ?? 10000,
//         maximumAge: options.maximumAge ?? 0,
//       }
//     )
//   }

//   return {
//     ...state,
//     getCurrentPosition,
//   }
// }


"use client";

import { useState, useEffect, useRef } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  minDistance?: number; // 👈 added optional config
}

// 📏 helper to compute distance in meters between two points
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  return (
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(Δφ / 2) ** 2 +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
      )
    )
  );
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  // 🚦 track last accepted coordinates to avoid spam updates
  const lastPositionRef = useRef<{ lat: number; lon: number } | null>(null);
  const minDistance = options.minDistance ?? 100; // default 100 m before update

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by this browser",
        loading: false,
      }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      const last = lastPositionRef.current;
      const moved =
        !last ||
        getDistanceMeters(latitude, longitude, last.lat, last.lon) > minDistance;

      if (!moved) {
        // 📉 Ignore tiny GPS drifts
        return;
      }

      lastPositionRef.current = { lat: latitude, lon: longitude };

      console.log("📡 Position accepted:", { latitude, longitude, accuracy });

      setState({
        latitude,
        longitude,
        accuracy,
        error: null,
        loading: false,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = "An unknown error occurred";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied by user";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out";
          break;
      }

      console.error("❌ Geolocation error:", errorMessage);

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    };

    // 🛰 watchPosition but throttled by distance check above
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 60000,
      maximumAge: options.maximumAge ?? 300000,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge, minDistance]);

  const getCurrentPosition = () => {
    setState((prev) => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        lastPositionRef.current = { lat: latitude, lon: longitude };
        setState({
          latitude,
          longitude,
          accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = "Failed to get current position";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      },
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 0,
      }
    );
  };

  return {
    ...state,
    getCurrentPosition,
  };
}

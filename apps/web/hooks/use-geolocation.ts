// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";

// interface GeolocationState {
//   latitude: number | null;
//   longitude: number | null;
//   accuracy: number | null;
//   loading: boolean;
// }

// interface GeolocationOptions {
//   minDistance?: number;
// }

// /* =========================
//    UTILS
// ========================= */

// // 📏 Distance calculation (meters)
// function getDistanceMeters(
//   lat1: number,
//   lon1: number,
//   lat2: number,
//   lon2: number
// ): number {
//   const R = 6371e3;
//   const φ1 = (lat1 * Math.PI) / 180;
//   const φ2 = (lat2 * Math.PI) / 180;
//   const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//   const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//   return (
//     2 *
//     R *
//     Math.asin(
//       Math.sqrt(
//         Math.sin(Δφ / 2) ** 2 +
//           Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
//       )
//     )
//   );
// }

// // 🌍 IP fallback (never fatal)
// async function getIPLocation() {
//   try {
//     const res = await fetch("https://ipapi.co/json/");
//     const data = await res.json();

//     if (data?.latitude && data?.longitude) {
//       return {
//         latitude: Number(data.latitude),
//         longitude: Number(data.longitude),
//         accuracy: 5000,
//       };
//     }
//   } catch {
//     // silent
//   }
//   return null;
// }

// /* =========================
//    HOOK
// ========================= */

// export function useGeolocation(options: GeolocationOptions = {}) {
//   const [state, setState] = useState<GeolocationState>({
//     latitude: null,
//     longitude: null,
//     accuracy: null,
//     loading: true,
//   });

//   const watchIdRef = useRef<number | null>(null);
//   const lastPositionRef = useRef<{ lat: number; lon: number } | null>(null);
//   const minDistance = options.minDistance ?? 100;

//   /* =========================
//      CLEANUP
//   ========================= */

//   const clearWatcher = useCallback(() => {
//     if (watchIdRef.current !== null && navigator.geolocation) {
//       navigator.geolocation.clearWatch(watchIdRef.current);
//       watchIdRef.current = null;
//     }
//   }, []);

//   /* =========================
//      BACKGROUND TRACKING (SAFE)
//      Used for discovery page
//   ========================= */

//   const requestLocation = useCallback(async () => {
//     setState((prev) => ({ ...prev, loading: true }));

//     // 1️⃣ Median Native SDK (if exists)
//     try {
//       if (typeof window !== "undefined" && (window as any).Median?.getLocation) {
//         const loc = await (window as any).Median.getLocation();
//         if (loc?.latitude && loc?.longitude) {
//           setState({
//             latitude: loc.latitude,
//             longitude: loc.longitude,
//             accuracy: loc.accuracy ?? 20,
//             loading: false,
//           });
//           return;
//         }
//       }
//     } catch {
//       // ignore
//     }

//     // 2️⃣ Browser GPS (watch mode)
//     if (navigator.geolocation) {
//       clearWatcher();

//       const handleSuccess = (pos: GeolocationPosition) => {
//         const { latitude, longitude, accuracy } = pos.coords;

//         const last = lastPositionRef.current;
//         const moved =
//           !last ||
//           getDistanceMeters(latitude, longitude, last.lat, last.lon) >
//             minDistance;

//         if (!moved) return;

//         lastPositionRef.current = { lat: latitude, lon: longitude };

//         setState({
//           latitude,
//           longitude,
//           accuracy,
//           loading: false,
//         });
//       };

//       const handleError = async () => {
//         const ipLoc = await getIPLocation();
//         if (ipLoc) {
//           setState({
//             latitude: ipLoc.latitude,
//             longitude: ipLoc.longitude,
//             accuracy: ipLoc.accuracy,
//             loading: false,
//           });
//         } else {
//           setState((prev) => ({ ...prev, loading: false }));
//         }
//       };

//       watchIdRef.current = navigator.geolocation.watchPosition(
//         handleSuccess,
//         handleError,
//         {
//           enableHighAccuracy: true,
//           timeout: 20000,
//           maximumAge: 300000, // OK for background
//         }
//       );
//       return;
//     }

//     // 3️⃣ IP fallback
//     const ipLoc = await getIPLocation();
//     if (ipLoc) {
//       setState({
//         latitude: ipLoc.latitude,
//         longitude: ipLoc.longitude,
//         accuracy: ipLoc.accuracy,
//         loading: false,
//       });
//     } else {
//       setState((prev) => ({ ...prev, loading: false }));
//     }
//   }, [clearWatcher, minDistance]);

//   /* =========================
//      ONE-SHOT PRECISE GPS
//      Used for "Use Current Location"
//   ========================= */

//   const getPreciseLocation = useCallback(async () => {
//     return new Promise<{
//       latitude: number;
//       longitude: number;
//       accuracy?: number;
//     }>((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject("Geolocation not supported");
//         return;
//       }

//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           resolve({
//             latitude: pos.coords.latitude,
//             longitude: pos.coords.longitude,
//             accuracy: pos.coords.accuracy,
//           });
//         },
//         async () => {
//           const ipLoc = await getIPLocation();
//           if (ipLoc) {
//             resolve(ipLoc);
//           } else {
//             reject("Failed to get location");
//           }
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 15000,
//           maximumAge: 0, // 🚨 DO NOT use cached location
//         }
//       );
//     });
//   }, []);

//   /* =========================
//      MANUAL UPDATE (legacy)
//   ========================= */

//   const updateLocation = useCallback(async () => {
//     setState((prev) => ({ ...prev, loading: true }));

//     try {
//       const pos = await getPreciseLocation();
//       setState({
//         latitude: pos.latitude,
//         longitude: pos.longitude,
//         accuracy: pos.accuracy ?? null,
//         loading: false,
//       });
//     } catch {
//       setState((prev) => ({ ...prev, loading: false }));
//     }
//   }, [getPreciseLocation]);

//   /* =========================
//      INIT
//   ========================= */

//   useEffect(() => {
//     requestLocation();
//     return () => clearWatcher();
//   }, [requestLocation, clearWatcher]);

//   /* =========================
//      EXPORT
//   ========================= */

//   return {
//     latitude: state.latitude,
//     longitude: state.longitude,
//     accuracy: state.accuracy,
//     loading: state.loading,
//     updateLocation,
//     getPreciseLocation, // ✅ NEW — USE THIS FOR BUTTONS
//     retry: requestLocation,
//   };
// }


"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
}

interface GeolocationOptions {
  minDistance?: number;
}

/* =========================
   UTILS
========================= */

// 📏 Distance calculation (meters)
function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
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
          Math.cos(φ1) *
            Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2
      )
    )
  );
}

/* =========================
   HOOK
========================= */

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
  });

  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ lat: number; lon: number } | null>(null);
  const minDistance = options.minDistance ?? 100;

  /* =========================
     CLEANUP
  ========================= */

  const clearWatcher = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  /* =========================
     BACKGROUND TRACKING (GPS ONLY)
     Used for discovery page
  ========================= */

  const requestLocation = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }));

    if (!navigator.geolocation) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    clearWatcher();

    const handleSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;

      const last = lastPositionRef.current;
      const moved =
        !last ||
        getDistanceMeters(latitude, longitude, last.lat, last.lon) >
          minDistance;

      if (!moved) return;

      lastPositionRef.current = { lat: latitude, lon: longitude };

      setState({
        latitude,
        longitude,
        accuracy,
        loading: false,
      });
    };

    const handleError = () => {
      // ❗ NO IP FALLBACK — FAIL HONESTLY
      setState((prev) => ({ ...prev, loading: false }));
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 300000, // OK for discovery
      }
    );
  }, [clearWatcher, minDistance]);

  /* =========================
     ONE-SHOT PRECISE GPS
     Used for "Use Current Location"
  ========================= */

  const getPreciseLocation = useCallback(() => {
    return new Promise<{
      latitude: number;
      longitude: number;
      accuracy?: number;
    }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        () => {
          // ❗ NO IP FALLBACK
          reject("Failed to get precise location");
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0, // 🚨 never cached
        }
      );
    });
  }, []);

  /* =========================
     MANUAL UPDATE (legacy)
  ========================= */

  const updateLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const pos = await getPreciseLocation();
      setState({
        latitude: pos.latitude,
        longitude: pos.longitude,
        accuracy: pos.accuracy ?? null,
        loading: false,
      });
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [getPreciseLocation]);

  /* =========================
     INIT
  ========================= */

  useEffect(() => {
    requestLocation();
    return () => clearWatcher();
  }, [requestLocation, clearWatcher]);

  /* =========================
     EXPORT
  ========================= */

  return {
    latitude: state.latitude,
    longitude: state.longitude,
    accuracy: state.accuracy,
    loading: state.loading,
    updateLocation,
    getPreciseLocation, // ✅ for buttons
    retry: requestLocation,
  };
}

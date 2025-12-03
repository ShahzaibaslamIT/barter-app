

// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";

// interface GeolocationState {
//   latitude: number | null;
//   longitude: number | null;
//   accuracy: number | null;
//   error: string | null;
//   loading: boolean;
// }

// interface GeolocationOptions {
//   enableHighAccuracy?: boolean;
//   timeout?: number;
//   maximumAge?: number;
//   minDistance?: number; // 👈 optional threshold (m)
// }

// // 📏 helper: distance in meters between two coordinates
// function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// export function useGeolocation(options: GeolocationOptions = {}) {
//   const [state, setState] = useState<GeolocationState>({
//     latitude: null,
//     longitude: null,
//     accuracy: null,
//     error: null,
//     loading: true,
//   });

//   const lastPositionRef = useRef<{ lat: number; lon: number } | null>(null);
//   const minDistance = options.minDistance ?? 100; // default 100 m

//   // ✅ wrapped location request (can be reused)
//   const requestLocation = useCallback(() => {
//     if (!navigator.geolocation) {
//       setState((prev) => ({
//         ...prev,
//         error: "Geolocation is not supported by this browser",
//         loading: false,
//       }));
//       return;
//     }

//     const handleSuccess = (position: GeolocationPosition) => {
//       const { latitude, longitude, accuracy } = position.coords;
//       const last = lastPositionRef.current;
//       const moved =
//         !last ||
//         getDistanceMeters(latitude, longitude, last.lat, last.lon) > minDistance;

//       if (!moved) return; // ignore micro-drifts
//       lastPositionRef.current = { lat: latitude, lon: longitude };

//       setState({
//         latitude,
//         longitude,
//         accuracy,
//         error: null,
//         loading: false,
//       });
//     };

//     const handleError = (error: GeolocationPositionError) => {
//       let errorMessage = "An unknown error occurred";
//       switch (error.code) {
//         case error.PERMISSION_DENIED:
//           errorMessage = "Location access denied by user";
//           break;
//         case error.POSITION_UNAVAILABLE:
//           errorMessage = "Location information is unavailable";
//           break;
//         case error.TIMEOUT:
//           errorMessage = "Location request timed out";
//           break;
//       }
//       setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
//     };

//     // start watchPosition again (so continuous tracking works)
//     const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
//       enableHighAccuracy: options.enableHighAccuracy ?? true,
//       timeout: options.timeout ?? 60000,
//       maximumAge: options.maximumAge ?? 300000,
//     });

//     return () => navigator.geolocation.clearWatch(watchId);
//   }, [options.enableHighAccuracy, options.timeout, options.maximumAge, minDistance]);

//   useEffect(() => {
//     const cleanup = requestLocation();

//     // ✅ re-listen for permission changes (mobile browsers + Median)
//     if (navigator.permissions?.query) {
//       navigator.permissions
//         .query({ name: "geolocation" as PermissionName })
//         .then((status) => {
//           status.onchange = () => {
//             console.log("📍 Permission changed:", status.state);
//             if (status.state === "granted") {
//               requestLocation(); // re-try immediately
//             } else if (status.state === "denied") {
//               setState((prev) => ({
//                 ...prev,
//                 error: "Location access denied by user",
//                 loading: false,
//               }));
//             }
//           };
//         })
//         .catch(() => {
//           // some WebViews don’t implement Permission API
//         });
//     }

//     return cleanup;
//   }, [requestLocation]);

//   // one-time manual trigger (for Retry button)
//   const getCurrentPosition = () => {
//     setState((prev) => ({ ...prev, loading: true }));
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const { latitude, longitude, accuracy } = pos.coords;
//         lastPositionRef.current = { lat: latitude, lon: longitude };
//         setState({ latitude, longitude, accuracy, error: null, loading: false });
//       },
//       (error) => {
//         let msg = "Failed to get current position";
//         switch (error.code) {
//           case error.PERMISSION_DENIED:
//             msg = "Location access denied";
//             break;
//           case error.POSITION_UNAVAILABLE:
//             msg = "Location unavailable";
//             break;
//           case error.TIMEOUT:
//             msg = "Location request timed out";
//             break;
//         }
//         setState((prev) => ({ ...prev, error: msg, loading: false }));
//       },
//       {
//         enableHighAccuracy: options.enableHighAccuracy ?? true,
//         timeout: options.timeout ?? 10000,
//         maximumAge: options.maximumAge ?? 0,
//       }
//     );
//   };

//   return {
//     ...state,
//     getCurrentPosition,
//     retry: requestLocation, // 🔁 public retry function
//   };
// }




// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";

// interface GeolocationState {
//   latitude: number | null;
//   longitude: number | null;
//   accuracy: number | null;
//   error: string | null;
//   loading: boolean;
// }

// interface GeolocationOptions {
//   enableHighAccuracy?: boolean;
//   timeout?: number;
//   maximumAge?: number;
//   minDistance?: number; // 👈 optional threshold (m)
// }

// // 📏 helper: distance in meters between two coordinates
// function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// export function useGeolocation(options: GeolocationOptions = {}) {
//   const [state, setState] = useState<GeolocationState>({
//     latitude: null,
//     longitude: null,
//     accuracy: null,
//     error: null,
//     loading: true,
//   });

//   const watchIdRef = useRef<number | null>(null);
//   const lastPositionRef = useRef<{ lat: number; lon: number } | null>(null);
//   const minDistance = options.minDistance ?? 100; // default 100 m

//   // ✅ helper to clear any existing watcher
//   const clearWatcher = useCallback(() => {
//     if (watchIdRef.current !== null) {
//       navigator.geolocation.clearWatch(watchIdRef.current);
//       watchIdRef.current = null;
//     }
//   }, []);

//   // ✅ wrapped location request (main logic)
//   const requestLocation = useCallback(() => {
//     if (!navigator.geolocation) {
//       setState((prev) => ({
//         ...prev,
//         error: "Geolocation is not supported by this browser",
//         loading: false,
//       }));
//       return;
//     }

//     setState((prev) => ({ ...prev, loading: true, error: null }));

//     const handleSuccess = (position: GeolocationPosition) => {
//       const { latitude, longitude, accuracy } = position.coords;
//       const last = lastPositionRef.current;
//       const moved =
//         !last ||
//         getDistanceMeters(latitude, longitude, last.lat, last.lon) > minDistance;

//       if (!moved) return; // ignore micro-drifts
//       lastPositionRef.current = { lat: latitude, lon: longitude };

//       setState({
//         latitude,
//         longitude,
//         accuracy,
//         error: null,
//         loading: false,
//       });
//     };

//     const handleError = (error: GeolocationPositionError) => {
//       let errorMessage = "An unknown error occurred";
//       switch (error.code) {
//         case error.PERMISSION_DENIED:
//           errorMessage = "Location access denied by user";
//           break;
//         case error.POSITION_UNAVAILABLE:
//           errorMessage = "Location information is unavailable";
//           break;
//         case error.TIMEOUT:
//           errorMessage = "Location request timed out";
//           break;
//       }
//       setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
//     };

//     // ✅ clear any existing watcher first
//     clearWatcher();

//     // ✅ start watching again
//     const id = navigator.geolocation.watchPosition(handleSuccess, handleError, {
//       enableHighAccuracy: options.enableHighAccuracy ?? true,
//       timeout: options.timeout ?? 60000,
//       maximumAge: options.maximumAge ?? 300000,
//     });

//     watchIdRef.current = id;
//   }, [
//     options.enableHighAccuracy,
//     options.timeout,
//     options.maximumAge,
//     minDistance,
//     clearWatcher,
//   ]);

//   // ✅ hook mount: start + permission change handling
//   useEffect(() => {
//     requestLocation();

//     // ✅ re-listen for permission changes (e.g., user allows later)
//     if (navigator.permissions?.query) {
//       navigator.permissions
//         .query({ name: "geolocation" as PermissionName })
//         .then((status) => {
//           status.onchange = () => {
//             console.log("📍 Permission changed:", status.state);
//             if (status.state === "granted") {
//               requestLocation(); // immediately re-try
//             } else if (status.state === "denied") {
//               clearWatcher();
//               setState((prev) => ({
//                 ...prev,
//                 error: "Location access denied by user",
//                 loading: false,
//               }));
//             }
//           };
//         })
//         .catch(() => {
//           // some WebViews don’t implement Permissions API
//         });
//     }

//     return () => clearWatcher();
//   }, [requestLocation, clearWatcher]);

//   // ✅ manual one-time refresh (for Retry button)
//   const getCurrentPosition = useCallback(() => {
//     setState((prev) => ({ ...prev, loading: true }));
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         const { latitude, longitude, accuracy } = pos.coords;
//         lastPositionRef.current = { lat: latitude, lon: longitude };
//         setState({ latitude, longitude, accuracy, error: null, loading: false });
//       },
//       (error) => {
//         let msg = "Failed to get current position";
//         switch (error.code) {
//           case error.PERMISSION_DENIED:
//             msg = "Location access denied";
//             break;
//           case error.POSITION_UNAVAILABLE:
//             msg = "Location unavailable";
//             break;
//           case error.TIMEOUT:
//             msg = "Location request timed out";
//             break;
//         }
//         setState((prev) => ({ ...prev, error: msg, loading: false }));
//       },
//       {
//         enableHighAccuracy: options.enableHighAccuracy ?? true,
//         timeout: options.timeout ?? 10000,
//         maximumAge: options.maximumAge ?? 0,
//       }
//     );
//   }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

//   return {
//     ...state,
//     getCurrentPosition, // manual single read
//     retry: requestLocation, // 🔁 full re-watch
//   };
// }


// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";

// interface GeolocationState {
//   latitude: number | null;
//   longitude: number | null;
//   accuracy: number | null;
//   error: string | null;
//   loading: boolean;
// }

// interface GeolocationOptions {
//   enableHighAccuracy?: boolean;
//   timeout?: number;
//   maximumAge?: number;
//   minDistance?: number; // optional threshold (m)
// }

// // 📏 Helper: distance in meters between two coordinates
// function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// // 🌐 Fallback: approximate IP-based geolocation
// async function getIPLocation() {
//   try {
//     const res = await fetch("https://ipapi.co/json/");
//     const data = await res.json();
//     return {
//       latitude: data.latitude,
//       longitude: data.longitude,
//       accuracy: 5000,
//       source: "ip-fallback",
//     };
//   } catch {
//     return null;
//   }
// }

// export function useGeolocation(options: GeolocationOptions = {}) {
//   const [state, setState] = useState<GeolocationState>({
//     latitude: null,
//     longitude: null,
//     accuracy: null,
//     error: null,
//     loading: true,
//   });

//   const watchIdRef = useRef<number | null>(null);
//   const lastPositionRef = useRef<{ lat: number; lon: number } | null>(null);
//   const minDistance = options.minDistance ?? 100; // default 100 m

//   // ✅ Clear any existing watcher
//   const clearWatcher = useCallback(() => {
//     if (watchIdRef.current !== null) {
//       navigator.geolocation.clearWatch(watchIdRef.current);
//       watchIdRef.current = null;
//     }
//   }, []);

//   // ✅ Main wrapped location request
//   const requestLocation = useCallback(async () => {
//     setState((prev) => ({ ...prev, loading: true, error: null }));

//     try {
//       // 🟢 1. Try Median Native Bridge
//       if (typeof window !== "undefined" && (window as any).Median?.getLocation) {
//         console.log("📍 Using Median native location");
//         const loc = await (window as any).Median.getLocation();
//         setState({
//           latitude: loc.latitude,
//           longitude: loc.longitude,
//           accuracy: loc.accuracy ?? 10,
//           error: null,
//           loading: false,
//         });
//         return;
//       }

//       // 🟢 2. Try Browser Geolocation
//       if (navigator.geolocation) {
//         clearWatcher();

//         const handleSuccess = (position: GeolocationPosition) => {
//           const { latitude, longitude, accuracy } = position.coords;
//           const last = lastPositionRef.current;
//           const moved =
//             !last ||
//             getDistanceMeters(latitude, longitude, last.lat, last.lon) > minDistance;

//           if (!moved) return; // ignore micro-drifts
//           lastPositionRef.current = { lat: latitude, lon: longitude };

//           setState({
//             latitude,
//             longitude,
//             accuracy,
//             error: null,
//             loading: false,
//           });
//         };

//         const handleError = async (error: GeolocationPositionError) => {
//           console.warn("⚠️ Browser geolocation failed:", error);
//           const ipLoc = await getIPLocation();
//           if (ipLoc) {
//             setState({
//               latitude: ipLoc.latitude,
//               longitude: ipLoc.longitude,
//               accuracy: ipLoc.accuracy,
//               error: null,
//               loading: false,
//             });
//           } else {
//             setState({
//               ...state,
//               error: "Unable to determine location",
//               loading: false,
//             });
//           }
//         };

//         const id = navigator.geolocation.watchPosition(handleSuccess, handleError, {
//           enableHighAccuracy: options.enableHighAccuracy ?? true,
//           timeout: options.timeout ?? 60000,
//           maximumAge: options.maximumAge ?? 300000,
//         });

//         watchIdRef.current = id;
//         return;
//       }

//       // 🟢 3. Fallback: IP-based location
//       console.log("🌐 Using IP fallback for location");
//       const ipLoc = await getIPLocation();
//       if (ipLoc) {
//         setState({
//           latitude: ipLoc.latitude,
//           longitude: ipLoc.longitude,
//           accuracy: ipLoc.accuracy,
//           error: null,
//           loading: false,
//         });
//       } else {
//         setState({
//           ...state,
//           error: "Unable to get location (no supported method)",
//           loading: false,
//         });
//       }
//     } catch (err: any) {
//       console.error("❌ Location error:", err);
//       setState({
//         ...state,
//         error: err?.message || "Unknown location error",
//         loading: false,
//       });
//     }
//   }, [
//     options.enableHighAccuracy,
//     options.timeout,
//     options.maximumAge,
//     minDistance,
//     clearWatcher,
//   ]);

//   // ✅ On mount — request + permission changes
//   useEffect(() => {
//     requestLocation();

//     if (navigator.permissions?.query) {
//       navigator.permissions
//         .query({ name: "geolocation" as PermissionName })
//         .then((status) => {
//           status.onchange = () => {
//             console.log("📍 Permission changed:", status.state);
//             if (status.state === "granted") {
//               requestLocation();
//             } else if (status.state === "denied") {
//               clearWatcher();
//               setState((prev) => ({
//                 ...prev,
//                 error: "Location access denied by user",
//                 loading: false,
//               }));
//             }
//           };
//         })
//         .catch(() => {
//           // Some WebViews don’t support Permissions API
//         });
//     }

//     return () => clearWatcher();
//   }, [requestLocation, clearWatcher]);

//   // ✅ Manual one-time refresh (e.g., Retry button)
//   const getCurrentPosition = useCallback(async () => {
//     setState((prev) => ({ ...prev, loading: true }));

//     try {
//       // 1️⃣ Try Median native
//       if (typeof window !== "undefined" && (window as any).Median?.getLocation) {
//         const loc = await (window as any).Median.getLocation();
//         setState({
//           latitude: loc.latitude,
//           longitude: loc.longitude,
//           accuracy: loc.accuracy ?? 10,
//           error: null,
//           loading: false,
//         });
//         return;
//       }

//       // 2️⃣ Try browser API
//       if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//           (pos) => {
//             const { latitude, longitude, accuracy } = pos.coords;
//             lastPositionRef.current = { lat: latitude, lon: longitude };
//             setState({ latitude, longitude, accuracy, error: null, loading: false });
//           },
//           async () => {
//             const ipLoc = await getIPLocation();
//             if (ipLoc) {
//               setState({
//                 latitude: ipLoc.latitude,
//                 longitude: ipLoc.longitude,
//                 accuracy: ipLoc.accuracy,
//                 error: null,
//                 loading: false,
//               });
//             } else {
//               setState((prev) => ({
//                 ...prev,
//                 error: "Failed to get current position",
//                 loading: false,
//               }));
//             }
//           },
//           {
//             enableHighAccuracy: options.enableHighAccuracy ?? true,
//             timeout: options.timeout ?? 10000,
//             maximumAge: options.maximumAge ?? 0,
//           }
//         );
//         return;
//       }

//       // 3️⃣ IP fallback
//       const ipLoc = await getIPLocation();
//       if (ipLoc) {
//         setState({
//           latitude: ipLoc.latitude,
//           longitude: ipLoc.longitude,
//           accuracy: ipLoc.accuracy,
//           error: null,
//           loading: false,
//         });
//       } else {
//         setState((prev) => ({
//           ...prev,
//           error: "Failed to get location",
//           loading: false,
//         }));
//       }
//     } catch (err: any) {
//       setState((prev) => ({
//         ...prev,
//         error: err.message || "Unexpected error",
//         loading: false,
//       }));
//     }
//   }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

//   return {
//     ...state,
//     getCurrentPosition,
//     retry: requestLocation,
//   };
// }



// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";

// interface GeolocationState {
//   latitude: number | null;
//   longitude: number | null;
//   accuracy: number | null;
//   error: string | null;
//   loading: boolean;
// }

// interface GeolocationOptions {
//   enableHighAccuracy?: boolean;
//   timeout?: number;
//   maximumAge?: number;
//   minDistance?: number; // optional threshold (m)
// }

// // 📏 Helper: distance in meters between two coordinates
// function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// // 🌐 Fallback: approximate IP-based geolocation
// async function getIPLocation() {
//   try {
//     const res = await fetch("https://ipapi.co/json/");
//     const data = await res.json();
//     return {
//       latitude: data.latitude,
//       longitude: data.longitude,
//       accuracy: 5000,
//       source: "ip-fallback",
//     };
//   } catch {
//     return null;
//   }
// }

// export function useGeolocation(options: GeolocationOptions = {}) {
//   const [state, setState] = useState<GeolocationState>({
//     latitude: null,
//     longitude: null,
//     accuracy: null,
//     error: null,
//     loading: true,
//   });

//   const watchIdRef = useRef<number | null>(null);
//   const lastPositionRef = useRef<{ lat: number; lon: number } | null>(null);
//   const minDistance = options.minDistance ?? 100; // default 100 m

//   // ✅ Clear any existing watcher
//   const clearWatcher = useCallback(() => {
//     if (watchIdRef.current !== null) {
//       navigator.geolocation.clearWatch(watchIdRef.current);
//       watchIdRef.current = null;
//     }
//   }, []);

//   // ✅ Main wrapped location request
//   const requestLocation = useCallback(async () => {
//     setState((prev) => ({ ...prev, loading: true, error: null }));

//     try {
//       // 🟢 1. Try Median Native Bridge (for Android/iOS app)
//       if (typeof window !== "undefined" && (window as any).Median?.getLocation) {
//         console.log("📍 Using Median native location");
//         const loc = await (window as any).Median.getLocation();
//         setState({
//           latitude: loc.latitude,
//           longitude: loc.longitude,
//           accuracy: loc.accuracy ?? 10,
//           error: null,
//           loading: false,
//         });
//         return;
//       }

//       // 🟢 2. Try Browser Geolocation
//       if (navigator.geolocation) {
//         clearWatcher();

//         const handleSuccess = (position: GeolocationPosition) => {
//           const { latitude, longitude, accuracy } = position.coords;
//           const last = lastPositionRef.current;
//           const moved =
//             !last ||
//             getDistanceMeters(latitude, longitude, last.lat, last.lon) > minDistance;

//           if (!moved) return; // ignore micro-drifts
//           lastPositionRef.current = { lat: latitude, lon: longitude };

//           setState({
//             latitude,
//             longitude,
//             accuracy,
//             error: null,
//             loading: false,
//           });
//         };

//         const handleError = async (error: GeolocationPositionError) => {
//           console.warn("⚠️ Browser geolocation failed:", error);
//           const ipLoc = await getIPLocation();
//           if (ipLoc) {
//             setState({
//               latitude: ipLoc.latitude,
//               longitude: ipLoc.longitude,
//               accuracy: ipLoc.accuracy,
//               error: null,
//               loading: false,
//             });
//           } else {
//             setState({
//               ...state,
//               error: "Unable to determine location",
//               loading: false,
//             });
//           }
//         };

//         const id = navigator.geolocation.watchPosition(handleSuccess, handleError, {
//           enableHighAccuracy: options.enableHighAccuracy ?? true,
//           timeout: options.timeout ?? 60000,
//           maximumAge: options.maximumAge ?? 300000,
//         });

//         watchIdRef.current = id;
//         return;
//       }

//       // 🟢 3. Fallback: IP-based location
//       console.log("🌐 Using IP fallback for location");
//       const ipLoc = await getIPLocation();
//       if (ipLoc) {
//         setState({
//           latitude: ipLoc.latitude,
//           longitude: ipLoc.longitude,
//           accuracy: ipLoc.accuracy,
//           error: null,
//           loading: false,
//         });
//       } else {
//         setState({
//           ...state,
//           error: "Unable to get location (no supported method)",
//           loading: false,
//         });
//       }
//     } catch (err: any) {
//       console.error("❌ Location error:", err);
//       setState({
//         ...state,
//         error: err?.message || "Unknown location error",
//         loading: false,
//       });
//     }
//   }, [
//     options.enableHighAccuracy,
//     options.timeout,
//     options.maximumAge,
//     minDistance,
//     clearWatcher,
//   ]);

//   // ✅ On mount — request + permission changes
//   useEffect(() => {
//     requestLocation();

//     if (navigator.permissions?.query) {
//       navigator.permissions
//         .query({ name: "geolocation" as PermissionName })
//         .then((status) => {
//           status.onchange = () => {
//             console.log("📍 Permission changed:", status.state);
//             if (status.state === "granted") {
//               requestLocation();
//             } else if (status.state === "denied") {
//               clearWatcher();
//               setState((prev) => ({
//                 ...prev,
//                 error: "Location access denied by user",
//                 loading: false,
//               }));
//             }
//           };
//         })
//         .catch(() => {
//           // Some WebViews don’t support Permissions API
//         });
//     }

//     return () => clearWatcher();
//   }, [requestLocation, clearWatcher]);

//   // ✅ Manual one-time refresh (Retry or "Update My Location")
//   const updateLocation = useCallback(async () => {
//     setState((prev) => ({ ...prev, loading: true }));
//     try {
//       if (typeof window !== "undefined" && (window as any).Median?.getLocation) {
//         const loc = await (window as any).Median.getLocation();
//         setState({
//           latitude: loc.latitude,
//           longitude: loc.longitude,
//           accuracy: loc.accuracy ?? 10,
//           error: null,
//           loading: false,
//         });
//         return;
//       }

//       if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//           (pos) => {
//             const { latitude, longitude, accuracy } = pos.coords;
//             lastPositionRef.current = { lat: latitude, lon: longitude };
//             setState({ latitude, longitude, accuracy, error: null, loading: false });
//           },
//           async () => {
//             const ipLoc = await getIPLocation();
//             if (ipLoc) {
//               setState({
//                 latitude: ipLoc.latitude,
//                 longitude: ipLoc.longitude,
//                 accuracy: ipLoc.accuracy,
//                 error: null,
//                 loading: false,
//               });
//             } else {
//               setState((prev) => ({
//                 ...prev,
//                 error: "Failed to get current position",
//                 loading: false,
//               }));
//             }
//           },
//           {
//             enableHighAccuracy: true,
//             timeout: 10000,
//             maximumAge: 0,
//           }
//         );
//         return;
//       }

//       const ipLoc = await getIPLocation();
//       if (ipLoc) {
//         setState({
//           latitude: ipLoc.latitude,
//           longitude: ipLoc.longitude,
//           accuracy: ipLoc.accuracy,
//           error: null,
//           loading: false,
//         });
//       } else {
//         setState((prev) => ({
//           ...prev,
//           error: "Failed to get location",
//           loading: false,
//         }));
//       }
//     } catch (err: any) {
//       setState((prev) => ({
//         ...prev,
//         error: err.message || "Unexpected error",
//         loading: false,
//       }));
//     }
//   }, []);

//   return {
//     ...state,
//     getCurrentPosition: updateLocation, // alias for compatibility
//     retry: requestLocation,
//     updateLocation, // 👈 permanent button trigger
//   };
// }


"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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
  minDistance?: number;
}

// 📏 Compute distance in meters between two coordinates
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
      )
    )
  );
}

// 🌍 IP-based fallback (guaranteed)
async function getIPLocation() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: 5000,
      source: "ip-fallback",
    };
  } catch {
    return null;
  }
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ lat: number; lon: number } | null>(null);
  const minDistance = options.minDistance ?? 100;

  // ✅ Stop old watchers
  const clearWatcher = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // ✅ Main background tracker (used at page load)
  const requestLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // 1️⃣ Median Native Bridge (in-app accurate)
      if (typeof window !== "undefined" && (window as any).Median?.getLocation) {
        console.log("📱 Using Median native location");
        const loc = await (window as any).Median.getLocation();
        if (loc?.latitude && loc?.longitude) {
          setState({
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy: loc.accuracy ?? 10,
            error: null,
            loading: false,
          });
          return;
        }
      }

      // 2️⃣ Browser-based location
      if (navigator.geolocation) {
        clearWatcher();

        const handleSuccess = (pos: GeolocationPosition) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const last = lastPositionRef.current;
          const moved =
            !last ||
            getDistanceMeters(latitude, longitude, last.lat, last.lon) > minDistance;

          if (!moved) return;
          lastPositionRef.current = { lat: latitude, lon: longitude };

          setState({
            latitude,
            longitude,
            accuracy,
            error: null,
            loading: false,
          });
          console.log("🌐 Browser location success:", latitude, longitude);
        };

        const handleError = async (err: GeolocationPositionError) => {
          console.warn("⚠️ Browser geolocation failed:", err);
          const ipLoc = await getIPLocation();
          if (ipLoc) {
            console.log("🌍 Using IP fallback");
            setState({
              latitude: ipLoc.latitude,
              longitude: ipLoc.longitude,
              accuracy: ipLoc.accuracy,
              error: null,
              loading: false,
            });
          } else {
            setState((prev) => ({
              ...prev,
              error: "Unable to determine location",
              loading: false,
            }));
          }
        };

        const id = navigator.geolocation.watchPosition(handleSuccess, handleError, {
          enableHighAccuracy: true,
          timeout: 60000,
          maximumAge: 300000,
        });
        watchIdRef.current = id;
        return;
      }

      // 3️⃣ Fallback (IP)
      console.log("🌍 Using IP fallback");
      const ipLoc = await getIPLocation();
      if (ipLoc) {
        setState({
          latitude: ipLoc.latitude,
          longitude: ipLoc.longitude,
          accuracy: ipLoc.accuracy,
          error: null,
          loading: false,
        });
      } else {
        throw new Error("No location sources available");
      }
    } catch (err: any) {
      console.error("❌ Location error:", err);
      setState((prev) => ({
        ...prev,
        error: err?.message || "Unknown error",
        loading: false,
      }));
    }
  }, [clearWatcher, minDistance]);

  // ✅ Manual one-time update (for a “Refresh Location” button)
  const updateLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      // Median native
   // 1️⃣ Median v2 (most common)
if (typeof window !== "undefined" && (window as any).median?.getGeolocation) {
  try {
    console.log("📱 Using Median native geolocation");

    const result = await (window as any).median.getGeolocation();

    if (result?.coords) {
      setState({
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
        accuracy: result.coords.accuracy ?? 20,
        error: null,
        loading: false,
      });
      return;
    }
  } catch (err) {
    console.warn("Median getGeolocation failed", err);
  }
}

// 2️⃣ Median older SDK
if (typeof window !== "undefined" && (window as any).MedianJS?.getUserLocation) {
  try {
    console.log("📱 Using MedianJS native geolocation");

    const result = await (window as any).MedianJS.getUserLocation();

    if (result?.latitude && result?.longitude) {
      setState({
        latitude: result.latitude,
        longitude: result.longitude,
        accuracy: 20,
        error: null,
        loading: false,
      });
      return;
    }
  } catch (err) {
    console.warn("MedianJS getUserLocation failed", err);
  }
}


      // Browser
      if (navigator.geolocation) {
        return new Promise<{ lat: number; lon: number }>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude, accuracy } = pos.coords;
              console.log("🌐 Browser update:", latitude, longitude);
              lastPositionRef.current = { lat: latitude, lon: longitude };
              setState({ latitude, longitude, accuracy, error: null, loading: false });
              resolve({ lat: latitude, lon: longitude });
            },
            async () => {
              const ipLoc = await getIPLocation();
              if (ipLoc) {
                console.log("🌍 IP fallback update");
                setState({
                  latitude: ipLoc.latitude,
                  longitude: ipLoc.longitude,
                  accuracy: ipLoc.accuracy,
                  error: null,
                  loading: false,
                });
                resolve({ lat: ipLoc.latitude, lon: ipLoc.longitude });
              } else {
                setState((prev) => ({
                  ...prev,
                  error: "Failed to get current position",
                  loading: false,
                }));
                reject("No location found");
              }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        });
      }

      // IP fallback
      const ipLoc = await getIPLocation();
      if (ipLoc) {
        console.log("🌍 IP fallback update");
        setState({
          latitude: ipLoc.latitude,
          longitude: ipLoc.longitude,
          accuracy: ipLoc.accuracy,
          error: null,
          loading: false,
        });
        return { lat: ipLoc.latitude, lon: ipLoc.longitude };
      } else {
        throw new Error("Failed to fetch any location");
      }
    } catch (err: any) {
      console.error("❌ Update location error:", err);
      setState((prev) => ({
        ...prev,
        error: err.message || "Unexpected error",
        loading: false,
      }));
      throw err;
    }
  }, []);

  // ✅ On mount
  useEffect(() => {
    requestLocation();

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((status) => {
          status.onchange = () => {
            if (status.state === "granted") requestLocation();
            else if (status.state === "denied") {
              clearWatcher();
              setState((prev) => ({
                ...prev,
                error: "Location access denied",
                loading: false,
              }));
            }
          };
        })
        .catch(() => {});
    }

    return () => clearWatcher();
  }, [requestLocation, clearWatcher]);

    // ✅ Manual one-shot location request (for buttons like "Use Current Location")
  const getCurrentPosition = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // 1️⃣ Median Native
      if (typeof window !== "undefined" && (window as any).median?.getGeolocation) {
        const result = await (window as any).median.getGeolocation();
        if (result?.coords?.latitude && result?.coords?.longitude) {
          setState({
            latitude: result.coords.latitude,
            longitude: result.coords.longitude,
            accuracy: result.coords.accuracy ?? 20,
            error: null,
            loading: false,
          });
          return;
        }
      }

      // 2️⃣ Browser Geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            setState({
              latitude,
              longitude,
              accuracy,
              error: null,
              loading: false,
            });
          },
          async () => {
            // 3️⃣ IP Fallback
            const ipLoc = await getIPLocation();
            if (ipLoc) {
              setState({
                latitude: ipLoc.latitude,
                longitude: ipLoc.longitude,
                accuracy: ipLoc.accuracy,
                error: null,
                loading: false,
              });
            } else {
              setState((prev) => ({
                ...prev,
                error: "Failed to detect location",
                loading: false,
              }));
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        return;
      }

      // 4️⃣ Final fallback
      const ipLoc = await getIPLocation();
      if (ipLoc) {
        setState({
          latitude: ipLoc.latitude,
          longitude: ipLoc.longitude,
          accuracy: ipLoc.accuracy,
          error: null,
          loading: false,
        });
      } else {
        throw new Error("No geolocation sources available");
      }
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err?.message || "Unexpected location error",
        loading: false,
      }));
    }
  }, []);


   return {
    ...state,
    updateLocation,
    getCurrentPosition,   // ✅ NOW EXPOSED FOR LocationPicker
    retry: requestLocation,
  };

}

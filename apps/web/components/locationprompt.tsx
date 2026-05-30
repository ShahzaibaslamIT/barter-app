// // components/LocationPrompt.tsx
// import { Button } from "@barter/ui";
// import { Card, CardContent, CardHeader, CardTitle } from "@barter/ui";
// import { useState } from "react";
// import { useGeolocation } from "@/hooks/use-geolocation";

// export default function LocationPrompt({ onSuccess }: { onSuccess: () => void }) {
//   const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
//   const { getCurrentPosition } = useGeolocation();

//   const handleAllow = async () => {
//     setStatus("loading");
//     try {
//       await getCurrentPosition();
//       onSuccess();
//     } catch {
//       setStatus("error");
//     }
//   };

//   return (
//     <Card className="max-w-md mx-auto mt-10 text-center p-6">
//       <CardHeader>
//         <CardTitle className="text-lg font-semibold">
//           Enable Location Access
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <p className="text-gray-600 mb-4">
//           We use your location to show nearby barter listings and services.
//         </p>
//         {status === "error" && (
//           <p className="text-red-500 text-sm mb-2">
//             Unable to get location. Please enable it manually in your browser or app settings.
//           </p>
//         )}
//         <div className="flex justify-center gap-4">
//           <Button onClick={handleAllow} disabled={status === "loading"}>
//             {status === "loading" ? "Detecting..." : "Allow"}
//           </Button>
//           <Button variant="outline" onClick={() => alert("You can enable later in settings.")}>
//             Deny
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }


// "use client";

// import { Button } from "@barter/ui";
// import { Card, CardContent, CardHeader, CardTitle } from "@barter/ui";
// import { useState } from "react";
// import { useGeolocation } from "@/hooks/use-geolocation";
// import { LocateFixed } from "lucide-react";

// export default function LocationPrompt({ onSuccess }: { onSuccess: () => void }) {
//   const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
//   const { updateLocation, error } = useGeolocation();

//   const handleAllow = async () => {
//     setStatus("loading");
//     try {
//       // ✅ Try native bridge first, then fallback
//       await updateLocation();
//       setStatus("idle");
//       onSuccess();
//     } catch (err) {
//       // console.error("❌ LocationPrompt error:", err);
//       setStatus("error");
//     }
//   };

//   return (
//     <Card className="max-w-md mx-auto mt-20 text-center p-8 shadow-lg border border-border/50 bg-gradient-to-br from-background via-muted/20 to-background">
//       <CardHeader>
//         <CardTitle className="text-xl font-semibold text-primary">
//           Enable Location Access
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <p className="text-muted-foreground mb-6">
//           We use your location to show nearby items, services, and barter opportunities around you.
//         </p>

//         {status === "error" || error ? (
//           <p className="text-red-500 text-sm mb-4">
//             Unable to detect location automatically. Please check app or device permissions.
//           </p>
//         ) : null}

//         <div className="flex justify-center gap-3">
//           <Button
//             onClick={handleAllow}
//             disabled={status === "loading"}
//             className="flex items-center gap-2"
//           >
//             <LocateFixed className="h-4 w-4" />
//             {status === "loading" ? "Detecting..." : "Enable Location"}
//           </Button>

//           <Button
//             variant="outline"
//             onClick={() => onSuccess()}
//             className="flex items-center gap-2"
//           >
//             Continue Without
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }


"use client";

import { Button } from "@barter/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@barter/ui";
import { useState } from "react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { LocateFixed, MapPinOff } from "lucide-react";

interface LocationPromptProps {
  onSuccess: () => void;
  onSkip: () => void;
}

export default function LocationPrompt({
  onSuccess,
  onSkip,
}: LocationPromptProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const { updateLocation } = useGeolocation();

  const handleAllow = async () => {
    setStatus("loading");
    try {
      await updateLocation();
      setStatus("idle");
      onSuccess();
    } catch {
      setStatus("error");
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-20 text-center p-8 shadow-lg border border-border/50 bg-gradient-to-br from-background via-muted/20 to-background">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">
          Enable Location Access
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground mb-6">
          We use your location to show nearby items, services, and barter
          opportunities around you.
        </p>

        {status === "error" && (
          <p className="text-red-500 text-sm mb-4">
            Unable to detect location automatically. You can continue without
            location.
          </p>
        )}

        <div className="flex justify-center gap-3">
          <Button
            onClick={handleAllow}
            disabled={status === "loading"}
            className="flex items-center gap-2"
          >
            <LocateFixed className="h-4 w-4" />
            {status === "loading" ? "Detecting..." : "Enable Location"}
          </Button>

          <Button
            variant="outline"
            onClick={onSkip}
            className="flex items-center gap-2"
          >
            <MapPinOff className="h-4 w-4" />
            Continue Without
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

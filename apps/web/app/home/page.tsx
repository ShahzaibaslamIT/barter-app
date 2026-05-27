// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { ListingCard } from "@/components/listings/listing-card";
// import { BottomNav } from "@/components/ui/bottom-nav";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Plus,
//   Search,
//   MapPin,
//   TrendingUp,
//   Loader2,
//   Clock,
// } from "lucide-react";
// import { MakeOfferDialog } from "@/components/offers/make-offer-dialog";
// import { useToast } from "@/hooks/use-toast";
// import "leaflet/dist/leaflet.css";

// /* =========================
//    TYPES
// ========================= */

// interface Listing {
//   item_id: number;
//   type: "item" | "service";
//   title: string;
//   description: string;
//   category: string;
//   location_text: string;
//   barter_request?: string;
//   photos: string[];
//   condition?: string;
//   user_id: number;
//   user_name: string;
//   user_avatar?: string;
//   user_rating: number;
//   user_rating_count: number;
//   created_at: string;
//   listing_fee_usd?: number;
//   expires_at?: string;
// }

// /* =========================
//    CONSTANTS
// ========================= */

// const ITEM_CATEGORIES = [
//   "Electronics",
//   "Furniture",
//   "Tools",
//   "Books",
//   "Clothing",
//   "Other",
// ];

// const SERVICE_CATEGORIES = [
//   "Tutoring",
//   "Cleaning",
//   "Handyman",
//   "Moving",
//   "Pet Care",
//   "Other",
// ];

// /* =========================
//    PAGE
// ========================= */

// export default function HomePage() {
//   const [listings, setListings] = useState<Listing[]>([]);
//   const [listingCount, setListingCount] = useState<number>(0);
//   const [isLoading, setIsLoading] = useState(true);
//   const [offerTarget, setOfferTarget] = useState<Listing | null>(null);

//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { toast } = useToast();

//   /* =========================
//      URL-BASED FILTERS
//   ========================== */

//   const type = (searchParams.get("type") as "item" | "service") || "item";
//   const category = searchParams.get("category");
//   const sort = searchParams.get("sort") || "recent";
//   const searchQuery = searchParams.get("q") || "";

//   /* =========================
//      FETCH LOGIC
//   ========================== */

//   useEffect(() => {
//     fetchListings();
//     fetchListingCount();

//     const onCreated = () => {
//       fetchListings();
//       fetchListingCount();
//     };

//     window.addEventListener("listing:created", onCreated);
//     return () => window.removeEventListener("listing:created", onCreated);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [type, category, sort, searchQuery]);

//   const fetchListings = async () => {
//     try {
//       setIsLoading(true);

//       const params = new URLSearchParams({
//         limit: "12",
//         type,
//         sort,
//       });

//       if (category) params.set("category", category);
//       if (searchQuery) params.set("q", searchQuery);

//       const response = await fetch(`/api/listings?${params.toString()}`);

//       if (!response.ok) {
//         console.error("[home] Failed to fetch listings:", response.status);
//         setListings([]);
//         return;
//       }

//       const data = await response.json();

//       const mapped: Listing[] = (data.listings || []).map((l: any) => ({
//         item_id: Number(l.item_id ?? l.id),
//         type: l.type,
//         title: l.title,
//         description: l.description,
//         category: l.category,
//         location_text: l.location_text || "",
//         barter_request: l.barter_request ?? "",
//         photos: Array.isArray(l.photos) ? l.photos : [],
//         condition: l.condition ?? "",
//         user_id: Number(l.user?.user_id ?? l.user_id ?? 0),
//         user_name: l.user?.username || l.user_name || "Anonymous",
//         user_avatar: l.user?.avatar_url || undefined,
//         user_rating: l.user?.rating ?? 0,
//         user_rating_count: l.user?.rating_count ?? 0,
//         created_at: l.created_at,
//         listing_fee_usd: Number(l.listing_fee_usd ?? 0.99),
//         expires_at: l.expires_at ?? null,
//       }));

//       setListings(mapped);
//     } catch (err) {
//       console.error("[home] Error fetching listings:", err);
//       setListings([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchListingCount = async () => {
//     try {
//       const res = await fetch("/api/listings/count?_ts=" + Date.now());
//       if (!res.ok) throw new Error("Failed to fetch count");
//       const data = await res.json();
//       setListingCount(data.count ?? 0);
//     } catch (err) {
//       console.error("[home] Error fetching listing count:", err);
//       setListingCount(0);
//     }
//   };

//   /* =========================
//      HANDLERS
//   ========================== */

//   const handleSearchChange = (value: string) => {
//     const params = new URLSearchParams(searchParams.toString());
//     if (value) params.set("q", value);
//     else params.delete("q");
//     router.replace(`/home?${params.toString()}`);
//   };

//   const handleDeleted = (item_id: number) => {
//     setListings((prev) => prev.filter((l) => l.item_id !== item_id));
//     fetchListingCount();
//   };

//   /* =========================
//      UI
//   ========================== */

//   return (
//     <div className="min-h-screen bg-background pb-20">
//       {/* Header */}
//       <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
//         <div className="container mx-auto px-4 py-4 flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold text-primary">BarterHub</h1>
//             <p className="text-sm text-muted-foreground">
//               Discover local barter opportunities
//             </p>
//           </div>
//           <Button onClick={() => router.push("/post")} size="sm">
//             <Plus className="h-4 w-4 mr-2" />
//             Post
//           </Button>
//         </div>
//       </header>

//       {/* Filter Bar (Amazon-style) */}
//       <div className="container mx-auto px-4 pt-4">
//         <div className="flex gap-2 overflow-x-auto pb-2">
//           {["item", "service"].map((t) => (
//             <Button
//               key={t}
//               size="sm"
//               variant={type === t ? "default" : "outline"}
//               onClick={() => {
//                 const params = new URLSearchParams(searchParams.toString());
//                 params.set("type", t);
//                 params.delete("category");
//                 router.replace(`/home?${params.toString()}`);
//               }}
//             >
//               {t === "item" ? "Items" : "Services"}
//             </Button>
//           ))}

//           <select
//             className="border rounded-md px-3 py-1 text-sm bg-background"
//             value={category || ""}
//             onChange={(e) => {
//               const params = new URLSearchParams(searchParams.toString());
//               if (e.target.value) params.set("category", e.target.value);
//               else params.delete("category");
//               router.replace(`/home?${params.toString()}`);
//             }}
//           >
//             <option value="">All Categories</option>
//             {(type === "item" ? ITEM_CATEGORIES : SERVICE_CATEGORIES).map((c) => (
//               <option key={c} value={c}>{c}</option>
//             ))}
//           </select>

//           <select
//             className="border rounded-md px-3 py-1 text-sm bg-background"
//             value={sort}
//             onChange={(e) => {
//               const params = new URLSearchParams(searchParams.toString());
//               params.set("sort", e.target.value);
//               router.replace(`/home?${params.toString()}`);
//             }}
//           >
//             <option value="recent">Most Recent</option>
//             <option value="nearest">Nearest</option>
//           </select>
//         </div>
//       </div>

//       {/* Search */}
//       <div className="container mx-auto px-4 py-6">
//         <div className="relative mb-6">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="What are you looking for?"
//             value={searchQuery}
//             onChange={(e) => handleSearchChange(e.target.value)}
//             className="pl-10"
//           />
//         </div>

//         {/* Listings */}
//         {isLoading ? (
//           <div className="text-center py-12">
//             <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
//             Loading listings...
//           </div>
//         ) : listings.length === 0 ? (
//           <div className="text-center py-12">
//             No listings found.
//           </div>
//         ) : (
//           <div className="grid gap-4 sm:grid-cols-2">
//             {listings.map((listing) => (
//               <div key={listing.item_id} className="p-4 border rounded-xl bg-card">
//                 <ListingCard
//                   listing={listing}
//                   onViewDetails={() => router.push(`/listings/${listing.item_id}`)}
//                   onMakeOffer={() => setOfferTarget(listing)}
//                   onEditListing={(l) =>
//                     router.push(`/listings/${l.item_id}/edit`)
//                   }
//                   onDeleted={handleDeleted}
//                 />
//                 <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
//                   <Clock className="h-4 w-4 text-yellow-600" />
//                   {listing.expires_at
//                     ? `${Math.ceil(
//                         (new Date(listing.expires_at).getTime() - Date.now()) /
//                           (1000 * 60 * 60 * 24)
//                       )} days left`
//                     : "N/A"}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <BottomNav />
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/listings/listing-card";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Loader2,
  MapPin,
} from "lucide-react";
import { MakeOfferDialog } from "@/components/offers/make-offer-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTermsGate } from "@/hooks/use-terms-gate";

/* =========================
   TYPES
========================= */

interface Listing {
  item_id: number;
  type: "item" | "service";
  title: string;
  description: string;
  category: string;
  location_text: string;
  barter_request?: string;
  photos: string[];
  condition?: string;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  user_rating: number;
  user_rating_count: number;
  created_at: string;
  listing_fee_usd?: number;
  expires_at?: string;
}

/* =========================
   CONSTANTS - MATCH YOUR LISTING FORM
========================= */

const ITEM_CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "appliances", label: "Appliances" },
  { value: "tools", label: "Tools" },
  { value: "books", label: "Books" },
  { value: "clothing", label: "Clothing" },
  { value: "sports_equipment", label: "Sports Equipment" },
  { value: "musical_instruments", label: "Musical Instruments" },
  { value: "art_&_crafts", label: "Art & Crafts" },
  { value: "other", label: "Other" },
];

const SERVICE_CATEGORIES = [
  { value: "moving_help", label: "Moving Help" },
  { value: "tutoring", label: "Tutoring" },
  { value: "cleaning", label: "Cleaning" },
  { value: "handyman", label: "Handyman" },
  { value: "pet_care", label: "Pet Care" },
  { value: "gardening", label: "Gardening" },
  { value: "photography", label: "Photography" },
  { value: "web_design", label: "Web Design" },
  { value: "writing", label: "Writing" },
  { value: "other", label: "Other" },
];

/* =========================
   PAGE
========================= */

export default function HomePage() {
  useTermsGate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingCount, setListingCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [offerTarget, setOfferTarget] = useState<Listing | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [cities, setCities] = useState<{ city: string; count: number }[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  /* =========================
     URL-BASED FILTERS
  ========================== */

  const type = (searchParams.get("type") as "item" | "service") || "item";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const sort = searchParams.get("sort") || "recent";
  const searchQuery = searchParams.get("q") || "";

  // Sync URL search with input
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Fetch city list once on mount
  useEffect(() => {
    fetch("/api/listings/cities")
      .then((r) => r.json())
      .then((d) => setCities(d.cities || []))
      .catch(() => {});
  }, []);

  /* =========================
     FETCH LOGIC
  ========================== */

  useEffect(() => {
    fetchListings();
    fetchListingCount();

    const onCreated = () => {
      fetchListings();
      fetchListingCount();
    };

    window.addEventListener("listing:created", onCreated);
    return () => window.removeEventListener("listing:created", onCreated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, category, city, sort, searchQuery]);

  const fetchListings = async (retry = 0) => {
    try {
      setIsLoading(true);
      setFetchError(null);

      const params = new URLSearchParams({
        limit: "12",
        type,
        sort,
      });

      if (category && category !== "all") params.set("category", category);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (city.trim()) params.set("city", city.trim());

      console.log("🔍 Fetching listings with params:", params.toString());

      // 15s timeout — if Neon DB is cold-starting, fail fast and let user retry
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`/api/listings?${params.toString()}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        console.error("[home] Failed to fetch listings:", response.status);
        setListings([]);
        return;
      }

      const data = await response.json();

      const mapped: Listing[] = (data.listings || []).map((l: any) => ({
        item_id: Number(l.item_id ?? l.id),
        type: l.type,
        title: l.title,
        description: l.description,
        category: l.category,
        location_text: l.location_text || "",
        barter_request: l.barter_request ?? "",
        photos: Array.isArray(l.photos) ? l.photos : [],
        condition: l.condition ?? "",
        user_id: Number(l.user?.user_id ?? l.user_id ?? 0),
        user_name: l.user?.username || l.user_name || "Anonymous",
        user_avatar: l.user?.avatar_url || undefined,
        user_rating: l.user?.rating ?? 0,
        user_rating_count: l.user?.rating_count ?? 0,
        created_at: l.created_at,
        listing_fee_usd: Number(l.listing_fee_usd ?? 0.99),
        expires_at: l.expires_at ?? null,
      }));

      console.log("✅ Fetched listings:", mapped.length);
      setListings(mapped);
    } catch (err: any) {
      console.error("[home] Error fetching listings:", err);
      if (err?.name === "AbortError" && retry < 2) {
        // Auto-retry once — DB may be waking up
        console.log("[home] Timeout, retrying...");
        return fetchListings(retry + 1);
      }
      setListings([]);
      setFetchError(
        err?.name === "AbortError"
          ? "Database is waking up — please try again."
          : "Failed to load listings."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchListingCount = async () => {
    try {
      const res = await fetch("/api/listings/count?_ts=" + Date.now());
      if (!res.ok) throw new Error("Failed to fetch count");
      const data = await res.json();
      setListingCount(data.count ?? 0);
    } catch (err) {
      console.error("[home] Error fetching listing count:", err);
      setListingCount(0);
    }
  };

  /* =========================
     HANDLERS
  ========================== */

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchInput.trim()) {
      params.set("q", searchInput.trim());
    } else {
      params.delete("q");
    }
    
    router.replace(`/home?${params.toString()}`);
  };

  const handleDeleted = (item_id: number) => {
    setListings((prev) => prev.filter((l) => l.item_id !== item_id));
    fetchListingCount();
  };

  const currentCategories = type === "item" ? ITEM_CATEGORIES : SERVICE_CATEGORIES;

  /* =========================
     UI
  ========================== */

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">BarterHub</h1>
            <p className="text-sm text-muted-foreground">
              {listingCount} active listings
            </p>
          </div>
          <Button onClick={() => router.push("/post")} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Post
          </Button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="container mx-auto px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* Type Filter */}
          {["item", "service"].map((t) => (
            <Button
              key={t}
              size="sm"
              variant={type === t ? "default" : "outline"}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("type", t);
                params.delete("category"); // Reset category when changing type
                router.replace(`/home?${params.toString()}`);
              }}
              className="whitespace-nowrap"
            >
              {t === "item" ? "Items" : "Services"}
            </Button>
          ))}

          {/* Category Filter */}
          <select
            className="border rounded-md px-3 py-1.5 text-sm bg-background min-w-[140px]"
            value={category}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              if (e.target.value && e.target.value !== "all") {
                params.set("category", e.target.value);
              } else {
                params.delete("category");
              }
              router.replace(`/home?${params.toString()}`);
            }}
          >
            <option value="all">All Categories</option>
            {currentCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* City Filter */}
          <select
            className="border rounded-md px-3 py-1.5 text-sm bg-background min-w-[140px]"
            value={city}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              if (e.target.value) {
                params.set("city", e.target.value);
              } else {
                params.delete("city");
              }
              router.replace(`/home?${params.toString()}`);
            }}
          >
            <option value="">All Cities</option>
            {cities.map(({ city: c, count }) => (
              <option key={c} value={c}>
                {c} ({count})
              </option>
            ))}
          </select>

          {/* Sort Filter */}
          <select
            className="border rounded-md px-3 py-1.5 text-sm bg-background min-w-[120px]"
            value={sort}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("sort", e.target.value);
              router.replace(`/home?${params.toString()}`);
            }}
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSearchSubmit} className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-20"
          />
          {searchInput && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => {
                setSearchInput("");
                const params = new URLSearchParams(searchParams.toString());
                params.delete("q");
                router.replace(`/home?${params.toString()}`);
              }}
            >
              Clear
            </Button>
          )}
        </form>

        {/* Active Filters Display */}
        {(category || city || searchQuery) && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <p className="text-sm text-muted-foreground">Active filters:</p>
            {category && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                {currentCategories.find(c => c.value === category)?.label || category}
              </span>
            )}
            {city && (
              <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                <MapPin className="h-3 w-3" />
                {city}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                Search: &quot;{searchQuery}&quot;
              </span>
            )}
          </div>
        )}

        {/* Listings */}
        {fetchError && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground mb-3">{fetchError}</p>
            <Button size="sm" onClick={() => fetchListings()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">No listings found</p>
            {(category || city || searchQuery) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set("type", type);
                  router.replace(`/home?${params.toString()}`);
                  setSearchInput("");
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div key={listing.item_id} className="border rounded-xl bg-card overflow-hidden">
                <ListingCard
                  listing={listing}
                  onViewDetails={() => router.push(`/listings/${listing.item_id}`)}
                  onMakeOffer={() => setOfferTarget(listing)}
                  onEditListing={(l) =>
                    router.push(`/listings/${l.item_id}/edit`)
                  }
                  onDeleted={handleDeleted}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Make Offer Dialog */}
      {offerTarget && (
        <MakeOfferDialog
          isOpen={true}
          onClose={() => setOfferTarget(null)}
          targetListing={{
            item_id: offerTarget.item_id,
            title: offerTarget.title,
            type: offerTarget.type,
            user_id: offerTarget.user_id,
            user_name: offerTarget.user_name,
          }}
          onSuccess={() => {
            fetchListings();
            fetchListingCount();
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}
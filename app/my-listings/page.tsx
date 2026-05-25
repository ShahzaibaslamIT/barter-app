"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/listings/listing-card";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useTermsGate } from "@/hooks/use-terms-gate";

interface Listing {
  item_id: number;
  type: "item" | "service";
  title: string;
  description: string;
  category: string;
  location_text: string;
  photos: string[];
  condition?: string;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  user_rating: number;
  user_rating_count: number;
  created_at: string;
}

export default function MyListingsPage() {
  useTermsGate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  const newlyCreated = searchParams.get("new") === "true";

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      

const res = await fetch("/api/listings/mine", {
  credentials: "include", 
});


      if (!res.ok) {
        console.error("[my-listings] Failed to fetch");
        setListings([]);
        return;
      }

      const data = await res.json();
        const mapped = (data.listings || []).map((l: any) => ({
    item_id: Number(l.item_id ?? l.id),
    type: l.type,
    title: l.title,
    description: l.description,
    category: l.category,
    location_text: l.location_text || "",
    photos: Array.isArray(l.photos) ? l.photos : [],
    condition: l.condition ?? "",
    user_id: Number(l.user_id),
    user_name: l.user?.username || l.user_name || "You",
    user_avatar: l.user?.avatar_url,
    user_rating: l.user?.rating ?? 0,
    user_rating_count: l.user?.rating_count ?? 0,
    created_at: l.created_at,
  }));
  setListings(mapped);

    } catch (err) {
      console.error("[my-listings] Error:", err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleted = (item_id: number) => {
    setListings((prev) => prev.filter((l) => l.item_id !== item_id));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">My Listings</h1>
            <p className="text-sm text-muted-foreground">
              Listings you have posted
            </p>
          </div>
          <Button onClick={() => router.push("/post")} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-muted-foreground">
              You haven’t posted any listings yet.
            </p>
            <Button onClick={() => router.push("/post")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Listing
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((listing, idx) => (
              <div
                key={listing.item_id}
                className={`p-4 border rounded-xl bg-card ${
                  newlyCreated && idx === 0
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                }`}
              >
                <ListingCard
                
                  listing={listing}
                  onViewDetails={() =>
                    router.push(`/listings/${listing.item_id}`)
                  }
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

      <BottomNav />
    </div>
  );
}



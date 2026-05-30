"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@barter/ui";
import { Textarea } from "@barter/ui";
import { Button } from "@barter/ui";

interface EditableListing {
  item_id: number;
  title: string;
  description: string;
  category: string;
  barter_request?: string | null;
  condition?: string | null;
  location_text?: string | null;
  photos: string[];
  latitude?: number | null;
  longitude?: number | null;
}

export default function EditListingClient({
  listing,
}: {
  listing: EditableListing;
}) {
  const router = useRouter();

  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [category, setCategory] = useState(listing.category);
  const [barterRequest, setBarterRequest] = useState(listing.barter_request || "");
  const [condition, setCondition] = useState(listing.condition || "");
  const [locationText, setLocationText] = useState(listing.location_text || "");
  const [photos, setPhotos] = useState<string[]>(listing.photos || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    setPhotos((prev) => [...prev, newPhotoUrl.trim()]);
    setNewPhotoUrl("");
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch(`/api/listings/${listing.item_id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          description,
          category,
          barter_request: barterRequest,
          condition,
          location_text: locationText,
          photos,
          latitude: listing.latitude,
          longitude: listing.longitude,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert("❌ Failed to update listing: " + (err.error || res.statusText));
        setLoading(false);
        return;
      }

      alert("✅ Listing updated successfully");
      router.push("/home"); // or /my-listings
      router.refresh();
    } catch (err) {
      console.error("❌ Update listing failed:", err);
      alert("Something went wrong while updating listing");
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>

      {/* Barter Request */}
      <div>
        <label className="block text-sm font-medium mb-1">
          What are you looking for? (Barter request)
        </label>
        <Textarea
          value={barterRequest}
          onChange={(e) => setBarterRequest(e.target.value)}
          rows={3}
        />
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium mb-1">Condition</label>
        <Input value={condition} onChange={(e) => setCondition(e.target.value)} />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium mb-1">Location text</label>
        <Input value={locationText} onChange={(e) => setLocationText(e.target.value)} />
      </div>

 {/* ✅ Photos (Gallery Upload - FINAL WORKING VERSION) */}
<div className="space-y-2">
  <label className="block text-sm font-medium">Photos</label>

  {/* ✅ Preview */}
  <div className="flex flex-wrap gap-2">
    {photos.map((photo, idx) => (
      <div
        key={idx}
        className="relative w-24 h-24 border rounded-md overflow-hidden"
      >
        <img src={photo} className="w-full h-full object-cover" />
        <button
          type="button"
          className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded"
          onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
        >
          ✕
        </button>
      </div>
    ))}
  </div>

  {/* ✅ REAL File Input (NOT hidden by label hacks) */}
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const readers = Array.from(files).map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      );

      Promise.all(readers).then((base64Images) => {
        setPhotos((prev) => [...prev, ...base64Images]);
      });
    }}
  />

  {/* ✅ Safe Button (does NOT rely on label) */}
  <Button
    type="button"
    onClick={() => {
      const input = document.querySelector<HTMLInputElement>(
        'input[type="file"]'
      );
      input?.click();   // ✅ this directly opens the gallery
    }}
    variant="secondary"
  >
    📁 Add Images from Gallery
  </Button>
</div>




      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

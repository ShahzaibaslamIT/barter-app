"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, Package, Wrench } from "lucide-react"
import { LocationPicker } from "@/components/location/location-picker"

interface ListingFormProps {
  type: "item" | "service"
  onSuccess?: () => void
}

const ITEM_CATEGORIES = [
  "Electronics",
  "Furniture",
  "Appliances",
  "Tools",
  "Books",
  "Clothing",
  "Sports Equipment",
  "Musical Instruments",
  "Art & Crafts",
  "Other",
]

const SERVICE_CATEGORIES = [
  "Moving Help",
  "Tutoring",
  "Cleaning",
  "Handyman",
  "Pet Care",
  "Gardening",
  "Photography",
  "Web Design",
  "Writing",
  "Other",
]

export function ListingForm({ type, onSuccess }: ListingFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location_text: "",
    barter_request: "",
    photos: [] as string[],
    condition: type === "item" ? "good" : undefined,
    availability: type === "service" ? "" : undefined,
    skill_level: type === "service" ? "unskilled" : undefined,
  })
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const categories = type === "item" ? ITEM_CATEGORIES : SERVICE_CATEGORIES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("Please log in to create a listing")
      }

      const payload = {
        type,
        ...formData,
        availability: type === "service" ? { notes: formData.availability } : undefined,
        latitude: locationCoords?.latitude,
        longitude: locationCoords?.longitude,
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create listing")
      }

      toast({
        title: "Success!",
        description: `Your ${type} listing has been created successfully.`,
      })

      setFormData({
        title: "",
        description: "",
        category: "",
        location_text: "",
        barter_request: "",
        photos: [],
        condition: type === "item" ? "good" : undefined,
        availability: type === "service" ? "" : undefined,
        skill_level: type === "service" ? "unskilled" : undefined,
      })
      setLocationCoords(null)

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSelect = (location: { latitude: number; longitude: number; name: string }) => {
    setLocationCoords({ latitude: location.latitude, longitude: location.longitude })
    setFormData((prev) => ({ ...prev, location_text: location.name }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newPhotos = files.map((file, index) => `/placeholder.svg?height=200&width=200&query=${file.name}`)
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos].slice(0, 5),
    }))
  }

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {type === "item" ? <Package className="h-6 w-6 text-primary" /> : <Wrench className="h-6 w-6 text-primary" />}
          <CardTitle className="font-serif text-2xl">Post {type === "item" ? "an Item" : "a Service"}</CardTitle>
        </div>
        <CardDescription>
          {type === "item"
            ? "List an item you'd like to trade for services"
            : "Offer your services in exchange for items"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              {type === "item" ? "Item Name" : "Service Title"} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder={type === "item" ? "e.g., MacBook Pro 2020" : "e.g., Moving Help Available"}
              maxLength={100}
              required
            />
            <p className="text-xs text-muted-foreground">{formData.title.length}/100 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase().replace(/\s+/g, "_")}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder={
                type === "item"
                  ? "Describe your item's condition, features, and any relevant details..."
                  : "Describe your service, experience level, and what you can help with..."
              }
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length < 20 && formData.description.length > 0
                ? `${20 - formData.description.length} more characters needed`
                : `${formData.description.length} characters`}
            </p>
          </div>

          {type === "item" && (
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "service" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="skill_level">Skill Level</Label>
                <Select
                  value={formData.skill_level}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, skill_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unskilled">Unskilled</SelectItem>
                    <SelectItem value="skilled">Skilled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Textarea
                  id="availability"
                  value={formData.availability}
                  onChange={(e) => setFormData((prev) => ({ ...prev, availability: e.target.value }))}
                  placeholder="e.g., Weekends, evenings after 6pm, flexible schedule..."
                  rows={2}
                />
              </div>
            </>
          )}

          <LocationPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={
              locationCoords && formData.location_text ? { ...locationCoords, name: formData.location_text } : undefined
            }
            className="space-y-2"
          />

          <div className="space-y-2">
            <Label htmlFor="barter_request">{type === "item" ? "Looking for (Service)" : "Looking for (Item)"}</Label>
            <Textarea
              id="barter_request"
              value={formData.barter_request}
              onChange={(e) => setFormData((prev) => ({ ...prev, barter_request: e.target.value }))}
              placeholder={
                type === "item"
                  ? "e.g., Help moving, tutoring in math, web design services..."
                  : "e.g., Laptop, furniture, electronics, tools..."
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photos">Photos {type === "item" && <span className="text-destructive">*</span>}</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" className="relative bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photos
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </Button>
                <p className="text-sm text-muted-foreground">
                  {formData.photos.length}/5 photos
                  {type === "item" && formData.photos.length === 0 && " (at least 1 required)"}
                </p>
              </div>

              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo || "/placeholder.svg"}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !locationCoords}>
            {isLoading ? "Creating Listing..." : `Post ${type === "item" ? "Item" : "Service"}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

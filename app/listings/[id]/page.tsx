"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BottomNav } from "@/components/ui/bottom-nav"
import { MakeOfferDialog } from "@/components/offers/make-offer-dialog"
import {
  ArrowLeft,
  MapPin,
  Star,
  Package,
  Wrench,
  MessageCircle,
  Heart,
  Share,
} from "lucide-react"

interface Listing {
  id: string
  type: "item" | "service"
  title: string
  description: string
  category: string
  location_text: string
  barter_request?: string
  photos: string[]
  condition?: string
  availability?: any
  skill_level?: string
  user_name: string
  user_avatar?: string
  user_rating: number
  rating_count: number
  created_at: string
}

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>() // ✅ safe way
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showMakeOfferDialog, setShowMakeOfferDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!params?.id) return
    fetchListing(params.id)
  }, [params?.id])

  const fetchListing = async (id: string) => {
    try {
      const response = await fetch(`/api/listings/${id}`)
      const data = await response.json()

      if (response.ok) {
        setListing(data.listing)
      } else {
        console.error("Failed to fetch listing:", data.error)
      }
    } catch (error) {
      console.error("Failed to fetch listing:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <p className="text-muted-foreground">Loading listing...</p>
        <BottomNav />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Listing not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
        <BottomNav />
      </div>
    )
  }

  const images =
    listing.photos.length > 0
      ? listing.photos
      : ["/real-estate-listing-modern.png"]

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* ✅ Image Gallery */}
        <div className="relative">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={images[currentImageIndex] || "/placeholder.svg"}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    index === currentImageIndex
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Listing Info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={listing.type === "item" ? "default" : "secondary"}
                  className="flex items-center gap-1"
                >
                  {listing.type === "item" ? (
                    <Package className="h-3 w-3" />
                  ) : (
                    <Wrench className="h-3 w-3" />
                  )}
                  {listing.type === "item" ? "Item" : "Service"}
                </Badge>
                {listing.condition && (
                  <Badge variant="outline">{listing.condition}</Badge>
                )}
                {listing.skill_level && (
                  <Badge variant="outline">
                    {listing.skill_level === "skilled"
                      ? "Skilled"
                      : "Unskilled"}
                  </Badge>
                )}
              </div>
              <h1 className="font-serif text-2xl font-bold mb-2">
                {listing.title}
              </h1>
              <p className="text-muted-foreground capitalize">
                {listing.category.replace(/_/g, " ")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{listing.location_text}</span>
            <span>•</span>
            <span>Posted {formatDate(listing.created_at)}</span>
          </div>
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </CardContent>
        </Card>

        {/* Barter Request */}
        {listing.barter_request && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Looking For</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                {listing.barter_request}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Availability (for services) */}
        {listing.type === "service" && listing.availability?.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                {listing.availability.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Posted By</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={listing.user_avatar || "/placeholder.svg"}
                />
                <AvatarFallback>
                  {listing.user_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{listing.user_name}</h3>
                {listing.rating_count > 0 ? (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {listing.user_rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({listing.rating_count} reviews)
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">New user</p>
                )}
              </div>
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            className="flex-1"
            onClick={() => setShowMakeOfferDialog(true)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Make Offer
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent">
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
        </div>
      </div>

      {/* Make Offer Dialog */}
      <MakeOfferDialog
        isOpen={showMakeOfferDialog}
        onClose={() => setShowMakeOfferDialog(false)}
        targetListing={{
          id: listing.id,
          title: listing.title,
          type: listing.type,
          user_name: listing.user_name,
        }}
        onSuccess={() => {
          router.push("/offers")
        }}
      />

      <BottomNav />
    </div>
  )
}

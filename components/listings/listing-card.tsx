"use client"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Star, Package, Wrench } from "lucide-react"

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
  user_name: string
  user_avatar?: string
  user_rating: number
  rating_count: number
  created_at: string
}

interface ListingCardProps {
  listing: Listing
  onViewDetails?: (listing: Listing) => void
  onMakeOffer?: (listing: Listing) => void
}

export function ListingCard({ listing, onViewDetails, onMakeOffer }: ListingCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const mainImage = listing.photos[0] || `/placeholder.svg?height=200&width=300&query=${listing.type}`

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img src={mainImage || "/placeholder.svg"} alt={listing.title} className="w-full h-48 object-cover" />
        <div className="absolute top-2 left-2">
          <Badge variant={listing.type === "item" ? "default" : "secondary"} className="flex items-center gap-1">
            {listing.type === "item" ? <Package className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
            {listing.type === "item" ? "Item" : "Service"}
          </Badge>
        </div>
        {listing.condition && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              {listing.condition}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
            <p className="text-sm text-muted-foreground capitalize">{listing.category.replace(/_/g, " ")}</p>
          </div>

          <p className="text-sm text-foreground line-clamp-2">{listing.description}</p>

          {listing.barter_request && (
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Looking for:</p>
              <p className="text-sm line-clamp-1">{listing.barter_request}</p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{listing.location_text}</span>
            </div>
            <span>{formatDate(listing.created_at)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={listing.user_avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">{listing.user_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{listing.user_name}</span>
            {listing.rating_count > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs">{listing.user_rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({listing.rating_count})</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onViewDetails?.(listing)}>
          View Details
        </Button>
        <Button className="flex-1" onClick={() => onMakeOffer?.(listing)}>
          Make Offer
        </Button>
      </CardFooter>
    </Card>
  )
}

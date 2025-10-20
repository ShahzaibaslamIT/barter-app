"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RatingDialog } from "@/components/ratings/rating-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Package,
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  Star,
} from "lucide-react"

interface Offer {
  offer_id: number
  listing_id: number
  offerer_id: number
  status: "pending" | "accepted" | "declined" | "withdrawn" | "completed"| "cancelled"
  message?: string
  created_at: string
  listing?: {   // 🔹 made optional
    item_id: number
    user_id: number
    title: string
    photos: string[]
    type?: "item" | "service"
  }
  offeredListing?: {
    item_id: number
    title: string
    photos: string[]
    type?: "item" | "service"
  } | null
  offerer?: {
    user_id: number
    username: string
    avatar_url?: string
  }
}

interface OfferCardProps {
  offer: Offer
  type: "sent" | "received"
  onUpdate?: () => void
}

export function OfferCard({ offer, type, onUpdate }: OfferCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [canRate, setCanRate] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (offer.status === "completed") {
      checkRatingStatus()
    }
  }, [offer.offer_id, offer.status])

  const checkRatingStatus = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(
        `/api/barter-offers/${offer.offer_id}/rating-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await response.json()
      if (response.ok) {
        setCanRate(data.can_rate)
        setHasRated(data.has_rated)
      }
    } catch (error) {
      console.error("Failed to check rating status:", error)
    }
  }

  const handleStatusUpdate = async (
    newStatus: "accepted" | "declined" | "withdrawn" | "completed"
  ) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")

      const response = await fetch(`/api/barter-offers/${offer.offer_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update offer")
      }

      toast({
        title: "Success!",
        description: `Offer ${newStatus} successfully.`,
      })

      onUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinueInMessages = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        router.push("/auth")
        return
      }

      const otherUserId =
        type === "sent" ? offer.listing?.user_id : offer.offerer_id

      if (!otherUserId) {
        toast({
          title: "Error",
          description: "Other user information missing",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/messages/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listing_id: offer.listing_id,
          barter_id: offer.offer_id,
          other_user_id: otherUserId,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to create/find thread")
      }

      router.push(`/messages/${data.thread.thread_id}`)
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to start conversation",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = () => {
    switch (offer.status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "declined":
      case "withdrawn":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (offer.status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "declined":
      case "withdrawn":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const otherUser =
    type === "sent"
      ? `Owner #${offer.listing?.user_id ?? "?"}`
      : offer.offerer?.username
  const otherUserAvatar =
    type === "sent" ? undefined : offer.offerer?.avatar_url

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Badge className={getStatusColor()}>{offer.status}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(offer.created_at)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Target Listing */}
          {offer.listing && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {type === "sent"
                  ? "Your offer for:"
                  : "Offer for your listing:"}
              </p>
              <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                <img
                  src={offer.listing.photos?.[0] || "/placeholder.svg"}
                  alt={offer.listing.title}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        offer.listing.type === "item"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {offer.listing.type}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm">
                    {offer.listing.title}
                  </h4>
                </div>
              </div>
            </div>
          )}

          {/* Offered Listing */}
          {offer.offeredListing && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {type === "sent" ? "You offered:" : "They offered:"}
              </p>
              <div className="flex gap-3 p-3 bg-primary/5 rounded-lg">
                <img
                  src={offer.offeredListing.photos?.[0] || "/placeholder.svg"}
                  alt={offer.offeredListing.title}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">
                    {offer.offeredListing.title}
                  </h4>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          {offer.message && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Message:
              </p>
              <p className="text-sm bg-muted/50 p-3 rounded-lg">
                {offer.message}
              </p>
            </div>
          )}

          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={otherUserAvatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">
                {otherUser?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{otherUser}</p>
              <p className="text-xs text-muted-foreground">
                {type === "sent" ? "Listing owner" : "Offer sender"}
              </p>
            </div>
          </div>

          {/* Actions */}
          {offer.status === "pending" && (
            <div className="flex gap-2">
              {type === "received" ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate("accepted")}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate("declined")}
                    disabled={isLoading}
                    className="flex-1 bg-transparent"
                  >
                    Decline
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate("withdrawn")}
                  disabled={isLoading}
                  className="flex-1 bg-transparent"
                >
                  Cancel Offer
                </Button>
              )}
            </div>
          )}

          {offer.status === "accepted" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={handleContinueInMessages}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Continue in Messages
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusUpdate("completed")}
                disabled={isLoading}
                className="bg-transparent"
              >
                Mark Complete
              </Button>
            </div>
          )}

          {/* Rating */}
          {offer.status === "completed" && canRate && !hasRated && (
            <Button
              size="sm"
              className="w-full"
              onClick={() => setShowRatingDialog(true)}
            >
              <Star className="h-4 w-4 mr-2" />
              Rate Experience
            </Button>
          )}
          {offer.status === "completed" && hasRated && (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                You have rated this barter
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Dialog */}
      <RatingDialog
        isOpen={showRatingDialog}
        onClose={() => setShowRatingDialog(false)}
        barter={{
          id: offer.offer_id.toString(),
          listing_title: offer.listing?.title ?? "Unknown Listing",
          other_user_name: otherUser || "",
          other_user_id:
            type === "sent"
              ? offer.listing?.user_id?.toString() ?? ""
              : offer.offerer_id.toString(),
        }}
        onSuccess={() => {
          setHasRated(true)
          setCanRate(false)
        }}
      />
    </>
  )
}

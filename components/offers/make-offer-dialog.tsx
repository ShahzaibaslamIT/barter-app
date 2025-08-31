"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Package, Wrench, MessageCircle } from "lucide-react"

interface Listing {
  id: string
  type: "item" | "service"
  title: string
  description: string
  category: string
  photos: string[]
  condition?: string
  created_at: string
}

interface MakeOfferDialogProps {
  isOpen: boolean
  onClose: () => void
  targetListing: {
    id: string
    title: string
    type: "item" | "service"
    user_name: string
  }
  onSuccess?: () => void
}

export function MakeOfferDialog({ isOpen, onClose, targetListing, onSuccess }: MakeOfferDialogProps) {
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [selectedListing, setSelectedListing] = useState<string>("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingListings, setIsLoadingListings] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchMyListings()
      setMessage(
        `Hi! I'm interested in your ${targetListing.title}. I'd like to make a barter offer. Let me know if you're interested!`,
      )
    }
  }, [isOpen, targetListing.title])

  const fetchMyListings = async () => {
    setIsLoadingListings(true)
    try {
      const token = localStorage.getItem("auth_token")
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      const response = await fetch(`/api/users/${user.id}/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (response.ok) {
        setMyListings(data.listings)
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error)
    } finally {
      setIsLoadingListings(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("auth_token")

      const response = await fetch("/api/barter-offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listing_id: targetListing.id,
          offered_listing_id: selectedListing || null,
          message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create offer")
      }

      toast({
        title: "Offer Sent!",
        description: `Your offer has been sent to ${targetListing.user_name}.`,
      })

      onClose()
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

  const selectedListingData = myListings.find((l) => l.id === selectedListing)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Make Offer
          </DialogTitle>
          <DialogDescription>
            Send a barter offer for "{targetListing.title}" to {targetListing.user_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Your Listing */}
          <div className="space-y-3">
            <Label>What would you like to offer? (Optional)</Label>
            <p className="text-sm text-muted-foreground">
              You can offer one of your listings or just send a message to discuss.
            </p>

            {isLoadingListings ? (
              <p className="text-sm text-muted-foreground">Loading your listings...</p>
            ) : myListings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You don't have any active listings yet. You can still send a message to discuss.
              </p>
            ) : (
              <div className="grid gap-3 max-h-60 overflow-y-auto">
                <div
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedListing === "" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedListing("")}
                >
                  <p className="font-medium">No specific offer</p>
                  <p className="text-sm text-muted-foreground">Just send a message to discuss</p>
                </div>

                {myListings.map((listing) => (
                  <div
                    key={listing.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedListing === listing.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedListing(listing.id)}
                  >
                    <div className="flex gap-3">
                      <img
                        src={listing.photos[0] || "/placeholder.svg"}
                        alt={listing.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={listing.type === "item" ? "default" : "secondary"}
                            className="flex items-center gap-1"
                          >
                            {listing.type === "item" ? <Package className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
                            {listing.type}
                          </Badge>
                          {listing.condition && <Badge variant="outline">{listing.condition}</Badge>}
                        </div>
                        <h4 className="font-medium line-clamp-1">{listing.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Listing Preview */}
          {selectedListingData && (
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Your Offer</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-3">
                  <img
                    src={selectedListingData.photos[0] || "/placeholder.svg"}
                    alt={selectedListingData.title}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-medium">{selectedListingData.title}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedListingData.category.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain your offer..."
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">Be friendly and explain why this would be a good trade!</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !message.trim()} className="flex-1">
              {isLoading ? "Sending..." : "Send Offer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

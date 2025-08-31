"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/ui/bottom-nav"
import { OfferCard } from "@/components/offers/offer-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, Handshake } from "lucide-react"

interface Offer {
  id: string
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled"
  message?: string
  created_at: string
  listing_title: string
  listing_type: "item" | "service"
  listing_photos: string[]
  offered_listing_title?: string
  offered_listing_type?: "item" | "service"
  offered_listing_photos?: string[]
  offerer_name?: string
  offerer_avatar?: string
  listing_owner_name?: string
  listing_owner_avatar?: string
}

export default function OffersPage() {
  const [sentOffers, setSentOffers] = useState<Offer[]>([])
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/auth")
      return
    }

    fetchOffers()
  }, [router])

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem("auth_token")

      const [sentResponse, receivedResponse] = await Promise.all([
        fetch("/api/barter-offers?type=sent", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/barter-offers?type=received", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const [sentData, receivedData] = await Promise.all([sentResponse.json(), receivedResponse.json()])

      if (sentResponse.ok) setSentOffers(sentData.offers)
      if (receivedResponse.ok) setReceivedOffers(receivedData.offers)
    } catch (error) {
      console.error("Failed to fetch offers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const pendingSentCount = sentOffers.filter((offer) => offer.status === "pending").length
  const pendingReceivedCount = receivedOffers.filter((offer) => offer.status === "pending").length

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Handshake className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-serif text-2xl font-bold text-primary">My Offers</h1>
              <p className="text-sm text-muted-foreground">Manage your barter offers</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="received" className="flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4" />
              Received
              {pendingReceivedCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                  {pendingReceivedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Sent
              {pendingSentCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {pendingSentCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading offers...</p>
              </div>
            ) : receivedOffers.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <ArrowDownLeft className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">No offers received yet</p>
                <p className="text-sm text-muted-foreground">
                  When someone makes an offer on your listings, they'll appear here
                </p>
              </div>
            ) : (
              receivedOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} type="received" onUpdate={fetchOffers} />
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading offers...</p>
              </div>
            ) : sentOffers.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <ArrowUpRight className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">No offers sent yet</p>
                <p className="text-sm text-muted-foreground">
                  Start browsing listings and make your first barter offer!
                </p>
              </div>
            ) : (
              sentOffers.map((offer) => <OfferCard key={offer.id} offer={offer} type="sent" onUpdate={fetchOffers} />)
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  )
}

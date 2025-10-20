"use client"

import { useState } from "react"
import { ListingForm } from "@/components/listings/listing-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Package, Wrench, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PostPage() {
  const [selectedType, setSelectedType] = useState<"item" | "service" | null>(null)
  const router = useRouter()

  if (selectedType) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => setSelectedType(null)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Selection
          </Button>
          <ListingForm
            type={selectedType}
            onSuccess={() => {
              router.push("/home")
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-primary mb-2">What would you like to post?</h1>
          <p className="text-muted-foreground">Choose whether you're offering an item or a service</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary"
            onClick={() => setSelectedType("item")}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold mb-2">Post an Item</h3>
                <p className="text-muted-foreground text-sm">Trade your unused items for services you need</p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Upload photos of your item</p>
                <p>• Specify what service you want</p>
                <p>• Set your location for local trades</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary"
            onClick={() => setSelectedType("service")}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <Wrench className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold mb-2">Post a Service</h3>
                <p className="text-muted-foreground text-sm">Offer your skills and services for items you want</p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Describe your service offering</p>
                <p>• Set your availability</p>
                <p>• Specify what items you want</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

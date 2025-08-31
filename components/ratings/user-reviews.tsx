"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RatingDisplay } from "./rating-display"
import { Package, Wrench } from "lucide-react"

interface Rating {
  id: string
  rating: number
  comment?: string
  created_at: string
  rater_name: string
  rater_avatar?: string
  listing_title: string
  listing_type: "item" | "service"
}

interface UserReviewsProps {
  userId: string
}

export function UserReviews({ userId }: UserReviewsProps) {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRatings()
  }, [userId])

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/ratings?user_id=${userId}`)
      const data = await response.json()

      if (response.ok) {
        setRatings(data.ratings)
        setAverageRating(data.average_rating)
        setTotalRatings(data.total_ratings)
      }
    } catch (error) {
      console.error("Failed to fetch ratings:", error)
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
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading reviews...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Reviews</span>
          <RatingDisplay rating={averageRating} count={totalRatings} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ratings.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No reviews yet</p>
        ) : (
          ratings.map((rating) => (
            <div key={rating.id} className="border-b last:border-b-0 pb-4 last:pb-0">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={rating.rater_avatar || "/placeholder.svg"} />
                  <AvatarFallback>{rating.rater_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{rating.rater_name}</p>
                      <RatingDisplay rating={rating.rating} showCount={false} size="sm" />
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(rating.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={rating.listing_type === "item" ? "default" : "secondary"} className="text-xs">
                      {rating.listing_type === "item" ? (
                        <Package className="h-3 w-3 mr-1" />
                      ) : (
                        <Wrench className="h-3 w-3 mr-1" />
                      )}
                      {rating.listing_title}
                    </Badge>
                  </div>

                  {rating.comment && <p className="text-sm text-muted-foreground leading-relaxed">{rating.comment}</p>}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

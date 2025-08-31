"use client"

import { Star } from "lucide-react"

interface RatingDisplayProps {
  rating: number
  count?: number
  size?: "sm" | "md" | "lg"
  showCount?: boolean
}

export function RatingDisplay({ rating, count = 0, size = "md", showCount = true }: RatingDisplayProps) {
  const starSize = size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"
  const textSize = size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"

  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className={`${starSize} fill-yellow-400 text-yellow-400`} />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className={`${starSize} text-muted-foreground`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
            </div>
          </div>,
        )
      } else {
        stars.push(<Star key={i} className={`${starSize} text-muted-foreground`} />)
      }
    }

    return stars
  }

  if (count === 0) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex gap-0.5">{renderStars()}</div>
        <span className={`${textSize} text-muted-foreground`}>No ratings yet</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">{renderStars()}</div>
      <span className={`${textSize} font-medium`}>{rating.toFixed(1)}</span>
      {showCount && <span className={`${textSize} text-muted-foreground`}>({count})</span>}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/ui/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserReviews } from "@/components/ratings/user-reviews"
import { RatingDisplay } from "@/components/ratings/rating-display"
import { Settings, Package, MessageCircle, LogOut, Plus } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [userStats, setUserStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    activeListings: 5,
    completedTrades: 12,
  })
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/auth")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchUserStats(parsedUser.id)
  }, [router])

  const fetchUserStats = async (userId: string) => {
    try {
      const response = await fetch(`/api/ratings?user_id=${userId}`)
      const data = await response.json()
      if (response.ok) {
        setUserStats((prev) => ({
          ...prev,
          averageRating: data.average_rating,
          totalRatings: data.total_ratings,
        }))
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
    router.push("/auth")
  }

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center pb-20">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-2xl font-bold text-primary">Profile</h1>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* User Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="font-serif text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="capitalize">
                    {user.user_type.replace("_", " ")}
                  </Badge>
                  <RatingDisplay rating={userStats.averageRating} count={userStats.totalRatings} size="sm" />
                </div>
              </div>
            </div>
            <Button className="w-full">Edit Profile</Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{userStats.activeListings}</p>
              <p className="text-sm text-muted-foreground">Active Listings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-6 w-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold">{userStats.completedTrades}</p>
              <p className="text-sm text-muted-foreground">Completed Trades</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-2 flex justify-center">
                <RatingDisplay rating={userStats.averageRating} showCount={false} size="md" />
              </div>
              <p className="text-sm text-muted-foreground">
                {userStats.totalRatings} {userStats.totalRatings === 1 ? "Review" : "Reviews"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => router.push("/post")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Listing
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => router.push("/messages")}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              View Messages
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={() => router.push("/offers")}
            >
              <Package className="h-4 w-4 mr-2" />
              My Offers
            </Button>
          </CardContent>
        </Card>

        <UserReviews userId={user.id} />

        {/* Logout */}
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <BottomNav />
    </div>
  )
}

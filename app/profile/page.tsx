// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { useSession, signOut } from "next-auth/react"
// import { BottomNav } from "@/components/ui/bottom-nav"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
// import { UserReviews } from "@/components/ratings/user-reviews"
// import { RatingDisplay } from "@/components/ratings/rating-display"
// import { LogOut, Edit3, Upload } from "lucide-react"
// import { Plus, Search, MapPin, TrendingUp, Loader2 } from "lucide-react"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { useToast } from "@/hooks/use-toast"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// export default function ProfilePage() {
//   const { data: session, status } = useSession()
//   const [user, setUser] = useState<any>(null)
//   const [userStats, setUserStats] = useState({
//     averageRating: 0,
//     totalRatings: 0,
//     activeListings: 0,
//     completedTrades: 0,
//   })
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [editData, setEditData] = useState({
//     username: "",
//     email: "",
//     phone: "",
//     bio: "",
//     avatarFile: null as File | null,
//     avatarPreview: "",
//   })
//   const router = useRouter()
//   const { toast } = useToast()

//   useEffect(() => {
//     if (status === "loading") return

//     const stored = localStorage.getItem("user")
//     const localUser = stored ? JSON.parse(stored) : null
//     const effectiveUser = session?.user || localUser

//     if (!effectiveUser) {
//       router.push("/auth")
//       return
//     }

//     setUser(effectiveUser)
//     setEditData((prev) => ({
//       ...prev,
//       username: effectiveUser.username || effectiveUser.name || "",
//       email: effectiveUser.email || "",
//       phone: effectiveUser.phone || "",
//       bio: effectiveUser.bio || "",
//       avatarPreview: effectiveUser.avatar_url || effectiveUser.image || "",
//     }))

//     if (effectiveUser.id || effectiveUser.user_id) {
//       fetchUserStats(effectiveUser.id || effectiveUser.user_id)
//     }
//   }, [status, session, router])

//   const fetchUserStats = async (userId: string) => {
//     try {
//       const response = await fetch(`/api/ratings?user_id=${userId}`)
//       const data = await response.json()
//       if (response.ok) {
//         setUserStats({
//           averageRating: data.average_rating ?? 0,
//           totalRatings: data.total_ratings ?? 0,
//           activeListings: data.active_listings ?? 0,
//           completedTrades: data.completed_trades ?? 0,
//         })
//       }
//     } catch (error) {
//       console.error("Failed to fetch user stats:", error)
//     }
//   }

//   const handleLogout = () => {
//     localStorage.removeItem("auth_token")
//     localStorage.removeItem("user")
//     signOut({ callbackUrl: "/auth" })
//   }

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null
//     if (file) {
//       setEditData((prev) => ({
//         ...prev,
//         avatarFile: file,
//         avatarPreview: URL.createObjectURL(file),
//       }))
//     }
//   }

//   const handleSaveProfile = () => {
//     const updatedUser = { ...user, ...editData, avatar_url: editData.avatarPreview }
//     localStorage.setItem("user", JSON.stringify(updatedUser))
//     setUser(updatedUser)
//     setIsDialogOpen(false)

//     toast({
//       title: "Profile Updated",
//       description: "Your profile information has been updated successfully.",
//     })
//   }

//   if (status === "loading" && !user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-muted-foreground">
//         Loading profile...
//       </div>
//     )
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-muted-foreground">
//         No user found
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-background pb-20">
//       <div className="container mx-auto px-4 pt-10 space-y-8">
//         {/* Profile Header */}
//         <Card className="p-6 text-center shadow-md">
//           <div className="flex flex-col items-center space-y-3">
//             <div className="relative">
//               <Avatar className="h-28 w-28 ring-4 ring-muted">
//                 <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
//                 <AvatarFallback className="text-3xl">
//                   {user.username?.charAt(0) || "U"}
//                 </AvatarFallback>
//               </Avatar>
//               <Button
//                 size="icon"
//                 variant="secondary"
//                 className="absolute bottom-2 right-2 rounded-full shadow-md"
//                 onClick={() => setIsDialogOpen(true)}
//               >
//                 <Edit3 className="h-4 w-4" />
//               </Button>
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold">{user.username}</h2>
//               <p className="text-muted-foreground">{user.email}</p>
//             </div>
//             {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
//             <div className="flex justify-center gap-2 mt-2">
//               <Badge variant="outline" className="capitalize">
//                 {user.user_type?.replace("_", " ") || "user"}
//               </Badge>
//               <RatingDisplay rating={userStats.averageRating} count={userStats.totalRatings} size="sm" />
//             </div>
//           </div>
//         </Card>

//         {/* Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {[
//             { label: "Active Listings", value: userStats.activeListings },
//             { label: "Completed Trades", value: userStats.completedTrades },
//             { label: "Reviews", value: userStats.totalRatings },
//             { label: "Rating", value: userStats.averageRating.toFixed(1) },
//           ].map((stat, idx) => (
//             <Card key={idx} className="shadow-sm hover:shadow-md transition">
//               <CardContent className="p-4 text-center">
//                 <p className="text-xl font-semibold">{stat.value}</p>
//                 <p className="text-sm text-muted-foreground">{stat.label}</p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Actions */}
//         <Card className="shadow-sm">
//           <CardHeader>
//             <CardTitle>Quick Actions</CardTitle>
//           </CardHeader>
//           <CardContent className="grid gap-3">
//             <Button onClick={() => router.push("/post")}>
//                             <Plus className="h-4 w-4 mr-2" />
//                             Create First Listing
//                           </Button>
//             <Button variant="outline" className="w-full" onClick={() => router.push("/offers")}>
//               My Offers
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Reviews */}
//         <UserReviews userId={user.id || user.user_id} />

//         {/* Logout */}
//         <Button variant="destructive" className="w-full" onClick={handleLogout}>
//           <LogOut className="h-4 w-4 mr-2" />
//           Logout
//         </Button>
//       </div>

//       <BottomNav />

//       {/* Edit Profile Dialog */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="max-w-lg">
//           <DialogHeader>
//             <DialogTitle>Edit Profile</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="username">Username</Label>
//                 <Input
//                   id="username"
//                   value={editData.username}
//                   onChange={(e) => setEditData({ ...editData, username: e.target.value })}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={editData.email}
//                   onChange={(e) => setEditData({ ...editData, email: e.target.value })}
//                 />
//               </div>
//               <div className="col-span-2">
//                 <Label htmlFor="bio">Bio</Label>
//                 <Textarea
//                   id="bio"
//                   rows={3}
//                   value={editData.bio}
//                   onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
//                 />
//               </div>
//             </div>
//             <div className="flex gap-3 mt-6">
//               <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button className="flex-1" onClick={handleSaveProfile}>
//                 Save Changes
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }


"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { BottomNav } from "@/components/ui/bottom-nav"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserReviews } from "@/components/ratings/user-reviews"
import { RatingDisplay } from "@/components/ratings/rating-display"
import { LogOut, Edit3, Upload, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<any>(null)
  const [userStats, setUserStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    activeListings: 0,
    completedTrades: 0,
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    phone: "",
    bio: "",
    avatarFile: null as File | null,
    avatarPreview: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  // 🔥 Sync NextAuth session with localStorage (for Google users)
  useEffect(() => {
    if (session?.auth_token) {
      localStorage.setItem("auth_token", session.auth_token)
      localStorage.setItem("user", JSON.stringify(session.user))
    }
  }, [session])

  // Load user data from either NextAuth or localStorage
  useEffect(() => {
    if (status === "loading") return

    const stored = localStorage.getItem("user")
    const localUser = stored ? JSON.parse(stored) : null
    const effectiveUser = session?.user || localUser

    if (!effectiveUser) {
      router.push("/auth")
      return
    }

    setUser(effectiveUser)
    setEditData((prev) => ({
      ...prev,
      username: effectiveUser.username || effectiveUser.name || "",
      email: effectiveUser.email || "",
      phone: effectiveUser.phone || "",
      bio: effectiveUser.bio || "",
      avatarPreview: effectiveUser.avatar_url || effectiveUser.image || "",
    }))

    if (effectiveUser.id || effectiveUser.user_id) {
      fetchUserStats(effectiveUser.id || effectiveUser.user_id)
    }
  }, [status, session, router])

  const fetchUserStats = async (userId: string) => {
    try {
      const response = await fetch(`/api/ratings?user_id=${userId}`)
      const data = await response.json()
    if (response.ok) {
        setUserStats({
          averageRating: data.average_rating ?? 0,
          totalRatings: data.total_ratings ?? 0,
          activeListings: data.active_listings ?? 0,
          completedTrades: data.completed_trades ?? 0,
        })
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
    signOut({ callbackUrl: "/auth" })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setEditData((prev) => ({
        ...prev,
        avatarFile: file,
        avatarPreview: URL.createObjectURL(file),
      }))
    }
  }

  const handleSaveProfile = () => {
    const updatedUser = { ...user, ...editData, avatar_url: editData.avatarPreview }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
    setIsDialogOpen(false)

    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    })
  }

  if (status === "loading" && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading profile...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        No user found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 pt-10 space-y-8">
        {/* Profile Header */}
        <Card className="p-6 text-center shadow-md">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <Avatar className="h-28 w-28 ring-4 ring-muted">
                <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-3xl">
                  {user.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-2 right-2 rounded-full shadow-md"
                onClick={() => setIsDialogOpen(true)}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.username}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
            <div className="flex justify-center gap-2 mt-2">
              <Badge variant="outline" className="capitalize">
                {user.user_type?.replace("_", " ") || "user"}
              </Badge>
              <RatingDisplay rating={userStats.averageRating} count={userStats.totalRatings} size="sm" />
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Listings", value: userStats.activeListings },
            { label: "Completed Trades", value: userStats.completedTrades },
            { label: "Reviews", value: userStats.totalRatings },
            { label: "Rating", value: userStats.averageRating.toFixed(1) },
          ].map((stat, idx) => (
            <Card key={idx} className="shadow-sm hover:shadow-md transition">
              <CardContent className="p-4 text-center">
                <p className="text-xl font-semibold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button onClick={() => router.push("/post")}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Listing
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push("/offers")}>
              My Offers
            </Button>
          </CardContent>
        </Card>

        {/* Reviews */}
        <UserReviews userId={user.id || user.user_id} />

        {/* Logout */}
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <BottomNav />

      {/* Edit Profile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveProfile}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

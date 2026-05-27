// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useSession, signOut } from "next-auth/react";

// import { BottomNav } from "@/components/ui/bottom-nav";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { UserReviews } from "@/components/ratings/user-reviews";
// import { RatingDisplay } from "@/components/ratings/rating-display";
// import {
//   LogOut,
//   Edit,
//   Plus,
//   Loader2,
//   Mail,
//   MapPin,
//   Calendar,
//   Camera,
//   Save,
//   TrendingUp,
//   Package,
//   Star,
//   CheckCircle,
// } from "lucide-react";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// export default function ProfilePage() {
//   const router = useRouter();
//   const { data: session } = useSession();
//   const { toast } = useToast();

//   const [user, setUser] = useState<any>(null);
//   const [loadingStats, setLoadingStats] = useState(false);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [uploadingImage, setUploadingImage] = useState(false);

//   const [userStats, setUserStats] = useState({
//     averageRating: 0,
//     totalRatings: 0,
//     activeListings: 0,
//     completedTrades: 0,
//   });

//   const [editData, setEditData] = useState({
//     username: "",
//     email: "",
//     bio: "",
//     avatar_url: "",
//   });

//   // Auth Resolution
//   useEffect(() => {
//     let resolvedUser: any = null;

//     if (session?.user) {
//       resolvedUser = session.user;
//       localStorage.setItem("user", JSON.stringify(session.user));

//       const token = (session as any)?.auth_token;
//       if (token) {
//         localStorage.setItem("auth_token", token);
//       }
//     }

//     if (!resolvedUser) {
//       const stored = localStorage.getItem("user");
//       if (stored && stored !== "undefined") {
//         try {
//           resolvedUser = JSON.parse(stored);
//         } catch {
//           localStorage.removeItem("user");
//           localStorage.removeItem("auth_token");
//         }
//       }
//     }

//     if (!resolvedUser || !(resolvedUser.user_id || resolvedUser.id)) {
//       router.replace("/auth");
//       return;
//     }

//     setUser(resolvedUser);

//     setEditData({
//       username: resolvedUser.username || resolvedUser.name || "",
//       email: resolvedUser.email || "",
//       bio: resolvedUser.bio || "",
//       avatar_url: resolvedUser.avatar_url || resolvedUser.image || "",
//     });

//     fetchUserStats(resolvedUser);
//   }, [session, router]);

//   const fetchUserStats = async (u: any) => {
//     try {
//       setLoadingStats(true);
//       const userId = Number(u.user_id || u.id);
//       if (!userId) return;

//       const res = await fetch(`/api/user/${userId}/stats`);
//       const data = await res.json();

//       if (res.ok) {
//         setUserStats({
//           averageRating: data.average_rating ?? 0,
//           totalRatings: data.total_ratings ?? 0,
//           activeListings: data.active_listings ?? 0,
//           completedTrades: data.completed_trades ?? 0,
//         });
//       }
//     } catch (err) {
//       console.error("Stats fetch failed", err);
//     } finally {
//       setLoadingStats(false);
//     }
//   };

//   // ✅ FIXED: Image Upload
//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith('image/')) {
//       toast({
//         title: "Invalid file type",
//         description: "Please select an image file",
//         variant: "destructive",
//       });
//       return;
//     }

//     // Validate file size (max 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       toast({
//         title: "File too large",
//         description: "Image must be less than 5MB",
//         variant: "destructive",
//       });
//       return;
//     }

//     setUploadingImage(true);
    
//     try {
//       const formData = new FormData();
//       formData.append("files", file);

//       const res = await fetch("/api/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();

//       if (res.ok && data.urls && data.urls[0]) {
//         setEditData(prev => ({ ...prev, avatar_url: data.urls[0] }));
        
//         toast({
//           title: "Image uploaded",
//           description: "Profile picture updated successfully",
//         });
//       } else {
//         throw new Error(data.error || "Upload failed");
//       }
//     } catch (err) {
//       console.error("Upload error:", err);
//       toast({
//         title: "Upload failed",
//         description: err instanceof Error ? err.message : "Something went wrong",
//         variant: "destructive",
//       });
//     } finally {
//       setUploadingImage(false);
//     }
//   };

//   const handleLogout = async () => {
//     localStorage.removeItem("auth_token");
//     localStorage.removeItem("user");
//     await signOut({ callbackUrl: "/auth" });
//   };

//   const handleSaveProfile = async () => {
//     try {
//       const updated = {
//         ...user,
//         username: editData.username,
//         bio: editData.bio,
//         avatar_url: editData.avatar_url,
//       };

//       localStorage.setItem("user", JSON.stringify(updated));
//       setUser(updated);
//       setIsDialogOpen(false);

//       toast({
//         title: "Profile updated",
//         description: "Your changes have been saved",
//       });
//     } catch (err) {
//       toast({
//         title: "Error",
//         description: "Failed to update profile",
//         variant: "destructive",
//       });
//     }
//   };

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background pb-20">
//       {/* Header Section */}
//       <div className="border-b bg-card">
//         <div className="container mx-auto px-4 py-8 max-w-5xl">
//           <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
//             {/* Avatar */}
//             <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
//               <AvatarImage src={user.avatar_url || user.image} />
//               <AvatarFallback className="text-4xl font-semibold bg-gradient-to-br from-primary/20 to-primary/5">
//                 {user.username?.charAt(0)?.toUpperCase() || "U"}
//               </AvatarFallback>
//             </Avatar>

//             {/* User Info */}
//             <div className="flex-1 space-y-3">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <h1 className="text-3xl font-bold tracking-tight">
//                     {user.username || user.name}
//                   </h1>
//                   <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
//                     <div className="flex items-center gap-1">
//                       <Mail className="h-4 w-4" />
//                       {user.email}
//                     </div>
//                     {user.location_text && (
//                       <div className="flex items-center gap-1">
//                         <MapPin className="h-4 w-4" />
//                         {user.location_text}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setIsDialogOpen(true)}
//                   className="gap-2"
//                 >
//                   <Edit className="h-4 w-4" />
//                   Edit Profile
//                 </Button>
//               </div>

//               {user.bio && (
//                 <p className="text-muted-foreground max-w-2xl">
//                   {user.bio}
//                 </p>
//               )}

//               <div className="flex items-center gap-3">
//                 <RatingDisplay
//                   rating={userStats.averageRating}
//                   count={userStats.totalRatings}
//                   size="md"
//                 />
//                 <Badge variant="outline" className="gap-1">
//                   <Calendar className="h-3 w-3" />
//                   {user.created_at 
//                     ? `Joined ${new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
//                     : 'Member'}
//                 </Badge>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
//         {/* Stats Grid */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {[
//             {
//               label: "Active Listings",
//               value: userStats.activeListings,
//               icon: Package,
//               color: "text-blue-600",
//             },
//             {
//               label: "Completed Trades",
//               value: userStats.completedTrades,
//               icon: CheckCircle,
//               color: "text-green-600",
//             },
//             {
//               label: "Total Reviews",
//               value: userStats.totalRatings,
//               icon: Star,
//               color: "text-yellow-600",
//             },
//             {
//               label: "Rating",
//               value: userStats.averageRating.toFixed(1),
//               icon: TrendingUp,
//               color: "text-purple-600",
//             },
//           ].map((stat) => {
//             const Icon = stat.icon;
//             return (
//               <Card key={stat.label}>
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <Icon className={`h-5 w-5 ${stat.color}`} />
//                   </div>
//                   <div className="space-y-1">
//                     <p className="text-2xl font-bold">
//                       {loadingStats ? (
//                         <Loader2 className="h-5 w-5 animate-spin inline" />
//                       ) : (
//                         stat.value
//                       )}
//                     </p>
//                     <p className="text-xs text-muted-foreground font-medium">
//                       {stat.label}
//                     </p>
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>

//         {/* Quick Actions */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Quick Actions</CardTitle>
//           </CardHeader>
//           <CardContent className="flex gap-3">
//             <Button onClick={() => router.push("/post")} className="gap-2">
//               <Plus className="h-4 w-4" />
//               Create Listing
//             </Button>
//             <Button
//               variant="outline"
//               onClick={() => router.push("/home")}
//               className="gap-2"
//             >
//               Browse Listings
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Reviews */}
//         <UserReviews userId={user.user_id || user.id} />

//         {/* Logout */}
//         <Button
//           variant="outline"
//           className="w-full gap-2 text-destructive hover:text-destructive"
//           onClick={handleLogout}
//         >
//           <LogOut className="h-4 w-4" />
//           Sign Out
//         </Button>
//       </div>

//       <BottomNav />

//       {/* Edit Dialog */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Edit Profile</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-6 py-4">
//             {/* Avatar Upload */}
//             <div className="flex flex-col items-center gap-4">
//               <Avatar className="h-24 w-24 border-2">
//                 <AvatarImage src={editData.avatar_url} />
//                 <AvatarFallback className="text-2xl">
//                   {editData.username?.charAt(0)?.toUpperCase() || "U"}
//                 </AvatarFallback>
//               </Avatar>

//               <Label
//                 htmlFor="avatar-upload"
//                 className="cursor-pointer"
//               >
//                 <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors">
//                   {uploadingImage ? (
//                     <>
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                       <span className="text-sm">Uploading...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Camera className="h-4 w-4" />
//                       <span className="text-sm">Change Photo</span>
//                     </>
//                   )}
//                 </div>
//                 <input
//                   id="avatar-upload"
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   disabled={uploadingImage}
//                   className="hidden"
//                 />
//               </Label>
//             </div>

//             {/* Username */}
//             <div className="space-y-2">
//               <Label htmlFor="username">Username</Label>
//               <Input
//                 id="username"
//                 value={editData.username}
//                 onChange={(e) =>
//                   setEditData({ ...editData, username: e.target.value })
//                 }
//                 placeholder="Your username"
//               />
//             </div>

//             {/* Email (Read-only) */}
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 value={editData.email}
//                 disabled
//                 className="bg-muted cursor-not-allowed"
//               />
//             </div>

//             {/* Bio */}
//             <div className="space-y-2">
//               <Label htmlFor="bio">Bio</Label>
//               <Textarea
//                 id="bio"
//                 value={editData.bio}
//                 onChange={(e) =>
//                   setEditData({ ...editData, bio: e.target.value })
//                 }
//                 placeholder="Tell us about yourself"
//                 rows={4}
//               />
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex gap-3">
//             <Button
//               variant="outline"
//               className="flex-1"
//               onClick={() => setIsDialogOpen(false)}
//             >
//               Cancel
//             </Button>
//             <Button
//               className="flex-1 gap-2"
//               onClick={handleSaveProfile}
//               disabled={uploadingImage}
//             >
//               <Save className="h-4 w-4" />
//               Save Changes
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserReviews } from "@/components/ratings/user-reviews";
import { RatingDisplay } from "@/components/ratings/rating-display";
import {
  LogOut,
  Edit,
  Plus,
  Loader2,
  Mail,
  MapPin,
  Calendar,
  Camera,
  Save,
  TrendingUp,
  Package,
  Star,
  CheckCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTermsGate } from "@/hooks/use-terms-gate";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
  useTermsGate();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [userStats, setUserStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    activeListings: 0,
    completedTrades: 0,
  });

  const [editData, setEditData] = useState({
    username: "",
    email: "",
    avatar_url: "",
    phone: "",
  });

  // Auth Resolution
  useEffect(() => {
    let resolvedUser: any = null;

    if (session?.user) {
      resolvedUser = session.user;
      localStorage.setItem("user", JSON.stringify(session.user));

      const token = (session as any)?.auth_token;
      if (token) {
        localStorage.setItem("auth_token", token);
      }
    }

    if (!resolvedUser) {
      const stored = localStorage.getItem("user");
      if (stored && stored !== "undefined") {
        try {
          resolvedUser = JSON.parse(stored);
        } catch {
          localStorage.removeItem("user");
          localStorage.removeItem("auth_token");
        }
      }
    }

    if (!resolvedUser || !(resolvedUser.user_id || resolvedUser.id)) {
      router.replace("/auth");
      return;
    }

    setUser(resolvedUser);

    setEditData({
      username: resolvedUser.username || resolvedUser.name || "",
      email: resolvedUser.email || "",
      avatar_url: resolvedUser.avatar_url || resolvedUser.image || "",
      phone: resolvedUser.phone || "",
    });

    fetchUserStats(resolvedUser);
  }, [session, router]);

  const fetchUserStats = async (u: any) => {
    try {
      setLoadingStats(true);
      const userId = Number(u.user_id || u.id);
      if (!userId) return;

      const res = await fetch(`/api/user/${userId}/stats`);
      const data = await res.json();

      if (res.ok) {
        setUserStats({
          averageRating: data.average_rating ?? 0,
          totalRatings: data.total_ratings ?? 0,
          activeListings: data.active_listings ?? 0,
          completedTrades: data.completed_trades ?? 0,
        });
      }
    } catch (err) {
      console.error("Stats fetch failed", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // ✅ FIXED: Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append("files", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.urls && data.urls[0]) {
        setEditData(prev => ({ ...prev, avatar_url: data.urls[0] }));
        
        toast({
          title: "Image uploaded",
          description: "Profile picture updated successfully",
        });
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    await signOut({ callbackUrl: "/auth" });
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const userId = user.user_id || user.id;

      // ✅ Save to database via API
      const res = await fetch(`/api/user/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          username: editData.username,
          avatar_url: editData.avatar_url,
          phone: editData.phone,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const data = await res.json();

      // ✅ Update local storage and state
      const updated = {
        ...user,
        username: editData.username,
        avatar_url: editData.avatar_url,
        phone: editData.phone,
      };

      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setIsDialogOpen(false);

      toast({
        title: "Profile updated",
        description: "Your changes have been saved",
      });
    } catch (err) {
      console.error("Profile update error:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={user.avatar_url || user.image} />
              <AvatarFallback className="text-4xl font-semibold bg-gradient-to-br from-primary/20 to-primary/5">
                {user.username?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {user.username || user.name}
                  </h1>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    {user.location_text && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {user.location_text}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDialogOpen(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              {user.bio && (
                <p className="text-muted-foreground max-w-2xl">
                  {user.bio}
                </p>
              )}

              <div className="flex items-center gap-3">
                <RatingDisplay
                  rating={userStats.averageRating}
                  count={userStats.totalRatings}
                  size="md"
                />
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {user.created_at 
                    ? `Joined ${new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                    : 'Member'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Active Listings",
              value: userStats.activeListings,
              icon: Package,
              color: "text-blue-600",
            },
            {
              label: "Completed Trades",
              value: userStats.completedTrades,
              icon: CheckCircle,
              color: "text-green-600",
            },
            {
              label: "Total Reviews",
              value: userStats.totalRatings,
              icon: Star,
              color: "text-yellow-600",
            },
            {
              label: "Rating",
              value: userStats.averageRating.toFixed(1),
              icon: TrendingUp,
              color: "text-purple-600",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">
                      {loadingStats ? (
                        <Loader2 className="h-5 w-5 animate-spin inline" />
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button onClick={() => router.push("/post")} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Listing
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/home")}
              className="gap-2"
            >
              Browse Listings
            </Button>
          </CardContent>
        </Card>

        {/* Reviews */}
        <UserReviews userId={user.user_id || user.id} />

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full gap-2 text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <BottomNav />

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 border-2">
                <AvatarImage src={editData.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {editData.username?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <Label
                htmlFor="avatar-upload"
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors">
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      <span className="text-sm">Change Photo</span>
                    </>
                  )}
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </Label>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={editData.username}
                onChange={(e) =>
                  setEditData({ ...editData, username: e.target.value })
                }
                placeholder="Your username"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={editData.email}
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={editData.phone}
                onChange={(e) =>
                  setEditData({ ...editData, phone: e.target.value })
                }
                placeholder="+92 300 1234567"
              />
              <p className="text-xs text-muted-foreground">
                Required for SMS OTP verification
              </p>
            </div>

          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleSaveProfile}
              disabled={uploadingImage}
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
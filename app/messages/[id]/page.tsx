// "use client"

// import { use, useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { BottomNav } from "@/components/ui/bottom-nav"
// import { ChatInterface } from "@/components/messages/chat-interface"
// import { ArrowLeft } from "lucide-react"

// interface Props {
//   params: Promise<{ id: string }>   // ✅ params is now a Promise
// }

// export default function ChatPage({ params }: Props) {
//   // ✅ unwrap params
//   const { id } = use(params)

//   const [currentUserId, setCurrentUserId] = useState<string>("")
//   const router = useRouter()

//   useEffect(() => {
//     const token = localStorage.getItem("auth_token")
//     const userData = localStorage.getItem("user")

//     if (!token || !userData) {
//       router.push("/auth")
//       return
//     }

//     const user = JSON.parse(userData)
//     setCurrentUserId(user.id)
//   }, [router])

//   if (!currentUserId) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center pb-20">
//         <p className="text-muted-foreground">Loading...</p>
//         <BottomNav />
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-background pb-20 flex flex-col">
//       {/* Header */}
//       <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
//         <div className="container mx-auto px-4 py-4">
//           <Button variant="ghost" size="sm" onClick={() => router.back()}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Messages
//           </Button>
//         </div>
//       </header>

//       {/* Chat Interface */}
//       <div className="flex-1 flex flex-col">
//         <ChatInterface threadId={Number(id)} currentUserId={currentUserId} />
//       </div>

//       <BottomNav />
//     </div>
//   )
// }

"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/ui/bottom-nav"
import { ChatInterface } from "@/components/messages/chat-interface"
import { ArrowLeft } from "lucide-react"

interface Props {
  params: Promise<{ id: string }> // ✅ params is a Promise in Next.js 15
}

export default function ChatPage({ params }: Props) {
  // ✅ unwrap params
  const { id } = use(params)

  const [currentUserId, setCurrentUserId] = useState<string>("")
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    const localUser = localStorage.getItem("user")
    const localToken = localStorage.getItem("auth_token")

    if (localUser && localToken) {
      const parsed = JSON.parse(localUser)
      setCurrentUserId(parsed.id || parsed.user_id)
      return
    }

    // ✅ fallback to Google session
    if (session?.auth_token) {
      setCurrentUserId(String(session.user?.user_id))
      return
    }

    if (!session) {
      router.push("/auth")
    }
  }, [session, router])

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <p className="text-muted-foreground">Loading...</p>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        <ChatInterface threadId={Number(id)} currentUserId={currentUserId} />
      </div>

      <BottomNav />
    </div>
  )
}

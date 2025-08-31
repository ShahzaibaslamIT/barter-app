"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/ui/bottom-nav"
import { ChatInterface } from "@/components/messages/chat-interface"
import { ArrowLeft } from "lucide-react"

export default function ChatPage({ params }: { params: { id: string } }) {
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/auth")
      return
    }

    const user = JSON.parse(userData)
    setCurrentUserId(user.id)
  }, [router])

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
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        <ChatInterface threadId={params.id} currentUserId={currentUserId} />
      </div>

      <BottomNav />
    </div>
  )
}

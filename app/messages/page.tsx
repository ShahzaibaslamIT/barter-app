"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/ui/bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Package, Wrench } from "lucide-react"

interface MessageThread {
  thread_id: string
  barter_id: string
  listing_title: string
  listing_type: "item" | "service"
  listing_photos: string[]
  other_user_name: string
  other_user_avatar?: string
  other_user_id: string
  last_message?: string
  last_message_time?: string
  last_message_sender_id?: string
  unread_count: number
  thread_created_at: string
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
    fetchThreads()
  }, [router])

  const fetchThreads = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/messages/threads", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (response.ok) {
        setThreads(data.threads)
      }
    } catch (error) {
      console.error("Failed to fetch message threads:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleThreadClick = (threadId: string) => {
    router.push(`/messages/${threadId}`)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-serif text-2xl font-bold text-primary">Messages</h1>
              <p className="text-sm text-muted-foreground">Your barter conversations</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">
              Start a conversation by making an offer on a listing or accepting an offer
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Card
                key={thread.thread_id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleThreadClick(thread.thread_id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={thread.other_user_avatar || "/placeholder.svg"} />
                        <AvatarFallback>{thread.other_user_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {thread.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {thread.unread_count > 9 ? "9+" : thread.unread_count}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold truncate">{thread.other_user_name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(thread.last_message_time || thread.thread_created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {thread.listing_title}
                        </Badge>
                        <Badge variant={thread.listing_type === "item" ? "default" : "secondary"} className="text-xs">
                          {thread.listing_type === "item" ? (
                            <Package className="h-3 w-3 mr-1" />
                          ) : (
                            <Wrench className="h-3 w-3 mr-1" />
                          )}
                          {thread.listing_type}
                        </Badge>
                      </div>
                      {thread.last_message ? (
                        <p
                          className={`text-sm line-clamp-2 ${
                            thread.unread_count > 0 && thread.last_message_sender_id !== currentUserId
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {thread.last_message_sender_id === currentUserId ? "You: " : ""}
                          {thread.last_message}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Conversation started</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

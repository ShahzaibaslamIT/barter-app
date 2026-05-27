"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Package, Wrench } from "lucide-react"

interface Thread {
  id: string
  listing_id: string
  listing_title: string
  listing_type: "item" | "service"
  listing_photos: string[]
  barter_status: string
  user_1_id: string
  user_1_name: string
  user_1_avatar?: string
  user_2_id: string
  user_2_name: string
  user_2_avatar?: string
  last_message?: string
  last_message_at?: string
  last_sender_id?: string
  last_sender_name?: string
}

interface ThreadListProps {
  currentUserId: string
  onSelectThread: (threadId: string) => void
}

export function ThreadList({ currentUserId, onSelectThread }: ThreadListProps) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchThreads()
  }, [])

  const fetchThreads = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/threads", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setThreads(data.threads || [])
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load conversations",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    )
  }

  if (threads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No conversations yet</p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {threads.map((thread) => {
        const otherUser =
          thread.user_1_id === currentUserId
            ? { id: thread.user_2_id, name: thread.user_2_name, avatar: thread.user_2_avatar }
            : { id: thread.user_1_id, name: thread.user_1_name, avatar: thread.user_1_avatar }

        return (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 text-left"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatar || "/placeholder.svg"} />
              <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate">{otherUser.name}</h3>
                <span className="text-xs text-muted-foreground">{formatTime(thread.last_message_at)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={thread.listing_type === "item" ? "default" : "secondary"}
                  className="text-xs flex items-center gap-1"
                >
                  {thread.listing_type === "item" ? <Package className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
                  {thread.listing_type}
                </Badge>
                <span className="text-sm truncate">{thread.listing_title}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {thread.last_sender_name ? `${thread.last_sender_name}: ` : ""}
                {thread.last_message || "No messages yet"}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// "use client"

// import type React from "react"
// import { useState, useEffect, useRef } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { useToast } from "@/hooks/use-toast"
// import { Send, Package, Wrench } from "lucide-react"

// interface Message {
//   message_id: number
//   thread_id: number
//   sender_id: string
//   sender_name: string
//   sender_avatar?: string
//   content: string
//   created_at: string
// }

// interface Thread {
//   thread_id: number
//   barter_id: number | null
//   listing_id: number | null
//   listing_title: string
//   listing_type: "item" | "service"
//   listing_photos: string[]
//   barter_status: string
//   user_1_id: string
//   user_1_name: string
//   user_1_avatar?: string
//   user_2_id: string
//   user_2_name: string
//   user_2_avatar?: string
// }

// interface ChatInterfaceProps {
//   threadId: number
//   currentUserId: string
// }

// export function ChatInterface({ threadId, currentUserId }: ChatInterfaceProps) {
//   const [thread, setThread] = useState<Thread | null>(null)
//   const [messages, setMessages] = useState<Message[]>([])
//   const [newMessage, setNewMessage] = useState("")
//   const [isLoading, setIsLoading] = useState(true)
//   const [isSending, setIsSending] = useState(false)
//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const { toast } = useToast()

//   useEffect(() => {
//     fetchThread()
//   }, [threadId])

//   useEffect(() => {
//     scrollToBottom()
//   }, [messages])

//   const fetchThread = async () => {
//     try {
//       const token = localStorage.getItem("auth_token")
//       const response = await fetch(`/api/messages/threads/${threadId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })

//       const data = await response.json()
//       if (response.ok) {
//         setThread(data.thread)
//         setMessages(data.messages)
//       } else {
//         toast({
//           title: "Error",
//           description: data.error || "Failed to load conversation",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to load conversation",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//  // Replace your sendMessage function with this
// const sendMessage = async (e: React.FormEvent) => {
//   e.preventDefault()
//   if (!newMessage.trim() || isSending) return

//   setIsSending(true)
//   try {
//     const token = localStorage.getItem("auth_token")
//     const response = await fetch("/api/messages", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         thread_id: threadId,
//         content: newMessage.trim(),
//       }),
//     })

//     const data = await response.json()
//     if (response.ok) {
//       setNewMessage("")
//       // Instead of appending, re-fetch from backend to ensure no duplicates
//       await fetchThread()
//     } else {
//       throw new Error(data.error || "Failed to send message")
//     }
//   } catch (error) {
//     toast({
//       title: "Error",
//       description:
//         error instanceof Error ? error.message : "Failed to send message",
//       variant: "destructive",
//     })
//   } finally {
//     setIsSending(false)
//   }
// }


//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }

//   const formatTime = (dateString: string) => {
//     const date = new Date(dateString)
//     const now = new Date()
//     const diffInHours = Math.floor(
//       (now.getTime() - date.getTime()) / (1000 * 60 * 60)
//     )

//     if (diffInHours < 24) {
//       return date.toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//       })
//     } else if (diffInHours < 168) {
//       return date.toLocaleDateString("en-US", {
//         weekday: "short",
//         hour: "2-digit",
//         minute: "2-digit",
//       })
//     } else {
//       return date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       })
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <p className="text-muted-foreground">Loading conversation...</p>
//       </div>
//     )
//   }

//   if (!thread) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <p className="text-muted-foreground">Conversation not found</p>
//       </div>
//     )
//   }

//   const otherUser =
//     thread.user_1_id === currentUserId
//       ? {
//           id: thread.user_2_id,
//           name: thread.user_2_name || "Anonymous",
//           avatar: thread.user_2_avatar,
//         }
//       : {
//           id: thread.user_1_id,
//           name: thread.user_1_name || "Anonymous",
//           avatar: thread.user_1_avatar,
//         }

//   return (
//     <div className="flex flex-col h-full">
//       {/* Thread Header */}
//       <div className="border-b p-4 bg-background/95 backdrop-blur">
//         <div className="flex items-center gap-3 mb-3">
//           <Avatar className="h-10 w-10">
//             <AvatarImage src={otherUser.avatar || "/placeholder.svg"} />
//             <AvatarFallback>
//               {otherUser.name ? otherUser.name.charAt(0) : "?"}
//             </AvatarFallback>
//           </Avatar>
//           <div>
//             <h3 className="font-semibold">{otherUser.name}</h3>
//             <p className="text-sm text-muted-foreground">
//               {thread.barter_status === "accepted"
//                 ? "Barter accepted"
//                 : "Discussing barter"}
//             </p>
//           </div>
//         </div>

//         {/* Listing Info */}
//         <Card className="bg-muted/50">
//           <CardContent className="p-3">
//             <div className="flex gap-3">
//               <img
//                 src={thread.listing_photos?.[0] || "/placeholder.svg"}
//                 alt={thread.listing_title}
//                 className="w-12 h-12 object-cover rounded-lg"
//               />
//               <div className="flex-1">
//                 <div className="flex items-center gap-2 mb-1">
//                   <Badge
//                     variant={
//                       thread.listing_type === "item" ? "default" : "secondary"
//                     }
//                     className="text-xs"
//                   >
//                     {thread.listing_type === "item" ? (
//                       <Package className="h-3 w-3 mr-1" />
//                     ) : (
//                       <Wrench className="h-3 w-3 mr-1" />
//                     )}
//                     {thread.listing_type}
//                   </Badge>
//                 </div>
//                 <h4 className="font-medium text-sm">{thread.listing_title}</h4>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.length === 0 ? (
//           <div className="text-center py-8">
//             <p className="text-muted-foreground">No messages yet</p>
//             <p className="text-sm text-muted-foreground">
//               Start the conversation!
//             </p>
//           </div>
//         ) : (
//           messages.map((message, index) => {
//             const isOwnMessage = message.sender_id === currentUserId
//             return (
//               <div
//                 key={message.message_id ?? `${message.sender_id}-${index}`} // ✅ safe unique key
//                 className={`flex gap-3 ${
//                   isOwnMessage ? "flex-row-reverse" : ""
//                 }`}
//               >
//                 <Avatar className="h-8 w-8 flex-shrink-0">
//                   <AvatarImage
//                     src={message.sender_avatar || "/placeholder.svg"}
//                   />
//                   <AvatarFallback className="text-xs">
//                     {message.sender_name
//                       ? message.sender_name.charAt(0)
//                       : "?"}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div
//                   className={`flex-1 max-w-xs ${
//                     isOwnMessage ? "text-right" : ""
//                   }`}
//                 >
//                   <div
//                     className={`inline-block p-3 rounded-lg ${
//                       isOwnMessage
//                         ? "bg-primary text-primary-foreground"
//                         : "bg-muted text-muted-foreground"
//                     }`}
//                   >
//                     <p className="text-sm">{message.content}</p>
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     {formatTime(message.created_at)}
//                   </p>
//                 </div>
//               </div>
//             )
//           })
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Message Input */}
//       <div className="border-t p-4 bg-background/95 backdrop-blur">
//         <form onSubmit={sendMessage} className="flex gap-2">
//           <Input
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder="Type a message..."
//             className="flex-1"
//             disabled={isSending}
//           />
//           <Button
//             type="submit"
//             size="sm"
//             disabled={!newMessage.trim() || isSending}
//           >
//             <Send className="h-4 w-4" />
//           </Button>
//         </form>
//       </div>
//     </div>
//   )
// }








// "use client"

// import { useState, useEffect, useRef } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { useToast } from "@/hooks/use-toast"
// import { Send, Package, Wrench } from "lucide-react"

// interface Message {
//   message_id: number
//   thread_id: number
//   sender_id: string
//   sender_name: string
//   sender_avatar?: string
//   content: string
//   created_at: string
// }

// interface Thread {
//   thread_id: number
//   barter_id: number | null
//   listing_id: number | null
//   listing_title: string
//   listing_type: "item" | "service"
//   listing_photos: string[]
//   barter_status: string
//   user_1_id: string
//   user_1_name: string
//   user_1_avatar?: string
//   user_2_id: string
//   user_2_name: string
//   user_2_avatar?: string
// }

// interface ChatInterfaceProps {
//   threadId: number
//   currentUserId: string
// }

// export function ChatInterface({ threadId, currentUserId }: ChatInterfaceProps) {
//   const [thread, setThread] = useState<Thread | null>(null)
//   const [messages, setMessages] = useState<Message[]>([])
//   const [newMessage, setNewMessage] = useState("")
//   const [isLoading, setIsLoading] = useState(true)
//   const [isSending, setIsSending] = useState(false)
//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const { toast } = useToast()

//   // ✅ Fetch messages once per threadId
//   useEffect(() => {
//     fetchThread()
//   }, [threadId])

//   // ✅ Scroll to bottom whenever messages change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [messages])

//   const fetchThread = async () => {
//     try {
//       const token = localStorage.getItem("auth_token")
//       const response = await fetch(`/api/messages/threads/${threadId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })

//       const data = await response.json()
//       if (response.ok) {
//         // Safely parse messages and deduplicate by ID
//         const messagesFromServer = Array.isArray(data.messages)
//           ? (data.messages as Message[])
//           : []

//         const uniqueMessages = Array.from(
//           new Map(messagesFromServer.map((m) => [m.message_id, m])).values()
//         )

//         setThread(data.thread)
//         setMessages(uniqueMessages)
//       } else {
//         toast({
//           title: "Error",
//           description: data.error || "Failed to load conversation",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to load conversation",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // ✅ Single reliable send (no duplication)
//   const sendMessage = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!newMessage.trim() || isSending) return

//     setIsSending(true)
//     try {
//       const token = localStorage.getItem("auth_token")
//       const response = await fetch("/api/messages", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           thread_id: threadId,
//           content: newMessage.trim(),
//         }),
//       })

//       const data = await response.json()
//       if (response.ok) {
//         setNewMessage("")
//         // ✅ Fetch messages fresh from backend to avoid duplicates
//         await fetchThread()
//       } else {
//         throw new Error(data.error || "Failed to send message")
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description:
//           error instanceof Error ? error.message : "Failed to send message",
//         variant: "destructive",
//       })
//     } finally {
//       setIsSending(false)
//     }
//   }

//   const formatTime = (dateString: string) => {
//     const date = new Date(dateString)
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//   }

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <p className="text-muted-foreground">Loading conversation...</p>
//       </div>
//     )
//   }

//   if (!thread) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <p className="text-muted-foreground">Conversation not found</p>
//       </div>
//     )
//   }

//   const otherUser =
//     thread.user_1_id === currentUserId
//       ? {
//           id: thread.user_2_id,
//           name: thread.user_2_name || "Anonymous",
//           avatar: thread.user_2_avatar,
//         }
//       : {
//           id: thread.user_1_id,
//           name: thread.user_1_name || "Anonymous",
//           avatar: thread.user_1_avatar,
//         }

//   return (
//     <div className="flex flex-col h-full">
//       {/* Header */}
//       <div className="border-b p-4 bg-background/95 backdrop-blur">
//         <div className="flex items-center gap-3 mb-3">
//           <Avatar className="h-10 w-10">
//             <AvatarImage src={otherUser.avatar || "/placeholder.svg"} />
//             <AvatarFallback>
//               {otherUser.name ? otherUser.name.charAt(0) : "?"}
//             </AvatarFallback>
//           </Avatar>
//           <div>
//             <h3 className="font-semibold">{otherUser.name}</h3>
//             <p className="text-sm text-muted-foreground">
//               {thread.barter_status === "accepted"
//                 ? "Barter accepted"
//                 : "Discussing barter"}
//             </p>
//           </div>
//         </div>

//         <Card className="bg-muted/50">
//           <CardContent className="p-3">
//             <div className="flex gap-3">
//               <img
//                 src={thread.listing_photos?.[0] || "/placeholder.svg"}
//                 alt={thread.listing_title}
//                 className="w-12 h-12 object-cover rounded-lg"
//               />
//               <div className="flex-1">
//                 <Badge
//                   variant={
//                     thread.listing_type === "item" ? "default" : "secondary"
//                   }
//                   className="text-xs capitalize"
//                 >
//                   {thread.listing_type === "item" ? (
//                     <Package className="h-3 w-3 mr-1" />
//                   ) : (
//                     <Wrench className="h-3 w-3 mr-1" />
//                   )}
//                   {thread.listing_type}
//                 </Badge>
//                 <h4 className="font-medium text-sm mt-1">
//                   {thread.listing_title}
//                 </h4>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.length === 0 ? (
//           <div className="text-center py-8">
//             <p className="text-muted-foreground">No messages yet</p>
//             <p className="text-sm text-muted-foreground">
//               Start the conversation!
//             </p>
//           </div>
//         ) : (
//           messages.map((message) => {
//             const isOwn = message.sender_id === currentUserId
//             return (
//               <div
//                 key={message.message_id}
//                 className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
//               >
//                 <Avatar className="h-8 w-8 flex-shrink-0">
//                   <AvatarImage
//                     src={message.sender_avatar || "/placeholder.svg"}
//                   />
//                   <AvatarFallback className="text-xs">
//                     {message.sender_name
//                       ? message.sender_name.charAt(0)
//                       : "?"}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div
//                   className={`flex-1 max-w-xs ${
//                     isOwn ? "text-right" : "text-left"
//                   }`}
//                 >
//                   <div
//                     className={`inline-block p-3 rounded-lg ${
//                       isOwn
//                         ? "bg-primary text-primary-foreground"
//                         : "bg-muted text-muted-foreground"
//                     }`}
//                   >
//                     <p className="text-sm">{message.content}</p>
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     {formatTime(message.created_at)}
//                   </p>
//                 </div>
//               </div>
//             )
//           })
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input */}
//       <div className="border-t p-4 bg-background/95 backdrop-blur">
//         <form onSubmit={sendMessage} className="flex gap-2">
//           <Input
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder="Type a message..."
//             className="flex-1"
//             disabled={isSending}
//           />
//           <Button type="submit" size="sm" disabled={!newMessage.trim() || isSending}>
//             <Send className="h-4 w-4" />
//           </Button>
//         </form>
//       </div>
//     </div>
//   )
// }




"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Send, Package, Wrench } from "lucide-react"

interface Message {
  message_id: number
  thread_id: number
  sender_id: string
  sender_name: string
  sender_avatar?: string
  content: string
  created_at: string
}

interface Thread {
  thread_id: number
  barter_id: number | null
  listing_id: number | null
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
}

interface ChatInterfaceProps {
  threadId: number
  currentUserId: string
}

export function ChatInterface({ threadId, currentUserId }: ChatInterfaceProps) {
  const [thread, setThread] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // ✅ Fetch messages once per threadId
  useEffect(() => {
    fetchThread()
  }, [threadId])

  // ✅ Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchThread = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/messages/threads/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (response.ok) {
        // Safely parse messages and deduplicate by ID
        const messagesFromServer = Array.isArray(data.messages)
          ? (data.messages as Message[])
          : []

        const uniqueMessages = Array.from(
          new Map(messagesFromServer.map((m) => [m.message_id, m])).values()
        )

        setThread(data.thread)
        setMessages(uniqueMessages)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load conversation",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Fixed: Append new message locally instead of refetching
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          thread_id: threadId,
          content: newMessage.trim(),
        }),
      })

      const data = await response.json()
      if (response.ok) {
        const msgContent = newMessage.trim()
        setNewMessage("")

        // ✅ Create local message entry
        const newMsg: Message = {
          message_id: data.message?.message_id || Date.now(),
          thread_id: threadId,
          sender_id: currentUserId,
          sender_name: "You",
          sender_avatar: undefined,
          content: msgContent,
          created_at: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, newMsg])
      } else {
        throw new Error(data.error || "Failed to send message")
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    )
  }

  const otherUser =
    thread.user_1_id === currentUserId
      ? {
          id: thread.user_2_id,
          name: thread.user_2_name || "Anonymous",
          avatar: thread.user_2_avatar,
        }
      : {
          id: thread.user_1_id,
          name: thread.user_1_name || "Anonymous",
          avatar: thread.user_1_avatar,
        }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.avatar || "/placeholder.svg"} />
            <AvatarFallback>
              {otherUser.name ? otherUser.name.charAt(0) : "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{otherUser.name}</h3>
            <p className="text-sm text-muted-foreground">
              {thread.barter_status === "accepted"
                ? "Barter accepted"
                : "Discussing barter"}
            </p>
          </div>
        </div>

        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <div className="flex gap-3">
              <img
                src={thread.listing_photos?.[0] || "/placeholder.svg"}
                alt={thread.listing_title}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1">
                <Badge
                  variant={
                    thread.listing_type === "item" ? "default" : "secondary"
                  }
                  className="text-xs capitalize"
                >
                  {thread.listing_type === "item" ? (
                    <Package className="h-3 w-3 mr-1" />
                  ) : (
                    <Wrench className="h-3 w-3 mr-1" />
                  )}
                  {thread.listing_type}
                </Badge>
                <h4 className="font-medium text-sm mt-1">
                  {thread.listing_title}
                </h4>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">
              Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId
            return (
              <div
  key={`${message.message_id}-${message.sender_id}-${message.created_at}`}
  className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
>

                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage
                    src={message.sender_avatar || "/placeholder.svg"}
                  />
                  <AvatarFallback className="text-xs">
                    {message.sender_name
                      ? message.sender_name.charAt(0)
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 max-w-xs ${
                    isOwn ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-background/95 backdrop-blur">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newMessage.trim() || isSending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

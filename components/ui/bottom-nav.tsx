"use client"

import { Home, Search, Plus, Handshake, User } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Search, label: "Discover", path: "/discover" },
    { icon: Plus, label: "Post", path: "/post" },
    { icon: Handshake, label: "Offers", path: "/offers" },
    { icon: User, label: "Profile", path: "/profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = pathname === path
          return (
            <Button
              key={path}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => router.push(path)}
            >
              <Icon className={`h-5 w-5 ${isActive ? "fill-current" : ""}`} />
              <span className="text-xs font-medium">{label}</span>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}

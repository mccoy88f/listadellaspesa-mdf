"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Bell, LogOut, Menu } from "lucide-react"
import { useState, useEffect } from "react"
import { useLocale } from "next-intl"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LanguageSwitcher } from "./LanguageSwitcher"

export function Navbar() {
  const router = useRouter()
  const locale = useLocale()
  const [unreadCount, setUnreadCount] = useState(0)
  const [user, setUser] = useState<{ id: number; email: string; name?: string } | null>(null)

  useEffect(() => {
    fetchUser()
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000) // Aggiorna ogni 30 secondi
    return () => clearInterval(interval)
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Errore nel recupero utente:", error)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Errore nel recupero notifiche:", error)
    }
  }

    const handleLogout = async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" })
        router.push(`/${locale}/login`)
        router.refresh()
      } catch (error) {
        console.error("Errore nel logout:", error)
      }
    }

  if (!user) return null

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href={`/${locale}/dashboard`} className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6" />
            <span className="font-bold text-xl">Lista Spesa</span>
          </Link>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Link href={`/${locale}/purchases`}>
              <Button variant="ghost" size="sm">
                Storico Acquisti
              </Button>
            </Link>
            <Link href={`/${locale}/notifications`}>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <span>{user.name || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}

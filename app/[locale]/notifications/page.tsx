"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, ShoppingCart, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"

// Fallback se date-fns non è disponibile
function formatDate(date: string) {
  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: it,
    })
  } catch {
    return new Date(date).toLocaleDateString("it-IT")
  }
}

interface Notification {
  id: number
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  sender: { id: number; email: string; name?: string }
  listId?: number
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      } else if (res.status === 401) {
        router.push("/login")
      }
    } catch (error) {
      console.error("Errore nel recupero delle notifiche:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      })

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Caricamento...</div>
        </div>
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Notifiche</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} notifica${unreadCount > 1 ? "e" : ""} non letta${unreadCount > 1 ? "e" : ""}`
              : "Nessuna notifica non letta"}
          </p>
        </div>

        {notifications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nessuna notifica</h3>
              <p className="text-muted-foreground">
                Non hai ancora ricevuto notifiche
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  !notification.read ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => {
                  if (!notification.read) {
                    handleMarkAsRead(notification.id)
                  }
                  if (notification.listId) {
                    router.push(`/lists/${notification.listId}`)
                  }
                }}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {notification.type === "shopping_alert" && (
                          <ShoppingCart className="h-5 w-5 text-primary" />
                        )}
                        {notification.title}
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {notification.message}
                      </CardDescription>
                      <CardDescription className="text-xs mt-1">
                        Da: {notification.sender.name || notification.sender.email} •{" "}
                        {formatDate(notification.createdAt)}
                      </CardDescription>
                    </div>
                    {notification.listId && (
                      <Link href={`/lists/${notification.listId}`}>
                        <Button variant="ghost" size="icon">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

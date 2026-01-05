"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Share2, UserPlus, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface SharedUser {
  id: number
  email: string
  name?: string
  canEdit: boolean
}

interface ShoppingList {
  id: number
  name: string
  sharedWith: Array<{
    user: SharedUser
    canEdit: boolean
  }>
}

export default function ShareListPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const listId = parseInt(params.id as string)

  const [list, setList] = useState<ShoppingList | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [canEdit, setCanEdit] = useState(true)

  useEffect(() => {
    fetchList()
  }, [listId])

  const fetchList = async () => {
    try {
      const res = await fetch(`/api/lists/${listId}`)
      if (res.ok) {
        const data = await res.json()
        setList(data)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Errore nel recupero della lista:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/lists/${listId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, canEdit }),
      })

      if (res.ok) {
        const sharedList = await res.json()
        setList((prev) => prev ? {
          ...prev,
          sharedWith: [...prev.sharedWith, {
            user: sharedList.user,
            canEdit: sharedList.canEdit,
          }],
        } : null)
        setEmail("")
        toast({
          title: "Lista condivisa!",
          description: `La lista è stata condivisa con ${sharedList.user.email}`,
        })
      } else {
        const data = await res.json()
        throw new Error(data.error || "Errore nella condivisione")
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nella condivisione",
        variant: "destructive",
      })
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

  if (!list) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href={`/lists/${listId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Lista
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Condividi Lista: {list.name}
            </CardTitle>
            <CardDescription>
              Condividi questa lista con altri utenti per collaborare insieme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleShare} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Utente</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="utente@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="can-edit"
                  checked={canEdit}
                  onCheckedChange={setCanEdit}
                />
                <Label htmlFor="can-edit" className="cursor-pointer">
                  Permetti modifica
                </Label>
              </div>
              <Button type="submit" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Condividi
              </Button>
            </form>
          </CardContent>
        </Card>

        {list.sharedWith && list.sharedWith.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Utenti con cui è condivisa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {list.sharedWith.map((shared) => (
                  <div
                    key={shared.user.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {shared.user.name || shared.user.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {shared.user.email}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {shared.canEdit ? "Può modificare" : "Solo lettura"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Plus, ShoppingCart, Users, Trash2, Share2, ShoppingBag } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface ShoppingList {
  id: number
  name: string
  description?: string
  store?: string
  ownerId: number
  items: any[]
  owner?: { id: number; email: string; name?: string }
  sharedWith?: Array<{ user: { id: number; email: string; name?: string } }>
}

export default function DashboardPage() {
  const router = useRouter()
  const locale = useLocale()
  const { toast } = useToast()
  const [lists, setLists] = useState<{ owned: ShoppingList[]; shared: ShoppingList[] }>({
    owned: [],
    shared: [],
  })
  const [loading, setLoading] = useState(true)
  const [newListOpen, setNewListOpen] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [newListDescription, setNewListDescription] = useState("")
  const [newListStore, setNewListStore] = useState("")

  useEffect(() => {
    fetchLists()
  }, [])

  const fetchLists = async () => {
    try {
      const res = await fetch("/api/lists")
      if (res.ok) {
        const data = await res.json()
        setLists(data)
      } else if (res.status === 401) {
        router.push(`/${locale}/login`)
        router.refresh()
      }
    } catch (error) {
      console.error("Errore nel recupero delle liste:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newListName,
          description: newListDescription || undefined,
        }),
      })

      if (res.ok) {
        const newList = await res.json()
        setLists((prev) => ({
          ...prev,
          owned: [newList, ...prev.owned],
        }))
        setNewListName("")
        setNewListDescription("")
        setNewListStore("")
        setNewListOpen(false)
        toast({
          title: "Lista creata!",
          description: `La lista "${newList.name}" è stata creata con successo`,
        })
      } else {
        const data = await res.json()
        throw new Error(data.error || "Errore nella creazione")
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nella creazione della lista",
        variant: "destructive",
      })
    }
  }

  const handleDeleteList = async (id: number) => {
    if (!confirm("Sei sicuro di voler eliminare questa lista?")) return

    try {
      const res = await fetch(`/api/lists/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setLists((prev) => ({
          owned: prev.owned.filter((l) => l.id !== id),
          shared: prev.shared.filter((l) => l.id !== id),
        }))
        toast({
          title: "Lista eliminata",
          description: "La lista è stata eliminata con successo",
        })
      } else {
        const data = await res.json()
        throw new Error(data.error || "Errore nell'eliminazione")
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nell'eliminazione",
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

  const allLists = [...lists.owned, ...lists.shared]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Le Mie Liste</h1>
            <p className="text-muted-foreground mt-1">
              Gestisci le tue liste della spesa e quelle condivise
            </p>
          </div>
          <Dialog open={newListOpen} onOpenChange={setNewListOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuova Lista
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crea Nuova Lista</DialogTitle>
                <DialogDescription>
                  Crea una nuova lista della spesa per organizzare i tuoi acquisti
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateList} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Lista *</Label>
                  <Input
                    id="name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Es: Spesa settimanale"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrizione (opzionale)</Label>
                  <Input
                    id="description"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Descrizione della lista"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store">Venditore/Negozio (opzionale)</Label>
                  <Input
                    id="store"
                    value={newListStore}
                    onChange={(e) => setNewListStore(e.target.value)}
                    placeholder="Es: Esselunga, Conad, Amazon"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Crea Lista
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {allLists.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nessuna lista ancora</h3>
              <p className="text-muted-foreground mb-4">
                Crea la tua prima lista della spesa per iniziare
              </p>
              <Button onClick={() => setNewListOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crea Prima Lista
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.owned.map((list) => (
              <Card key={list.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        {list.name}
                      </CardTitle>
                      {list.description && (
                        <CardDescription className="mt-1">{list.description}</CardDescription>
                      )}
                      {list.store && (
                        <CardDescription className="mt-1">
                          {locale === 'it' ? 'Negozio' : 'Store'}: {list.store}
                        </CardDescription>
                      )}
                    </div>
                    {list.ownerId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteList(list.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Oggetti:</span>
                      <span className="font-semibold">{list.items?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completati:</span>
                      <span className="font-semibold">
                        {list.items?.filter((i) => i.completed).length || 0}
                      </span>
                    </div>
                    {list.sharedWith && list.sharedWith.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Condivisa con {list.sharedWith.length} persona/e</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/${locale}/lists/${list.id}`} className="flex-1">
                        <Button variant="default" className="w-full">
                          Apri
                        </Button>
                      </Link>
                      <Link href={`/${locale}/lists/${list.id}/share`}>
                        <Button variant="outline" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {lists.shared.map((list) => (
              <Card key={list.id} className="hover:shadow-lg transition-shadow border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    {list.name}
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Condivisa
                    </span>
                  </CardTitle>
                  {list.description && (
                    <CardDescription>{list.description}</CardDescription>
                  )}
                  {list.store && (
                    <CardDescription>
                      {locale === 'it' ? 'Negozio' : 'Store'}: {list.store}
                    </CardDescription>
                  )}
                  {list.owner && (
                    <CardDescription className="text-xs">
                      Di: {list.owner.name || list.owner.email}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Oggetti:</span>
                      <span className="font-semibold">{list.items?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completati:</span>
                      <span className="font-semibold">
                        {list.items?.filter((i) => i.completed).length || 0}
                      </span>
                    </div>
                    <Link href={`/${locale}/lists/${list.id}`} className="block">
                      <Button variant="default" className="w-full">
                        Apri
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

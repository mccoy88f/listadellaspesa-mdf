"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Check, X, Trash2, Bell, History, Edit, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ShoppingListItem {
  id: number
  name: string
  quantity?: string
  completed: boolean
  completedAt?: string
}

interface ShoppingList {
  id: number
  name: string
  description?: string
  ownerId: number
  items: ShoppingListItem[]
  owner?: { id: number; email: string; name?: string }
  sharedWith?: Array<{ user: { id: number; email: string; name?: string } }>
}

export default function ListDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const listId = parseInt(params.id as string)

  const [list, setList] = useState<ShoppingList | null>(null)
  const [loading, setLoading] = useState(true)
  const [newItemOpen, setNewItemOpen] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newItemQuantity, setNewItemQuantity] = useState("")
  const [history, setHistory] = useState<Array<{ itemName: string; lastAddedAt: string }>>([])
  const [showHistory, setShowHistory] = useState(false)
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [editItemName, setEditItemName] = useState("")
  const [editItemQuantity, setEditItemQuantity] = useState("")
  const [similarItemSuggestion, setSimilarItemSuggestion] = useState<{ name: string; lastAddedAt: string } | null>(null)

  useEffect(() => {
    fetchList()
    fetchHistory()
  }, [listId])

  const fetchList = async () => {
    try {
      const res = await fetch(`/api/lists/${listId}`)
      if (res.ok) {
        const data = await res.json()
        setList(data)
      } else if (res.status === 404) {
        toast({
          title: "Lista non trovata",
          description: "La lista che stai cercando non esiste",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Errore nel recupero della lista:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history")
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (error) {
      console.error("Errore nel recupero dello storico:", error)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName,
          quantity: newItemQuantity || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const newItem = data.item
        const similarItem = data.similarItem
        
        setList((prev) => prev ? {
          ...prev,
          items: [...prev.items, newItem],
        } : null)
        
        // Mostra suggerimento se c'è un prodotto simile
        if (similarItem) {
          const lastDate = new Date(similarItem.lastAddedAt).toLocaleDateString('it-IT')
          setSimilarItemSuggestion(similarItem)
          toast({
            title: "Prodotto aggiunto!",
            description: `Hai già acquistato "${similarItem.name}" in data ${lastDate}`,
          })
        } else {
          toast({
            title: "Oggetto aggiunto!",
            description: `${newItem.name} è stato aggiunto alla lista`,
          })
        }
        
        setNewItemName("")
        setNewItemQuantity("")
        setNewItemOpen(false)
        setSimilarItemSuggestion(null)
        fetchHistory() // Aggiorna lo storico
      } else {
        const data = await res.json()
        throw new Error(data.error || "Errore nell'aggiunta")
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nell'aggiunta dell'oggetto",
        variant: "destructive",
      })
    }
  }

  const handleToggleItem = async (itemId: number, completed: boolean) => {
    try {
      const res = await fetch(`/api/lists/${listId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      })

      if (res.ok) {
        const updatedItem = await res.json()
        setList((prev) => prev ? {
          ...prev,
          items: prev.items.map((item) =>
            item.id === itemId ? updatedItem : item
          ),
        } : null)
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento:", error)
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    try {
      const res = await fetch(`/api/lists/${listId}/items/${itemId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setList((prev) => prev ? {
          ...prev,
          items: prev.items.filter((item) => item.id !== itemId),
        } : null)
        toast({
          title: "Oggetto eliminato",
          description: "L'oggetto è stato rimosso dalla lista",
        })
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'eliminazione dell'oggetto",
        variant: "destructive",
      })
    }
  }

  const handleSendNotification = async () => {
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId }),
      })

      if (res.ok) {
        toast({
          title: "Notifica inviata!",
          description: "Tutti i collaboratori sono stati avvisati",
        })
      } else {
        const data = await res.json()
        throw new Error(data.error || "Errore nell'invio")
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nell'invio della notifica",
        variant: "destructive",
      })
    }
  }

  const handleSelectFromHistory = (itemName: string) => {
    setNewItemName(itemName)
    setShowHistory(false)
  }

  const handleEditItem = (item: ShoppingListItem) => {
    setEditingItem(item.id)
    setEditItemName(item.name)
    setEditItemQuantity(item.quantity || "")
  }

  const handleSaveEdit = async (itemId: number) => {
    try {
      const res = await fetch(`/api/lists/${listId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editItemName,
          quantity: editItemQuantity || undefined,
        }),
      })

      if (res.ok) {
        const updatedItem = await res.json()
        setList((prev) => prev ? {
          ...prev,
          items: prev.items.map((item) =>
            item.id === itemId ? updatedItem : item
          ),
        } : null)
        setEditingItem(null)
        toast({
          title: "Oggetto aggiornato",
          description: "Le modifiche sono state salvate",
        })
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'aggiornamento dell'oggetto",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditItemName("")
    setEditItemQuantity("")
  }

  // Raggruppa prodotti completati per giorno
  const completedItems = list.items.filter((i) => i.completed && i.completedAt)
  const completedByDate: Record<string, ShoppingListItem[]> = {}
  
  completedItems.forEach((item) => {
    if (!item.completedAt) return
    const date = new Date(item.completedAt).toISOString().split('T')[0]
    if (!completedByDate[date]) {
      completedByDate[date] = []
    }
    completedByDate[date].push(item)
  })

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

  const completedCount = list.items.filter((i) => i.completed).length
  const totalCount = list.items.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  // Filtra lo storico per mostrare solo oggetti non già presenti
  const availableHistory = history.filter(
    (h) => !list.items.some((item) => item.name.toLowerCase() === h.itemName.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alle Liste
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{list.name}</h1>
              {list.description && (
                <p className="text-muted-foreground">{list.description}</p>
              )}
              {list.sharedWith && list.sharedWith.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Condivisa con {list.sharedWith.length} persona/e
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSendNotification} variant="outline">
                <Bell className="mr-2 h-4 w-4" />
                Sto andando a fare la spesa!
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-semibold">
                  {completedCount} / {totalCount}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <Dialog open={newItemOpen} onOpenChange={setNewItemOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi Oggetto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aggiungi Oggetto</DialogTitle>
                <DialogDescription>
                  Aggiungi un nuovo oggetto alla lista della spesa
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddItem} className="space-y-4">
                {availableHistory.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Suggerimenti dallo storico</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(!showHistory)}
                      >
                        <History className="mr-2 h-4 w-4" />
                        {showHistory ? "Nascondi" : "Mostra"}
                      </Button>
                    </div>
                    {showHistory && (
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {availableHistory.slice(0, 10).map((h, idx) => (
                          <Button
                            key={idx}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectFromHistory(h.itemName)}
                            className="text-xs"
                          >
                            {h.itemName}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="item-name">Nome Oggetto *</Label>
                  <Input
                    id="item-name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Es: Latte"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-quantity">Quantità (opzionale)</Label>
                  <Input
                    id="item-quantity"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    placeholder="Es: 2, 1kg, 500g"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Aggiungi
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {list.items.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                Nessun oggetto nella lista. Aggiungi il primo oggetto!
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Prodotti non completati */}
            <div className="space-y-2 mb-6">
              <h2 className="text-lg font-semibold mb-2">Da acquistare</h2>
              {list.items.filter((i) => !i.completed).map((item) => (
                <Card key={item.id} className="transition-all">
                  <CardContent className="p-4">
                    {editingItem === item.id ? (
                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={editItemName}
                            onChange={(e) => setEditItemName(e.target.value)}
                            placeholder="Nome oggetto"
                          />
                          <Input
                            value={editItemQuantity}
                            onChange={(e) => setEditItemQuantity(e.target.value)}
                            placeholder="Quantità (opzionale)"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveEdit(item.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggleItem(item.id, item.completed)}
                          className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-muted-foreground flex items-center justify-center transition-all hover:border-primary"
                        >
                        </button>
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          {item.quantity && (
                            <div className="text-sm text-muted-foreground">
                              Quantità: {item.quantity}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Prodotti completati divisi per giorno */}
            {Object.keys(completedByDate).length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Acquistati</h2>
                {Object.entries(completedByDate)
                  .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                  .map(([date, items]) => (
                    <Card key={date}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          {new Date(date).toLocaleDateString('it-IT', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 border rounded bg-muted/50"
                            >
                              <div className="flex-1">
                                <div className="font-medium line-through text-muted-foreground">
                                  {item.name}
                                </div>
                                {item.quantity && (
                                  <div className="text-sm text-muted-foreground">
                                    Quantità: {item.quantity}
                                  </div>
                                )}
                              </div>
                              {list.sharedWith && list.sharedWith.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {item.completedAt && new Date(item.completedAt).toLocaleTimeString('it-IT', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

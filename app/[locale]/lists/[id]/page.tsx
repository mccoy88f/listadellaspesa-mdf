"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useTranslations, useLocale } from "next-intl"
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
  characteristics?: string
  completed: boolean
  completedAt?: string
  completedBy?: number
}

interface ShoppingList {
  id: number
  name: string
  description?: string
  store?: string
  ownerId: number
  items: ShoppingListItem[]
  owner?: { id: number; email: string; name?: string }
  sharedWith?: Array<{ user: { id: number; email: string; name?: string } }>
}

export default function ListDetailPage() {
  const router = useRouter()
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations()
  const { toast } = useToast()
  const listId = parseInt(params.id as string)

  const [list, setList] = useState<ShoppingList | null>(null)
  const [loading, setLoading] = useState(true)
  const [newItemOpen, setNewItemOpen] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newItemQuantity, setNewItemQuantity] = useState("")
  const [newItemQuantityNumber, setNewItemQuantityNumber] = useState<number | "">("")
  const [newItemUnit, setNewItemUnit] = useState("")
  const [newItemCharacteristics, setNewItemCharacteristics] = useState("")
  const [history, setHistory] = useState<Array<{ itemName: string; lastAddedAt: string }>>([])
  const [showHistory, setShowHistory] = useState(false)
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [editItemName, setEditItemName] = useState("")
  const [editItemQuantity, setEditItemQuantity] = useState("")
  const [editItemQuantityNumber, setEditItemQuantityNumber] = useState<number | "">("")
  const [editItemUnit, setEditItemUnit] = useState("")
  const [editItemCharacteristics, setEditItemCharacteristics] = useState("")
  const [similarItemSuggestion, setSimilarItemSuggestion] = useState<{ name: string; lastAddedAt: string } | null>(null)

  // Unità di misura comuni
  const units = [
    { value: "", label: locale === "it" ? "Nessuna unità" : "No unit" },
    { value: "pz", label: locale === "it" ? "Pezzi" : "Pieces" },
    { value: "kg", label: "kg" },
    { value: "g", label: "g" },
    { value: "hg", label: locale === "it" ? "etti" : "hg" },
    { value: "l", label: locale === "it" ? "litri" : "liters" },
    { value: "ml", label: "ml" },
    { value: "scatola", label: locale === "it" ? "scatola" : "box" },
    { value: "scatole", label: locale === "it" ? "scatole" : "boxes" },
    { value: "bottiglia", label: locale === "it" ? "bottiglia" : "bottle" },
    { value: "bottiglie", label: locale === "it" ? "bottiglie" : "bottles" },
    { value: "confezione", label: locale === "it" ? "confezione" : "package" },
    { value: "confezioni", label: locale === "it" ? "confezioni" : "packages" },
    { value: "pacchetto", label: locale === "it" ? "pacchetto" : "pack" },
    { value: "pacchetti", label: locale === "it" ? "pacchetti" : "packs" },
  ]

  // Funzione per parsare la quantità esistente (es. "2 litri" -> 2, "litri")
  const parseQuantity = (quantity: string | undefined): { number: number | ""; unit: string } => {
    if (!quantity) return { number: "", unit: "" }
    
    // Cerca un numero all'inizio
    const match = quantity.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/)
    if (match) {
      const number = parseFloat(match[1].replace(",", "."))
      let unit = match[2].trim().toLowerCase()
      
      // Normalizza alcune unità comuni
      const unitMap: Record<string, string> = {
        "litro": "l",
        "litri": "l",
        "l.": "l",
        "etto": "hg",
        "etti": "hg",
        "etto": "hg",
        "grammo": "g",
        "grammi": "g",
        "g.": "g",
        "chilo": "kg",
        "chili": "kg",
        "kg.": "kg",
        "pezzo": "pz",
        "pezzi": "pz",
        "pz.": "pz",
        "scatola": "scatola",
        "scatole": "scatole",
        "bottiglia": "bottiglia",
        "bottiglie": "bottiglie",
        "confezione": "confezione",
        "confezioni": "confezioni",
        "pacchetto": "pacchetto",
        "pacchetti": "pacchetti",
      }
      
      if (unit && unitMap[unit]) {
        unit = unitMap[unit]
      }
      
      return { number: isNaN(number) ? "" : number, unit }
    }
    
    return { number: "", unit: "" }
  }

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
          title: t('list.listNotFound'),
          description: t('list.listNotFoundDescription'),
          variant: "destructive",
        })
        router.push(`/${locale}/dashboard`)
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
      // Combina quantità numerica e unità
      let quantityString = ""
      if (newItemQuantityNumber !== "" && newItemQuantityNumber !== null) {
        quantityString = newItemQuantityNumber.toString()
        if (newItemUnit) {
          quantityString += ` ${newItemUnit}`
        }
      }

      const res = await fetch(`/api/lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName,
          quantity: quantityString || undefined,
          characteristics: newItemCharacteristics || undefined,
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
          const lastDate = new Date(similarItem.lastAddedAt).toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-US')
          setSimilarItemSuggestion(similarItem)
          toast({
            title: t('list.itemAdded'),
            description: t('list.similarItemBought', { name: similarItem.name, date: lastDate }),
          })
        } else {
          toast({
            title: t('list.itemAdded'),
            description: t('list.itemAddedDescription', { name: newItem.name }),
          })
        }
        
        setNewItemName("")
        setNewItemQuantity("")
        setNewItemQuantityNumber("")
        setNewItemUnit("")
        setNewItemCharacteristics("")
        setNewItemOpen(false)
        setSimilarItemSuggestion(null)
        fetchHistory() // Aggiorna lo storico
      } else {
        const data = await res.json()
        throw new Error(data.error || t('list.errorAddingItem'))
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('list.errorAddingItem'),
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
          title: t('list.itemDeleted'),
          description: t('list.itemDeletedDescription'),
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
          title: t('list.shoppingAlertSent'),
          description: t('list.shoppingAlertDescription'),
        })
      } else {
        const data = await res.json()
        throw new Error(data.error || t('list.errorSendingNotification'))
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('list.errorSendingNotification'),
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
    const parsed = parseQuantity(item.quantity)
    setEditItemQuantityNumber(parsed.number)
    setEditItemUnit(parsed.unit)
    setEditItemCharacteristics(item.characteristics || "")
  }

  const handleSaveEdit = async (itemId: number) => {
    try {
      // Combina quantità numerica e unità
      let quantityString = ""
      if (editItemQuantityNumber !== "" && editItemQuantityNumber !== null) {
        quantityString = editItemQuantityNumber.toString()
        if (editItemUnit) {
          quantityString += ` ${editItemUnit}`
        }
      }

      const res = await fetch(`/api/lists/${listId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editItemName,
          quantity: quantityString || undefined,
          characteristics: editItemCharacteristics || undefined,
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
          title: t('list.itemUpdated'),
          description: t('list.itemUpdatedDescription'),
        })
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('list.errorUpdatingItem'),
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditItemName("")
    setEditItemQuantity("")
    setEditItemQuantityNumber("")
    setEditItemUnit("")
    setEditItemCharacteristics("")
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (!list) {
    return null
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
          <Link href={`/${locale}/dashboard`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('list.backToLists')}
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
              {list.store && (
                <p className="text-muted-foreground">
                  {locale === 'it' ? 'Negozio' : 'Store'}: <strong>{list.store}</strong>
                </p>
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
                {t('list.shoppingAlert')}
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
                  className={`h-2 rounded-full transition-all ${
                    progress === 100
                      ? 'bg-green-500'
                      : progress < 25
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }`}
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
                {t('list.addItem')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('list.addItemTitle')}</DialogTitle>
                <DialogDescription>
                  {t('list.addItemDescription')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddItem} className="space-y-4">
                {availableHistory.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{t('list.historySuggestions')}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(!showHistory)}
                      >
                        <History className="mr-2 h-4 w-4" />
                        {showHistory ? t('list.hideHistory') : t('list.showHistory')}
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
                  <Label htmlFor="item-name">{t('list.itemName')} *</Label>
                  <Input
                    id="item-name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder={locale === "it" ? "Es: Latte" : "E.g: Milk"}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-quantity">{t('list.quantity')} ({t('common.optional')})</Label>
                  <div className="flex gap-2">
                    <Input
                      id="item-quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItemQuantityNumber}
                      onChange={(e) => setNewItemQuantityNumber(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      placeholder={locale === "it" ? "Es: 2" : "Ex: 2"}
                      className="flex-1"
                    />
                    <select
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      className="flex h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {units.map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-characteristics">{t('list.characteristics')} ({t('common.optional')})</Label>
                  <Input
                    id="item-characteristics"
                    value={newItemCharacteristics}
                    onChange={(e) => setNewItemCharacteristics(e.target.value)}
                    placeholder={locale === "it" ? "Es: integrale, notte, senza glutine" : "Ex: whole grain, night, gluten-free"}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t('common.add')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {list.items.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                {t('list.noItems')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Prodotti non completati */}
            <div className="space-y-2 mb-6">
              <h2 className="text-lg font-semibold mb-2">{t('list.toBuy')}</h2>
              {list.items.filter((i) => !i.completed).map((item) => (
                <Card key={item.id} className="transition-all">
                  <CardContent className="p-4">
                    {editingItem === item.id ? (
                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={editItemName}
                            onChange={(e) => setEditItemName(e.target.value)}
                            placeholder={locale === "it" ? "Nome oggetto" : "Item name"}
                          />
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editItemQuantityNumber}
                              onChange={(e) => setEditItemQuantityNumber(e.target.value === "" ? "" : parseFloat(e.target.value))}
                              placeholder={locale === "it" ? "Es: 2" : "Ex: 2"}
                              className="flex-1"
                            />
                            <select
                              value={editItemUnit}
                              onChange={(e) => setEditItemUnit(e.target.value)}
                              className="flex h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {units.map((unit) => (
                                <option key={unit.value} value={unit.value}>
                                  {unit.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Input
                            value={editItemCharacteristics}
                            onChange={(e) => setEditItemCharacteristics(e.target.value)}
                            placeholder={locale === "it" ? "Es: integrale, notte" : "Ex: whole grain, night"}
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
                          <div className="font-medium">
                            {item.name}
                            {item.characteristics && (
                              <span className="text-muted-foreground font-normal"> ({item.characteristics})</span>
                            )}
                          </div>
                          {item.quantity && (
                            <div className="text-sm text-muted-foreground">
                              {t('list.quantity')}: {item.quantity}
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
                <h2 className="text-lg font-semibold">{t('list.purchased')}</h2>
                {Object.entries(completedByDate)
                  .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                  .map(([date, items]) => (
                    <Card key={date}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          {new Date(date).toLocaleDateString(locale === 'it' ? 'it-IT' : 'en-US', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {items.map((item) => {
                            const completedByUser = item.completedByUser || list.owner;
                            
                            return (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-2 border rounded bg-muted/50"
                              >
                                <div className="flex-1">
                                  <div className="font-medium line-through text-muted-foreground">
                                    {item.name}
                                    {item.characteristics && (
                                      <span className="font-normal"> ({item.characteristics})</span>
                                    )}
                                  </div>
                                  {item.quantity && (
                                    <div className="text-sm text-muted-foreground">
                                      {t('list.quantity')}: {item.quantity}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    {list.sharedWith && list.sharedWith.length > 0 && completedByUser && (
                                      <div className="text-xs text-muted-foreground mb-1">
                                        {completedByUser.name || completedByUser.email}
                                      </div>
                                    )}
                                    {item.completedAt && (
                                      <div className="text-xs text-muted-foreground">
                                        {new Date(item.completedAt).toLocaleTimeString(locale === 'it' ? 'it-IT' : 'en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleItem(item.id, item.completed)}
                                    className="text-xs"
                                  >
                                    {locale === 'it' ? 'Annulla acquisto' : 'Cancel purchase'}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
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

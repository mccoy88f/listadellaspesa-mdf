"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations, useLocale } from "next-intl"
import { ShoppingBag, Calendar, User } from "lucide-react"
import { format } from "date-fns"
import { it, enUS } from "date-fns/locale"

interface PurchaseItem {
  id: number
  name: string
  quantity?: string
  completedAt: string
  completedBy: { id: number; email: string; name?: string }
  list: {
    id: number
    name: string
  }
}

export default function PurchasesPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const [purchases, setPurchases] = useState<PurchaseItem[]>([])
  const [groupedByDate, setGroupedByDate] = useState<Record<string, PurchaseItem[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      const res = await fetch("/api/purchases")
      if (res.ok) {
        const data = await res.json()
        setPurchases(data.items || [])
        setGroupedByDate(data.groupedByDate || {})
      }
    } catch (error) {
      console.error("Errore nel recupero degli acquisti:", error)
    } finally {
      setLoading(false)
    }
  }

  const dateLocale = locale === 'it' ? it : enUS
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{t('purchases.title')}</h1>
          <p className="text-muted-foreground">
            {t('purchases.subtitle')}
          </p>
        </div>

        {purchases.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('purchases.noPurchases')}</h3>
              <p className="text-muted-foreground">
                {t('purchases.noPurchasesDescription')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => {
              const items = groupedByDate[date]
              const dateObj = new Date(date)
              
              return (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {format(dateObj, "EEEE d MMMM yyyy", { locale: dateLocale })}
                    </CardTitle>
                    <CardDescription>
                      {items.length} {items.length === 1 ? t('purchases.products') : t('purchases.productsPlural')} {t('purchases.purchased')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            {item.quantity && (
                              <div className="text-sm text-muted-foreground">
                                Quantità: {item.quantity}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              {t('purchases.list')}: {item.list.name}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{item.completedBy.name || item.completedBy.email}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {format(new Date(item.completedAt), "HH:mm", { locale: dateLocale })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

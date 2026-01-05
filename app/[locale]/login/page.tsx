"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

export default function LoginPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Errore durante il login")
      }

      toast({
        title: t('auth.loginSuccess'),
        description: t('common.welcome'),
      })

      router.push(`/${locale}/dashboard`)
      router.refresh()
    } catch (error) {
      toast({
        title: t('errors.unknownError'),
        description: error instanceof Error ? error.message : t('auth.loginError'),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <ShoppingCart className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('auth.login')}</CardTitle>
          <CardDescription>
            {t('auth.login')} al tuo account per gestire le tue liste della spesa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@esempio.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.loading') : t('auth.login')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">{t('auth.noAccount')} </span>
            <Link href={`/${locale}/register`} className="text-primary hover:underline font-medium">
              {t('auth.register')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const locale = useLocale()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Errore durante la registrazione")
      }

      // Se richiede verifica, mostra il form di verifica
      if (data.requiresVerification) {
        setShowVerification(true)
        setRegisteredEmail(formData.email)
        toast({
          title: "Registrazione completata!",
          description: "Controlla la tua email per il codice di verifica",
        })
      } else {
        router.push(`/${locale}/dashboard`)
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante la registrazione",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registeredEmail,
          code: verificationCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Errore durante la verifica")
      }

      toast({
        title: "Email verificata!",
        description: "Account verificato con successo",
      })

      router.push(`/${locale}/dashboard`)
      router.refresh()
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante la verifica",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (showVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <ShoppingCart className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Verifica Email</CardTitle>
            <CardDescription>
              Inserisci il codice di verifica inviato a {registeredEmail}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Codice di verifica</Label>
                <Input
                  id="code"
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || verificationCode.length !== 6}>
                {loading ? "Verifica in corso..." : "Verifica"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Non hai ricevuto il codice? </span>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setShowVerification(false)}
              >
                Torna alla registrazione
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <ShoppingCart className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Registrati</CardTitle>
          <CardDescription>
            Crea un account per iniziare a gestire le tue liste della spesa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome (opzionale)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Il tuo nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
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
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimo 6 caratteri"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrazione in corso..." : "Registrati"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Hai già un account? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Accedi
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

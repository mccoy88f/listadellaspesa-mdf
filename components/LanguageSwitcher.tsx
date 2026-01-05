"use client"

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import { locales } from '@/i18n'

const localeNames: Record<string, string> = {
  it: 'Italiano',
  en: 'English',
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return
    
    // Estrai il path senza il locale
    const pathSegments = pathname.split('/').filter(Boolean)
    const currentLocale = pathSegments[0]
    
    // Se il primo segmento è una lingua valida, rimuovilo
    let pathWithoutLocale = '/'
    if (locales.includes(currentLocale as any)) {
      pathWithoutLocale = '/' + pathSegments.slice(1).join('/')
    } else {
      pathWithoutLocale = pathname
    }
    
    // Costruisci il nuovo path con la nuova lingua
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
    
    // Usa window.location per un refresh completo
    window.location.href = newPath
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Cambia lingua</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={locale === loc ? 'bg-accent' : ''}
          >
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

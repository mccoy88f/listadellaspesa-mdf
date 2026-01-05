import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Lingue supportate
export const locales = ['it', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'it';

export default getRequestConfig(async ({ locale }) => {
  // Verifica che la lingua sia supportata
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

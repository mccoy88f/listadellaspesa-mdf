import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

// Redirect root alla lingua di default
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export default async function Home({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const session = await getSession();
  const t = await getTranslations();

  // Se autenticato, reindirizza alla dashboard
  if (session) {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <main className="min-h-screen p-8 md:p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <ShoppingCart className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {t('home.title')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('home.sharedLists')}</CardTitle>
              <CardDescription>
                {t('home.sharedListsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('home.sharedListsText')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('home.smartNotifications')}</CardTitle>
              <CardDescription>
                {t('home.smartNotificationsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('home.smartNotificationsText')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('home.smartHistory')}</CardTitle>
              <CardDescription>
                {t('home.smartHistoryDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('home.smartHistoryText')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href={`/${locale}/register`}>
            <Button size="lg">
              {t('home.startFree')}
            </Button>
          </Link>
          <Link href={`/${locale}/login`}>
            <Button size="lg" variant="outline">
              {t('home.login')}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

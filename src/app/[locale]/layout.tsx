// src/app/[lang]/layout.tsx
// import { ViewTransitions } from "next-view-transitions";
import "./globals.css";

import type { Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import ClientInitializer from "@/components/features/ClientInitializer";
import PageTransition from "@/components/features/PageTransition";
import RouteModalRenderer from "@/components/features/RouteModalRenderer";
import ScrollManager from "@/components/features/ScrollManager";
import { DialogProvider } from "@/components/ui/Dialog";
import { routing } from "@/i18n/routing";
import { getBrandConfigSSR } from "@/lib/brand";
import { BrandConfigProvider } from "@/providers/brand.provider";

export const runtime = "edge";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  // 获取当前语言
  const { locale } = await params;

  // 如果当前语言不在支持的语言列表中，则返回404
  if (!hasLocale(routing.locales, locale)) {
    return notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // SSR 获取品牌配置 & 主题布局
  const brand = await getBrandConfigSSR();

  return (
    <html lang={locale} data-theme={brand.theme} data-skin={brand.skin} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover,minimum-scale=1,maximum-scale=1,user-scalable=no" />
        {/* SSR 加载主题、皮肤、覆盖文件 */}
        <link rel="stylesheet" href={`/styles/tokens/index.css`} />
        <link rel="stylesheet" href={`/styles/themes/${brand.theme}.css`} />
        <link rel="stylesheet" href={`/styles/skins/${brand.skin}.css`} />
        {brand.overrides && <link rel="stylesheet" href={`/styles/overrides/${brand.brandName}.css`} />}
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <BrandConfigProvider value={brand}>
            <DialogProvider>
              {/* 页面内容 */}
              <PageTransition>{children}</PageTransition>
              <ClientInitializer />
              {/* 路由弹框 */}
              <RouteModalRenderer />
              {/* 滚动管理 */}
              <ScrollManager defaultScrollToTop />
            </DialogProvider>
          </BrandConfigProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

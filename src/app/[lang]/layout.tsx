// src/app/[lang]/layout.tsx
import "@/app/globals.css";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { ThemeLayouts } from "@/components/layout";
import { routing } from "@/i18n/routing";
import { getBrandConfigSSR } from "@/libs/brand";
import { BrandConfigProvider } from "@/providers/brand.provider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(lang);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // SSR 获取品牌配置 & 主题布局
  const brand = await getBrandConfigSSR();
  const Layout = ThemeLayouts[brand.theme];

  return (
    <html lang={lang} data-theme={brand.theme} data-skin={brand.skin}>
      <head>
        {/* SSR 加载主题、皮肤、覆盖文件 */}
        <link rel="stylesheet" href={`/styles/tokens/index.css`} />
        <link rel="stylesheet" href={`/styles/themes/${brand.theme}.css`} />
        <link rel="stylesheet" href={`/styles/skins/${brand.skin}.css`} />
        {brand.overrides && <link rel="stylesheet" href={`/styles/overrides/${brand.brandName}.css`} />}
      </head>
      <body>
        <NextIntlClientProvider locale={lang} messages={messages}>
          <BrandConfigProvider value={brand}>
            <Layout>{children}</Layout>
          </BrandConfigProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

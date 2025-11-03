import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";
import type { Metadata } from "next";
import SWRegister from "@/components/ui/SWRegister";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export const metadata: Metadata = {
  title: "Next.js 学习指南",
  description: "The React Framework for the Web",
  authors: [{ name: "Leo" }, { name: "Josh", url: "https://nextjs.org" }],
  creator: "Leo",
  manifest: "/manifest.webmanifest",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
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

  return (
    <html lang={lang}>
      <body className="w-full min-h-screen flex justify-center items-center">
        <NextIntlClientProvider locale={lang} messages={messages}>
          {children}
        </NextIntlClientProvider>
        <SWRegister />
      </body>
    </html>
  );
}

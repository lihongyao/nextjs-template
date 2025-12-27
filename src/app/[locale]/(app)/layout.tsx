import { ThemeLayouts } from "@/components/layout";
import { getBrandConfigSSR } from "@/lib/brand";

export default async function ThemeLayout({ children }: { children: React.ReactNode }) {
  const brand = await getBrandConfigSSR();
  const Layout = ThemeLayouts[brand.theme];
  return <Layout>{children}</Layout>;
}

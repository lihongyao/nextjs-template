import { AppLayouts } from "@/components/layout";
import { getBrandConfigSSR } from "@/lib/brand";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const brand = await getBrandConfigSSR();
  const AppLayout = AppLayouts[brand.layout];
  return <AppLayout>{children}</AppLayout>;
}

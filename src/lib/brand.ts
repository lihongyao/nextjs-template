// src/libs/brand.ts

import { cookies } from "next/headers";
import type { BrandConfig, Skin, Theme } from "@/configs/brands/types";

/**
 * SSR 读取包网信息
 * 优先级：cookie > 环境变量 > 默认包网
 */
export async function getBrandConfigSSR(): Promise<BrandConfig> {
  // 1. 根据环境变量，读取包网配置
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME;
  const module = await import(`@/configs/brands/${brandName}.ts`);
  const brandConfig = module.default as BrandConfig;
  // 2. 根据 cookie 读取包网配置
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value as Theme | undefined;
  const skin = cookieStore.get("skin")?.value as Skin | undefined;
  // 3. 返回包网配置
  return {
    ...brandConfig,
    theme: theme ?? brandConfig.theme,
    skin: skin ?? brandConfig.skin,
  };
}

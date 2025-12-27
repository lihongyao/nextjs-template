/**
 * i18n 路由配置
 * @see https://next-intl.dev/docs/routing/configuration
 */

import { defineRouting } from "next-intl/routing";
import type { BrandConfig } from "@/configs/brands/types";

const module = await import(
  `@/configs/brands/${process.env.NEXT_PUBLIC_BRAND_NAME}.ts`
);
const config = module.default as BrandConfig;

// -- 定义支持的语言环境和默认语言环境
const locales = config.locales.map((locale) => locale.code);
export const defaultLocale = "zh-CN";
export const langMap = config.locales.reduce(
  (map, locale) => {
    map[locale.code] = locale.value;
    return map;
  },
  {} as Record<string, number>,
);

// -- 定义路由配置
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  localeDetection: false,
});

/**
 * i18n 路由配置
 * @see https://next-intl.dev/docs/routing/configuration
 */

import { defineRouting } from "next-intl/routing";

// -- 定义支持的语言环境和默认语言环境
export const locales = ["zh-CN", "en-US", "pt", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale = "zh-CN";

// -- 定义路由配置
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed", //  默认语言不显示前缀，其他语言显示
});

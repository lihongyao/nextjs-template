// src/configs/brands/afun.ts
import type { BrandConfig } from "./types";
export default {
  brandName: "afun",
  theme: "classic",
  skin: "dark",
  overrides: true,
  series: "default",
  layout: "h5",
  defaultLocale: { code: "pt", label: "🇧🇷 Português", value: 11 },
  locales: [
    { code: "zh-CN", label: "🇨🇳 简体中文", value: 1 },
    { code: "en", label: "🇺🇸 English", value: 2 },
    { code: "pt", label: "🇧🇷 Português", value: 3 },
    { code: "es", label: "🇪🇸 Español", value: 4 },
  ],
} satisfies BrandConfig;

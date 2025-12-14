// src/configs/brands/types.ts

export type BrandName = "afun" | "bfun";
export type Theme = "classic" | "modern";
export type Skin = "dark" | "light";
export type Series = "default";
export type Locale = {
  /** 语言描述 */
  label: string;
  /** 语言标识 */
  code: string;
  /** 语言数值 */
  value: number;
};

// -- 品牌配置
export type BrandConfig = {
  /** 品牌名称 */
  brandName: BrandName;
  /** 主题 */
  theme: Theme;
  /** 皮肤 */
  skin: Skin;
  /** 是否启用覆盖 */
  overrides?: boolean;
  /** 套图 */
  series: Series;
  /** 支持语言 */
  locales: Locale[];
  /** 默认语言 */
  defaultLocale: Locale;
  /** 扩展字段 */
  [key: string]: unknown;
};

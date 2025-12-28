// src/configs/brands/types.ts

// -- 品牌
export type BrandName = "afun" | "bfun";
// -- 主题
export type Theme = "classic" | "modern";
// -- 皮肤
export type Skin = "dark" | "light";
// -- 套图
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

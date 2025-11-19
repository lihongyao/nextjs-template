// src/configs/brands/types.ts

export type BrandName = ["afun", "bfun"][number];
export type Theme = ["classic", "modern"][number];
export type Skin = ["dark", "light"][number];

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
  /** 扩展字段 */
  [key: string]: unknown;
};

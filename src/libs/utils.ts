import type { BrandConfig } from "@/configs/brands/types";

export function getImgUrl(brand: BrandConfig, imageName: string) {
  return `/images/${brand.skin}/${brand.brandName}/${imageName}`;
}

import dynamic from "next/dynamic";
import type { BrandConfig } from "@/configs/brands/types";

/**
 * 获取图片资源地址
 * @param brand
 * @param imageName
 * @returns
 */
export function getImgUrl(brand: BrandConfig, imageName: string) {
  return `/images/${brand.skin}/${brand.brandName}/${imageName}`;
}

/**
 * 加载动态组件
 * @param type 组件类型(名称)
 * @param key client | suspense
 * @returns
 */
type NestedObject = Record<string, unknown>;
export function loadDynamicComponent(
  type: string,
  mode: "client" | "suspense",
) {
  return dynamic<NestedObject>(() =>
    import(`@/components/widgets/${type}/${mode}`).then((mod) => mod.default),
  );
}

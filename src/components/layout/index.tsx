import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";
import type { Layout } from "@/configs/brands/types";

export const AppLayouts: Record<Layout, ComponentType<{ children: ReactNode }>> = {
  classic: dynamic(() => import("./ClassicLayout")),
  modern: dynamic(() => import("./ModernLayout")),
  h5: dynamic(() => import("./H5Layout")),
};

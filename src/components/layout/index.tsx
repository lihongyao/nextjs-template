import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";
import type { Theme } from "@/configs/brands/types";

export const ThemeLayouts: Record<Theme, ComponentType<{ children: ReactNode }>> = {
  classic: dynamic(() => import("./ClassicLayout")),
  modern: dynamic(() => import("./ModernLayout")),
};
